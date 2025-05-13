// app/api/files/route.ts
import { getDb } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

interface FileData {
  name: string;
  url: string;
  size: string;
  folderId?: number | null;
  isTrash?: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const searchParams = req.nextUrl.searchParams;
    const folderId = searchParams.get("folderId");
    const showTrash = searchParams.get("showTrash") === "true";

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const conditions = [
      eq(files.userId, userId),
      eq(files.isTrash, showTrash)
    ];

    if (folderId) {
      conditions.push(eq(files.folderId, parseInt(folderId)));
    }

    const result = await db
      .select()
      .from(files)
      .where(and(...conditions));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, url, size, folderId } = body as FileData;

    if (!name || !url || !size) {
      return NextResponse.json(
        { error: "Name, URL, and size are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
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
    console.error("Error creating file:", error);
    return NextResponse.json({ error: "Failed to create file" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, isTrash } = body as FileData & { id: number };

    if (!id) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const db = await getDb();
    const [updatedFile] = await db
      .update(files)
      .set({
        ...(name && { name }),
        ...(typeof isTrash === "boolean" && { isTrash }),
      } as Partial<typeof files.$inferInsert>)
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

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
    }

    const db = await getDb();
    // Check if file is in trash
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, parseInt(id)), eq(files.userId, userId)))
      .limit(1);

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.isTrash) {
      // If file is in trash, delete permanently
      await db
        .delete(files)
        .where(and(eq(files.id, parseInt(id)), eq(files.userId, userId)));
    } else {
      // Move to trash
      await db
        .update(files)
        .set({ isTrash: true })
        .where(and(eq(files.id, parseInt(id)), eq(files.userId, userId)));
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[FILES_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}