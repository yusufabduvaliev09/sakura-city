"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { MenuItem } from "@/lib/models";

const DEFAULT_CATEGORIES = [
  "Салаты",
  "Супы",
  "Воки",
  "Горячие роллы",
  "Мини роллы",
  "Холодные роллы",
  "Запечённые",
  "Сеты",
  "Пиццы",
  "Закуски",
  "Моти",
  "Соусы",
  "Горячие напитки",
  "Напитки",
];

export default function Home() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(DEFAULT_CATEGORIES[0]);

  useEffect(() => {
    async function fetchItems() {
      setIsLoading(true);
      setError(null);
      if (!supabase) {
        setError("Настройка конфигурации...");
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError("Не удалось загрузить меню");
        setIsLoading(false);
        return;
      }

      const list = (data as MenuItem[]) ?? [];
      setItems(list);

      if (list.length > 0) {
        const firstCategory = list[0]?.category;
        if (firstCategory) setActiveCategory(firstCategory);
      }
      setIsLoading(false);
    }

    fetchItems();
  }, []);

  const categories = useMemo(() => {
    const dynamic = Array.from(
      new Set(items.map((item) => item.category).filter(Boolean)),
    );

    if (dynamic.length === 0) return DEFAULT_CATEGORIES;
    return dynamic;
  }, [items]);

  const selectedCategory = categories.includes(activeCategory)
    ? activeCategory
    : (categories[0] ?? DEFAULT_CATEGORIES[0]);

  const filteredItems = items.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-[100svh] bg-black text-white">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-black/95 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-4 py-4">
          <p className="text-xs tracking-[0.2em] text-zinc-400">SAKURA CITY</p>
          <h1 className="mt-1 text-2xl font-bold">Цифровое меню</h1>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => {
              const isActive = category === activeCategory;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={[
                    "shrink-0 rounded-full border px-4 py-2 text-sm transition",
                    isActive
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300",
                  ].join(" ")}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        {isLoading ? (
          <p className="text-zinc-400">Загрузка меню...</p>
        ) : error ? (
          <p className="text-rose-400">{error}</p>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold uppercase tracking-wide">{selectedCategory}</h2>
              <span className="text-sm text-zinc-400">{filteredItems.length} поз.</span>
            </div>

            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                >
                  <div className="aspect-square w-full overflow-hidden">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-zinc-800" />
                    )}
                  </div>

                  <div className="space-y-2 p-3">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-white md:text-base">
                      {item.name}
                    </h3>
                    <p className="line-clamp-2 text-sm text-gray-400">
                      {item.description}
                    </p>
                    <p className="text-lg font-bold text-rose-500">
                      {item.price} <span className="text-sm font-medium">сом</span>
                    </p>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

