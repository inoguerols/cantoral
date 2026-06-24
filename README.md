# Cantoral

Cancionero parroquial con acordes: una PWA para buscar, transportar y cantar canciones litúrgicas. Con afinador de micrófono integrado, valoraciones de usuarios, correcciones colaborativas y alternativas de cifrado.

## Características

- **Biblioteca buscable**: navega por temas, busca por título/autor.
- **Transposición**: transporta cualquier canción a tu tono (Do, Re, Mi, etc. o C, D, E, etc.).
- **Afinador con micrófono**: detecta tu nota actual y te guía al tono correcto usando el detector de pitch.
- **Valoraciones**: marca tus canciones favoritas con estrellas (1–5).
- **Alternativas colaborativas**: propón versiones alternativas de cifrado para review admin.
- **Correcciones**: sugiere cambios; los admins los resuelven.
- **Formato ChordPro**: soporta cifrado español (Do Re Mi Fa Sol La Si) y anglosajón (C D E F G A B).
- **PWA instalable**: agrega a inicio y úsala sin conexión (con límites).

## Stack

- **Frontend**: Next.js 16 (App Router, TypeScript), React 19.
- **Estilos**: Tailwind CSS v4, mobile-first.
- **Backend**: Supabase (PostgreSQL + Auth + Storage).
- **Seguridad**: RLS (Row Level Security) en todas las tablas.
- **Detección de pitch**: `pitchy` (análisis FFT).
- **Parser de acordes**: `chordsheetjs`.

## Puesta en marcha

### 1. Crear proyecto Supabase

Ve a [supabase.com](https://supabase.com), crea una cuenta gratuita y un nuevo proyecto. Guarda:
- **URL del proyecto** (https://TU-PROYECTO.supabase.co)
- **Anon Key** (pública, va en NEXT_PUBLIC_SUPABASE_ANON_KEY)
- **Service Role Key** (secreta, NO se sube al repo)

### 2. Ejecutar migraciones SQL

En el SQL Editor de Supabase, ejecuta **en orden**:
1. `supabase/migrations/0001_init.sql` — tablas (`profiles`, `songs`, `ratings`, `corrections`), políticas RLS y bucket de Storage público (`songs-pdfs`).
2. `supabase/migrations/0002_access.sql` — columna `songs.access` (`public` | `members`) y RLS que solo muestra sin sesión las canciones públicas.

**Importar el cancionero (opcional):** si tienes un fichero de import en `data/songs_import.sql` (carpeta `data/` ignorada por git, por contener letras con copyright), ejecútalo después. Lee antes [`docs/derechos-y-licencias.md`](docs/derechos-y-licencias.md): casi todo el repertorio moderno tiene copyright y debe quedar como `members` (solo usuarios registrados) hasta tener licencia.

### 3. Configurar variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Rellena con tus valores de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

**Importante:**
- Las variables con prefijo `NEXT_PUBLIC_` van al navegador; son públicas por diseño.
- La **anon key es pública**; la seguridad real la imponen las **RLS policies**, no el secreto de la clave.
- `SUPABASE_SERVICE_ROLE_KEY` es **secreta**. Defínela solo en `.env.local` y en tu hosting (p.ej. Vercel). **Nunca la subas al repo**.
- `.env.local` está en `.gitignore`.

### 4. Instalar dependencias y ejecutar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). ¡Listo!

## Hacerte admin

Una vez registrado, ejecuta en el SQL Editor de Supabase:

```sql
update public.profiles set role='admin' where email='tu@correo';
```

Como admin:
- Ves todas las canciones (publicadas y pendientes).
- Puedes crear/editar/eliminar canciones.
- Resuelves correcciones y apruebas alternativas de usuarios.

## Formato de canciones (ChordPro)

Las canciones se almacenan en formato **ChordPro**. Ejemplos:

### Cifrado español (Do Re Mi):

```
{title: Noche de paz}
{key: Do}

[Do]Noche de paz, noche de [Fa]amor,
[Do]Todo duerme en rededor.
[Sol]Belén nos [Do]vela su [Fa]fulgor,
[Do]Llena de [Sol]dicha[Do] la noche de paz.
```

### Cifrado anglosajón (C D E):

```
{title: Peace in the Night}
{key: C}

[C]Night of peace, night of [F]love,
[C]All the world sleeps around.
```

**Chords soportados**: Do Do# Re Re# Mi Fa Fa# Sol Sol# La La# Si (español) y C C# D D# E F F# G G# A A# B (anglosajón). Los transportes funcionan en ambos.

Metadatos útiles:
- `{title: Nombre}`: título.
- `{key: Do}` o `{key: C}`: tonalidad original.
- Líneas vacías separan estrofas y coros.

Más info: [chordsheetjs docs](https://chordsheetjs.org/).

## Despliegue en Vercel

### Conectar repo

1. Sube tu código a GitHub.
2. Ve a [vercel.com](https://vercel.com), conecta tu repo.
3. Vercel auto-detectará Next.js.

### Variables de entorno

En los settings del proyecto en Vercel, añade:

- `NEXT_PUBLIC_SUPABASE_URL`: tu URL Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: la anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: la service role key (secreta).

Vercel las cifrará y servirá de forma segura.

### Desplegar

```bash
git push
```

Vercel construye y despliega automáticamente. Tu app estará en `https://TU-APP.vercel.app`.

## Seguridad

### En desarrollo

- **`.env.local`**: contiene las claves secretas. Está en `.gitignore`; nunca se sube.
- **`.env.example`**: solo los nombres de las variables (sin valores). Sirve de referencia.

### En producción

- Las variables se definen en Vercel (o tu hosting).
- No hardcodees claves en el código.
- La Service Role Key **debe estar cifrada** y accesible solo en server actions / server components.
- Confía en las RLS policies de Supabase para permisos de lectura/escritura.

## Tests

Ejecuta los tests con Vitest:

```bash
npm test           # run una vez
npm run test:watch # modo watch
```

Los tests están en `src/**/*.test.ts`. Escribe tests para:
- Parser de ChordPro y transposición.
- Detectores de pitch.
- Lógica de auth y permisos (RLS en la BD, pero tests en el cliente si procede).

## Contribuir

1. Fork el repo.
2. Crea una rama (`git checkout -b feat/mi-feature`).
3. Escribe tests.
4. Haz commit y push.
5. Abre un PR con descripción clara.

## Licencia

MIT. Ver `LICENSE`.

---

**Cantoral**: hecho para que la comunidad parroquial cante mejor, juntos.
