import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createFallbackPrisma() {
  const fallbackValueFor = (operation: string) => {
    switch (operation) {
      case "findFirst":
      case "findUnique":
        return null;
      case "findMany":
      case "groupBy":
        return [];
      case "count":
        return 0;
      case "aggregate":
        return { _sum: { total: 0 } };
      default:
        return null;
    }
  };

  return new Proxy({} as Record<string, unknown>, {
    get(_target, prop) {
      if (typeof prop === "symbol") return undefined;

      const modelName = String(prop);
      return new Proxy(async () => null, {
        get(_target, operation) {
          if (typeof operation === "symbol") return undefined;

          const op = String(operation);
          return async (..._args: unknown[]) => {
            if (["create", "update", "upsert", "delete", "deleteMany", "createMany", "updateMany"].includes(op)) {
              throw new Error(`Database is not configured for ${modelName}.${op}`);
            }

            return fallbackValueFor(op);
          };
        },
      });
    },
  });
}

const databaseUrlConfigured = Boolean(process.env.DATABASE_URL?.trim());
const runtimePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

export const prisma = databaseUrlConfigured ? runtimePrisma : (createFallbackPrisma() as unknown as PrismaClient);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = runtimePrisma;
