"use client";

import Image from "next/image";
import { useState } from "react";
import {
  calculateWishProgress,
  formatKrw,
  type Wish,
} from "@/src/lib/wishes";
import { ProgressMeter } from "./progress-meter";

type WishCardProps = {
  wish: Wish;
};

function WishImageFallback() {
  return (
    <div className="grid aspect-[4/3] place-items-center border-b-4 border-[#381a55] bg-[#fff3a7] text-center">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase text-[#ff4fa3]">
          PIXEL WISH
        </p>
        <p className="text-4xl" aria-hidden="true">
          ♡
        </p>
        <p className="text-xs font-bold text-[#381a55]">사진 준비 중</p>
      </div>
    </div>
  );
}

export function WishCard({ wish }: WishCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const progress = calculateWishProgress(wish);
  const isCompleted = progress === 100;
  const shouldShowImage = Boolean(wish.image) && !imageFailed;

  return (
    <article className="pixel-card relative overflow-hidden bg-white">
      {shouldShowImage ? (
        <Image
          src={wish.image}
          alt={`${wish.name} product photo`}
          width={640}
          height={480}
          className="aspect-[4/3] w-full border-b-4 border-[#381a55] object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <WishImageFallback />
      )}

      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="sticker-label mb-3">
              {wish.priority === "top" ? "TOP WISH" : "CUTE PICK"}
            </p>
            <h2 className="pixel-display text-2xl text-[#381a55]">
              {wish.name}
            </h2>
          </div>
          <span className="rounded border-2 border-[#381a55] bg-[#a8fff0] px-2 py-1 text-xs font-black text-[#381a55] shadow-[3px_3px_0_#381a55]">
            OPEN
          </span>
        </div>

        <p className="text-sm leading-6 text-[#5a3a6f]">{wish.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded border-2 border-[#381a55] bg-[#fff9d8] p-3">
            <p className="font-bold text-[#7d5c92]">Price</p>
            <p className="text-lg font-black text-[#381a55]">
              {formatKrw(wish.price)}
            </p>
          </div>
          <div className="rounded border-2 border-[#381a55] bg-[#ffe3ec] p-3">
            <p className="font-bold text-[#7d5c92]">Funded</p>
            <p className="text-lg font-black text-[#381a55]">
              {formatKrw(wish.fundedAmount)}
            </p>
          </div>
        </div>

        <ProgressMeter label="Item progress" percent={progress} />

        <a
          className="inline-flex w-full items-center justify-center rounded border-2 border-[#381a55] bg-[#a8fff0] px-4 py-3 text-sm font-black text-[#381a55] shadow-[3px_3px_0_#381a55] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#381a55]"
          href={wish.productUrl}
          target="_blank"
          rel="noreferrer"
        >
          상품 보기
        </a>
      </div>

      {isCompleted ? (
        <div className="funding-complete-overlay">
          <div className="funding-complete-stamp">펀딩 완료</div>
        </div>
      ) : null}
    </article>
  );
}
