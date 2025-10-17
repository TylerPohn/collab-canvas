export interface ImageUploadResult {
  imageUrl: string
  imageName: string
  width: number
  height: number
}

export const validateImageFile = (file: File): boolean => {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!validTypes.includes(file.type)) {
    throw new Error(
      'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
    )
  }

  if (file.size > maxSize) {
    throw new Error('File too large. Please upload an image smaller than 10MB.')
  }

  return true
}

export const uploadImage = (file: File): Promise<ImageUploadResult> => {
  return new Promise((resolve, reject) => {
    try {
      validateImageFile(file)
    } catch (error) {
      reject(error)
      return
    }

    const reader = new FileReader()

    reader.onload = e => {
      const result = e.target?.result as string
      if (!result) {
        reject(new Error('Failed to read file'))
        return
      }

      // Create an image to get dimensions
      const img = new Image()
      img.onload = () => {
        resolve({
          imageUrl: result,
          imageName: file.name,
          width: img.width,
          height: img.height
        })
      }
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      img.src = result
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

export const handleClipboardImage = (): Promise<ImageUploadResult> => {
  return new Promise((resolve, reject) => {
    navigator.clipboard
      .read()
      .then(clipboardItems => {
        for (const clipboardItem of clipboardItems) {
          for (const type of clipboardItem.types) {
            if (type.startsWith('image/')) {
              clipboardItem
                .getType(type)
                .then(blob => {
                  const file = new File([blob], 'clipboard-image.png', { type })
                  uploadImage(file).then(resolve).catch(reject)
                })
                .catch(reject)
              return
            }
          }
        }
        reject(new Error('No image found in clipboard'))
      })
      .catch(() => {
        reject(new Error('Clipboard access denied'))
      })
  })
}

export const createImageShape = (
  imageResult: ImageUploadResult,
  x: number,
  y: number
) => {
  return {
    type: 'image' as const,
    x,
    y,
    width: Math.min(imageResult.width, 200), // Limit initial size
    height: Math.min(imageResult.height, 200),
    imageUrl: imageResult.imageUrl,
    imageName: imageResult.imageName,
    strokeWidth: 0,
    rotation: 0,
    zIndex: 0
  }
}
