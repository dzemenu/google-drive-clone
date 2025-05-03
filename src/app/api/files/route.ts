// app/api/files/route.ts
import { db } from "@/lib/db";
import { folders, files } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Fetch folders with files for current user
  const userFolders = await db.query.folders.findMany({
    where: eq(folders.userId, userId),
    with: {
      files: true,
    },
  });

  return new Response(JSON.stringify(userFolders));
}
