// @ts-nocheck
import React from 'react';
// Mongo-backed API client helpers for client components to call Next API routes
import * as Icons from '@/components/icons/Icons';
import {
    HeroData, RawHeroData, Service, RawService, Skill, RawSkill, SocialLink, RawSocialLink,
    Project, RawProject, Testimonial, RawTestimonial, ContactData, RawContactData,
    Blog, BlogData, Education, Experience, SEOConfig, SectionKey, SeoMeta,
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
    mockTestimonialsData,
    mockContactData,
} from '@/data/mockData';
import type { ChatbotSettings, SiteMetadata } from '@/types';

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
        // Mark as online as the server responded successfully, regardless of data shape
        setOfflineMode(false);
        // Some API routes may return undefined/null or empty arrays if DB is empty;
        // in that case we still prefer to render fallback content but keep "online" state
        if (value === undefined || value === null) return fallback();
        // @ts-ignore
        if (Array.isArray(value) && value.length === 0) return fallback();
        return value;
    } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[api fallback] Using mock data due to error:', e);
        }
        setOfflineMode(true);
        return fallback();
    }
};

// Helper: attempt a server write; on failure, persist to local DB
const serverOrLocal = async (doServer: () => Promise<Response>, doLocal: () => void): Promise<void> => {
    try {
        const res = await doServer();
        if (!res.ok) throw new Error(`Server write failed: ${res.status}`);
        setOfflineMode(false);
        return;
    } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[api offline write] Falling back to local DB:', e);
        }
        setOfflineMode(true);
        try {
            doLocal();
        } catch (err) {
            console.error('[api offline write] Local write failed:', err);
            throw err;
        }
    }
};

