"use client"

import Link from "next/link";
import Image from "next/image";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/src/features/context/auth-context";

type UserProfile = {
  avatar?: string | null;
  city?: string;
};

type Owner = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile: UserProfile;
};

type Message = {
  id: number;
  chat: number;
  sender: number; 
  text: string;
  created_at: string;
  is_read: boolean;
};

type Chat = {
  id: number;
  ad: number;
  ad_title: string;
  buyer: Owner;
  seller: Owner;
  messages: Message[];
  last_message?: string | null;
  created_at: string;
};


export default function Chat() {
  const params = useParams<{ id: string }>();
  const chatId = Number(params.id);
  const { accessToken, user } = useAuth();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

    const loadAll = async () => {
    if (!accessToken) return;
    const [c, msgsResponse] = await Promise.all([
        apiFetchAuth<Chat>(`/api/chats/${chatId}/`, accessToken),
        apiFetchAuth<any>(`/api/messages/?chat=${chatId}`, accessToken),
    ]);

    setChat(c);

    const newMessages = Array.isArray(msgsResponse) ? msgsResponse : msgsResponse.results || [];

    setMessages((prev) => {
        if (newMessages.length > prev.length) {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
        }
        return newMessages;
    });

    setLoading(false);
    };

  useEffect(() => {
    loadAll();
    const t = setInterval(loadAll, 3000);
    return () => clearInterval(t);
  }, [accessToken, chatId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !accessToken) return;
    const created = await apiFetchAuth<Message>("/api/messages/", accessToken, {
      method: "POST",
      body: JSON.stringify({ chat: chatId, text }),
    });
    setText("");
    setMessages((prev) => [...prev, created]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
  };

  if (!accessToken) return <div className="bg-[#ffffff] max-w-screen-xl mx-auto p-4">Авторизуйся, чтобы открыть чат.</div>;
  if (loading) return <div className="bg-[#ffffff] max-w-screen-xl mx-auto p-4">Загрузка…</div>;
  if (!chat) return <div className="bg-[#ffffff] max-w-screen-xl mx-auto p-4">Чат не найден.</div>;

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
                    <h2 className="text-black font-bold  lg:text-2xl text-3xl py-2">{user?.first_name} {user?.last_name}</h2>
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
            {/* <div className="rounded-3xl w-full bg-[#F2F1F0] h-[200px]  flex justify-center items-center">
              <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
            </div> */}
            <div className="lg:flex">
                <h1 className="w-2/3 text-black font-bold lg:text-4xl text-3xl lg:py-4 lg:py-1 py-4">Messages</h1>
            </div>

                <div>
            </div>
            <div className="flex flex-col">
                <div className="flex items-center mt-4 min-w-full bg-gray-100  rounded-2xl p-2">
                    <div className="mr-2 flex items-center">
                        <Link href={"/messages"}>
                            <svg className="p-0.5 mr-3 ml-2" width="29" height="28" viewBox="0 0 29 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.4207 25.8094L2.00012 14.3888M13.4207 2.96822L2.00012 14.3888M2.00012 14.3888H14.3887H26.7772" stroke="#333333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </Link>
                        <img
                        className="min-w-12 max-w-12 min-h-12 max-h-12 rounded-full"
                        src={
                            chat.buyer.id === user?.id
                            ? chat.seller.profile.avatar || "/default-avatar.png"
                            : chat.buyer.profile.avatar || "/default-avatar.png"
                        }
                        alt=""
                        width={100}
                        height={100}
                        />
                   </div>
                    <div className="flex justify-between w-full">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl text-black font-bold">
                                       {chat.buyer.id === user?.id
                                    ? `${chat.seller.first_name} ${chat.seller.last_name}`
                                    : `${chat.buyer.first_name} ${chat.buyer.last_name}`}
                                </h1>
                            <h1 className="text-sm text-gray-500 ml-2">{chat.ad_title}</h1>
                        </div>
                        <div className="flex">
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
                {loading ? (
                    <div className="p-4">Загрузка сообщений...</div>
                    ) : (
                <div className="p-4 h-[60vh] overflow-y-auto">
                {messages.map((m) => {
                    const mine = m.sender === user?.id;
                    return (
                    <div key={m.id} className={`flex mb-2 ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`rounded-2xl px-4 py-2 max-w-[75%] ${mine ? "bg-blue-600 text-white" : "bg-gray-100 text-black"}`}>
                        <div className="whitespace-pre-wrap break-words">{m.text}</div>
                        <div className={`text-[10px] mt-1 ${mine ? "text-blue-100" : "text-gray-500"}`}>
                           {new Date(m.created_at).toISOString().slice(0, 16).replace("T", " ")}

                        </div>
                        </div>
                    </div>
                    );
                })}
                <div ref={bottomRef} />
                </div>
                )}
               <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex gap-2">
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write a message…"
                        className="flex-1 border rounded-2xl py-3 px-4 text-sm text-gray-800"
                    />
                    <button className="rounded-2xl px-5 py-3 bg-black text-white">Send</button>
                </form>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
