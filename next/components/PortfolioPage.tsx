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

        const loadAllSections = async () => {
            try {
                const results = await Promise.allSettled([
                    getServicesData(),
                    getProjectsData(),
                    getExperiencesData(),
                    getContactData(),
                    getEducationsData(),
                    getSkillsData(),
                    getTestimonialsData(),
                    getBlogs(),
                ]);

                const services = results[0].status === 'fulfilled' ? results[0].value : [];
                const projects = results[1].status === 'fulfilled' ? results[1].value : [];
                const experiences = results[2].status === 'fulfilled' ? results[2].value : [];
                const contact = results[3].status === 'fulfilled' ? results[3].value : null;
                const educations = results[4].status === 'fulfilled' ? results[4].value : [];
                const skills = results[5].status === 'fulfilled' ? results[5].value : [];
                const testimonials = results[6].status === 'fulfilled' ? results[6].value : [];
                const blogItems = results[7].status === 'fulfilled' ? results[7].value : [];

                // Log any rejected promises for visibility without blocking UI
                results.forEach((r, idx) => {
                    if (r.status === 'rejected') {
                        const names = ['services','projects','experiences','contact','educations','skills','testimonials','blogs'];
                        console.warn(`PortfolioPage: Failed to load ${names[idx]}:`, r.reason);
                    }
                });

                setPortfolioData(prev => prev ? {
                    ...prev,
                    services,
                    projects,
                    experiences,
                    contact,
                    educations,
                    skills,
                    testimonials,
                } : null);

                // Mark all as loaded to remove skeletons; empty datasets will render gracefully
                setSectionsLoaded({
                    hero: true,
                    services: true,
                    projects: true,
                    experiences: true,
                    educations: true,
                    skills: true,
                    testimonials: true,
                    contact: true,
                });

                setBlogs(blogItems);
            } catch (error) {
                console.error('Error loading sections:', error);
            }
        };

        loadAllSections();
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
                    <AnimatedSection>
                        <Services data={portfolioData.services || []} />
                    </AnimatedSection>
                ) : (
                    <ServicesSkeleton />
                )}

                {/* Projects section - show skeleton until loaded */}
                {sectionsLoaded.projects ? (
                    <AnimatedSection>
                        <RecentWorks data={portfolioData.projects || []} />
                    </AnimatedSection>
                ) : (
                    <ProjectsSkeleton />
                )}

                {/* Roadmap - no data dependency */}
                <AnimatedSection id="process">
                    <Roadmap />
                </AnimatedSection>

                {/* Experience section */}
                {sectionsLoaded.experiences && (
                    <AnimatedSection>
                        <Experience data={portfolioData.experiences || []} />
                    </AnimatedSection>
                )}
                
                {/* Education section */}
                {sectionsLoaded.educations && (
                    <AnimatedSection>
                        <Education data={portfolioData.educations || []} />
                    </AnimatedSection>
                )}

                {/* Skills section */}
                {sectionsLoaded.skills && (
                    <AnimatedSection>
                        <section className='relative py-20 bg-transparent overflow-hidden'>
                            <Skills data={portfolioData.skills || []} />
                        </section>
                    </AnimatedSection>
                )}

                                                                                                {/* Testimonials section */}
                {sectionsLoaded.testimonials && (
                    <AnimatedSection>
                        <section
                            id="testimonials"
                            className="relative py-20 bg-transparent"
                            style={{
                                position: 'relative',
                                zIndex: 1,
                            }}
                        >
                            <div
                                aria-hidden
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    zIndex: 0,
                                    pointerEvents: 'none',
                                    background: 'radial-gradient(ellipse at 50% 30%, rgba(123,95,255,0.12) 0%, rgba(123,95,255,0.04) 60%, transparent 100%)',
                                    filter: 'blur(12px)',
                                }}
                            />
                            <div className="container mx-auto px-6 text-center">
                                <h2 className="text-4xl md:text-5xl font-extrabold mb-16 bg-gradient-to-r from-white to-[#7b5fff] bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    <span className="text-white">What </span><span className="text-[#7b5fff]">Clients</span><span className="text-white"> Say</span>
                                </h2>
                                {portfolioData.testimonials && portfolioData.testimonials.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
                                        {portfolioData.testimonials.map((t) => (
                                            <div
                                                key={t.id}
                                                className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-xs w-full text-center shadow-[0_8px_30px_rgba(123,95,255,0.15)] border border-white/15 transition-all hover:scale-[1.02]"
                                            >
                                                {t.avatar && (
                                                    <img
                                                        src={t.avatar}
                                                        alt={t.name}
                                                        className="w-20 h-20 rounded-full border border-white/20 mx-auto mb-5 object-cover"
                                                    />
                                                )}
                                                <p className="text-gray-200 italic mb-4 leading-relaxed">“{t.message}”</p>
                                                <h4 className="text-lg font-semibold text-white">{t.name}</h4>
                                                <span className="text-sm text-gray-400">{t.role}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                                                                                                            <p className="text-center text-gray-400">No testimonials available.</p>
                                                                                                                        )}
                                                                                                                    </div>
                                                                                                                </section>
                                                                                                        </AnimatedSection>
                                                                                                )}

                {/* Blogs section */}
                {blogs && blogs.length > 0 && (
                    <AnimatedSection>
                        <Blogs data={blogs} />
                    </AnimatedSection>
                )}

                {/* Contact section */}
                                {/* Contact section - FORCE SHOW for Debug */}
                                                {/* ✅ Contact section - dynamic from MongoDB, fallback if missing */}
                                                {sectionsLoaded.contact && (
                                                    <AnimatedSection>
                                                        {portfolioData?.contact ? (
                                                            <Contact data={portfolioData.contact} />
                                                        ) : (
                                                            <Contact data={{
                                                                heading: 'Let’s Connect',
                                                                description: 'Fill out the form below or reach out via email/socials. I’ll get back to you soon!',
                                                                email: 'hello@example.com',
                                                                phone: '+1-000-000-0000',
                                                                socialLinks: [],
                                                            }} />
                                                        )}
                                                    </AnimatedSection>
                                                )}
            </main>
            <Footer heroData={portfolioData?.hero || null}/>
        </div>
    );
};

export default PortfolioPage;
