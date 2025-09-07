"use client"

import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/context/auth-context";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import { apiFetch } from "@/src/shared/api/base";

export default function Listings() {
  const [activeTab, setActiveTab] = useState("active");
  const { user } = useAuth();
  const [adsCount, setAdsCount] = useState(0);
  const [ads, setAds] = useState<Advertisement[]>([]);  

    useEffect(() => {
    if (!user) return;

    const fetchAds = async () => {
        const query = `owner_username=${user.username}`; 
        const res = await apiFetch<{ results: Advertisement[] }>(`/api/ads/?${query}`);
        setAds(res.results);
        setAdsCount(res.results.length);
    };
    fetchAds();
    }, [user]);

  return (
    <div className=" w-full">
      <section className="bg-[#ffffff]  pb-16 p-4">
        
        <div className="max-w-screen-xl lg:flex mx-auto">
          <div className="lg:w-1/4">
            <div className="max-w-[712px]">
                  <div className="flex-col items-center justify-between lg:border-b border-gray-300 py-3">
                    <img
                        src={user?.profile.avatar}
                        width={200}
                        height={200}
                        alt="GT Logo"
                        className="lg:w-18 w-22 lg:h-18 h-22 rounded-full object-cover border border-gray-500"
                    />
                    <div>
                    <div className="py-2">
                        <h2 className="text-black font-bold  lg:text-2xl text-3xl ">{user?.first_name} {user?.last_name}</h2>
                        <h2 className="text-gray-800 font-medium  text-md">{user?.username}</h2>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                        <span className="mr-1 text-black text-lg font-bold">4.7</span>
                        <div className="flex text-yellow-400 mr-1">
                        {[...Array(4)].map((_, i) => (
                            <FaStar key={i} />
                        ))}
                        <FaStar className="opacity-50" />
                        </div>
                        <a href="#" className="text-[#2AAEF7] text-lg ml-1 hover:underline">
                        13 reviews
                        </a>
                    </div>
                    </div>

                </div>
            </div>
            <div className="lg:block hidden">
                <div className="py-3 flex flex-col border-b border-gray-300">
                    <Link href="/listings"><span className="text-[#2AAEF7] text-md h-12">My Listings</span> </Link>
                    <Link href="/favorites"><span className="text-[#2AAEF7] text-md h-12">Favorites</span></Link>
                    <Link href="/messages"><span className="text-[#2AAEF7] text-md h-12">Messages</span></Link>
                    <Link href="/reviews"><span className="text-[#2AAEF7] text-md h-12">My Reviews</span> </Link>
                </div>
                <div className="py-3 flex flex-col border-b border-gray-300">
                    <Link aria-disabled href=""><span className="text-[#2AAEF7] text-md h-12">Wallet (Soon)</span> </Link>
                    <Link aria-disabled href=""><span className="text-[#2AAEF7] text-md h-12">Paid services (Soon)</span></Link>
                </div>
                <div className="py-3 flex flex-col mb-4">
                    <Link href="/profile/edit/"><span className="text-[#2AAEF7] text-md h-12">Profile settings</span> </Link>
                </div>
            </div>
            <div className="rounded-3xl w-full bg-[#F2F1F0] h-[500px] lg:flex hidden  flex justify-center items-center">
              <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
            </div>
          </div>
          <div className=" lg:w-3/4 lg:ml-24">
            <div className="rounded-3xl w-full bg-[#F2F1F0] h-[200px]  flex justify-center items-center">
              <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
            </div>
            <div className="lg:flex">
                <h1 className="w-2/3 text-black font-bold lg:text-4xl text-3xl lg:py-4 lg:py-1 py-4">Favorites</h1>
            </div>
                <div className="flex items-center cursor-pointer">
                    <svg className="mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g opacity="0.5">
                            <path d="M14 10H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 14H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 18H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18 6H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 10V20M19 20L22 17M19 20L16 17" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                    </svg>
                    <p className="text-[#333333] mr-2">Sort by</p>
                    <svg width="17" height="10" viewBox="0 0 17 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.5" d="M1.45898 0.708984L8.70888 7.95889L15.9588 0.708984" stroke="#333333" strokeWidth="2"/>
                    </svg>
                </div>
                <div>
            </div>
            <div className="flex flex-col">
                {ads.map((ad) => (
                <Link key={ad.id} href={`/${ad.subcategory.category.id}/${ad.subcategory.category.id}/${ad.id}`}>
                    <div className="lg:flex mt-4 min-w-full bg-gray-100 rounded-2xl p-2">
                        <div className="mr-4">
                            <img src={ad.images[0].image} alt={""} className="rounded-2xl lg:h-48 lg:w-72 w-full object-cover" object-fit="cover" width={100} height={100} />
                        </div>
                        <div className="w-full lg:mr-4 lg:mt-0 mt-4">
                            <div className="w-full flex items-center justify-between">
                                <h1 className="text-xl text-black font-bold">{ad.title}</h1>
                                <h1 className="text-sm text-gray-500">
                                {new Date(ad.created_at).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                                </h1>
                            </div>
                            <div className="flex w-full">
                                <p className="text-lg text-gray-900 font-semibold    mr-2">${ad.price}</p>
                                <span className=" w-8 h-8 p-2 flex items-center justify-center  rounded-full bg-[#D9D9D9]">
                                    <svg width="24" height="5" viewBox="0 0 24 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19.7226 4.63253C19.477 4.63253 19.2682 4.55884 19.0963 4.41147C18.9489 4.23954 18.8752 4.03077 18.8752 3.78516V1.13253C18.8752 0.886912 18.9489 0.690421 19.0963 0.543052C19.2682 0.371123 19.477 0.285156 19.7226 0.285156H22.3752C22.6209 0.285156 22.8296 0.371123 23.0016 0.543052C23.1735 0.690421 23.2595 0.886912 23.2595 1.13253V3.78516C23.2595 4.03077 23.1735 4.23954 23.0016 4.41147C22.8296 4.55884 22.6209 4.63253 22.3752 4.63253H19.7226Z" fill="black"/>
                                        <path d="M10.4404 4.63253C10.1948 4.63253 9.986 4.55884 9.81407 4.41147C9.6667 4.23954 9.59302 4.03077 9.59302 3.78516V1.13253C9.59302 0.886912 9.6667 0.690421 9.81407 0.543052C9.986 0.371123 10.1948 0.285156 10.4404 0.285156H13.093C13.3386 0.285156 13.5474 0.371123 13.7193 0.543052C13.8913 0.690421 13.9772 0.886912 13.9772 1.13253V3.78516C13.9772 4.03077 13.8913 4.23954 13.7193 4.41147C13.5474 4.55884 13.3386 4.63253 13.093 4.63253H10.4404Z" fill="black"/>
                                        <path d="M1.15792 4.63253C0.912301 4.63253 0.703529 4.55884 0.5316 4.41147C0.384231 4.23954 0.310547 4.03077 0.310547 3.78516V1.13253C0.310547 0.886912 0.384231 0.690421 0.5316 0.543052C0.703529 0.371123 0.912301 0.285156 1.15792 0.285156H3.81055C4.05616 0.285156 4.26493 0.371123 4.43686 0.543052C4.60879 0.690421 4.69476 0.886912 4.69476 1.13253V3.78516C4.69476 4.03077 4.60879 4.23954 4.43686 4.41147C4.26493 4.55884 4.05616 4.63253 3.81055 4.63253H1.15792Z" fill="black"/>
                                    </svg>
                                </span>
                            </div>
                            <p className="text-md text-gray-600 mr-2">
                            {ad.description.length > 200 
                                ? ad.description.slice(0, 200) + "..." 
                                : ad.description}
                            </p>
                            <div className="flex justify-between w-1/5 mt-2">
                                <div className="flex">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1.6001 12.8004C5.7601 4.26706 18.2401 4.26706 22.4001 12.8004" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M12 17.5992C10.2327 17.5992 8.80005 16.1666 8.80005 14.3992C8.80005 12.6319 10.2327 11.1992 12 11.1992C13.7674 11.1992 15.2 12.6319 15.2 14.3992C15.2 16.1666 13.7674 17.5992 12 17.5992Z" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <p className="text-[#333333] text-md ml-2 mr-4">{ad.views_count}</p>
                                </div>
                                <div className="flex">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22 8.86222C22 10.4087 21.4062 11.8941 20.3458 12.9929C17.9049 15.523 15.5374 18.1613 13.0053 20.5997C12.4249 21.1505 11.5042 21.1304 10.9488 20.5547L3.65376 12.9929C1.44875 10.7072 1.44875 7.01723 3.65376 4.73157C5.88044 2.42345 9.50794 2.42345 11.7346 4.73157L11.9998 5.00642L12.2648 4.73173C13.3324 3.6245 14.7864 3 16.3053 3C17.8242 3 19.2781 3.62444 20.3458 4.73157C21.4063 5.83045 22 7.31577 22 8.86222Z" stroke="#333333" strokeWidth="2" strokeLinejoin="round"/>
                                    </svg>
                                    <p className="text-[#333333] text-md ml-2 mr-4">{ad.likes_count}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
