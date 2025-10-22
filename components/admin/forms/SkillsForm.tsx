import React, { useState, useEffect } from 'react';
import { Skill, RawSkill } from '../../../types';
import { getSkillsData, updateSkills } from '../../../lib/api';
import Modal from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

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
        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setCurrentItem({
            id: uuidv4(),
            skillName: '',
            skillIcon: '',
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

    if (isLoading) return <div>Loading skills...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Manage Skills</h3>
                <button onClick={handleAddNew} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    Add New Skill
                </button>
            </div>
            <div className="space-y-2">
                {skills.map((skill) => (
                    <div key={skill.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                        <div className="flex items-center gap-4">
                            <span className="text-brand-purple text-2xl">{skill.icon}</span>
                            <p className="font-semibold text-gray-800">{skill.skillName}</p>
                        </div>
                         <div className="space-x-2">
                            <button onClick={() => handleEdit(skill)} className="text-sm text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => handleDelete(skill.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem?.id && skills.some(s => s.id === currentItem.id) ? 'Edit Skill' : 'Add Skill'}>
               {currentItem && (
                    <div className="space-y-4 text-gray-800">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Skill Name</label>
                            <input type="text" value={currentItem.skillName} onChange={e => setCurrentItem(p => p ? {...p, skillName: e.target.value} : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Icon Name (e.g., ReactIcon)</label>
                            <input type="text" value={currentItem.skillIcon} onChange={e => setCurrentItem(p => p ? {...p, skillIcon: e.target.value} : null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-brand-purple-light disabled:bg-gray-400">
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SkillsForm;