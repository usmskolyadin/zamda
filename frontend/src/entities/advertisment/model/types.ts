export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  category: Category;
}

export interface Advertisement {
  id: number;
  title: string;
  description: string;
  price: string;
  created_at: string;
  is_active: boolean;
  location: string;
  images: { id: number; image: string }[];
  owner: {
    username: string;
    first_name: string;
    last_name: string;
    profile: {
      avatar: string | null;
      city: string;
    } | null;
  };
  subcategory: SubCategory;
  owner_profile_id: number;
}

export interface Review {
  id: number;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface UserProfile {
  avatar: string | null;
  city: string;
  reviews: Review[];
}