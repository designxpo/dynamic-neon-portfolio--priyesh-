// Storage usage utilities
export const getStorageUsage = (): { used: number; total: number; percentage: number } => {
    let used = 0;
    let total = 5 * 1024 * 1024; // Default 5MB limit for most browsers
    
    try {
        // Calculate used space
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                used += localStorage[key].length + key.length;
            }
        }
        
        // Try to estimate total available space
        try {
            const testKey = 'storage_test';
            const testValue = 'x'.repeat(1024); // 1KB test
            let testSize = 1024;
            
            // Binary search for available space (rough estimate)
            while (testSize < 10 * 1024 * 1024) { // Max 10MB test
                try {
                    localStorage.setItem(testKey, 'x'.repeat(testSize));
                    localStorage.removeItem(testKey);
                    testSize *= 2;
                } catch {
                    break;
                }
            }
            total = Math.max(testSize / 2 + used, 5 * 1024 * 1024);
        } catch {
            // Fallback to default
        }
    } catch (error) {
        console.error('Error calculating storage usage:', error);
    }
    
    return {
        used,
        total,
        percentage: Math.round((used / total) * 100)
    };
};

export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const getStorageHealthColor = (percentage: number): string => {
    if (percentage < 50) return 'text-green-400';
    if (percentage < 80) return 'text-yellow-400';
    return 'text-red-400';
};