import Link from "next/link";
import { Advertisement } from "../entities/advertisment/model/types";
import { useViewAd } from "../features/hooks/use-view-ad";
import { useAuth } from "../features/context/auth-context";
import { useLikeAd } from "../features/hooks/use-like-ad";

type ProductCardProps = {
  ad?: Advertisement;
  loading?: boolean;
};

export default function ProductCard({ ad, loading }: ProductCardProps) {
  const { accessToken } = useAuth();
  const { isLiked, likesCount, toggleLike, loading: likeLoading } = useLikeAd(ad?.slug, accessToken);
  const { viewsCount } = useViewAd(ad?.slug);

  if (loading || !ad) {
    return (
      <div className="bg-white rounded-2xl w-full animate-pulse">
        <div className="w-full h-48 bg-gray-200 rounded-2xl mb-2"></div>
        <div className="p-4 space-y-2">
          <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
          <div className="h-4 w-full bg-gray-300 rounded"></div>
          <div className="h-4 w-full bg-gray-300 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
          <div className="mt-4 flex justify-between items-center">
            <div className="h-6 w-16 bg-gray-300 rounded"></div>
            <div className="h-6 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/${ad.category_slug}/${ad.subcategory}/${ad.slug}`}>
      <div className="bg-white rounded-2xl w-full hover:opacity-70 transition">
        <div className="relative">
          <img
            src={ad.images[0]?.image}
            alt={ad.title}
            className="w-full max-h-[200px] min-h-[200px] object-cover rounded-2xl mb-2"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleLike();
            }}
            className="absolute top-2 right-2 cursor-pointer bg-black/30 p-2 rounded-full"
          >
            {isLiked ? (
              <span className="text-white text-3xl">♥</span>
            ) : (
              <span className="text-white text-3xl">♡</span>
            )}
          </button>
        </div>

        <div className="p-4 flex-col items-center justify-center">
          <h3 className="font-semibold text-xl text-left mb-2 ml-2 text-[#2AAEF7] break-words overflow-hidden truncate">
            {ad.title}
          </h3>
          <p
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
            className="text-gray-800 p-2 line-clamp-3 break-words overflow-hidden leading-snug"
          >
            {ad.description}
          </p>
          <div className="mt-4 flex items-center justify-between p-2 space-x-2 mb-1">
            <span className="text-black font-semibold text-xl">${ad.price}</span>
            <p className="flex text-gray-500 text-md text-center justify-center">
              👁 {viewsCount ?? ad.views_count} • {ad.owner.profile?.city}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
