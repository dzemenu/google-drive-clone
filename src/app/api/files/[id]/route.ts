import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { unlink, rename } from "fs/promises";
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

    const fileId = parseInt(id);
    if (isNaN(fileId)) {
      return new NextResponse("Invalid file ID", { status: 400 });
    }

    // Get the file to get its URL
    const file = await db.query.files.findFirst({
      where: and(
        eq(files.id, fileId),
        eq(files.userId, userId)
      ),
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Delete the file from storage
    const filePath = path.join(process.cwd(), "public", file.url);
    try {
      await unlink(filePath);
    } catch (error) {
      console.error("Error deleting file from storage:", error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await db.delete(files).where(
      and(
        eq(files.id, fileId),
        eq(files.userId, userId)
      )
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[FILE_DELETE]", error);
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

    const fileId = parseInt(id);
    if (isNaN(fileId)) {
      return new NextResponse("Invalid file ID", { status: 400 });
    }

    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return new NextResponse("Invalid name", { status: 400 });
    }

    // Get the file to get its URL
    const file = await db.query.files.findFirst({
      where: and(
        eq(files.id, fileId),
        eq(files.userId, userId)
      ),
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Get file extension from original name and ensure it's not null
    const ext = path.extname(file.name || '');
    // Remove any existing extension from the new name
    const baseName = name.replace(/\.[^/.]+$/, "");
    const newName = baseName + ext;

    // Rename the file in storage
    const oldPath = path.join(process.cwd(), "public", file.url);
    const newPath = path.join(process.cwd(), "public", "uploads", newName);
    try {
      await rename(oldPath, newPath);
    } catch (error) {
      console.error("Error renaming file in storage:", error);
      return new NextResponse("Failed to rename file in storage", { status: 500 });
    }

    // Update in database
    const [updatedFile] = await db
      .update(files)
      .set({
        name: newName,
        url: `/uploads/${newName}`,
      })
      .where(
        and(
          eq(files.id, fileId),
          eq(files.userId, userId)
        )
      )
      .returning();

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error("[FILE_RENAME]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 