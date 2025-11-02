// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { Experience } from '@/types';
import { getExperiencesData, createExperience, updateExperience, deleteExperience } from '@/lib/api';
import Modal from '@/components/admin/common/Modal';
import { v4 as uuidv4 } from 'uuid';
import { Edit2, Trash2, Plus, Briefcase, Calendar } from 'lucide-react';

const ExperienceForm: React.FC = () => {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Experience | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getExperiencesData();
        setExperiences(data);
        setIsLoading(false);
    };

    const handleEdit = (exp: Experience) => {
        setCurrentItem({ ...exp });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setCurrentItem({ id: uuidv4(), positionTitle: '', companyName: '', startYear: '', endYear: '', description: '', current: false } as any);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (expId: string) => {
        if (window.confirm('Are you sure you want to delete this experience entry?')) {
            try {
                await deleteExperience(expId);
                await fetchData();
                setMessage({ type: 'success', text: 'Experience deleted.' });
            } catch (e) {
                console.error(e);
                setMessage({ type: 'error', text: 'Failed to delete experience.' });
            }
        }
    };

    const handleSave = async () => {
        if (!currentItem) return;
        setSaving(true);
        setMessage(null);
        try {
            // Client-side validation to avoid server 400/500
            const errs: string[] = [];
            const req = ['positionTitle','companyName','startYear','endYear'] as const;
            for (const k of req) {
                const v = (currentItem as any)[k];
                if (!v || !String(v).trim()) errs.push(k);
            }
            if (errs.length) {
                setMessage({ type: 'error', text: `Please fill: ${errs.join(', ')}` });
                setSaving(false);
                return;
            }
            const isNew = !experiences.some(exp => exp.id === currentItem.id);
            // If currently working, normalize endYear to 'Present'
            const toSave = { ...currentItem } as any;
            if (toSave.current) {
                toSave.endYear = 'Present';
            }
            if (isNew) {
                await createExperience(toSave);
            } else {
                await updateExperience(toSave);
            }
            await fetchData();
            setIsModalOpen(false);
            setCurrentItem(null);
            setMessage({ type: 'success', text: 'Experience saved.' });
        } catch (e) {
            console.error(e);
            // Attempt to show API validation error if present
            const errText = (e as any)?.message || 'Failed to save experience.';
            setMessage({ type: 'error', text: errText });
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center py-12"><div className="text-gray-400">Loading experiences...</div></div>
    );

    return (
        <div className="space-y-6">
            {message && (
                <div className={`admin-card ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    {message.text}
                </div>
            )}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-white">Manage Experience</h3>
                    <p className="text-gray-400 text-sm mt-1">Add and manage your work experience</p>
                </div>
                <button onClick={handleAddNew} className="admin-button-primary flex items-center gap-2"><Plus size={20} />Add New Experience</button>
            </div>

            <div className="space-y-4">
                {experiences.map((exp) => (
                    <div key={exp.id} className="admin-card group hover:border-electric-blue/30">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-4 flex-1">
                                <div className="w-12 h-12 rounded-lg backdrop-blur-xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-electric-blue flex-shrink-0"><Briefcase size={24} /></div>
                                <div className="flex-1">
                                    <p className="font-semibold text-white text-lg">{exp.positionTitle}</p>
                                    <p className="text-electric-blue">{exp.companyName}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-2"><Calendar size={14} /><span>{exp.startYear} - {exp.endYear}</span></div>
                                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">{exp.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(exp)} className="admin-icon-button" title="Edit"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(exp.id)} className="admin-button-danger" title="Delete"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem?.id && experiences.some(e => e.id === currentItem.id) ? 'Edit Experience' : 'Add Experience'}>
                {currentItem && (
                    <div className="space-y-6">
                        <div><label className="admin-label">Position Title</label><input type="text" value={currentItem.positionTitle} onChange={e => setCurrentItem(p => p ? {...p, positionTitle: e.target.value} : null)} className="admin-input" placeholder="e.g., Senior Developer" /></div>
                        <div><label className="admin-label">Company Name</label><input type="text" value={currentItem.companyName} onChange={e => setCurrentItem(p => p ? {...p, companyName: e.target.value} : null)} className="admin-input" placeholder="e.g., Tech Company Inc." /></div>
                        <div className="grid grid-cols-2 gap-6">
                            <div><label className="admin-label">Start Year</label><input type="text" value={currentItem.startYear} onChange={e => setCurrentItem(p => p ? {...p, startYear: e.target.value} : null)} className="admin-input" placeholder="2020" /></div>
                            <div>
                                <label className="admin-label">End Year</label>
                                <input type="text" value={currentItem.current ? 'Present' : currentItem.endYear}
                                    onChange={e => setCurrentItem(p => p ? {...p, endYear: e.target.value} : null)}
                                    disabled={!!currentItem.current}
                                    className={`admin-input ${currentItem.current ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    placeholder="Present or 2023" />
                                <label className="inline-flex items-center gap-2 text-xs text-gray-300 mt-2">
                                    <input type="checkbox" className="accent-electric-blue" checked={!!(currentItem as any).current}
                                        onChange={(e) => setCurrentItem(p => p ? { ...p, current: e.target.checked, endYear: e.target.checked ? 'Present' : '' } as any : null)} />
                                    Currently working here
                                </label>
                            </div>
                        </div>
                        <div><label className="admin-label">Description</label><textarea rows={4} value={currentItem.description} onChange={e => setCurrentItem(p => p ? {...p, description: e.target.value} : null)} className="admin-textarea" placeholder="Describe your role and responsibilities..." /></div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10"><button onClick={() => setIsModalOpen(false)} className="admin-button-secondary">Cancel</button><button onClick={handleSave} disabled={saving} className="admin-button-primary">{saving ? 'Saving...' : 'Save Experience'}</button></div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ExperienceForm;
