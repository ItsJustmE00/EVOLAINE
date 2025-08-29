import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine plusieurs noms de classe en une seule chaîne, en gérant les conflits avec Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate un prix avec le symbole de la devise
 */
export function formatPrice(price: number, currency: string = 'MAD') {
  // Forcer la devise en MAD pour tout le site
  currency = 'MAD';
  
  try {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  } catch (error) {
    console.error('Erreur de formatage du prix:', error);
    return `${price.toFixed(2)} ${currency}`;
  }
}

/**
 * Génère un identifiant unique
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Retourne les premières lettres de chaque mot
 */
export function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

/**
 * Met en majuscule la première lettre d'une chaîne
 */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Tronque une chaîne à une certaine longueur
 */
export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

/**
 * Vérifie si la vue est sur mobile
 */
export const isMobile = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768;
  }
  return false;
};

/**
 * Retourne la valeur d'un paramètre d'URL
 */
export function getUrlParam(param: string): string | null {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  return null;
}

/**
 * Fait défiler la page vers un élément avec un décalage
 */
export function scrollToElement(elementId: string, offset: number = 0) {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
}

/**
 * Vérifie si un élément est visible dans la fenêtre
 */
export function isElementInViewport(el: HTMLElement) {
  if (typeof window !== 'undefined') {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  return false;
}
