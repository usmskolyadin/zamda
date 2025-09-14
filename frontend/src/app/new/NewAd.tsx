'use client';

import { useAuth } from '@/src/features/context/auth-context';
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { useMapEvents } from 'react-leaflet';
import { API_URL, apiFetch } from '@/src/shared/api/base';


interface MapClickProps {
  onClick: (lat: number, lng: number) => void;
}


type LatLngExpression = [number, number];

const MapContainer = dynamic(
  () => import("react-leaflet").then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then(mod => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then(mod => mod.Popup),
  { ssr: false }
);
const MapClickHandler = dynamic(
  () =>
    import("@/src/widgets/map/map-click-handler").then(
      mod => mod.MapClickHandler
    ),
  { ssr: false }
);


interface Category { id: number; name: string; }
interface SubCategory { id: number; name: string; }
interface ExtraField { id: number; name: string; key: string; field_type: string; }

export default function NewAd() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [defaultIcon, setDefaultIcon] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [latLng, setLatLng] = useState<LatLngExpression>([51.505, -0.09]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [images, setImages] = useState<FileList | null>(null);
  const [extraValues, setExtraValues] = useState<{ [key: string]: string }>({});

  const [loading, setLoading] = useState(true);

    useEffect(() => {
    (async () => {
        const L = await import('leaflet');
        const iconUrl = (await import('leaflet/dist/images/marker-icon.png')).default;
        const iconShadowUrl = (await import('leaflet/dist/images/marker-shadow.png')).default;

        setDefaultIcon(
        L.icon({
            iconUrl,
            shadowUrl: iconShadowUrl,
            iconAnchor: [12, 41],
        })
        );
    })();
    }, []);

useEffect(() => {
  if (typeof window === "undefined") return; 
  const token = accessToken || localStorage.getItem('access_token');
  if (!token) {
    router.push('/login');
    return;
  }

  (async () => {
    try {
      const data = await apiFetchAuth('/api/categories/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(data)) setCategories(data);
      else if (Array.isArray((data as any).results)) setCategories((data as any).results);
      else setCategories([]);
    } catch (err) {
      console.error(err);
      router.push('/login');
    }
  })();
}, [accessToken, router]);

useEffect(() => {
  if (typeof window === "undefined") return;
  const token = accessToken || localStorage.getItem('access_token');
  if (!token || !selectedCategory) return;

  apiFetchAuth(`/api/subcategories/?category=${selectedCategory}`, 
  )
    .then((data) => {
      if (Array.isArray(data)) setSubcategories(data);
      else if (Array.isArray((data as any).results)) setSubcategories((data as any).results);
      else setSubcategories([]);
    })
    .catch((err) => {
      console.error(err);
      router.push('/login');
    });
}, [accessToken, selectedCategory, router]);

//   const handleExtraChange = (key: string, value: string) => {
//     setExtraValues((prev) => ({ ...prev, [key]: value }));
//   };

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


const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (!accessToken) { router.push('/login'); return; }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('price', price);
  formData.append('description', description);
  formData.append('subcategory_id', selectedSubcategory); 
  formData.append('is_active', String(isActive));
  formData.append('extra', JSON.stringify(extraValues));
  formData.append('location', location); 
  console.log('selectedSubcategory:', selectedSubcategory);
  console.log('extraValues:', extraValues);
  if (images) Array.from(images).forEach(file => formData.append('images', file));

  console.log(formData)
  const res = await fetch(`${API_URL}/api/ads/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (res.ok) router.push('/listings');
  else {
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

  <section className="bg-[#ffffff] pb-16 p-4 h-screen overflow-auto">
    <div className="text-black max-w-screen-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center w-full gap-4">

        <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
          <p className="font-semibold text-black text-xl">Category</p>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="p-4 border border-black rounded-3xl h-[55px] mt-1 text-gray-900" required>
            <option value="">Select category</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </label>

        {selectedCategory && (
          <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
            <p className="font-semibold text-black text-xl">Subcategory</p>
            <select value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)} className="p-4 border border-black rounded-3xl h-[55px] mt-1 text-gray-900" required>
              <option value="">Select subcategory</option>
              {subcategories.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </label>
        )}

        {selectedSubcategory && <>
          <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
            <p className="font-semibold text-black text-xl">Title</p>
            <p className="font-medium text-gray-900">Minimum length 15 symbols</p>
            <input type="text" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} minLength={15} maxLength={100} className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900" required />
          </label>

          <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
            <p className="font-semibold text-black text-xl">Price ($)</p>
            <input type="number" placeholder="Enter price" value={price} onChange={(e) => setPrice(e.target.value)} className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900" required />
          </label>

          <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
            <p className="font-semibold text-black text-xl">Description</p>
            <p className="font-medium text-gray-900">Minimum length 150 symbols</p>
            <textarea placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} className="p-4 border border-black rounded-3xl mt-1 text-gray-900" rows={4} required minLength={150} maxLength={2000} />
          </label>

          <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
            <p className="font-semibold text-black text-xl">Location</p>
            <input type="text" placeholder="Enter location or select on map" value={location} onChange={handleLocationChange} className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900 mb-2" required />
          </label>

          <div className="lg:w-1/2 h-80 border border-black rounded-3xl overflow-hidden">
            <MapContainer center={latLng} zoom={13} style={{ height: '100%', width: '100%', zIndex: "10"  }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {defaultIcon && (
                <Marker position={latLng} icon={defaultIcon}>
                    <Popup>Selected location</Popup>
                </Marker>
                )}
              <MapClickHandler onClick={handleMapClick} />
            </MapContainer>
          </div>

          <label className="lg:w-1/2 flex-col flex font-semibold text-gray-800 mt-2">
            <p className="font-semibold text-black text-xl">Images</p>
            <input type="file" multiple onChange={(e) => setImages(e.target.files)} className="p-4 border border-black rounded-3xl mt-1 text-gray-900" />
          </label>

          <button type="submit" className="bg-black text-white rounded-3xl px-6 py-2 mt-4 hover:bg-gray-800 transition">
            Create Ad
          </button>
        </>}
      </form>
    </div>
  </section>
</div>
  );
}
