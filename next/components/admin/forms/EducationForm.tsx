// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { Education } from '@/types';
import { getEducationsData, createEducation, updateEducation, deleteEducation } from '@/lib/api';
import Modal from '@/components/admin/common/Modal';
import { v4 as uuidv4 } from 'uuid';
import { Edit2, Trash2, Plus, GraduationCap, Calendar } from 'lucide-react';

const EducationForm: React.FC = () => {
    const [educations, setEducations] = useState<Education[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Education | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getEducationsData();
        setEducations(data);
        setIsLoading(false);
    };

    const handleEdit = (edu: Education) => {
        setCurrentItem({ ...edu });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
    setCurrentItem({ id: uuidv4(), degree: '', institution: '', startYear: '', endYear: '', description: '' });
        setIsModalOpen(true);
    };
    
    const handleDelete = async (eduId: string) => {
        if (window.confirm('Are you sure you want to delete this education entry?')) {
            try {
                await deleteEducation(eduId);
                await fetchData();
                setMessage({ type: 'success', text: 'Education deleted.' });
            } catch (e) {
                console.error(e);
                setMessage({ type: 'error', text: 'Failed to delete education.' });
            }
        }
    };

    const handleSave = async () => {
        if (!currentItem) return;
        setSaving(true);
        setMessage(null);
        try {
            const isNew = !educations.some(edu => edu.id === currentItem.id);
            if (isNew) {
                await createEducation(currentItem);
            } else {
                await updateEducation(currentItem);
            }
            await fetchData();
            setIsModalOpen(false);
            setCurrentItem(null);
            setMessage({ type: 'success', text: 'Education saved.' });
        } catch (e) {
            console.error(e);
            setMessage({ type: 'error', text: 'Failed to save education.' });
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) return (<div className="flex items-center justify-center py-12"><div className="text-gray-400">Loading education data...</div></div>);

    return (
        <div className="space-y-6">
            {message && (
                <div className={`admin-card ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    {message.text}
                </div>
            )}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-white">Manage Education</h3>
                    <p className="text-gray-400 text-sm mt-1">Add and manage your educational background</p>
                </div>
                <button onClick={handleAddNew} className="admin-button-primary flex items-center gap-2"><Plus size={20} />Add New Education</button>
            </div>

            <div className="space-y-4">
                {educations.map((edu) => (
                    <div key={edu.id} className="admin-card group hover:border-electric-blue/30">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-4 flex-1">
                                <div className="w-12 h-12 rounded-lg backdrop-blur-xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-electric-blue flex-shrink-0"><GraduationCap size={24} /></div>
                                <div className="flex-1">
                                    <p className="font-semibold text-white text-lg">{edu.degree}</p>
                                    <p className="text-electric-blue">{edu.institution}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-2"><Calendar size={14} /><span>{edu.startYear} - {edu.endYear}</span></div>
                                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">{edu.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(edu)} className="admin-icon-button" title="Edit"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(edu.id)} className="admin-button-danger" title="Delete"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem?.id && educations.some(e => e.id === currentItem.id) ? 'Edit Education' : 'Add Education'}>
                {currentItem && (
                    <div className="space-y-6">
                        <div><label className="admin-label">Degree</label><input type="text" value={currentItem.degree} onChange={e => setCurrentItem(p => p ? {...p, degree: e.target.value} : null)} className="admin-input" placeholder="e.g., Bachelor of Computer Science" /></div>
                        <div><label className="admin-label">Institution</label><input type="text" value={currentItem.institution} onChange={e => setCurrentItem(p => p ? {...p, institution: e.target.value} : null)} className="admin-input" placeholder="e.g., University of Technology" /></div>
                        <div className="grid grid-cols-2 gap-6">
                            <div><label className="admin-label">Start Year</label><input type="text" value={currentItem.startYear} onChange={e => setCurrentItem(p => p ? {...p, startYear: e.target.value} : null)} className="admin-input" placeholder="2018" /></div>
                            <div><label className="admin-label">End Year</label><input type="text" value={currentItem.endYear} onChange={e => setCurrentItem(p => p ? {...p, endYear: e.target.value} : null)} className="admin-input" placeholder="2022" /></div>
                        </div>
                        <div><label className="admin-label">Description</label><textarea rows={4} value={currentItem.description} onChange={e => setCurrentItem(p => p ? {...p, description: e.target.value} : null)} className="admin-textarea" placeholder="Describe your studies and achievements..." /></div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10"><button onClick={() => setIsModalOpen(false)} className="admin-button-secondary">Cancel</button><button onClick={handleSave} disabled={saving} className="admin-button-primary">{saving ? 'Saving...' : 'Save Education'}</button></div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EducationForm;
