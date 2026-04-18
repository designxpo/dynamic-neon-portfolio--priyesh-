// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { Blog, Image } from '@/types';
import { convertFileToBase64 } from '@/lib/api';
import Modal from '@/components/admin/common/Modal';
import { Edit2, Trash2, Plus, FileText, Calendar, User, Upload, X, Link as LinkIcon } from 'lucide-react';

const BlogsForm: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<Blog> | null>(null);

    useEffect(() => { fetchblogs(); }, []);

    // const fetchData = async () => {
    //     setIsLoading(true);
    //     const data = await getBlogs();
    //     setBlogs(data);
    //     setIsLoading(false);
    // };
const fetchblogs = async () => {
    try {
        const blogItems = await fetch('/api/blogs?all=1').then(res => res.json());
        setBlogs(blogItems);
    } catch (error) {
        console.error('Error loading blogs:', error);
    } finally {
        setIsLoading(false);
    }
}
    const handleEdit = (blog: Blog) => {
        setCurrentItem(blog);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setCurrentItem({
            title: '',
            content: '',
            author: 'Priyesh Mishra',
            publishedAt: new Date().toISOString().split('T')[0],
            url: '',
            excerpt: '',
            thumbnail: undefined,
            published: false, // start as draft — toggle on when ready to publish
            slug: '',
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
            ogImage: '',
            canonicalUrl: '',
        });
        setIsModalOpen(true);
    };

    // const handleDelete = async (blogId: string) => {
    //     if (window.confirm('Are you sure you want to delete this blog post?')) {
    //         await deleteBlog(blogId);
    //         fetchData();
    //     }
    // };
    const handleDelete = async (blogId: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
        await fetch(`/api/blogs/${blogId}`, { method: 'DELETE' });
        fetchblogs();
    }
};

