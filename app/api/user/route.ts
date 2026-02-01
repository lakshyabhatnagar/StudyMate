import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";

export async function POST() {
  let user;

  try {
    user = await currentUser();
  } catch {
    return NextResponse.json(
      { error: "Auth context not ready" },
      { status: 401 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) {
    return NextResponse.json(
      { error: "Email missing" },
      { status: 400 }
    );
  }

  try {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existing.length > 0) {
      return NextResponse.json(existing[0]);
    }

    await db
      .insert(usersTable)
      .values({
        email,
        name: user.fullName ?? "",
      })
      .onConflictDoNothing();

    const inserted = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    return NextResponse.json(inserted[0]);
  } catch (err) {
    console.error("user route db error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
