import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Dog, Role } from '@/lib/engine';
import { ROLE_META, downscaleImage } from '@/lib/engine';
import { cn } from '@/lib/utils';

interface Props {
  dog: Dog;
  disableRemove: boolean;
  onChange: (patch: Partial<Dog>) => void;
  onRemove: () => void;
  onPhotoError: (msg: string) => void;
}

const roles = Object.entries(ROLE_META) as [Role, (typeof ROLE_META)[Role]][];

export default function DogRow({ dog, disableRemove, onChange, onRemove, onPhotoError }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return onPhotoError('Eso no parece una foto 📸');
    if (file.size > 8 * 1024 * 1024) return onPhotoError('Esa foto pesa mucho, prueba otra 📸');
    const dataUrl = await downscaleImage(file, 256);
    setImgErr(false);
    onChange({ photo: dataUrl });
  };

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="mb-3 flex items-center gap-3 rounded-2xl border-2 border-linecream bg-white p-3 max-sm:flex-col max-sm:items-stretch"
    >
      <button
        type="button"
        aria-label={`Foto de ${dog.name || 'este perro'}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          'group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full transition-shadow hover:ring-[3px] hover:ring-papaya max-sm:mx-auto',
          !dog.photo && 'border-2 border-dashed border-papaya bg-cream',
          dragOver && 'ring-[3px] ring-papaya'
        )}
      >
        {dog.photo && !imgErr ? (
          <img src={dog.photo} alt="" onError={() => setImgErr(true)} className="h-full w-full object-cover" />
        ) : (
          <Plus className="h-5 w-5 text-papaya" />
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label="Subir foto del perro"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </button>

      <div className="grid flex-1 gap-2 sm:grid-cols-2">
        <input
          value={dog.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Lucas…"
          aria-label="Nombre del perro"
          className="w-full rounded-xl border-2 border-linecream bg-cream/50 px-3 py-2 text-[14px] font-bold text-cocoa outline-none placeholder:font-semibold placeholder:text-cocoasoft/70 focus:border-papaya"
        />
        <select
          value={dog.role}
          onChange={(e) => onChange({ role: e.target.value as Role })}
          aria-label="Personalidad"
          className="w-full rounded-xl border-2 border-linecream bg-cream/50 px-3 py-2 text-[13px] font-bold text-cocoa outline-none focus:border-papaya"
          title={ROLE_META[dog.role].desc}
        >
          {roles.map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.emoji} {meta.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={disableRemove}
        aria-label={`Quitar a ${dog.name || 'este perro'}`}
        title={disableRemove ? 'Mínimo 2 peludos' : 'Quitar perro'}
        className="rounded-full p-2 text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-30 max-sm:self-end"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
