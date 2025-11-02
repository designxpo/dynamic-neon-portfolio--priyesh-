import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Blog from '@/models/Blog';

export async function GET() {
  await connectDB();
  console.log('Fetching all blog posts from database');
  const start = Date.now();
  const blogs = await Blog.find({}, {
    title: 1,
    content: 1,
    author: 1,
    createdAt: 1,
    url: 1,
    thumbnail: 1,
    excerpt: 1,
    _id: 1
  }).sort({ createdAt: -1 }).lean();
  const mappedBlogs = blogs.map((blog) => ({
    id: blog._id?.toString(),
    ...blog,
    publishedAt: blog.createdAt?.toISOString() || '',
  }));
  const duration = Date.now() - start;
  console.log(`[API] /blogs GET took ${duration}ms`);
  return NextResponse.json(mappedBlogs);
}


export async function POST(req: Request) {
  try {
    await connectDB();
    console.log('Received new blog post request');
    const data = await req.json();
    console.log('Blog data to be saved:', data);
    const blog = new Blog(data);
    await blog.save();
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Blog POST error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create blog', details: error }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    const { id, ...update } = data;
    if (!id) throw new Error('Missing blog id');
    const blog = await Blog.findByIdAndUpdate(id, update, { new: true });
    return NextResponse.json(blog);
  } catch (error) {
    console.error('Blog PUT error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update blog', details: error }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json();
    if (!id) throw new Error('Missing blog id');
    await Blog.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog DELETE error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete blog', details: error }, { status: 500 });
  }
}
