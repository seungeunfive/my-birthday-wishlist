import { metadata } from "./layout";
import { wishlistDescription, wishlistTitle } from "@/src/lib/profile";

describe("metadata", () => {
  it("uses the personalized wishlist title", () => {
    expect(metadata.title).toBe(wishlistTitle);
    expect(metadata.openGraph?.title).toBe(wishlistTitle);
    expect(metadata.twitter?.title).toBe(wishlistTitle);
  });

  it("uses the personalized wishlist description for search and sharing", () => {
    expect(wishlistDescription).toBe(
      "채영이의 생일 위시리스트에서 선물을 고르고 따뜻한 축하 메시지를 남겨주세요.",
    );
    expect(metadata.description).toBe(wishlistDescription);
    expect(metadata.openGraph?.description).toBe(wishlistDescription);
    expect(metadata.twitter?.description).toBe(wishlistDescription);
  });

  it("sets a base URL for social image metadata", () => {
    expect(metadata.metadataBase?.toString()).toBe("http://localhost:3000/");
  });
});
