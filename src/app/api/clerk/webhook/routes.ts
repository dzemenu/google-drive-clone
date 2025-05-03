import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // Your Drizzle ORM instance
import { folders } from "@/lib/db/schema"; // Your folders table schema

export async function POST(req: NextRequest) {
  const secret = req.headers.get("clerk-signature");
  const expectedSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (body.type === "user.created") {
    const userId = body.data.id;

    // Define default folders
    const defaultFolders = ["My Drive", "Shared with me", "Trash"];

    // Insert default folders into the database
    await db.insert(folders).values(
      defaultFolders.map((name) => ({
        name,
        userId,
      }))
    );

    return NextResponse.json(
      { message: "Default folders created" },
      { status: 200 }
    );
  }

  return NextResponse.json({ message: "Event not handled" }, { status: 200 });
}
