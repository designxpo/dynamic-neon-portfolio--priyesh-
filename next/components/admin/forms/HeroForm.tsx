// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { RawHeroData } from '@/types';
import { getRawHeroData, updateHeroData, convertFileToBase64 } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';
import { Upload, X, Plus, Trash2, User, Briefcase, Link, AlertCircle, CheckCircle } from 'lucide-react';
import Loader from '@/components/Loader';

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
                setMessage({ type: 'error', text: "Failed to process image file." });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) {
            setMessage({ type: 'error', text: "No data to save." });
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            await updateHeroData(formData);
            setMessage({ type: 'success', text: "Hero section data saved successfully!" });
        } catch (error) {
            setMessage({ type: 'error', text: "An error occurred while saving." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <Loader label="Loading hero data…" />
        </div>
    );
    
    if (!formData) return (
        <div className="admin-card">
            <div className="flex items-center gap-3 text-red-400">
                <AlertCircle size={20} />
                <span>Could not load hero data.</span>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div className={`admin-card flex items-center gap-3 ${
                    message.type === 'success' 
                        ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="admin-card">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <User size={20} className="text-electric-blue" />
                    Profile Image
                </h3>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative group">
                        <img 
                            src={formData.profileImage.url} 
                            alt="Profile Preview" 
                            className="w-32 h-32 rounded-full object-cover border-2 border-white/20"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload size={24} className="text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="admin-label">Upload New Image</label>
                        <label className="admin-button-secondary flex items-center gap-2 cursor-pointer w-fit">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                                className="hidden"
                            />
                            <Upload size={18} />
                            Choose Image
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Recommended size: 400x400 pixels</p>
                        {formData.profileImage.url && (
                            <button 
                                type="button" 
                                onClick={removeProfileImage} 
                                className="admin-button-danger mt-3 flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Remove Image
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Briefcase size={20} className="text-electric-blue" />
                    General Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="admin-label">Full Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            id="name" 
                            value={formData.name || ''} 
                            onChange={handleChange} 
                            className="admin-input"
                            placeholder="Enter your full name"
                        />
                    </div>
                    <div>
                        <label htmlFor="title" className="admin-label">Job Title / Tagline</label>
                        <input 
                            type="text" 
                            name="title" 
                            id="title" 
                            value={formData.title || ''} 
                            onChange={handleChange} 
                            className="admin-input"
                            placeholder="e.g., Full Stack Developer"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="shortBio" className="admin-label">Short Bio / Description</label>
                        <textarea
                            name="shortBio"
                            id="shortBio"
                            rows={4}
                            value={formData.shortBio || ''}
                            onChange={handleChange}
                            className="admin-textarea"
                            placeholder="A concise overview that appears in the hero section"
                        />
                    </div>
                    <div>
                        <label htmlFor="ctaButtonText" className="admin-label">CTA Button Text</label>
                        <input
                            type="text"
                            name="ctaButtonText"
                            id="ctaButtonText"
                            value={formData.ctaButtonText || ''}
                            onChange={handleChange}
                            className="admin-input"
                            placeholder="e.g., Get In Touch"
                        />
                    </div>
                    <div>
                        <label htmlFor="ctaButtonLink" className="admin-label flex items-center gap-2">
                            <Link size={14} />
                            CTA Button Link
                        </label>
                        <input 
                            type="text" 
                            name="ctaButtonLink" 
                            id="ctaButtonLink" 
                            value={formData.ctaButtonLink || ''} 
                            onChange={handleChange} 
                            className="admin-input"
                            placeholder="e.g., #contact"
                        />
                    </div>
                    <div>
                        <label htmlFor="secondaryCtaText" className="admin-label">Secondary Button Text</label>
                        <input
                            type="text"
                            name="secondaryCtaText"
                            id="secondaryCtaText"
                            value={formData.secondaryCtaText || ''}
                            onChange={handleChange}
                            className="admin-input"
                            placeholder="e.g., View My Work"
                        />
                    </div>
                    <div>
                        <label htmlFor="secondaryCtaLink" className="admin-label flex items-center gap-2">
                            <Link size={14} />
                            Secondary Button Link
                        </label>
                        <input 
                            type="text" 
                            name="secondaryCtaLink" 
                            id="secondaryCtaLink" 
                            value={formData.secondaryCtaLink || ''} 
                            onChange={handleChange} 
                            className="admin-input"
                            placeholder="e.g., #works"
                        />
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <h3 className="text-xl font-semibold text-white mb-6">Stats & Achievements</h3>
                <div className="space-y-4">
                    {formData.stats?.map((stat, index) => (
                        <div key={index} className="flex items-center gap-4 admin-card bg-white/3">
                            <div className="grid grid-cols-2 gap-4 flex-1">
                                <input 
                                    type="text" 
                                    value={stat.label} 
                                    onChange={e => handleStatChange(index, 'label', e.target.value)} 
                                    placeholder="Label (e.g., Projects)" 
                                    className="admin-input"
                                />
                                <input 
                                    type="text" 
                                    value={stat.value} 
                                    onChange={e => handleStatChange(index, 'value', e.target.value)} 
                                    placeholder="Value (e.g., 50+)" 
                                    className="admin-input"
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={() => removeStat(index)} 
                                className="admin-button-danger"
                                title="Remove stat"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
                <button 
                    type="button" 
                    onClick={addStat} 
                    className="admin-button-secondary mt-4 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Stat
                </button>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
                <button 
                    type="submit" 
                    disabled={saving} 
                    className="admin-button-primary"
                >
                    {saving ? 'Saving...' : 'Save Hero Section'}
                </button>
            </div>
        </form>
    );
};

export default HeroForm;
