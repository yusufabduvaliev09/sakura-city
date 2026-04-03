export const DEFAULT_MENU_CATEGORIES = [
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
] as const;

export type DefaultMenuCategory = (typeof DEFAULT_MENU_CATEGORIES)[number];

export function isDefaultMenuCategory(
  name: string | null,
): name is DefaultMenuCategory {
  return Boolean(
    name && (DEFAULT_MENU_CATEGORIES as readonly string[]).includes(name),
  );
}

/** Первая категория из фиксированного порядка, в которой есть блюда. */
export function firstDefaultCategoryWithItems(
  items: { category: string | null }[],
): DefaultMenuCategory {
  for (const cat of DEFAULT_MENU_CATEGORIES) {
    if (items.some((i) => i.category === cat)) {
      return cat;
    }
  }
  return DEFAULT_MENU_CATEGORIES[0];
}
