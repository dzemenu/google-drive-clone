import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { writeFile } from "fs/promises";
import { join } from "path";
import { cwd } from "process";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string | null;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(cwd(), "public", "uploads");
    try {
      await writeFile(join(uploadsDir, ".gitkeep"), "");
    } catch (error) {
      // Directory already exists
      console.error("Error creating uploads directory:", error);  
    }

    // Generate unique filename
    const uniqueFilename = `${Date.now()}-${file.name}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file to disk
    const filePath = join(uploadsDir, uniqueFilename);
    await writeFile(filePath, buffer);

    // Save file info to database
    const db = await getDb();
    const [newFile] = await db
      .insert(files)
      .values({
        name: file.name,
        url: `/uploads/${uniqueFilename}`,
        size: file.size.toString(),
        folderId: folderId ? parseInt(folderId) : null,
        userId,
      })
      .returning();

    return NextResponse.json(newFile);
  } catch (error) {
    console.error("Error uploading file:", error);
    return new NextResponse(
      `Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
} 