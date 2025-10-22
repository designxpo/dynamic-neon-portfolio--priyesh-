import React, { useState, useEffect } from 'react';
import { Blog, BlogData } from '../../../types';
import { getBlogs, addBlog, updateBlog, deleteBlog } from '../../../lib/api';
import Modal from '../common/Modal';

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
            publishedAt: new Date().toISOString().split('T')[0] // Default to today
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
        return <div>Loading blog posts...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Manage Blog Posts</h3>
                <button onClick={handleAddNew} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Add New Post
                </button>
            </div>
            <div className="space-y-3">
                {blogs.map((blog) => (
                    <div key={blog.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-md border">
                        <div>
                            <p className="font-semibold text-gray-800">{blog.title}</p>
                            <p className="text-sm text-gray-500">By {blog.author} on {new Date(blog.publishedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="space-x-2">
                           <button onClick={() => handleEdit(blog)} className="text-sm text-blue-600 hover:underline">Edit</button>
                           <button onClick={() => handleDelete(blog.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem?.id ? 'Edit Blog Post' : 'Add Blog Post'}>
                <div className="space-y-4 text-gray-800">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" value={currentItem?.title || ''} onChange={e => setCurrentItem(p => ({...p, title: e.target.value}))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Author</label>
                        <input type="text" value={currentItem?.author || ''} onChange={e => setCurrentItem(p => ({...p, author: e.target.value}))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Content</label>
                        <textarea rows={8} value={currentItem?.content || ''} onChange={e => setCurrentItem(p => ({...p, content: e.target.value}))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"></textarea>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button onClick={handleSave} className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-brand-purple-light">Save Post</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BlogsForm;