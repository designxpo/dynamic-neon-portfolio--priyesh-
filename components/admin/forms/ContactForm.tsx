import React, { useState, useEffect } from 'react';
import { RawContactData } from '../../../types';
import { getRawContactData, updateContactData } from '../../../lib/api';
import { v4 as uuidv4 } from 'uuid';

const ContactForm: React.FC = () => {
    const [formData, setFormData] = useState<RawContactData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getRawContactData();
                setFormData(data);
            } catch (error) {
                console.error("Failed to fetch contact data", error);
                setMessage({ type: 'error', text: "Failed to load contact data." });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSocialLinkChange = (index: number, field: 'platform' | 'url' | 'icon', value: string) => {
        if (!formData) return;
        const newLinks = [...formData.socialLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFormData({ ...formData, socialLinks: newLinks });
    };

    const addSocialLink = () => {
        if (!formData) return;
        const newLinks = [...formData.socialLinks, { id: uuidv4(), platform: '', url: '', icon: '' }];
        setFormData({ ...formData, socialLinks: newLinks });
    };

    const removeSocialLink = (index: number) => {
        if (!formData) return;
        const newLinks = formData.socialLinks.filter((_, i) => i !== index);
        setFormData({ ...formData, socialLinks: newLinks });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        setSaving(true);
        setMessage(null);
        try {
            await updateContactData(formData);
            setMessage({ type: 'success', text: "Contact information saved successfully!" });
        } catch (error) {
            setMessage({ type: 'error', text: "An error occurred while saving." });
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!formData) return <div className="text-red-500">Could not load contact data.</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-gray-800">
            {/* General Info */}
            <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Contact Section Details</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="heading" className="block text-sm font-medium text-gray-700">Heading</label>
                        <input type="text" name="heading" id="heading" value={formData.heading || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" id="description" rows={3} value={formData.description || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"></textarea>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                    </div>
                     <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                    </div>
                </div>
            </div>

            {/* Social Links */}
             <div className="p-4 border rounded-lg">
                 <h3 className="text-lg font-medium mb-4">Social Links (same as Hero section)</h3>
                 <div className="space-y-3">
                    {formData.socialLinks?.map((link, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                <input type="text" value={link.platform} onChange={e => handleSocialLinkChange(index, 'platform', e.target.value)} placeholder="Platform (e.g., GitHub)" className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                                <input type="url" value={link.url} onChange={e => handleSocialLinkChange(index, 'url', e.target.value)} placeholder="URL" className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                                <input type="text" value={link.icon} onChange={e => handleSocialLinkChange(index, 'icon', e.target.value)} placeholder="Icon Name (e.g., GitHubIcon)" className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                            </div>
                            <button type="button" onClick={() => removeSocialLink(index)} className="text-red-600 hover:text-red-800 px-2 py-1">Remove</button>
                        </div>
                    ))}
                 </div>
                 <button type="button" onClick={addSocialLink} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Add Social Link</button>
            </div>

            {message && (
                <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}
            <div className="flex justify-end">
                <button type="submit" disabled={saving} className="bg-brand-purple text-white px-5 py-2 rounded-lg hover:bg-brand-purple-light transition-colors duration-300 disabled:bg-gray-400">
                    {saving ? 'Saving...' : 'Save Contact Info'}
                </button>
            </div>
        </form>
    );
};

export default ContactForm;