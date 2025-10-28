// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { RawProject } from '@/types';
import { getProjectsData, updateProjects, convertFileToBase64, getCategories } from '@/lib/api';
import Modal from '@/components/admin/common/Modal';
import { v4 as uuidv4 } from 'uuid';
import { Edit2, Trash2, Plus, ExternalLink, Github } from 'lucide-react';

const ProjectsForm: React.FC = () => {
    const [projects, setProjects] = useState<RawProject[]>([]);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<RawProject | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const [projectsData, categoriesData] = await Promise.all([
            getProjectsData(),
            getCategories()
        ]);
        setProjects(projectsData);
        setAvailableCategories(categoriesData);
        setIsLoading(false);
    };

    const handleEdit = (project: RawProject) => {
        // Normalize categories for editing
        const categories = Array.isArray(project.categories)
            ? project.categories
            : (project.category ? [project.category] : []);
        setCurrentItem({ ...project, categories });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setCurrentItem({
            id: uuidv4(),
            title: '',
            category: '',
            categories: [],
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
            try {
                const updatedProjects = projects.filter(p => p.id !== projectId);
                await updateProjects(updatedProjects);
                setProjects(updatedProjects);
                setMessage({ type: 'success', text: 'Project deleted.' });
            } catch (e) {
                console.error(e);
                setMessage({ type: 'error', text: 'Failed to delete project.' });
            }
        }
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && currentItem) {
            const file = e.target.files[0];
            try {
                const base64 = await convertFileToBase64(file);
                setCurrentItem({ ...currentItem, coverImage: { ...currentItem.coverImage, url: base64 } });
            } catch (error) {
                console.error("Image conversion error:", error);
            }
        }
    };

    const handleSave = async () => {
        if (!currentItem) return;
        setSaving(true);
        setMessage(null);
        try {
            const isNew = !projects.some(p => p.id === currentItem.id);
            // keep primary category in sync for compatibility
            const primary = (currentItem.categories && currentItem.categories[0]) || (currentItem.category || '');
            const toSave: RawProject = { ...currentItem, category: primary } as RawProject;
            const updatedProjects = isNew
                ? [...projects, toSave]
                : projects.map(p => (p.id === currentItem.id ? toSave : p));
            await updateProjects(updatedProjects);
            setProjects(updatedProjects);
            setIsModalOpen(false);
            setCurrentItem(null);
            setMessage({ type: 'success', text: 'Project saved.' });
        } catch (e) {
            console.error(e);
            setMessage({ type: 'error', text: 'Failed to save project.' });
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading projects...</div>
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
                    <h3 className="text-2xl font-bold text-white">Manage Projects</h3>
                    <p className="text-gray-400 text-sm mt-1">Create and manage your portfolio projects</p>
                </div>
                <button onClick={handleAddNew} className="admin-button-primary flex items-center gap-2">
                    <Plus size={20} />
                    Add New Project
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Categories</th>
                            <th>Technologies</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((project) => (
                            <tr key={project.id}>
                                <td>
                                    <div className="flex items-center gap-4">
                                        <img src={project.coverImage.url} alt={project.title} className="w-16 h-12 object-cover rounded-lg border border-white/10" />
                                        <div>
                                            <p className="font-semibold text-white">{project.title}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">{project.descriptionShort}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-wrap gap-1">
                                        {((project.categories && project.categories.length ? project.categories : (project.category ? [project.category] : []))).map((cat, idx) => (
                                            <span key={idx} className="px-2 py-1 rounded-full text-xs font-medium backdrop-blur-xl bg-electric-blue/10 text-electric-blue border border-electric-blue/20">{cat}</span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-wrap gap-1">
                                        {project.technologies?.slice(0, 3).map((tech, idx) => (
                                            <span key={idx} className="px-2 py-1 rounded-md text-xs backdrop-blur-xl bg-white/5 text-gray-400 border border-white/10">{tech}</span>
                                        ))}
                                        {project.technologies && project.technologies.length > 3 && (
                                            <span className="px-2 py-1 rounded-md text-xs text-gray-500">+{project.technologies.length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    {project.featured ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xl bg-deep-violet/10 text-white border border-deep-violet/20">Featured</span>
                                    ) : (
                                        <span className="text-gray-600 text-xs">Standard</span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEdit(project)} className="admin-icon-button" title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(project.id)} className="admin-button-danger" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem?.id && projects.some(p => p.id === currentItem.id) ? 'Edit Project' : 'Add Project'}>
                {currentItem && (
                    <div className="space-y-6">
                        <div>
                            <label className="admin-label">Title</label>
                            <input type="text" value={currentItem.title} onChange={e => setCurrentItem(p => p ? { ...p, title: e.target.value } : null)} className="admin-input" placeholder="Enter project title" />
                        </div>
                        <div>
                            <label className="admin-label">Categories</label>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={(currentItem.categories || []).join(', ')}
                                    onChange={e => {
                                        const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                        setCurrentItem(p => p ? { ...p, categories: arr } : null);
                                    }}
                                    className="admin-input"
                                    placeholder="e.g., Web, UI/UX, Apps"
                                />
                                
                                {/* Quick-add existing categories */}
                                {availableCategories.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-2">Quick add from existing:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {availableCategories.map((cat) => {
                                                const isSelected = (currentItem.categories || []).includes(cat);
                                                return (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => {
                                                            if (!isSelected) {
                                                                const newCategories = [...(currentItem.categories || []), cat];
                                                                setCurrentItem(p => p ? { ...p, categories: newCategories } : null);
                                                            }
                                                        }}
                                                        disabled={isSelected}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                                            isSelected
                                                                ? 'backdrop-blur-xl bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                                                                : 'backdrop-blur-xl bg-white/5 text-gray-300 border border-white/10 hover:bg-electric-blue/10 hover:text-electric-blue hover:border-electric-blue/20'
                                                        }`}
                                                    >
                                                        {isSelected ? '✓ ' : '+ '}{cat}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Selected categories with remove functionality */}
                                {(currentItem.categories || []).length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-2">Selected categories:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(currentItem.categories || []).map((cat, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xl bg-electric-blue/10 text-electric-blue border border-electric-blue/20"
                                                >
                                                    {idx === 0 && <span className="text-xs">📌</span>}
                                                    {cat}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newCategories = [...(currentItem.categories || [])];
                                                            newCategories.splice(idx, 1);
                                                            setCurrentItem(p => p ? { ...p, categories: newCategories } : null);
                                                        }}
                                                        className="ml-1 text-electric-blue/70 hover:text-electric-blue"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <p className="mt-1 text-xs text-gray-500">
                                    Add multiple categories separated by commas or use the quick-add buttons above. The first category (📌) will be used as the primary category for backward compatibility.
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="admin-label">Short Description</label>
                            <textarea rows={2} value={currentItem.descriptionShort} onChange={e => setCurrentItem(p => p ? { ...p, descriptionShort: e.target.value } : null)} className="admin-textarea" placeholder="Brief description for cards" />
                        </div>
                        <div>
                            <label className="admin-label">Long Description</label>
                            <textarea rows={4} value={currentItem.descriptionLong} onChange={e => setCurrentItem(p => p ? { ...p, descriptionLong: e.target.value } : null)} className="admin-textarea" placeholder="Detailed project description" />
                        </div>
                        <div>
                            <label className="admin-label">Technologies (comma-separated)</label>
                            <input type="text" value={(currentItem.technologies || []).join(', ')} onChange={e => setCurrentItem(p => p ? { ...p, technologies: e.target.value.split(',').map(s => s.trim()) } : null)} className="admin-input" placeholder="React, TypeScript, Node.js" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="admin-label flex items-center gap-2"><ExternalLink size={14} /> Live URL</label>
                                <input type="url" value={currentItem.liveUrl} onChange={e => setCurrentItem(p => p ? { ...p, liveUrl: e.target.value } : null)} className="admin-input" placeholder="https://example.com" />
                                <p className="mt-1 text-xs text-gray-500">Leave blank to hide the Live link on the card.</p>
                            </div>
                            <div>
                                <label className="admin-label flex items-center gap-2"><Github size={14} /> Source Code URL</label>
                                <input type="url" value={currentItem.sourceUrl} onChange={e => setCurrentItem(p => p ? { ...p, sourceUrl: e.target.value } : null)} className="admin-input" placeholder="https://github.com/..." />
                                <p className="mt-1 text-xs text-gray-500">Leave blank to hide the GitHub icon/link on the card.</p>
                            </div>
                        </div>
                        <div className="admin-card">
                            <label className="admin-label">Cover Image</label>
                            {currentItem.coverImage.url && (
                                <img src={currentItem.coverImage.url} alt="Cover preview" className="w-full h-48 object-cover rounded-lg border border-white/10 mb-4" />
                            )}
                            <div className="flex gap-3">
                                <label className="admin-button-secondary flex items-center gap-2 cursor-pointer">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    Upload Image
                                </label>
                                {currentItem.coverImage.url && (
                                    <button type="button" onClick={() => setCurrentItem(p => p ? { ...p, coverImage: { ...p.coverImage, url: '' } } : null)} className="admin-button-danger">
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 admin-card">
                            <input id="featured" type="checkbox" checked={currentItem.featured} onChange={e => setCurrentItem(p => p ? { ...p, featured: e.target.checked } : null)} className="w-5 h-5 rounded border-white/20 bg-white/5 text-electric-blue focus:ring-electric-blue focus:ring-offset-0" />
                            <label htmlFor="featured" className="text-sm text-gray-300 cursor-pointer">Mark as Featured Project</label>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <button onClick={() => setIsModalOpen(false)} className="admin-button-secondary">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="admin-button-primary">{saving ? 'Saving...' : 'Save Project'}</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProjectsForm;
