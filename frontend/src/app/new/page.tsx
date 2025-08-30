'use client';

import { useAuth } from '@/src/features/context/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
}

interface ExtraField {
  id: number;
  name: string;
  key: string;
  field_type: string;
}

export default function NewAd() {
  const { accessToken } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<FileList | null>(null);

  const [extraValues, setExtraValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetch('http://localhost:8000/api/categories/')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (Array.isArray(data.results)) {
          setCategories(data.results);
        } else {
          console.error("Непонятный формат данных:", data);
          setCategories([]);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`http://localhost:8000/api/subcategories/?category=${selectedCategory}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSubcategories(data);
          } else if (Array.isArray(data.results)) {
            setSubcategories(data.results);
          } else {
            setSubcategories([]);
          }
        });
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedSubcategory) {
      fetch(`http://localhost:8000/api/extra-fields/?subcategory=${selectedSubcategory}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setExtraFields(data);
          } else if (Array.isArray(data.results)) {
            setExtraFields(data.results);
          } else {
            setExtraFields([]);
          }
        });
    } else {
      setExtraFields([]);
    }
  }, [selectedSubcategory]);


  const handleExtraChange = (key: string, value: string) => {
    setExtraValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      alert('Вы должны быть авторизованы');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('subcategory', selectedSubcategory);
    formData.append('is_active', String(isActive));
    formData.append('extra', JSON.stringify(extraValues));

    if (images) {
      Array.from(images).forEach((file) => {
        formData.append('images', file);
      });
    }

    const res = await fetch('http://localhost:8000/api/ads/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (res.ok) {
      router.push("/listings")
    } else {
      const data = await res.json();
      console.error(data);
      alert('Ошибка при создании объявления');
    }
  };

  return (
<div className="w-full">
  <section className="bg-[#ffffff] pt-8 p-4">
    <div className="max-w-screen-xl mx-auto">
      <h1 className="text-black text-center font-bold text-4xl py-4">New ad</h1>
    </div>
  </section>

  <section className="bg-[#ffffff] pb-16 p-4 h-screen">
    <div className="text-black max-w-screen-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center w-full gap-4">

        <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
          <p className="font-semibold">Category</p>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-4 border border-black rounded-3xl h-[55px] mt-1 text-gray-900"
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>

        {selectedCategory && (
          <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
            <p className="font-semibold">Subcategory</p>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="p-4 border border-black rounded-3xl h-[55px] mt-1 text-gray-900"
              required
            >
              <option value="">Select subcategory</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {selectedSubcategory && (
          <>
            <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
              <p className="font-semibold">Title</p>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900"
                required
              />
            </label>

            <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
              <p className="font-semibold">Price</p>
              <input
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900"
                required
              />
            </label>

            <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
              <p className="font-semibold">Description</p>
              <textarea
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="p-4 border border-black rounded-3xl mt-1 text-gray-900"
                rows={4}
                required
              />
            </label>

            {extraFields.length > 0 && (
              <div className="lg:w-1/2 flex-col flex mt-4">
                <h3 className="font-bold">Additional fields</h3>
                {extraFields.map((field) => (
                  <label
                    key={field.id}
                    className="font-semibold text-gray-800 mt-2 block"
                  >
                    {field.name}
                    <input
                      type="text"
                      placeholder={field.name}
                      onChange={(e) => handleExtraChange(field.key, e.target.value)}
                      className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900"
                    />
                  </label>
                ))}
              </div>
            )}

            <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
              <p className="font-semibold">Images</p>
              <input
                type="file"
                multiple
                onChange={(e) => setImages(e.target.files)}
                className="p-4 border border-black rounded-3xl mt-1 text-gray-900"
              />
            </label>

            <button
              type="submit"
              className="bg-black text-white rounded-3xl px-6 py-2 mt-4 hover:bg-gray-800 transition"
            >
              Create Ad
            </button>
          </>
        )}
      </form>
    </div>
  </section>
</div>

  );
}
