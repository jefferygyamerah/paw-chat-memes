import { motion } from 'framer-motion';

interface Props {
  onLoadDemo: () => void;
}

export default function Footer({ onLoadDemo }: Props) {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.5 }}
      className="mt-20 border-t-2 border-linecream bg-creamalt"
    >
      <div className="mx-auto flex max-w-[1360px] flex-col items-center gap-3 px-6 py-10 text-center">
        <img src="/logo-paw.svg" alt="" className="h-10 w-10" />
        <p className="text-[14px] font-semibold text-cocoasoft">
          Hecho con 🐾 y mucho chisme · Tus fotos nunca salen de tu navegador · No afiliado a WhatsApp Inc.
        </p>
        <div className="flex items-center gap-5 text-[13px] font-bold">
          <button type="button" onClick={onLoadDemo} className="text-wgreen-deep hover:underline">
            Repetir demo
          </button>
          <a href="#top" className="text-wgreen-deep hover:underline">
            Arriba ↑
          </a>
        </div>
      </div>
    </motion.footer>
  );
}
