import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { folders } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

// GET request to list folders
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const userFolders = await db
      .select()
      .from(folders)
      .where(eq(folders.userId, userId));

    // Ensure we return an array even if no folders are found
    return NextResponse.json(userFolders || []);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

// POST request to create a new folder
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    // Ensure that the folder name is not empty
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    console.log("Creating folder with data:", { name, userId });

    const db = await getDb();
    // Insert the new folder into the database
    const newFolder = await db
      .insert(folders)
      .values({ 
        name: name.trim(),
        userId: userId
      })
      .returning();

    console.log("Created folder:", newFolder);

    if (!newFolder || newFolder.length === 0) {
      throw new Error("Failed to create folder: No data returned");
    }

    // Return the created folder with a 201 status code
    return NextResponse.json(newFolder[0], { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
