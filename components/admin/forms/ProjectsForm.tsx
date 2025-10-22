import React, { useState, useEffect } from 'react';
import { RawProject } from '../../../types';
import { getProjectsData, updateProjects, convertFileToBase64 } from '../../../lib/api';
import Modal from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const ProjectsForm: React.FC = () => {
    const [projects, setProjects] = useState<RawProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<RawProject | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getProjectsData();
        setProjects(data);
        setIsLoading(false);
    };

    const handleEdit = (project: RawProject) => {
        setCurrentItem({ ...project });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setCurrentItem({
            id: uuidv4(),
            title: '',
            category: '',
            descriptionShort: '',
            descriptionLong: '',
            technologies: [],
            liveUrl: '',
            sourceUrl: '',
            featured: false,
            coverImage: { url: '', alternativeText: '' },
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (projectId: string) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            const updatedProjects = projects.filter(p => p.id !== projectId);
            await updateProjects(updatedProjects);
            setProjects(updatedProjects);
        }
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && currentItem) {
            const file = e.target.files[0];
            try {
                const base64 = await convertFileToBase64(file);
                setCurrentItem({
                    ...currentItem,
                    coverImage: { ...currentItem.coverImage, url: base64 }
                });
            } catch (error) {
                console.error("Image conversion error:", error);
            }
        }
    };

    const handleSave = async () => {
        if (!currentItem) return;
        setSaving(true);

        const isNew = !projects.some(p => p.id === currentItem.id);
        const updatedProjects = isNew
            ? [...projects, currentItem]
            : projects.map(p => (p.id === currentItem.id ? currentItem : p));

        await updateProjects(updatedProjects);
        setProjects(updatedProjects);
        setSaving(false);
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    if (isLoading) return <div>Loading projects...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Manage Projects</h3>
                <button onClick={handleAddNew} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    Add New Project
                </button>
            </div>
            <div className="space-y-2">
                {projects.map((project) => (
                    <div key={project.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                        <div className="flex items-center gap-4">
                            <img src={project.coverImage.url} alt={project.title} className="w-16 h-12 object-cover rounded"/>
                            <div>
                                <p className="font-semibold text-gray-800">{project.title}</p>
                                <p className="text-sm text-gray-500">{project.category}</p>
                            </div>
                        </div>
                        <div className="space-x-2">
                            <button onClick={() => handleEdit(project)} className="text-sm text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => handleDelete(project.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem?.id && projects.some(p => p.id === currentItem.id) ? 'Edit Project' : 'Add Project'}>
                {currentItem && (
                    <div className="space-y-4 text-gray-800">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" value={currentItem.title} onChange={e => setCurrentItem(p => p ? { ...p, title: e.target.value } : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <input type="text" value={currentItem.category} onChange={e => setCurrentItem(p => p ? { ...p, category: e.target.value } : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Short Description</label>
                            <textarea rows={2} value={currentItem.descriptionShort} onChange={e => setCurrentItem(p => p ? { ...p, descriptionShort: e.target.value } : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"></textarea>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Long Description</label>
                            <textarea rows={4} value={currentItem.descriptionLong} onChange={e => setCurrentItem(p => p ? { ...p, descriptionLong: e.target.value } : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Technologies (comma-separated)</label>
                            <input type="text" value={(currentItem.technologies || []).join(', ')} onChange={e => setCurrentItem(p => p ? { ...p, technologies: e.target.value.split(',').map(s => s.trim()) } : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Live URL</label>
                                <input type="url" value={currentItem.liveUrl} onChange={e => setCurrentItem(p => p ? { ...p, liveUrl: e.target.value } : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Source Code URL</label>
                                <input type="url" value={currentItem.sourceUrl} onChange={e => setCurrentItem(p => p ? { ...p, sourceUrl: e.target.value } : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             <img src={currentItem.coverImage.url} alt="Cover preview" className="w-24 h-24 object-cover rounded border"/>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700">Cover Image</label>
                                 <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-brand-purple hover:file:bg-violet-100" />
                                 {currentItem.coverImage.url && (
                                     <button type="button" onClick={() => setCurrentItem(p => p ? { ...p, coverImage: { ...p.coverImage, url: '' } } : null)} className="mt-2 text-sm text-red-600 hover:underline">Remove Image</button>
                                 )}
                             </div>
                        </div>
                        <div className="flex items-center">
                            <input id="featured" type="checkbox" checked={currentItem.featured} onChange={e => setCurrentItem(p => p ? { ...p, featured: e.target.checked } : null)} className="h-4 w-4 text-brand-purple border-gray-300 rounded" />
                            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">Featured Project</label>
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

export default ProjectsForm;