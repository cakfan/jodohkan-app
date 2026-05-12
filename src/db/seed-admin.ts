import { auth } from "@/lib/auth";
import { db, client } from "./index";
import { user, account } from "./schema/auth-schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "admin@mail.com";
const ADMIN_USERNAME = "admintln";
const PASSWORD = "Password123!";

async function seedAdmin() {
  console.log("🌱 Seeding admin user...\n");

  const existing = await db.query.user.findFirst({
    where: eq(user.email, ADMIN_EMAIL),
  });

  if (existing) {
    console.log(`  Admin already exists: ${existing.name} (@${existing.username})`);
    console.log("  Role:", existing.role);
    console.log("  Skipping.\n");
    await client.end();
    return;
  }

  // Create user via Better Auth internal API (full pipeline)
  try {
    const result = await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: PASSWORD,
        name: "Admin TLN",
        username: ADMIN_USERNAME,
        gender: "male",
        displayUsername: "AdminTLN",
      },
    });

    if (!result.user?.id) {
      throw new Error("No user ID returned");
    }

    // Promote to admin + set gender + verify email
    await db
      .update(user)
      .set({ role: "admin", gender: "male", emailVerified: true })
      .where(eq(user.id, result.user.id));

    console.log(`  ✅ Admin created via Better Auth API`);
    console.log(`     Email:    ${ADMIN_EMAIL}`);
    console.log(`     Username: ${ADMIN_USERNAME}`);
    console.log(`     Password: ${PASSWORD}`);
    console.log(`     Role:     admin\n`);
    await client.end();
    return;
  } catch (err) {
    console.log("  ⚠️  Better Auth API sign-up failed:", (err as Error).message);
    console.log("  Mencoba direct DB insert...\n");
  }

  // Fallback: direct DB insert
  console.log("  Creating via direct DB insert...");
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

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

  console.log(`  ✅ Admin created via direct DB`);
  console.log(`     Email:    ${ADMIN_EMAIL}`);
  console.log(`     Username: ${ADMIN_USERNAME}`);
  console.log(`     Password: ${PASSWORD}`);
  console.log(`     Role:     admin`);
  console.log(`  ⚠️  Jika login gagal, jalankan ulang dengan dev server aktif.`);
  console.log(`      Atau hapus admin dari DB lalu jalankan ulang.\n`);

  await client.end();
}

seedAdmin().catch((err) => {
  console.error("❌ Seed admin failed:", err);
  process.exit(1);
});
