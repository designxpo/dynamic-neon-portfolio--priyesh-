import React, { useRef, useState } from 'react';
import { getAdminPassword, setAdminPassword, resetDbToDefaults, exportDb, importDb } from '../../../lib/db';
import { Shield, Save, RotateCcw, Database, Upload as UploadIcon } from 'lucide-react';

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
        <form onSubmit={handleSubmit} className="space-y-10 max-w-4xl">
            {/* Feedback */}
            {message && (
                <div className={`admin-card flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                    message.type === 'info' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                    'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                    <span>{message.text}</span>
                </div>
            )}

            {/* Change Password */}
            <div className="admin-card">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Shield size={20} className="text-electric-blue" />
                    Change Admin Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="admin-label">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="admin-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div>
                        <label className="admin-label">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="admin-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div>
                        <label className="admin-label">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="admin-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="admin-button-primary flex items-center gap-2"
                    >
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Update Password'}
                    </button>
                </div>
            </div>

            {/* Backup & Restore */}
            <div className="admin-card">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Database size={20} className="text-electric-blue" />
                    Backup & Restore
                </h3>
                <p className="text-sm text-gray-400 mb-4">Export your current content to a JSON file or restore from a backup. Note: backups are origin-specific.</p>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleExport}
                        className="admin-button-secondary flex items-center gap-2"
                    >
                        <Save size={16} />
                        Export Backup (JSON)
                    </button>
                    <button
                        type="button"
                        onClick={triggerImport}
                        className="admin-button-secondary flex items-center gap-2"
                    >
                        <UploadIcon size={16} />
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

            {/* Danger Zone */}
            <div className="admin-card">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <RotateCcw size={20} className="text-electric-blue" />
                    Danger Zone
                </h3>
                <p className="text-sm text-gray-400 mb-4">Resetting will restore default seed data and remove your local changes.</p>
                <button
                    type="button"
                    onClick={handleResetData}
                    className="admin-button-danger"
                >
                    Reset Data to Defaults
                </button>
            </div>
        </form>
    );
};

export default SettingsForm;