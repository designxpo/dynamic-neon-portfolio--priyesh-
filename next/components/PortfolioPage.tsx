
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from './Header';
import Hero from './Hero';
import Services from './Services';
import RecentWorks from './RecentWorks';
import Roadmap from './Roadmap';
import Experience from './Experience';
import Education from './Education';
import Skills from './Skills';
import Blogs from './Blogs';
import Contact from './Contact';
import Footer from './Footer';
import AnimatedSection from './AnimatedSection';
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

            // Load blogs separately with fallback
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
                    // blogs load failure is non-fatal
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
                    <AnimatedSection>
                        <Services data={portfolioData?.services || []} />
                    </AnimatedSection>
                ) : (
                    <ServicesSkeleton />
                )}

                {/* Projects section - show skeleton until loaded */}
                {sectionsLoaded.projects ? (
                    <AnimatedSection>
                        <RecentWorks data={portfolioData?.projects || []} />
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
                        <Experience data={portfolioData?.experiences || []} />
                    </AnimatedSection>
                )}

                {/* Education section */}
                {sectionsLoaded.educations && (
                    <AnimatedSection>
                        <Education data={portfolioData?.educations || []} />
                    </AnimatedSection>
                )}

                {/* Skills section */}
                {sectionsLoaded.skills && (
                    <AnimatedSection>
                        <section className='relative py-20 bg-transparent overflow-hidden'>
                            <Skills data={portfolioData?.skills || []} />
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
                                {portfolioData?.testimonials && portfolioData.testimonials.length > 0 ? (
                                    (() => {
                                        const list = portfolioData.testimonials || [];
                                        const shouldMarquee = list.length > 3;
                                        const Card = (t: any) => (
                                            <div
                                                className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-xs w-full text-center shadow-[0_8px_30px_rgba(123,95,255,0.15)] border border-white/15 transition-all hover:scale-[1.02]"
                                            >
                                                {t.avatar && (
                                                    <Image
                                                        src={t.avatar}
                                                        alt={t.name}
                                                        width={80}
                                                        height={80}
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
                                    <Image
                                        src={selectedTestimonial.avatar}
                                        alt={selectedTestimonial.name}
                                        width={40}
                                        height={40}
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

                {/* Contact section - ✅ Contact section - dynamic from MongoDB, fallback if missing */}
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
            <Footer heroData={portfolioData?.hero || null} />
        </div>
    );
};

export default PortfolioPage;
