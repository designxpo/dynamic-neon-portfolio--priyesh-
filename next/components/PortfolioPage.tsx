// @ts-nocheck
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
        const loadHeroData = async () => {
            try {
                console.log('PortfolioPage: Loading hero data...');
                const hero = await getHeroData();
                
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
                
                console.log('PortfolioPage: Hero data loaded');
            } catch (error) {
                console.error('Error loading hero data:', error);
                setLoading(false);
            }
        };

        loadHeroData();
    }, []);

    // Load remaining sections progressively
    useEffect(() => {
        if (!heroLoaded) return;

        const loadSection = async (
            sectionName: keyof typeof sectionsLoaded,
            loadFn: () => Promise<any>,
            dataKey: keyof PortfolioData
        ) => {
            try {
                console.log(`Loading ${sectionName}...`);
                const data = await loadFn();
                
                setPortfolioData(prev => prev ? { ...prev, [dataKey]: data } : null);
                setSectionsLoaded(prev => ({ ...prev, [sectionName]: true }));
                
                console.log(`${sectionName} loaded`);
            } catch (error) {
                console.error(`Error loading ${sectionName}:`, error);
                setSectionsLoaded(prev => ({ ...prev, [sectionName]: true })); // Mark as "loaded" to hide skeleton
            }
        };

        // Load sections in priority order with small delays
        const loadSections = async () => {
            // High priority sections (visible above fold)
            await loadSection('services', getServicesData, 'services');
            
            setTimeout(() => loadSection('projects', getProjectsData, 'projects'), 100);
            setTimeout(() => loadSection('experiences', getExperiencesData, 'experiences'), 200);
            setTimeout(() => loadSection('contact', getContactData, 'contact'), 300);
            
            // Lower priority sections
            setTimeout(() => loadSection('educations', getEducationsData, 'educations'), 400);
            setTimeout(() => loadSection('skills', getSkillsData, 'skills'), 500);
            setTimeout(() => loadSection('testimonials', getTestimonialsData, 'testimonials'), 600);
            
            // Load blogs separately
            setTimeout(async () => {
                try {
                    const blogItems = await getBlogs();
                    const fallbackBlogs: Blog[] = [
                        {
                            id: 'dummy-1',
                            title: 'How I Design Fast Without Breaking UX',
                            author: 'Priyesh Mishra',
                            content: 'Rapid design doesn\'t mean careless. Here\'s my tight loop that balances speed with quality.',
                            excerpt: 'A short system for moving from idea to validated UI quickly.',
                            url: 'https://example.com/blog/design-fast',
                            thumbnail: { url: 'https://picsum.photos/id/1005/800/450', alternativeText: 'Design fast' },
                            publishedAt: new Date().toISOString(),
                        },
                        {
                            id: 'dummy-2',
                            title: 'The Future of Design Systems',
                            author: 'Priyesh Mishra',
                            content: 'Design systems are evolving. Here\'s what\'s coming next.',
                            excerpt: 'Exploring the next generation of design systems and component libraries.',
                            url: 'https://example.com/blog/future-design-systems',
                            thumbnail: { url: 'https://picsum.photos/id/1006/800/450', alternativeText: 'Design systems' },
                            publishedAt: new Date().toISOString(),
                        }
                    ];
                    setBlogs(blogItems?.length ? blogItems : fallbackBlogs);
                } catch (error) {
                    console.error('Error loading blogs:', error);
                }
            }, 700);
        };

        loadSections();
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
                    portfolioData.services?.length > 0 && (
                        <AnimatedSection>
                            <Services data={portfolioData.services} />
                        </AnimatedSection>
                    )
                ) : (
                    <ServicesSkeleton />
                )}

                {/* Projects section - show skeleton until loaded */}
                {sectionsLoaded.projects ? (
                    portfolioData.projects?.length > 0 && (
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
                {sectionsLoaded.experiences && portfolioData.experiences?.length > 0 && (
                    <AnimatedSection>
                        <Experience data={portfolioData.experiences} />
                    </AnimatedSection>
                )}
                
                {/* Education section */}
                {sectionsLoaded.educations && portfolioData.educations?.length > 0 && (
                    <AnimatedSection>
                        <Education data={portfolioData.educations} />
                    </AnimatedSection>
                )}

                {/* Skills section */}
                {sectionsLoaded.skills && portfolioData.skills?.length > 0 && (
                    <AnimatedSection>
                        <Skills data={portfolioData.skills} />
                    </AnimatedSection>
                )}

                {/* Testimonials section */}
                {sectionsLoaded.testimonials && portfolioData.testimonials?.length > 0 && (
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
                {sectionsLoaded.contact && portfolioData.contact && (
                    <AnimatedSection>
                        <Contact data={portfolioData.contact} />
                    </AnimatedSection>
                )}
            </main>
            <Footer heroData={portfolioData?.hero || null}/>
        </div>
    );
};

export default PortfolioPage;
