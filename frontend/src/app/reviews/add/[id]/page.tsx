"use client"

import { useState } from "react";
import { useAuth } from "@/src/features/context/auth-context";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { FaStar } from "react-icons/fa";
import Link from "next/link";

interface Props {
  profileId: number;       // Кому оставляем отзыв
  onSuccess: () => void;   // Колбэк после успешной отправки
}

export default function AddReview({ profileId, onSuccess }: Props) {
  const { accessToken, user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!accessToken || !user) {
      alert("You must be logged in to leave a review");
      return;
    }

    setLoading(true);
    try {
        await apiFetchAuth(
        `/api/reviews/`,
        accessToken,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            profile: profileId, 
            rating,
            comment,
            }),
        }
        );


      setComment("");
      setRating(5);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" w-full">
      <section className="bg-[#ffffff]  pb-16 p-4">
        
        <div className="max-w-screen-xl lg:flex mx-auto">
          <div className="lg:w-1/4">
            <div className="max-w-[712px]">
                  <div className="flex-col items-center justify-between lg:border-b border-gray-300 py-3">
                    {/* <img
                        src={user?.profile.avatar}
                        width={200}
                        height={200}
                        alt="GT Logo"
                        className="lg:w-18 w-22 lg:h-18 h-22 rounded-full object-cover border border-gray-500"
                    /> */}
                    <div>
                    {/* <div className="py-2">
                        <h2 className="text-black font-bold  lg:text-2xl text-3xl ">{user?.first_name} {user?.last_name}</h2>
                        <h2 className="text-gray-800 font-medium  text-md">{user?.username}</h2>
                    </div> */}
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
                    <Link aria-disabled href=""><span className="text-[#2AAEF7] text-md h-12">Wallet</span> </Link>
                    <Link aria-disabled href=""><span className="text-[#2AAEF7] text-md h-12">Paid services</span></Link>
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
                <h1 className="w-2/3 text-black font-bold lg:text-4xl text-3xl lg:py-4 lg:py-1 py-4">Add review</h1>
            </div>

                <div>
            </div>
            <div className="flex flex-col">
                <div className=" rounded-2xl bg-white space-y-2">
                <div>
                    <label className="text-black">Rating: </label>
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="text-black border rounded-full p-1">
                    {[5,4,3,2,1].map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                    </select>
                </div>
                <div>
                    <textarea
                    placeholder="Comment..."
                    className="text-black w-full border rounded-2xl rounded p-2"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    />
                </div>
                <button
                    onClick={submit}
                    disabled={loading}
                    className="bg-[#2AAEF7] rounded-3xl h-[36px] w-[200px] text-white flex items-center text-center justify-center"
                >
                    {loading ? "Submitting..." : "Submit"}
                </button>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

