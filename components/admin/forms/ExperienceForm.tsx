import React, { useState, useEffect } from 'react';
import { Experience } from '../../../types';
import { getExperiencesData, updateExperiences } from '../../../lib/api';
import Modal from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const ExperienceForm: React.FC = () => {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Experience | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

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
        setCurrentItem({
            id: uuidv4(),
            positionTitle: '',
            companyName: '',
            startYear: '',
            endYear: '',
            description: '',
        });
        setIsModalOpen(true);
    };
    
    const handleDelete = async (expId: string) => {
        if (window.confirm('Are you sure you want to delete this experience entry?')) {
            const updatedExperiences = experiences.filter(exp => exp.id !== expId);
            await updateExperiences(updatedExperiences);
            setExperiences(updatedExperiences);
        }
    };

    const handleSave = async () => {
        if (!currentItem) return;
        setSaving(true);
        
        const isNew = !experiences.some(exp => exp.id === currentItem.id);
        const updatedExperiences = isNew
            ? [...experiences, currentItem]
            : experiences.map(exp => (exp.id === currentItem.id ? currentItem : exp));
            
        await updateExperiences(updatedExperiences);
        setExperiences(updatedExperiences);
        setSaving(false);
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    if (isLoading) return <div>Loading experiences...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Manage Experience</h3>
                <button onClick={handleAddNew} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    Add New Experience
                </button>
            </div>
            <div className="space-y-2">
                {experiences.map((exp) => (
                    <div key={exp.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                        <div>
                            <p className="font-semibold text-gray-800">{exp.positionTitle} at {exp.companyName}</p>
                            <p className="text-sm text-gray-500">{exp.startYear} - {exp.endYear}</p>
                        </div>
                         <div className="space-x-2">
                            <button onClick={() => handleEdit(exp)} className="text-sm text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => handleDelete(exp.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem?.id && experiences.some(e => e.id === currentItem.id) ? 'Edit Experience' : 'Add Experience'}>
               {currentItem && (
                    <div className="space-y-4 text-gray-800">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Position Title</label>
                            <input type="text" value={currentItem.positionTitle} onChange={e => setCurrentItem(p => p ? {...p, positionTitle: e.target.value} : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Company Name</label>
                            <input type="text" value={currentItem.companyName} onChange={e => setCurrentItem(p => p ? {...p, companyName: e.target.value} : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Start Year</label>
                                <input type="text" value={currentItem.startYear} onChange={e => setCurrentItem(p => p ? {...p, startYear: e.target.value} : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">End Year</label>
                                <input type="text" value={currentItem.endYear} onChange={e => setCurrentItem(p => p ? {...p, endYear: e.target.value} : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea rows={3} value={currentItem.description} onChange={e => setCurrentItem(p => p ? {...p, description: e.target.value} : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"></textarea>
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

export default ExperienceForm;