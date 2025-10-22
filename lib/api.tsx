import React from 'react';
import { getDb, saveDb } from './db';
import * as Icons from '../components/icons/Icons';
import {
    HeroData, RawHeroData, Service, RawService, Skill, RawSkill, SocialLink, RawSocialLink,
    Project, RawProject, Testimonial, RawTestimonial, ContactData, RawContactData,
    Blog, BlogData, Education, Experience,
} from '../types';
import { v4 as uuidv4 } from 'uuid';

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
const toSocialLink = (raw: RawSocialLink): SocialLink => ({ ...raw, icon: getIcon(raw.icon) });
const toService = (raw: RawService): Service => ({ ...raw, icon: getIcon(raw.icon) });
const toSkill = (raw: RawSkill): Skill => ({ ...raw, icon: raw.skillIcon, image: raw.image });
const toHeroData = (raw: RawHeroData): HeroData => ({ ...raw, socialLinks: (raw.socialLinks || []).map(toSocialLink) });
const toContactData = (raw: RawContactData): ContactData => ({ ...raw, socialLinks: (raw.socialLinks || []).map(toSocialLink) });
const toProject = (raw: RawProject): Project => ({...raw});
const toTestimonial = (raw: RawTestimonial): Testimonial => ({...raw});

const getIconName = (iconNode: React.ReactNode): string => {
    if (typeof iconNode === 'string') return iconNode;
    if (React.isValidElement(iconNode) && (iconNode.type as any).name) {
        return (iconNode.type as any).name;
    }
    return '';
};


// --- API Functions ---

// Hero
export const getRawHeroData = async (): Promise<RawHeroData> => Promise.resolve(getDb().hero);
export const getHeroData = async (): Promise<HeroData> => Promise.resolve(toHeroData(getDb().hero));
export const updateHeroData = async (data: RawHeroData): Promise<void> => {
    const db = getDb();
    db.hero = data;
    saveDb(db);
};

// Services
export const getServicesData = async (): Promise<Service[]> => Promise.resolve((getDb().services || []).map(toService).sort((a,b) => a.order - b.order));
export const updateServices = async (services: (Service | RawService)[]): Promise<void> => {
    const db = getDb();
    db.services = services.map(s => ({
        ...s,
        icon: getIconName(s.icon)
    }));
    saveDb(db);
};

// Projects
export const getProjectsData = async (): Promise<Project[]> => Promise.resolve((getDb().projects || []).map(toProject));
export const getProjectById = async (id: string): Promise<Project | undefined> => {
    const projects = await getProjectsData();
    return Promise.resolve(projects.find(p => p.id === id));
};
export const updateProjects = async (projects: RawProject[]): Promise<void> => {
    const db = getDb();
    db.projects = projects;
    saveDb(db);
};

// Experiences
export const getExperiencesData = async (): Promise<Experience[]> => Promise.resolve(getDb().experiences || []);
export const updateExperiences = async (experiences: Experience[]): Promise<void> => {
    const db = getDb();
    db.experiences = experiences;
    saveDb(db);
};

// Educations
export const getEducationsData = async (): Promise<Education[]> => Promise.resolve(getDb().educations || []);
export const updateEducations = async (educations: Education[]): Promise<void> => {
    const db = getDb();
    db.educations = educations;
    saveDb(db);
};

// Skills
export const getSkillsData = async (): Promise<Skill[]> => Promise.resolve((getDb().skills || []).map(toSkill));
export const updateSkills = async (skills: RawSkill[]): Promise<void> => {
    const db = getDb();
    db.skills = skills;
    saveDb(db);
};

// Testimonials
export const getTestimonialsData = async (): Promise<Testimonial[]> => Promise.resolve((getDb().testimonials || []).map(toTestimonial));
export const updateTestimonials = async (testimonials: RawTestimonial[]): Promise<void> => {
    const db = getDb();
    db.testimonials = testimonials;
    saveDb(db);
};

// Contact
export const getRawContactData = async (): Promise<RawContactData> => Promise.resolve(getDb().contact);
export const getContactData = async (): Promise<ContactData> => Promise.resolve(toContactData(getDb().contact));
export const updateContactData = async (data: RawContactData): Promise<void> => {
    const db = getDb();
    db.contact = data;
    saveDb(db);
};

// Blogs
export const getBlogs = async (): Promise<Blog[]> => Promise.resolve(getDb().blogs || []);
export const addBlog = async (blogData: BlogData): Promise<Blog> => {
    const db = getDb();
    const newBlog: Blog = { ...blogData, id: uuidv4() };
    db.blogs = [...(db.blogs || []), newBlog];
    saveDb(db);
    return newBlog;
};
export const updateBlog = async (blog: Blog): Promise<Blog> => {
    const db = getDb();
    db.blogs = (db.blogs || []).map(b => b.id === blog.id ? blog : b);
    saveDb(db);
    return blog;
};
export const deleteBlog = async (blogId: string): Promise<void> => {
    const db = getDb();
    db.blogs = (db.blogs || []).filter(b => b.id !== blogId);
    saveDb(db);
};