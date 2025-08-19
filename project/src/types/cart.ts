export interface SimpleCartItem {
  id: string | number;
  name: string;
  price: number | string;
  quantity: number;
  image: string;
  category?: string;
}
