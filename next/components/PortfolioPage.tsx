
import { useState, useEffect } from 'react';
import Header from './Header';
import Hero from './Hero';
import Services from './Services';
import RecentWorks from './RecentWorks';
import Roadmap from './Roadmap';
import Experience from './Experience';
import Education from './Education';
import Skills from './Skills';
import Testimonials from './Testimonials';
import Blogs from './Blogs';
import Contact from './Contact';
import Footer from './Footer';
import AnimatedSection from './AnimatedSection';
import Loader from './Loader';
import HeroSkeleton from './skeletons/HeroSkeleton';
import ServicesSkeleton from './skeletons/ServicesSkeleton';
import ProjectsSkeleton from './skeletons/ProjectsSkeleton';

import {
    getHeroData,
    getServicesData,
    getProjectsData,
    getExperiencesData,
    getEducationsData,
    getSkillsData,
    getTestimonialsData,
    getContactData,
    getBlogs,
} from '@/lib/api';

import {
    HeroData,
    Service,
    Project,
    Experience as ExperienceType,
    Education as EducationType,
    Skill,
    Testimonial,
    ContactData as ContactDataType,
    PortfolioData,
    Blog
} from '@/types';


const PortfolioPage = () => {
    const [loading, setLoading] = useState(true);
    const [heroLoaded, setHeroLoaded] = useState(false);
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [blogs, setBlogs] = useState<Blog[] | null>(null);
    const [sectionsLoaded, setSectionsLoaded] = useState({
        hero: false,
        services: false,
        projects: false,
        experiences: false,
        educations: false,
        skills: false,
        testimonials: false,
        contact: false,
    });

    // Load hero data first (critical above-the-fold content)
    useEffect(() => {
        let cancelled = false;
        const loadHeroData = async () => {
            try {
                const hero = await getHeroData();
                if (cancelled) return;

                setPortfolioData({
                    hero,
                    services: [],
                    projects: [],
                    experiences: [],
                    educations: [],
                    skills: [],
                    testimonials: [],
                    contact: null,
                });

                setSectionsLoaded(prev => ({ ...prev, hero: true }));
                setHeroLoaded(true);
                setLoading(false);

                // Emit event for preloader
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('portfolio:ready'));
                }
            } catch (error) {
                if (!cancelled) setLoading(false);
            }
        };

        loadHeroData();
        return () => { cancelled = true; };
    }, []);

    // Load remaining sections progressively
    useEffect(() => {
        if (!heroLoaded) return;

        const timers: ReturnType<typeof setTimeout>[] = [];
        let cancelled = false;

        const loadSection = async (
            sectionName: keyof typeof sectionsLoaded,
            loadFn: () => Promise<any>,
            dataKey: keyof PortfolioData
        ) => {
            try {
                const data = await loadFn();
                if (cancelled) return;
                setPortfolioData(prev => prev ? { ...prev, [dataKey]: data } : null);
                setSectionsLoaded(prev => ({ ...prev, [sectionName]: true }));
            } catch {
                if (!cancelled) setSectionsLoaded(prev => ({ ...prev, [sectionName]: true }));
            }
        };

        // Load sections in priority order with small delays
        const loadSections = async () => {
            // High priority sections (visible above fold)
            await loadSection('services', getServicesData, 'services');
            if (cancelled) return;

            timers.push(setTimeout(() => loadSection('projects', getProjectsData, 'projects'), 100));
            timers.push(setTimeout(() => loadSection('experiences', getExperiencesData, 'experiences'), 200));
            timers.push(setTimeout(() => loadSection('contact', getContactData, 'contact'), 300));

            // Lower priority sections
            timers.push(setTimeout(() => loadSection('educations', getEducationsData, 'educations'), 400));
            timers.push(setTimeout(() => loadSection('skills', getSkillsData, 'skills'), 500));
            timers.push(setTimeout(() => loadSection('testimonials', getTestimonialsData, 'testimonials'), 600));

            // Load blogs separately
            timers.push(setTimeout(async () => {
                try {
                    if (cancelled) return;
                    const blogItems = await getBlogs();
                    if (cancelled) return;
                    const fallbackBlogs: Blog[] = [
                        {
                            id: 'yt-1',
                            title: 'YouTube Studio App Redesign — UI Case Study',
                            author: 'Priyesh Mishra',
                            content: 'A creator-centric UI case study where I redesigned the YouTube Studio mobile app to make analytics and channel management more intuitive and visually appealing.',
                            excerpt: 'Redesigning YouTube Studio for clearer analytics and faster on-the-go tasks.',
                            url: 'https://priyeshmishra1602.medium.com/youtube-studio-app-redesign-ui-case-study-by-priyesh-mishra-d4a7158563eb',
                            thumbnail: { url: '/images/Youtube_Studio_App_redesign_UI%20Case_Study.webp', alternativeText: 'YouTube Studio App redesign UI case study' },
                            publishedAt: new Date('2025-10-28').toISOString(),
                        },
                        {
                            id: 'ga-1',
                            title: 'The Graphic Advantage: How Visual Storytelling Boosts ROI in Today’s Market',
                            author: 'Priyesh Mishra',
                            content: 'In today’s hyper-competitive landscape, businesses need more than just a good product or service to succeed. They need a strong visual identity that resonates with their target audience and drives significant return on investment (ROI). This is where graphic design becomes an essential weapon in the arsenal of any modern business, be it a fledgling startup or an established corporation.',
                            excerpt: 'Why visual storytelling is a growth lever — and how design compounds ROI.',
                            url: 'https://priyeshmishra1602.medium.com/the-graphic-advantage-how-visual-storytelling-boosts-roi-in-todays-market-8b3b1dfaedfb',
                            thumbnail: { url: '/images/Graphic_Advantage.webp', alternativeText: 'The Graphic Advantage' },
                            publishedAt: new Date('2023-12-09').toISOString(),
                        },
                        {
                            id: 'ig-1',
                            title: 'Case Study: Growing an Instagram Following from 0 to 100,000 in 6 Months',
                            author: 'Priyesh Mishra',
                            content: 'To gain 100,000 followers on Instagram in 6 months by consistently posting videos and engaging with the audience.',
                            excerpt: 'The system behind scaling an Instagram audience to 100k in half a year.',
                            url: 'https://priyeshmishra1602.medium.com/case-study-growing-an-instagram-following-from-0-to-100-000-in-6-months-f18763ea8ef8',
                            thumbnail: { url: '/images/Spiritualtalksofficial.png', alternativeText: 'Instagram growth case study' },
                            publishedAt: new Date('2023-12-03').toISOString(),
                        },
                        {
                            id: 'fl-1',
                            title: 'Case Study: Forensic Library App UI Design by DesignXpo',
                            author: 'Priyesh Mishra',
                            content: 'To design a user interface for a forensic library app that is easy to use and navigate, and that provides users with quick and easy access to the forensic materials and ebooks they need.',
                            excerpt: 'Designing a dense library UI that stays simple, scannable, and fast.',
                            url: 'https://priyeshmishra1602.medium.com/case-study-forensic-library-app-ui-design-by-designxpo-719fe96acb11',
                            thumbnail: { url: '/images/Forensic_Library_App.webp', alternativeText: 'Forensic Library App UI' },
                            publishedAt: new Date('2023-10-30').toISOString(),
                        },
                        {
                            id: 'dv-1',
                            title: 'Application Where Skill Got Admired: Digital Video Sharing Platform',
                            author: 'Priyesh Mishra',
                            content: 'In this modern era, where almost everything is digitalized our project gives a platform to many people who wants to compete/ grow in their fields. It’s a people based entertainment service in which competitions will be held and one who got highest vote in a given interval wins the battle and will be greeted by a cash prize.',
                            excerpt: 'Building a video platform where creators compete and audiences decide.',
                            url: 'https://priyeshmishra1602.medium.com/application-where-skill-got-admired-digital-video-sharing-platform-395f469edd7f',
                            thumbnail: { url: '/images/Digital_App.webp', alternativeText: 'Digital video sharing platform' },
                            publishedAt: new Date('2021-12-30').toISOString(),
                        },
                    ];
                    setBlogs(blogItems?.length ? blogItems : fallbackBlogs);
                } catch {
                    // blogs load failure is non-fatal; section stays hidden
                }
            }, 700));
        };

        loadSections();
        return () => {
            cancelled = true;
            timers.forEach(id => clearTimeout(id));
        };
    }, [heroLoaded]);

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-dark-bg to-purple-900/20 text-white font-sans leading-relaxed selection:bg-brand-purple selection:text-white">
                <Header heroData={null} />
                <main>
                    <HeroSkeleton />
                    <ProjectsSkeleton />
                    <ServicesSkeleton />
                </main>
                <Footer heroData={null} />
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-dark-bg to-purple-900/20 text-white font-sans leading-relaxed selection:bg-brand-purple selection:text-white">
            <Header heroData={portfolioData?.hero || null} />
            <main>
                {/* Hero section - always show once loaded */}
                {portfolioData?.hero && (
                    <AnimatedSection>
                        <Hero data={portfolioData.hero} />
                    </AnimatedSection>
                )}

                {/* Services section - show skeleton until loaded */}
                {sectionsLoaded.services ? (
                    portfolioData?.services?.length > 0 && (
                        <AnimatedSection>
                            <Services data={portfolioData.services} />
                        </AnimatedSection>
                    )
                ) : (
                    <ServicesSkeleton />
                )}

                {/* Projects section - show skeleton until loaded */}
                {sectionsLoaded.projects ? (
                    portfolioData?.projects?.length > 0 && (
                        <AnimatedSection>
                            <RecentWorks data={portfolioData.projects} />
                        </AnimatedSection>
                    )
                ) : (
                    <ProjectsSkeleton />
                )}

                {/* Roadmap - no data dependency */}
                <AnimatedSection id="process">
                    <Roadmap />
                </AnimatedSection>

                {/* Experience section */}
                {sectionsLoaded.experiences && portfolioData?.experiences?.length > 0 && (
                    <AnimatedSection>
                        <Experience data={portfolioData.experiences} />
                    </AnimatedSection>
                )}

                {/* Education section */}
                {sectionsLoaded.educations && portfolioData?.educations?.length > 0 && (
                    <AnimatedSection>
                        <Education data={portfolioData.educations} />
                    </AnimatedSection>
                )}

                {/* Skills section */}
                {sectionsLoaded.skills && portfolioData?.skills?.length > 0 && (
                    <AnimatedSection>
                        <Skills data={portfolioData.skills} />
                    </AnimatedSection>
                )}

                {/* Testimonials section */}
                {sectionsLoaded.testimonials && portfolioData?.testimonials?.length > 0 && (
                    <AnimatedSection>
                        <Testimonials data={portfolioData.testimonials} />
                    </AnimatedSection>
                )}

                {/* Blogs section */}
                {blogs && blogs.length > 0 && (
                    <AnimatedSection>
                        <Blogs data={blogs} />
                    </AnimatedSection>
                )}

                {/* Contact section */}
                {sectionsLoaded.contact && portfolioData?.contact && (
                    <AnimatedSection>
                        <Contact data={portfolioData.contact} />
                    </AnimatedSection>
                )}
            </main>
            <Footer heroData={portfolioData?.hero || null} />
        </div>
    );
};

export default PortfolioPage;
