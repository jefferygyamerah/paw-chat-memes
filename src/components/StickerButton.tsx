import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'papaya' | 'green' | 'ghost';
  className?: string;
  disabled?: boolean;
  title?: string;
  type?: 'button' | 'submit';
}

const styles: Record<NonNullable<Props['variant']>, string> = {
  papaya: 'bg-papaya text-white border-2 border-cocoa hover:bg-papaya-deep',
  green: 'bg-wgreen text-white border-2 border-cocoa hover:bg-wgreen-deep',
  ghost: 'bg-white text-cocoa border-2 border-linecream hover:border-papaya',
};

export default function StickerButton({ children, onClick, variant = 'papaya', className, disabled, title, type = 'button' }: Props) {
  return (
    <motion.button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-body font-bold text-[15px] shadow-[0_4px_0_rgba(58,42,30,0.9)] disabled:cursor-not-allowed disabled:opacity-50',
        styles[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
}
