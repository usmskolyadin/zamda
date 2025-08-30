"use client"

import { useAuth } from "@/src/features/context/auth-context";
import Link from "next/link";
import StartChatButton from "@/src/widgets/start-chat-button";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import { FaArrowRight, FaStar } from "react-icons/fa";

interface AdPageProps {
  ad: Advertisement;
}

export default function AdActions({ ad }: AdPageProps) {
  const { user } = useAuth();

  const isOwner = user?.username === ad.owner.username;

  return (
            <div className="flex flex-col mb-6 lg:mt-0 mt-6">
              {isOwner ? (
                <>
                  <Link href={`/ads/edit/${ad.id}`} className="w-full p-4 mb-2 bg-[#36B731] text-white rounded-2xl text-center">
                    Редактировать
                  </Link>
                  <button className="w-full p-4 bg-[#2AAEF7] rounded-2xl">Поднять просмотры</button>
                </>
              ) : (
                <>
                  <button className="w-full p-4 bg-[#36B731] rounded-2xl">Show phone</button>
                  <StartChatButton adId={ad.id} />
                </>
              )}
                  <div className="flex items-center justify-between py-2">
                    <div>
                    <h2 className="text-[#2AAEF7] font-semibold">{ad.owner.last_name} {ad.owner.first_name}</h2>
                    <div className="flex items-center text-sm text-gray-700">
                        <span className="mr-1">4.7</span>
                        <div className="flex text-yellow-400 mr-1">
                        {[...Array(4)].map((_, i) => (
                            <FaStar key={i} />
                        ))}
                        <FaStar className="opacity-50" />
                        </div>
                        <a href="#" className="text-blue-500 ml-1 hover:underline">
                        13 reviews
                        </a>
                    </div>
                    </div>
                    <img
                    src={ad.owner.profile?.avatar}
                    width={200}
                    height={200}
                    alt="GT Logo"
                    className="w-12 h-12 rounded-full object-cover"
                    />
                </div>

                <button className="bg-gray-200 hover:bg-gray-300 text-sm text-black rounded-full px-4 py-1">
                    Follow this Seller
                </button>

                <div className="text-sm text-gray-600">
                    <p className=" text-gray-700 text-md mt-2">Contact Person:</p>
                    <div className="flex items-center gap-2">
                    <span className="text-black font-medium">{ad.owner.username}</span>
                    <span className="bg-gray-300 text-xs px-2 py-0.5 rounded-md font-semibold">
                        Verified Seller
                    </span>
                    </div>
                </div>
              {!isOwner ? (

                <div>
                 <h1 className="text-black font-bold text-3xl mt-4">Ask the Seller</h1>
                    <div className="relative">
                    <input
                        type="text"
                        placeholder="Hello!"
                        className="w-full border rounded-2xl py-3 pl-4 pr-10 text-sm text-gray-800 my-2"
                    />
                    <FaArrowRight className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer" />
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                    {[
                        "Is it still available?",
                        "Is the price negotiable?",
                        "When and where can I see the vehicle?",
                    ].map((text, idx) => (
                        <button
                        key={idx}
                        className="bg-black text-white rounded-full text-sm px-4 py-2 text-left hover:bg-gray-800 transition"
                        >
                        {text}
                        </button>
                    ))}
                    </div>
                </div> ) : (<></>)}


      
    </div>
  );
}
