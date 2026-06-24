import Link from "next/link";
import type { Song } from "@/lib/types";

interface Props {
  song: Song;
}

export default function SongCard({ song }: Props) {
  return (
    <article className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <Link href={`/song/${song.id}`} className="group">
        <h2 className="text-lg font-semibold leading-tight text-foreground group-hover:underline">
          {song.title}
        </h2>
        {song.author && (
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {song.author}
          </p>
        )}
      </Link>

      {song.themes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {song.themes.map((theme) => (
            <Link
              key={theme}
              href={`/?theme=${encodeURIComponent(theme)}`}
              className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
              style={{
                background: "color-mix(in srgb, var(--brand) 12%, transparent)",
                color: "var(--brand)",
              }}
            >
              {theme}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
