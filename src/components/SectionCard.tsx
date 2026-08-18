import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  badge: string;
  title: string;
  aside?: string;
  id?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function SectionCard({ badge, title, aside, id, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section id={id} className="scroll-mt-24 rounded-[20px] border-2 border-linecream bg-white shadow-[0_6px_24px_rgba(58,42,30,0.08)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-cocoa bg-papaya font-display text-[15px] font-extrabold text-white">
          {badge}
        </span>
        <span className="font-display text-[20px] font-extrabold tracking-[-0.01em] text-cocoa">{title}</span>
        {aside && <span className="ml-auto mr-2 text-[13px] font-semibold text-cocoasoft">{aside}</span>}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className={cn(!aside && 'ml-auto')}>
          <ChevronDown className="h-5 w-5 text-cocoasoft" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
