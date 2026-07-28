import { afterEach, describe, expect, it, vi } from "vitest";
import { insertBirthdayMessage } from "@/src/lib/supabase/server";
import { getOpenWishes } from "@/src/lib/wishes";
import { POST } from "./route";

vi.mock("@/src/lib/supabase/server", () => ({
  insertBirthdayMessage: vi.fn(),
}));

const insertBirthdayMessageMock = vi.mocked(insertBirthdayMessage);

function createJsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function createRawRequest(body: string): Request {
  return new Request("http://localhost/api/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body,
  });
}

describe("POST /api/messages", () => {
  const validWishId = getOpenWishes()[0].id;

  afterEach(() => {
    insertBirthdayMessageMock.mockReset();
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await POST(createRawRequest("{"));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("INVALID_JSON");
    expect(insertBirthdayMessageMock).not.toHaveBeenCalled();
  });

  it("returns 400 for missing fields", async () => {
    const response = await POST(
      createJsonRequest({
        wishId: validWishId,
        nickname: "",
        message: "",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("INVALID_MESSAGE");
    expect(payload.message).toBe("닉네임과 메시지를 모두 입력해주세요.");
    expect(insertBirthdayMessageMock).not.toHaveBeenCalled();
  });

  it("returns 400 for an unknown wish id", async () => {
    const response = await POST(
      createJsonRequest({
        wishId: "missing-wish",
        nickname: "친구",
        message: "생일 축하해!",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("UNKNOWN_WISH");
    expect(insertBirthdayMessageMock).not.toHaveBeenCalled();
  });

  it("returns 503 for the general wishlist message id", async () => {
    insertBirthdayMessageMock.mockResolvedValue({
      ok: false,
      error: "STORAGE_NOT_CONNECTED",
    });

    const response = await POST(
      createJsonRequest({
        wishId: "wishlist",
        nickname: "친구",
        message: "생일 축하해!",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error).toBe("STORAGE_NOT_CONNECTED");
    expect(insertBirthdayMessageMock).toHaveBeenCalledWith({
      wishId: "wishlist",
      nickname: "친구",
      message: "생일 축하해!",
    });
  });

  it("returns 503 for valid input while storage is disconnected", async () => {
    insertBirthdayMessageMock.mockResolvedValue({
      ok: false,
      error: "STORAGE_NOT_CONNECTED",
    });

    const response = await POST(
      createJsonRequest({
        wishId: validWishId,
        nickname: "친구",
        message: "생일 축하해!",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error).toBe("STORAGE_NOT_CONNECTED");
    expect(payload.message).toBe("아직 메시지 저장소가 연결되지 않았어요.");
  });

  it("returns 500 when storage insert fails", async () => {
    insertBirthdayMessageMock.mockResolvedValue({
      ok: false,
      error: "STORAGE_WRITE_FAILED",
    });

    const response = await POST(
      createJsonRequest({
        wishId: validWishId,
        nickname: "친구",
        message: "생일 축하해!",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("STORAGE_WRITE_FAILED");
    expect(payload.message).toBe("메시지를 저장하지 못했어요.");
  });

  it("stores a valid message and returns 201", async () => {
    insertBirthdayMessageMock.mockResolvedValue({ ok: true });

    const response = await POST(
      createJsonRequest({
        wishId: validWishId,
        nickname: " 친구 ",
        message: " 생일 축하해! ",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.ok).toBe(true);
    expect(payload.message).toBe("마음이 보태졌어요.");
    expect(insertBirthdayMessageMock).toHaveBeenCalledWith({
      wishId: validWishId,
      nickname: "친구",
      message: "생일 축하해!",
    });
  });
});
