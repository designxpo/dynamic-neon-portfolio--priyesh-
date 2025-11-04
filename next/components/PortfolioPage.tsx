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
    // Modal state for testimonials "Read more"
    const [selectedTestimonial, setSelectedTestimonial] = useState<any | null>(null);

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

                console.log('[PortfolioPage] Educations loaded:', educations);

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
                                    (() => {
                                        const list = portfolioData.testimonials || [];
                                        const shouldMarquee = list.length > 3;
                                        const Card = (t: any) => (
                                            <div
                                                key={t.id + (Math.random().toString(36).slice(2))}
                                                className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-xs w-full text-center shadow-[0_8px_30px_rgba(123,95,255,0.15)] border border-white/15 transition-all hover:scale-[1.02]"
                                            >
                                                {t.avatar && (
                                                    <img
                                                        src={t.avatar}
                                                        alt={t.name}
                                                        className="w-20 h-20 rounded-full border border-white/20 mx-auto mb-5 object-cover"
                                                    />
                                                )}
                                                <p className="text-gray-200 italic mb-4 leading-relaxed clamp-3">“{t.message}”</p>
                                                {t.message && t.message.length > 160 && (
                                                    <button
                                                        type="button"
                                                        className="text-xs text-gray-400 hover:text-white/90 underline decoration-transparent hover:decoration-white/80"
                                                        onClick={() => setSelectedTestimonial(t)}
                                                        aria-label={`Read full testimonial from ${t.name}`}
                                                    >
                                                        Read more
                                                    </button>
                                                )}
                                                <h4 className="text-lg font-semibold text-white">{t.name}</h4>
                                                <span className="text-sm text-gray-400">{t.role}</span>
                                            </div>
                                        );

                                        if (!shouldMarquee) {
                                            return (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
                                                    {list.map((t) => (
                                                        <Card key={t.id} {...t} />
                                                    ))}
                                                </div>
                                            );
                                        }

                                        // Marquee mode for >3 testimonials: duplicate track and scroll
                                        return (
                                            <div className="relative overflow-hidden">
                                                <div className={`testimonials-track ${selectedTestimonial ? 'paused' : ''} gap-10`}
                                                     onMouseEnter={(e)=>{ /* hover pause handled by CSS */ }}
                                                     onMouseLeave={(e)=>{}}
                                                     style={{ ['--testimonial-speed' as any]: '70s' }}
                                                >
                                                    <div className="flex gap-10 pr-10">
                                                        {list.map((t) => (
                                                            <Card key={`a-${t.id}`} {...t} />
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-10">
                                                        {list.map((t) => (
                                                            <Card key={`b-${t.id}`} {...t} />
                                                        ))}
                                                    </div>
                                                </div>
                                                {/* Soft gradient edges */}
                                                <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-dark-bg/60 to-transparent" />
                                                <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-dark-bg/60 to-transparent" />
                                            </div>
                                        );
                                    })()
                                ) : (
                                                                                                                            <p className="text-center text-gray-400">No testimonials available.</p>
                                                                                                                        )}
                                                                                                                    </div>
                                                                                                                </section>
                                                                                                        </AnimatedSection>
                                                                                                )}

                {/* Testimonials Modal */}
                {selectedTestimonial && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                        role="dialog"
                        aria-modal="true"
                        onClick={() => setSelectedTestimonial(null)}
                    >
                        <div
                            className="relative w-full max-w-xl rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 text-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                aria-label="Close"
                                className="absolute top-3 right-3 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 px-2 py-1 text-sm"
                                onClick={() => setSelectedTestimonial(null)}
                            >
                                ✕
                            </button>

                            <div className="flex items-center gap-3 mb-3">
                                {selectedTestimonial.avatar && (
                                    <img
                                        src={selectedTestimonial.avatar}
                                        alt={selectedTestimonial.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                )}
                                <div>
                                    <h4 className="font-semibold">{selectedTestimonial.name}</h4>
                                    <span className="text-xs text-gray-400">{selectedTestimonial.role}</span>
                                </div>
                            </div>

                            <p className="text-sm leading-relaxed text-gray-300">“{selectedTestimonial.message}”</p>
                        </div>
                    </div>
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
