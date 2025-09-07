"use client";

import { getCategories } from "@/src/entities/category/api/get-categories";
import { useEffect, useState } from "react";

export default function CategoryDropdown() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Ошибка загрузки категорий:", err);
      }
    }
    load();
  }, []);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`rounded-3xl cursor-pointer hover:bg-[#E5E9F2] p-4 h-[44px] w-[188px] flex justify-center items-center transition-colors duration-200
          ${open ? "bg-[#E5E9F2] text-black" : "bg-black text-white hover:text-black"}`}
      >
        <span className={open ? "text-black" : "hover:text-black text-white"}>All categories</span>
        <svg
          className={`ml-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          width="14"
          height="9"
          viewBox="0 0 12 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 0.889061L5.88906 5.77812L10.7781 0.889061"
            stroke={open ? "black" : "white"}
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-[188px] bg-white rounded-3xl shadow-lg p-4 z-10">
          <ul className="space-y-2">
            {categories.map((category, index) => (
              <li
                key={index}
                className="hover:bg-gray-100 p-2 rounded-xl text-black cursor-pointer"
              >
                <a href={`/${category.id}`}>{category.name}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
