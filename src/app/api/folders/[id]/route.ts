import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { folders, files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const folderId = parseInt(id);
    if (isNaN(folderId)) {
      return new NextResponse("Invalid folder ID", { status: 400 });
    }

    // Get all files in the folder
    const folderFiles = await db.query.files.findMany({
      where: and(
        eq(files.folderId, folderId),
        eq(files.userId, userId)
      ),
    });

    // Delete all files in the folder
    for (const file of folderFiles) {
      const filePath = path.join(process.cwd(), "public", file.url);
      try {
        await unlink(filePath);
      } catch (error) {
        console.error("Error deleting file from storage:", error);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete all files from database
    await db.delete(files).where(
      and(
        eq(files.folderId, folderId),
        eq(files.userId, userId)
      )
    );

    // Delete the folder
    await db.delete(folders).where(
      and(
        eq(folders.id, folderId),
        eq(folders.userId, userId)
      )
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[FOLDER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const folderId = parseInt(id);
    if (isNaN(folderId)) {
      return new NextResponse("Invalid folder ID", { status: 400 });
    }

    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return new NextResponse("Invalid name", { status: 400 });
    }

    // Update in database
    const [updatedFolder] = await db
      .update(folders)
      .set({
        name: name,
      })
      .where(
        and(
          eq(folders.id, folderId),
          eq(folders.userId, userId)
        )
      )
      .returning();

    if (!updatedFolder) {
      return new NextResponse("Folder not found", { status: 404 });
    }

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("[FOLDER_RENAME]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 