import { API_URL } from '../config/constants';

export interface ExtrasProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  status: string;
}

export const extrasService = {
  async getProducts(): Promise<ExtrasProduct[]> {
    try {
      const response = await fetch(`${API_URL}/db/api/extras/products`);
      if (!response.ok) {
        throw new Error('Error al obtener productos extras');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}; 