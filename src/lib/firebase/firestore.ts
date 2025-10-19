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
  writeBatch,
  type Unsubscribe
} from 'firebase/firestore'
import type {
  CanvasDocument,
  CanvasListItem,
  CanvasMeta,
  CanvasPermissions,
  Shape
} from '../types'
import { db } from './client'

// Collection references - PR #7: Firestore data model
// Structure: canvases/{canvasId} and canvases/{canvasId}/objects/{objectId}
const CANVASES_COLLECTION = 'canvases'
const OBJECTS_COLLECTION = 'objects'

// Canvas operations
export const canvasCollection = () => {
  const collectionRef = collection(db, CANVASES_COLLECTION)
  console.log(
    '🔍 [canvasCollection] Created collection reference:',
    collectionRef.path
  )
  return collectionRef
}

export const canvasDoc = (canvasId: string) => {
  const docRef = doc(db, CANVASES_COLLECTION, canvasId)
  console.log('🔍 [canvasDoc] Created document reference:', docRef.path)
  return docRef
}

// Object operations - PR #7: Objects stored as subcollection under canvas
export const objectsCollection = (canvasId: string) =>
  collection(db, CANVASES_COLLECTION, canvasId, OBJECTS_COLLECTION)
export const objectDoc = (canvasId: string, objectId: string) =>
  doc(db, CANVASES_COLLECTION, canvasId, OBJECTS_COLLECTION, objectId)

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

  // Special handling for default-canvas
  if (canvasId === 'default-canvas') {
    // Don't create if it already exists
    const existing = await getCanvas(canvasId)
    if (existing) return

    // Create with public permissions
    const canvasData: CanvasDocument = {
      meta: {
        ...meta,
        id: canvasId,
        name: 'Demo Canvas',
        description: 'Try out Collab Canvas without signing up!',
        permissions: {
          ownerId: 'system',
          accessType: 'public',
          accessedBy: []
        },
        createdAt: now,
        createdBy: 'system',
        updatedAt: now,
        updatedBy: 'system'
      },
      objects: {}
    }

    await setDoc(canvasRef, canvasData)
    return
  }

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

  // Filter out undefined values before creating the update object
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  )

  await updateDoc(canvasRef, {
    'meta.updatedAt': Date.now(),
    'meta.updatedBy': userId,
    ...Object.fromEntries(
      Object.entries(filteredUpdates).map(([key, value]) => [
        `meta.${key}`,
        value
      ])
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

  // Filter out undefined values before creating the update object
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  )

  await updateDoc(objectRef, {
    ...filteredUpdates,
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

    // Filter out undefined values before creating the update object
    const filteredUpdates = Object.fromEntries(
      Object.entries(objectUpdates).filter(([_, value]) => value !== undefined)
    )

    batch.update(objectRef, {
      ...filteredUpdates,
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
    console.log(
      `[Firestore] Received ${objects.length} objects update (${snapshot.docChanges().length} changes)`
    )

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
    permissions: {
      ownerId: userId,
      accessType: 'private',
      accessedBy: []
    },
    createdAt: Date.now(),
    createdBy: userId,
    updatedAt: Date.now(),
    updatedBy: userId
  }
}

// New canvas management operations

// Get all canvases user owns or has accessed
export async function getCanvasList(userId: string): Promise<CanvasListItem[]> {
  console.log('🔍 [getCanvasList] Starting with userId:', userId)

  try {
    const canvasesRef = canvasCollection()
    console.log(
      '🔍 [getCanvasList] Collection reference created:',
      canvasesRef.path
    )

    const snapshot = await getDocs(canvasesRef)
    console.log(
      '🔍 [getCanvasList] Query completed. Found',
      snapshot.docs.length,
      'documents'
    )
    console.log('🔍 [getCanvasList] Snapshot metadata:', {
      size: snapshot.size,
      empty: snapshot.empty,
      fromCache: snapshot.metadata.fromCache,
      hasPendingWrites: snapshot.metadata.hasPendingWrites
    })

    const canvasList: CanvasListItem[] = []

    for (let i = 0; i < snapshot.docs.length; i++) {
      const doc = snapshot.docs[i]
      console.log(
        `🔍 [getCanvasList] Processing document ${i + 1}/${snapshot.docs.length}:`,
        doc.id
      )

      try {
        const data = doc.data()
        console.log(`🔍 [getCanvasList] Document ${doc.id} raw data:`, data)

        // Check if data has the expected structure
        if (!data || typeof data !== 'object') {
          console.warn(
            `⚠️ [getCanvasList] Document ${doc.id} has invalid data structure:`,
            data
          )
          continue
        }

        const meta = data.meta
        if (!meta) {
          console.warn(
            `⚠️ [getCanvasList] Document ${doc.id} missing meta field:`,
            data
          )
          continue
        }

        console.log(`🔍 [getCanvasList] Document ${doc.id} meta:`, meta)

        // Check if user is owner or has accessed
        const isOwner = meta.permissions?.ownerId === userId
        const hasAccessed =
          meta.permissions?.accessedBy?.includes(userId) || false

        console.log(`🔍 [getCanvasList] Document ${doc.id} access check:`, {
          isOwner,
          hasAccessed,
          ownerId: meta.permissions?.ownerId,
          accessedBy: meta.permissions?.accessedBy,
          userId
        })

        if (isOwner || hasAccessed) {
          const canvasItem: CanvasListItem = {
            id: meta.id,
            name: meta.name || 'Untitled Canvas',
            description: meta.description,
            thumbnail: meta.thumbnail,
            ownerId: meta.permissions.ownerId,
            ownerName: meta.createdBy, // TODO: Get actual user name
            accessType: meta.permissions.accessType,
            hasPassword: !!meta.permissions.password,
            lastModified: meta.updatedAt,
            lastAccessedAt: meta.lastAccessedAt,
            isOwner,
            hasAccessed
          }

          console.log(`✅ [getCanvasList] Adding canvas to list:`, canvasItem)
          canvasList.push(canvasItem)
        } else {
          console.log(
            `❌ [getCanvasList] Document ${doc.id} not accessible to user ${userId}`
          )
        }
      } catch (docError) {
        console.error(
          `❌ [getCanvasList] Error processing document ${doc.id}:`,
          docError
        )
      }
    }

    console.log('🔍 [getCanvasList] Final canvas list:', canvasList)
    console.log('🔍 [getCanvasList] Sorting by lastAccessedAt/lastModified')

    const sortedList = canvasList.sort(
      (a, b) =>
        (b.lastAccessedAt || b.lastModified) -
        (a.lastAccessedAt || a.lastModified)
    )

    console.log('🔍 [getCanvasList] Sorted canvas list:', sortedList)
    return sortedList
  } catch (error) {
    console.error('❌ [getCanvasList] Error fetching canvas list:', error)
    console.error('❌ [getCanvasList] Error details:', {
      name: (error as any).name,
      message: (error as any).message,
      stack: (error as any).stack
    })
    throw error
  }
}

// Get all public canvases
export async function getPublicCanvases(): Promise<CanvasListItem[]> {
  try {
    console.log('🔍 [getPublicCanvases] Starting to fetch public canvases...')
    const canvasesRef = canvasCollection()
    const snapshot = await getDocs(canvasesRef)
    console.log(
      '✅ [getPublicCanvases] Successfully fetched',
      snapshot.docs.length,
      'canvas documents'
    )

    const publicCanvases: CanvasListItem[] = []

    for (const doc of snapshot.docs) {
      try {
        const data = doc.data() as CanvasDocument
        const meta = data.meta

        if (meta.permissions.accessType === 'public') {
          publicCanvases.push({
            id: meta.id,
            name: meta.name || 'Untitled Canvas',
            description: meta.description,
            thumbnail: meta.thumbnail,
            ownerId: meta.permissions.ownerId,
            ownerName: meta.createdBy, // TODO: Get actual user name
            accessType: meta.permissions.accessType,
            hasPassword: !!meta.permissions.password,
            lastModified: meta.updatedAt,
            lastAccessedAt: meta.lastAccessedAt,
            isOwner: false,
            hasAccessed: false
          })
        }
      } catch (docError) {
        console.warn(
          '⚠️ [getPublicCanvases] Error processing document',
          doc.id,
          ':',
          docError
        )
        // Continue processing other documents
      }
    }

    console.log(
      '✅ [getPublicCanvases] Found',
      publicCanvases.length,
      'public canvases'
    )
    return publicCanvases.sort((a, b) => b.lastModified - a.lastModified)
  } catch (error) {
    console.error(
      '❌ [getPublicCanvases] Failed to fetch public canvases:',
      error
    )
    throw new Error(
      `Failed to load public canvases: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Verify if user can access canvas
export async function verifyCanvasAccess(
  canvasId: string,
  userId: string
): Promise<{
  hasAccess: boolean
  isOwner: boolean
  needsPassword: boolean
}> {
  const canvas = await getCanvas(canvasId)
  if (!canvas) {
    // Allow authenticated users to create new canvases
    // They will become the owner upon creation
    return { hasAccess: true, isOwner: true, needsPassword: false }
  }

  const { permissions } = canvas.meta
  const isOwner = permissions.ownerId === userId
  const hasAccessed = permissions.accessedBy.includes(userId)

  // Owner always has access
  if (isOwner) {
    return { hasAccess: true, isOwner: true, needsPassword: false }
  }

  // Public canvases - anyone can access
  if (permissions.accessType === 'public') {
    return { hasAccess: true, isOwner: false, needsPassword: false }
  }

  // Link-based access - check if user has accessed before
  if (permissions.accessType === 'link' && hasAccessed) {
    return { hasAccess: true, isOwner: false, needsPassword: false }
  }

  // Link-based access - needs password verification
  if (permissions.accessType === 'link' && !hasAccessed) {
    return { hasAccess: false, isOwner: false, needsPassword: true }
  }

  // Private canvas - no access
  return { hasAccess: false, isOwner: false, needsPassword: false }
}

// Grant access to canvas (add user to accessedBy array)
export async function grantCanvasAccess(
  canvasId: string,
  userId: string
): Promise<void> {
  const canvasRef = canvasDoc(canvasId)
  const canvas = await getCanvas(canvasId)

  if (!canvas) {
    throw new Error('Canvas not found')
  }

  const { permissions } = canvas.meta
  if (!permissions.accessedBy.includes(userId)) {
    permissions.accessedBy.push(userId)

    await updateDoc(canvasRef, {
      'meta.permissions.accessedBy': permissions.accessedBy,
      'meta.updatedAt': Date.now(),
      'meta.updatedBy': userId
    })
  }
}

// Update canvas permissions
export async function updateCanvasPermissions(
  canvasId: string,
  permissions: Partial<CanvasPermissions>,
  userId: string
): Promise<void> {
  const canvasRef = canvasDoc(canvasId)

  const updates: Record<string, any> = {
    'meta.updatedAt': Date.now(),
    'meta.updatedBy': userId
  }

  if (permissions.accessType !== undefined) {
    updates['meta.permissions.accessType'] = permissions.accessType
  }

  if (permissions.password !== undefined) {
    updates['meta.permissions.password'] = permissions.password
  }

  await updateDoc(canvasRef, updates)
}

// Update canvas thumbnail
export async function updateCanvasThumbnail(
  canvasId: string,
  thumbnail: string,
  userId: string
): Promise<void> {
  const canvasRef = canvasDoc(canvasId)

  await updateDoc(canvasRef, {
    'meta.thumbnail': thumbnail,
    'meta.updatedAt': Date.now(),
    'meta.updatedBy': userId
  })
}

// Update last accessed time
export async function updateLastAccessed(
  canvasId: string,
  userId: string
): Promise<void> {
  const canvasRef = canvasDoc(canvasId)

  // Check if canvas exists before trying to update
  const canvas = await getCanvas(canvasId)
  if (!canvas) {
    console.log(
      `⚠️ [updateLastAccessed] Canvas ${canvasId} does not exist, skipping update`
    )
    return
  }

  await updateDoc(canvasRef, {
    'meta.lastAccessedAt': Date.now(),
    'meta.updatedAt': Date.now(),
    'meta.updatedBy': userId
  })
}

// Get user's most recently accessed canvas
export async function getRecentCanvas(userId: string): Promise<string | null> {
  const canvasList = await getCanvasList(userId)

  if (canvasList.length === 0) {
    return null
  }

  // Sort by lastAccessedAt, then by lastModified
  const sorted = canvasList.sort((a, b) => {
    const aTime = a.lastAccessedAt || a.lastModified
    const bTime = b.lastAccessedAt || b.lastModified
    return bTime - aTime
  })

  return sorted[0].id
}
