"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { DEFAULT_MENU_CATEGORIES } from "@/lib/menu-categories";
import type { MenuItem } from "@/lib/models";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      setItems((data as MenuItem[]) ?? []);
      setIsLoading(false);
    }

    fetchItems();
  }, []);

  const categories = useMemo(() => {
    const dynamic = Array.from(
      new Set(items.map((item) => item.category).filter(Boolean)),
    );

    if (dynamic.length === 0) return [...DEFAULT_MENU_CATEGORIES];
    return dynamic;
  }, [items]);

  const selectedCategory = useMemo(() => {
    if (categoryFromUrl && categories.includes(categoryFromUrl)) {
      return categoryFromUrl;
    }
    return categories[0] ?? DEFAULT_MENU_CATEGORIES[0];
  }, [categoryFromUrl, categories]);

  useEffect(() => {
    if (isLoading || categories.length === 0) return;
    if (!categoryFromUrl) {
      router.replace(
        `/?category=${encodeURIComponent(selectedCategory)}`,
        { scroll: false },
      );
    }
  }, [isLoading, categories, categoryFromUrl, router, selectedCategory]);

  const filteredItems = items.filter((item) => item.category === selectedCategory);

  return (
    <div className="bg-black text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        {isLoading ? (
          <p className="text-zinc-400">Загрузка меню...</p>
        ) : error ? (
          <p className="text-rose-400">{error}</p>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-lg font-semibold uppercase tracking-wide">
                {selectedCategory}
              </h1>
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
                    <h2 className="text-sm font-bold uppercase tracking-wide text-white md:text-base">
                      {item.name}
                    </h2>
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
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="bg-black px-4 py-6 text-zinc-400">Загрузка меню...</div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
