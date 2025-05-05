import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { files } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";

function getIdFromUrl(req: NextRequest): number | null {
  const idStr = req.nextUrl.pathname.split("/").pop();
  const id = idStr ? Number(idStr) : NaN;
  return isNaN(id) ? null : id;
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    const id = getIdFromUrl(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (id === null) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    const db = await getDb();
    const [deletedFile] = await db
      .delete(files)
      .where(and(eq(files.id, id), eq(files.userId, userId)))
      .returning();

    if (!deletedFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json(deletedFile);
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    const id = getIdFromUrl(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (id === null) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const db = await getDb();
    const [updatedFile] = await db
      .update(files)
      .set({ name })
      .where(and(eq(files.id, id), eq(files.userId, userId)))
      .returning();

    if (!updatedFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 });
  }
}
