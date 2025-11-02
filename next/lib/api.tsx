// --- Education API ---
export const getEducation = async () => {
    const res = await fetch('/api/education');
    if (!res.ok) throw new Error('Failed to fetch education');
    return res.json();
};

export const addEducation = async (data) => {
    const res = await fetch('/api/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add education');
    return res.json();
};

// note: granular Education CRUD exists later in this file (createEducation/updateEducation/deleteEducation)

// --- Experience API ---
export const getExperience = async () => {
    const res = await fetch('/api/experience');
    if (!res.ok) throw new Error('Failed to fetch experience');
    return res.json();
};

export const addExperience = async (data) => {
    const res = await fetch('/api/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add experience');
    return res.json();
};

export const updateExperience = async (data) => {
    const payload: any = { ...data };
    if (!payload._id && payload.id) payload._id = payload.id;
    delete payload.id;
    const res = await fetch('/api/experience', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update experience');
    return res.json();
};

export const deleteExperience = async (_id) => {
    // Try path-based route first, then fallback to query param shape
    let resp = await fetch(`/api/experience/${encodeURIComponent(_id)}`, { method: 'DELETE' });
    if (!resp.ok) {
        resp = await fetch(`/api/experience?_id=${encodeURIComponent(_id)}`, { method: 'DELETE' });
    }
    if (!resp.ok) throw new Error('Failed to delete experience');
    return resp.json();
};
// Additional Experience helpers used by Admin forms
export const getExperiencesData = async (): Promise<Experience[]> => {
    const res = await fetch('/api/experience', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed experiences');
    const items = await res.json();
    return (items || []).map((doc: any) => ({ id: doc._id || doc.id, _id: doc._id, ...doc }));
};

export const createExperience = async (exp: Experience): Promise<Experience> => {
    const { id: _clientId, ...rest } = exp as any;
    const res = await fetch('/api/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rest)
    });
    if (!res.ok) throw new Error('Failed to create experience');
    return res.json();
};
export async function getTestimonialsData() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/testimonials`, {
            cache: 'no-store',
            next: { revalidate: 0 }
        });

        if (!res.ok) {
            console.error('❌ Failed to fetch testimonials:', res.statusText);
            return [];
        }

        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
            return data.data;
        } else {
            console.warn('⚠ Unexpected testimonials response:', data);
            return [];
        }
    } catch (error) {
        console.error('❌ Error in getTestimonialsData():', error);
        return [];
    }
}
// @ts-nocheck
import React from 'react';
// Mongo-backed API client helpers for client components to call Next API routes
import * as Icons from '@/components/icons/Icons';
import {
    HeroData, RawHeroData, Service, RawService, Skill, RawSkill, SocialLink,
    Project, RawProject, Testimonial, RawTestimonial, ContactData, RawContactData,
    Blog, BlogData, Education, Experience, SEOConfig, SectionKey, SeoMeta, Stat,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
// Local offline DB helpers (used as fallback when API is unavailable)
import { getDb, saveDb, setAdminPassword as setAdminPasswordLocal } from '@/lib/db';
import { setOfflineMode, isOfflineMode } from '@/lib/offline';
import { convertFileToOptimizedBase64, storeImageSafely } from '@/lib/imageStorage';

// Fallback mock data for when API is unavailable (e.g., Mongo not configured in dev)
import {
    mockHeroData,
    mockServicesData,
    mockProjectsData,
    mockExperiencesData,
    mockEducationsData,
    mockSkillsData,
    mockContactData,
} from '@/data/mockData';
import type { ChatbotSettings, RawSocialLink, SiteMetadata } from '@/types';

// Timeout wrapper with increased timeout for MongoDB Atlas operations
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
};

const withFallback = async <T,>(fn: () => Promise<T>, fallback: () => T): Promise<T> => {
    // If we've already detected offline mode, skip server attempts to avoid log spam
    try {
        if (isOfflineMode()) {
            return fallback();
        }
    } catch {}
    try {
        const value = await fn();
        // Mark as online as the server responded successfully
        setOfflineMode(false);
        // If API returns null/undefined, use fallback but keep online state
        return (value === undefined || value === null) ? fallback() : value;
    } catch (e) {
        // Mark as offline and use fallback
        try { setOfflineMode(true); } catch {}
        return fallback();
    }
};

// Helper to attempt server first, fallback to local storage logic
const serverOrLocal = async (serverFn: () => Promise<any>, localFn: () => any): Promise<any> => {
    try {
        const result = await serverFn();
        try { setOfflineMode(false); } catch {}
        return result;
    } catch (e) {
        console.warn('[serverOrLocal] Server failed, using local fallback:', e);
        try { setOfflineMode(true); } catch {}
        return await localFn();
    }
};

// Helper to convert a file to a base64 string with compression and storage optimization
export const convertFileToBase64 = async (file: File): Promise<string> => {
    try {
        // Prefer optimized conversion for large images
        const compressedDataUrl = await convertFileToOptimizedBase64(file);
        // Best-effort localStorage caching (non-blocking)
        try {
            const storageKey = `temp_image_${Date.now()}`;
            const stored = storeImageSafely(storageKey, compressedDataUrl);
            if (!stored) {
                // Not fatal; continue using the data URL for this session
                console.warn('Image could not be stored in localStorage due to size limits; using in-session only');
            }
        } catch (err) {
            // Swallow storage issues; conversion still succeeded
            console.debug('localStorage store skipped:', err);
        }
        return compressedDataUrl;
    } catch (error) {
        console.error('Error processing image, falling back to plain FileReader:', error);
        // Fallback to plain base64 conversion if optimization fails
        return new Promise<string>((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (e) => reject(e);
                reader.readAsDataURL(file);
            } catch (err) {
                reject(err);
            }
        });
    }
};

// Helper function to get an icon component by its string name
export const getIcon = (iconName: string): React.ReactNode => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent /> : null;
};

// --- Data Transformation Functions ---
// Cast to align ReactNode types across module boundaries in Next monorepo context
const toSocialLink = (raw: RawSocialLink): SocialLink => ({ ...raw, icon: getIcon(raw.icon) as unknown as React.ReactNode });
const toService = (raw: RawService): Service => ({ ...raw, icon: getIcon(raw.icon) as unknown as React.ReactNode });
const toSkill = (raw: any): Skill => ({
    id: raw.id || raw._id || '',
    name: raw.name,
    icon: raw.icon,
    image: raw.image || { url: '', alternativeText: '' },
});

// Stat transformation helper
const toStat = (raw: any): Stat => ({
    id: raw.id || raw._id || '',
    label: raw.label || '',
    value: raw.value || ''
});
const toHeroData = (raw: RawHeroData): HeroData => ({
    name: raw.name || '',
    title: raw.title || '',
    shortBio: raw.shortBio || '',
    profileImage: {
        url: raw.profileImage?.url || '',
        alternativeText: raw.profileImage?.alternativeText || '',
    },
    ctaButtonText: raw.ctaButtonText || '',
    ctaButtonLink: raw.ctaButtonLink || '',
    secondaryCtaText: raw.secondaryCtaText || '',
    secondaryCtaLink: raw.secondaryCtaLink || '',
    stats: Array.isArray(raw.stats) ? raw.stats.map(toStat) : [],
    // Typing animation fields
    titlePrefix: raw.titlePrefix || '',
    titleWords: Array.isArray(raw.titleWords) ? raw.titleWords : [],
});
const toContactData = (raw: RawContactData): ContactData => ({ ...raw, socialLinks: (raw.socialLinks || []).map(toSocialLink) });
const toProject = (raw: RawProject): Project => ({
    ...raw,
    id: raw.id || '',
});
const toTestimonial = (raw: RawTestimonial): Testimonial => ({
    ...raw,
    avatar: raw?.avatar ?? {
        url: `https://i.pravatar.cc/150?u=${encodeURIComponent((raw?.clientName || 'client').replace(/\s/g, ''))}`,
        alternativeText: raw?.clientName || 'Client Avatar',
    },
});

