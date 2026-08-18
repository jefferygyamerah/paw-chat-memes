# 🐾 Paw Chat Memes

**El grupo de WhatsApp de tus perros existe… y arde en drama.** 🔥

Generador de memes de chats grupales falsos estilo WhatsApp, protagonizados por tus perros. Sube sus fotos, asígnales personalidad, elige el chisme y descarga el meme en PNG de alta resolución.

Todo ocurre **100% en el navegador** — las fotos nunca salen de tu dispositivo. Sin backend, sin IA, sin cuentas.

## ✨ Qué hace

- 🐶 **Elenco Perruno** — de 2 a 6 perros con foto, nombre y rol: *El Protagonista*, *El Chismoso*, *La Ex Dramática*, *El Mejor Amigo*, *La Pareja Nueva*, *El Indiferente*.
- 🏠 **Ajustes del Grupo** — nombre del grupo, ícono propio y modo claro ☀️ / oscuro 🌙 de WhatsApp.
- 🌶️ **El Chisme** — 4 escenarios (*Nueva pareja revelada* 💥, *Secreto revelado* 🤫, *Chisme libre* 💅, *El favorito* 🏆) + texto libre + **foto comprometedora** que alguien filtra al grupo.
- 📱 **Vista previa en vivo** — mock pixel-fiel de WhatsApp: burbujas con cola, nombres de colores, nota de voz de 0:07 de la ex dramática, reacciones con conteo, *"X abandonó el grupo"*, palomitas azules e indicador de *escribiendo…*.
- 🔁 **Regenerar** — el motor de plantillas (RNG con semilla) produce otra variante del mismo chisme.
- ⬇️ **Exportar PNG** — alta resolución (2×) vía `html-to-image`; si el chat es muy largo lo divide en 2 partes. También copia al portapapeles.
- ✨ **Cargar demo** — elenco de ejemplo (Luca, Frida, Pancho y Reina en "La Casita De Luca") para ver la magia al instante.

## 🚀 Quickstart

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # producción en dist/
```

## 🖼️ Assets demo (importante)

Las imágenes binarias de `public/` (los 4 perros demo, la foto de evidencia, el ícono del grupo, el empty-state y el fondo de huellas) **no están en este repo** — súbelas tú:

| Archivo esperado en `public/` | Uso |
|---|---|
| `demo-dog-luca.png` | Avatar demo "Luca" (protagonista) |
| `demo-dog-frida.png` | Avatar demo "Frida" (ex dramática) |
| `demo-dog-pancho.png` | Avatar demo "Pancho" (mejor amigo) |
| `demo-dog-reina.png` | Avatar demo "Reina" (pareja nueva) |
| `demo-evidence.png` | Foto comprometedora del demo |
| `group-icon-default.png` | Ícono de grupo por defecto |
| `empty-cast.png` | Estado vacío del preview |
| `hero-bg-paws.png` | Fondo de huellitas del hero |

Usa fotos cuadradas (~512×512) para avatares y 1024×768 para la evidencia. Sin ellas la app funciona igual — el demo simplemente mostrará iniciales en vez de fotos.

## 🛠️ Stack

React 19 · TypeScript · Vite 7 · Tailwind CSS v3.4 · shadcn/ui · Framer Motion · GSAP · html-to-image · lucide-react

## 🧠 El motor del chisme

`src/lib/engine.ts` — motor determinista de diálogo por plantillas: bancos de frases por rol y escenario, RNG con semilla (mulberry32), timestamps realistas, píldoras de reacción aleatorias, arco dramático completo (hook → evidencia → ex sufriendo → defensa del mejor amigo → el dueño irrumpe → cliffhanger).

---

Hecho con 🐾 y mucho chisme. No afiliado a WhatsApp Inc.