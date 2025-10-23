import React, { useRef, useState } from 'react';
import { getAdminPassword, setAdminPassword, resetDbToDefaults, exportDb, importDb } from '../../../lib/db';

const SettingsForm: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        const storedPassword = getAdminPassword();

        if (currentPassword !== storedPassword) {
            setMessage({ type: 'error', text: 'Current password is incorrect.' });
            setLoading(false);
            return;
        }

        if (newPassword.length < 4) {
            setMessage({ type: 'error', text: 'New password must be at least 4 characters long.' });
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            setLoading(false);
            return;
        }

        const success = setAdminPassword(newPassword);

        if (success) {
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setMessage({ type: 'error', text: 'Failed to update password.' });
        }
        setLoading(false);
    };

    const handleResetData = () => {
        if (!confirm('This will reset the portfolio data to defaults (local changes will be lost). Continue?')) return;
        const ok = resetDbToDefaults();
        if (ok) {
            // force reload so app reads the new DB
            location.reload();
        } else {
            setMessage({ type: 'error', text: 'Failed to reset data. Check console for details.' });
        }
    };

    // Export current DB as JSON download
    const handleExport = () => {
        try {
            const json = exportDb();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
            a.href = url;
            a.download = `portfolio-backup-${stamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setMessage({ type: 'success', text: 'Backup downloaded successfully.' });
        } catch (e) {
            console.error(e);
            setMessage({ type: 'error', text: 'Failed to export backup.' });
        }
    };

    // Trigger hidden file input
    const triggerImport = () => {
        fileInputRef.current?.click();
    };

    // Handle file selection and import
    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const ok = importDb(text, 'replace'); // default to replace for reliability
            if (ok) {
                setMessage({ type: 'success', text: 'Backup imported successfully. Reloading…' });
                setTimeout(() => location.reload(), 600);
            } else {
                setMessage({ type: 'error', text: 'Import failed. See console for details.' });
            }
        } catch (e) {
            console.error(e);
            setMessage({ type: 'error', text: 'Failed to read or import the selected file.' });
        } finally {
            // reset the input so the same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl">
            <div>
                <h3 className="text-xl font-semibold mb-1 text-gray-800">Change Admin Password</h3>
                <p className="text-sm text-gray-500">Update the password used to log in to this admin panel.</p>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                        required
                    />
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : message.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-brand-purple text-white px-5 py-2 rounded-lg hover:bg-brand-purple-light transition-colors duration-300 disabled:bg-gray-400"
                >
                    {loading ? 'Saving...' : 'Update Password'}
                </button>
                <button
                    type="button"
                    onClick={handleResetData}
                    className="ml-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
                >
                    Reset Data
                </button>
            </div>

            {/* Backup & Restore */}
            <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xl font-semibold mb-1 text-gray-800">Backup & Restore</h3>
                <p className="text-sm text-gray-500 mb-4">Export your current content to a JSON file or restore from a backup. Note: backups are origin-specific.</p>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleExport}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-300"
                    >
                        Export Backup (JSON)
                    </button>
                    <button
                        type="button"
                        onClick={triggerImport}
                        className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-300"
                    >
                        Import Backup
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json,.json"
                        className="hidden"
                        onChange={handleImportFile}
                    />
                </div>
            </div>
        </form>
    );
};

export default SettingsForm;