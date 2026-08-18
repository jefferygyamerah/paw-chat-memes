// Paw Chat Memes — deterministic template dialogue engine (client-side, seeded RNG)

export type Role =
  | 'protagonista'
  | 'chismoso'
  | 'ex'
  | 'mejor-amigo'
  | 'pareja'
  | 'indiferente';

export interface Dog {
  id: string;
  name: string;
  role: Role;
  photo?: string; // dataURL or public path
}

export type ScenarioId = 'pareja' | 'secreto' | 'libre' | 'favorito';

export type MsgKind = 'text' | 'photo' | 'voice' | 'system' | 'owner';

export interface Reaction {
  emoji: string;
  count: number;
}

export interface ChatMsg {
  id: string;
  kind: MsgKind;
  senderId?: string; // dog id (undefined for owner/system)
  senderName: string;
  text?: string;
  photo?: string;
  caption?: string;
  voiceSecs?: number;
  reactions?: Reaction[];
  time: string;
}

/* ---------------- seeded RNG ---------------- */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

const pick = <T,>(r: Rng, arr: T[]): T => arr[Math.floor(r() * arr.length)];
const pickN = <T,>(r: Rng, arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  while (copy.length && out.length < n) {
    out.push(copy.splice(Math.floor(r() * copy.length), 1)[0]);
  }
  return out;
};

export const ROLE_META: Record<Role, { emoji: string; label: string; desc: string }> = {
  protagonista: { emoji: '🐶', label: 'El Protagonista', desc: 'el perro del que todo el mundo habla' },
  chismoso: { emoji: '🗣️', label: 'El Chismoso', desc: 'filtra fotos y lo cuenta todo' },
  ex: { emoji: '💔', label: 'La Ex Dramática', desc: 'no lo supera y deja notas de voz' },
  'mejor-amigo': { emoji: '🤝', label: 'El Mejor Amigo', desc: 'defiende al protagonista pase lo que pase' },
  pareja: { emoji: '💕', label: 'La Pareja Nueva', desc: 'la bomba del grupo' },
  indiferente: { emoji: '😴', label: 'El Indiferente', desc: 'responde "ok" a todo' },
};

export const SCENARIOS: { id: ScenarioId; emoji: string; title: string; blurb: string }[] = [
  { id: 'pareja', emoji: '💥', title: 'Nueva pareja revelada', blurb: 'Alguien filtra una foto del protagonista con su nueva pareja.' },
  { id: 'secreto', emoji: '🤫', title: 'Secreto revelado', blurb: 'Sale a la luz un secreto oscuro (calcetines, la cama, el sofá…).' },
  { id: 'libre', emoji: '💅', title: 'Chisme libre', blurb: 'Usa tu propio texto como semilla del drama.' },
  { id: 'favorito', emoji: '🏆', title: 'El favorito', blurb: 'Alguien descubre quién es el consentido de la casa.' },
];

const fmtTime = (mins: number) => {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
};

interface Ctx {
  r: Rng;
  gossip: string;
  prota: string;
  chismoso: string;
  ex: string;
  amigo: string;
  pareja: string;
  indiferente: string;
}

const secretTopic = (c: Ctx) =>
  pick(c.r, [
    'se come los calcetines de la casa',
    'duerme en la cama cuando no hay nadie',
    'se sube al sofá bueno en cuanto cierran la puerta',
    'entierra las croquetas en las macetas',
    'le ladra a su propio reflejo y luego llora',
  ]);

/* ---------------- line banks (variants per slot) ---------------- */

