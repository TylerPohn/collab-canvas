import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe
} from 'firebase/firestore'
import type { CanvasDocument, CanvasMeta, Shape, UserPresence } from '../types'
import { db } from './client'

// Collection references - PR #7: Firestore data model
// Structure: canvases/{canvasId} and canvases/{canvasId}/objects/{objectId}
const CANVASES_COLLECTION = 'canvases'
const OBJECTS_COLLECTION = 'objects'
const PRESENCE_COLLECTION = 'presence'

// Canvas operations
export const canvasCollection = () => collection(db, CANVASES_COLLECTION)
export const canvasDoc = (canvasId: string) =>
  doc(db, CANVASES_COLLECTION, canvasId)

// Object operations - PR #7: Objects stored as subcollection under canvas
export const objectsCollection = (canvasId: string) =>
  collection(db, CANVASES_COLLECTION, canvasId, OBJECTS_COLLECTION)
export const objectDoc = (canvasId: string, objectId: string) =>
  doc(db, CANVASES_COLLECTION, canvasId, OBJECTS_COLLECTION, objectId)

// Presence operations
export const presenceCollection = (canvasId: string) =>
  collection(db, CANVASES_COLLECTION, canvasId, PRESENCE_COLLECTION)
export const presenceDoc = (canvasId: string, userId: string) =>
  doc(db, CANVASES_COLLECTION, canvasId, PRESENCE_COLLECTION, userId)

// Canvas CRUD operations
export async function createCanvas(
  canvasId: string,
  meta: Omit<
    CanvasMeta,
    'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
  >,
  userId: string
): Promise<void> {
  const canvasRef = canvasDoc(canvasId)
  const now = Date.now()

  const canvasData: CanvasDocument = {
    meta: {
      ...meta,
      id: canvasId,
      createdAt: now,
      createdBy: userId,
      updatedAt: now,
      updatedBy: userId
    },
    objects: {}
  }

  await setDoc(canvasRef, canvasData)
}

export async function getCanvas(
  canvasId: string
): Promise<CanvasDocument | null> {
  const canvasRef = canvasDoc(canvasId)
  const snapshot = await getDoc(canvasRef)

  if (!snapshot.exists()) {
    return null
  }

  return snapshot.data() as CanvasDocument
}

export async function updateCanvasMeta(
  canvasId: string,
  updates: Partial<Omit<CanvasMeta, 'id' | 'createdAt' | 'createdBy'>>,
  userId: string
): Promise<void> {
  const canvasRef = canvasDoc(canvasId)

  await updateDoc(canvasRef, {
    'meta.updatedAt': Date.now(),
    'meta.updatedBy': userId,
    ...Object.fromEntries(
      Object.entries(updates).map(([key, value]) => [`meta.${key}`, value])
    )
  })
}

export async function deleteCanvas(canvasId: string): Promise<void> {
  const canvasRef = canvasDoc(canvasId)
  await deleteDoc(canvasRef)
}

// Object CRUD operations
export async function createObject(
  canvasId: string,
  object: Shape,
  userId: string
): Promise<void> {
  const objectRef = objectDoc(canvasId, object.id)
  const now = Date.now()

  const objectData = {
    ...object,
    createdAt: now,
    createdBy: userId,
    updatedAt: now,
    updatedBy: userId
  }

  await setDoc(objectRef, objectData)
}

export async function updateObject(
  canvasId: string,
  objectId: string,
  updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>,
  userId: string
): Promise<void> {
  const objectRef = objectDoc(canvasId, objectId)

  await updateDoc(objectRef, {
    ...updates,
    updatedAt: Date.now(),
    updatedBy: userId
  })
}

export async function deleteObject(
  canvasId: string,
  objectId: string
): Promise<void> {
  const objectRef = objectDoc(canvasId, objectId)
  await deleteDoc(objectRef)
}

export async function getObject(
  canvasId: string,
  objectId: string
): Promise<Shape | null> {
  const objectRef = objectDoc(canvasId, objectId)
  const snapshot = await getDoc(objectRef)

  if (!snapshot.exists()) {
    return null
  }

  return snapshot.data() as Shape
}

