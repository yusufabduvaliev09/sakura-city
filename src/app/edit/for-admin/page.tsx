"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { MenuItem } from "@/lib/models";

const CATEGORY_OPTIONS = [
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

type FormState = {
  name: string;
  description: string;
  price: string;
  category: string;
};

export default function HiddenAdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    price: "",
    category: CATEGORY_OPTIONS[0],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      setIsAuthed(Boolean(data.session));
      setIsAuthLoading(false);
    }
    checkSession();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(Boolean(session));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  function getErrorMessage(error: unknown): string {
    if (error && typeof error === "object") {
      const maybe = error as { message?: string; error_description?: string };
      if (maybe.message) return maybe.message;
      if (maybe.error_description) return maybe.error_description;
      try {
        return JSON.stringify(error);
      } catch {
        return "Неизвестная ошибка";
      }
    }
    return String(error ?? "Неизвестная ошибка");
  }

  const loadItems = useCallback(async () => {
    setIsLoadingItems(true);
    setAdminError(null);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      const message = `Ошибка чтения menu_items: ${getErrorMessage(error)}`;
      setAdminError(message);
      console.error(message, error);
    } else {
      setItems((data as MenuItem[]) ?? []);
    }
    setIsLoadingItems(false);
  }, []);

  useEffect(() => {
    if (!isAuthed) return;
    loadItems();
  }, [isAuthed, loadItems]);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(`Ошибка входа: ${getErrorMessage(error)}`);
      return;
    }
    setEmail("");
    setPassword("");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function uploadImage(file: File): Promise<{ image_url: string; image_path: string }> {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const path = `menu/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(path, file, { upsert: false });
    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from("menu-images").getPublicUrl(path);
    return { image_url: data.publicUrl, image_path: path };
  }

  async function handleAddItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setAdminError(null);
    try {
      let imageData: { image_url: string; image_path: string } | null = null;
      if (imageFile) {
        imageData = await uploadImage(imageFile);
      }

      const { error } = await supabase.from("menu_items").insert({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        image_url: imageData?.image_url ?? null,
        image_path: imageData?.image_path ?? null,
      });

      if (error) {
        throw error;
      }

      setForm({
        name: "",
        description: "",
        price: "",
        category: CATEGORY_OPTIONS[0],
      });
      setImageFile(null);
      await loadItems();
    } catch (error) {
      const message = `Ошибка добавления: ${getErrorMessage(error)}`;
      setAdminError(message);
      console.error(message, error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteItem(item: MenuItem) {
    setIsDeletingId(item.id);
    setAdminError(null);
    try {
      if (item.image_path) {
        const { error: removeStorageError } = await supabase.storage
          .from("menu-images")
          .remove([item.image_path]);
        if (removeStorageError) {
          throw removeStorageError;
        }
      }
      const { error } = await supabase.from("menu_items").delete().eq("id", item.id);
      if (error) {
        throw error;
      }
      await loadItems();
    } catch (error) {
      const message = `Ошибка удаления: ${getErrorMessage(error)}`;
      setAdminError(message);
      console.error(message, error);
    } finally {
      setIsDeletingId(null);
    }
  }

  const pageTitle = useMemo(
    () => (isAuthed ? "Скрытая админка меню" : "Вход в скрытую админку"),
    [isAuthed],
  );

  if (isAuthLoading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-black text-zinc-300">
        Загрузка...
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-black px-4 text-white">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
        >
          <h1 className="text-xl font-bold">{pageTitle}</h1>
          <p className="mt-1 text-sm text-zinc-400">Адрес: /edit/for-admin</p>

          <div className="mt-4 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {authError ? <p className="mt-3 text-sm text-rose-400">{authError}</p> : null}

          <button className="mt-4 w-full rounded-xl bg-rose-500 px-4 py-2 font-semibold hover:bg-rose-400">
            Войти
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] bg-black px-4 py-5 text-white">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div>
            <h1 className="text-xl font-bold">{pageTitle}</h1>
            <p className="text-sm text-zinc-400">Управление через Supabase</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-800"
          >
            Выйти
          </button>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-3 text-lg font-semibold">Добавить блюдо</h2>
          {adminError ? (
            <p className="mb-3 rounded-lg border border-rose-700 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
              {adminError}
            </p>
          ) : null}
          <form onSubmit={handleAddItem} className="grid gap-3 md:grid-cols-2">
            <input
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Название"
              className="rounded-xl border border-zinc-700 bg-black px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
            />
            <input
              required
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              placeholder="Цена"
              className="rounded-xl border border-zinc-700 bg-black px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
            />
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Описание"
              className="md:col-span-2 rounded-xl border border-zinc-700 bg-black px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
            />
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="rounded-xl border border-zinc-700 bg-black px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-zinc-200"
            />

            <button
              type="submit"
              disabled={isSaving}
              className="md:col-span-2 rounded-xl bg-rose-500 px-4 py-2 font-semibold hover:bg-rose-400 disabled:opacity-70"
            >
              {isSaving ? "Сохраняем..." : "Добавить блюдо"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-3 text-lg font-semibold">Список блюд</h2>
          {isLoadingItems ? <p className="text-zinc-400">Загрузка...</p> : null}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-black p-3"
              >
                <div className="flex items-center gap-3">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-zinc-800" />
                  )}
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-zinc-400">
                      {item.category} | {item.price} сом
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isDeletingId === item.id}
                  onClick={() => handleDeleteItem(item)}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm disabled:opacity-60"
                >
                  {isDeletingId === item.id ? "Удаляем..." : "Удалить"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

