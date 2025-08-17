export interface Product {
  id: number;
  name: string;
  description: string;
  detailedDescription: string;
  price: string;
  rating: number;
  image: string;
  detailImage: string; // Champ obligatoire pour l'image détaillée
  category: string;
  benefits: string[];
  howToUse: string;
  ingredients: string;
  length?: string;
  quantity?: number;
}
