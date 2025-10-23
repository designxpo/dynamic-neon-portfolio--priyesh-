import React, { useState, useEffect } from 'react';
import { Blog, BlogData, Image } from '../../../types';
import { getBlogs, addBlog, updateBlog, deleteBlog } from '../../../lib/api';
import Modal from '../common/Modal';
import { convertFileToBase64 } from '../../../lib/api';
import { Edit2, Trash2, Plus, FileText, Calendar, User, Upload, X, Link as LinkIcon } from 'lucide-react';

const BlogsForm: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<Blog> | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getBlogs();
        setBlogs(data);
        setIsLoading(false);
    };

    const handleEdit = (blog: Blog) => {
        setCurrentItem(blog);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setCurrentItem({
            title: '',
            content: '',
            author: 'Alex Doe', // Default author
            publishedAt: new Date().toISOString().split('T')[0], // Default to today
            url: '',
            excerpt: '',
            thumbnail: undefined
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (blogId: string) => {
        if (window.confirm('Are you sure you want to delete this blog post?')) {
            await deleteBlog(blogId);
            fetchData();
        }
    };
    
    const handleSave = async () => {
        if (!currentItem) return;

        if (currentItem.id) {
            await updateBlog(currentItem as Blog);
        } else {
            await addBlog(currentItem as BlogData);
        }
        
        fetchData();
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">Loading blog posts...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-white">Manage Blog Posts</h3>
                    <p className="text-gray-400 text-sm mt-1">Add and manage your blog articles</p>
                </div>
                <button 
                    onClick={handleAddNew} 
                    className="admin-button-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add New Post
                </button>
            </div>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                    <div key={blog.id} className="admin-card group hover:border-electric-blue/30">
                        {blog.thumbnail?.url && (
                            <div className="mb-4 -mx-6 -mt-6 overflow-hidden rounded-t-xl">
                                <img 
                                    src={blog.thumbnail.url} 
                                    alt={blog.title} 
                                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        )}
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg backdrop-blur-xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-electric-blue flex-shrink-0">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white line-clamp-2">{blog.title}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                                    <div className="flex items-center gap-1">
                                        <User size={12} />
                                        <span>{blog.author}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {blog.excerpt && (
                            <p className="text-gray-400 text-sm line-clamp-2 mb-4">{blog.excerpt}</p>
                        )}
                        <div className="flex items-center gap-2 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEdit(blog)} 
                                className="admin-icon-button flex-1"
                            >
                                <Edit2 size={16} />
                                <span className="ml-2">Edit</span>
                            </button>
                            <button 
                                onClick={() => handleDelete(blog.id)} 
                                className="admin-button-danger flex-1"
                            >
                                <Trash2 size={16} />
                                <span className="ml-2">Delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem?.id ? 'Edit Blog Post' : 'Add Blog Post'}>
                <div className="space-y-6">
                    <div>
                        <label className="admin-label">Title</label>
                        <input 
                            type="text" 
                            value={currentItem?.title || ''} 
                            onChange={e => setCurrentItem(p => ({...p, title: e.target.value}))} 
                            className="admin-input"
                            placeholder="Enter blog post title"
                        />
                    </div>
                    <div>
                        <label className="admin-label flex items-center gap-2">
                            <LinkIcon size={16} />
                            Medium Article URL
                        </label>
                        <input 
                            type="url" 
                            value={currentItem?.url || ''} 
                            onChange={e => setCurrentItem(p => ({...p, url: e.target.value}))} 
                            className="admin-input"
                            placeholder="https://medium.com/@username/article"
                        />
                    </div>
                    <div>
                        <label className="admin-label">Short Description</label>
                        <textarea 
                            rows={3} 
                            value={currentItem?.excerpt || ''} 
                            onChange={e => setCurrentItem(p => ({...p, excerpt: e.target.value}))} 
                            className="admin-textarea"
                            placeholder="One or two sentences for the card"
                        />
                    </div>
                    <div>
                        <label className="admin-label">Thumbnail Image</label>
                        {currentItem?.thumbnail?.url && (
                            <div className="mb-3 relative inline-block">
                                <img 
                                    src={currentItem.thumbnail.url} 
                                    alt={currentItem.title || 'thumbnail'} 
                                    className="w-full h-40 object-cover rounded-lg border border-white/10"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setCurrentItem(p => ({...p, thumbnail: undefined}))} 
                                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center backdrop-blur-xl transition-colors"
                                    title="Remove image"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <input 
                                type="url" 
                                placeholder="Image URL" 
                                onChange={e => setCurrentItem(p => ({...p, thumbnail: e.target.value ? ({url: e.target.value} as Image) : undefined}))} 
                                className="admin-input flex-1"
                            />
                            <label className="admin-button-secondary flex items-center gap-2 cursor-pointer whitespace-nowrap">
                                <Upload size={18} />
                                Upload
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const base64 = await convertFileToBase64(file);
                                        setCurrentItem(p => ({...p, thumbnail: { url: base64 } as Image }));
                                    }} 
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="admin-label flex items-center gap-2">
                            <User size={16} />
                            Author
                        </label>
                        <input 
                            type="text" 
                            value={currentItem?.author || ''} 
                            onChange={e => setCurrentItem(p => ({...p, author: e.target.value}))} 
                            className="admin-input"
                            placeholder="Author name"
                        />
                    </div>
                    <div>
                        <label className="admin-label">Content</label>
                        <textarea 
                            rows={8} 
                            value={currentItem?.content || ''} 
                            onChange={e => setCurrentItem(p => ({...p, content: e.target.value}))} 
                            className="admin-textarea"
                            placeholder="Full blog content..."
                        />
                    </div>
                    <div>
                        <label className="admin-label flex items-center gap-2">
                            <Calendar size={16} />
                            Published Date
                        </label>
                        <input
                            type="date"
                            className="admin-input"
                            value={(() => {
                                const v = currentItem?.publishedAt || '';
                                if (!v) return '';
                                // Support both full ISO strings and YYYY-MM-DD values
                                return v.length > 10 ? new Date(v).toISOString().split('T')[0] : v;
                            })()}
                            onChange={e => setCurrentItem(p => ({ ...p, publishedAt: e.target.value }))}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button 
                            onClick={() => setIsModalOpen(false)} 
                            className="admin-button-secondary"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave} 
                            className="admin-button-primary"
                        >
                            Save Post
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BlogsForm;