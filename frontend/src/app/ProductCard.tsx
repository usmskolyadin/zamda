import Link from "next/link";
import { Advertisement } from "../entities/advertisment/model/types";
import { useViewAd } from "../features/hooks/use-view-ad";
import { useAuth } from "../features/context/auth-context";
import { useLikeAd } from "../features/hooks/use-like-ad";

type ProductCardProps = {
  ad: Advertisement
}

export default function ProductCard({ad}: ProductCardProps) {
  const { accessToken } = useAuth();

  const { isLiked, likesCount, toggleLike, loading } = useLikeAd({
    adId: ad.id,
    initialIsLiked: ad.is_liked,
    initialLikesCount: ad.likes_count,
    token: accessToken,
  });

  const { viewsCount } = useViewAd(ad.id);

  return (
    <Link href={`/${ad.subcategory.id}/${ad.subcategory.category.id}/${ad.id}`}>
    <div className="bg-white rounded-2xl w-full">
      <div className="relative">
        <img src={ad.images[0].image} alt={ad.title} className="w-full h-[250px] object-cover rounded-2xl mb-2" />
        <button
          onClick={(e) => {
            e.preventDefault(); 
            e.stopPropagation();
            toggleLike();
          }}
          disabled={loading}
          className="absolute top-2 right-2 cursor-pointer"
        >
          <div className="bg-black/30 p-2 rounded-full">
            {isLiked ? (
              <svg width="25" height="25" className="invert" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
                  stroke="#000000"
                  strokeWidth="2"
                />
              </svg>
            ) : (
              <svg width="24" height="24" className="invert" viewBox="0 0 16 16" fill="none">
                <path d="M1.24264 8.24264L8 15L14.7574 8.24264C15.553 7.44699 16 6.36786 16 5.24264V5.05234C16 2.8143 14.1857 1 11.9477 1C10.7166 1 9.55233 1.55959 8.78331 2.52086L8 3.5L7.21669 2.52086C6.44767 1.55959 5.28338 1 4.05234 1C1.8143 1 0 2.8143 0 5.05234V5.24264C0 6.36786 0.44699 7.44699 1.24264 8.24264Z" fill="#000000"/>
              </svg>
            )}
          </div>
        </button>

      </div>
      <div className="p-4 flex-col items-center justify-center">
        <h3 className="font-semibold text-2xl text-left mb-2 ml-2 text-[#2AAEF7]">{ad.title}</h3>
        <p style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", lineHeight: "1.5rem", maxHeight: "5rem" }}
           className="text-gray-800 p-2 line-clamp-3">
           {ad.description}
        </p>
        <div className="mt-4 flex items-center justify-between p-2 space-x-2 mb-1">
            <span className="text-black font-semibold text-xl">${ad.price}</span>
            <p className=" flex text-gray-500 text-md text-center justify-center">            
                <svg className="mr-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g opacity="0.5">
                        <path d="M20 10C20 14.4183 12 22 12 22C12 22 4 14.4183 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" stroke="black" strokeWidth="2"/>
                        <path d="M12 11C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9C11.4477 9 11 9.44772 11 10C11 10.5523 11.4477 11 12 11Z" fill="black" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                </svg>
                {ad.owner.profile?.city} 
            </p>
        </div>

      </div>
    </div>
    </Link>
  );
}