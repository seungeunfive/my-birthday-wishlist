import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MessageForm } from "./message-form";

describe("MessageForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("blocks empty nickname and message before submit", () => {
    render(<MessageForm wishId="designer-bag" />);

    fireEvent.click(screen.getByRole("button", { name: "마음 보내기" }));

    expect(screen.getByText("닉네임을 입력해주세요.")).toBeInTheDocument();
  });

  it("shows storage unavailable message when API returns 503", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({
          ok: false,
          error: "STORAGE_NOT_CONNECTED",
          message: "아직 메시지 저장소가 연결되지 않았어요.",
        }),
      }),
    );

    render(<MessageForm wishId="designer-bag" />);

    fireEvent.change(screen.getByLabelText("닉네임"), {
      target: { value: "친구" },
    });
    fireEvent.change(screen.getByLabelText("비공개 메시지"), {
      target: { value: "생일 축하해!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "마음 보내기" }));

    await waitFor(() => {
      expect(
        screen.getByText("아직 메시지 저장소가 연결되지 않았어요."),
      ).toBeInTheDocument();
    });
  });

  it("uses the general wishlist id when wish id is empty", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        ok: true,
        message: "마음이 보태졌어요.",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<MessageForm wishId="" />);

    fireEvent.change(screen.getByLabelText("닉네임"), {
      target: { value: "친구" },
    });
    fireEvent.change(screen.getByLabelText("비공개 메시지"), {
      target: { value: "생일 축하해!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "마음 보내기" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/messages",
        expect.objectContaining({
          body: JSON.stringify({
            wishId: "wishlist",
            nickname: "친구",
            message: "생일 축하해!",
          }),
        }),
      );
    });
  });

  it("shows success state when API returns ok", async () => {
    const onSubmitted = vi.fn();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          ok: true,
          message: "마음이 보태졌어요.",
        }),
      }),
    );

    render(<MessageForm wishId="designer-bag" onSubmitted={onSubmitted} />);

    fireEvent.change(screen.getByLabelText("닉네임"), {
      target: { value: "친구" },
    });
    fireEvent.change(screen.getByLabelText("비공개 메시지"), {
      target: { value: "생일 축하해!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "마음 보내기" }));

    await waitFor(() => {
      expect(screen.getByText("마음이 보태졌어요.")).toBeInTheDocument();
    });
    expect(onSubmitted).toHaveBeenCalledTimes(1);
  });
});
