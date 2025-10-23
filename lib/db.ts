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
            avatar: { url: `https://i.pravatar.cc/150?u=${t.clientName.replace(/\s/g, '')}`, alternativeText: t.clientName },
        })),
        contact: mockContactData,
        blogs: [
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
            {
                id: uuidv4(),
                title: 'From Wireframes to Delight: My Product Design Flow',
                author: 'Priyesh Mishra',
                content: 'How I go from messy ideas to tested designs—fast.',
                excerpt: 'My end‑to‑end product design workflow—from discovery to handoff—with tools and templates.',
                url: 'https://medium.com/',
                thumbnail: { url: 'https://picsum.photos/id/1025/800/450', alternativeText: 'Workflow' },
                publishedAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                id: uuidv4(),
                title: 'Social Growth by Design: Lessons from 160K+',
                author: 'Priyesh Mishra',
                content: 'Design systems and storytelling tactics that scaled a spiritual brand to 160k+ followers.',
                excerpt: 'Content design and systemization techniques that repeatedly worked for growth.',
                url: 'https://medium.com/',
                thumbnail: { url: 'https://picsum.photos/id/1035/800/450', alternativeText: 'Social growth' },
                publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            },
            {
                id: uuidv4(),
                title: 'Fintech UX: Driving Trust with Clarity',
                author: 'Priyesh Mishra',
                content: 'Patterns that reduce friction and build trust across flows in Fintech apps.',
                excerpt: 'Practical patterns for onboarding, KYC, and transactions that improve completion rates.',
                url: 'https://medium.com/',
                thumbnail: { url: 'https://picsum.photos/id/1045/800/450', alternativeText: 'Fintech UX' },
                publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            },
        ],
        adminPassword: 'admin',
    };
};

export const initDb = () => {
    const existing = localStorage.getItem(DB_KEY);
    console.log('initDb called, existing data:', existing ? 'EXISTS' : 'NULL');
    if (existing) {
        console.log('Database already exists, not reinitializing');
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
                    console.log(`Migrating data from legacy key: ${key} -> ${DB_KEY}`);
                    localStorage.setItem(DB_KEY, JSON.stringify(parsed));
                    return;
                }
            } catch (e) {
                console.warn(`Failed to parse legacy DB at ${key}, skipping migration`, e);
            }
        }
    }

    // If no legacy data found, initialize with defaults
    console.log('Initializing database with default data');
    localStorage.setItem(DB_KEY, JSON.stringify(getDefaultDb()));
};

export const getDb = (): Database => {
    console.log('getDb called');
    initDb();
    const dbString = localStorage.getItem(DB_KEY);
    console.log('Loading database from localStorage, size:', dbString?.length, 'characters');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const db = JSON.parse(dbString!) as Database;
    return db;
};

export const saveDb = (db: Database) => {
    try {
        console.log('Saving database to localStorage...', DB_KEY);
        const dbString = JSON.stringify(db);
        console.log('Database size:', dbString.length, 'characters');
        localStorage.setItem(DB_KEY, dbString);
        console.log('Database saved successfully');
    } catch (error) {
        console.error('Error saving database:', error);
        if (error instanceof Error && error.name === 'QuotaExceededError') {
            alert('LocalStorage quota exceeded! Please clear some data or use a different browser.');
        }
        throw error;
    }
};

export const getAdminPassword = (): string => {
    const db = getDb();
    return db.adminPassword || 'admin';
};

export const setAdminPassword = (password: string): boolean => {
    try {
        const db = getDb();
        db.adminPassword = password;
        saveDb(db);
        return true;
    } catch (e) {
        console.error("Failed to set admin password", e);
        return false;
    }
};

// Remove older DB keys and reinitialize with defaults. Returns true if successful.
export const resetDbToDefaults = (): boolean => {
    try {
        // remove legacy keys if present
        try { localStorage.removeItem('portfolio-db'); } catch (e) { /* ignore */ }
        try { localStorage.removeItem('portfolio-db-v1'); } catch (e) { /* ignore */ }
        // set the current DB key with defaults
        localStorage.setItem(DB_KEY, JSON.stringify(getDefaultDb()));
        return true;
    } catch (e) {
        console.error('Failed to reset DB to defaults', e);
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