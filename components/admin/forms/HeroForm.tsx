import React, { useState, useEffect } from 'react';
import { RawHeroData } from '../../../types';
import { getRawHeroData, updateHeroData, convertFileToBase64 } from '../../../lib/api';
import { v4 as uuidv4 } from 'uuid';

const HeroForm: React.FC = () => {
    const [formData, setFormData] = useState<RawHeroData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getRawHeroData();
                setFormData(data);
            } catch (error) {
                console.error("Failed to fetch hero data", error);
                setMessage({ type: 'error', text: "Failed to load hero data." });
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

    const handleStatChange = (index: number, field: 'label' | 'value', value: string) => {
        if (!formData) return;
        const newStats = [...formData.stats];
        newStats[index] = { ...newStats[index], [field]: value };
        setFormData({ ...formData, stats: newStats });
    };

    const addStat = () => {
        if (!formData) return;
        const newStats = [...formData.stats, { id: uuidv4(), label: '', value: '' }];
        setFormData({ ...formData, stats: newStats });
    };

    const removeStat = (index: number) => {
        if (!formData) return;
        const newStats = formData.stats.filter((_, i) => i !== index);
        setFormData({ ...formData, stats: newStats });
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

    const removeProfileImage = () => {
        if (!formData) return;
        setFormData({ ...formData, profileImage: { ...formData.profileImage, url: '' } });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && formData) {
            const file = e.target.files[0];
            try {
                const base64 = await convertFileToBase64(file);
                setFormData({
                    ...formData,
                    profileImage: { ...formData.profileImage, url: base64 }
                });
            } catch (error) {
                console.error("Image conversion error:", error);
                setMessage({ type: 'error', text: "Failed to process image file." });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        setSaving(true);
        setMessage(null);
        try {
            await updateHeroData(formData);
            setMessage({ type: 'success', text: "Hero section data saved successfully!" });
        } catch (error) {
            setMessage({ type: 'error', text: "An error occurred while saving." });
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!formData) return <div className="text-red-500">Could not load hero data.</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-gray-800">
            {/* Profile Image */}
            <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Profile Image</h3>
                <div className="flex items-center gap-6">
                    <img src={formData.profileImage.url} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-300" />
                    <div>
                        <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">Upload New Image</label>
                        <input type="file" id="profileImage" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-brand-purple hover:file:bg-violet-100"/>
                        <p className="text-xs text-gray-500 mt-2">Recommended size: 400x400 pixels.</p>
                        {formData.profileImage.url && (
                            <button type="button" onClick={removeProfileImage} className="mt-2 text-sm text-red-600 hover:underline">Remove Image</button>
                        )}
                    </div>
                </div>
            </div>

            {/* General Info */}
            <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title / Tagline</label>
                        <input type="text" name="title" id="title" value={formData.title || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                    </div>
                </div>
                <div className="mt-4">
                    <label htmlFor="shortBio" className="block text-sm font-medium text-gray-700">Short Bio</label>
                    <textarea name="shortBio" id="shortBio" rows={3} value={formData.shortBio || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"></textarea>
                </div>
                 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="ctaButtonText" className="block text-sm font-medium text-gray-700">CTA Button Text</label>
                        <input type="text" name="ctaButtonText" id="ctaButtonText" value={formData.ctaButtonText || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="ctaButtonLink" className="block text-sm font-medium text-gray-700">CTA Button Link</label>
                        <input type="text" name="ctaButtonLink" id="ctaButtonLink" value={formData.ctaButtonLink || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="p-4 border rounded-lg">
                 <h3 className="text-lg font-medium mb-4">Stats</h3>
                 <div className="space-y-3">
                    {formData.stats?.map((stat, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <div className="grid grid-cols-2 gap-4 flex-1">
                                 <input type="text" value={stat.label} onChange={e => handleStatChange(index, 'label', e.target.value)} placeholder="Label (e.g., Projects)" className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                                 <input type="text" value={stat.value} onChange={e => handleStatChange(index, 'value', e.target.value)} placeholder="Value (e.g., 50+)" className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                            </div>
                            <button type="button" onClick={() => removeStat(index)} className="text-red-600 hover:text-red-800 px-2 py-1">Remove</button>
                        </div>
                    ))}
                 </div>
                 <button type="button" onClick={addStat} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Add Stat</button>
            </div>

            {/* Social Links */}
             <div className="p-4 border rounded-lg">
                 <h3 className="text-lg font-medium mb-4">Social Links (Icon name must match component, e.g., GitHubIcon)</h3>
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
                    {saving ? 'Saving...' : 'Save Hero Section'}
                </button>
            </div>
        </form>
    );
};

export default HeroForm;