export async function getAllObjects(canvasId: string): Promise<Shape[]> {
  const objectsRef = objectsCollection(canvasId)
  const snapshot = await getDocs(objectsRef)

  const objects = snapshot.docs.map(doc => {
    const data = doc.data()
    const shape = { id: doc.id, ...data } as Shape
    return shape
  })

  return objects
}

// Batch operations for performance
export async function batchCreateObjects(
  canvasId: string,
  objects: Shape[],
  userId: string
): Promise<void> {
  const batch = writeBatch(db)
  const now = Date.now()

  objects.forEach(object => {
    const objectRef = objectDoc(canvasId, object.id)
    const objectData = {
      ...object,
      createdAt: now,
      createdBy: userId,
      updatedAt: now,
      updatedBy: userId
    }
    batch.set(objectRef, objectData)
  })

  await batch.commit()
}

export async function batchUpdateObjects(
  canvasId: string,
  updates: Array<{
    objectId: string
    updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>
  }>,
  userId: string
): Promise<void> {
  const batch = writeBatch(db)
  const now = Date.now()

  updates.forEach(({ objectId, updates: objectUpdates }) => {
    const objectRef = objectDoc(canvasId, objectId)
    batch.update(objectRef, {
      ...objectUpdates,
      updatedAt: now,
      updatedBy: userId
    })
  })

  await batch.commit()
}

export async function batchDeleteObjects(
  canvasId: string,
  objectIds: string[]
): Promise<void> {
  const batch = writeBatch(db)

  objectIds.forEach(objectId => {
    const objectRef = objectDoc(canvasId, objectId)
    batch.delete(objectRef)
  })

  await batch.commit()
}

// Real-time subscriptions
export function subscribeToCanvas(
  canvasId: string,
  callback: (canvas: CanvasDocument | null) => void
): Unsubscribe {
  const canvasRef = canvasDoc(canvasId)

  return onSnapshot(canvasRef, snapshot => {
    if (snapshot.exists()) {
      callback(snapshot.data() as CanvasDocument)
    } else {
      callback(null)
    }
  })
}

export function subscribeToObjects(
  canvasId: string,
  callback: (objects: Shape[]) => void
): Unsubscribe {
  const objectsRef = objectsCollection(canvasId)
  const q = query(objectsRef, orderBy('createdAt', 'asc'))

  return onSnapshot(q, snapshot => {
    const objects = snapshot.docs.map(doc => {
      const data = doc.data()
      const shape = { id: doc.id, ...data } as Shape
      return shape
    })

    callback(objects)
  })
}

export function subscribeToObject(
  canvasId: string,
  objectId: string,
  callback: (object: Shape | null) => void
): Unsubscribe {
  const objectRef = objectDoc(canvasId, objectId)

  return onSnapshot(objectRef, snapshot => {
    if (snapshot.exists()) {
      callback(snapshot.data() as Shape)
    } else {
      callback(null)
    }
  })
}

// Presence operations
export async function updatePresence(
  canvasId: string,
  userId: string,
  presence: Partial<UserPresence>
): Promise<void> {
  const presenceRef = presenceDoc(canvasId, userId)

  const presenceData = {
    ...presence,
    lastSeen: Date.now()
  }

  await setDoc(presenceRef, presenceData, { merge: true })
}

export async function removePresence(
  canvasId: string,
  userId: string
): Promise<void> {
  const presenceRef = presenceDoc(canvasId, userId)
  await deleteDoc(presenceRef)
}

export function subscribeToPresence(
  canvasId: string,
  callback: (presence: UserPresence[]) => void
): Unsubscribe {
  const presenceRef = presenceCollection(canvasId)
  const q = query(presenceRef, where('isActive', '==', true))

  return onSnapshot(q, snapshot => {
    const presence = snapshot.docs.map(doc => {
      const data = doc.data()
      const presenceItem = { id: doc.id, ...data } as unknown as UserPresence
      return presenceItem
    })
    callback(presence)
  })
}

// Utility functions
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function createDefaultCanvasMeta(
  canvasId: string,
  userId: string
): CanvasMeta {
  return {
    id: canvasId,
    name: 'Untitled Canvas',
    viewport: { x: 0, y: 0, scale: 1 },
    createdAt: Date.now(),
    createdBy: userId,
    updatedAt: Date.now(),
    updatedBy: userId
  }
}
