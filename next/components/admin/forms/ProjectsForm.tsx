// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { RawProject } from '@/types';
import { convertFileToBase64, getCategories } from '@/lib/api';
import Modal from '@/components/admin/common/Modal';
import { Edit2, Trash2, Plus, ExternalLink, Github } from 'lucide-react';

const ProjectsForm: React.FC = () => {
    const [projects, setProjects] = useState<RawProject[]>([]);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<RawProject | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const apiBase = '/api/projects';

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(apiBase);
            const data = await res.json();
            // Ensure _id is present for all projects
            setProjects(data.map((p: any) => ({ ...p, _id: p._id || p.id })));
        } catch (error) {
            console.error('Error loading projects:', error);
        }
        setIsLoading(false);
    };

    useEffect(() => { fetchProjects(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const categoriesData = await getCategories();
        setAvailableCategories(categoriesData);
        setIsLoading(false);
    };

    // Callback to refresh categories after Categories modal closes
    const handleCategoriesModalClose = () => {
        fetchData();
    };

    useEffect(() => { fetchData(); }, []);

    const handleEdit = (project: RawProject) => {
        const categories = Array.isArray(project.categories)
            ? project.categories
            : (project.category ? [project.category] : []);
        setCurrentItem({ ...project, categories, _id: project._id }); // Ensure _id is set
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setCurrentItem({
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
            if (!projectId) {
                setMessage({ type: 'error', text: 'Project ID is missing.' });
                return;
            }
            await fetch(`${apiBase}/${projectId}`, { method: 'DELETE' });
            fetchProjects();
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
        // Ensure required fields
        // Do not include _id in payload for PUT/POST
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...rest } = currentItem;
        const payload = {
            ...rest,
            category: (currentItem.categories && currentItem.categories.length > 0)
                ? currentItem.categories[0]
                : currentItem.category || '',
            descriptionShort: currentItem.descriptionShort || '',
            title: currentItem.title || '',
        };
        if (!payload.title || !payload.category || !payload.descriptionShort) {
            setMessage({ type: 'error', text: 'Title, category, and short description are required.' });
            setSaving(false);
            return;
        }
        if (currentItem._id) {
            // Edit/update
            await fetch(`${apiBase}/${currentItem._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } else {
            // Create
            await fetch(apiBase, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        }
        fetchProjects();
        setIsModalOpen(false);
        setCurrentItem(null);
        setSaving(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">Loading projects...</div>
            </div>
        );
    }

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
                            <tr key={project._id}>
                                <td>
                                    <div className="flex items-center gap-4">
                                        <Image src={project.coverImage.url} alt={project.title} width={64} height={48} className="w-16 h-12 object-cover rounded-lg border border-white/10" />
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
                                        <button onClick={() => handleDelete(project._id)} className="admin-button-danger" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); handleCategoriesModalClose(); }} title={currentItem?._id && projects.some(p => p._id === currentItem._id) ? 'Edit Project' : 'Add Project'}>
                {currentItem && (
                    <div className="space-y-6">
                        <div>
                            <label className="admin-label">Title</label>
                            <input type="text" value={currentItem.title} onChange={e => setCurrentItem(p => p ? { ...p, title: e.target.value } : null)} className="admin-input" placeholder="Enter project title" />
                        </div>
                        <div>
                            <label className="admin-label">Categories</label>
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {availableCategories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${currentItem.categories?.includes(cat) ? 'bg-electric-blue/20 text-electric-blue border-electric-blue/40' : 'bg-white/5 text-gray-400 border-white/10'}`}
                                            onClick={() => {
                                                setCurrentItem(p => p ? {
                                                    ...p,
                                                    categories: p.categories?.includes(cat)
                                                        ? p.categories.filter(c => c !== cat)
                                                        : [...(p.categories || []), cat]
                                                } : null);
                                            }}
                                        >{cat}</button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={(currentItem.categories || []).join(', ')}
                                    onChange={e => {
                                        const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                        setCurrentItem(p => p ? { ...p, categories: arr } : null);
                                    }}
                                    className="admin-input mt-2"
                                    placeholder="e.g., Web, UI/UX, Apps"
                                />
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
                        <div className="admin-card">
                            <h5 className="text-sm font-semibold text-white mb-3">Sales context (strongly recommended)</h5>
                            <div className="space-y-4">
                                <div>
                                    <label className="admin-label">Outcome / Result</label>
                                    <input type="text" value={currentItem.outcome || ''} onChange={e => setCurrentItem(p => p ? { ...p, outcome: e.target.value } : null)} className="admin-input" placeholder="Increased sign-ups by 40% in 3 months" />
                                    <p className="mt-1 text-xs text-gray-500">The single most important field for winning clients. Lead with a number.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="admin-label">Client</label>
                                        <input type="text" value={currentItem.clientName || ''} onChange={e => setCurrentItem(p => p ? { ...p, clientName: e.target.value } : null)} className="admin-input" placeholder="Acme Fintech (or 'Series-A SaaS startup')" />
                                    </div>
                                    <div>
                                        <label className="admin-label">Timeline</label>
                                        <input type="text" value={currentItem.timeline || ''} onChange={e => setCurrentItem(p => p ? { ...p, timeline: e.target.value } : null)} className="admin-input" placeholder="6 weeks" />
                                    </div>
                                </div>
                            </div>
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
                                <Image src={currentItem.coverImage.url} alt="Cover preview" width={672} height={192} className="w-full h-48 object-cover rounded-lg border border-white/10 mb-4" />
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
