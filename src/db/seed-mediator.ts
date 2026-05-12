import { auth } from "@/lib/auth";
import { db, client } from "./index";
import { user, account } from "./schema/auth-schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const MEDIATOR_EMAIL = "mediator@mail.com";
const MEDIATOR_USERNAME = "mediatortln";
const PASSWORD = "Password123!";

async function seedMediator() {
  console.log("Seeding mediator user...\n");

  // Delete existing mediator user first (if created via direct DB insert)
  const existing = await db.query.user.findFirst({
    where: eq(user.email, MEDIATOR_EMAIL),
  });

  if (existing) {
    console.log(`  Removing existing mediator: ${existing.name} (@${existing.username})`);
    await db.delete(account).where(eq(account.userId, existing.id));
    await db.delete(user).where(eq(user.id, existing.id));
    console.log("  Deleted.\n");
  }

  console.log("  Creating via Better Auth API...\n");

  try {
    const result = await auth.api.createUser({
      body: {
        email: MEDIATOR_EMAIL,
        password: PASSWORD,
        name: "Mediator TLN",
        role: "mediator",
        data: {
          username: MEDIATOR_USERNAME,
          displayUsername: "Mediator TLN",
          gender: "male",
        },
      },
    });

    // Mark email as verified
    await db.update(user).set({ emailVerified: true }).where(eq(user.id, result.user.id));

    console.log(`  Mediator created`);
    console.log(`     Email:    ${MEDIATOR_EMAIL}`);
    console.log(`     Username: ${MEDIATOR_USERNAME}`);
    console.log(`     Password: ${PASSWORD}`);
    console.log(`     Role:     mediator\n`);
  } catch (err) {
    console.error("  Better Auth createUser failed:", (err as Error).message);
    console.log("\n  Fallback: creating via direct DB insert...\n");

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    const userId = crypto.randomUUID();

    await db.insert(user).values({
      id: userId,
      name: "Mediator Pethuk",
      email: MEDIATOR_EMAIL,
      emailVerified: true,
      username: MEDIATOR_USERNAME,
      displayUsername: "Mediator Pethuk",
      gender: "male",
      role: "mediator",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: MEDIATOR_EMAIL,
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`  Mediator created via direct DB (fallback)`);
    console.log(`     Email:    ${MEDIATOR_EMAIL}`);
    console.log(`     Username: ${MEDIATOR_USERNAME}`);
    console.log(`     Password: ${PASSWORD}`);
    console.log(`     Role:     mediator\n`);
  }

  await client.end();
}

seedMediator().catch((err) => {
  console.error("Seed mediator failed:", err);
  process.exit(1);
});