const handleSave = async () => {
    if (!currentItem) return;
    if (currentItem.id) {
        // Edit existing blog
        await fetch(`/api/blogs/${currentItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentItem),
        });
    } else {
        // Add new blog
        await fetch('/api/blogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentItem),
        });
    }
    fetchblogs();
    setIsModalOpen(false);
    setCurrentItem(null);
};
    
    // const handleSave = async () => {
    //     if (!currentItem) return;
    //     if (currentItem.id) {
    //         await updateBlog(currentItem as Blog);
    //     } else {
    //         await addBlog(currentItem as BlogData);
    //     }
    //     fetchData();
    //     setIsModalOpen(false);
    //     setCurrentItem(null);
    // };
//   const handleSave = async () => {
//        const saveblog = await fetch('/api/blogs', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(currentItem),
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           console.log('Blog post saved successfully:', data);
//         })
//         .catch((error) => {
//           console.error('Error saving blog post:', error);
//         });
//     };
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">Loading blog posts...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-white">Manage Blog Posts</h3>
                    <p className="text-gray-400 text-sm mt-1">Add and manage your blog articles</p>
                </div>
                <button onClick={handleAddNew} className="admin-button-primary flex items-center gap-2">
                    <Plus size={20} />
                    Add New Post
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                    <div key={blog.id} className="admin-card group hover:border-electric-blue/30">
                        {blog.thumbnail?.url && (
                            <div className="mb-4 -mx-6 -mt-6 overflow-hidden rounded-t-xl">
                                <NextImage src={blog.thumbnail.url} alt={blog.title} width={400} height={160} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                        )}
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg backdrop-blur-xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-electric-blue flex-shrink-0">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2">
                                    <p className="font-semibold text-white line-clamp-2 flex-1">{blog.title}</p>
                                    {!blog.published && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full border bg-yellow-500/15 text-yellow-300 border-yellow-500/30 flex-shrink-0">Draft</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                                    <div className="flex items-center gap-1"><User size={12} /><span>{blog.author}</span></div>
                                    <div className="flex items-center gap-1"><Calendar size={12} /><span>{new Date(blog.publishedAt).toLocaleDateString()}</span></div>
                                </div>
                            </div>
                        </div>
                        {blog.excerpt && (<p className="text-gray-400 text-sm line-clamp-2 mb-4">{blog.excerpt}</p>)}
                        <div className="flex items-center gap-2 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(blog)} className="admin-icon-button flex-1"><Edit2 size={16} /><span className="ml-2">Edit</span></button>
                            <button onClick={() => handleDelete(blog.id)} className="admin-button-danger flex-1"><Trash2 size={16} /><span className="ml-2">Delete</span></button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem?.id ? 'Edit Blog Post' : 'Add Blog Post'}>
                <div className="space-y-6">
                    <div>
                        <label className="admin-label">Title</label>
                        <input type="text" value={currentItem?.title || ''} onChange={e => setCurrentItem(p => ({...p, title: e.target.value}))} className="admin-input" placeholder="Enter blog post title" />
                    </div>
                    <div>
                        <label className="admin-label flex items-center gap-2"><LinkIcon size={16} /> Medium Article URL</label>
                        <input type="url" value={currentItem?.url || ''} onChange={e => setCurrentItem(p => ({...p, url: e.target.value}))} className="admin-input" placeholder="https://medium.com/@username/article" />
                    </div>
                    <div>
                        <label className="admin-label">Short Description</label>
                        <textarea rows={3} value={currentItem?.excerpt || ''} onChange={e => setCurrentItem(p => ({...p, excerpt: e.target.value}))} className="admin-textarea" placeholder="One or two sentences for the card" />
                    </div>
                    <div>
                        <label className="admin-label">Thumbnail Image</label>
                        {currentItem?.thumbnail?.url && (
                            <div className="mb-3 relative inline-block">
                                <NextImage src={currentItem.thumbnail.url} alt={currentItem.title || 'thumbnail'} width={400} height={160} className="w-full h-40 object-cover rounded-lg border border-white/10" />
                                <button type="button" onClick={() => setCurrentItem(p => ({...p, thumbnail: undefined}))} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center backdrop-blur-xl transition-colors" title="Remove image"><X size={14} /></button>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <input type="url" placeholder="Image URL" onChange={e => setCurrentItem(p => ({...p, thumbnail: e.target.value ? ({url: e.target.value} as Image) : undefined}))} className="admin-input flex-1" />
                            <label className="admin-button-secondary flex items-center gap-2 cursor-pointer whitespace-nowrap">
                                <Upload size={18} />
                                Upload
                                <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const base64 = await convertFileToBase64(file); setCurrentItem(p => ({...p, thumbnail: { url: base64 } as Image })); }} className="hidden" />
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="admin-label flex items-center gap-2"><User size={16} /> Author</label>
                        <input type="text" value={currentItem?.author || ''} onChange={e => setCurrentItem(p => ({...p, author: e.target.value}))} className="admin-input" placeholder="Author name" />
                    </div>
                    <div>
                        <label className="admin-label">Content</label>
                        <textarea rows={8} value={currentItem?.content || ''} onChange={e => setCurrentItem(p => ({...p, content: e.target.value}))} className="admin-textarea" placeholder="Full blog content..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="admin-label flex items-center gap-2"><Calendar size={16} /> Published Date</label>
                            <input type="date" className="admin-input" value={(() => { const v = currentItem?.publishedAt || ''; if (!v) return ''; return v.length > 10 ? new Date(v).toISOString().split('T')[0] : v; })()} onChange={e => setCurrentItem(p => ({ ...p, publishedAt: e.target.value }))} />
                        </div>
                        <div>
                            <label className="admin-label">Status</label>
                            <div className="flex items-center gap-3 h-[42px]">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="accent-electric-blue"
                                        checked={!!currentItem?.published}
                                        onChange={(e) => setCurrentItem(p => ({ ...p, published: e.target.checked }))}
                                    />
                                    <span className={`text-sm font-medium ${currentItem?.published ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                        {currentItem?.published ? 'Published' : 'Draft'}
                                    </span>
                                </label>
                                <p className="text-xs text-gray-500">Drafts are hidden from the public site.</p>
                            </div>
                        </div>
                    </div>

                    {/* SEO — per-post for ranking long-tail keywords */}
                    <div className="admin-card">
                        <h5 className="text-sm font-semibold text-white mb-3">SEO (optional — boosts ranking)</h5>
                        <div className="space-y-4">
                            <div>
                                <label className="admin-label">Slug</label>
                                <input type="text" value={currentItem?.slug || ''} onChange={e => setCurrentItem(p => ({...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')}))} className="admin-input" placeholder="my-post-url" />
                                <p className="mt-1 text-xs text-gray-500">Lower-case, hyphenated. Used in the post's URL.</p>
                            </div>
                            <div>
                                <label className="admin-label">Meta Title</label>
                                <input type="text" value={currentItem?.metaTitle || ''} onChange={e => setCurrentItem(p => ({...p, metaTitle: e.target.value}))} className="admin-input" placeholder="50–60 chars. Leave blank to reuse title." maxLength={70} />
                            </div>
                            <div>
                                <label className="admin-label">Meta Description</label>
                                <textarea rows={2} value={currentItem?.metaDescription || ''} onChange={e => setCurrentItem(p => ({...p, metaDescription: e.target.value}))} className="admin-textarea" placeholder="150–160 chars. Leave blank to reuse excerpt." maxLength={180} />
                            </div>
                            <div>
                                <label className="admin-label">Meta Keywords</label>
                                <input type="text" value={currentItem?.metaKeywords || ''} onChange={e => setCurrentItem(p => ({...p, metaKeywords: e.target.value}))} className="admin-input" placeholder="design, ui ux, performance marketing" />
                            </div>
                            <div>
                                <label className="admin-label">OG Image URL</label>
                                <input type="text" value={currentItem?.ogImage || ''} onChange={e => setCurrentItem(p => ({...p, ogImage: e.target.value}))} className="admin-input" placeholder="/images/og/... (1200×630 recommended)" />
                            </div>
                            <div>
                                <label className="admin-label">Canonical URL</label>
                                <input type="url" value={currentItem?.canonicalUrl || ''} onChange={e => setCurrentItem(p => ({...p, canonicalUrl: e.target.value}))} className="admin-input" placeholder="https://www.priyeshmishra.com/blog/my-post" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button onClick={() => setIsModalOpen(false)} className="admin-button-secondary">Cancel</button>
                        <button onClick={handleSave} className="admin-button-primary">Save Post</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BlogsForm;
