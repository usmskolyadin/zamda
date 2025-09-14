"use client"

import { useState } from "react";
import { useAuth } from "@/src/features/context/auth-context";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { FaStar } from "react-icons/fa";
import Link from "next/link";

interface Props {
  profileId: number;       
  onSuccess: () => void;
}

export default function Reviews({ profileId, onSuccess }: Props) {
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
            <div className="flex-col items-center justify-between lg:border-b border-gray-300 py-3">
              <img
                src={profile.avatar}
                width={200}
                height={200}
                alt="Avatar"
                className="lg:w-18 w-22 lg:h-18 h-22 rounded-full object-cover border border-gray-500"
              />
              <div className="py-2">
                <h2 className="text-black font-bold lg:text-2xl text-3xl">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className=" flex text-gray-700 font-medium items-center text-lg py-2">            
                  <svg className="mr-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g opacity="0.5">
                          <path d="M20 10C20 14.4183 12 22 12 22C12 22 4 14.4183 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" stroke="black" strokeWidth="2"/>
                          <path d="M12 11C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9C11.4477 9 11 9.44772 11 10C11 10.5523 11.4477 11 12 11Z" fill="black" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                  </svg>
                  {profile.city} 
                </p>
                <h2 className="text-gray-800 font-medium text-md">
                  {profile.username}
                </h2>
              </div>

              <div className="flex items-center text-sm text-gray-700">
                <span className="mr-1 text-black text-lg font-bold">
                  {profile.rating ?? "—"}
                </span>
                <div className="flex text-yellow-400 mr-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < Math.round(profile.rating) ? "" : "opacity-30"}
                    />
                  ))}
                </div>
                <span className="text-[#2AAEF7] text-lg ml-1">
                  {profile.reviews_count} <Link href={`/reviews/add/${profile.id}`}>Add review</Link>
                </span>
              </div>
            </div>
          </div>

          <div className=" lg:w-3/4 lg:ml-24">
            <div className="rounded-3xl w-full bg-[#F2F1F0] h-[200px]  flex justify-center items-center">
              <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
            </div>
            <div className="lg:flex">
                <h1 className="w-2/3 text-black font-bold lg:text-4xl text-3xl lg:py-4 lg:py-1 py-4">Reviews </h1>
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

