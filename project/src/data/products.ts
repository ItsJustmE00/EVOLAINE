// Définition de l'interface Product localement pour éviter les problèmes d'import
interface Product {
  id: number;
  name: string;
  description: string;
  detailedDescription: string;
  price: string;
  rating: number;
  image: string;
  detailImage: string;
  category: string;
  benefits: string[];
  howToUse: string;
  ingredients: string;
  length?: string;
  quantity?: number;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Pack Complet EVOLAINE",
    description: "Notre collection intégrale pour un rituel de soin quotidien complet et rafraîchissant",
    detailedDescription: "Le Pack Complet EVOLAINE est la solution idéale pour une routine de soin quotidienne complète. Il rassemble l'ensemble de nos produits essentiels pour une expérience de soin intégrée et rafraîchissante.",
    price: "249",
    rating: 5.0,
    image: "/pack complet.png",
    detailImage: "/pack detail.png",
    category: "Pack",
    benefits: [
      "Soin complet en un seul achat",
      "Économisez sur l'achat des produits séparément",
      "Idéal pour une routine complète",
      "Emballage élégant et pratique"
    ],
    howToUse: "Utilisez chaque produit selon les instructions individuelles fournies dans l'emballage.",
    ingredients: "Ingrédients naturels sélectionnés avec soin pour une efficacité maximale."
  },
  {
    id: 2,
    name: "Crème éclaircissante intime",
    description: "Hydratation profonde à l'huile de graines de riz et extraits végétaux",
    detailedDescription: "La crème éclaircissante intime EVOLAINE est conçue avec des ingrédients naturels soigneusement sélectionnés pour une hydratation intense et un éclat immédiat. Sa texture légère s'absorbe rapidement sans laisser de sensation de gras.",
    price: "149",
    rating: 4.9,
    image: "/creme .png",
    detailImage: "/creme eclairssisante.png",
    category: "Soin",
    length: "100ml",
    benefits: [
      "Hydratation intense 24h",
      "Unifie le teint",
      "Texture légère et non grasse",
      "Convient à tous les types de peau"
    ],
    howToUse: "Appliquer sur une peau propre et sèche, matin et soir. Masser délicatement jusqu'à absorption complète.",
    ingredients: "Eau, huile de graines de riz, glycérine, beurre de karité, extrait de réglisse, vitamine E, huile essentielle de lavande."
  },
  {
    id: 3,
    name: "Gel Intime au Citron",
    description: "Formule naturelle au citron pour une fraîcheur longue durée",
    length: "200ml",
    detailedDescription: "Le gel intime rafraîchissant au citron EVOLAINE se distingue par sa formule naturelle qui procure une sensation de fraîcheur immédiate tout au long de la journée. Spécialement conçu pour nettoyer et hydrater en douceur tout en préservant l'équilibre naturel de la peau.",
    price: "179",
    rating: 4.8,
    image: "/image gel intime (1).png",
    detailImage: "/gel intime citron.png",
    category: "Hygiène",
    benefits: [
      "Fraîcheur immédiate et durable",
      "PH adapté",
      "Sans alcool ni parabènes",
      "Testé dermatologiquement"
    ],
    howToUse: "Appliquer sous la douche sur peau humide. Rincer abondamment à l'eau claire.",
    ingredients: "Aloe vera, extrait de citron, huile de coco, glycérine végétale, huile essentielle d'arbre à thé, vitamine E."
  },
  {
    id: 4,
    name: "Sérum éclaircissant intime",
    description: "Sérum éclaircissant pour un teint unifié",
    length: "50ml",
    detailedDescription: "Le sérum éclaircissant EVOLAINE associe la puissance des acides de fruits doux aux bienfaits de la réglisse pour une action éclaircissante naturelle et un teint unifié. Sa formule légère à absorption rapide est spécialement adaptée aux peaux sensibles.",
    price: "139",
    rating: 4.9,
    image: "/serum.png",
    detailImage: "/serumdetail.png",
    category: "Soin",
    benefits: [
      "Action éclaircissante visible",
      "Texture légère et pénétrante",
      "Riche en antioxydants",
      "Sans hydroquinone"
    ],
    howToUse: "Appliquer quelques gouttes sur les zones concernées, matin et soir, sur une peau propre et sèche.",
    ingredients: "Eau, acide kojique, extrait de réglisse, acide glycolique, niacinamide, acide hyaluronique, vitamine C, huile de pépins de raisin."
  }
];
