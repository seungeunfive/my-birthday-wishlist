"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { GENERAL_WISHLIST_MESSAGE_ID } from "@/src/lib/messages";

type MessageFormProps = {
  wishId?: string;
  onSubmitted?: () => void;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

const EMPTY_NICKNAME_MESSAGE = "닉네임을 입력해주세요.";
const EMPTY_MESSAGE_MESSAGE = "메시지를 입력해주세요.";
const UNKNOWN_ERROR_MESSAGE =
  "메시지를 보내지 못했어요. 잠시 후 다시 시도해주세요.";

async function readResponseMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: unknown };

    return typeof payload.message === "string"
      ? payload.message
      : UNKNOWN_ERROR_MESSAGE;
  } catch {
    return UNKNOWN_ERROR_MESSAGE;
  }
}

export function MessageForm({ wishId, onSubmitted }: MessageFormProps) {
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [feedback, setFeedback] = useState("");
  const resolvedWishId = wishId?.trim() || GENERAL_WISHLIST_MESSAGE_ID;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedNickname = nickname.trim();
    const trimmedMessage = message.trim();

    if (!trimmedNickname) {
      setSubmitState("error");
      setFeedback(EMPTY_NICKNAME_MESSAGE);
      return;
    }

    if (!trimmedMessage) {
      setSubmitState("error");
      setFeedback(EMPTY_MESSAGE_MESSAGE);
      return;
    }

    setSubmitState("submitting");
    setFeedback("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          wishId: resolvedWishId,
          nickname: trimmedNickname,
          message: trimmedMessage,
        }),
      });

      if (!response.ok) {
        setSubmitState("error");
        setFeedback(await readResponseMessage(response));
        return;
      }

      setSubmitState("success");
      setFeedback("마음이 보태졌어요.");
      setNickname("");
      setMessage("");
      onSubmitted?.();
    } catch {
      setSubmitState("error");
      setFeedback(UNKNOWN_ERROR_MESSAGE);
    }
  }

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-bold text-[#381a55]">
        닉네임
        <input
          className="pixel-input"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          maxLength={24}
          disabled={submitState === "submitting"}
          autoComplete="nickname"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold text-[#381a55]">
        비공개 메시지
        <textarea
          className="pixel-input min-h-24 resize-y"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={500}
          disabled={submitState === "submitting"}
        />
      </label>

      <button
        className="pixel-button w-full"
        disabled={submitState === "submitting"}
      >
        {submitState === "submitting" ? "보내는 중..." : "마음 보내기"}
      </button>

      {feedback ? (
        <p
          className={
            submitState === "success"
              ? "rounded border-2 border-[#18a558] bg-[#d7ffd8] px-3 py-2 text-sm font-bold text-[#145c2d]"
              : "rounded border-2 border-[#ff6f91] bg-[#ffe3ec] px-3 py-2 text-sm font-bold text-[#8f1741]"
          }
          role={submitState === "error" ? "alert" : "status"}
        >
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
