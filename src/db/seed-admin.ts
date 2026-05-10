import { db, client } from "./index";
import { user, account } from "./schema/auth-schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "admin@pethukjodoh.com";
const ADMIN_USERNAME = "adminpethuk";
const PASSWORD = "Password123!";

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

  const hashedPassword = await Bun.password.hash(PASSWORD, {
    algorithm: "bcrypt",
    cost: 10,
  });

  const userId = crypto.randomUUID();

  await db.insert(user).values({
    id: userId,
    name: "Admin Pethuk",
    email: ADMIN_EMAIL,
    emailVerified: true,
    username: ADMIN_USERNAME,
    displayUsername: "Admin Pethuk",
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

  console.log(`  ✅ Admin user created:`);
  console.log(`     Email:    ${ADMIN_EMAIL}`);
  console.log(`     Username: ${ADMIN_USERNAME}`);
  console.log(`     Password: ${PASSWORD}`);
  console.log(`     Role:     admin\n`);

  await client.end();
}

seedAdmin().catch((err) => {
  console.error("❌ Seed admin failed:", err);
  process.exit(1);
});