// Helper to convert a file to a base64 string with compression and storage optimization
export const convertFileToBase64 = async (file: File): Promise<string> => {
    try {
        // Use the optimized version that compresses large images
        const compressedDataUrl = await convertFileToOptimizedBase64(file);
        
        // Try to store in localStorage with error handling
        const storageKey = `temp_image_${Date.now()}`;
        const stored = storeImageSafely(storageKey, compressedDataUrl);
        
        if (!stored) {
            console.warn('Image could not be stored in localStorage due to size limits, but will work for current session');
        }
        
        return compressedDataUrl;
    } catch (error) {
        console.error('Error processing image:', error);
        // Fallback to original method if compression fails
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
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
const toSkill = (raw: RawSkill): Skill => ({ ...raw, icon: raw.skillIcon, image: raw.image });
const toHeroData = (raw: RawHeroData): HeroData => ({ ...raw });
const toContactData = (raw: RawContactData): ContactData => ({ ...raw, socialLinks: (raw.socialLinks || []).map(toSocialLink) });
const toProject = (raw: RawProject): Project => ({...raw});
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
export const getRawHeroData = async (): Promise<RawHeroData> => withFallback(async () => {
    const res = await withTimeout(fetch('/api/admin/hero', { cache: 'no-store' }));
    if (!res.ok) throw new Error('Failed hero');
    return res.json();
}, () => ({
    ...(getDb()?.hero || mockHeroData),
    profileImage: { url: (getDb()?.hero?.profileImage?.url || '/images/profile.png'), alternativeText: 'Priyesh Mishra' }
} as RawHeroData));
export const getHeroData = async (): Promise<HeroData> => toHeroData(await getRawHeroData());
export const updateHeroData = async (data: RawHeroData): Promise<void> => {
    await serverOrLocal(
        () => withTimeout(fetch('/api/admin/hero', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })),
        () => {
            const db = getDb();
            db.hero = data;
            saveDb(db);
        }
    );
};

// Services
export const getServicesData = async (): Promise<Service[]> => withFallback(async () => {
    const res = await withTimeout(fetch('/api/admin/services', { cache: 'no-store' }));
    if (!res.ok) throw new Error('Failed services');
    const raw = await res.json();
    return (raw || []).map(toService).sort((a,b)=>a.order-b.order);
}, () => ((getDb()?.services || mockServicesData) || []).map(toService).sort((a,b)=>a.order-b.order));
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
export const getProjectsData = async (): Promise<Project[]> => withFallback(async () => {
    const res = await withTimeout(fetch('/api/admin/projects', { cache: 'no-store' }));
    if (!res.ok) throw new Error('Failed projects');
    const raw = await res.json();
    return (raw || []).map(toProject);
}, () => ((getDb()?.projects || mockProjectsData) || []).map(toProject));
export const getProjectById = async (id: string): Promise<Project | undefined> => {
    const projects = await getProjectsData();
    return Promise.resolve(projects.find(p => p.id === id));
};
export const updateProjects = async (projects: RawProject[]): Promise<void> => {
    await serverOrLocal(
        () => withTimeout(fetch('/api/admin/projects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(projects) })),
        () => {
            const db = getDb();
            db.projects = projects as any;
            saveDb(db);
        }
    );
};

// Experiences
export const getExperiencesData = async (): Promise<Experience[]> => withFallback(async () => {
    const res = await withTimeout(fetch('/api/admin/experiences', { cache: 'no-store' }));
    if (!res.ok) throw new Error('Failed experiences');
    return res.json();
}, () => getDb()?.experiences || mockExperiencesData);
export const updateExperiences = async (experiences: Experience[]): Promise<void> => {
    await serverOrLocal(
        () => withTimeout(fetch('/api/admin/experiences', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(experiences) })),
        () => {
            const db = getDb();
            db.experiences = experiences as any;
            saveDb(db);
        }
    );
};

// Education
export const getEducationsData = async (): Promise<Education[]> => withFallback(async () => {
    const res = await withTimeout(fetch('/api/admin/educations', { cache: 'no-store' }));
    if (!res.ok) throw new Error('Failed educations');
    return res.json();
}, () => getDb()?.educations || mockEducationsData);
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

// Skills
export const getSkillsData = async (): Promise<Skill[]> => withFallback(async () => {
    const res = await withTimeout(fetch('/api/admin/skills', { cache: 'no-store' }));
    if (!res.ok) throw new Error('Failed skills');
    const raw = await res.json();
    return (raw || []).map(toSkill);
}, () => ((getDb()?.skills || mockSkillsData) || []).map(toSkill));
export const updateSkills = async (skills: RawSkill[]): Promise<void> => {
    await serverOrLocal(
        () => withTimeout(fetch('/api/admin/skills', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(skills) })),
        () => {
            const db = getDb();
            db.skills = skills as any;
            saveDb(db);
        }
    );
};

// Testimonials
export const getTestimonialsData = async (): Promise<Testimonial[]> => withFallback(async () => {
    const res = await withTimeout(fetch('/api/admin/testimonials', { cache: 'no-store' }));
    if (!res.ok) throw new Error('Failed testimonials');
    const raw = await res.json();
    return (raw || []).map(toTestimonial);
}, () => ((getDb()?.testimonials || mockTestimonialsData) || []).map(toTestimonial));
export const updateTestimonials = async (testimonials: Testimonial[]): Promise<void> => {
    await serverOrLocal(
        () => withTimeout(fetch('/api/admin/testimonials', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(testimonials) })),
        () => {
            const db = getDb();
            db.testimonials = testimonials as any;
            saveDb(db);
        }
    );
};

