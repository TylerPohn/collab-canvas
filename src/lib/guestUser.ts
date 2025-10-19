// Generate random guest name
export function generateGuestName(): string {
  const adjectives = [
    'Happy',
    'Clever',
    'Swift',
    'Bright',
    'Bold',
    'Calm',
    'Eager',
    'Gentle',
    'Jolly',
    'Kind'
  ]
  const nouns = [
    'Panda',
    'Fox',
    'Eagle',
    'Dolphin',
    'Tiger',
    'Owl',
    'Bear',
    'Wolf',
    'Hawk',
    'Lion'
  ]
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 1000)
  return `${adj}${noun}${num}`
}

// Get or create guest user ID
export function getGuestUserId(): string {
  const GUEST_ID_KEY = 'collab-canvas-guest-id'
  let guestId = localStorage.getItem(GUEST_ID_KEY)

  if (!guestId) {
    guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(GUEST_ID_KEY, guestId)
  }

  return guestId
}

// Get or create guest user name
export function getGuestUserName(): string {
  const GUEST_NAME_KEY = 'collab-canvas-guest-name'
  let guestName = localStorage.getItem(GUEST_NAME_KEY)

  if (!guestName) {
    guestName = generateGuestName()
    localStorage.setItem(GUEST_NAME_KEY, guestName)
  }

  return guestName
}

// Check if user is guest
export function isGuestUser(userId: string): boolean {
  return userId.startsWith('guest-')
}

// Clear guest data (for logout/reset)
export function clearGuestData(): void {
  localStorage.removeItem('collab-canvas-guest-id')
  localStorage.removeItem('collab-canvas-guest-name')
}

