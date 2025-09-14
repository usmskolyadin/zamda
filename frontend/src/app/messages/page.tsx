"use client"

import Link from "next/link";
import Image from "next/image";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { useAuth } from "@/src/features/context/auth-context";


type UserProfile = { avatar?: string | null; city?: string };
type Owner = { id: number; username: string; first_name: string; last_name: string; email: string; profile: UserProfile };

type Chat = {
  id: number;
  ad: number;
  ad_title: string;
  buyer: Owner;
  seller: Owner;
  created_at: string;
  messages: { id: number; text: string; created_at: string; sender: number; is_read: boolean }[];
};

export default function Chats() {
  const { accessToken, user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      try {
        const data = await apiFetchAuth<Chat[]>("/api/chats/", accessToken);
        setChats(data.results);;
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  const items = useMemo(() => {
    return chats.map((c) => {
      const last = c.messages?.[c.messages.length - 1];
      const unread = c.messages?.filter((m) => !m.is_read && m.sender !== user?.id).length ?? 0;
      return { ...c, last, unread };
    }).sort((a, b) => {
      const at = a.last ? new Date(a.last.created_at).getTime() : 0;
      const bt = b.last ? new Date(b.last.created_at).getTime() : 0;
      return bt - at;
    });
  }, [chats, user?.id]);

if (!accessToken) {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <p className="text-xl text-black">
        Авторизуйся, чтобы видеть сообщения.
      </p>
    </div>
  );
}

if (loading) {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <p className="text-xl text-black">Загрузка…</p>
    </div>
  );
}

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
                    <h2 className="text-black font-bold  lg:text-xl text-2xl py-2">{user?.first_name} {user?.last_name}</h2>
                    <div className="flex items-center text-sm text-gray-700">
                        <span className="mr-1 text-black text-lg font-bold">{user?.profile.rating}</span>
                        <div className="flex text-yellow-400 mr-1">
                        {[...Array(4)].map((_, i) => (
                            <FaStar key={i} />
                        ))}
                        <FaStar className="opacity-50" />
                        </div>
                        <a href="#" className="text-[#2AAEF7] text-lg ml-1 hover:underline">
                        {user?.profile.reviews_count} reviews
                        </a>
                    </div>
                    </div>
                </div>
            </div>
            <div className="lg:block hidden">
                <div className="py-3 flex flex-col border-b border-gray-300">
                    <Link href="listings"><span className="text-[#2AAEF7] text-md h-12">My Listings</span> </Link>
                    <Link href="favorites"><span className="text-[#2AAEF7] text-md h-12">Favorites</span></Link>
                    <Link href="messages"><span className="text-[#2AAEF7] text-md h-12">Messages</span></Link>
                    <Link href="reviews"><span className="text-[#2AAEF7] text-md h-12">My Reviews</span> </Link>
                </div>
                <div className="py-3 flex flex-col border-b border-gray-300">
                    <Link href="listings"><span className="text-[#2AAEF7] text-md h-12">Wallet</span> </Link>
                    <Link href="favorites"><span className="text-[#2AAEF7] text-md h-12">Paid services</span></Link>
                </div>
                <div className="py-3 flex flex-col mb-4">
                    <Link href="/profile/edit"><span className="text-[#2AAEF7] text-md h-12">Profile settings</span> </Link>
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
                <h1 className="w-2/3 text-black font-bold lg:text-4xl text-3xl lg:py-4 lg:py-1 py-4">Messages</h1>
            </div>
                <div>
                    <div className="relative">
                        <input type="text" placeholder="Search messages" className="bg-gray-200 w-full p-3 pl-10 text-black rounded-xl"/>
                        <svg width="24" height="24" className="absolute top-3 left-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g opacity="0.5">
                                <path d="M17 17L21 21" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </g>
                        </svg>
                    </div>
                    <div className="flex mt-2">
                        <input type="text" placeholder="Unread" className="w-1/3 cursor-pointer mr-2 bg-gray-200 p-3 text-black rounded-xl"/>
                        <input type="text" placeholder="Important" className="w-1/3 cursor-pointer mr-2 bg-gray-200 p-3 text-black rounded-xl"/>
                        <input type="text" placeholder="All listings" className="w-1/3 cursor-pointer bg-gray-200 p-3 text-black rounded-xl"/>
                    </div>
                </div>
                <div>
            </div>
            <div className="flex flex-col">
                        {items.map((c) => (
          <Link key={c.id} href={`/messages/${c.id}`} className="block mt-3">
            <div className="flex items-center justify-between bg-gray-100 rounded-2xl p-4 hover:bg-gray-200">
              <div>
                <div className="text-black font-semibold">{c.ad_title}</div>
                <div className="text-gray-600 text-sm truncate max-w-[60ch]">
                  {c.last ? c.last.text : "No messages yet"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {c.last ? new Date(c.last.created_at).toLocaleString() : ""}
                </div>
                {c.unread > 0 && (
                  <div className="mt-1 inline-flex items-center justify-center min-w-6 h-6 rounded-full bg-blue-600 text-white text-xs px-2">
                    {c.unread}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}

        {items.length === 0 && (
          <div className="text-gray-500">У тебя пока нет переписок.</div>
        )}

                {/* <Link href={"/messages/someone"}>
                    <div className="flex items-center mt-4 min-w-full hover:bg-gray-300 bg-gray-100 rounded-2xl p-2">
                        <div className="mr-4">
                            <Image src={"/zamda-white.png"} alt={""} width={100} height={100} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between">
                                <h1 className="text-xl text-black font-bold">Zamda Support</h1>
                                <h1 className="text-sm text-gray-500">27 Jul</h1>
                            </div>
                            <div className="flex">
                                <p className="text-md text-gray-600 mr-2">Welcome to our service! Create a new Ad for start. Testing, testing, testing, testing, testing, testing, testing, testing</p>
                                
                                <span className=" w-8 h-8 p-2 flex items-center justify-center  rounded-full bg-[#D9D9D9]">
                                    <svg width="24" height="5" viewBox="0 0 24 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19.7226 4.63253C19.477 4.63253 19.2682 4.55884 19.0963 4.41147C18.9489 4.23954 18.8752 4.03077 18.8752 3.78516V1.13253C18.8752 0.886912 18.9489 0.690421 19.0963 0.543052C19.2682 0.371123 19.477 0.285156 19.7226 0.285156H22.3752C22.6209 0.285156 22.8296 0.371123 23.0016 0.543052C23.1735 0.690421 23.2595 0.886912 23.2595 1.13253V3.78516C23.2595 4.03077 23.1735 4.23954 23.0016 4.41147C22.8296 4.55884 22.6209 4.63253 22.3752 4.63253H19.7226Z" fill="black"/>
                                        <path d="M10.4404 4.63253C10.1948 4.63253 9.986 4.55884 9.81407 4.41147C9.6667 4.23954 9.59302 4.03077 9.59302 3.78516V1.13253C9.59302 0.886912 9.6667 0.690421 9.81407 0.543052C9.986 0.371123 10.1948 0.285156 10.4404 0.285156H13.093C13.3386 0.285156 13.5474 0.371123 13.7193 0.543052C13.8913 0.690421 13.9772 0.886912 13.9772 1.13253V3.78516C13.9772 4.03077 13.8913 4.23954 13.7193 4.41147C13.5474 4.55884 13.3386 4.63253 13.093 4.63253H10.4404Z" fill="black"/>
                                        <path d="M1.15792 4.63253C0.912301 4.63253 0.703529 4.55884 0.5316 4.41147C0.384231 4.23954 0.310547 4.03077 0.310547 3.78516V1.13253C0.310547 0.886912 0.384231 0.690421 0.5316 0.543052C0.703529 0.371123 0.912301 0.285156 1.15792 0.285156H3.81055C4.05616 0.285156 4.26493 0.371123 4.43686 0.543052C4.60879 0.690421 4.69476 0.886912 4.69476 1.13253V3.78516C4.69476 4.03077 4.60879 4.23954 4.43686 4.41147C4.26493 4.55884 4.05616 4.63253 3.81055 4.63253H1.15792Z" fill="black"/>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                </Link> */}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
