import { describe, expect, it, vi } from "vitest";
import {
  insertBirthdayMessage,
  readSupabaseConfig,
  type BirthdayMessagesClient,
} from "./server";

describe("Supabase message storage", () => {
  it("returns null config when Supabase env is missing", () => {
    expect(readSupabaseConfig({})).toBeNull();
    expect(
      readSupabaseConfig({
        SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toBeNull();
  });

  it("reads trimmed Supabase server config", () => {
    expect(
      readSupabaseConfig({
        SUPABASE_URL: " https://example.supabase.co ",
        SUPABASE_SERVICE_ROLE_KEY: " service-role ",
      }),
    ).toEqual({
      url: "https://example.supabase.co",
      serviceRoleKey: "service-role",
    });
  });

  it("normalizes a copied Supabase REST API URL to the project URL", () => {
    expect(
      readSupabaseConfig({
        SUPABASE_URL: "https://example.supabase.co/rest/v1/",
        SUPABASE_SERVICE_ROLE_KEY: "service-role",
      }),
    ).toEqual({
      url: "https://example.supabase.co",
      serviceRoleKey: "service-role",
    });
  });

  it("returns null config when Supabase URL is not HTTP or HTTPS", () => {
    expect(
      readSupabaseConfig({
        SUPABASE_URL: "example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role",
      }),
    ).toBeNull();
  });

  it("returns disconnected when no client is available", async () => {
    await expect(
      insertBirthdayMessage(
        {
          wishId: "wishlist",
          nickname: "친구",
          message: "생일 축하해!",
        },
        null,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "STORAGE_NOT_CONNECTED",
    });
  });

  it("inserts a birthday message into the birthday_messages table", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const client: BirthdayMessagesClient = {
      from: vi.fn().mockReturnValue({ insert }),
    };

    await expect(
      insertBirthdayMessage(
        {
          wishId: "wishlist",
          nickname: "친구",
          message: "생일 축하해!",
        },
        client,
      ),
    ).resolves.toEqual({ ok: true });

    expect(client.from).toHaveBeenCalledWith("birthday_messages");
    expect(insert).toHaveBeenCalledWith({
      wish_id: "wishlist",
      nickname: "친구",
      message: "생일 축하해!",
    });
  });

  it("returns write failure when Supabase insert reports an error", async () => {
    const client: BirthdayMessagesClient = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          error: { message: "insert failed" },
        }),
      }),
    };

    await expect(
      insertBirthdayMessage(
        {
          wishId: "wishlist",
          nickname: "친구",
          message: "생일 축하해!",
        },
        client,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "STORAGE_WRITE_FAILED",
    });
  });
});
