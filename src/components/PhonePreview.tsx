import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, CheckCheck, Mic, MoreVertical, Paperclip, Phone, Play, Pause, Smile, Video } from 'lucide-react';
import { forwardRef, memo, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMsg, Dog } from '@/lib/engine';
import { senderColor } from '@/lib/engine';
import { cn } from '@/lib/utils';

export type MockTheme = 'light' | 'dark';

interface Props {
  dogs: Dog[];
  groupName: string;
  groupIcon: string;
  theme: MockTheme;
  messages: ChatMsg[];
  generated: boolean;
  typing: boolean;
}

const t = {
  light: {
    header: 'bg-[#F0F2F5]',
    headerIcon: 'text-[#54656F]',
    headerName: 'text-[#111B21]',
    headerSub: 'text-[#667781]',
    inBubble: 'bg-white text-[#111B21]',
    outBubble: 'bg-[#DCF8C6] text-[#111B21]',
    time: 'text-[#667781]',
    pill: 'bg-[#FDF3C6] text-[#54656F]',
    inputBar: 'bg-[#F0F2F5]',
    inputField: 'bg-white text-[#111B21]',
    wallpaper: 'wa-wallpaper-light',
    reaction: 'bg-white text-[#111B21] border-[#E5DDD5]',
  },
  dark: {
    header: 'bg-[#202C33]',
    headerIcon: 'text-[#AEBAC1]',
    headerName: 'text-[#E9EDEF]',
    headerSub: 'text-[#8696A0]',
    inBubble: 'bg-[#202C33] text-[#E9EDEF]',
    outBubble: 'bg-[#005C4B] text-[#E9EDEF]',
    time: 'text-[#8696A0]',
    pill: 'bg-[#182229] text-[#8696A0]',
    inputBar: 'bg-[#202C33]',
    inputField: 'bg-[#2A3942] text-[#E9EDEF]',
    wallpaper: 'wa-wallpaper-dark',
    reaction: 'bg-[#202C33] text-[#E9EDEF] border-[#0B141A]',
  },
} as const;

type ThemeCfg = (typeof t)['light'] | (typeof t)['dark'];

function Tail({ color, side }: { color: string; side: 'left' | 'right' }) {
  return (
    <span
      className={cn('absolute top-0 h-[13px] w-[8px]', side === 'left' ? '-left-[7px]' : '-right-[7px]')}
      style={{
        background: color,
        clipPath: side === 'left' ? 'polygon(100% 0, 0 0, 100% 100%)' : 'polygon(0 0, 100% 0, 0 100%)',
      }}
    />
  );
}

const VoiceBubble = memo(function VoiceBubble({ dark, accentColor }: { dark: boolean; accentColor: string }) {
  const [playing, setPlaying] = useState(false);
  const [sec, setSec] = useState(0);
  const bars = useMemo(() => Array.from({ length: 32 }, (_, i) => 4 + ((i * 7919) % 11)), []);
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      setSec((s) => {
        if (s >= 7) {
          setPlaying(false);
          return 0;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [playing]);
  return (
    <div className="flex items-center gap-2 py-0.5">
      <button
        type="button"
        aria-label={playing ? 'Pausar nota de voz' : 'Reproducir nota de voz'}
        onClick={() => setPlaying((p) => !p)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wgreen text-white"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>
      <div className="flex h-7 flex-1 items-center gap-[2px]">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-[2.5px] rounded-full"
            style={{
              height: `${h}px`,
              background: playing && i <= (sec / 7) * 32 ? accentColor : '#8696A0',
              animation: playing ? `wave-bar 0.5s ease-in-out ${i * 0.05}s infinite` : undefined,
              transformOrigin: 'center',
            }}
          />
        ))}
      </div>
      <span className="text-[11px] text-[#8696A0]">0:{playing ? String(sec).padStart(2, '0') : '07'}</span>
      {dark && <span className="hidden" />}
    </div>
  );
});

