import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    // 1️⃣ Validate inputs
    if (!name || !email || !message) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    // 2️⃣ Connect to MongoDB FAST (cached connection logic)
  await dbConnect();

    // 3️⃣ Save message to database and only respond if successful
    try {
  const msg = new ContactMessage({ name, email, message });
  await msg.save();
      return NextResponse.json({
        success: true,
        message: "Message received. Thank you!"
      }, { status: 200 });
    } catch (dbError) {
      console.error("DB save error:", dbError);
      return NextResponse.json({ success: false, message: "Database error" }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in contact form:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