// Contact
export const getRawContactData = async (): Promise<RawContactData> => withFallback(async () => {
    const res = await fetch('/api/admin/contact', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed contact');
    return res.json();
}, () => (getDb()?.contact || (mockContactData as RawContactData)));
export const getContactData = async (): Promise<ContactData> => toContactData(await getRawContactData());
export const updateContactData = async (data: RawContactData): Promise<void> => {
    await serverOrLocal(
        () => fetch('/api/admin/contact', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
        () => {
            const db = getDb();
            db.contact = data as any;
            saveDb(db);
        }
    );
};

// Blogs
export const getBlogs = async (): Promise<Blog[]> => withFallback(async () => {
        const res = await fetch('/api/admin/blogs', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed blogs');
        return res.json();
}, () => {
    const db = getDb();
    if (db?.blogs && db.blogs.length > 0) return db.blogs as Blog[];
    // Seed with provided entries using local images so UI remains consistent offline/without DB
    return [
        {
            id: uuidv4(),
            title: 'YouTube Studio App Redesign — UI Case Study',
            author: 'Priyesh Mishra',
            content: 'A creator-centric UI case study where I redesigned the YouTube Studio mobile app to make analytics and channel management more intuitive and visually appealing.',
            excerpt: 'Redesigning YouTube Studio for clearer analytics and faster on-the-go tasks.',
            url: 'https://priyeshmishra1602.medium.com/youtube-studio-app-redesign-ui-case-study-by-priyesh-mishra-d4a7158563eb',
            thumbnail: { url: '/images/Youtube_Studio_App_redesign_UI%20Case_Study.webp', alternativeText: 'YouTube Studio App redesign UI case study' },
            publishedAt: new Date('2025-10-28').toISOString(),
        },
        {
            id: uuidv4(),
            title: 'The Graphic Advantage: How Visual Storytelling Boosts ROI in Today’s Market',
            author: 'Priyesh Mishra',
            content: 'In today’s hyper-competitive landscape, businesses need more than just a good product or service to succeed. They need a strong visual identity that resonates with their target audience and drives significant return on investment (ROI). This is where graphic design becomes an essential weapon in the arsenal of any modern business, be it a fledgling startup or an established corporation.',
            excerpt: 'Why visual storytelling is a growth lever — and how design compounds ROI.',
            url: 'https://priyeshmishra1602.medium.com/the-graphic-advantage-how-visual-storytelling-boosts-roi-in-todays-market-8b3b1dfaedfb',
            thumbnail: { url: '/images/Graphic_Advantage.webp', alternativeText: 'The Graphic Advantage' },
            publishedAt: new Date('2023-12-09').toISOString(),
        },
        {
            id: uuidv4(),
            title: 'Case Study: Growing an Instagram Following from 0 to 100,000 in 6 Months',
            author: 'Priyesh Mishra',
            content: 'To gain 100,000 followers on Instagram in 6 months by consistently posting videos and engaging with the audience.',
            excerpt: 'The system behind scaling an Instagram audience to 100k in half a year.',
            url: 'https://priyeshmishra1602.medium.com/case-study-growing-an-instagram-following-from-0-to-100-000-in-6-months-f18763ea8ef8',
            thumbnail: { url: '/images/Spiritualtalksofficial.png', alternativeText: 'Instagram growth case study' },
            publishedAt: new Date('2023-12-03').toISOString(),
        },
        {
            id: uuidv4(),
            title: 'Case Study: Forensic Library App UI Design by DesignXpo',
            author: 'Priyesh Mishra',
            content: 'To design a user interface for a forensic library app that is easy to use and navigate, and that provides users with quick and easy access to the forensic materials and ebooks they need.',
            excerpt: 'Designing a dense library UI that stays simple, scannable, and fast.',
            url: 'https://priyeshmishra1602.medium.com/case-study-forensic-library-app-ui-design-by-designxpo-719fe96acb11',
            thumbnail: { url: '/images/Forensic_Library_App.webp', alternativeText: 'Forensic Library App UI' },
            publishedAt: new Date('2023-10-30').toISOString(),
        },
        {
            id: uuidv4(),
            title: 'Application Where Skill Got Admired: Digital Video Sharing Platform',
            author: 'Priyesh Mishra',
            content: 'In this modern era, where almost everything is digitalized our project gives a platform to many people who wants to compete/ grow in their fields. It’s a people based entertainment service in which competitions will be held and one who got highest vote in a given interval wins the battle and will be greeted by a cash prize.',
            excerpt: 'Building a video platform where creators compete and audiences decide.',
            url: 'https://priyeshmishra1602.medium.com/application-where-skill-got-admired-digital-video-sharing-platform-395f469edd7f',
            thumbnail: { url: '/images/Digital_App.webp', alternativeText: 'Digital video sharing platform' },
            publishedAt: new Date('2021-12-30').toISOString(),
        },
    ] as Blog[];
});
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
        const res = await withTimeout(fetch('/api/admin/seo', { cache: 'no-store' }));
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
        () => withTimeout(fetch('/api/admin/seo', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(merged) })),
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
    greeting: 'Hey there 👋 I’m Prism — Priyesh’s virtual assistant. Ask me about design, branding, or creative strategy — I’ll help and answer in Priyesh’s voice.',
    bookingUrl: 'https://calendar.app.google/bTfdiZGjeXZGqbeu9',
    bookingDescription: 'A collaborative 30-minute call to understand each other’s work and creative process. We’ll talk about your design goals, review your portfolio or brand, and identify how my expertise can help you craft experiences that truly connect.',
    showBookingQuickReply: true,
    placeholders: {},
    rules: [
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What services do you offer?', keywords: ['services','service','ui','ux','design','branding','strategy','website','app'], reply: 'I offer UI/UX design, product strategy, design systems, and brand experience work. I also help teams align business goals with user needs through user-centric digital design. You can browse my full list here: /#services' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: "What’s your design process?", keywords: ['process','workflow','approach','steps','how you work','method','design journey'], reply: 'My design process typically includes:\n1️⃣ Discovery & Research – Understanding user needs and business goals.\n2️⃣ Wireframing – Structuring the core experience.\n3️⃣ Visual Design – Building brand-aligned interfaces.\n4️⃣ Prototyping & Testing – Validating usability and flow.\n5️⃣ Delivery – Preparing developer-ready assets.\nYou can explore my detailed process here: /#process' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Can I see your work?', keywords: ['work','portfolio','examples','projects','case studies','showcase'], reply: 'Absolutely! You can view my recent projects showcasing UI/UX design, web design, and branding here: /#work. Each case study highlights my approach, tools used, and design outcomes.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What are your rates?', keywords: ['pricing','rates','cost','charge','budget','packages','how much'], reply: 'My pricing depends on the project scope, complexity, and timeline. For smaller UI/UX design projects, I offer fixed packages. For ongoing work, I work on a retainer or hourly basis. Let\'s discuss your needs here: /#pricing' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'How can we work together?', keywords: ['collaborate','start','hire','contact','get started','work with you','onboarding'], reply: 'I\'d love to collaborate! The best way to start is by sharing a few details about your project. You can schedule a quick intro call or fill out my inquiry form here: /#contact' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What tools do you use?', keywords: ['tools','stack','software','design tools','programs','apps'], reply: 'I mainly work with Figma, Adobe XD, Photoshop, and Illustrator for design — plus Notion, FigJam, and Miro for strategy and collaboration.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: "What's your experience?", keywords: ['experience','background','skills','career','years','education'], reply: 'I\'m a UI/UX designer with 8+ years of experience working across startups and enterprise products. My background combines design systems, user research, and brand storytelling to deliver seamless digital experiences.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'How long will it take?', keywords: ['time','duration','timeline','delivery','how long','deadline'], reply: 'Most projects take between 2–6 weeks, depending on scope and complexity. I usually start with a discovery phase to define the exact timeline and milestones.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Do you allow revisions?', keywords: ['revision','edit','feedback','changes','update'], reply: 'Yes, of course! Every project includes 2–3 rounds of revisions to make sure the final result aligns perfectly with your vision and feedback.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Are you available for new projects?', keywords: ['available','open','accepting','new projects','booking','schedule'], reply: 'I\'m currently accepting new projects this month! You can check my availability or book a quick discovery call here: /#contact' },
    ],
});

export const getChatbotSettings = async (): Promise<ChatbotSettings> => withFallback(async () => {
    const res = await withTimeout(fetch('/api/admin/chatbot', { cache: 'no-store' }));
    if (!res.ok) throw new Error('Failed chatbot');
    const json = await res.json();
    return { ...defaultChatbotSettings(), ...(json || {}) } as ChatbotSettings;
}, () => {
    const db = getDb();
    return { ...defaultChatbotSettings(), ...(db?.chatbot || {}) } as ChatbotSettings;
});

export const updateChatbotSettings = async (settings: Partial<ChatbotSettings>): Promise<void> => {
    const merged = { ...defaultChatbotSettings(), ...(await getChatbotSettings()), ...(settings || {}) } as ChatbotSettings;
    await serverOrLocal(
        () => withTimeout(fetch('/api/admin/chatbot', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(merged) })),
        () => {
            const db = getDb();
            db.chatbot = merged as any;
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
    const res = await withTimeout(fetch('/api/admin/categories', { cache: 'no-store' }));
    if (!res.ok) throw new Error('Failed categories');
    const json = await res.json();
    return Array.isArray(json) ? json as string[] : [];
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
