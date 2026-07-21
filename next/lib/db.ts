import { connectDB } from './db/mongoose';

/**
 * Backwards-compatible connection helper.
 *
 * Previously this tracked connection state with a module-level `isConnected`
 * boolean that was never reset when the socket dropped — in serverless that
 * meant a warm instance could believe it was connected while the underlying
 * connection was dead, causing queries to buffer or fail. It now delegates to
 * the single cached connection in ./db/mongoose, which checks
 * `mongoose.connection.readyState` and reconnects when needed. This unifies
 * connection management across every route (some used `dbConnect`, others
 * `connectDB`).
 */
export async function dbConnect() {
    await connectDB();
}
import { Database } from '../types';
import {
    mockHeroData,
    mockServicesData,
    mockProjectsData,
    mockExperiencesData,
    mockEducationsData,
    mockSkillsData,
    mockTestimonialsData,
    mockContactData,
} from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';

// IMPORTANT: Keep this key stable to avoid unintentional resets across deployments.
// Only bump when you truly need to force-refresh seed data, and prefer migrating instead.
const DB_KEY = 'portfolio-db-v2';
// Baseline snapshot key: what "Reset to Defaults" should restore to.
// We keep this in sync with the latest admin-published changes so reset restores your latest content,
// not the original seed mocks.
const BASELINE_KEY = 'portfolio-db-v2-baseline';

const getDefaultDb = (): Database => {
    return {
        hero: {
            ...mockHeroData,
            // use local profile image if available in public/images
            profileImage: { url: '/images/profile.png', alternativeText: 'Priyesh Mishra' },
        },
        services: mockServicesData,
        projects: mockProjectsData.map(p => ({
            ...p,
            // if the project already provides a coverImage use it, otherwise try local filename or picsum
            coverImage: (
                // @ts-ignore - some mock entries may include coverImage already
                p.coverImage?.url ? p.coverImage : { url: `/images/${p.title.replace(/\s/g, '')}.png`, alternativeText: p.title }
            ),
        })),
        experiences: mockExperiencesData,
        educations: mockEducationsData,
        skills: mockSkillsData,
        testimonials: mockTestimonialsData.map(t => ({
            ...t,
            // Prefer a curated local avatar when available; otherwise fall back to pravatar
            avatar: (t.clientName && t.clientName.toLowerCase().includes('pranab'))
                ? { url: '/images/pranab.jpeg', alternativeText: t.clientName }
                : { url: `https://i.pravatar.cc/150?u=${t.clientName.replace(/\s/g, '')}`, alternativeText: t.clientName },
        })),
        contact: mockContactData,
        blogs: [
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
        ],
        categories: ['Apps', 'Branding', 'UI/UX', 'Web'],
        chatbot: {
            enabled: true,
            name: 'Prism',
            initialGreeting: 'Hey there 👋 I’m Prism — Priyesh’s virtual assistant. Ask me about design, branding, or creative strategy — I’ll help and answer in Priyesh’s voice.',
            bookingUrl: 'https://calendar.app.google/bTfdiZGjeXZGqbeu9',
            bookingDescription: 'A collaborative 30-minute call to understand each other’s work and creative process. We’ll talk about your design goals, review your portfolio or brand, and identify how my expertise can help you craft experiences that truly connect.',
            showBookingQuickReply: true,
            placeholders: [],
            customQA: [
                { enabled: true, matchMode: 'any', question: 'What services do you offer?', keywords: ['services', 'service', 'ui', 'ux', 'design', 'branding', 'strategy', 'website', 'app'], reply: 'I offer UI/UX design, product strategy, design systems, and brand experience work. I also help teams align business goals with user needs through user-centric digital design. You can browse my full list here: /#services' },
                { enabled: true, matchMode: 'any', question: "What’s your design process?", keywords: ['process', 'workflow', 'approach', 'steps', 'how you work', 'method', 'design journey'], reply: 'My design process typically includes:\n1️⃣ Discovery & Research – Understanding user needs and business goals.\n2️⃣ Wireframing – Structuring the core experience.\n3️⃣ Visual Design – Building brand-aligned interfaces.\n4️⃣ Prototyping & Testing – Validating usability and flow.\n5️⃣ Delivery – Preparing developer-ready assets.\nYou can explore my detailed process here: /#process' },
                { enabled: true, matchMode: 'any', question: 'Can I see your work?', keywords: ['work', 'portfolio', 'examples', 'projects', 'case studies', 'showcase'], reply: 'Absolutely! You can view my recent projects showcasing UI/UX design, web design, and branding here: /#work. Each case study highlights my approach, tools used, and design outcomes.' },
                { enabled: true, matchMode: 'any', question: 'What are your rates?', keywords: ['pricing', 'rates', 'cost', 'charge', 'budget', 'packages', 'how much'], reply: 'My pricing depends on the project scope, complexity, and timeline. For smaller UI/UX design projects, I offer fixed packages. For ongoing work, I work on a retainer or hourly basis. Let\'s discuss your needs here: /#pricing' },
                { enabled: true, matchMode: 'any', question: 'How can we work together?', keywords: ['collaborate', 'start', 'hire', 'contact', 'get started', 'work with you', 'onboarding'], reply: 'I\'d love to collaborate! The best way to start is by sharing a few details about your project. You can schedule a quick intro call or fill out my inquiry form here: /#contact' },
                { enabled: true, matchMode: 'any', question: 'What tools do you use?', keywords: ['tools', 'stack', 'software', 'design tools', 'programs', 'apps'], reply: 'I mainly work with Figma, Adobe XD, Photoshop, and Illustrator for design — plus Notion, FigJam, and Miro for strategy and collaboration.' },
                { enabled: true, matchMode: 'any', question: "What's your experience?", keywords: ['experience', 'background', 'skills', 'career', 'years', 'education'], reply: 'I\'m a UI/UX designer with 8+ years of experience working across startups and enterprise products. My background combines design systems, user research, and brand storytelling to deliver seamless digital experiences.' },
                { enabled: true, matchMode: 'any', question: 'How long will it take?', keywords: ['time', 'duration', 'timeline', 'delivery', 'how long', 'deadline'], reply: 'Most projects take between 2–6 weeks, depending on scope and complexity. I usually start with a discovery phase to define the exact timeline and milestones.' },
                { enabled: true, matchMode: 'any', question: 'Do you allow revisions?', keywords: ['revision', 'edit', 'feedback', 'changes', 'update'], reply: 'Yes, of course! Every project includes 2–3 rounds of revisions to make sure the final result aligns perfectly with your vision and feedback.' },
                { enabled: true, matchMode: 'any', question: 'Are you available for new projects?', keywords: ['available', 'open', 'accepting', 'new projects', 'booking', 'schedule'], reply: 'I\'m currently accepting new projects this month! You can check my availability or book a quick discovery call here: /#contact' },
            ],
        },
        siteMeta: {
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
        }
    };
};

