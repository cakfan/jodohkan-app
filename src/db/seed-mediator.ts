import { auth } from "@/lib/auth";
import { db, client } from "./index";
import { user, account } from "./schema/auth-schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const MEDIATORS = [
  {
    email: "mediator.pria@mail.com",
    username: "mediatorpria",
    name: "Mediator Pria",
    gender: "male" as const,
  },
  {
    email: "mediator.wanita@mail.com",
    username: "mediatorwanita",
    name: "Mediator Wanita",
    gender: "female" as const,
  },
];

const PASSWORD = "Password123!";

async function seedMediator() {
  console.log("Seeding mediator users...\n");

  for (const m of MEDIATORS) {
    const existing = await db.query.user.findFirst({
      where: eq(user.email, m.email),
    });

    if (existing) {
      console.log(`  Removing existing: ${existing.name} (@${existing.username})`);
      await db.delete(account).where(eq(account.userId, existing.id));
      await db.delete(user).where(eq(user.id, existing.id));
      console.log("  Deleted.\n");
    }

    console.log(`  Creating ${m.name}...`);

    try {
      const result = await auth.api.createUser({
        body: {
          email: m.email,
          password: PASSWORD,
          name: m.name,
          role: "mediator",
          data: {
            username: m.username,
            displayUsername: m.name,
            gender: m.gender,
          },
        },
      });

      await db.update(user).set({ emailVerified: true }).where(eq(user.id, result.user.id));

      console.log(`  Created via Better Auth API`);
    } catch (err) {
      console.error(`  Better Auth failed: ${(err as Error).message}`);
      console.log("  Fallback: direct DB insert...\n");

      const hashedPassword = await bcrypt.hash(PASSWORD, 10);
      const userId = crypto.randomUUID();

      await db.insert(user).values({
        id: userId,
        name: m.name,
        email: m.email,
        emailVerified: true,
        username: m.username,
        displayUsername: m.name,
        gender: m.gender,
        role: "mediator",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(account).values({
        id: crypto.randomUUID(),
        accountId: m.email,
        providerId: "credential",
        userId,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`  Created via direct DB (fallback)`);
    }

    console.log(`     Email:    ${m.email}`);
    console.log(`     Username: ${m.username}`);
    console.log(`     Password: ${PASSWORD}`);
    console.log(`     Role:     mediator`);
    console.log(`     Gender:   ${m.gender}\n`);
  }

  await client.end();
}

seedMediator().catch((err) => {
  console.error("Seed mediator failed:", err);
  process.exit(1);
});
