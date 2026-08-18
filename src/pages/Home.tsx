import { AnimatePresence, motion } from 'framer-motion';
import { toBlob, toPng } from 'html-to-image';
import { Camera, Copy, Download, Eraser, Loader2, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import DogRow from '@/components/DogRow';
import Hero from '@/components/Hero';
import Layout from '@/components/Layout';
import PhonePreview, { type MockTheme } from '@/components/PhonePreview';
import SectionCard from '@/components/SectionCard';
import StickerButton from '@/components/StickerButton';
import { SCENARIOS, demoCast, downscaleImage, generateChat, newDog } from '@/lib/engine';
import type { ChatMsg, Dog, ScenarioId } from '@/lib/engine';
import { cn } from '@/lib/utils';

export default function Home() {
  const [dogs, setDogs] = useState<Dog[]>([newDog('protagonista'), newDog('chismoso')]);
  const [groupName, setGroupName] = useState('');
  const [groupIcon, setGroupIcon] = useState('/group-icon-default.png');
  const [theme, setTheme] = useState<MockTheme>('light');
  const [scenario, setScenario] = useState<ScenarioId>('pareja');
  const [gossip, setGossip] = useState('');
  const [evidence, setEvidence] = useState<string | undefined>();

  const [fullChat, setFullChat] = useState<ChatMsg[]>([]);
  const [visible, setVisible] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [typing, setTyping] = useState(false);
  const [flash, setFlash] = useState(false);
  const [toast, setToast] = useState('');
  const [exporting, setExporting] = useState(false);
  const [splitParts, setSplitParts] = useState<string[] | null>(null);
  const [confetti, setConfetti] = useState(0);

  const exportRef = useRef<HTMLDivElement>(null);
  const iconFileRef = useRef<HTMLInputElement>(null);
  const evidenceFileRef = useRef<HTMLInputElement>(null);

  const namedCount = dogs.filter((d) => d.name.trim()).length;
  const canGenerate = namedCount >= 2;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 3200);
  };

  /* progressive reveal — feels like watching the fight happen */
  useEffect(() => {
    if (!generated) return;
    if (visible >= fullChat.length) {
      if (fullChat.length > 0) setTyping(true);
      return;
    }
    const iv = window.setTimeout(() => setVisible((v) => v + 1), 90);
    return () => window.clearTimeout(iv);
  }, [visible, fullChat.length, generated]);

  const runGenerate = useCallback(
    (opts?: { seed?: number; cast?: Dog[]; scen?: ScenarioId; ev?: string; text?: string }) => {
      const cast = opts?.cast ?? dogs;
      const scen = opts?.scen ?? scenario;
      const ev = opts?.ev !== undefined ? opts.ev : evidence;
      const text = opts?.text ?? gossip;
      const chat = generateChat({ dogs: cast, scenario: scen, gossip: text, evidence: ev, seed: opts?.seed });
      setTyping(false);
      setFullChat(chat);
      setVisible(0);
      setGenerated(true);
      setSplitParts(null);
      setFlash(true);
      window.setTimeout(() => setFlash(false), 1200);
      document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [dogs, scenario, evidence, gossip]
  );

  const loadDemo = useCallback(() => {
    const cast = demoCast();
    setDogs(cast);
    setGroupName('La Casita De Luca');
    setGroupIcon('/group-icon-default.png');
    setTheme('light');
    setScenario('pareja');
    setGossip('');
    setEvidence('/demo-evidence.png');
    runGenerate({ seed: 20240817, cast, scen: 'pareja', ev: '/demo-evidence.png', text: '' });
  }, [runGenerate]);

  const clearAll = () => {
    setDogs([newDog('protagonista'), newDog('chismoso')]);
    setGroupName('');
    setGroupIcon('/group-icon-default.png');
    setGossip('');
    setEvidence(undefined);
    setScenario('pareja');
    setGenerated(false);
    setFullChat([]);
    setVisible(0);
    setTyping(false);
    setSplitParts(null);
  };

  const updateDog = (id: string, patch: Partial<Dog>) =>
    setDogs((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const handleEvidenceFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return showToast('Eso no parece una foto 📸');
    if (file.size > 8 * 1024 * 1024) return showToast('Esa foto pesa mucho, prueba otra 📸');
    setEvidence(await downscaleImage(file, 1024));
  };

  const visibleMessages = fullChat.slice(0, visible);

  /* ---------- export ---------- */
  const capture = async (): Promise<string | null> => {
    const node = exportRef.current;
    if (!node) {
      showToast('Primero genera un chisme 🐾');
      return null;
    }
    try {
      return await toPng(node, { pixelRatio: 2, cacheBust: true });
    } catch {
      showToast('No se pudo generar la imagen 😢 — inténtalo de nuevo');
      return null;
    }
  };

  const downloadDataUrl = (dataUrl: string, name: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = name;
    a.click();
  };

  const splitImage = async (dataUrl: string): Promise<string[]> => {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = dataUrl;
    });
    const half = Math.ceil(img.height / 2);
    return [0, half].map((y, idx) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = idx === 0 ? half : img.height - half;
      canvas.getContext('2d')!.drawImage(img, 0, y, img.width, canvas.height, 0, 0, img.width, canvas.height);
      return canvas.toDataURL('image/png');
    });
  };

  const handleDownload = async () => {
    if (!generated) return showToast('Primero genera un chisme 🐾');
    setExporting(true);
    try {
      const dataUrl = await capture();
      if (!dataUrl) return;
      const img = await new Promise<HTMLImageElement>((res) => {
        const i = new Image();
        i.onload = () => res(i);
        i.src = dataUrl;
      });
      if (img.height > 4000) {
        const parts = await splitImage(dataUrl);
        setSplitParts(parts);
        parts.forEach((p, i) => downloadDataUrl(p, `paw-chat-parte-${i + 1}.png`));
        showToast('Chat muy largo — se dividió en 2 imágenes ✂️');
      } else {
        downloadDataUrl(dataUrl, 'paw-chat-meme.png');
      }
      setConfetti((c) => c + 1);
    } finally {
      setExporting(false);
    }
  };

  const handleCopy = async () => {
    const node = exportRef.current;
    if (!node || !generated) return showToast('Primero genera un chisme 🐾');
    try {
      const blob = await toBlob(node, { pixelRatio: 2, cacheBust: true });
      if (!blob) throw new Error('no blob');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToast('¡Copiado al portapapeles! 📋');
    } catch {
      showToast('No se pudo copiar 😢 — prueba descargando');
    }
  };

  return (
    <Layout mockTheme={theme} onToggleTheme={() => setTheme((x) => (x === 'light' ? 'dark' : 'light'))} onLoadDemo={loadDemo}>
      <Hero onLoadDemo={loadDemo} />

      <div className="mx-auto grid max-w-[1360px] gap-8 px-4 pt-10 sm:px-6 lg:grid-cols-[440px_1fr]">
        {/* ---------------- editor ---------------- */}
        <div id="editor" className="scroll-mt-24 space-y-5 self-start lg:sticky lg:top-[88px]">
          <SectionCard badge="1" title="Elenco Perruno" aside={`${dogs.length}/6 peludos`} id="elenco">
            <AnimatePresence initial={false}>
              {dogs.map((dog) => (
                <DogRow
                  key={dog.id}
                  dog={dog}
                  disableRemove={dogs.length <= 2}
                  onChange={(patch) => updateDog(dog.id, patch)}
                  onRemove={() => setDogs((ds) => ds.filter((d) => d.id !== dog.id))}
                  onPhotoError={showToast}
                />
              ))}
            </AnimatePresence>
            <button
              type="button"
              disabled={dogs.length >= 6}
              title={dogs.length >= 6 ? 'Máximo 6 peludos' : 'Añadir perro'}
              onClick={() => setDogs((ds) => [...ds, newDog()])}
              className="w-full rounded-2xl border-2 border-dashed border-papaya py-2.5 text-[14px] font-extrabold text-papaya transition-colors hover:bg-papaya/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Añadir perro +
            </button>
            <p className="mt-2 text-[12.5px] font-semibold text-cocoasoft">
              Elenco de 2 a 6 peludos. La personalidad decide sus frases y su color en el chat.
            </p>
          </SectionCard>

          <SectionCard badge="2" title="Ajustes del Grupo" id="ajustes">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[13px] font-extrabold text-cocoa" htmlFor="group-name">
                  Nombre del grupo
                </label>
                <input
                  id="group-name"
                  value={groupName}
                  maxLength={25}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="La Casita De Luca"
                  className="w-full rounded-xl border-2 border-linecream bg-cream/50 px-3 py-2 text-[14px] font-bold text-cocoa outline-none placeholder:font-semibold placeholder:text-cocoasoft/70 focus:border-papaya"
                />
                <p className="mt-1 text-right text-[11.5px] font-semibold text-cocoasoft">{groupName.length}/25</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Cambiar icono del grupo"
                  onClick={() => iconFileRef.current?.click()}
                  className="h-12 w-12 overflow-hidden rounded-full border-2 border-linecream transition-shadow hover:ring-[3px] hover:ring-papaya"
                >
                  <img src={groupIcon} alt="Icono del grupo" className="h-full w-full object-cover" />
                </button>
                <div className="text-[13px] font-semibold text-cocoasoft">
                  Icono del grupo <span className="block text-[11.5px]">Toca para subir uno propio</span>
                </div>
                <input
                  ref={iconFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label="Subir icono del grupo"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 8 * 1024 * 1024) return showToast('Esa foto pesa mucho, prueba otra 📸');
                    setGroupIcon(await downscaleImage(f, 256));
                  }}
                />
              </div>

              <div>
                <span className="mb-1 block text-[13px] font-extrabold text-cocoa">Modo del chat</span>
                <div className="flex rounded-full border-2 border-linecream bg-cream/60 p-1" role="group" aria-label="Tema de la vista previa">
                  {(['light', 'dark'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTheme(m)}
                      className={cn(
                        'flex-1 rounded-full py-1.5 text-[13px] font-extrabold transition-colors',
                        theme === m ? 'bg-cocoa text-cream' : 'text-cocoasoft'
                      )}
                    >
                      {m === 'light' ? '☀️ Claro' : '🌙 Oscuro'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard badge="3" title="El Chisme" id="chisme">
            <div className="grid gap-3 sm:grid-cols-2 max-sm:grid-cols-1">
              {SCENARIOS.map((s) => {
                const active = scenario === s.id;
                return (
                  <motion.button
                    key={s.id}
                    type="button"
                    onClick={() => setScenario(s.id)}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      'relative overflow-hidden rounded-2xl border-2 p-3 text-left transition-all',
                      active
                        ? '-translate-y-0.5 border-papaya bg-papaya/10 shadow-[0_4px_14px_rgba(255,138,61,0.25)]'
                        : 'border-linecream bg-white hover:border-papaya/50'
                    )}
                    aria-pressed={active}
                  >
                    {active && <span className="absolute inset-x-0 top-0 h-1 bg-papaya" />}
                    <motion.span
                      animate={active ? { rotate: [0, -10, 10, 0] } : { rotate: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-[22px]"
                    >
                      {s.emoji}
                    </motion.span>
                    <p className="mt-1 font-display text-[15px] font-extrabold text-cocoa">{s.title}</p>
                    <p className="mt-0.5 text-[12px] font-semibold leading-snug text-cocoasoft">{s.blurb}</p>
                  </motion.button>
                );
              })}
            </div>

            <textarea
              value={gossip}
              onChange={(e) => setGossip(e.target.value)}
              rows={3}
              aria-label="Escribe tu propio chisme"
              placeholder="O escribe tu propio chisme… (ej. Luca se comió el jamón del cumpleaños)"
              className="mt-4 w-full rounded-xl border-2 border-linecream bg-cream/50 px-3 py-2 text-[14px] font-semibold text-cocoa outline-none placeholder:text-cocoasoft/70 focus:border-papaya"
            />
            {scenario === 'libre' && !gossip.trim() && (
              <p className="mt-1 text-[12px] font-bold text-papaya-deep">Tip: el chisme libre brilla más con tu propio texto ✍️</p>
            )}

            <div className="mt-4">
              <span className="mb-1 block text-[13px] font-extrabold text-cocoa">Foto comprometedora</span>
              {evidence ? (
                <div className="relative overflow-hidden rounded-2xl border-2 border-linecream">
                  <img src={evidence} alt="Foto comprometedora" className="aspect-video w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Quitar foto comprometedora"
                    onClick={() => setEvidence(undefined)}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => evidenceFileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleEvidenceFile(e.dataTransfer.files?.[0]);
                  }}
                  className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-papaya bg-papaya/5 text-papaya-deep transition-colors hover:bg-papaya/10"
                >
                  <Camera className="h-7 w-7" />
                  <span className="text-[14px] font-extrabold">📸 Sube la foto comprometedora</span>
                  <span className="text-[12px] font-semibold text-cocoasoft">Arrastra o haz clic · nunca sale de tu navegador</span>
                </button>
              )}
              <input
                ref={evidenceFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-label="Subir foto comprometedora"
                onChange={(e) => handleEvidenceFile(e.target.files?.[0])}
              />
            </div>
          </SectionCard>

          {/* action bar */}
          <div className="sticky bottom-3 z-10 rounded-[20px] border-2 border-linecream bg-white/95 p-3 shadow-[0_6px_24px_rgba(58,42,30,0.12)] backdrop-blur">
            <StickerButton
              variant="green"
              className="h-[52px] w-full text-[16px]"
              disabled={!canGenerate}
              title={canGenerate ? undefined : 'Necesitas al menos 2 perros con nombre'}
              onClick={() => runGenerate()}
            >
              {flash ? '¡Chisme servido! 🐾' : generated ? '🔁 Regenerar' : '🎬 Generar chisme'}
            </StickerButton>
            <div className="mt-2 flex justify-center gap-4">
              <button type="button" onClick={loadDemo} className="text-[13px] font-bold text-wgreen-deep hover:underline">
                Cargar demo
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1 text-[13px] font-bold text-cocoasoft hover:text-danger"
              >
                <Eraser className="h-3.5 w-3.5" /> Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- preview ---------------- */}
        <div id="preview" className="scroll-mt-24">
          <PhonePreview
            ref={exportRef}
            dogs={dogs}
            groupName={groupName}
            groupIcon={groupIcon}
            theme={theme}
            messages={visibleMessages}
            generated={generated}
            typing={typing}
          />

          {/* export bar */}
          <div className="mx-auto mt-6 flex max-w-[420px] flex-col items-center gap-3">
            <div className="flex w-full flex-wrap justify-center gap-3 max-sm:flex-col">
              <StickerButton variant="green" onClick={handleDownload} disabled={exporting || !generated} className="flex-1 max-sm:w-full">
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {splitParts ? 'Descargar de nuevo' : 'Descargar PNG'}
              </StickerButton>
              <StickerButton variant="ghost" onClick={handleCopy} disabled={!generated} className="max-sm:w-full">
                <Copy className="h-4 w-4" /> Copiar al portapapeles
              </StickerButton>
            </div>
            {splitParts && (
              <p className="flex items-center gap-1.5 text-[13px] font-bold text-wgreen-deep">
                <Sparkles className="h-4 w-4" /> Se descargaron 2 partes (parte 1 / parte 2) ✂️
              </p>
            )}
            <p className="text-center text-[12.5px] font-semibold text-cocoasoft">
              PNG en alta resolución (2×) sin marco de teléfono, con el fondo de WhatsApp incluido.
            </p>
          </div>
        </div>
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border-2 border-cocoa bg-sunny px-5 py-2.5 text-[14px] font-extrabold text-cocoa shadow-lg"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* paw confetti burst */}
      <AnimatePresence>
        {confetti > 0 && (
          <div key={confetti} className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, x: 0, y: 0, scale: 0.6 }}
                animate={{
                  opacity: 0,
                  x: Math.cos((i / 8) * Math.PI * 2) * 140,
                  y: Math.sin((i / 8) * Math.PI * 2) * 140,
                  scale: 1.4,
                }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="absolute text-[26px]"
              >
                🐾
              </motion.span>
            ))}
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
