'use client';

import { useRef, useState } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';

interface Props {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  name?: string;
}

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 300;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

export function PhotoUpload({ value, onChange, name }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const compressed = await compressImage(file);
    onChange(compressed);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar preview */}
      <div className="relative">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt="תמונת חבר"
              className="w-24 h-24 rounded-full object-cover border-2 border-primary-300 dark:border-primary-600 shadow"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white p-0.5 hover:bg-red-600 shadow"
              title="הסר תמונה"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div
            className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center transition-colors
              ${dragging
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                : 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700'
              }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <User className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        {/* Upload from device */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <Upload className="h-3.5 w-3.5" />
          העלה תמונה
        </button>

        {/* Camera capture (mobile) */}
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <Camera className="h-3.5 w-3.5" />
          צלם תמונה
        </button>
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileRef}
        name={name}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />

      <p className="text-xs text-gray-400 dark:text-gray-500">ניתן גם לגרור תמונה לעיגול</p>
    </div>
  );
}
