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

// Timeout wrapper to ensure API calls fail fast instead of hanging for 90+ seconds
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
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
    // Seed with a minimal example if nothing exists in local DB
    return [
        {
            id: uuidv4(),
            title: 'Designing with Purpose: Practical UI/UX Guidelines',
            author: 'Priyesh Mishra',
            content: 'A quick field guide of heuristics and patterns I use to ship clean, accessible UIs that convert.',
            excerpt: 'Simple, proven UI/UX heuristics you can apply today to make products clearer and faster to use.',
            url: 'https://medium.com/',
            thumbnail: { url: 'https://picsum.photos/id/1015/800/450', alternativeText: 'Blog cover' },
            publishedAt: new Date().toISOString(),
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
        metaTitle: 'Priyesh Mishra — Portfolio',
        metaKeywords: 'designer, ui, ux, product design, portfolio',
        metaDescription: 'Portfolio site showcasing projects, services, and experience of Priyesh Mishra.'
    },
    hero: {
        metaTitle: 'Home — Hero',
        metaKeywords: 'hero, introduction, headline',
        metaDescription: 'Top section introducing the designer and value proposition.'
    },
    services: {
        metaTitle: 'Services',
        metaKeywords: 'services, ui design, ux design, product strategy',
        metaDescription: 'Professional services including UI/UX design, strategy, and more.'
    },
    projects: {
        metaTitle: 'Projects',
        metaKeywords: 'projects, case studies, portfolio work',
        metaDescription: 'Selected recent work and case studies.'
    },
    experience: {
        metaTitle: 'Experience',
        metaKeywords: 'experience, work history, roles',
        metaDescription: 'Professional experience and roles held.'
    },
    education: {
        metaTitle: 'Education',
        metaKeywords: 'education, certifications, degrees',
        metaDescription: 'Academic background and certifications.'
    },
    skills: {
        metaTitle: 'Skills',
        metaKeywords: 'skills, tools, technologies',
        metaDescription: 'Skills and tools used across design and development.'
    },
    testimonials: {
        metaTitle: 'Testimonials',
        metaKeywords: 'testimonials, reviews, feedback',
        metaDescription: 'Client testimonials and feedback.'
    },
    blogs: {
        metaTitle: 'Blog',
        metaKeywords: 'blog, articles, writing',
        metaDescription: 'Articles and writing on design and product.'
    },
    contact: {
        metaTitle: 'Contact',
        metaKeywords: 'contact, email, connect',
        metaDescription: 'Contact information and ways to get in touch.'
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
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What services do you offer?', keywords: ['services','service','ui','ux','design','branding','strategy'], reply: 'I offer UI/UX design, product strategy, design systems, and brand experience work. You can browse a quick overview here: /#services' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Can we book a call?', keywords: ['book','call','meeting','schedule','calendar','chat'], reply: 'Absolutely — you can book a 30‑min intro here: {bookingUrl}.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'How can I contact you?', keywords: ['contact','email','reach','connect','message'], reply: 'You can email me at {email} or use the contact form: {contactLink}.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What are your rates?', keywords: ['price','pricing','rates','cost','budget','quote'], reply: 'I scope per‑project based on goals and complexity. Share a bit about your needs or book a quick call and I’ll tailor a quote: {bookingUrl}.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What’s your experience?', keywords: ['experience','background','years','worked','clients','brands'], reply: 'I’ve designed for startups and brands across industries. You can skim highlights here: /#experience' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Can I see your work?', keywords: ['portfolio','projects','case study','work','examples'], reply: 'Sure — recent projects and case studies are here: /#projects' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Do you have testimonials?', keywords: ['testimonials','reviews','feedback','clients say'], reply: 'Yes — client feedback is here: /#testimonials' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'What tools do you use?', keywords: ['skills','tools','stack','figma','framer','react','next','tailwind','design system'], reply: 'I work with Figma, Framer, React/Next.js, Tailwind, and design systems. See more here: /#skills' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Where are you based?', keywords: ['location','based','timezone','country','time zone'], reply: 'I’m based in India (IST, UTC+5:30) and work async with global teams.' },
        { id: uuidv4(), enabled: true, match: 'any', caseSensitive: false, question: 'Are you available?', keywords: ['availability','available','taking projects','capacity','start date'], reply: 'I’m currently accepting new projects. Want to compare calendars? {bookingUrl}' },
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
