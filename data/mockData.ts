import {
    RawHeroData, RawService, RawProject, Experience, Education, RawSkill, RawTestimonial, RawContactData
} from '../types';
import { v4 as uuidv4 } from 'uuid';

export const mockHeroData: Omit<RawHeroData, 'profileImage'> = {
    name: 'Priyesh Mishra',
    title: 'UI/UX Designer & SMM Strategist',
    shortBio: "Priyesh Mishra is a passionate UI/UX Designer with 3+ years of experience crafting impactful digital experiences for SaaS, Fintech, eCommerce, and Spiritual brands. He blends creativity with strategy to build visually engaging, high-performing products and helps brands grow through smart storytelling.",
    ctaButtonText: "View My Work",
    ctaButtonLink: "#projects",
    stats: [
        { id: uuidv4(), label: "Experience", value: "3+ Years" },
        { id: uuidv4(), label: "Projects", value: "10+" },
        { id: uuidv4(), label: "Clients", value: "8+" },
        { id: uuidv4(), label: "Social Following", value: "160K+" }
    ]
};

export const mockServicesData: RawService[] = [
    { id: uuidv4(), title: 'UI/UX Design', description: 'UI/UX Design – Websites, mobile apps, dashboards', icon: 'UXIcon', order: 1 },
    { id: uuidv4(), title: 'Product Design', description: 'Product Design – Wireframes, prototypes, design systems', icon: 'ProductIcon', order: 2 },
    { id: uuidv4(), title: 'Social Media Strategy', description: 'Social Media Strategy – Content planning and engagement growth', icon: 'SocialIcon', order: 3 },
    { id: uuidv4(), title: 'Branding & Visual Identity', description: 'Branding & Visual Identity – Logo design, style guides, brand kits', icon: 'BrandingIcon', order: 4 },
];

export const mockProjectsData: RawProject[] = [
    {
        id: uuidv4(),
        title: 'Youtube Studio',
        category: 'UI/UX',
        descriptionShort: 'Redesigned the UI/UX of the YouTube Studio App to enhance creator experience and analytics visualization.',
        descriptionLong: "Redesigned the UI/UX of the YouTube Studio App to enhance creator experience, improve analytics visualization, and deliver a modern, responsive, and engaging interface. Focused on dashboard redesign, user-friendly navigation, and interactive data insights.",
        technologies: ['Figma', 'UX', 'Analytics'],
        liveUrl: '#',
        sourceUrl: '#',
        featured: true,
        coverImage: { url: '/images/Youtube studio.jpeg', alternativeText: 'Youtube Studio' },
    },
    {
        id: uuidv4(),
        title: 'TruCard-Fintech Platform UX Redesign',
        category: 'Product',
        descriptionShort: 'Clean and engaging UI/UX for a fintech product focused on bullion-secured cards.',
        descriptionLong: "Created a clean and engaging UI/UX for TruCard, a Delhi-based fintech offering bullion-secured cards and digital bullion transfers. Focused on enhancing financial accessibility, trust, and user engagement through intuitive layouts highlighting gold/silver savings, e-vouchers, and secure transactions.",
        technologies: ['Figma', 'Product Design', 'Research'],
        liveUrl: '#',
        sourceUrl: '#',
        featured: false,
        coverImage: { url: '/images/TruCard.png', alternativeText: 'TruCard' },
    },
    {
        id: uuidv4(),
        title: 'Equiwings.com',
        category: 'UI',
        descriptionShort: 'Storyline-driven UI/UX for an equestrian ecosystem.',
        descriptionLong: "Created a storyline-driven UI/UX for Equiwings, India’s leading equestrian ecosystem. Focused on brand vision, accessibility, and engagement, highlighting products, sponsors, events, and legacy while delivering a modern and professional user experience.",
        technologies: ['UI Design', 'Accessibility'],
        liveUrl: '#',
        sourceUrl: '#',
        featured: false,
        coverImage: { url: '/images/Equiwings.png', alternativeText: 'Equiwings' },
    },
    {
        id: uuidv4(),
        title: 'Spiritualtalksofficial Social Brand',
        category: 'SMM',
        descriptionShort: 'Scaled Instagram to 160,000+ followers using content strategy and storytelling.',
        descriptionLong: "Scaled Instagram to 160,000+ followers using content strategy and storytelling.",
        technologies: ['Content Strategy', 'Design'],
        liveUrl: '#',
        sourceUrl: '#',
        featured: false,
        coverImage: { url: '/images/Spiritualtalksofficial.png', alternativeText: 'Spiritual Talks' },
    },
];

export const mockExperiencesData: Experience[] = [
    {
        id: uuidv4(),
        positionTitle: 'UI/UX Designer',
        companyName: 'Scaletrix.AI',
        startYear: '2023',
        endYear: 'Present',
        description: 'Designed and optimized SaaS product experiences using user research and testing. Built scalable design systems aligned with accessibility standards.'
    },
    {
        id: uuidv4(),
        positionTitle: 'Freelance UI/UX Designer & SMM Strategist',
        companyName: 'Self-employed',
        startYear: '2021',
        endYear: '2023',
        description: 'Delivered UI/UX and branding solutions for clients across multiple industries. Helped spiritual and lifestyle brands grow their online communities.'
    },
    {
        id: uuidv4(),
        positionTitle: 'Social Media Lead',
        companyName: 'Spiritualtalksofficial',
        startYear: '2022',
        endYear: 'Present',
        description: 'Strategized content design and community growth to build an audience of over 160,000+ followers. Designed creative assets and engagement funnels for spiritual branding.'
    },
];

export const mockEducationsData: Education[] = [
    {
        id: uuidv4(),
        courseTitle: 'B.Tech in Computer Science & Engineering',
        instituteName: 'Galgotias University, Greater Noida',
        startYear: '2020',
        endYear: '2024',
        description: 'Specialized in UI/UX product design and usability testing. Completed certifications in Google Analytics, Heap Analytics, and Data Structures & Algorithms.'
    },
];

export const mockSkillsData: RawSkill[] = [
    { id: uuidv4(), skillName: 'Figma', skillIcon: '/images/Figma.png' },
    { id: uuidv4(), skillName: 'Adobe XD', skillIcon: '/images/AdobeXD.png' },
    { id: uuidv4(), skillName: 'Canva', skillIcon: '/images/Canva.png' },
    { id: uuidv4(), skillName: 'User Experience (UX)', skillIcon: '/images/UserExperience.png' },
    { id: uuidv4(), skillName: 'Heap Analytics', skillIcon: '/images/Heap.png' },
];

export const mockTestimonialsData: Omit<RawTestimonial, 'avatar'>[] = [
    {
        id: uuidv4(),
        clientName: "Pranab Mukherjee",
        roleCompany: 'Director at Trucard',
        quote: "Outstanding design work that drove measurable engagement improvements.",
    },
];

export const mockContactData: RawContactData = {
    heading: "Let's Work Together",
    description: "Have a project in mind? I'm always open to discussing new opportunities and creative ideas.",
    email: 'priyesh.mishra1602@gmail.com',
    phone: '+91 8368872108',
    socialLinks: [
      { id: uuidv4(), platform: 'LinkedIn', url: 'https://linkedin.com/in/priyeshmishra16', icon: 'LinkedInIcon' },
      { id: uuidv4(), platform: 'Instagram', url: 'https://instagram.com/designxpo.in', icon: 'InstagramIcon' },
      { id: uuidv4(), platform: 'X', url: 'https://twitter.com/mepriyeshm', icon: 'TwitterIcon' },
    ],
};