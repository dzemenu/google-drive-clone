import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { files } from "@/lib/db/schema";


export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, url, size, folderId } = body;

    if (!name || !url || !size) {
      return NextResponse.json(
        { error: "Name, URL, and size are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const [file] = await db
      .insert(files)
      .values({
        name,
        url,
        size,
        folderId: folderId || null,
        userId,
        isTrash: false,
      } as typeof files.$inferInsert)
      .returning();

    return NextResponse.json(file);
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 