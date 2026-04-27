import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Category from '@/models/Category';
import Project from '@/models/Project';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const data = await req.json();

  const existing = await (Category as any).findById(params.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const oldName: string = existing.name;
  const newName: string | undefined = typeof data?.name === 'string' ? data.name.trim() : undefined;
  const newOrder: number | undefined = typeof data?.order === 'number' ? data.order : undefined;
  const newDescription: string | undefined = typeof data?.description === 'string' ? data.description : undefined;

  if (typeof newName === 'string') existing.name = newName;
  if (typeof newOrder === 'number') existing.order = newOrder;
  if (typeof newDescription === 'string') existing.description = newDescription;
  await existing.save();

  // Cascade rename across projects so the public site keeps showing them
  // under the new tab. Only run when the name actually changed.
  if (typeof newName === 'string' && newName.length > 0 && newName !== oldName) {
    await (Project as any).updateMany(
      { categories: oldName },
      { $set: { 'categories.$[el]': newName } },
      { arrayFilters: [{ el: oldName }] },
    ).exec();
    await (Project as any).updateMany(
      { category: oldName },
      { $set: { category: newName } },
    ).exec();
  }

  return NextResponse.json(existing);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const deleted = await (Category as any).findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const removedName: string = deleted.name;

  // Pull the deleted name from every project's categories[].
  await (Project as any).updateMany(
    { categories: removedName },
    { $pull: { categories: removedName } },
  ).exec();

  // For legacy single-`category` field: any project whose primary category
  // matched the deleted one falls back to the first remaining categories[]
  // entry, or empty if the project has none left. Doing this per-document
  // rather than via a single updateMany so each project gets its own
  // fallback value.
  const orphaned = await (Project as any).find({ category: removedName }).exec();
  for (const proj of orphaned) {
    const next = Array.isArray(proj.categories) && proj.categories.length > 0 ? proj.categories[0] : '';
    proj.category = next;
    await proj.save();
  }

  return NextResponse.json({ success: true });
}
