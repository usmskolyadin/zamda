'use client';

import { useAuth } from '@/src/features/context/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';
import { apiFetchAuth } from '@/src/shared/api/auth';
import { Advertisement } from '@/src/entities/advertisment/model/types';
import { apiFetch } from '@/src/shared/api/base';
import Link from 'next/link';

interface ExtraField {
  id: number;
  name: string;
  key: string;
  field_type: string;
}

interface AdImage {
  id: number;
  image: string; // URL от бэка
}

export default function EditAd() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const adId = params?.id;

  const [ad, setAd] = useState<Advertisement | null>(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<AdImage[]>([]);
  const [extraValues, setExtraValues] = useState<{ [key: string]: string }>({});
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);

  useEffect(() => {
    if (!accessToken || !adId) return;

    const fetchAd = async () => {
      const res = await apiFetchAuth<Advertisement>(`api/ads/${adId}/`, accessToken);
      setAd(res);
      setTitle(res.title);
      setPrice(res.price.toString());
      setDescription(res.description);
      setIsActive(res.is_active);
      setExistingImages(res.images || []); // <- сохраняем список картинок
    };

    fetchAd();
  }, [accessToken, adId]);

  useEffect(() => {
    if (!ad || !accessToken) return;

    apiFetchAuth(`/api/extra-fields/?subcategory=${ad.subcategory.id}`, accessToken)
      .then((data) => {
        if (Array.isArray(data)) {
          setExtraFields(data);
        } else if (Array.isArray((data as any).results)) {
          setExtraFields((data as any).results);
        } else {
          setExtraFields([]);
        }
      })
      .catch(console.error);
  }, [ad, accessToken]);

  const handleExtraChange = (key: string, value: string) => {
    setExtraValues((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ Удаление картинки
  const handleDeleteImage = async (imageId: number) => {
    if (!accessToken) return;
    const confirmed = confirm('Удалить это изображение?');
    if (!confirmed) return;

    const res = await apiFetch(`/api/ad-images/${imageId}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) {
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } else {
      alert('Ошибка при удалении изображения');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken || !adId) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('is_active', String(isActive));
    formData.append('extra', JSON.stringify(extraValues));

    if (images) {
      Array.from(images).forEach((file) => {
        formData.append('images', file);
      });
    }

    const res = await apiFetch(`/api/ads/${adId}/`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    if (res.ok) {
      router.push(`/ads/${adId}`);
    } else {
      const data = await res.json();
      console.error(data);
      alert('Ошибка при обновлении объявления');
    }
  };

  if (!ad) {
    return <p className="text-center mt-10">Loading ad...</p>;
  }

  return (
    <div className="w-full">
      <section className="bg-[#ffffff] pt-8 p-4">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-black text-center font-bold text-4xl py-4">
            Edit your Ad <span className='text-[#2AAEF7]'>"<Link href={`/${ad.subcategory.category.id}/${ad.subcategory.id}/${ad.id}`}>{ad.title}</Link>"</span>
          </h1>
        </div>
      </section>

      <section className="bg-[#ffffff] pb-16 p-4 h-screen">
        <div className="text-black max-w-screen-xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center justify-center w-full gap-4"
          >
            {/* Title */}
            <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
              <p className="font-semibold text-black text-xl">Title</p>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                minLength={20}
                maxLength={100}
                className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900"
                required
              />
            </label>

            {/* Price */}
            <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
              <p className="font-semibold text-black text-xl">Price ($)</p>
              <input
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900"
                required
              />
            </label>

            {/* Description */}
            <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
              <p className="font-semibold text-black text-xl">Description</p>
              <textarea
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="p-4 border border-black rounded-3xl mt-1 text-gray-900"
                rows={4}
                required
                minLength={250}
                maxLength={2000}
              />
            </label>

            {/* Extra fields */}
            {extraFields.length > 0 && (
              <div className="lg:w-1/2 flex-col flex mt-4">
                <h3 className="font-bold text-black text-xl">
                  Additional fields
                </h3>
                {extraFields.map((field) => (
                  <label
                    key={field.id}
                    className="font-semibold text-gray-800 mt-2 block"
                  >
                    {field.name}
                    <input
                      type="text"
                      defaultValue={extraValues[field.key] || ''}
                      placeholder={field.name}
                      onChange={(e) =>
                        handleExtraChange(field.key, e.target.value)
                      }
                      className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900"
                    />
                  </label>
                ))}
              </div>
            )}

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="lg:w-1/2 flex flex-wrap gap-4 mt-4">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.image}
                      alt="Ad"
                      className="w-32 h-32 object-cover rounded-xl border"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload new images */}
            <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
              <p className="font-semibold text-black text-xl">Add Images</p>
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
              Save Changes
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
