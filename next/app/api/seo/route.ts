
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import SEO from '@/models/SEO';
import { requireAdmin } from '@/lib/adminAuth';

// GET /api/seo           → returns all pages as a { [section]: meta } map
// GET /api/seo?page=home  → returns a single section's meta
export async function GET(req: Request) {
	try {
		await connectDB();
		const { searchParams } = new URL(req.url);
		const page = searchParams.get('page');

		if (page) {
			// @ts-ignore - relax mongoose typings for filter shape differences
			const seo = await (SEO as any).findOne({ page });
			if (!seo) return NextResponse.json({ error: 'SEO not found' }, { status: 404 });
			return NextResponse.json(seo);
		}

		// No page param → return all SEO documents keyed by page
		// @ts-ignore
		const all = await (SEO as any).find({}).lean();
		const map: Record<string, any> = {};
		for (const doc of all || []) {
			if (doc?.page) {
				const { _id, __v, createdAt, updatedAt, page: _p, ...rest } = doc;
				map[doc.page] = rest;
			}
		}
		return NextResponse.json(map);
	} catch (err: any) {
		console.error('[SEO GET] Error:', err?.message || err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

// PUT /api/seo?page=home
export async function PUT(req: Request) {
	const denied = requireAdmin(req); if (denied) return denied;
	try {
		await connectDB();
		const { searchParams } = new URL(req.url);
		const page = searchParams.get('page');
		if (!page) return NextResponse.json({ error: 'Missing page param' }, { status: 400 });

		const body = await req.json();
		// Basic validation
		if (!body.metaTitle || !body.metaDescription || !body.metaKeywords) {
			return NextResponse.json({ error: 'Missing required SEO fields' }, { status: 400 });
		}

		// @ts-ignore - relax mongoose typings for filter/update
		const updated = await (SEO as any).findOneAndUpdate(
			{ page },
			{ ...body, page },
			{ upsert: true, new: true }
		);
		if (!updated) {
			console.error('[SEO PUT] Update failed: No document returned');
			return NextResponse.json({ error: 'Update failed: No document returned' }, { status: 500 });
		}
		return NextResponse.json(updated);
	} catch (err: any) {
		console.error('[SEO PUT] Error:', err?.message || err);
		return NextResponse.json({ error: 'Server error', details: err?.message || err }, { status: 500 });
	}
}
