import { GENERAL_WISHLIST_MESSAGE_ID } from "@/src/lib/messages";
import { insertBirthdayMessage } from "@/src/lib/supabase/server";
import { getWishById } from "@/src/lib/wishes";

type MessageRequestBody = {
  wishId?: unknown;
  nickname?: unknown;
  message?: unknown;
};

type ValidMessageRequest = {
  wishId: string;
  nickname: string;
  message: string;
};

const MAX_NICKNAME_LENGTH = 24;
const MAX_MESSAGE_LENGTH = 500;

function jsonResponse(
  body: {
    ok: boolean;
    error?: string;
    message: string;
  },
  status: number,
): Response {
  return Response.json(body, { status });
}

function readTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validateMessageBody(
  body: MessageRequestBody,
):
  | { ok: true; data: ValidMessageRequest }
  | { ok: false; error: string; message: string } {
  const wishId = readTrimmedString(body.wishId);
  const nickname = readTrimmedString(body.nickname);
  const message = readTrimmedString(body.message);

  if (!wishId || !nickname || !message) {
    return {
      ok: false,
      error: "INVALID_MESSAGE",
      message: "닉네임과 메시지를 모두 입력해주세요.",
    };
  }

  if (nickname.length > MAX_NICKNAME_LENGTH) {
    return {
      ok: false,
      error: "INVALID_MESSAGE",
      message: `닉네임은 ${MAX_NICKNAME_LENGTH}자 이내로 입력해주세요.`,
    };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      error: "INVALID_MESSAGE",
      message: `메시지는 ${MAX_MESSAGE_LENGTH}자 이내로 입력해주세요.`,
    };
  }

  if (wishId !== GENERAL_WISHLIST_MESSAGE_ID && !getWishById(wishId)) {
    return {
      ok: false,
      error: "UNKNOWN_WISH",
      message: "알 수 없는 위시 아이템이에요.",
    };
  }

  return {
    ok: true,
    data: {
      wishId,
      nickname,
      message,
    },
  };
}

export async function POST(request: Request): Promise<Response> {
  let body: MessageRequestBody;

  try {
    body = (await request.json()) as MessageRequestBody;
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: "INVALID_JSON",
        message: "요청 형식이 올바르지 않아요.",
      },
      400,
    );
  }

  const validation = validateMessageBody(body);

  if (!validation.ok) {
    return jsonResponse(
      {
        ok: false,
        error: validation.error,
        message: validation.message,
      },
      400,
    );
  }

  const storageResult = await insertBirthdayMessage(validation.data);

  if (!storageResult.ok) {
    if (storageResult.error === "STORAGE_NOT_CONNECTED") {
      return jsonResponse(
        {
          ok: false,
          error: "STORAGE_NOT_CONNECTED",
          message: "아직 메시지 저장소가 연결되지 않았어요.",
        },
        503,
      );
    }

    return jsonResponse(
      {
        ok: false,
        error: "STORAGE_WRITE_FAILED",
        message: "메시지를 저장하지 못했어요.",
      },
      500,
    );
  }

  return jsonResponse(
    {
      ok: true,
      message: "마음이 보태졌어요.",
    },
    201,
  );
}
