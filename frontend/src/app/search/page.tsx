import { getAdsBySubcategory } from "@/src/entities/advertisment/api/get-ads";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import { getSubCategories } from "@/src/entities/sub-category/api/get-subcategories";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaStar } from "react-icons/fa";


interface Props {
  searchParams: { query?: string };
}

export default async function AdsBySubcategory({ searchParams }: Props) {
  const query = searchParams.query || "";
  let ads: Advertisement[] = [];

  if (query) {
    const res = await fetch(`http://127.0.0.1:8000/api/ads/?search=${query}`, {
      cache: "no-store",
    });
    const data = await res.json();
    ads = data.results || [];
  }

  return (
    <div className=" w-full">
      <section className="bg-[#ffffff] pt-8 p-4">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-gray-500 pb-2"><Link href="/">Home</Link> / <Link href="/">Search</Link></p>
        </div>
      </section>
      <section className="bg-[#ffffff]  pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">
          <div className="lg:w-1/3 w-full">
            <div>
              <h1 className="text-black font-bold text-2xl py-4">Make</h1>

              <div className="">
                <h1 className="text-black font-bold text-2xl py-4">Price</h1>
                <div className="flex">
                  <input type="text" className="p-2 w-36 rounded-2xl mr-2 text-black bg-[#E3E2E1]"  placeholder="From"/>
                  <input type="text" className="p-2 w-36 rounded-2xl text-black bg-[#E3E2E1]"  placeholder="To"/>
                </div>
              </div>
              <button className="mt-4 bg-[#2AAEF7] rounded-4xl h-[60px] w-[296px] text-white flex items-center text-center justify-center">
                <div className="flex items-center">
                  <Link href="/">Show</Link>
                </div>
              </button>
            
              <div className="rounded-3xl lg:w-86 w-full  bg-[#F2F1F0] min-h-200 mt-6 flex justify-center items-center">
                <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
              </div>
            </div>
          </div>
          <div className=" lg:w-2/3">
            <div>
              <h1 className="text-black font-bold text-3xl py-4">Search results for "{query}"</h1>
              <div className="grid md:grid-cols-3 grid-cols-2 ">

              </div>
            </div>
            <div className="mt-4 py-2 flex items-center cursor-pointer">
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
              <div className="mt-4">
            {ads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
                <img
                src="/not_found.png" 
                alt="No ads available"
                className="w-86 h-86 object-contain"
                />
            <p className="text-black text-3xl font-bold text-center">
                There are no ads in this category yet
            </p>
            <p className="text-black text-xl font-medium text-center mt-2">
                They will appear soon. In the meantime, you can search for something else or post your own.
            </p>

            </div>
            ) : (
            ads.map((ad) => (
               <Link
                  key={ad.id}
                  href={`/${ad.subcategory.category.slug}/${ad.subcategory.slug}/${ad.id}`}
                >
                <div className="bg-[#F2F1F0] rounded-2xl p-4 lg:flex mt-3">
                    <div className="lg:w-1/3">
                    <img
                        src={ad.images[0]?.image || "/placeholder.png"}
                        alt={ad.title}
                        width={200}
                        height={150}
                        className="rounded-xl object-cover w-full"
                    />
                    <div className="flex gap-2 mt-2 mr-2">
                        {ad.images.slice(0, 2).map((img) => (
                        <img
                            key={img.id}
                            className="rounded-2xl w-1/2 object-cover"
                            src={img.image}
                            width={900}
                            height={600}
                            alt={ad.title}
                        />
                        ))}
                    </div>
                    </div>

                    <div className="lg:w-2/3 lg:pl-4 lg:mt-0 mt-2 flex flex-col justify-between">
                    <div>
                        <h3 className="lg:text-xl text-2xl font-bold text-[#2AAEF7]">
                        {ad.title}
                        </h3>
                        <p className="text-black font-semibold lg:text-lg text-xl">
                        ${ad.price}
                        </p>
                        <p className="text-gray-600">
                        {ad.description.length > 200
                            ? ad.description.slice(0, 200) + "..."
                            : ad.description}
                        </p>
                    </div>
                    <div className="flex items-center mt-2 text-gray-500">
                        <span>{ad.location}</span>
                    </div>
                    <div className="max-w-[712px]">
                        <div className="flex items-center border-gray-300 py-3">
                        <img
                            src={`${ad.owner?.profile?.avatar}`}
                            width={200}
                            height={200}
                            alt=""
                            className="lg:w-10 w-15 mr-2 lg:h-10 h-15 rounded-full object-cover border border-gray-500"
                        />
                        <div>
                            <h2 className="text-black font-bold lg:text-lg text-lg">
                            {ad.owner?.first_name} {ad.owner?.last_name}
                            </h2>
                            <div className="flex items-center text-sm text-gray-700">
                            <span className="mr-1 text-black text-md font-bold">4.7</span>
                            <div className="flex text-yellow-400 mr-1">
                                {[...Array(4)].map((_, i) => (
                                <FaStar key={i} />
                                ))}
                                <FaStar className="opacity-50" />
                            </div>
                            <a
                                href="#"
                                className="text-[#2AAEF7] text-md ml-1 hover:underline"
                            >
                                13 reviews
                            </a>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </Link>
            ))
            )}

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
