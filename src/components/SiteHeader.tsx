"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  DEFAULT_MENU_CATEGORIES,
  isDefaultMenuCategory,
} from "@/lib/menu-categories";

const WHATSAPP_HREF = "https://wa.me/996555039030";

export default function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHome = pathname === "/";

  const param = searchParams.get("category");
  const activeCategory =
    isHome && param && isDefaultMenuCategory(param) ? param : null;

  return (
    <header className="relative z-10 border-b border-zinc-800/90 bg-black">
      {/* Верхняя строка: контакты по краям */}
      <div className="border-b border-zinc-800/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-3">
          <div className="flex min-w-0 flex-1 items-start gap-2 text-left text-xs text-zinc-300 sm:text-sm md:justify-start">
            <span
              className="mt-0.5 shrink-0 text-rose-500"
              aria-hidden
            >
              <LocationPinIcon className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" />
            </span>
            <span className="leading-snug">
              Курманжан датка 605
            </span>
          </div>

          <div className="flex shrink-0 justify-end sm:justify-end">
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5 text-sm text-white transition hover:border-rose-500/50 hover:bg-zinc-800 hover:text-rose-50"
            >
              <span className="text-[#25D366]" aria-hidden>
                <WhatsAppGlyph className="h-5 w-5" />
              </span>
              <span className="font-medium tabular-nums tracking-tight">
                0555039030
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Центральный логотип (вектор 600×200, масштаб по высоте) */}
      <div className="mx-auto flex max-w-7xl justify-center px-4 py-4 md:py-5">
        <Link
          href="/"
          className="block h-20 w-auto max-w-full shrink-0 transition-opacity hover:opacity-90 md:h-24"
        >
          <Image
            src="/sakura-city-logo.svg"
            alt="Sakura City"
            width={600}
            height={200}
            className="h-20 w-auto max-w-full object-contain object-center md:h-24"
            priority
          />
        </Link>
      </div>

      {/* Категории — только главная, по центру в контейнере */}
      {isHome ? (
        <div className="mx-auto max-w-7xl px-4 pb-5">
          <nav
            className="flex justify-start gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] md:justify-center [&::-webkit-scrollbar]:hidden"
            aria-label="Категории меню"
          >
            {DEFAULT_MENU_CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <Link
                  key={category}
                  href={`/?category=${encodeURIComponent(category)}`}
                  scroll={false}
                  className={[
                    "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition md:px-4",
                    isActive
                      ? "border-rose-500 bg-rose-500 text-white shadow-sm shadow-rose-900/30"
                      : "border-zinc-700 bg-zinc-900/90 text-zinc-200 hover:border-rose-500/45 hover:text-white",
                  ].join(" ")}
                >
                  {category}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function LocationPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
