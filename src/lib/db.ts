import { Pool, type QueryResultRow } from "pg";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession, type SessionUser } from "@/lib/session";

const TABLES = new Set([
  "profiles",
  "cohorts",
  "applications",
  "payments",
  "enrollments",
  "page_views",
  "campaigns",
  "campaign_messages",
]);

const EMBEDS: Record<string, Record<string, { table: string; fk: string }>> = {
  enrollments: {
    applications: { table: "applications", fk: "application_id" },
  },
};

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set");
    pool = new Pool({ connectionString, max: 10 });
  }
  return pool;
}

function ident(name: string): string {
  if (!/^[a-z_][a-z0-9_]*$/i.test(name)) throw new Error(`Invalid identifier: ${name}`);
  return `"${name}"`;
}

function assertTable(table: string) {
  if (!TABLES.has(table)) throw new Error(`Unknown table: ${table}`);
}

type Filter =
  | { op: "eq" | "neq" | "gte" | "gt" | "ilike"; column: string; value: unknown }
  | { op: "in"; column: string; value: unknown[] }
  | { op: "is" | "notnull"; column: string; value: null };

type Embed = { key: string; table: string; fk: string; columns: string[] | "*" };

function normalizeRow(row: QueryResultRow): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = value instanceof Date ? value.toISOString() : value;
  }
  return out;
}

function sqlValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Buffer)) {
    return JSON.stringify(value);
  }
  return value;
}

class Query {
  private operation: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private columns = "*";
  private filters: Filter[] = [];
  private orGroup: Filter[] | null = null;
  private orderCol: string | null = null;
  private orderAsc = true;
  private limitN: number | null = null;
  private mode: "many" | "single" | "maybe" = "many";
  private countExact = false;
  private head = false;
  private payload: Record<string, unknown> | null = null;
  private returning = false;
  private embed: Embed | null = null;

  constructor(private readonly table: string) {
    assertTable(table);
  }

  select(columns = "*", options?: { count?: string; head?: boolean }) {
    this.returning = true;
    if (options?.count === "exact") this.countExact = true;
    if (options?.head) this.head = true;
    this.parseSelect(columns);
    return this;
  }

  insert(row: Record<string, unknown>) {
    this.operation = "insert";
    this.payload = row;
    return this;
  }

  update(row: Record<string, unknown>) {
    this.operation = "update";
    this.payload = row;
    return this;
  }

