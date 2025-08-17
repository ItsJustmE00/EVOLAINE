import React, { createContext, useContext, useState, useMemo } from 'react';

// Définition de l'interface Product avec des types plus stricts
type Product = {
  id: number;
  name: string;
  description: string;
  detailedDescription: string;
  price: string;
  rating: number;
  image: string;
  category: string;
  benefits: string[];
  howToUse: string;
  ingredients: string;
  length?: string;
  quantity?: number;
};

// Type pour le contexte
type ProductSelectionContextType = {
  selectedProductId: number | null;
  selectedProduct: Product | null;
  selectProduct: (productId: number) => void;
  clearSelection: () => void;
};

// Création du contexte avec une valeur par défaut explicite
const defaultContextValue: ProductSelectionContextType = {
  selectedProductId: null,
  selectedProduct: null,
  selectProduct: () => {},
  clearSelection: () => {}
};

const ProductSelectionContext = createContext<ProductSelectionContextType>(defaultContextValue);

// Données de produits factices pour l'exemple
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Produit 1",
    description: "Description du produit 1",
    detailedDescription: "Description détaillée du produit 1",
    price: "99.99",
    rating: 4.5,
    image: "",
    category: "cat1",
    benefits: ["Bénéfice 1", "Bénéfice 2"],
    howToUse: "Mode d'emploi",
    ingredients: "Liste des ingrédients"
  },
  // Ajoutez d'autres produits si nécessaire
];

export const ProductSelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  const selectedProduct = useMemo(() => {
    return mockProducts.find((p: Product) => p.id === selectedProductId) || null;
  }, [selectedProductId]);

  const selectProduct = (productId: number) => {
    setSelectedProductId(productId);
  };

  const clearSelection = () => {
    setSelectedProductId(null);
  };

  const value: ProductSelectionContextType = {
    selectedProductId,
    selectedProduct,
    selectProduct,
    clearSelection
  };

  return (
    <ProductSelectionContext.Provider value={value}>
      {children}
    </ProductSelectionContext.Provider>
  );
};

export const useProductSelection = () => {
  const context = useContext(ProductSelectionContext);
  if (context === undefined) {
    throw new Error('useProductSelection must be used within a ProductSelectionProvider');
  }
  return context;
};
