// app/api/files/route.ts
import { getDb } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const showTrash = searchParams.get("showTrash") === "true";

    console.log("Fetching files with params:", { userId, folderId, showTrash });

    const db = await getDb();
    try {
      const conditions = [
        eq(files.userId, userId),
        eq(files.isTrash, showTrash)
      ];

      if (folderId) {
        conditions.push(eq(files.folderId, parseInt(folderId)));
      }

      const filesList = await db
        .select()
        .from(files)
        .where(and(...conditions));

      console.log("Files fetched successfully:", filesList.length);
      return NextResponse.json(filesList);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database error", details: dbError instanceof Error ? dbError.message : "Unknown error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[FILES_GET]", error);
    return NextResponse.json(
      { error: "Internal Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, url, size, folderId } = body;

    console.log("Received file data:", { name, url, size, folderId, userId });

    if (!name || !url || !size) {
      return NextResponse.json(
        { error: "Missing required fields", details: { name, url, size } },
        { status: 400 }
      );
    }

    const db = await getDb();
    try {
      const [file] = await db
        .insert(files)
        .values({
          name,
          url,
          size,
          folderId: folderId ? parseInt(folderId) : null,
          userId,
          isTrash: false,
        })
        .returning();

      console.log("File created successfully:", file);
      return NextResponse.json(file);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database error", details: dbError instanceof Error ? dbError.message : "Unknown error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[FILES_POST]", error);
    return NextResponse.json(
      { error: "Internal Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, isTrash } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (typeof isTrash === "boolean") updateData.isTrash = isTrash;

    const db = await getDb();
    const [file] = await db
      .update(files)
      .set(updateData)
      .where(and(eq(files.id, id), eq(files.userId, userId)))
      .returning();

    return NextResponse.json(file);
  } catch (error) {
    console.error("[FILES_PATCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
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