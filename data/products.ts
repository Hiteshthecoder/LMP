export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  deals: number;
  vendorName: string;
  vendorLevel: number;
  verified: boolean;
  location: string;
  details: string[];
  disputes?: number;
};

export type CategoryOption = {
  slug: string;
  title: string;
  image: string;
  description: string;
  productCount: number;
};
