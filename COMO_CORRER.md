# Cómo correr Vita

> Guía rápida para el jurado, evaluadores y nuevos colaboradores.
> Si seguís estos pasos en orden, en menos de 5 minutos tenés la app corriendo.

---

## Lo primero que tenés que saber

Vita vive en **una sola aplicación Next.js** que sirve TODO desde el mismo puerto:

- la landing pública
- la página de precios
- la PWA del productor (lo que antes era "app móvil")
- el panel admin
- la API REST

**Toda la app está dentro de la carpeta `web-admin/`**. Es la única que tenés que correr.

### IMPORTANTE: NO corras la carpeta `mobile/`

La carpeta `mobile/` contiene una **app Flutter vieja que quedó archivada** después del pivote del proyecto. Ya NO es la versión actual de Vita. Si corrés `flutter run` ahí vas a ver una pantalla parecida pero desactualizada que **no es la app real**.

La versión actual es **100% web** y se abre desde el navegador.

---

## Requisitos

| | Versión mínima | Cómo conseguirlo |
|---|---|---|
| Node.js | 20 o superior | https://nodejs.org |
| npm | viene con Node | — |
| Una API key de Gemini | gratis | https://aistudio.google.com/apikey |

No hace falta base de datos externa, ni Docker, ni cuentas en la nube. La BD es un archivo SQLite local que se genera solo (`vita.db`) la primera vez que arranca.

---

## Pasos para correrla (primera vez)

### 1. Clonar el repo

```bash
git clone https://github.com/santiagoarteaga0704/Vita.git
cd Vita/web-admin
```

### 2. Instalar dependencias

```bash
npm install
```

Esto baja todo lo que necesita Next.js, Tailwind, shadcn/ui, better-sqlite3, etc. Tarda 1 o 2 minutos.

### 3. Configurar las variables de entorno

Crear un archivo llamado `.env.local` **dentro de la carpeta `web-admin/`** con este contenido:

```bash
NEXT_PUBLIC_API_URL=/api
GEMINI_API_KEY=PEGA_AQUI_TU_API_KEY_DE_GOOGLE_AI_STUDIO
JWT_SECRET=cualquier-texto-largo-y-random-funciona
JWT_EXPIRES_IN=30d
```

Reemplazá `PEGA_AQUI_TU_API_KEY_DE_GOOGLE_AI_STUDIO` por la key real que sacaste de https://aistudio.google.com/apikey (es gratis, hasta 1.500 requests por día).

> Hay un `.env.example` en la misma carpeta que podés copiar como base.

### 4. Arrancar la app

```bash
npm run dev
```

Vas a ver algo como:

```
Ready in 1068ms
- Local:   http://localhost:3000
```

Listo, ya está corriendo.

---

## Las URLs que tenés que probar

Una vez arrancada, abrí estas en tu navegador:

| URL | Qué es |
|---|---|
| http://localhost:3000/ | Landing pública (la página de inicio) |
| http://localhost:3000/precios | Planes Free / Pro / Enterprise |
| http://localhost:3000/qr | QR para abrir la PWA desde tu celular |
| http://localhost:3000/app | **PWA del productor** (registro + escanear plagas) |
| http://localhost:3000/login | Panel admin |

### Credenciales demo del panel admin

```
Email:       admin@vita.bo
Contraseña:  admin1234
```

---

## Probar la PWA desde el celular

Esto es lo divertido y se ve mejor en mobile.

1. Tu PC y tu celular tienen que estar en la **misma red WiFi**.
2. En la PC abrí http://localhost:3000/qr — te muestra un QR.
3. Escaneá el QR con la cámara de tu celular.
4. Se te abre la PWA en el navegador del celular.
5. Si Windows pregunta por permiso del Firewall la primera vez, dale **Permitir acceso**.

Desde ahí podés registrarte como productor, sacar una foto de una planta (o subir una imagen) y ver el diagnóstico de IA en segundos.

---

## Problemas comunes

### El puerto 3000 está ocupado

Si ya tenés otra cosa corriendo en el 3000, Next.js te va a avisar. Cerrá el proceso viejo, o cambiá de puerto:

```bash
npm run dev -- -p 3001
```

### "GEMINI_API_KEY is not defined"

Te faltó crear el archivo `.env.local` o no le pusiste la API key. Volvé al paso 3.

### "Cannot find module 'better-sqlite3'"

No corriste `npm install`, o se cortó a la mitad. Volvé al paso 2.

### La pantalla que veo no se parece a "Vita"

Probablemente estás abriendo la carpeta `mobile/` (Flutter vieja). Asegurate de estar en `Vita/web-admin/` y de correr `npm run dev`, no `flutter run`.

---

## Estructura del repo (referencia rápida)

```
Vita/
├── web-admin/          ← CORRER ESTO (Next.js, todo vive acá)
│   ├── src/app/        ← rutas: /, /app, /login, /precios, /qr, etc.
│   ├── src/lib/        ← lógica de Gemini, SQLite, auth
│   ├── .env.example    ← copiar a .env.local
│   └── package.json
├── mobile/             ← NO correr (Flutter archivada post-pivote)
├── docs/               ← spec técnico, pricing, estrategia
├── demo-assets/        ← capturas y assets del video demo
└── README.md           ← descripción del proyecto
```

---

Cualquier duda, abrir un issue en https://github.com/santiagoarteaga0704/Vita o contactar al equipo.
