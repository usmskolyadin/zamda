'use client';

import { useAuth } from '@/src/features/context/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';
import { apiFetchAuth } from '@/src/shared/api/auth';
import { Advertisement } from '@/src/entities/advertisment/model/types';
import { apiFetch } from '@/src/shared/api/base';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import { useMapEvents } from 'react-leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';

interface ExtraField {
  id: number;
  name: string;
  key: string;
  field_type: string;
}

interface AdImage {
  id: number;
  image: string; 
}

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconAnchor: [12, 41],
});

interface MapClickProps {
  onClick: (lat: number, lng: number) => void;
}

function MapClickHandler({ onClick }: MapClickProps) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface Category { id: number; name: string; }
interface SubCategory { id: number; name: string; }
interface ExtraField { id: number; name: string; key: string; field_type: string; }

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
  const [location, setLocation] = useState<string>('');
  const [latLng, setLatLng] = useState<LatLngExpression>([51.505, -0.09]);

  const handleMapClick = async (lat: number, lng: number) => {
    setLatLng([lat, lng]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'my-nextjs-app', 
          },
        }
      );

      if (!res.ok) return;

      const data: any = await res.json();

      if (data.address) {
        const { city, town, village, road, house_number } = data.address;

        const cityName = city || town || village || '';
        const street = road || '';
        const house = house_number || '';

        const formatted = [cityName, street, house].filter(Boolean).join(', ');
        setLocation(formatted);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };
  
  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);

    if (value.length < 3) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5`,
        {
          headers: { 'User-Agent': 'my-nextjs-app' },
        }
      );

      if (!res.ok) return;

      const data: any[] = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, address } = data[0];

        setLatLng([parseFloat(lat), parseFloat(lon)]);

        if (address) {
          const { city, town, village, road, house_number } = address;
          const cityName = city || town || village || '';
          const street = road || '';
          const house = house_number || '';
          const formatted = [cityName, street, house].filter(Boolean).join(', ');
          setLocation(formatted);
        }
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };


  const handleDeleteAd = async () => {
    if (!accessToken || !adId) return;

    const confirmed = confirm('Вы уверены, что хотите удалить это объявление?');
    if (!confirmed) return;

    try {
      const res = await apiFetch(`/api/ads/${adId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        alert('Объявление успешно удалено');
        router.push('/listings'); // перенаправление после успешного удаления
      } else {
        console.error('Ошибка при удалении объявления', res.status, res.statusText);
        alert('Не удалось удалить объявление');
      }
    } catch (err) {
      console.error(err);
      alert('Произошла ошибка при удалении объявления');
    }
  };

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

  const handleDeleteImage = async (imageId: number) => {
    if (!accessToken) return;
    const confirmed = confirm("Удалить это изображение?");
    if (!confirmed) return;

    const res = await apiFetch(`/api/ad-images/${imageId}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) {
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } else {
      alert("Ошибка при удалении изображения");
    }
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken || !adId || !ad) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("is_active", String(isActive));
    formData.append("extra", JSON.stringify(extraValues || {}));
    formData.append("location", location || "");

    formData.append("subcategory_id", ad.subcategory.id.toString());

    if (images) {
      if (existingImages.length + images.length > 10) {
        alert("Максимум 10 изображений!");
        return;
      }
      Array.from(images).forEach((file) => {
        formData.append("images", file);
      });
    }

    const res = await apiFetch(`/api/ads/${adId}/`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    if (res.ok) {
      router.push(`/ads/${adId}`);
    } else {
      try {
        const data = await res.json();
        console.error("Update error:", data);
        alert("Ошибка при обновлении объявления: " + JSON.stringify(data));
      } catch {
        alert("Ошибка при обновлении объявления");
      }
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

      <section className="bg-[#ffffff] pb-16 p-4">
        <div className="text-black max-w-screen-xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center justify-center w-full gap-4"
          >
            <div className="w-full max-w-xl flex flex-col gap-4">
              {/* Title */}
              <label className="flex-col flex font-semibold text-gray-800">
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
              <label className="flex-col flex font-semibold text-gray-800">
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
              <label className="flex-col flex font-semibold text-gray-800">
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
                <div className="flex-col flex">
                  <h3 className="font-bold text-black text-xl">Additional fields</h3>
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
                        onChange={(e) => handleExtraChange(field.key, e.target.value)}
                        className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900 w-full"
                      />
                    </label>
                  ))}
                </div>
              )}
              <label className=" flex-col flex font-semibold text-gray-800 mt-2">
                <p className="font-semibold text-black text-xl">Location</p>
                <input type="text" placeholder="Enter location or select on map" value={location} onChange={handleLocationChange} className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900 mb-2" required />
              </label>

              <div className=" h-80 border border-black rounded-3xl overflow-hidden">
                <MapContainer center={latLng} zoom={13} style={{ height: '100%', width: '100%', zIndex: "10" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={latLng} icon={defaultIcon}>
                    <Popup>Selected location</Popup>
                  </Marker>
                  <MapClickHandler onClick={handleMapClick} />
                </MapContainer>
              </div>
              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4">
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
                        className="absolute top-1 right-1 rounded-full bg-red-600 text-white text-xs px-2 py-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label>
                <p className="font-semibold text-black text-xl">Add Images</p>
                <p>Maximum number of images - 10</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    if (existingImages.length + e.target.files.length > 10) {
                      alert("Можно загрузить максимум 10 изображений");
                      e.target.value = "";
                      return;
                    }
                    setImages(e.target.files);
                  }}
                  className="p-4 border border-black rounded-3xl mt-1 text-gray-900 w-full"
                />
              </label>


              <div className="flex  gap-2">
                <button
                  type="submit"
                  className="w-full bg-black w-1/2 text-white rounded-3xl px-6 py-2 hover:bg-gray-800 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAd}
                  className="w-full w-1/2 bg-red-600 text-white rounded-3xl px-6 py-2 hover:bg-red-700 transition"
                >
                  Delete Ad
                </button>
              </div>
            </div>
          </form>

        </div>
      </section>
    </div>
  );
}
