import { expect, test, describe } from "bun:test";

describe("Permissions - Exports", () => {
  test("should export ac, admin, user, and mediator", async () => {
    const mod = await import("@/lib/permissions");
    expect(mod.ac).toBeDefined();
    expect(mod.admin).toBeDefined();
    expect(mod.user).toBeDefined();
    expect(mod.mediator).toBeDefined();
  });
});

describe("Permissions - Role Structure", () => {
  test("admin should have default admin statements", async () => {
    const mod = await import("@/lib/permissions");
    expect(mod.admin.statements).toBeDefined();
  });

  test("user should have user and session statements with empty arrays", async () => {
    const mod = await import("@/lib/permissions");
    const statements = mod.user.statements;
    expect(statements.user).toEqual([]);
    expect(statements.session).toEqual([]);
  });

  test("mediator should have list permission on user", async () => {
    const mod = await import("@/lib/permissions");
    const statements = mod.mediator.statements;
    expect(statements.user).toContain("list");
    expect(statements.session).toEqual([]);
  });
});
