// app/api/files/route.ts
import { getDb } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

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
