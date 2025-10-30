import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const MAX_IMAGES = 10;

export default function ImageUploader({
  images,
  setImages,
}: {
  images: File[];
  setImages: (files: File[]) => void;
}) {
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const combined = [...images, ...newFiles].slice(0, MAX_IMAGES);
    setImages(combined);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  return (
    <div className="w-full max-w-md flex flex-col">
      <p className="font-semibold text-black text-xl">Images</p>
      <p className="text-gray-700 text-md font-medium">You can add up to {MAX_IMAGES} images</p>

      <div className="flex flex-wrap gap-2 mt-2">
        {images.map((file, idx) => (
          <div key={idx} className="relative w-30 h-30 border border-black/40 rounded-xl overflow-hidden">
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-200"
              onClick={() => removeImage(idx)}
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <label className="w-30 h-30 flex items-center justify-center border-2 border-dashed border-black/40 rounded-xl cursor-pointer hover:border-gray-500 transition relative">
            <Plus size={24} className="text-gray-500" />
            <input
              type="file"
              multiple
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFilesChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}
