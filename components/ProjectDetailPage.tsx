import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { getProjectById } from '../lib/api';
import { ExternalLinkIcon, GitHubIcon } from './icons/Icons';

interface ProjectDetailPageProps {
    projectId: string;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ projectId }) => {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const data = await getProjectById(projectId);
                if (data) {
                    setProject(data);
                } else {
                    setError('Project not found.');
                }
            } catch (err) {
                setError('Failed to fetch project details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">
                Loading Project...
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-white">
                <p className="text-red-500 text-2xl mb-4">{error}</p>
                 <a href="/#" className="bg-brand-purple text-white px-6 py-2 rounded-lg hover:bg-brand-purple-light transition-colors">
                    Back to Portfolio
                </a>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="bg-dark-bg text-white min-h-screen font-sans">
             <header className="py-4 bg-dark-bg/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-10">
                <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
                    <a href="/#" className="text-lg font-semibold hover:text-brand-purple transition-colors">&larr; Back to Portfolio</a>
                </div>
            </header>
            <main className="container mx-auto px-4 md:px-8 py-8 md:py-12 xl:py-16">
                <div className="max-w-4xl xl:max-w-6xl mx-auto">
                    <span className="text-xs md:text-sm bg-brand-purple/20 text-brand-purple-light px-3 py-1 rounded-full self-start mb-4 inline-block">{project.category}</span>
                    <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold mb-6">{project.title}</h1>

                    <div className="mb-6 md:mb-8 rounded-lg overflow-hidden border-2 border-brand-purple/30 shadow-glow-purple">
                        <img
                            src={project.coverImage.url}
                            alt={project.coverImage.alternativeText || project.title}
                            className="w-full h-auto object-cover"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        <div className="md:col-span-2">
                             <h2 className="text-xl md:text-2xl font-bold mb-4 text-brand-purple-light">About the Project</h2>
                             <div className="prose prose-invert prose-lg text-gray-300">
                                <p className="text-sm md:text-base">{project.descriptionLong || project.descriptionShort}</p>
                             </div>
                        </div>
                        <div className="md:col-span-1">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                                <h3 className="text-lg md:text-xl font-bold mb-4">Technologies</h3>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {(project.technologies || []).map(tech => (
                                        <span key={tech} className="bg-gray-700 text-gray-200 text-xs md:text-sm px-3 py-1 rounded-full">{tech}</span>
                                    ))}
                                </div>
                                <div className="space-y-3">
                                    {project.liveUrl && (
                                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-purple-light hover:text-brand-purple transition-colors w-full bg-brand-purple/20 hover:bg-brand-purple/30 px-4 py-2 rounded-lg text-sm md:text-base">
                                            <ExternalLinkIcon />
                                            <span>View Live Project</span>
                                        </a>
                                    )}
                                     {project.sourceUrl && (
                                        <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-purple-light hover:text-brand-purple transition-colors w-full bg-brand-purple/20 hover:bg-brand-purple/30 px-4 py-2 rounded-lg text-sm md:text-base">
                                            <GitHubIcon />
                                            <span>View Source Code</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectDetailPage;