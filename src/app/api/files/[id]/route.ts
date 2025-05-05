import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { unlink, rename } from "fs/promises";
import path from "path";
import { getDb } from "@/lib/db";

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const { id } = context.params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const [deletedFile] = await db
      .delete(files)
      .where(eq(files.id, parseInt(id)))
      .returning();

    if (!deletedFile) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(deletedFile);
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const { id } = context.params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const [updatedFile] = await db
      .update(files)
      .set({ name })
      .where(eq(files.id, parseInt(id)))
      .returning();

    if (!updatedFile) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      { error: "Failed to update file" },
      { status: 500 }
    );
  }
} 