import { WishlistPage } from "@/src/components/wishlist/wishlist-page";
import { getOpenWishes, getWishlistSummary } from "@/src/lib/wishes";

export default function Home() {
  const wishes = getOpenWishes();
  const summary = getWishlistSummary(wishes);

  return <WishlistPage wishes={wishes} summary={summary} />;
}
