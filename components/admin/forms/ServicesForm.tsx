import React, { useState, useEffect } from 'react';
import { Service, RawService } from '../../../types';
import { getServicesData, updateServices } from '../../../lib/api';
import Modal from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const ServicesForm: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<RawService | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getServicesData();
        setServices(data);
        setIsLoading(false);
    };

    const getIconName = (iconNode: React.ReactNode): string => {
        if (typeof iconNode === 'string') return iconNode;
        if (React.isValidElement(iconNode) && (iconNode.type as any).name) {
            return (iconNode.type as any).name;
        }
        return '';
    };

    const handleEdit = (service: Service) => {
        setCurrentItem({ 
            ...service,
            icon: getIconName(service.icon)
         });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setCurrentItem({
            id: uuidv4(),
            title: '',
            description: '',
            icon: '', 
            order: services.length + 1,
        });
        setIsModalOpen(true);
    };
    
    const handleDelete = async (serviceId: string) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            const updatedServices = services.filter(s => s.id !== serviceId);
            await updateServices(updatedServices);
            fetchData();
        }
    };

    const handleSave = async () => {
        if (!currentItem) return;
        setSaving(true);
        
        const existingServicesRaw = services.map(s => ({...s, icon: getIconName(s.icon)}));

        const isNew = !existingServicesRaw.some(s => s.id === currentItem.id);
        
        const updatedServices = isNew
            ? [...existingServicesRaw, currentItem]
            : existingServicesRaw.map(s => (s.id === currentItem.id ? currentItem : s));

        await updateServices(updatedServices);
        await fetchData();
        setSaving(false);
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    if (isLoading) return <div>Loading services...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Manage Services</h3>
                <button onClick={handleAddNew} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    Add New Service
                </button>
            </div>
            <div className="space-y-2">
                {services.map((service) => (
                    <div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                        <div>
                            <p className="font-semibold text-gray-800">{service.title}</p>
                            <p className="text-sm text-gray-500">{service.description?.substring(0, 50)}...</p>
                        </div>
                         <div className="space-x-2">
                            <button onClick={() => handleEdit(service)} className="text-sm text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => handleDelete(service.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem && services.some(s => s.id === currentItem.id) ? 'Edit Service' : 'Add Service'}>
               {currentItem && (
                    <div className="space-y-4 text-gray-800">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" value={currentItem.title} onChange={e => setCurrentItem(p => p ? {...p, title: e.target.value} : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea rows={3} value={currentItem.description} onChange={e => setCurrentItem(p => p ? {...p, description: e.target.value} : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Icon Name (e.g., BrandingIcon)</label>
                            <input type="text" value={currentItem.icon} onChange={e => setCurrentItem(p => p ? {...p, icon: e.target.value} : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Order</label>
                            <input type="number" value={currentItem.order || 0} onChange={e => setCurrentItem(p => p ? {...p, order: parseInt(e.target.value)} : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-brand-purple-light disabled:bg-gray-400">
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ServicesForm;