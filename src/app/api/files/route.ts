// app/api/files/route.ts
import { getDb } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const db = await getDb();
    const userFiles = await db
      .select()
      .from(files)
      .where(eq(files.userId, userId));

    return new Response(JSON.stringify(userFiles));
  } catch (error) {
    console.error("Error fetching files:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch files" }),
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

    if (!name || !url || !size) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const [newFile] = await db
      .insert(files)
      .values({
        name,
        url,
        size: size.toString(),
        folderId: folderId || null,
        userId,
      })
      .returning();

    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    console.error("Error creating file record:", error);
    return NextResponse.json(
      { error: "Failed to create file record" },
      { status: 500 }
    );
  }
}