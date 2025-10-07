/**
 * Image Sprite Utility
 * 
 * Instead of loading 200+ individual images, we can use CSS sprites
 * to load one combined image and display portions of it.
 * 
 * This would require creating a sprite sheet during build time.
 */

/**
 * Get sprite position for an item
 * @param {string} itemId - The item ID
 * @returns {object} CSS background-position for sprite
 */
export function getSpritePosition(itemId) {
  // This would map item IDs to their position in the sprite sheet
  // Example: item 1011 is at position (0, 0), item 1018 is at (64px, 0), etc.
  
  // For now, fallback to individual images
  // TODO: Generate sprite sheet and position map during build
  return null
}

/**
 * Lazy load images as they come into viewport
 * Reduces initial load by only loading visible images
 */
export function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute('data-src')
            imageObserver.unobserve(img)
          }
        }
      })
    })
    
    return imageObserver
  }
  return null
}

