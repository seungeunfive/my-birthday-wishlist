import { createClient } from "@supabase/supabase-js";

export type BirthdayMessageInput = {
  wishId: string;
  nickname: string;
  message: string;
};

type BirthdayMessageRow = {
  wish_id: string;
  nickname: string;
  message: string;
};

type SupabaseInsertError = {
  message?: string;
};

export type BirthdayMessagesClient = {
  from(table: "birthday_messages"): {
    insert(
      row: BirthdayMessageRow,
    ): PromiseLike<{ error: SupabaseInsertError | null }>;
  };
};

type SupabaseEnv = {
  [key: string]: string | undefined;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

function normalizeSupabaseUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const isHttpUrl = url.protocol === "http:" || url.protocol === "https:";

    if (!isHttpUrl) {
      return null;
    }

    if (url.pathname === "/rest/v1" || url.pathname === "/rest/v1/") {
      return url.origin;
    }

    return value;
  } catch {
    return null;
  }
}

export type InsertBirthdayMessageResult =
  | { ok: true }
  | {
      ok: false;
      error: "STORAGE_NOT_CONNECTED" | "STORAGE_WRITE_FAILED";
    };

export function readSupabaseConfig(
  env: SupabaseEnv = process.env,
): SupabaseConfig | null {
  const url = env.SUPABASE_URL?.trim();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    return null;
  }

  const normalizedUrl = normalizeSupabaseUrl(url);

  if (!normalizedUrl) {
    return null;
  }

  return {
    url: normalizedUrl,
    serviceRoleKey,
  };
}

export function createSupabaseServerClient(
  env: SupabaseEnv = process.env,
): BirthdayMessagesClient | null {
  const config = readSupabaseConfig(env);

  if (!config) {
    return null;
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as BirthdayMessagesClient;
}

export async function insertBirthdayMessage(
  input: BirthdayMessageInput,
  client: BirthdayMessagesClient | null = createSupabaseServerClient(),
): Promise<InsertBirthdayMessageResult> {
  if (!client) {
    return {
      ok: false,
      error: "STORAGE_NOT_CONNECTED",
    };
  }

  const { error } = await client.from("birthday_messages").insert({
    wish_id: input.wishId,
    nickname: input.nickname,
    message: input.message,
  });

  if (error) {
    return {
      ok: false,
      error: "STORAGE_WRITE_FAILED",
    };
  }

  return { ok: true };
}