const hookLines = (c: Ctx, s: ScenarioId): string[] => {
  switch (s) {
    case 'pareja':
      return [
        `MANA. MANAAAA. No se van a creer lo que acabo de ver 👀`,
        `Chicas. CHICAS. Sienten a los gatos porque esto es FUERTE 🚨`,
        `Ok, respiren. Tengo información de ${c.prota} y NO es un simulacro 🫢`,
        `Yo no quería ser la portadora de esto, pero aquí vamos… 😬`,
      ];
    case 'secreto':
      return [
        `Familia, tengo que decir algo sobre ${c.prota} y me tiembla el hocico 🤫`,
        `Yo siempre lo supe 👀 pero hoy tengo PRUEBAS de lo de ${c.prota}`,
        `Esto se queda en el grupo, ¿eh? Pero ${c.prota} tiene un secretito…`,
        `Reunión de emergencia. El tema: ${c.prota}. El tono: CHISME 🫢`,
      ];
    case 'favorito':
      return [
        `Acabo de confirmar quién es el consentido de la casa y estoy que LADRÓ 🏆`,
        `No quiero sembrar discordia, PERO… vi la libreta de paseos y hay un claro favorito 👀`,
        `Esto explica MUCHO: ya sabemos quién recibe el premio extra por la noche 🫢`,
        `Alerta de injusticia perruna en 3… 2… 1… 🚨`,
      ];
    case 'libre':
      return [
        c.gossip ? `MANA, escuchen esto: ${c.gossip} 👀` : `MANA. Tengo un chisme que quema las patas 👀`,
        c.gossip ? `Esto no me lo van a creer: ${c.gossip} 🫢` : `No se lo van a creer, vengo con el chisme del siglo 🫢`,
        c.gossip ? `Chicas, bomba: ${c.gossip}. Sí. TAL CUAL.` : `Bomba perruna entrante. Sujétense los collares 💣`,
      ];
  }
};

const photoCaption = (c: Ctx, s: ScenarioId): string[] => {
  if (s === 'secreto')
    return [
      `LA EVIDENCIA. Aquí está ${c.prota} en pleno delito 📸`,
      `Miren la fecha y la hora. INNEGABLE.`,
      `Esto lo tomé yo con mi propia cámara. Sin filtros. Sin piedad.`,
    ];
  if (s === 'favorito')
    return [
      `Foto del momento EXACTO. Miren quién tiene el premio doble 📸`,
      `La libreta no miente, y esta foto tampoco 👀`,
      `Guárdenla. Esto es historia del grupo.`,
    ];
  return [
    `AHÍ ESTÁN. ${c.prota} y ${c.pareja}. En una CAFETERÍA. Con PUPUCCINOS 📸`,
    `No es un montaje. Repito: NO ES UN MONTAJE.`,
    `Fuente: no puedo decirla. Pero miren esa complicidad 😏`,
  ];
};

const photoMissing = (): string[] => [
  `Tenía la foto pero… se borró la foto 😭 igual TODO es verdad`,
  `La evidencia desapareció misteriosamente 👀 pero yo vi lo que vi`,
  `Iba a mandar la foto y puff, se autodestruyó. Típico de los poderosos 🫢`,
];

const exHeartbreak = (c: Ctx, s: ScenarioId): string[] => {
  if (s === 'pareja')
    return [
      `No puede ser… ${c.prota} me prometió puppuccinos A MÍ 💔`,
      `Yo todavía tengo su pelota favorita. ¿Y ahora resulta que hay OTRA? 😭`,
      `Esto es una pesadilla. Avísenme cuando despierte 💔`,
      `${c.prota}… después de todo lo que ladrimos juntos…`,
    ];
  if (s === 'secreto')
    return [
      `Yo SABÍA que escondía algo. Nadie mira así una maceta sin culpa 💔`,
      `Todos esos paseos… ¿eran una mentira también? 😭`,
      `No puedo creer que me enteré por un GRUPO. Eso duele más 💔`,
    ];
  if (s === 'favorito')
    return [
      `¿O sea que YO nunca fui la favorita? ¿NI UN DÍA? 💔`,
      `Años de lealtad, de mover la cola… para esto 😭`,
      `Me voy a echar en mi cama a procesar. LA MÍA, que sí es mía 💔`,
    ];
  return [
    `Esto me afecta personalmente y no sé explicar por qué 💔`,
    `Yo solo quería un grupo tranquilo… 😭`,
    `Nadie piensa en mi corazón en estos momentos 💔`,
  ];
};

