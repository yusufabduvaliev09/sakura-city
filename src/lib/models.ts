export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  image_path: string | null;
  created_at?: string;
};

