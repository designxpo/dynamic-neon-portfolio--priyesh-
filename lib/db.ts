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

// Bump this key to reinitialize localStorage with updated mock data when you change core data
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
        blogs: [],
        adminPassword: 'admin',
    };
};

export const initDb = () => {
    if (!localStorage.getItem(DB_KEY)) {
        localStorage.setItem(DB_KEY, JSON.stringify(getDefaultDb()));
    }
};

export const getDb = (): Database => {
    initDb();
    const dbString = localStorage.getItem(DB_KEY);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return JSON.parse(dbString!) as Database;
};

export const saveDb = (db: Database) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
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