const voiceLines = (c: Ctx): string[] => [
  `(nota de voz llorando) ${c.prota} cómo pudiste… tú eras diferente… 🥺`,
  `(nota de voz con drama) yo ya lo sabía… lo sabía desde la guardería… 💔`,
  `(nota de voz) no me hablen… necesito procesar… y un premio… 🥺`,
];

const amigoDefense = (c: Ctx, s: ScenarioId): string[] => {
  if (s === 'pareja')
    return [
      `¡Oigan! ${c.prota} es libre de querer a quien quiera 🐾 déjenlo ser feliz`,
      `Hermano yo siempre te apoyo. Además ${c.pareja} es buena onda, le da premios a todos 🤝`,
      `Dejen de armar drama, que el parque es de todos`,
    ];
  if (s === 'secreto')
    return [
      `¿Y qué si ${c.prota} ${secretTopic(c)}? TODOS tenemos secretos 🤝`,
      `Yo lo he visto llorar por eso. Tengan EMPATÍA.`,
      `El que esté libre de culpa que lance el primer palo 🐾`,
    ];
  if (s === 'favorito')
    return [
      `Oigan, ${c.prota} no tiene la culpa de ser tan guapo 🤝`,
      `Yo también quiero premio doble, pero no por eso voy a atacar a mi hermano`,
      `Calma, manada. El amor de los humanos alcanza para todos 🐾`,
    ];
  return [
    `Yo apoyo a ${c.prota} pase lo que pase, eso es la amistad 🤝`,
    `Drama o no drama, esta manada no se rompe 🐾`,
    `Todos tranquilos, que al final seguro hay premios para todos`,
  ];
};

const protaReacts = (c: Ctx, s: ScenarioId): string[] => {
  if (s === 'pareja')
    return [
      `Ok. Sí. Es verdad. Estoy saliendo con ${c.pareja} y soy FELIZ 🥰`,
      `Quería decírselos en su momento… con una cena y todo 😳`,
      `Puedo explicarlo. Bueno, no, pero puedo mirarlos con ojitos 🥺`,
    ];
  if (s === 'secreto')
    return [
      `…¿Quién filtró eso? Era información CLASIFICADA 😤`,
      `No es lo que parece. Bueno, es EXACTAMENTE lo que parece 😳`,
      `En mi defensa: los calcetines estaban ahí. A la vista. Provocándome.`,
    ];
  if (s === 'favorito')
    return [
      `Yo no pedí ser el favorito… pero tampoco voy a renunciar al trono 👑`,
      `Esto es fake news. (baja la voz) es totalmente cierto`,
      `Perdón por ser irresistible, supongo 😌`,
    ];
  return [
    `Wow. WOW. Esto se salió de control rapidísimo 😳`,
    `Yo solo vine a ver memes y terminé siendo el meme`,
    `En mi defensa: soy un perro 🐶`,
  ];
};

const parejaLines = (c: Ctx): string[] => [
  `Hola a todos 👋💕 yo solo quería caer bien… y traigo puppuccinos`,
  `Juro que mis intenciones con ${c.prota} son puras (y con premios) 💕`,
  `Si el grupo me acepta, prometo filtrar solo fotos bonitas 🥰`,
];

const indiferenteLines = (): string[] => [`ok`, `ah.`, `me avisan cuando haya comida`, `ok ok`];

const gossipWeave = (c: Ctx): string[] => [
  `Además, escuchen esto: ${c.gossip} 😱`,
  `Y no es todo. También dicen que ${c.gossip} 👀`,
  `Esperen, que hay más: ${c.gossip} 🫢`,
];

