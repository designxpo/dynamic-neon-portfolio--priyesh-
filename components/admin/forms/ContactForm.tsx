import React, { useState, useEffect } from 'react';
import { RawContactData } from '../../../types';
import { getRawContactData, updateContactData } from '../../../lib/api';
import { v4 as uuidv4 } from 'uuid';
import { Mail, Phone, Link as LinkIcon, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

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
        console.log('Adding social link to contact, current links:', formData.socialLinks);
        const newLink = { id: uuidv4(), platform: '', url: '', icon: '' };
        const newLinks = [...(formData.socialLinks || []), newLink];
        console.log('New links array:', newLinks);
        setFormData({ ...formData, socialLinks: newLinks });
    };

    const removeSocialLink = (index: number) => {
        if (!formData) return;
        console.log('Removing social link at index:', index);
        const newLinks = formData.socialLinks.filter((_, i) => i !== index);
        setFormData({ ...formData, socialLinks: newLinks });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Contact form submitted');
        
        if (!formData) {
            console.error('No formData available');
            setMessage({ type: 'error', text: "No data to save." });
            return;
        }

        console.log('Submitting contact data:', formData);
        setSaving(true);
        setMessage(null);
        
        try {
            await updateContactData(formData);
            console.log('Contact update successful');
            setMessage({ type: 'success', text: "Contact information saved successfully!" });
        } catch (error) {
            console.error('Contact save error:', error);
            setMessage({ type: 'error', text: "An error occurred while saving. Check console for details." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading...</div>
        </div>
    );

    if (!formData) return (
        <div className="flex items-center gap-2 text-red-400 justify-center py-12">
            <AlertCircle size={20} />
            <span>Could not load contact data.</span>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-2xl font-bold text-white">Contact Information</h3>
                <p className="text-gray-400 text-sm mt-1">Manage your contact details and social links</p>
            </div>

            {/* General Info Card */}
            <div className="admin-card">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Mail size={20} className="text-electric-blue" />
                    Contact Section Details
                </h4>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="heading" className="admin-label">Heading</label>
                        <input 
                            type="text" 
                            name="heading" 
                            id="heading" 
                            value={formData.heading || ''} 
                            onChange={handleChange} 
                            className="admin-input"
                            placeholder="Get In Touch"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="admin-label">Description</label>
                        <textarea 
                            name="description" 
                            id="description" 
                            rows={3} 
                            value={formData.description || ''} 
                            onChange={handleChange} 
                            className="admin-textarea"
                            placeholder="Contact section description..."
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="email" className="admin-label flex items-center gap-2">
                                <Mail size={16} />
                                Email Address
                            </label>
                            <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                value={formData.email || ''} 
                                onChange={handleChange} 
                                className="admin-input"
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="admin-label flex items-center gap-2">
                                <Phone size={16} />
                                Phone Number
                            </label>
                            <input 
                                type="tel" 
                                name="phone" 
                                id="phone" 
                                value={formData.phone || ''} 
                                onChange={handleChange} 
                                className="admin-input"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Links Card */}
            <div className="admin-card">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <LinkIcon size={20} className="text-electric-blue" />
                    Social Links
                </h4>
                <div className="space-y-4">
                    {formData.socialLinks?.map((link, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                <input 
                                    type="text" 
                                    value={link.platform} 
                                    onChange={e => handleSocialLinkChange(index, 'platform', e.target.value)} 
                                    placeholder="Platform (e.g., GitHub)" 
                                    className="admin-input"
                                />
                                <input 
                                    type="url" 
                                    value={link.url} 
                                    onChange={e => handleSocialLinkChange(index, 'url', e.target.value)} 
                                    placeholder="https://..." 
                                    className="admin-input"
                                />
                                <input 
                                    type="text" 
                                    value={link.icon} 
                                    onChange={e => handleSocialLinkChange(index, 'icon', e.target.value)} 
                                    placeholder="Icon Name" 
                                    className="admin-input"
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={() => removeSocialLink(index)} 
                                className="admin-button-danger flex-shrink-0"
                                title="Remove"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
                <button 
                    type="button" 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addSocialLink();
                    }} 
                    className="admin-button-secondary mt-4 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Social Link
                </button>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`flex items-center gap-3 p-4 rounded-lg backdrop-blur-xl border ${
                    message.type === 'success' 
                        ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-white/10">
                <button 
                    type="submit" 
                    disabled={saving} 
                    className="admin-button-primary"
                >
                    {saving ? 'Saving...' : 'Save Contact Info'}
                </button>
            </div>
        </form>
    );
};

export default ContactForm;