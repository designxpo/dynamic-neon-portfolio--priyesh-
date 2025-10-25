// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { Service, RawService } from '@/types';
import { getServicesData, updateServices } from '@/lib/api';
import Modal from '@/components/admin/common/Modal';
import { v4 as uuidv4 } from 'uuid';
import { Edit2, Trash2, Plus, Zap } from 'lucide-react';

const ServicesForm: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<RawService | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getServicesData();
        setServices(data);
        setIsLoading(false);
    };

    const getIconName = (iconNode: React.ReactNode): string => {
        if (typeof iconNode === 'string') return iconNode;
        if (React.isValidElement(iconNode) && (iconNode.type as any).name) return (iconNode.type as any).name;
        return '';
    };

    const handleEdit = (service: Service) => {
        setCurrentItem({ ...service, icon: getIconName(service.icon) });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setCurrentItem({ id: uuidv4(), title: '', description: '', icon: '', order: services.length + 1 });
        setIsModalOpen(true);
    };
    
    const handleDelete = async (serviceId: string) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                const updatedServices = services.filter(s => s.id !== serviceId);
                await updateServices(updatedServices);
                setMessage({ type: 'success', text: 'Service deleted.' });
                fetchData();
            } catch (e) {
                console.error(e);
                setMessage({ type: 'error', text: 'Failed to delete service.' });
            }
        }
    };

    const handleSave = async () => {
        if (!currentItem) return;
        setSaving(true);
        setMessage(null);
        try {
            const existingServicesRaw = services.map(s => ({...s, icon: getIconName(s.icon)}));
            const isNew = !existingServicesRaw.some(s => s.id === currentItem.id);
            const updatedServices = isNew
                ? [...existingServicesRaw, currentItem]
                : existingServicesRaw.map(s => (s.id === currentItem.id ? currentItem : s));

            await updateServices(updatedServices);
            await fetchData();
            setMessage({ type: 'success', text: 'Service saved.' });
            setIsModalOpen(false);
            setCurrentItem(null);
        } catch (e) {
            console.error(e);
            setMessage({ type: 'error', text: 'Failed to save service.' });
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading services...</div>
        </div>
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
                    <h3 className="text-2xl font-bold text-white">Manage Services</h3>
                    <p className="text-gray-400 text-sm mt-1">Create and manage your service offerings</p>
                </div>
                <button onClick={handleAddNew} className="admin-button-primary flex items-center gap-2">
                    <Plus size={20} />
                    Add New Service
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Description</th>
                            <th>Order</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service) => (
                            <tr key={service.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg backdrop-blur-xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-electric-blue">
                                            <Zap size={20} />
                                        </div>
                                        <p className="font-semibold text-white">{service.title}</p>
                                    </div>
                                </td>
                                <td>
                                    <p className="text-gray-400 line-clamp-2">{service.description}</p>
                                </td>
                                <td>
                                    <span className="px-3 py-1 rounded-full text-xs backdrop-blur-xl bg-white/5 text-gray-400 border border-white/10">
                                        #{service.order}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEdit(service)} className="admin-icon-button" title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(service.id)} className="admin-button-danger" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem && services.some(s => s.id === currentItem.id) ? 'Edit Service' : 'Add Service'}>
                {currentItem && (
                    <div className="space-y-6">
                        <div>
                            <label className="admin-label">Title</label>
                            <input type="text" value={currentItem.title} onChange={e => setCurrentItem(p => p ? {...p, title: e.target.value} : null)} className="admin-input" placeholder="Enter service title" />
                        </div>
                        <div>
                            <label className="admin-label">Description</label>
                            <textarea rows={3} value={currentItem.description} onChange={e => setCurrentItem(p => p ? {...p, description: e.target.value} : null)} className="admin-textarea" placeholder="Describe the service" />
                        </div>
                        <div>
                            <label className="admin-label">Icon Name</label>
                            <input type="text" value={currentItem.icon} onChange={e => setCurrentItem(p => p ? {...p, icon: e.target.value} : null)} className="admin-input" placeholder="e.g., BrandingIcon" />
                            <p className="text-xs text-gray-500 mt-1">Icon component name from your icons library</p>
                        </div>
                        <div>
                            <label className="admin-label">Display Order</label>
                            <input type="number" value={currentItem.order || 0} onChange={e => setCurrentItem(p => p ? {...p, order: parseInt(e.target.value)} : null)} className="admin-input" placeholder="1" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <button onClick={() => setIsModalOpen(false)} className="admin-button-secondary">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="admin-button-primary">{saving ? 'Saving...' : 'Save Service'}</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ServicesForm;
