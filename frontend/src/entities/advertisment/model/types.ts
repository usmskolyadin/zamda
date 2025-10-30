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
  slug: string;
  subcategory_slug: string;
  description: string;
  price: string;
  created_at: string;
  is_active: boolean;
  category_slug: string
  location: string;
  images: { id: number; image: string }[];
  owner: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
      avatar: string;
      rating: number;
      reviews_count: number;
      city: string;
    } | null;
  };
  subcategory: SubCategory;
  owner_profile_id: number;
  views_count: number;
  likes_count: number; 
  is_liked: boolean;
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