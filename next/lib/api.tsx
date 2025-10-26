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

// Helper to convert a file to a base64 string
export const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
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
    const res = await fetch('/api/admin/hero', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed hero');
    return res.json();
}, () => ({
    ...(getDb()?.hero || mockHeroData),
    profileImage: { url: (getDb()?.hero?.profileImage?.url || '/images/profile.png'), alternativeText: 'Priyesh Mishra' }
} as RawHeroData));
export const getHeroData = async (): Promise<HeroData> => toHeroData(await getRawHeroData());
export const updateHeroData = async (data: RawHeroData): Promise<void> => {
    await serverOrLocal(
        () => fetch('/api/admin/hero', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
        () => {
            const db = getDb();
            db.hero = data;
            saveDb(db);
        }
    );
};

// Services
export const getServicesData = async (): Promise<Service[]> => withFallback(async () => {
    const res = await fetch('/api/admin/services', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed services');
    const raw = await res.json();
    return (raw || []).map(toService).sort((a,b)=>a.order-b.order);
}, () => ((getDb()?.services || mockServicesData) || []).map(toService).sort((a,b)=>a.order-b.order));
export const updateServices = async (services: (Service | RawService)[]): Promise<void> => {
    const payload = services.map(s => ({ ...s, icon: getIconName((s as any).icon) }));
    await serverOrLocal(
        () => fetch('/api/admin/services', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
        () => {
            const db = getDb();
            db.services = payload as any;
            saveDb(db);
        }
    );
};

// Projects
export const getProjectsData = async (): Promise<Project[]> => withFallback(async () => {
    const res = await fetch('/api/admin/projects', { cache: 'no-store' });
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
        () => fetch('/api/admin/projects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(projects) }),
        () => {
            const db = getDb();
            db.projects = projects as any;
            saveDb(db);
        }
    );
};

// Experiences
export const getExperiencesData = async (): Promise<Experience[]> => withFallback(async () => {
    const res = await fetch('/api/admin/experiences', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed experiences');
    return res.json();
}, () => (getDb()?.experiences || mockExperiencesData));
export const updateExperiences = async (experiences: Experience[]): Promise<void> => {
    await serverOrLocal(
        () => fetch('/api/admin/experiences', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(experiences) }),
        () => {
            const db = getDb();
            db.experiences = experiences as any;
            saveDb(db);
        }
    );
};

// Educations
export const getEducationsData = async (): Promise<Education[]> => withFallback(async () => {
    const res = await fetch('/api/admin/educations', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed educations');
    return res.json();
}, () => (getDb()?.educations || mockEducationsData));
export const updateEducations = async (educations: Education[]): Promise<void> => {
    await serverOrLocal(
        () => fetch('/api/admin/educations', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(educations) }),
        () => {
            const db = getDb();
            db.educations = educations as any;
            saveDb(db);
        }
    );
};

// Skills
export const getSkillsData = async (): Promise<Skill[]> => withFallback(async () => {
    const res = await fetch('/api/admin/skills', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed skills');
    const raw = await res.json();
    return (raw || []).map(toSkill);
}, () => ((getDb()?.skills || mockSkillsData) || []).map(toSkill));
export const updateSkills = async (skills: RawSkill[]): Promise<void> => {
    await serverOrLocal(
        () => fetch('/api/admin/skills', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(skills) }),
        () => {
            const db = getDb();
            db.skills = skills as any;
            saveDb(db);
        }
    );
};

// Testimonials
export const getTestimonialsData = async (): Promise<Testimonial[]> => withFallback(async () => {
    const res = await fetch('/api/admin/testimonials', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed testimonials');
    const raw = await res.json();
    return (raw || []).map(toTestimonial);
}, () => ((getDb()?.testimonials || mockTestimonialsData) || []).map((t:any) => toTestimonial(t as RawTestimonial)));
export const updateTestimonials = async (testimonials: RawTestimonial[]): Promise<void> => {
    await serverOrLocal(
        () => fetch('/api/admin/testimonials', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(testimonials) }),
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
        const res = await fetch('/api/admin/seo', { cache: 'no-store' });
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
        () => fetch('/api/admin/seo', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(merged) }),
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
        const res = await fetch('/api/admin/adminPassword', { cache: 'no-store' });
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
        () => fetch('/api/admin/adminPassword', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pwd) }),
        () => {
            // use local fallback setter to ensure any ancillary logic stays consistent
            setAdminPasswordLocal(pwd);
        }
    );
};
