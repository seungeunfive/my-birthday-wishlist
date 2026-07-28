"use client";

import { toast } from "sonner";

export function CreateMyPageButton() {
  return (
    <div className="flex justify-center pt-1">
      <button
        className="pixel-button w-full sm:w-auto sm:min-w-52"
        type="button"
        onClick={() => toast("준비중입니다!")}
      >
        내 페이지도 만들기
      </button>
    </div>
  );
}
