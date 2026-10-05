import { createClient as createDbClient } from "@/lib/db";

export async function createClient() {
  return createDbClient();
}
