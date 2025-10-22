import React, { useState, useEffect } from 'react';
import { RawTestimonial } from '../../../types';
import { getTestimonialsData, updateTestimonials, convertFileToBase64 } from '../../../lib/api';
import Modal from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const TestimonialsForm: React.FC = () => {
    const [testimonials, setTestimonials] = useState<RawTestimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<RawTestimonial | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getTestimonialsData();
        setTestimonials(data);
        setIsLoading(false);
    };

    const handleEdit = (testimonial: RawTestimonial) => {
        setCurrentItem({ ...testimonial });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setCurrentItem({
            id: uuidv4(),
            clientName: '',
            roleCompany: '',
            quote: '',
            avatar: { url: '', alternativeText: '' },
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (testimonialId: string) => {
        if (window.confirm('Are you sure you want to delete this testimonial?')) {
            const updatedTestimonials = testimonials.filter(t => t.id !== testimonialId);
            await updateTestimonials(updatedTestimonials);
            setTestimonials(updatedTestimonials);
        }
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && currentItem) {
            const file = e.target.files[0];
            try {
                const base64 = await convertFileToBase64(file);
                setCurrentItem({
                    ...currentItem,
                    avatar: { ...currentItem.avatar, url: base64 }
                });
            } catch (error) {
                console.error("Image conversion error:", error);
            }
        }
    };

    const handleSave = async () => {
        if (!currentItem) return;
        setSaving(true);

        const isNew = !testimonials.some(t => t.id === currentItem.id);
        const updatedTestimonials = isNew
            ? [...testimonials, currentItem]
            : testimonials.map(t => (t.id === currentItem.id ? currentItem : t));

        await updateTestimonials(updatedTestimonials);
        setTestimonials(updatedTestimonials);
        setSaving(false);
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    if (isLoading) return <div>Loading testimonials...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Manage Testimonials</h3>
                <button onClick={handleAddNew} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    Add New Testimonial
                </button>
            </div>
            <div className="space-y-2">
                {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                        <div className="flex items-center gap-4">
                            <img src={testimonial.avatar.url} alt={testimonial.clientName} className="w-12 h-12 object-cover rounded-full"/>
                            <div>
                                <p className="font-semibold text-gray-800">{testimonial.clientName}</p>
                                <p className="text-sm text-gray-500">{testimonial.roleCompany}</p>
                            </div>
                        </div>
                        <div className="space-x-2">
                            <button onClick={() => handleEdit(testimonial)} className="text-sm text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => handleDelete(testimonial.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem?.id && testimonials.some(t => t.id === currentItem.id) ? 'Edit Testimonial' : 'Add Testimonial'}>
                {currentItem && (
                    <div className="space-y-4 text-gray-800">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Client Name</label>
                            <input type="text" value={currentItem.clientName} onChange={e => setCurrentItem(p => p ? { ...p, clientName: e.target.value } : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role & Company</label>
                            <input type="text" value={currentItem.roleCompany} onChange={e => setCurrentItem(p => p ? { ...p, roleCompany: e.target.value } : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quote</label>
                            <textarea rows={4} value={currentItem.quote} onChange={e => setCurrentItem(p => p ? { ...p, quote: e.target.value } : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"></textarea>
                        </div>
                        <div className="flex items-center gap-4">
                             <img src={currentItem.avatar.url} alt="Avatar preview" className="w-20 h-20 object-cover rounded-full border"/>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700">Avatar Image</label>
                                 <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-brand-purple hover:file:bg-violet-100" />
                                 {currentItem.avatar.url && (
                                     <button type="button" onClick={() => setCurrentItem(p => p ? { ...p, avatar: { ...p.avatar, url: '' } } : null)} className="mt-2 text-sm text-red-600 hover:underline">Remove Image</button>
                                 )}
                             </div>
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

export default TestimonialsForm;