export const initDb = () => {
    const existing = localStorage.getItem(DB_KEY);
    if (existing) {
        return;
    }

    // Try migrating from legacy keys instead of wiping user changes
    const legacyKeys = ['portfolio-db-v1', 'portfolio-db'];
    for (const key of legacyKeys) {
        const legacy = localStorage.getItem(key);
        if (legacy) {
            try {
                const parsed = JSON.parse(legacy) as Database;
                // Basic sanity check
                if (parsed && typeof parsed === 'object') {
                    localStorage.setItem(DB_KEY, JSON.stringify(parsed));
                    // Initialize baseline from migrated data if not present
                    if (!localStorage.getItem(BASELINE_KEY)) {
                        localStorage.setItem(BASELINE_KEY, JSON.stringify(parsed));
                    }
                    return;
                }
            } catch (e) {
                console.warn(`Failed to parse legacy DB at ${key}, skipping migration`, e);
            }
        }
    }

    // If no legacy data found, initialize from existing baseline if present; otherwise use defaults
    const baseline = localStorage.getItem(BASELINE_KEY);
    if (baseline) {
        localStorage.setItem(DB_KEY, baseline);
    } else {
        const defaults = JSON.stringify(getDefaultDb());
        localStorage.setItem(DB_KEY, defaults);
        // Also seed the baseline so future resets restore to this snapshot
        localStorage.setItem(BASELINE_KEY, defaults);
    }
};

export const getDb = (): Database => {
    initDb();
    const dbString = localStorage.getItem(DB_KEY);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const db = JSON.parse(dbString!) as Database;
    return db;
};

export const saveDb = (db: Database) => {
    try {
        const dbString = JSON.stringify(db);

        // Check if database is getting too large
        if (dbString.length > 4 * 1024 * 1024) { // 4MB warning threshold
            console.warn('Database is getting large (>4MB). Consider optimizing image storage.');
        }

        localStorage.setItem(DB_KEY, dbString);

        // Create backup baseline snapshot if this save was successful
        if (!localStorage.getItem(BASELINE_KEY)) {
            localStorage.setItem(BASELINE_KEY, dbString);
        }

    } catch (error) {
        console.error('Error saving database:', error);
        if (error instanceof Error && error.name === 'QuotaExceededError') {
            // Try to save a minimal version without large images
            console.log('Attempting to save database without large images...');
            try {
                const minimalDb = compressDbForStorage(db);
                const minimalString = JSON.stringify(minimalDb);
                localStorage.setItem(DB_KEY, minimalString);
                console.log('Database saved with compressed images');

                // Alert user about the compression
                if (typeof window !== 'undefined') {
                    alert('Storage space is limited. Images have been compressed to fit. Consider using smaller image files.');
                }
            } catch (secondError) {
                console.error('Failed to save even compressed database:', secondError);
                if (typeof window !== 'undefined') {
                    alert('Unable to save changes due to storage limits. Please clear browser data or use smaller images.');
                }
                throw secondError;
            }
        } else {
            throw error;
        }
    }
};

