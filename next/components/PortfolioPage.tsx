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
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [blogs, setBlogs] = useState<Blog[] | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                console.log('PortfolioPage: Fetching all data...');
                const [
                    hero, 
                    services, 
                    projects,
                    experiences,
                    educations,
                    skills,
                    testimonials,
                    contact,
                    blogItems
                ] = await Promise.all([
                    getHeroData(),
                    getServicesData(),
                    getProjectsData(),
                    getExperiencesData(),
                    getEducationsData(),
                    getSkillsData(),
                    getTestimonialsData(),
                    getContactData(),
                    getBlogs(),
                ]);
                
                console.log('PortfolioPage: Hero data loaded:', hero);
                
                setPortfolioData({
                    hero,
                    services,
                    projects,
                    experiences,
                    educations,
                    skills,
                    testimonials,
                    contact,
                });
                // Fallback: if no blogs in DB/localStorage, seed with temporary dummy posts for testing
                const fallbackBlogs: Blog[] = [
                    {
                        id: 'dummy-1',
                        title: 'How I Design Fast Without Breaking UX',
                        author: 'Priyesh Mishra',
                        content: 'Rapid design doesn’t mean careless. Here’s my tight loop that balances speed with quality.',
                        excerpt: 'A short system for moving from idea to validated UI quickly.',
                        url: 'https://example.com/blog/design-fast',
                        thumbnail: { url: 'https://picsum.photos/id/1005/800/450', alternativeText: 'Design fast' },
                        publishedAt: new Date().toISOString(),
                    },
                    {
                        id: 'dummy-2',
                        title: '3 Portfolio Case Study Patterns That Work',
                        author: 'Priyesh Mishra',
                        content: 'Patterns that make case studies readable and persuasive—without fluff.',
                        excerpt: 'Make your work easy to understand and remember with these simple sections.',
                        url: 'https://example.com/blog/case-studies',
                        thumbnail: { url: 'https://picsum.photos/id/1011/800/450', alternativeText: 'Case studies' },
                        publishedAt: new Date(Date.now() - 86400000).toISOString(),
                    },
                    {
                        id: 'dummy-3',
                        title: 'Visual Consistency: Small Rules, Big Impact',
                        author: 'Priyesh Mishra',
                        content: 'A few consistent choices compound into trust and clarity across your product.',
                        excerpt: 'A checklist I use for spacing, type, color and motion to keep products coherent.',
                        url: 'https://example.com/blog/visual-consistency',
                        thumbnail: { url: 'https://picsum.photos/id/1016/800/450', alternativeText: 'Consistency' },
                        publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
                    },
                ];

                setBlogs((blogItems && blogItems.length > 0) ? blogItems : fallbackBlogs);

            } catch (error) {
                console.error("Failed to fetch portfolio data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">
                Loading Portfolio...
            </div>
        );
    }
    
    return (
        <div className="bg-gradient-to-br from-dark-bg to-purple-900/20 text-white font-sans leading-relaxed selection:bg-brand-purple selection:text-white">
            <Header heroData={portfolioData?.hero || null} />
            <main>
                {portfolioData?.hero && <Hero data={portfolioData.hero} />}
                
                {portfolioData?.projects?.length > 0 && (
                     <AnimatedSection>
                        <RecentWorks data={portfolioData.projects} />
                    </AnimatedSection>
                )}

                <AnimatedSection id="process">
                    <Roadmap />
                </AnimatedSection>

                {portfolioData?.services?.length > 0 && (
                    <AnimatedSection>
                        <Services data={portfolioData.services} />
                    </AnimatedSection>
                )}

                {portfolioData?.experiences?.length > 0 && (
                    <AnimatedSection>
                        <Experience data={portfolioData.experiences} />
                    </AnimatedSection>
                )}
                
                {portfolioData?.educations?.length > 0 && (
                     <AnimatedSection>
                        <Education data={portfolioData.educations} />
                    </AnimatedSection>
                )}

                {portfolioData?.skills?.length > 0 && (
                    <AnimatedSection>
                        <Skills data={portfolioData.skills} />
                    </AnimatedSection>
                )}

                {portfolioData?.testimonials?.length > 0 && (
                    <AnimatedSection>
                        <Testimonials data={portfolioData.testimonials} />
                    </AnimatedSection>
                )}

                {(blogs && blogs.length > 0) && (
                    <AnimatedSection>
                        <Blogs data={blogs} />
                    </AnimatedSection>
                )}

                {portfolioData?.contact && (
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
