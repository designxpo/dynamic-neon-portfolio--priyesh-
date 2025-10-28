import React, { useState, useEffect } from 'react';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { getStorageUsage, formatBytes, getStorageHealthColor } from '@/lib/storageUtils';

interface StorageStatusProps {
    className?: string;
    showDetails?: boolean;
}

const StorageStatus: React.FC<StorageStatusProps> = ({ className = '', showDetails = false }) => {
    const [storage, setStorage] = useState({ used: 0, total: 0, percentage: 0 });
    const [show, setShow] = useState(false);

    useEffect(() => {
        const updateStorage = () => {
            const usage = getStorageUsage();
            setStorage(usage);
            setShow(usage.percentage > 70); // Only show when storage is getting full
        };

        updateStorage();
        // Update every 30 seconds
        const interval = setInterval(updateStorage, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!show && !showDetails) return null;

    return (
        <div className={`flex items-center gap-2 text-sm ${className}`}>
            <HardDrive size={16} className={getStorageHealthColor(storage.percentage)} />
            <span className={getStorageHealthColor(storage.percentage)}>
                Storage: {storage.percentage}% used ({formatBytes(storage.used)})
            </span>
            {storage.percentage > 80 && (
                <AlertTriangle size={16} className="text-red-400" />
            )}
        </div>
    );
};

export default StorageStatus;