// Helper function to compress database for storage
const compressDbForStorage = (db: Database): Database => {
    const compressed = JSON.parse(JSON.stringify(db)); // Deep clone

    // Replace large base64 images with placeholders or smaller versions
    if (compressed.hero?.profileImage?.url?.length > 100000) { // >100KB
        console.log('Compressing hero profile image for storage');
        compressed.hero.profileImage.url = '/images/profile.png'; // Fallback to default
    }

    // Compress project images
    if (compressed.projects) {
        compressed.projects.forEach((project: any) => {
            if (project.coverImage?.url?.length > 100000) {
                console.log(`Compressing project image for ${project.title}`);
                project.coverImage.url = `/images/${project.title.replace(/\s/g, '')}.png`;
            }
        });
    }

    // Compress testimonial avatars
    if (compressed.testimonials) {
        compressed.testimonials.forEach((testimonial: any) => {
            if (testimonial.avatar?.url?.length > 50000) { // Smaller threshold for avatars
                console.log(`Compressing avatar for ${testimonial.clientName}`);
                testimonial.avatar.url = `https://i.pravatar.cc/150?u=${testimonial.clientName.replace(/\s/g, '')}`;
            }
        });
    }

    return compressed;
};

// Remove older DB keys and reinitialize with defaults. Returns true if successful.
export const resetDbToDefaults = (): boolean => {
    try {
        // remove legacy keys if present
        try { localStorage.removeItem('portfolio-db'); } catch (e) { /* ignore */ }
        try { localStorage.removeItem('portfolio-db-v1'); } catch (e) { /* ignore */ }
        // Restore from baseline snapshot if available, otherwise fall back to current defaults
        const baseline = localStorage.getItem(BASELINE_KEY);
        if (baseline) {
            localStorage.setItem(DB_KEY, baseline);
        } else {
            const defaults = JSON.stringify(getDefaultDb());
            localStorage.setItem(DB_KEY, defaults);
            // Seed the baseline for future resets
            localStorage.setItem(BASELINE_KEY, defaults);
        }
        return true;
    } catch (e) {
        console.error('Failed to reset DB to defaults', e);
        return false;
    }
};

// Manually set the baseline snapshot to the current DB content.
// Use this after you publish changes you want to consider the new defaults.
export const setBaselineFromCurrent = (): boolean => {
    try {
        const current = localStorage.getItem(DB_KEY);
        if (!current) {
            console.warn('setBaselineFromCurrent: No current DB found, initializing defaults');
            const defaults = JSON.stringify(getDefaultDb());
            localStorage.setItem(BASELINE_KEY, defaults);
            return true;
        }
        localStorage.setItem(BASELINE_KEY, current);
        return true;
    } catch (e) {
        console.error('Failed to set baseline from current DB', e);
        return false;
    }
};

// Export the current database to a JSON string
export const exportDb = (): string => {
    const db = getDb();
    try {
        return JSON.stringify(db, null, 2);
    } catch (e) {
        console.error('Failed to export DB', e);
        throw e;
    }
};

type ImportMode = 'replace' | 'merge';

// Import database from provided JSON object, with simple top-level merge/replace strategies
export const importDb = (incoming: Partial<Database> | string, mode: ImportMode = 'replace'): boolean => {
    try {
        const parsed: Partial<Database> = typeof incoming === 'string' ? JSON.parse(incoming) : incoming;
        if (!parsed || typeof parsed !== 'object') throw new Error('Invalid DB payload');

        if (mode === 'replace') {
            // Replace entire DB, but ensure required defaults if missing
            const current = getDefaultDb();
            const next: Database = { ...current, ...(parsed as Database) };
            saveDb(next);
            return true;
        }

        // Merge mode: shallow merge top-level keys into current DB
        const current = getDb();
        const next: Database = { ...current, ...(parsed as Database) };
        saveDb(next);
        return true;
    } catch (e) {
        console.error('Failed to import DB', e);
        return false;
    }
};
