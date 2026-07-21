import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Project from '@/models/Project';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  const start = Date.now();
  await connectDB();
  const projects = await Project.find({}, {
    title: 1,
    descriptionShort: 1,
    descriptionLong: 1,
    category: 1,
    categories: 1,
    coverImage: 1,
    featured: 1,
    technologies: 1,
    liveUrl: 1,
    sourceUrl: 1,
    createdAt: 1,
    _id: 1
  }).sort({ createdAt: -1 }).lean();
  const mapped = projects.map((p) => ({
    id: p._id?.toString(),
    ...p,
    createdAt: p.createdAt?.toISOString() || '',
  }));
  const duration = Date.now() - start;
  console.log(`[API] /projects GET took ${duration}ms`);
  return NextResponse.json(mapped);
}

export async function POST(req: Request) {
  const denied = requireAdmin(req); if (denied) return denied;
  await connectDB();
  const data = await req.json();
  console.log('Project data to be saved:', data);
  const project = new Project(data);
  await project.save();
  return NextResponse.json(project, { status: 201 });
}
