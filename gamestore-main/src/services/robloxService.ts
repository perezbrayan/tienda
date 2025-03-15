import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export interface RobloxProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  amount: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  type?: string;
}

export const robloxService = {
  async getProducts(): Promise<RobloxProduct[]> {
    try {
      console.log('Fetching Roblox products from:', `${API_URL}/db/api/roblox/products`);
      const response = await axios.get<RobloxProduct[]>(`${API_URL}/db/api/roblox/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Procesar las URLs de las imágenes
      const productsWithFullUrls = response.data.map(product => ({
        ...product,
        image_url: product.image_url ? `${API_URL}${product.image_url}` : null
      }));
      
      console.log('Roblox products with processed URLs:', productsWithFullUrls);
      return productsWithFullUrls;
    } catch (error) {
      console.error('Error fetching Roblox products:', error);
      throw error;
    }
  },

  async createProduct(formData: FormData): Promise<void> {
    try {
      await axios.post(`${API_URL}/db/api/roblox/products`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error('Error creating Roblox product:', error);
      throw error;
    }
  },

  async updateProduct(id: number, formData: FormData): Promise<void> {
    try {
      await axios.put(`${API_URL}/db/api/roblox/products/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error('Error updating Roblox product:', error);
      throw error;
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/db/api/roblox/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error deleting Roblox product:', error);
      throw error;
    }
  }
}; 