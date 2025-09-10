export type LocalizedString = {
  en: string;
  vi: string;
};

export type ProductSpecification = {
  key: LocalizedString;
  value: LocalizedString;
};

export type SizeOption = {
  _id: string;
  EU: number;
  US: number;
};

export interface Product {
  _id: string; // MongoDB ObjectId as string
  name: LocalizedString;
  image: string;
  images: string[];
  shortDescription?: LocalizedString;
  detailDescription: LocalizedString;
  specifications: ProductSpecification[];
  weight: number; // in kilograms (kg)
  variations: ProductVariation[];
  inStock: boolean;
  createdAt: string; // MongoDB timestamps as strings
  updatedAt: string;
}

export interface ProductVariationSizeOption {
  size: {
    EU: number;
    US: number;
  };
  price: number;
  stock: number;
}

export interface ProductVariation {
  color: LocalizedString;
  image: string;
  sizeOptions: ProductVariationSizeOption[];
}

// Utility functions for working with localized strings
export const getLocalizedString = (
  localizedString: LocalizedString, 
  currentLanguage: string = 'en'
): string => {
  return localizedString[currentLanguage as keyof LocalizedString] || localizedString.en;
};

// Helper function to create a localized string
export const createLocalizedString = (en: string, vi: string): LocalizedString => ({
  en,
  vi,
});