const getIconName = (iconNode: React.ReactNode): string => {
    if (typeof iconNode === 'string') return iconNode;
    if (React.isValidElement(iconNode) && (iconNode.type as any).name) {
        return (iconNode.type as any).name;
    }
    return '';
};


// --- API Functions ---

// Hero
export const getRawHeroData = async (): Promise<RawHeroData> => {
    const res = await fetch('/api/hero', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed hero');
    return res.json();
};
export const getHeroData = async (): Promise<HeroData> => toHeroData(await getRawHeroData());
export const updateHeroData = async (data: RawHeroData): Promise<void> => {
    const res = await fetch('/api/hero', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to update hero');
};

// Services
export const getServicesData = async (): Promise<Service[]> => {
    const res = await withTimeout(fetch('/api/admin/services', { cache: 'no-store' }));
    if (!res.ok) throw new Error('Failed services');
    const raw = await res.json();
    return (raw || []).map(toService).sort((a,b)=>a.order-b.order);
}
export const updateServices = async (services: (Service | RawService)[]): Promise<void> => {
    const payload = services.map(s => ({ ...s, icon: getIconName((s as any).icon) }));
    await serverOrLocal(
        () => withTimeout(fetch('/api/admin/services', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })),
        () => {
            const db = getDb();
            db.services = payload as any;
            saveDb(db);
        }
    );
};

// Projects
export const getProjectsData = async (): Promise<Project[]> => {
    // Use internal Next.js API route to avoid relying on an external port/server
    const res = await withTimeout(fetch('/api/projects', { cache: 'no-store' }));
    if (!res.ok) throw new Error('Failed projects');
    const raw = await res.json();
    return (raw || []).map(toProject);
}
export const getProjectById = async (id: string): Promise<Project | undefined> => {
    const projects = await getProjectsData();
    return Promise.resolve(projects.find(p => p.id === id));
};
export const updateProjects = async (projects: RawProject[]): Promise<void> => {
    await serverOrLocal(
        () => withTimeout(fetch('/api/projects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(projects) })),
        () => {
            const db = getDb();
            db.projects = projects as any;
            saveDb(db);
        }
    );
};

export const getExperienceById = async (id: string): Promise<Experience> => {
    const res = await fetch(`/api/experience?id=${id}`);
    if (!res.ok) throw new Error('Failed to fetch experience');
    return res.json();
};

// Education
export const getEducationsData = async (): Promise<Education[]> => {
    const res = await withTimeout(fetch('/api/education', { cache: 'no-store' }));
    if (!res.ok) throw new Error('Failed educations');
    const items = await res.json();
    return (items || []).map((doc: any) => ({ id: doc._id || doc.id, _id: doc._id, ...doc }));
};

export const updateEducations = async (educations: Education[]): Promise<void> => {
    await serverOrLocal(
        () => withTimeout(fetch('/api/admin/educations', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(educations) })),
        () => {
            const db = getDb();
            db.educations = educations as any;
            saveDb(db);
        }
    );
};

// Granular Education CRUD
export const createEducation = async (edu: Education): Promise<Education> => {
    const { id: _clientId, ...rest } = edu as any;
    const res = await fetch('/api/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rest)
    });
    if (!res.ok) throw new Error('Failed to create education');
    return res.json();
};

export const updateEducation = async (edu: Education): Promise<Education> => {
    const payload: any = { ...edu };
    if (!payload._id && payload.id) payload._id = payload.id;
    delete payload.id;
    const res = await fetch('/api/education', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update education');
    return res.json();
};


export const deleteEducation = async (id: string): Promise<void> => {
    const res = await fetch(`/api/education?_id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete education');
};
export const getEducationById = async (id: string): Promise<Education> => {
    const res = await fetch(`/api/education?id=${id}`);
    if (!res.ok) throw new Error('Failed to fetch education');
    return res.json();
};

// Skills
export const getSkillsData = async (): Promise<Skill[]> => {
    try {
        const res = await withTimeout(fetch('/api/skills', { cache: 'no-store' }));
        if (!res.ok) return [];
        const raw = await res.json();
        return (raw || []).map(toSkill);
    } catch {
        return [];
    }
};
export const updateSkills = async (skills: RawSkill[]): Promise<void> => {
    await serverOrLocal(
        () => withTimeout(fetch('/api/skills', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(skills) })),
        () => {
            const db = getDb();
            db.skills = skills as any;
            saveDb(db);
        }
    );
};

// Testimonials
export async function fetchTestimonials(): Promise<Testimonial[]> {
    try {
        const response = await fetch('/api/admin/testimonials', { cache: 'no-store' });
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error('Failed to fetch testimonials:', error);
        return [];
    }
}

// Contact
export const getRawContactData = async (): Promise<RawContactData> => {
    const res = await fetch('/api/contactInfo', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed contact');
    // API returns { success, data }
    const result = await res.json();
    // If result.data is an array, return the first item or {}
    if (Array.isArray(result.data)) {
        return (result.data[0] || {}) as RawContactData;
    }
    return (result.data || {}) as RawContactData;
};
export const getContactData = async (): Promise<ContactData> => {
    try {
        const raw = await getRawContactData();
        // Ensure all required fields are present
        return toContactData({
            heading: raw?.heading || 'Let’s Connect',
            description: raw?.description || 'Fill out the form below or reach out via email/socials. I’ll get back to you soon!',
            email: raw?.email || 'hello@example.com',
            phone: raw?.phone || '+91 00000 00000',
            socialLinks: Array.isArray(raw?.socialLinks) ? raw.socialLinks : [],
            notifyUserOnSubmit: raw?.notifyUserOnSubmit ?? false,
            notifyAdminOnSubmit: raw?.notifyAdminOnSubmit ?? false,
            notifyEmail: raw?.notifyEmail || '',
        });
    } catch (error) {
        console.error('Error fetching contact data:', error);
        return toContactData({
            heading: 'Let’s Connect',
            description: 'Fill out the form below or reach out via email/socials. I’ll get back to you soon!',
            email: 'hello@example.com',
            phone: '+91 00000 00000',
            socialLinks: [],
            notifyUserOnSubmit: false,
            notifyAdminOnSubmit: false,
            notifyEmail: '',
        });
    }
};
// Ensure getContactData returns {} not null
export async function getContactDataDebug(): Promise<ContactData> {
    try {
        const res = await fetch('/api/contactInfo', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed contact');
        const result = await res.json();
    return (result.data || {}) as ContactData;
    } catch (error) {
        console.error('Error fetching contact data:', error);
    return {} as unknown as ContactData;
    }
}
export const updateContactData = async (data: RawContactData): Promise<void> => {
    if (!data._id) throw new Error('Contact info ID is required for update');
    await serverOrLocal(
        () => fetch(`/api/contactInfo/${data._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
        () => {
            const db = getDb();
            db.contact = data as any;
            saveDb(db);
        }
    );
};

// Blogs
export const getBlogs = async (): Promise<Blog[]> => {
    const res = await fetch('/api/blogs', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch blogs');
    return await res.json();
};
export const addBlog = async (blogData: BlogData): Promise<Blog> => {
    const blogs = await getBlogs();
    const newBlog: Blog = { ...blogData, id: uuidv4() };
    await serverOrLocal(
        () => fetch('/api/admin/blogs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify([...blogs, newBlog]) }),
        () => {
            const db = getDb();
            db.blogs = [...(db.blogs || []), newBlog];
            saveDb(db);
        }
    );
    return newBlog;
};
export const updateBlog = async (blog: Blog): Promise<Blog> => {
    const blogs = await getBlogs();
    const next = blogs.map(b => b.id === blog.id ? blog : b);
    await serverOrLocal(
        () => fetch('/api/admin/blogs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }),
        () => {
            const db = getDb();
            db.blogs = next as any;
            saveDb(db);
        }
    );
    return blog;
};
export const deleteBlog = async (blogId: string): Promise<void> => {
    const blogs = await getBlogs();
    const next = blogs.filter(b => b.id !== blogId);
    await serverOrLocal(
        () => fetch('/api/admin/blogs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }),
        () => {
            const db = getDb();
            db.blogs = next as any;
            saveDb(db);
        }
    );
};

// --- SEO ---
const defaultSEO = (): SEOConfig => ({
    home: {
        metaTitle: 'Priyesh Mishra — UI/UX Designer & Product Designer Portfolio',
        metaDescription: 'Explore the professional portfolio of Priyesh Mishra, a UI/UX and product designer crafting digital experiences that combine creativity, usability, and strategy.',
        metaKeywords: 'Priyesh Mishra, UI designer, UX designer, product designer, portfolio, web design, creative design, user experience'
    },
    hero: {
        metaTitle: 'Home — Hero | UI/UX Designer Priyesh Mishra',
        metaDescription: 'Welcome to the portfolio of Priyesh Mishra — UI/UX designer with a passion for building human-centered, visually engaging digital products.',
        metaKeywords: 'hero, introduction, designer headline, creative intro, design portfolio intro'
    },
    about: {
        metaTitle: 'About Priyesh Mishra — UI/UX Designer & Developer',
        metaDescription: 'Learn about Priyesh Mishra, a UI/UX designer and front-end developer dedicated to turning complex ideas into intuitive, user-focused designs.',
        metaKeywords: 'about Priyesh Mishra, designer bio, UX process, UI designer, developer, design approach'
    },
    services: {
        metaTitle: 'Design Services — UI/UX, Product Strategy & Branding by Priyesh Mishra',
        metaDescription: 'Priyesh Mishra offers design services including UI/UX design, product strategy, design systems, and branding — focused on creating usable, scalable, and visually refined experiences.',
        metaKeywords: 'UI UX services, product strategy, branding design, design systems, user experience, web design, app design, creative services'
    },
    projects: {
        metaTitle: 'Design Projects — Priyesh Mishra Portfolio',
        metaDescription: 'A showcase of design projects by Priyesh Mishra, featuring UI/UX case studies, product strategies, and visually refined web & mobile experiences.',
        metaKeywords: 'design projects, UX case studies, portfolio work, creative projects, UI design examples'
    },
    experience: {
        metaTitle: 'Professional Experience — UI/UX Design & Product Development',
        metaDescription: 'Explore Priyesh Mishra’s professional experience in UI/UX design and product development, contributing to impactful projects for global clients.',
        metaKeywords: 'UI UX experience, product design, professional journey, work history, design projects'
    },
    process: {
        metaTitle: 'My Design Process — How I Approach UI/UX Projects',
        metaDescription: 'Discover Priyesh Mishra’s complete design process — from research and ideation to visual design, prototyping, and delivery. A structured workflow for efficient product design.',
        metaKeywords: 'design process, workflow, UI UX methodology, design thinking, user research, wireframing, prototyping, product design steps'
    },
    education: {
        metaTitle: 'Education',
        metaDescription: 'Academic background and certifications.',
        metaKeywords: 'education, certifications, degrees'
    },
    skills: {
        metaTitle: 'Design Skills — UI/UX, Product Design, Frontend Development',
        metaDescription: 'Priyesh Mishra’s core skills include UI/UX design, design systems, product strategy, prototyping, and front-end development with Figma & modern frameworks.',
        metaKeywords: 'UI design, UX design, design systems, product strategy, prototyping, Figma, frontend, creative skills'
    },
    testimonials: {
        metaTitle: 'Client Feedback — What People Say About Priyesh Mishra',
        metaDescription: 'Read testimonials and client feedback for UI/UX designer Priyesh Mishra, trusted for creative direction, attention to detail, and user-focused design.',
        metaKeywords: 'testimonials, client feedback, design reviews, UI UX trust, designer testimonials'
    },
    blogs: {
        metaTitle: 'Design Insights — Articles by Priyesh Mishra',
        metaDescription: 'Explore design insights, case studies, and practical tips on UI/UX, creativity, and product design written by Priyesh Mishra.',
        metaKeywords: 'UI UX blog, design insights, UX articles, case studies, creative thinking, product design blog'
    },
    contact: {
        metaTitle: 'Contact Priyesh Mishra — Let’s Work Together',
        metaDescription: 'Get in touch with UI/UX designer and developer Priyesh Mishra to discuss projects, collaborations, or freelance opportunities.',
        metaKeywords: 'contact designer, hire UI UX designer, freelance designer, connect with Priyesh, project inquiry'
    },
});

export const getSEO = async (): Promise<SEOConfig> => {
    return withFallback(async () => {
        const res = await withTimeout(fetch('/api/seo', { cache: 'no-store' }));
        if (!res.ok) throw new Error('Failed seo');
        const seo = await res.json();
        return (seo && Object.keys(seo).length > 0) ? seo : defaultSEO();
    }, () => {
        const db = getDb();
        return db.seo ? db.seo as SEOConfig : defaultSEO();
    });
};

export const updateSectionSEO = async (section: SectionKey, meta: SeoMeta): Promise<void> => {
    const current = await getSEO();
    const merged = { ...current, [section]: meta } as SEOConfig;
    await updateSEO(merged);
};

export const updateSEO = async (seo: Partial<SEOConfig>): Promise<SEOConfig> => {
    const merged = { ...defaultSEO(), ...(await getSEO()), ...(seo as SEOConfig) } as SEOConfig;
    await serverOrLocal(
        () => withTimeout(fetch('/api/seo', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(merged) })),
        () => {
            const db = getDb();
            db.seo = merged as any;
            saveDb(db);
        }
    );
    return merged;
};

// --- Admin password ---
export const getAdminPassword = async (): Promise<string> => {
    return withFallback(async () => {
        const res = await withTimeout(fetch('/api/admin/adminPassword', { cache: 'no-store' }));
        if (!res.ok) throw new Error('Failed adminPassword');
        const val = await res.json();
        return typeof val === 'string' ? val : (val?.adminPassword ?? 'admin');
    }, () => {
        const db = getDb();
        return db.adminPassword || 'admin';
    });
};
export const setAdminPassword = async (pwd: string): Promise<void> => {
    await serverOrLocal(
        () => withTimeout(fetch('/api/admin/adminPassword', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pwd) })),
        () => {
            // use local fallback setter to ensure any ancillary logic stays consistent
            setAdminPasswordLocal(pwd);
        }
    );
};

// --- Chatbot settings ---
const defaultChatbotSettings = (): ChatbotSettings => ({
        enabled: true,
        name: 'Prism',
        initialGreeting: 'Hey there 👋 I’m Prism — Priyesh’s virtual assistant. Ask me anything about design, branding, or creative strategy.',
        bookingUrl: 'https://calendar.app.google/bTfdiZGjeXZGqbeu9',
        bookingDescription: 'A collaborative 30-minute call to understand each other’s work and creative process...',
        showBookingQuickReply: true,
        placeholders: [],
        customQA: [
            {
                enabled: true,
                matchMode: 'any',
                question: 'What services do you offer?',
                keywords: ['services','service','ui','ux','design','branding','strategy','website','app'],
                reply: 'I offer UI/UX design, product strategy, design systems, and brand experience work...'
            },
            {
                enabled: true,
                matchMode: 'any',
                question: "What’s your design process?",
                keywords: ['process','workflow','approach','steps','how you work','method','design journey'],
                reply: 'My design process typically includes:\n1️⃣ Discovery & Research...\n2️⃣ Wireframing...\n3️⃣ Visual Design...\n4️⃣ Prototyping & Testing...\n5️⃣ Delivery...'
            },
            // ...more rules with same structure
        ]
});

export const getChatbotSettings = async (): Promise<ChatbotSettings> => withFallback(async () => {
    const res = await withTimeout(fetch('/api/chatbot', { cache: 'no-store' }));
    if (!res.ok) throw new Error('Failed chatbot');
    const json = await res.json();
    return json as ChatbotSettings;
}, () => {
    const db = getDb();
    if (db?.chatbot) {
      // Use db.chatbot directly if present, do not merge with defaults
      return db.chatbot as ChatbotSettings;
    }
    return defaultChatbotSettings();
});

export const updateChatbotSettings = async (settings: Partial<ChatbotSettings>): Promise<void> => {
    await serverOrLocal(
        () => withTimeout(fetch('/api/chatbot', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })),
        () => {
            const db = getDb();
            db.chatbot = settings as any;
            saveDb(db);
        }
    );
};

// --- Site Metadata ---
const defaultSiteMeta = (): SiteMetadata => ({
    title: 'Priyesh Mishra | UI/UX Designer',
    description: 'Portfolio of Priyesh Mishra, showcasing UI/UX design projects, case studies, and modern web interfaces.',
    keywords: 'Priyesh Mishra, Portfolio, UI/UX Designer, UI Design, UX Design, Web Design, Interaction Design, User Experience, User Interface',
    authors: [{ name: 'Priyesh Mishra' }],
    robots: 'index, follow',
    icons: { icon: '/icon.svg', shortcut: '/icon.svg', apple: '/images/favicon.png' },
    openGraph: {
        title: 'Priyesh Mishra | UI/UX Designer',
        description: 'Explore Priyesh Mishra’s portfolio showcasing UI/UX design projects, case studies, and modern web interfaces.',
        siteName: 'Priyesh Mishra',
        type: 'website',
        images: [{ url: '/images/profile.png', width: 800, height: 800, alt: 'Priyesh Mishra — UI/UX Designer' }]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Priyesh Mishra | UI/UX Designer',
        description: 'Check out Priyesh Mishra’s UI/UX design portfolio with case studies and modern web interfaces.',
        images: ['/images/profile.png']
    }
});

export const getSiteMeta = async (): Promise<SiteMetadata> => withFallback(async () => {
    const res = await withTimeout(fetch('/api/admin/siteMeta', { cache: 'no-store' }));
    if (!res.ok) throw new Error('Failed siteMeta');
    const json = await res.json();
    return { ...defaultSiteMeta(), ...(json || {}) } as SiteMetadata;
}, () => {
    const db = getDb();
    return { ...defaultSiteMeta(), ...(db?.siteMeta || {}) } as SiteMetadata;
});

export const updateSiteMeta = async (meta: Partial<SiteMetadata>): Promise<void> => {
    const merged = { ...defaultSiteMeta(), ...(await getSiteMeta()), ...(meta || {}) } as SiteMetadata;
    await serverOrLocal(
        () => withTimeout(fetch('/api/admin/siteMeta', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(merged) })),
        () => {
            const db = getDb();
            db.siteMeta = merged as any;
            saveDb(db);
        }
    );
};

// --- Categories ---
export const getCategories = async (): Promise<string[]> => withFallback(async () => {
    const res = await withTimeout(fetch('/api/categories', { cache: 'no-store' }));
    if (!res.ok) throw new Error('Failed categories');
    const json = await res.json();
    // Map to array of names
    return Array.isArray(json) ? json.map((c: any) => c.name) : [];
}, () => {
    const db = getDb();
    return Array.isArray(db?.categories) ? (db.categories as string[]) : ['Apps', 'Branding', 'UI/UX', 'Web'];
});

export const updateCategories = async (categories: string[]): Promise<void> => {
    const cleaned = Array.from(new Set((categories || []).map(c => (c || '').trim()).filter(Boolean)));
    await serverOrLocal(
        () => withTimeout(fetch('/api/admin/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cleaned) })),
        () => {
            const db = getDb();
            (db as any).categories = cleaned;
            saveDb(db);
        }
    );
};
