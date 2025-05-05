import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
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