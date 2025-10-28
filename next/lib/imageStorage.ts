// Enhanced image storage system with compression and fallback
export interface StoredImage {
    url: string;
    alternativeText: string;
    compressed?: boolean;
    originalSize?: number;
    compressedSize?: number;
}

// Compress image to reduce storage size
export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate new dimensions maintaining aspect ratio
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            // Draw and compress
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            
            console.log(`Image compressed: ${img.width}x${img.height} -> ${canvas.width}x${canvas.height}`);
            console.log(`Size reduction: ${file.size} bytes -> ~${Math.round(compressedDataUrl.length * 0.75)} bytes`);
            
            resolve(compressedDataUrl);
        };
        
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = URL.createObjectURL(file);
    });
};

// Convert file to base64 with compression
export const convertFileToOptimizedBase64 = async (file: File): Promise<string> => {
    // For small images (< 100KB), use original
    if (file.size < 100 * 1024) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }
    
    // For larger images, compress
    return compressImage(file, 800, 0.8);
};

// Storage with fallback mechanism
export const storeImageSafely = (key: string, imageData: string): boolean => {
    try {
        // Check available space
        const testKey = `${key}_test`;
        localStorage.setItem(testKey, imageData);
        localStorage.removeItem(testKey);
        
        // Store the actual image
        localStorage.setItem(key, imageData);
        console.log(`Image stored successfully: ${key} (${Math.round(imageData.length / 1024)}KB)`);
        return true;
    } catch (error) {
        console.error('Failed to store image in localStorage:', error);
        
        if (error instanceof Error && error.name === 'QuotaExceededError') {
            // Try to free up space by removing old images
            console.log('localStorage quota exceeded, attempting cleanup...');
            cleanupOldImages();
            
            // Try again after cleanup
            try {
                localStorage.setItem(key, imageData);
                console.log(`Image stored after cleanup: ${key}`);
                return true;
            } catch (secondError) {
                console.error('Still failed after cleanup:', secondError);
                return false;
            }
        }
        return false;
    }
};

// Cleanup old stored images to free space
const cleanupOldImages = () => {
    const imageKeys: string[] = [];
    
    // Find all stored image keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('image_') || key.includes('profileImage_') || key.includes('avatar_'))) {
            imageKeys.push(key);
        }
    }
    
    // Remove oldest images (simple cleanup strategy)
    imageKeys.slice(0, Math.floor(imageKeys.length / 2)).forEach(key => {
        try {
            localStorage.removeItem(key);
            console.log(`Cleaned up old image: ${key}`);
        } catch (error) {
            console.error(`Failed to cleanup ${key}:`, error);
        }
    });
};

// Get stored image with fallback
export const getStoredImage = (key: string, fallbackUrl: string = '/images/profile.png'): string => {
    try {
        const stored = localStorage.getItem(key);
        return stored || fallbackUrl;
    } catch (error) {
        console.error(`Failed to retrieve image ${key}:`, error);
        return fallbackUrl;
    }
};

// Enhanced file conversion with storage integration
export const processAndStoreImage = async (
    file: File, 
    storageKey: string,
    alternativeText: string = ''
): Promise<StoredImage> => {
    try {
        const originalSize = file.size;
        const compressedDataUrl = await convertFileToOptimizedBase64(file);
        const compressedSize = Math.round(compressedDataUrl.length * 0.75); // Approximate size
        
        // Store with unique key to avoid conflicts
        const success = storeImageSafely(`image_${storageKey}_${Date.now()}`, compressedDataUrl);
        
        const result: StoredImage = {
            url: compressedDataUrl,
            alternativeText,
            compressed: originalSize !== compressedSize,
            originalSize,
            compressedSize
        };
        
        if (!success) {
            console.warn('Image not stored in localStorage due to quota limits, but will still be used in current session');
        }
        
        return result;
    } catch (error) {
        console.error('Failed to process image:', error);
        throw new Error('Failed to process image file');
    }
};