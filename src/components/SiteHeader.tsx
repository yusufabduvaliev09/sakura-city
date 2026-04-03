"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { DEFAULT_MENU_CATEGORIES } from "@/lib/menu-categories";

export default function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHome = pathname === "/";

  const activeCategory =
    isHome && searchParams.get("category")
      ? decodeURIComponent(searchParams.get("category")!)
      : isHome
        ? DEFAULT_MENU_CATEGORIES[0]
        : null;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-black/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-6 md:py-2">
        <div className="flex h-16 shrink-0 items-center md:h-20">
          <Link
            href="/"
            className="relative block h-14 w-44 shrink-0 transition-opacity hover:opacity-90 md:h-16 md:w-52"
          >
            <Image
              src="/logo.jpeg"
              alt="Sakura City"
              fill
              sizes="(max-width: 768px) 176px, 208px"
              className="object-contain object-left"
              priority
            />
          </Link>
        </div>

        {isHome ? (
          <div className="min-w-0 flex-1">
            <nav
              className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                      "shrink-0 rounded-full border px-3 py-2 text-sm transition md:px-4",
                      isActive
                        ? "border-rose-500 bg-rose-500 text-white"
                        : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-rose-500/50 hover:text-rose-100",
                    ].join(" ")}
                  >
                    {category}
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