const cliffhangers = (c: Ctx, s: ScenarioId): string[] => {
  if (s === 'pareja')
    return [
      `esto no se queda así… mañana hay reunión en el parque 📅`,
      `${c.pareja} quiere hablar con la manada. Prepárense 👀`,
      `continuará… (tengo más fotos) 🫢`,
    ];
  return [
    `esto no ha terminado… tengo más información 📁`,
    `mañana cuento la segunda parte. Duerman si pueden 😏`,
    `y aún no han visto lo peor 👀`,
  ];
};

const ownerLines = (): string[] => [
  `¡¿QUÉ ESTÁ PASANDO AQUÍ?! 🐾`,
  `¡¿Por qué mi teléfono tiene 87 notificaciones de ESTE grupo?!`,
  `Dejen el drama y vengan a comer. TODOS. 🐶`,
];

const reactionEmojis = ['😂', '❤️', '😱', '👀', '💀', '🐾'];

/* ---------------- engine ---------------- */

export interface EngineInput {
  dogs: Dog[];
  scenario: ScenarioId;
  gossip: string;
  evidence?: string;
  seed?: number;
}

export function generateChat({ dogs, scenario, gossip, evidence, seed }: EngineInput): ChatMsg[] {
  const r = mulberry32(seed ?? Math.floor(Math.random() * 2 ** 31));
  const byRole = (role: Role) => dogs.find((d) => d.role === role && d.name.trim());
  const named = dogs.filter((d) => d.name.trim());
  const prota = byRole('protagonista') ?? named[0];
  const chismoso = byRole('chismoso') ?? named[1] ?? named[0];
  const ex = byRole('ex');
  const amigo = byRole('mejor-amigo');
  const pareja = byRole('pareja');
  const indiferente = byRole('indiferente');

  const c: Ctx = {
    r,
    gossip: gossip.trim(),
    prota: prota?.name ?? 'Luca',
    chismoso: chismoso?.name ?? 'Frida',
    ex: ex?.name ?? 'Frida',
    amigo: amigo?.name ?? 'Pancho',
    pareja: pareja?.name ?? 'Reina',
    indiferente: indiferente?.name ?? 'Simón',
  };

  const msgs: Omit<ChatMsg, 'time' | 'id'>[] = [];
  const add = (m: Omit<ChatMsg, 'time' | 'id'>) => msgs.push(m);
  const dogMsg = (dog: Dog | undefined, text: string) => {
    if (!dog) return;
    add({ kind: 'text', senderId: dog.id, senderName: dog.name, text });
  };
  const sys = (text: string) => add({ kind: 'system', senderName: '', text });

  // 1. hook (chismoso)
  dogMsg(chismoso, pick(r, hookLines(c, scenario)));

  // 2. photo leak or missing-photo line
  if (evidence) {
    if (chismoso) {
      add({
        kind: 'photo',
        senderId: chismoso.id,
        senderName: chismoso.name,
        photo: evidence,
        caption: pick(r, photoCaption(c, scenario)),
      });
    }
  } else if (chismoso) {
    dogMsg(chismoso, pick(r, photoMissing()));
  }

  // 3. ex reaction + voice note
  if (ex) {
    dogMsg(ex, pick(r, exHeartbreak(c, scenario)));
    if (r() > 0.2) {
      add({
        kind: 'voice',
        senderId: ex.id,
        senderName: ex.name,
        voiceSecs: 7,
        text: pick(r, voiceLines(c)),
      });
    }
  }

  // 4. free gossip woven in
  if (c.gossip && scenario !== 'libre') {
    dogMsg(chismoso, pick(r, gossipWeave(c)));
  }

  // 5. amigo defense
  if (amigo) dogMsg(amigo, pick(r, amigoDefense(c, scenario)));

  // 6. indiferente
  if (indiferente && r() > 0.35) dogMsg(indiferente, pick(r, indiferenteLines()));

  // 7. protagonista reacts
  dogMsg(prota, pick(r, protaReacts(c, scenario)));

  // 8. pareja speaks (scenario pareja or if cast)
  if (pareja && (scenario === 'pareja' || r() > 0.4)) {
    dogMsg(pareja, pick(r, parejaLines(c)));
  }

  // 9. ex escalates / leaves group
  const exLeaves = ex && r() > 0.45;
  if (ex && exLeaves) {
    dogMsg(ex, pick(r, [
      `No puedo más. Me voy del grupo. ADIÓS. 💔🚪`,
      `Esto es demasiado para mi corazón. Abandono el grupo 😭`,
    ]));
    sys(`${ex.name} abandonó el grupo 🚪`);
    if (amigo && r() > 0.4) {
      dogMsg(amigo, `espera ${ex.name} no te vayas 😢`);
      sys(`${amigo.name} añadió a ${ex.name} al grupo`);
      dogMsg(ex, `…gracias. Pero sigo herida 💔`);
    }
  } else if (ex) {
    dogMsg(ex, pick(r, [
      `Voy a llorar en la esquina del jardín. No me busquen 😭`,
      `Necesito un puppuccino y terapia. En ese orden 💔`,
    ]));
  }

  // 10. another indiferente beat
  if (indiferente && r() > 0.5) dogMsg(indiferente, pick(r, indiferenteLines()));

  // 11. owner bursts in (exactly one outgoing)
  add({ kind: 'owner', senderName: 'Tú', text: pick(r, ownerLines()) });

  // 12. cliffhanger
  dogMsg(chismoso, pick(r, cliffhangers(c, scenario)));

  // timestamps: base ~21:4x, clusters of 1–3 min
  let t = 21 * 60 + 40 + Math.floor(r() * 12);
  let seq = 0;
  const out: ChatMsg[] = msgs.map((m, i) => {
    if (i > 0) t += 1 + Math.floor(r() * 3);
    const withMeta: ChatMsg = { ...m, id: `m${seq++}`, time: fmtTime(t) };
    if (m.kind === 'text' && r() < 0.3) {
      const n = 1 + Math.floor(r() * 2);
      withMeta.reactions = pickN(r, reactionEmojis, n).map((emoji) => ({
        emoji,
        count: 1 + Math.floor(r() * 8),
      }));
    }
    return withMeta;
  });

  return out;
}

