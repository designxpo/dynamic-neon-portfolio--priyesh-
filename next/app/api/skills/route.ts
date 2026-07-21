
import { NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/db';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  try {
    await dbConnect();
    const Skill = (await import('../../../models/Skill')).default;
    // Only select needed fields for faster response
    const skills = await Skill.find({}, {
      name: 1,
      icon: 1,
      order: 1,
      image: 1,
      _id: 1
    }).sort({ order: 1 }).lean();
    return NextResponse.json(skills);
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch skills', details: error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  try {
    await dbConnect();
    const Skill = (await import('../../../models/Skill')).default;
    const data = await request.json();
    console.log('[DEBUG][API] Received POST data:', data);
    // Ensure image field is present
    const skillData = {
      name: data.name || '',
      icon: data.icon || '',
      order: data.order || 0,
      image: data.image || { url: '', alternativeText: '' },
    };
    const skill = await Skill.create(skillData);
    console.log('[DEBUG][API] Inserted skill:', skill);
    return NextResponse.json(skill);
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Failed to create skill', details: error }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  try {
    await dbConnect();
    const Skill = (await import('../../../models/Skill')).default;
    const skillsArray = await request.json();
    console.log('[DEBUG][API] Received PUT data:', skillsArray);
    if (!Array.isArray(skillsArray)) throw new Error('Expected array of skills');

    // Remove all existing skills
    await Skill.deleteMany({});

    // Map frontend fields to backend model fields and insert
    const mappedSkills = skillsArray.map(s => ({
      name: s.name || '',
      icon: s.icon || '',
      order: s.order || 0,
      image: s.image || { url: '', alternativeText: '' },
    }));
    console.log('[DEBUG][API] Mapped skills for insert:', mappedSkills);
    const inserted = await Skill.insertMany(mappedSkills);
    console.log('[DEBUG][API] Inserted skills:', inserted);
    return NextResponse.json(inserted);
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Failed to update skills', details: error }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  try {
    await dbConnect();
    const Skill = (await import('../../../models/Skill')).default;
    const { id } = await request.json();
    await Skill.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Failed to delete skill', details: error }, { status: 500 });
  }
}
