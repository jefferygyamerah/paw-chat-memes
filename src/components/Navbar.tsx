import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

interface Props {
  mockTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLoadDemo: () => void;
}

const links = [
  { label: 'Elenco', href: '#elenco' },
  { label: 'Escenarios', href: '#chisme' },
  { label: 'Vista previa', href: '#preview' },
];

export default function Navbar({ mockTheme, onToggleTheme, onLoadDemo }: Props) {
  return (
    <motion.header
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 h-16 border-b-2 border-linecream bg-cream/85 backdrop-blur"
    >
      <div className="mx-auto flex h-full max-w-[1360px] items-center gap-4 px-4 sm:px-6">
        <a href="#top" className="group flex items-center gap-2.5">
          <motion.img
            src="/logo-paw.svg"
            alt="Logo de Paw Chat Memes"
            className="h-8 w-8"
            whileHover={{ rotate: [0, -8, 8, 0] }}
            transition={{ type: 'spring', stiffness: 300, damping: 12 }}
          />
          <span className="font-display text-[20px] font-extrabold tracking-[-0.01em] text-cocoa">Paw Chat Memes</span>
        </a>

        <nav className="mx-auto hidden items-center gap-7 md:flex" aria-label="Navegación principal">
          {links.map((l, i) => (
            <motion.a
              key={l.href}
              href={l.href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="group relative text-[14px] font-bold text-cocoa"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-[3px] w-0 rounded-full bg-papaya transition-all duration-200 group-hover:w-full" />
            </motion.a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={mockTheme === 'light' ? 'Cambiar vista previa a modo oscuro' : 'Cambiar vista previa a modo claro'}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-linecream bg-white text-cocoa transition-colors hover:border-papaya"
          >
            {mockTheme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onLoadDemo}
            className="rounded-full border-2 border-linecream bg-white px-4 py-1.5 text-[13px] font-bold text-cocoa transition-colors hover:border-papaya"
          >
            Cargar demo
          </button>
        </div>
      </div>
    </motion.header>
  );
}
