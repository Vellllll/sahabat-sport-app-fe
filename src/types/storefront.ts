export interface Category {
  id: string | number;
  name: string;
}

export interface ProductFromAPI {
  id: number;
  name: string;
  is_displayed: boolean;
  product_category?: {
    id: number;
    name: string;
  };
  lowest_price: number | null;
  lowest_pic_url: string | null;
}
