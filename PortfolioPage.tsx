import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import RecentWorks from './components/RecentWorks';
import Roadmap from './components/Roadmap';
import Experience from './components/Experience';
import Education from './components/Education';
import Skills from './components/Skills';
import Testimonials from './components/Testimonials';
import Blogs from './components/Blogs';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AnimatedSection from './components/AnimatedSection';

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
} from './lib/api';

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
} from './types';


const PortfolioPage: React.FC = () => {
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
                setBlogs(blogItems);

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
                
                {portfolioData?.projects.length > 0 && (
                     <AnimatedSection>
                        <RecentWorks data={portfolioData.projects} />
                    </AnimatedSection>
                )}

                <AnimatedSection id="process">
                    <Roadmap />
                </AnimatedSection>

                {portfolioData?.services.length > 0 && (
                    <AnimatedSection>
                        <Services data={portfolioData.services} />
                    </AnimatedSection>
                )}

                {portfolioData?.experiences.length > 0 && (
                    <AnimatedSection>
                        <Experience data={portfolioData.experiences} />
                    </AnimatedSection>
                )}
                
                {portfolioData?.educations.length > 0 && (
                     <AnimatedSection>
                        <Education data={portfolioData.educations} />
                    </AnimatedSection>
                )}

                {portfolioData?.skills.length > 0 && (
                    <AnimatedSection>
                        <Skills data={portfolioData.skills} />
                    </AnimatedSection>
                )}

                {portfolioData?.testimonials.length > 0 && (
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