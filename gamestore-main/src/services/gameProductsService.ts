import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export interface GameProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  game_type: 'supercell' | 'streaming' | 'lol' | 'leagueoflegends';
  image_url: string | null;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export const gameProductsService = {
  async getProducts(gameType: string): Promise<GameProduct[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Convertir leagueoflegends a lol para la API
      const apiGameType = gameType === 'leagueoflegends' ? 'lol' : gameType;
      console.log('Fetching products with game type:', apiGameType);
      
      const response = await axios.get(`${API_URL}/db/api/admin/games/products/${apiGameType}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('API Response:', response.data);
    
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response format:', response.data);
        throw new Error('Formato de respuesta inválido');
      }

      return response.data.map((product: GameProduct) => ({
        ...product,
        game_type: product.game_type === 'lol' ? 'leagueoflegends' : product.game_type,
        image_url: product.image_url,
        profile_image_url: product.profile_image_url
      }));
    } catch (error: any) {
      console.error('Error al obtener productos:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        gameType
      });
      throw new Error(`Error al cargar los productos: ${error.response?.data?.message || error.message}`);
    }
  },

  async createProduct(formData: FormData): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      await axios.post(`${API_URL}/db/api/admin/games/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw new Error('Error al crear el producto');
    }
  },

  async updateProduct(id: number, formData: FormData): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      await axios.put(`${API_URL}/db/api/admin/games/products/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw new Error('Error al actualizar el producto');
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      await axios.delete(`${API_URL}/db/api/admin/games/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw new Error('Error al eliminar el producto');
    }
  }
}; 