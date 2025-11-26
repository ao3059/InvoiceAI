import { db } from "./index";
import { tenants } from "@shared/schema";
import { eq } from "drizzle-orm";

export class DatabaseRouter {
  private static controlDb = db;
  private static shardDbs: Record<number, typeof db> = {
    1: db,
    2: db,
    3: db,
    4: db,
  };

  static async getDbForTenant(tenantId: string): Promise<typeof db> {
    const [tenant] = await this.controlDb
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const shardNumber = tenant.shard || 1;
    return this.shardDbs[shardNumber] || this.shardDbs[1];
  }

  static async getDbForUser(userId: string): Promise<typeof db> {
    const [user] = await this.controlDb.query.users.findMany({
      where: (users, { eq }) => eq(users.id, userId),
      with: { tenant: true },
      limit: 1,
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    return this.getDbForTenant(user.tenantId);
  }

  static getControlDb(): typeof db {
    return this.controlDb;
  }
}

export const dbRouter = DatabaseRouter;