  upsert(row: Record<string, unknown>) {
    this.operation = "upsert";
    this.payload = row;
    this.returning = true;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ op: "eq", column, value });
    return this;
  }

  neq(column: string, value: unknown) {
    this.filters.push({ op: "neq", column, value });
    return this;
  }

  in(column: string, value: unknown[]) {
    this.filters.push({ op: "in", column, value });
    return this;
  }

  gte(column: string, value: unknown) {
    this.filters.push({ op: "gte", column, value });
    return this;
  }

  gt(column: string, value: unknown) {
    this.filters.push({ op: "gt", column, value });
    return this;
  }

  ilike(column: string, value: unknown) {
    this.filters.push({ op: "ilike", column, value });
    return this;
  }

  not(column: string, operator: string, value: unknown) {
    if (operator === "is") {
      this.filters.push({ op: "notnull", column, value: null });
      return this;
    }
    this.filters.push({ op: "neq", column, value });
    return this;
  }

  or(expression: string) {
    this.orGroup = expression.split(",").map((part) => {
      const [column, op, raw] = part.split(".");
      if (!column || !op) throw new Error(`Bad or() filter: ${expression}`);
      if (op === "is") return { op: "is" as const, column, value: null };
      if (op === "neq") return { op: "neq" as const, column, value: raw };
      throw new Error(`Unsupported or() operator: ${op}`);
    });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderCol = column;
    this.orderAsc = options?.ascending !== false;
    return this;
  }

  limit(n: number) {
    this.limitN = n;
    return this;
  }

  single() {
    this.mode = "single";
    return this;
  }

  maybeSingle() {
    this.mode = "maybe";
    return this;
  }

  then<TResult1 = { data: any; error: { message: string } | null; count: number | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: { message: string } | null; count: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private parseSelect(columns: string) {
    const parts = splitTop(columns);
    const plain: string[] = [];
    for (const part of parts) {
      const embed = part.match(/^([a-z_]+)\(([\s\S]*)\)$/i);
      if (embed) {
        const spec = EMBEDS[this.table]?.[embed[1]];
        if (!spec) throw new Error(`No embed ${embed[1]} on ${this.table}`);
        const inner = embed[2].trim();
        this.embed = {
          key: embed[1],
          table: spec.table,
          fk: spec.fk,
          columns: inner === "*" ? "*" : splitTop(inner),
        };
      } else if (part !== "*") {
        plain.push(part);
      }
    }
    this.columns = plain.length === 0 ? "*" : plain.join(", ");
  }

  private where(startAt = 1): { sql: string; values: unknown[] } {
    const values: unknown[] = [];
    const clauses: string[] = [];
    const placeholder = () => `$${startAt + values.length - 1}`;
    const push = (filter: Filter) => {
      const column = ident(filter.column);
      if (filter.op === "in") {
        values.push(filter.value.map((item) => String(item)));
        clauses.push(`${column}::text = ANY(${placeholder()}::text[])`);
        return;
      }
      if (filter.op === "is") {
        clauses.push(`${column} IS NULL`);
        return;
      }
      if (filter.op === "notnull") {
        clauses.push(`${column} IS NOT NULL`);
        return;
      }
      values.push(filter.value);
      const op = filter.op === "eq" ? "=" : filter.op === "neq" ? "<>" : filter.op === "gte" ? ">=" : filter.op === "gt" ? ">" : "ILIKE";
      clauses.push(`${column} ${op} ${placeholder()}`);
    };
    for (const filter of this.filters) push(filter);
    if (this.orGroup?.length) {
      const before = clauses.length;
      for (const filter of this.orGroup) push(filter);
      const orSql = clauses.splice(before).join(" OR ");
      if (orSql) clauses.push(`(${orSql})`);
    }
    return { sql: clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "", values };
  }

  private async execute(): Promise<{ data: any; error: { message: string; code?: string } | null; count: number | null }> {
    try {
      if (this.operation === "select") return await this.runSelect();
      if (this.operation === "insert") return await this.runInsert(false);
      if (this.operation === "upsert") return await this.runInsert(true);
      if (this.operation === "update") return await this.runUpdate();
      return await this.runDelete();
    } catch (error) {
      const pgError = error as { message?: string; code?: string };
      return { data: null, error: { message: pgError.message || String(error), code: pgError.code }, count: null };
    }
  }

  private async runSelect() {
    const where = this.where();
    if (this.countExact && this.head) {
      const result = await getPool().query(`SELECT count(*)::int AS count FROM ${ident(this.table)}${where.sql}`, where.values);
      return { data: null, error: null, count: Number(result.rows[0]?.count ?? 0) };
    }
    let sql = `SELECT ${this.columns === "*" ? "*" : this.columns.split(",").map((c) => ident(c.trim())).join(", ")} FROM ${ident(this.table)}`;
    sql += where.sql;
    if (this.orderCol) sql += ` ORDER BY ${ident(this.orderCol)} ${this.orderAsc ? "ASC" : "DESC"}`;
    if (this.limitN != null) sql += ` LIMIT ${Number(this.limitN)}`;
    const result = await getPool().query(sql, where.values);
    let rows = result.rows.map(normalizeRow);
    if (this.embed) rows = await this.attachEmbed(rows);
    if (this.countExact) {
      const counted = await getPool().query(`SELECT count(*)::int AS count FROM ${ident(this.table)}${where.sql}`, where.values);
      return shapeRows(rows, this.mode, Number(counted.rows[0]?.count ?? rows.length));
    }
    return shapeRows(rows, this.mode, null);
  }

  private async attachEmbed(rows: Record<string, unknown>[]) {
    const embed = this.embed;
    if (!embed || rows.length === 0) return rows;
    const ids = [...new Set(rows.map((row) => row[embed.fk]).filter(Boolean))] as string[];
    if (ids.length === 0) {
      return rows.map((row) => ({ ...row, [embed.key]: null }));
    }
    const cols = embed.columns === "*" ? "*" : embed.columns.map((c) => ident(c.trim())).join(", ");
    const related = await getPool().query(
      `SELECT ${cols === "*" ? "*" : `${ident("id")}, ${cols}`} FROM ${ident(embed.table)} WHERE ${ident("id")} = ANY($1)`,
      [ids]
    );
    const byId = new Map(related.rows.map((row) => [String(row.id), normalizeRow(row)]));
    return rows.map((row) => ({ ...row, [embed.key]: byId.get(String(row[embed.fk])) ?? null }));
  }

  private async runInsert(upsert: boolean) {
    const row = this.payload ?? {};
    const keys = Object.keys(row);
    if (keys.length === 0) return { data: null, error: { message: "Empty insert" }, count: null };
    const cols = keys.map(ident).join(", ");
    const values = keys.map((key) => sqlValue(row[key]));
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    let sql = `INSERT INTO ${ident(this.table)} (${cols}) VALUES (${placeholders})`;
    if (upsert) {
      const updates = keys.filter((key) => key !== "id").map((key) => `${ident(key)} = EXCLUDED.${ident(key)}`);
      sql += ` ON CONFLICT (id) DO UPDATE SET ${updates.join(", ")}`;
    }
    if (this.returning || upsert) sql += " RETURNING *";
    const result = await getPool().query(sql, values);
    if (!this.returning && !upsert) return { data: null, error: null, count: null };
    const rows = result.rows.map(normalizeRow);
    const selected = this.columns === "*" ? rows : rows.map((row) => project(row, this.columns));
    return shapeRows(selected, this.mode === "many" && this.returning ? "single" : this.mode, null);
  }

  private async runUpdate() {
    const row = this.payload ?? {};
    const keys = Object.keys(row);
    const values = keys.map((key) => sqlValue(row[key]));
    const sets = keys.map((key, i) => `${ident(key)} = $${i + 1}`).join(", ");
    const where = this.where(keys.length + 1);
    const sql = `UPDATE ${ident(this.table)} SET ${sets}${where.sql}${this.returning ? " RETURNING *" : ""}`;
    const result = await getPool().query(sql, [...values, ...where.values]);
    if (!this.returning) return { data: null, error: null, count: null };
    const rows = result.rows.map(normalizeRow);
    const selected = this.columns === "*" ? rows : rows.map((row) => project(row, this.columns));
    return shapeRows(selected, this.mode, null);
  }

  private async runDelete() {
    const where = this.where();
    await getPool().query(`DELETE FROM ${ident(this.table)}${where.sql}`, where.values);
    return { data: null, error: null, count: null };
  }
}