function Avatar({ dog, size }: { dog?: Dog; size: number }) {
  const [err, setErr] = useState(false);
  if (dog?.photo && !err) {
    return (
      <img
        src={dog.photo}
        alt={dog.name}
        onError={() => setErr(true)}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-papaya font-display font-extrabold text-white"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {(dog?.name?.[0] ?? '🐶').toUpperCase()}
    </span>
  );
}

interface SurfaceProps {
  dogs: Dog[];
  displayName: string;
  subtitle: string;
  groupIcon: string;
  theme: MockTheme;
  messages: ChatMsg[];
  generated: boolean;
  typing: boolean;
  expanded: boolean;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

function Surface({ dogs, displayName, subtitle, groupIcon, theme, messages, generated, typing, expanded, scrollRef }: SurfaceProps) {
  const dark = theme === 'dark';
  const c: ThemeCfg = t[theme];
  const typingDog = messages.length ? messages[messages.length - 1] : undefined;
  const typingDogObj = dogs.find((d) => d.id === typingDog?.senderId) ?? dogs.find((d) => d.role === 'chismoso') ?? dogs[0];

  const body = (
    <>
      {/* header */}
      <div className={cn('flex items-center gap-2.5 px-3 pb-2 font-wa transition-colors duration-300', c.header, expanded ? 'pt-3' : 'pt-8')}>
        <ArrowLeft className={cn('h-5 w-5', c.headerIcon)} />
        <img src={groupIcon} alt="" className="h-9 w-9 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-[16px] font-semibold leading-tight', c.headerName)}>{displayName}</p>
          <p className={cn('truncate text-[13px] leading-tight', typing ? 'font-semibold text-wgreen-deep' : c.headerSub)}>
            {typing ? 'escribiendo…' : subtitle}
          </p>
        </div>
        <Video className={cn('h-5 w-5', c.headerIcon)} />
        <Phone className={cn('h-[18px] w-[18px]', c.headerIcon)} />
        <MoreVertical className={cn('h-5 w-5', c.headerIcon)} />
      </div>

      {/* chat */}
      <div ref={scrollRef} className={cn('px-3 py-2 font-wa', expanded ? undefined : 'flex-1 overflow-y-auto [scrollbar-width:thin]')}>
        <div className="flex justify-center py-1">
          <span className={cn('rounded-lg px-3 py-1.5 text-center text-[11.5px] leading-snug shadow-sm', c.pill)}>
            Los mensajes y las llamadas están cifrados de extremo a extremo.
          </span>
        </div>
        <div className="flex justify-center py-1">
          <span className={cn('rounded-lg px-3 py-1 text-[12px] font-semibold shadow-sm', c.pill)}>HOY</span>
        </div>

        {!generated ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 px-8 text-center">
            <img src="/empty-cast.png" alt="Un perro solitario junto a un teléfono vacío" className="w-56 rounded-2xl" />
            <p className={cn('font-body text-[15px] font-bold', dark ? 'text-[#AEBAC1]' : 'text-cocoasoft')}>
              Genera tu primer chisme 🐶
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-[8px] pb-2 pt-1">
            {messages.map((m, i) => {
              const prev = messages[i - 1];
              const runStart = !prev || prev.senderId !== m.senderId || prev.kind === 'system';
              const inner = (() => {
                if (m.kind === 'system') {
                  return (
                    <div className="flex justify-center py-0.5">
                      <span className={cn('rounded-lg px-3 py-1 text-[12.5px] shadow-sm', c.pill)}>{m.text}</span>
                    </div>
                  );
                }
                if (m.kind === 'owner') {
                  return (
                    <div className="flex justify-end">
                      <div className={cn('relative max-w-[78%] rounded-[7.5px] px-2.5 py-1.5 shadow-sm', c.outBubble)}>
                        {runStart && <Tail color={dark ? '#005C4B' : '#DCF8C6'} side="right" />}
                        <span className="whitespace-pre-wrap text-[14.2px] leading-[19px]">{m.text}</span>
                        <span className={cn('ml-2 inline-flex translate-y-[3px] items-center gap-0.5 text-[11px]', c.time)}>
                          {m.time} <CheckCheck className="h-[15px] w-[15px] text-[#53BDEB]" />
                        </span>
                      </div>
                    </div>
                  );
                }
                const dog = dogs.find((d) => d.id === m.senderId);
                return (
                  <div className={cn('flex items-end gap-1.5', !runStart && 'mt-[-6px]')}>
                    <div className="w-7 shrink-0">{runStart && <Avatar dog={dog} size={28} />}</div>
                    <div className={cn('relative max-w-[78%] rounded-[7.5px] px-2.5 py-1.5 shadow-sm', c.inBubble)}>
                      {runStart && <Tail color={dark ? '#202C33' : '#FFFFFF'} side="left" />}
                      {runStart && (
                        <p className="text-[12.8px] font-semibold leading-[17px]" style={{ color: senderColor(dogs, m.senderId, dark) }}>
                          {m.senderName}
                        </p>
                      )}
                      {m.kind === 'photo' && m.photo && (
                        <div className="relative mb-1 mt-0.5">
                          <img src={m.photo} alt="Foto comprometedora" className="w-60 max-w-full rounded-lg object-cover" />
                          <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/50 px-1.5 py-0.5 text-[11px] text-white">{m.time}</span>
                        </div>
                      )}
                      {m.kind === 'voice' && <VoiceBubble dark={dark} accentColor={senderColor(dogs, m.senderId, dark)} />}
                      {(m.kind === 'text' || m.caption || (m.kind === 'voice' && m.text)) && (
                        <span className="whitespace-pre-wrap text-[14.2px] leading-[19px]">
                          {m.kind === 'photo' ? m.caption : m.text}
                        </span>
                      )}
                      {m.kind !== 'photo' && (
                        <span className={cn('ml-2 inline-flex translate-y-[3px] items-center gap-0.5 text-[11px]', c.time)}>
                          {m.time} <Check className="h-3 w-3 opacity-0" />
                        </span>
                      )}
                      {m.reactions && m.reactions.length > 0 && (
                        <span
                          className={cn('absolute -bottom-3 right-2 flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[12px] shadow', c.reaction)}
                        >
                          {m.reactions.map((r, ri) => (
                            <span key={ri}>
                              {r.emoji} <b>{r.count}</b>
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })();

              if (expanded) return <div key={m.id}>{inner}</div>;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                >
                  {inner}
                </motion.div>
              );
            })}

            {typing && typingDogObj && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 flex items-end gap-1.5">
                <Avatar dog={typingDogObj} size={28} />
                <div className={cn('relative flex items-center gap-1 rounded-[7.5px] px-3 py-2.5 shadow-sm', c.inBubble)}>
                  <Tail color={dark ? '#202C33' : '#FFFFFF'} side="left" />
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={cn('h-2 w-2 rounded-full', dark ? 'bg-[#8696A0]' : 'bg-[#667781]')}
                      style={{ animation: `typing-dot 0.6s ease-in-out ${i * 0.15}s infinite` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* input bar */}
      <div className={cn('flex items-center gap-2 px-2 py-2 font-wa transition-colors duration-300', c.inputBar)}>
        <div className={cn('flex flex-1 items-center gap-2 rounded-full px-3 py-2', c.inputField)}>
          <Smile className={cn('h-5 w-5', c.headerIcon)} />
          <span className={cn('flex-1 text-[15px]', c.headerSub)}>Mensaje</span>
          <Paperclip className={cn('h-5 w-5', c.headerIcon)} />
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-wgreen text-white shadow">
          {typing ? <Check className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </span>
      </div>
    </>
  );

  if (expanded) {
    return <div className={cn('flex w-[420px] flex-col', c.wallpaper)}>{body}</div>;
  }
  return (
    <div className={cn('relative flex h-[min(844px,100dvh-160px)] min-h-[480px] flex-col overflow-hidden rounded-[36px] transition-opacity duration-300 max-sm:rounded-[28px]', c.wallpaper)}>
      <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-5 w-28 -translate-x-1/2 rounded-full bg-black/90" />
      {body}
    </div>
  );
}

const PhonePreview = forwardRef<HTMLDivElement, Props>(function PhonePreview(
  { dogs, groupName, groupIcon, theme, messages, generated, typing },
  exportRef
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const namedDogs = dogs.filter((d) => d.name.trim());
  const subtitle = namedDogs.length > 0 ? `${namedDogs.map((d) => d.name).join(', ')}, tú…` : 'Luca, Frida, Pancho, tú…';
  const displayName = groupName.trim() || 'La Casita De Luca';

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, generated]);

  const surfaceProps = { dogs, displayName, subtitle, groupIcon, theme, messages, generated, typing };

  return (
    <div className="relative mx-auto w-[390px] max-w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0.35 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-[48px] bg-[#111] p-[12px] shadow-[0_24px_60px_rgba(58,42,30,0.35)] max-sm:rounded-[36px] max-sm:p-[8px]"
        >
          <Surface {...surfaceProps} expanded={false} scrollRef={scrollRef} />
        </motion.div>
      </AnimatePresence>

      {/* hidden expanded surface for PNG export (no bezel, full height) */}
      {generated && (
        <div aria-hidden className="pointer-events-none fixed left-[-3000px] top-0">
          <div ref={exportRef}>
            <Surface {...surfaceProps} expanded />
          </div>
        </div>
      )}

      {/* side buttons */}
      <div className="absolute -right-[2px] top-28 h-14 w-[3px] rounded-r bg-[#2a2a2a]" />
      <div className="absolute -right-[2px] top-48 h-9 w-[3px] rounded-r bg-[#2a2a2a]" />
    </div>
  );
});

export default PhonePreview;
