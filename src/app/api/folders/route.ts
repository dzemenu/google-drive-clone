import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { folders } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

// GET request to list folders
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userFolders = await db
      .select()
      .from(folders)
      .where(eq(folders.userId, userId));

    return NextResponse.json(userFolders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

// POST request to create a new folder
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await req.json();

    // Ensure that the folder name is not empty
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    // Insert the new folder into the database
    const newFolder = await db
      .insert(folders)
      .values({ name, userId })
      .returning();

    // Return the created folder with a 201 status code
    return NextResponse.json(newFolder[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
