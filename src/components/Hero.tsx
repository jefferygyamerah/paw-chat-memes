import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import StickerButton from './StickerButton';

interface Props {
  onLoadDemo: () => void;
}

const HEADLINE = 'El grupo de WhatsApp de tus perros existe… y arde en drama.';

export default function Hero({ onLoadDemo }: Props) {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLSpanElement>('.hero-word-inner');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.15 }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      className="relative flex min-h-[340px] items-center justify-center overflow-hidden border-b-2 border-linecream"
      style={{ backgroundImage: "url('/hero-bg-paws.png')", backgroundColor: '#FFF8EC', backgroundSize: '256px' }}
    >
      {/* drifting paws */}
      {[12, 78, 22, 88].map((left, i) => (
        <img
          key={i}
          src="/logo-paw.svg"
          alt=""
          aria-hidden
          className="paw-drift pointer-events-none absolute w-10 opacity-[0.15]"
          style={{
            left: `${left}%`,
            top: `${15 + ((i * 55) % 60)}%`,
            animation: `paw-drift 20s ease-in-out ${i * 2.5}s infinite`,
          }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 text-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 16 }}
          className="inline-block rounded-full border-2 border-cocoa bg-sunny px-4 py-1.5 text-[13px] font-extrabold text-cocoa"
        >
          🐾 Generador de memes perrunos
        </motion.span>

        <h1
          ref={headlineRef}
          className="mt-5 font-display text-[34px] font-extrabold leading-[1.08] tracking-[-0.01em] text-cocoa sm:text-[56px]"
        >
          {HEADLINE.split(' ').map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
              <span className="hero-word-inner inline-block will-change-transform">{w}&nbsp;</span>
            </span>
          ))}
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-[16px] font-semibold text-cocoasoft sm:text-[18px]">
          Crea chats falsos de tu manada, filtra la foto comprometedora y descarga el meme en PNG. Todo pasa en tu
          navegador.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
          <StickerButton onClick={() => document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' })}>
            Empezar el chisme ↓
          </StickerButton>
          <button
            type="button"
            onClick={onLoadDemo}
            className="text-[15px] font-bold text-wgreen-deep underline-offset-4 hover:underline"
          >
            Cargar demo
          </button>
        </div>
      </div>
    </section>
  );
}
