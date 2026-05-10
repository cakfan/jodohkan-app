import { db, client } from "./index";
import { user } from "./schema/auth-schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "admin@mail.com";
const ADMIN_USERNAME = "admintln";
const PASSWORD = "Password123!";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function seedAdmin() {
  console.log("🌱 Seeding admin user...\n");

  const existing = await db.query.user.findFirst({
    where: eq(user.email, ADMIN_EMAIL),
  });

  if (existing) {
    console.log(`  Admin already exists: ${existing.name} (@${existing.username})`);
    console.log("  Skipping.\n");
    await client.end();
    return;
  }

  // Approach 1: Call Better Auth sign-up endpoint via HTTP
  // This goes through the full Better Auth pipeline (hashing, hooks, etc.)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: PASSWORD,
        name: "Admin TLN",
      }),
    });

    const data = await res.json();

    if (data.user?.id) {
      // Promote to admin
      await db
        .update(user)
        .set({
          role: "admin",
          username: ADMIN_USERNAME,
          displayUsername: "Admin TLN",
          gender: "male",
          emailVerified: true,
        })
        .where(eq(user.id, data.user.id));

      console.log(`  ✅ Admin created via Better Auth sign-up + role update`);
    } else {
      throw new Error(data.error?.message || JSON.stringify(data));
    }

    console.log(`     Email:    ${ADMIN_EMAIL}`);
    console.log(`     Username: ${ADMIN_USERNAME}`);
    console.log(`     Password: ${PASSWORD}`);
    console.log(`     Role:     admin\n`);
    await client.end();
    return;
  } catch (err) {
    console.log("  ⚠️  HTTP sign-up failed:", (err as Error).message);
    console.log("  Pastikan dev server berjalan di", BASE_URL);
    console.log("  Mencoba approach alternatif...\n");
  }

  // Approach 2: Direct DB insert (last resort)
  const hashedPassword = await Bun.password.hash(PASSWORD, {
    algorithm: "bcrypt",
    cost: 10,
  });

  const userId = crypto.randomUUID();

  await db.insert(user).values({
    id: userId,
    name: "Admin TLN",
    email: ADMIN_EMAIL,
    emailVerified: true,
    username: ADMIN_USERNAME,
    displayUsername: "Admin TLN",
    gender: "male",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: ADMIN_EMAIL,
    providerId: "credential",
    userId,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`  ✅ Admin created via direct DB (pastikan login sudah benar)`);
  console.log(`     Email:    ${ADMIN_EMAIL}`);
  console.log(`     Username: ${ADMIN_USERNAME}`);
  console.log(`     Password: ${PASSWORD}`);
  console.log(`     Role:     admin`);
  console.log(`  ⚠️  Login menggunakan USERNAME, bukan email!\n`);

  await client.end();
}

seedAdmin().catch((err) => {
  console.error("❌ Seed admin failed:", err);
  process.exit(1);
});
