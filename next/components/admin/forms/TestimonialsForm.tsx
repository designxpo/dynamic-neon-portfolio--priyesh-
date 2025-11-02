// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { RawTestimonial } from '@/types';
import { updateTestimonials, convertFileToBase64 } from '@/lib/api';
import Modal from '@/components/admin/common/Modal';
import { v4 as uuidv4 } from 'uuid';
import { Edit2, Trash2, Plus, Star, Upload, X } from 'lucide-react';

const TestimonialsForm: React.FC = () => {
    const [testimonials, setTestimonials] = useState<RawTestimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<RawTestimonial | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => { fetchTestimonials(); }, []);

    const fetchTestimonials = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/testimonials', { cache: 'no-store' });
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                const mapped = result.data.map((t: any) => ({
                    id: t._id,
                    clientName: t.name,
                    roleCompany: t.role,
                    quote: t.message,
                    avatar: { url: t.avatar, alternativeText: '' },
                }));
                setTestimonials(mapped);
            } else {
                setTestimonials([]);
            }
        } catch (error) {
            console.error('Error loading testimonials:', error);
            setTestimonials([]);
        }
        setIsLoading(false);
    };

    const handleEdit = (testimonial: RawTestimonial) => {
        setCurrentItem({ ...testimonial });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setCurrentItem({ id: uuidv4(), clientName: '', roleCompany: '', quote: '', avatar: { url: '', alternativeText: '' } });
        setIsModalOpen(true);
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && currentItem) {
            const file = e.target.files[0];
            try {
                const base64 = await convertFileToBase64(file);
                setCurrentItem({ ...currentItem, avatar: { ...currentItem.avatar, url: base64 } });
            } catch (error) { console.error('Image conversion error:', error); }
        }
    };

const handleDelete = async (testimonialId: string) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
        await fetch(`/api/admin/testimonials/${testimonialId}`, { method: 'DELETE', cache: 'no-store' });
        fetchTestimonials();
    }
};
    const handleSave = async () => {
        if (!currentItem) return;
        setSaving(true);
        setMessage(null);
        try {
            const isEdit = testimonials.some(t => t.id === currentItem.id);
            let response;
            if (isEdit) {
                response = await fetch(`/api/admin/testimonials/${currentItem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    cache: 'no-store',
                    body: JSON.stringify({
                        name: currentItem.clientName,
                        role: currentItem.roleCompany,
                        message: currentItem.quote,
                        avatar: currentItem.avatar.url,
                    }),
                });
            } else {
                response = await fetch('/api/admin/testimonials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    cache: 'no-store',
                    body: JSON.stringify({
                        name: currentItem.clientName,
                        role: currentItem.roleCompany,
                        message: currentItem.quote,
                        avatar: currentItem.avatar.url,
                    }),
                });
            }
            if (!response.ok) throw new Error('Failed to save testimonial');
            await fetchTestimonials();
            setIsModalOpen(false);
            setCurrentItem(null);
            setMessage({ type: 'success', text: 'Testimonial saved.' });
        } catch (e) {
            console.error(e);
            setMessage({ type: 'error', text: 'Failed to save testimonial.' });
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) return (<div className="flex items-center justify-center py-12"><div className="text-gray-400">Loading testimonials...</div></div>);

    return (
        <div className="h-full flex flex-col" style={{ maxHeight: '100%' }}>
            {message && (
                <div className={`admin-card ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    {message.text}
                </div>
            )}
            <div className="flex justify-between items-center flex-shrink-0 mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white">Manage Testimonials</h3>
                    <p className="text-gray-400 text-sm mt-1">Add and manage client testimonials</p>
                </div>
                <button onClick={handleAddNew} className="admin-button-primary flex items-center gap-2"><Plus size={20} />Add New Testimonial</button>
            </div>

            <div className="scrollbar-thin flex-1" style={{ overflowY: 'auto', overflowX: 'hidden', maxHeight: 'calc(100vh - 280px)', minHeight: 0 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-2">
                {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="admin-card group hover:border-electric-blue/30">
                        <div className="flex items-start gap-4">
                            <div className="relative flex-shrink-0">
                                <img src={testimonial.avatar.url} alt={testimonial.clientName} className="w-16 h-16 object-cover rounded-full border-2 border-electric-blue/20" />
                                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full backdrop-blur-xl bg-electric-blue/20 border border-electric-blue/30 flex items-center justify-center">
                                    <Star size={12} className="text-electric-blue fill-electric-blue" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white">{testimonial.clientName}</p>
                                <p className="text-sm text-electric-blue mb-2">{testimonial.roleCompany}</p>
                                <p className="text-gray-400 text-sm line-clamp-3 italic">"{testimonial.quote}"</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(testimonial)} className="admin-icon-button flex-1"><Edit2 size={16} /><span className="ml-2">Edit</span></button>
                            <button onClick={() => handleDelete(testimonial.id)} className="admin-button-danger flex-1"><Trash2 size={16} /><span className="ml-2">Delete</span></button>
                        </div>
                    </div>
                ))}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem?.id && testimonials.some(t => t.id === currentItem.id) ? 'Edit Testimonial' : 'Add Testimonial'}>
                {currentItem && (
                    <div className="space-y-6">
                        <div><label className="admin-label">Client Name</label><input type="text" value={currentItem.clientName} onChange={e => setCurrentItem(p => p ? { ...p, clientName: e.target.value } : null)} className="admin-input" placeholder="e.g., John Smith" /></div>
                        <div><label className="admin-label">Role & Company</label><input type="text" value={currentItem.roleCompany} onChange={e => setCurrentItem(p => p ? { ...p, roleCompany: e.target.value } : null)} className="admin-input" placeholder="e.g., CEO at TechCorp" /></div>
                        <div>
                            <label className="admin-label">Quote</label>
                            <textarea rows={6} value={currentItem.quote} onChange={e => setCurrentItem(p => p ? { ...p, quote: e.target.value } : null)} className="admin-textarea" placeholder="Enter the testimonial quote..." style={{ background: 'rgba(0, 0, 0, 0.3)', lineHeight: '1.7' }} />
                            <p className="text-xs text-gray-500 mt-2">💡 Tip: Write a compelling testimonial that highlights the client's experience</p>
                        </div>
                        <div>
                            <label className="admin-label">Avatar Image</label>
                            <div className="flex items-center gap-6">
                                {currentItem.avatar.url && (
                                    <div className="relative">
                                        <img src={currentItem.avatar.url} alt="Avatar preview" className="w-24 h-24 object-cover rounded-full border-2 border-electric-blue/20" />
                                        <button type="button" onClick={() => setCurrentItem(p => p ? { ...p, avatar: { ...p.avatar, url: '' } } : null)} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center backdrop-blur-xl transition-colors" title="Remove image"><X size={14} /></button>
                                    </div>
                                )}
                                <label className="flex-1">
                                    <div className="admin-button-secondary flex items-center justify-center gap-2 cursor-pointer"><Upload size={18} /><span>Upload Avatar</span></div>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10"><button onClick={() => setIsModalOpen(false)} className="admin-button-secondary">Cancel</button><button onClick={handleSave} disabled={saving} className="admin-button-primary">{saving ? 'Saving...' : 'Save Testimonial'}</button></div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TestimonialsForm;