function project(row: Record<string, unknown>, columns: string) {
  if (columns === "*") return row;
  const out: Record<string, unknown> = {};
  for (const column of columns.split(",").map((c) => c.trim())) out[column] = row[column];
  return out;
}

function shapeRows(rows: Record<string, unknown>[], mode: "many" | "single" | "maybe", count: number | null) {
  if (mode === "many") return { data: rows, error: null, count };
  if (rows.length === 1) return { data: rows[0], error: null, count };
  if (mode === "maybe" && rows.length === 0) return { data: null, error: null, count };
  return { data: null, error: { message: "JSON object requested, multiple (or no) rows returned" }, count };
}

function splitTop(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of input) {
    if (char === "(") depth++;
    if (char === ")") depth--;
    if (char === "," && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

async function currentSession(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    return verifySession(store.get(SESSION_COOKIE)?.value);
  } catch {
    return null;
  }
}

function authApi() {
  return {
    async getUser(token?: string) {
      const user = token ? await verifySession(token) : await currentSession();
      return { data: { user: user ? { id: user.id, email: user.email, role: user.role } : null }, error: null };
    },
    async getSession() {
      const user = await currentSession();
      if (!user) return { data: { session: null }, error: null };
      return {
        data: {
          session: {
            user: { id: user.id, email: user.email, role: user.role },
            access_token: "cookie",
          },
        },
        error: null,
      };
    },
    admin: {
      async createUser(input: { email: string; password: string; user_metadata?: { full_name?: string } }) {
        const email = input.email.trim().toLowerCase();
        const existing = await getPool().query("SELECT id FROM profiles WHERE lower(email) = $1", [email]);
        if (existing.rowCount) {
          return { data: { user: null }, error: { message: "User already been registered" } };
        }
        const passwordHash = await bcrypt.hash(input.password, 10);
        const inserted = await getPool().query(
          `INSERT INTO profiles (email, password_hash, role, full_name, phone)
           VALUES ($1, $2, 'STUDENT', $3, '')
           RETURNING id, email, role`,
          [email, passwordHash, input.user_metadata?.full_name || ""]
        );
        const user = inserted.rows[0];
        return { data: { user: { id: user.id, email: user.email } }, error: null };
      },
      async listUsers(_options?: { page?: number; perPage?: number }) {
        const result = await getPool().query("SELECT id, email, role FROM profiles ORDER BY created_at DESC LIMIT 1000");
        return { data: { users: result.rows }, error: null };
      },
      async generateLink(input: { type: string; email: string }) {
        const email = input.email.trim().toLowerCase();
        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        const updated = await getPool().query(
          "UPDATE profiles SET recovery_token = $1, recovery_expires = $2, updated_at = now() WHERE lower(email) = $3 RETURNING email",
          [token, expires, email]
        );
        if (!updated.rowCount) return { data: null, error: { message: "No account found with that email" } };
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkhub.org";
        return { data: { properties: { action_link: `${appUrl}/student?recovery=${token}` } }, error: null };
      },
    },
  };
}

export function createClient(_url?: string, _key?: string): any {
  return {
    from(table: string) {
      return new Query(table);
    },
    auth: authApi(),
  };
}

export async function findUserByEmail(email: string) {
  const result = await getPool().query(
    "SELECT id, email, role, password_hash, full_name FROM profiles WHERE lower(email) = $1",
    [email.trim().toLowerCase()]
  );
  return result.rows[0] as
    | { id: string; email: string; role: string; password_hash: string; full_name: string }
    | undefined;
}

export async function updatePassword(userId: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  await getPool().query("UPDATE profiles SET password_hash = $1, updated_at = now() WHERE id = $2", [passwordHash, userId]);
}

const RESET_WINDOW_MS = 60 * 60 * 1000;

export async function createPasswordReset(email: string): Promise<{
  email: string;
  phone: string;
  firstName: string;
  token: string;
} | null> {
  const found = await getPool().query(
    "SELECT id, email, phone, full_name FROM profiles WHERE lower(email) = $1",
    [email.trim().toLowerCase()]
  );
  const row = found.rows[0] as { id: string; email: string; phone: string; full_name: string } | undefined;
  if (!row) return null;
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + RESET_WINDOW_MS).toISOString();
  await getPool().query(
    "UPDATE profiles SET recovery_token = $1, recovery_expires = $2, updated_at = now() WHERE id = $3",
    [token, expires, row.id]
  );
  const firstName = row.full_name.trim().split(/\s+/)[0] || "there";
  return { email: row.email, phone: row.phone || "", firstName, token };
}

export async function resetPasswordWithToken(token: string, password: string): Promise<boolean> {
  const passwordHash = await bcrypt.hash(password, 10);
  const updated = await getPool().query(
    `UPDATE profiles
     SET password_hash = $1, recovery_token = NULL, recovery_expires = NULL, updated_at = now()
     WHERE recovery_token = $2 AND recovery_expires > now()`,
    [passwordHash, token]
  );
  return (updated.rowCount ?? 0) > 0;
}
