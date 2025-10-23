import React, { useState, useEffect } from 'react';
import { Skill, RawSkill } from '../../../types';
import { getSkillsData, updateSkills, convertFileToBase64 } from '../../../lib/api';
import Modal from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';
import { Edit2, Trash2, Plus, Award, Upload } from 'lucide-react';

const SkillsForm: React.FC = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<RawSkill | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getSkillsData();
        setSkills(data);
        setIsLoading(false);
    };

    const getIconName = (iconNode: React.ReactNode): string => {
        if (typeof iconNode === 'string') return iconNode;
        if (React.isValidElement(iconNode) && (iconNode.type as any).name) {
            return (iconNode.type as any).name;
        }
        return '';
    };

    const handleEdit = (skill: Skill) => {
        setCurrentItem({
            id: skill.id,
            skillName: skill.skillName,
            skillIcon: getIconName(skill.icon),
            image: skill.image || { url: '', alternativeText: '' },
        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setCurrentItem({
            id: uuidv4(),
            skillName: '',
            skillIcon: '',
            image: { url: '', alternativeText: '' },
        });
        setIsModalOpen(true);
    };
    
    const handleDelete = async (skillId: string) => {
        if (window.confirm('Are you sure you want to delete this skill?')) {
            const currentSkillsRaw = skills.map(s => ({ id: s.id, skillName: s.skillName, skillIcon: getIconName(s.icon) }));
            const updatedSkills = currentSkillsRaw.filter(s => s.id !== skillId);
            await updateSkills(updatedSkills);
            fetchData();
        }
    };

    const handleSave = async () => {
        if (!currentItem) return;
        setSaving(true);
        
        const currentSkillsRaw = skills.map(s => ({ id: s.id, skillName: s.skillName, skillIcon: getIconName(s.icon) }));

        const isNew = !currentSkillsRaw.some(s => s.id === currentItem.id);
        const updatedSkills = isNew
            ? [...currentSkillsRaw, currentItem]
            : currentSkillsRaw.map(s => (s.id === currentItem.id ? currentItem : s));

        await updateSkills(updatedSkills);
        await fetchData(); // Refetch to get updated data with ReactNodes
        setSaving(false);
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    if (isLoading) return (
        <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading skills...</div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-white">Manage Skills</h3>
                    <p className="text-gray-400 text-sm mt-1">Manage your technical and professional skills</p>
                </div>
                <button 
                    onClick={handleAddNew} 
                    className="admin-button-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add New Skill
                </button>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {skills.map((skill) => (
                    <div key={skill.id} className="admin-card group">
                        <div className="flex flex-col items-center text-center gap-3">
                            {skill.image?.url ? (
                                <img src={skill.image.url} alt={skill.skillName} className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                                <div className="text-electric-blue text-3xl">
                                    <Award size={32} />
                                </div>
                            )}
                            <p className="font-semibold text-white">{skill.skillName}</p>
                            <div className="flex items-center gap-2">
                                {skill.image?.url ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-xl bg-electric-blue/10 text-electric-blue border border-electric-blue/20">
                                        Custom Logo
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-gray-400 border border-white/10">
                                        Default Icon
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEdit(skill)} 
                                className="admin-icon-button"
                                title="Edit"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button 
                                onClick={() => handleDelete(skill.id)} 
                                className="admin-button-danger p-1.5"
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem?.id && skills.some(s => s.id === currentItem.id) ? 'Edit Skill' : 'Add Skill'}>
                {currentItem && (
                    <div className="space-y-6">
                        <div>
                            <label className="admin-label">Skill Name</label>
                            <input 
                                type="text" 
                                value={currentItem.skillName} 
                                onChange={e => setCurrentItem(p => p ? {...p, skillName: e.target.value} : null)} 
                                className="admin-input"
                                placeholder="e.g., React, Python, AWS"
                            />
                        </div>
                        <div>
                            <label className="admin-label">Icon Name</label>
                            <input 
                                type="text" 
                                value={currentItem.skillIcon} 
                                onChange={e => setCurrentItem(p => p ? {...p, skillIcon: e.target.value} : null)} 
                                className="admin-input"
                                placeholder="e.g., ReactIcon"
                            />
                            <p className="text-xs text-gray-500 mt-1">Icon component name from your icons library</p>
                        </div>
                        <div className="admin-card">
                            <label className="admin-label">Skill Image (Optional)</label>
                            {currentItem.image?.url && (
                                <img 
                                    src={currentItem.image.url} 
                                    alt="Skill Preview" 
                                    className="w-24 h-24 rounded-lg object-cover border border-white/10 mb-4"
                                />
                            )}
                            <div className="flex gap-3">
                                <label className="admin-button-secondary flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={async (e) => {
                                            if (e.target.files && e.target.files[0] && currentItem) {
                                                try {
                                                    const base64 = await convertFileToBase64(e.target.files[0]);
                                                    setCurrentItem({ ...currentItem, image: { ...currentItem.image, url: base64 } });
                                                } catch (error) {
                                                    console.error("Image conversion error:", error);
                                                }
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    <Upload size={18} />
                                    Upload Image
                                </label>
                                {currentItem.image?.url && (
                                    <button 
                                        type="button" 
                                        onClick={() => setCurrentItem(p => p ? {...p, image: { url: '', alternativeText: '' }} : null)} 
                                        className="admin-button-danger"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Recommended size: 64x64 pixels</p>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="admin-button-secondary"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave} 
                                disabled={saving} 
                                className="admin-button-primary"
                            >
                                {saving ? 'Saving...' : 'Save Skill'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SkillsForm;