/* ---------------- demo seed ---------------- */

export function demoCast(): Dog[] {
  return [
    { id: 'demo-luca', name: 'Luca', role: 'protagonista', photo: '/demo-dog-luca.png' },
    { id: 'demo-frida', name: 'Frida', role: 'ex', photo: '/demo-dog-frida.png' },
    { id: 'demo-pancho', name: 'Pancho', role: 'mejor-amigo', photo: '/demo-dog-pancho.png' },
    { id: 'demo-reina', name: 'Reina', role: 'pareja', photo: '/demo-dog-reina.png' },
  ];
}

export function newDog(role: Role = 'chismoso'): Dog {
  return { id: `dog-${Math.random().toString(36).slice(2, 9)}`, name: '', role };
}

export const NAME_COLORS_LIGHT = ['#35CD96', '#1F7AEC', '#D42A66', '#B850DD', '#C88F00', '#00A0F2', '#DF5014'];
export const NAME_COLORS_DARK = ['#53F0B0', '#53A9FF', '#FF5C97', '#D77BFF', '#E0A922', '#34C0FF', '#FF7A3D'];

export function senderColor(dogs: Dog[], senderId: string | undefined, dark: boolean): string {
  const palette = dark ? NAME_COLORS_DARK : NAME_COLORS_LIGHT;
  const idx = dogs.findIndex((d) => d.id === senderId);
  return palette[(idx < 0 ? 0 : idx) % palette.length];
}

export async function downscaleImage(file: File, maxSize = 256): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
  return await new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
