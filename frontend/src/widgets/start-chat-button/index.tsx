"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/context/auth-context";
import { apiFetchAuth } from "@/src/shared/api/auth";

function StartChatButton({ adId }: { adId: number }) {
  const router = useRouter();
  const { accessToken, user } = useAuth();

  const startChat = async () => {
    if (!accessToken || !user) return;

    const qs = new URLSearchParams({ ad: String(adId) }).toString();
    const response = await apiFetchAuth<any>(`/api/chats/?${qs}`, accessToken);

    const chats = Array.isArray(response) ? response : response.results || [];

    const existing = chats.find(
      (c: any) => c.buyer === user.id || c.seller === user.id
    );

    let chatId = existing?.id;
    if (!chatId) {
      const created = await apiFetchAuth<any>("/api/chats/", accessToken, {
        method: "POST",
          headers: {
              "Content-Type": "application/json",   // <--- ОБЯЗАТЕЛЬНО
          },
        body: JSON.stringify({ ad: adId }),
      });
      chatId = created.id;
    }

    router.push(`/messages/${chatId}`);
  };

  return (
    <button
      onClick={startChat}
      className="w-full p-4 hover:bg-blue-500 cursor-pointer transition bg-[#2AAEF7] mt-2 rounded-2xl"
    >
      Write message
    </button>
  );
}
export default StartChatButton;
