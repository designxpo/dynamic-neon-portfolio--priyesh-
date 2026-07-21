// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { RawHeroData } from '@/types';
import { getRawHeroData, updateHeroData, convertFileToBase64 } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';
import { Upload, Plus, Trash2 } from 'lucide-react';
import Loader from '@/components/Loader';

const HeroForm: React.FC = () => {
    const defaultHero: RawHeroData = {
        name: '',
        titlePrefix: '',
        titleWords: ['Designer', 'Developer'],
        titlePairs: [
            { prefix: 'UI/UX', word: 'Designer' },
            { prefix: 'Web', word: 'Developer' },
        ],
        shortBio: '',
        profileImage: { url: '', alternativeText: '' },
        ctaButtonText: '',
        ctaButtonLink: '',
        secondaryCtaText: '',
        secondaryCtaLink: '',
        stats: [{ id: '', label: '', value: '' }],
    };
    const [formData, setFormData] = useState<RawHeroData>(defaultHero);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getRawHeroData()
            .then((data) => setFormData(data))
            .catch(() => setMessage({ type: 'error', text: 'Failed to fetch hero data.' }))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTitleWordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            titleWords: value.split(',').map((w) => w.trim()).filter((w) => w),
        }));
    };

    const handlePairChange = (index: number, key: 'prefix' | 'word', value: string) => {
        setFormData((prev) => {
            const pairs = Array.isArray(prev.titlePairs) ? [...prev.titlePairs] : [];
            pairs[index] = { ...(pairs[index] || { prefix: '', word: '' }), [key]: value };
            return { ...prev, titlePairs: pairs };
        });
    };

    const addPair = () => {
        setFormData((prev) => ({
            ...prev,
            titlePairs: [...(Array.isArray(prev.titlePairs) ? prev.titlePairs : []), { prefix: '', word: '' }],
        }));
    };

    const removePair = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            titlePairs: (Array.isArray(prev.titlePairs) ? prev.titlePairs : []).filter((_, i) => i !== index),
        }));
    };

    const movePair = (index: number, dir: -1 | 1) => {
        setFormData((prev) => {
            const pairs = Array.isArray(prev.titlePairs) ? [...prev.titlePairs] : [];
            const target = index + dir;
            if (target < 0 || target >= pairs.length) return prev;
            [pairs[index], pairs[target]] = [pairs[target], pairs[index]];
            return { ...prev, titlePairs: pairs };
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await convertFileToBase64(file);
            setFormData((prev) => ({ ...prev, profileImage: { url, alternativeText: file.name } }));
        } finally {
            setUploading(false);
        }
    };

    const removeProfileImage = () => {
        setFormData((prev) => ({ ...prev, profileImage: { url: '', alternativeText: '' } }));
    };

    const handleStatChange = (index: number, key: 'label' | 'value', value: string) => {
        setFormData((prev) => {
            const stats = [...prev.stats];
            stats[index][key] = value;
            return { ...prev, stats };
        });
    };

    const addStat = () => {
        setFormData((prev) => ({
            ...prev,
            stats: [...prev.stats, { id: uuidv4(), label: '', value: '' }],
        }));
    };

    const removeStat = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            stats: prev.stats.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateHeroData(formData);
            setMessage({ type: 'success', text: 'Hero section updated successfully.' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to save hero section.' });
        }
        setSaving(false);
    };

    if (loading || !formData) return <Loader />;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div className={`admin-card flex items-center gap-3 ${
                    message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : message.type === 'warning'
                        ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                    <span>{message.text}</span>
                </div>
            )}
            {/* Profile image upload and preview section */}
            <div className="admin-card flex gap-6 items-center">
                <div className="relative group">
                    {formData.profileImage?.url ? (
                    <Image
                        src={formData.profileImage.url}
                        alt="Profile Preview"
                        width={128}
                        height={128}
                        className="w-32 h-32 rounded-full object-cover border-2 border-white/20"
                    />
                    ) : (
                    <div className="w-32 h-32 rounded-full border-2 border-white/20 bg-white/5" />
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload size={24} className="text-white" />
                    </div>
                </div>
                <div className="flex-1">
                    <label className="admin-label">Upload New Image</label>
                    <label className={`admin-button-secondary flex items-center gap-2 cursor-pointer w-fit ${uploading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading || saving}
                        />
                        <Upload size={18} />
                        {uploading ? 'Processing...' : 'Choose Image'}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                        Recommended size: 400x400 pixels. Large images will be compressed automatically.
                    </p>
                    {formData.profileImage.url && (
                        <button
                            type="button"
                            onClick={removeProfileImage}
                            className="admin-button-danger mt-3 flex items-center gap-2"
                            disabled={uploading || saving}
                        >
                            <Trash2 size={16} />
                            Remove Image
                        </button>
                    )}
                </div>
            </div>
            {/* General Information section */}
            <div className="admin-card">
                <label htmlFor="name" className="admin-label">Full Name</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    autoComplete="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="admin-input"
                    placeholder="Enter your full name"
                />
            </div>
            <div className="admin-card">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                        <label className="admin-label">Title Animation Pairs</label>
                        <p className="text-xs text-gray-500 mt-1">
                            Each pair shows as <span className="text-gray-300">Prefix</span> + animated <span className="text-gray-300">Word</span>.
                            Pairs cycle in order — the prefix swaps each time the word finishes.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addPair}
                        className="admin-button-secondary flex items-center gap-2 shrink-0"
                    >
                        <Plus size={16} /> Add pair
                    </button>
                </div>

                <div className="space-y-3">
                    {(Array.isArray(formData.titlePairs) ? formData.titlePairs : []).map((pair, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end p-3 rounded-lg border border-white/10 bg-white/5"
                        >
                            <div>
                                <label className="admin-label text-xs">Prefix #{index + 1}</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    value={pair.prefix || ''}
                                    onChange={(e) => handlePairChange(index, 'prefix', e.target.value)}
                                    className="admin-input"
                                    placeholder="e.g., UI/UX"
                                />
                            </div>
                            <div>
                                <label className="admin-label text-xs">Animated word</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    value={pair.word || ''}
                                    onChange={(e) => handlePairChange(index, 'word', e.target.value)}
                                    className="admin-input"
                                    placeholder="e.g., Designer"
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => movePair(index, -1)}
                                    disabled={index === 0}
                                    className="admin-button-secondary px-2.5 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label="Move up"
                                    title="Move up"
                                >↑</button>
                                <button
                                    type="button"
                                    onClick={() => movePair(index, 1)}
                                    disabled={index === (formData.titlePairs?.length || 0) - 1}
                                    className="admin-button-secondary px-2.5 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label="Move down"
                                    title="Move down"
                                >↓</button>
                                <button
                                    type="button"
                                    onClick={() => removePair(index)}
                                    className="admin-button-danger px-2.5 py-2"
                                    aria-label="Remove pair"
                                    title="Remove pair"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {(!Array.isArray(formData.titlePairs) || formData.titlePairs.length === 0) && (
                        <p className="text-xs text-gray-500 italic">
                            No pairs yet — add at least one. The legacy single-prefix + words below will be used as a fallback.
                        </p>
                    )}
                </div>
            </div>

            {/* Legacy single-prefix + comma-separated words. Kept as a fallback
                when no pairs are defined, so existing data keeps working. */}
            <details className="admin-card">
                <summary className="cursor-pointer text-sm text-gray-300 select-none">
                    Legacy fallback (used only when no pairs are set)
                </summary>
                <div className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="titlePrefix" className="admin-label">Title Prefix (static part)</label>
                        <input
                            type="text"
                            name="titlePrefix"
                            id="titlePrefix"
                            autoComplete="off"
                            value={formData.titlePrefix || ''}
                            onChange={handleChange}
                            className="admin-input"
                            placeholder="e.g., UI/UX"
                        />
                    </div>
                    <div>
                        <label htmlFor="titleWords" className="admin-label">Typing Animation Words (comma separated)</label>
                        <input
                            type="text"
                            name="titleWords"
                            id="titleWords"
                            autoComplete="off"
                            value={Array.isArray(formData.titleWords) ? formData.titleWords.join(', ') : ''}
                            onChange={handleTitleWordsChange}
                            className="admin-input"
                            placeholder="e.g., Designer, Developer"
                        />
                    </div>
                </div>
            </details>
            <div className="admin-card">
                <label htmlFor="shortBio" className="admin-label">Short Bio / Description</label>
                <textarea
                    name="shortBio"
                    id="shortBio"
                    autoComplete="off"
                    rows={4}
                    value={formData.shortBio || ''}
                    onChange={handleChange}
                    className="admin-textarea"
                    placeholder="A concise overview that appears in the hero section"
                />
            </div>
            <div className="admin-card">
                <label htmlFor="ctaButtonText" className="admin-label">CTA Button Text</label>
                <input
                    type="text"
                    name="ctaButtonText"
                    id="ctaButtonText"
                    autoComplete="off"
                    value={formData.ctaButtonText || ''}
                    onChange={handleChange}
                    className="admin-input"
                    placeholder="e.g., Get In Touch"
                />
            </div>
            <div className="admin-card">
                <label htmlFor="ctaButtonLink" className="admin-label">CTA Button Link</label>
                <input
                    type="text"
                    name="ctaButtonLink"
                    id="ctaButtonLink"
                    autoComplete="off"
                    value={formData.ctaButtonLink || ''}
                    onChange={handleChange}
                    className="admin-input"
                    placeholder="e.g., #contact"
                />
            </div>
            <div className="admin-card">
                <label htmlFor="secondaryCtaText" className="admin-label">Secondary Button Text</label>
                <input
                    type="text"
                    name="secondaryCtaText"
                    id="secondaryCtaText"
                    autoComplete="off"
                    value={formData.secondaryCtaText || ''}
                    onChange={handleChange}
                    className="admin-input"
                    placeholder="e.g., View My Work"
                />
            </div>
            <div className="admin-card">
                <label htmlFor="secondaryCtaLink" className="admin-label">Secondary Button Link</label>
                <input
                    type="text"
                    name="secondaryCtaLink"
                    id="secondaryCtaLink"
                    autoComplete="off"
                    value={formData.secondaryCtaLink || ''}
                    onChange={handleChange}
                    className="admin-input"
                    placeholder="e.g., #works"
                />
            </div>
            {/* Stats & Achievements section */}
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
            {/* Save button */}
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
