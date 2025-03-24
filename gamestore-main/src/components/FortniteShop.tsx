import React, { useEffect, useState } from 'react';
import { getDailyShop } from '../services/fortniteApi';
import { Filter, ChevronDown, ChevronUp, Loader2, ShoppingCart, X, Gamepad, Sword, Trophy, AlertCircle, Package, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { robloxService, RobloxProduct } from '../services/robloxService';
import { gameProductsService, GameProduct } from '../services/gameProductsService';
import { extrasService, ExtrasProduct as ImportedExtrasProduct } from '../services/extrasService';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Objeto con los colores de rareza
const RARITY_COLORS = {
  common: '#B8B8B8',
  uncommon: '#5CCA00',
  rare: '#2CC3FC',
  epic: '#B83DBA',
  legendary: '#E95415',
  mythic: '#FBC531',
  marvel: '#C53030',
  dc: '#2B6CB0',
  icon: '#97266D',
  gaming: '#4C51BF',
  starwars: '#2D3748',
  default: '#8B5CF6'
};

interface ShopItem {
  mainId: string;
  offerId: string;
  displayName: string;
  displayDescription: string;
  price: {
    regularPrice: number;
    finalPrice: number;
    floorPrice: number;
  };
  rarity?: {
    id: string;
    name: string;
  };
  displayAssets: {
    full_background: string;
    background: string;
  }[];
  categories?: string[];
  granted?: Array<{
    id: string;
    type: {
      id: string;
      name: string;
    };
    gameplayTags?: string[];
    name: string;
    description: string;
    images?: {
      icon?: string;
      transparent?: string;
      featured?: string;
      background?: string;
      icon_background?: string;
      full_background?: string;
    };
  }>;
  mainType?: string;
  displayType?: string;
  section?: {
    name?: string;
    category?: string;
  };
}

interface CartItem {
  id?: number;
  title?: string;
  description?: string;
  price: {
    regularPrice: number;
    finalPrice: number;
    floorPrice: number;
  };
  image_url?: string;
  type?: string;
  mainId: string;
  offerId: string;
  displayName: string;
  displayDescription: string;
  displayAssets?: Array<{
    full_background: string;
    background: string;
  }>;
  rarity?: {
    id: string;
    name: string;
  };
  categories?: string[];
  granted?: any[];
  image?: string;
  quantity?: number;
}

interface RobloxDisplayProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  type: string;
  amount?: number;
  created_at?: string;
  updated_at?: string;
}

interface ExtendedGameProduct extends Omit<GameProduct, 'game_type'> {
  game_type: "supercell" | "streaming" | "lol" | "leagueoflegends";
  profile_image_url: string;
  created_at: string;
  updated_at: string;
}

interface LocalExtrasProduct extends ImportedExtrasProduct {
  type: string;
}

const FortniteShop: React.FC = () => {
  const { addItem, getItemQuantity, hasItems } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const t = translations[language];
  const [items, setItems] = useState<ShopItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<string>('');
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedItemForModal, setSelectedItemForModal] = useState<ShopItem | null>(null);

  // Estados para los filtros
  const [rarityFilters, setRarityFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  
  // Estados para los acordeones
  const [isRarityOpen, setIsRarityOpen] = useState(false);
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);

  // Modificar el estado inicial de selectedGame para leer desde URL
  const [selectedGame, setSelectedGame] = useState<'fortnite' | 'roblox' | 'supercell' | 'streaming' | 'leagueoflegends'>(
    (searchParams.get('game') as 'fortnite' | 'roblox' | 'supercell' | 'streaming' | 'leagueoflegends') || 'fortnite'
  );
  const [robloxProducts, setRobloxProducts] = useState<RobloxDisplayProduct[]>([]);
  const [loadingRoblox, setLoadingRoblox] = useState(false);
  const [robloxError, setRobloxError] = useState<string | null>(null);
  const [isStepsOpen, setIsStepsOpen] = useState(false);
  const [gameProducts, setGameProducts] = useState<GameProduct[]>([]);
  const [selectedGameType, setSelectedGameType] = useState<'fortnite' | 'roblox' | 'supercell' | 'streaming' | 'leagueoflegends' | 'extras'>(
    (searchParams.get('game') as 'fortnite' | 'roblox' | 'supercell' | 'streaming' | 'leagueoflegends' | 'extras') || 'fortnite'
  );

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSupercellPaymentModal, setShowSupercellPaymentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ExtendedGameProduct | LocalExtrasProduct | null>(null);
  const [robloxId, setRobloxId] = useState('');
  const [supercellId, setSupercellId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  const [showStreamingPaymentModal, setShowStreamingPaymentModal] = useState(false);
  const [leagueId, setLeagueId] = useState('');
  const [extrasProducts, setExtrasProducts] = useState<ImportedExtrasProduct[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [extrasError, setExtrasError] = useState<string | null>(null);
  const [showExtrasPaymentModal, setShowExtrasPaymentModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'GTQ' | 'USD' | 'COP'>('GTQ');

  useEffect(() => {
    // Si estamos regresando del checkout y tenemos keepCart en true, no hacemos nada
    const state = location.state as { keepCart?: boolean };
    if (state?.keepCart) {
      return;
    }
    
    // Cargar productos según el tipo de juego seleccionado
    if (selectedGameType === 'fortnite') {
      fetchItems();
    } else if (selectedGameType === 'roblox') {
      loadRobloxProducts();
    } else if (selectedGameType === 'extras') {
      loadExtrasProducts();
    } else {
      loadGameProducts(selectedGameType);
    }
  }, [location, selectedGameType]);

  useEffect(() => {
    setFilteredItems(applyAllFilters(items));
  }, [items, rarityFilters, priceRange]);

  useEffect(() => {
    if (selectedGame === 'roblox') {
      loadRobloxProducts();
    }
  }, [selectedGame]);

  // Modificar el efecto del evento gameSelected
  useEffect(() => {
    const handleGameSelected = (event: CustomEvent<string>) => {
      const game = event.detail as 'fortnite' | 'roblox' | 'supercell' | 'streaming' | 'leagueoflegends';
      setSelectedGame(game);
      setSelectedGameType(game);
      setSearchParams({ game });
    };

    window.addEventListener('gameSelected', handleGameSelected as EventListener);

    return () => {
      window.removeEventListener('gameSelected', handleGameSelected as EventListener);
    };
  }, [setSearchParams]);

  // Agregar efecto para sincronizar URL con estado
  useEffect(() => {
    const game = searchParams.get('game') as 'fortnite' | 'roblox' | 'supercell' | 'streaming' | 'leagueoflegends' | null;
    if (game && game !== selectedGameType) {
      setSelectedGameType(game);
      setSelectedGame(game as any);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleCurrencyChange = (event: CustomEvent<'GTQ' | 'USD' | 'COP'>) => {
      setSelectedCurrency(event.detail);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, []);

  const fetchItems = async () => {
    try {
      const data = await getDailyShop();
      // Filtrar los items que son tracks
      const filteredData = data.filter((item: ShopItem) => {
        // Verificar si es un track por su tipo
        const isTrack = item.mainType === 'sparks_song' || 
                       item.displayType === 'Música' ||
                       item.section?.name === 'Pistas de improvisación' ||
                       item.section?.category === 'Sube al escenario';

        // Verificar si alguno de los items concedidos es un track
        const hasTrackGrants = item.granted?.some(grant => 
          grant.type?.id === 'sparks_song' ||
          grant.type?.name === 'Pista de improvisación' ||
          (grant.gameplayTags && grant.gameplayTags.some(tag => 
            tag.toLowerCase().includes('music') ||
            tag.toLowerCase().includes('audio') ||
            tag.toLowerCase().includes('jam') ||
            tag.toLowerCase().includes('song')
          ))
        );

        // Retornar true solo si NO es un track
        return !isTrack && !hasTrackGrants;
      });

      setItems(filteredData);
      setFilteredItems(filteredData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorLoadingItems);
      setLoading(false);
    }
  };

  const loadRobloxProducts = async () => {
    try {
      setLoading(true);
      const products = await robloxService.getProducts();
      
      if (products && products.length > 0) {
        const displayProducts: RobloxDisplayProduct[] = products.map(product => ({
          id: product.id,
          title: product.title,
          description: product.description,
          price: Number(product.price),
          image_url: product.image_url || '/placeholder-roblox.png',
          type: 'ROBLOX'
        }));
        setRobloxProducts(displayProducts);
      }
      setError(null);
    } catch (error) {
      console.error('Error loading Roblox products:', error);
      setError('Error al cargar los productos de Roblox');
    } finally {
      setLoading(false);
    }
  };

  const handleRarityFilter = (rarity: string) => {
    setRarityFilters(prev => {
      const normalized = rarity.toLowerCase();
      return prev.includes(normalized)
        ? prev.filter(r => r !== normalized)
        : [...prev, normalized];
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const applyAllFilters = (items: ShopItem[]) => {
    return items.filter((item) => {
      // Filtros existentes de rareza y precio
      const matchesRarity = rarityFilters.length === 0 || (item.rarity?.id?.toLowerCase() === rarityFilters[0]?.toLowerCase());
      const matchesPrice = item.price?.finalPrice >= priceRange.min && item.price?.finalPrice <= priceRange.max;

      // Nuevo filtro para excluir tracks con verificación de nulos
      const isTrack = item.granted?.some(grant => {
        if (!grant) return false;

        // Verificar si es un tipo de música
        const isMusicType = grant.type?.id === 'music' || grant.type?.id === 'musicpack';
        
        // Verificar etiquetas de gameplay relacionadas con música
        const hasMusicTags = Array.isArray(grant.gameplayTags) && grant.gameplayTags.some(tag => 
          tag && (
            tag.toLowerCase().includes('music') || 
            tag.toLowerCase().includes('audio') ||
            tag.toLowerCase().includes('track')
          )
        );

        // Verificar nombre y descripción
        const hasMusicKeywords = 
          (grant.name?.toLowerCase().includes('track') || 
          grant.name?.toLowerCase().includes('música') ||
          grant.name?.toLowerCase().includes('pista') ||
          grant.description?.toLowerCase().includes('track') ||
          grant.description?.toLowerCase().includes('música') ||
          grant.description?.toLowerCase().includes('pista')) ?? false;

        return isMusicType || hasMusicTags || hasMusicKeywords;
      }) ?? false;

      // Retornar true solo si cumple con todos los filtros y NO es un track
      return matchesRarity && matchesPrice && !isTrack;
    });
  };

  // Obtener rarezas únicas
  const uniqueRarities = Array.from(new Set(
    items.map(item => item.rarity?.name).filter(Boolean)
  ));

  // Función para manejar la adición de items al carrito
  const handleAddToCart = (item: ShopItem) => {
    const result = addItem({
      mainId: item.mainId,
      offerId: item.offerId,
      displayName: item.displayName,
      displayDescription: item.displayDescription,
      price: item.price,
      rarity: item.rarity || { id: 'default', name: 'Default' },
      displayAssets: item.displayAssets,
      categories: item.categories || [],
      image: item.displayAssets[0]?.full_background || item.displayAssets[0]?.background || '',
      quantity: 1
    });

    if (result.success) {
      setLastAddedItem(item.displayName);
      setShowNotification(true);
      toast.success('Tu compra será canjeada en las próximas 24 horas', {
        position: "bottom-right",
        duration: 5000,
        className: 'bg-green-500',
      });
      setTimeout(() => setShowNotification(false), 2000);
    } else {
      setErrorMessage(result.message || t.addToCartError);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  // Función para manejar la adición de items de Roblox al carrito
  const handleAddRobloxToCart = (product: RobloxProduct & { type: string }) => {
    window.open('https://www.instagram.com/gamestore_gt/', '_blank');
  };

  const handleFilterOpen = (filter: 'rarity' | 'price') => {
    if (filter === 'rarity') {
      setIsRarityOpen(!isRarityOpen);
      setIsPriceFilterOpen(false);
    } else {
      setIsPriceFilterOpen(!isPriceFilterOpen);
      setIsRarityOpen(false);
    }
  };

  const toggleItemExpansion = (itemId: string, item: ShopItem) => {
    if (expandedItems.has(itemId)) {
      const newSet = new Set(expandedItems);
      newSet.delete(itemId);
      setExpandedItems(newSet);
      setSelectedItemForModal(null);
    } else {
      setExpandedItems(new Set(expandedItems).add(itemId));
      setSelectedItemForModal(item);
    }
  };

  // Agregar esta función helper al inicio del componente
  const getValidImageUrl = (url?: string): string => {
    if (!url) return '/placeholder-image.jpg';
    
    // Si la URL ya es completa, la devolvemos
    if (url.startsWith('http')) return url;
    
    // Si la URL comienza con //, agregamos https:
    if (url.startsWith('//')) return `https:${url}`;
    
    // Si la URL comienza con /, la consideramos relativa a fortnite-api.com
    if (url.startsWith('/')) return `https://fortnite-api.com${url}`;
    
    // En cualquier otro caso, asumimos que es relativa a fortnite-api.com
    return `https://fortnite-api.com/${url}`;
  };

  const loadGameProducts = async (gameType: string) => {
    try {
      setLoading(true);
      const products = await gameProductsService.getProducts(gameType);
      setGameProducts(products);
      setError(null);
    } catch (error) {
      console.error('Error loading game products:', error);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleGameSelected = (event: CustomEvent<string>) => {
    const gameType = event.detail as 'fortnite' | 'roblox' | 'supercell' | 'streaming' | 'leagueoflegends';
    setSelectedGameType(gameType);
    setSearchParams({ game: gameType });
    
    if (gameType === 'fortnite') {
      fetchItems();
    } else if (gameType === 'roblox') {
      loadRobloxProducts();
    } else {
      loadGameProducts(gameType);
    }
  };

  const handleAddGameProductToCart = (product: ExtendedGameProduct | LocalExtrasProduct) => {
    if ('game_type' in product) {
      // Es un GameProduct
      switch (product.game_type) {
        case 'leagueoflegends':
          setSelectedProduct(product as ExtendedGameProduct);
          setShowStreamingPaymentModal(true);
          return;

        case 'supercell':
          setSelectedProduct(product as ExtendedGameProduct);
          setShowSupercellPaymentModal(true);
          return;

        case 'roblox':
          setSelectedProduct(product as ExtendedGameProduct);
          setShowPaymentModal(true);
          return;

        case 'streaming':
          setSelectedProduct(product as ExtendedGameProduct);
          setShowStreamingPaymentModal(true);
          return;

        default:
          window.open('https://www.instagram.com/gamestore_gt/', '_blank');
          return;
      }
    } else {
      // Es un ExtrasProduct
      setSelectedProduct(product);
      setShowExtrasPaymentModal(true);
      return;
    }
  };

  const handleSubmitSupercellPayment = async () => {
    if (!selectedProduct) return;
    
    if (!supercellId) {
      toast.error('Necesitas proporcionar un ID de Supercell');
      return;
    }

    if (!selectedFile) {
      toast.error('Necesitas subir un comprobante de pago');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', localStorage.getItem('userId') || '');
      formData.append('store_type', 'supercell');
      formData.append('product_id', selectedProduct.id.toString());
      formData.append('product_name', selectedProduct.title);
      formData.append('amount', selectedProduct.price.toString());
      formData.append('game_account_id', supercellId);
      formData.append('proof_image', selectedFile);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/db/api/payment-proofs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success('Comprobante enviado correctamente. Te contactaremos pronto.');
        setShowSupercellPaymentModal(false);
        setSelectedProduct(null);
        setSupercellId('');
        setSelectedFile(null);
        setPreviewUrl('');
      } else {
        throw new Error('Error al enviar el comprobante');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar la solicitud');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor sube una imagen válida');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe pesar más de 5MB');
        return;
      }
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatPrice = (vbucksPrice: number) => {
    // Convertimos a Quetzales (5 GTQ por cada 100 V-Bucks)
    const priceInGTQ = (vbucksPrice / 100) * 5;
    
    switch (selectedCurrency) {
      case 'GTQ':
        return `Q${priceInGTQ.toFixed(2)}`;
      case 'USD':
        // 1 GTQ = 0.128 USD aproximadamente
        const priceInUSD = priceInGTQ * 0.128;
        return `$${priceInUSD.toFixed(2)}`;
      case 'COP':
        // 1 GTQ = 500 COP aproximadamente
        const priceInCOP = priceInGTQ * 500;
        return `$${priceInCOP.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      default:
        return `${vbucksPrice.toLocaleString()} V-Bucks`;
    }
  };

  const getGameImageUrl = (imageUrl: string | null): string => {
    if (!imageUrl) return '/placeholder-image.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // Si la URL ya incluye /db/, usar la URL completa
    if (imageUrl.startsWith('/db/')) {
      const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      return `${baseUrl}${imageUrl}`;
    }
    
    // Para URLs que no comienzan con /db/, agregar el prefijo completo
    const cleanUrl = imageUrl
      .replace(/^\/+/, '')        // Remover slashes iniciales
      .replace(/\/+/g, '/');      // Reemplazar múltiples slashes por uno solo
    
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const fullUrl = `${baseUrl}/db/${cleanUrl}`;
    
    console.log('URL original:', imageUrl);
    console.log('URL limpia:', cleanUrl);
    console.log('URL final construida:', fullUrl);
    
    return fullUrl;
  };

  const getGameStyles = (gameType: 'supercell' | 'streaming' | 'leagueoflegends') => {
    switch(gameType) {
      case 'supercell':
        return {
          bgColor: 'bg-yellow-500/20',
          textColor: 'text-yellow-300',
          buttonBg: 'bg-yellow-500 hover:bg-yellow-600',
          gradientColor: '#f59e0b40'
        };
      case 'streaming':
        return {
          bgColor: 'bg-purple-500/20',
          textColor: 'text-purple-300',
          buttonBg: 'bg-purple-500 hover:bg-purple-600',
          gradientColor: '#8b5cf640'
        };
      case 'leagueoflegends':
        return {
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-300',
          buttonBg: 'bg-red-500 hover:bg-red-600',
          gradientColor: '#ef444440'
        };
    }
  };

  const renderGameProducts = (gameType: 'supercell' | 'streaming' | 'leagueoflegends') => {
    const styles = getGameStyles(gameType);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
        {gameProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-[#051923]/90 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] border border-white/10"
          >
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
              background: `linear-gradient(45deg, ${styles.gradientColor}, transparent)`,
              backgroundSize: '200% 200%',
              animation: 'shimmer 2s linear infinite'
            }} />

            {/* Contenedor de imagen */}
            <div className="relative w-full aspect-video">
              <img 
                src={getGameImageUrl(product.image_url)}
                alt={product.title}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.jpg';
                }}
              />
              <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl font-semibold text-sm ${
                gameType === 'supercell' ? 'bg-yellow-500 text-black' :
                gameType === 'streaming' ? 'bg-purple-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {gameType === 'supercell' ? 'SUPERCELL' :
                 gameType === 'streaming' ? 'STREAMING' :
                 'LEAGUE OF LEGENDS'}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#051923] to-transparent opacity-60" />
            </div>

            {/* Contenido del producto */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1">
                  {product.title}
                </h3>
                <div>
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Características */}
              <div className="flex flex-wrap gap-2">
                <div className={`${styles.bgColor} ${styles.textColor} px-3 py-1 rounded-full text-sm font-medium`}>
                  {gameType === 'leagueoflegends' ? 'Solo necesitas tu ID' : 
                   gameType === 'supercell' ? 'Solo necesitas tu ID' : 
                   'Entrega Inmediata'}
                </div>
                <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                  Stock Disponible
                </div>
              </div>

              {/* Precio y botón */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Precio</span>
                  <span className="text-white text-2xl font-bold">
                    ${formatPrice(product.price)}
                  </span>
                </div>
                
                <button
                  onClick={() => handleAddGameProductToCart(product as ExtendedGameProduct)}
                  className={`px-4 py-2 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 group-hover:shadow-lg ${styles.buttonBg}`}
                >
                  {gameType === 'leagueoflegends' ? (
                    <>
                      <User className="w-5 h-5" />
                      Registrar ID
                    </>
                  ) : gameType === 'supercell' ? (
                    <>
                      <User className="w-5 h-5" />
                      Ingresar ID
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Comprar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRobloxProducts = () => {
    if (!robloxProducts.length) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Package className="w-12 h-12 text-gray-400" />
          <p className="text-gray-300">{t.noProducts}</p>
        </div>
      );
    }

    return (
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
        {robloxProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-[#051923]/90 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] border border-white/10"
          >
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
              background: 'linear-gradient(45deg, #3b82f600, #3b82f640, #3b82f600)',
              backgroundSize: '200% 200%',
              animation: 'shimmer 2s linear infinite'
            }} />

            {/* Contenedor de imagen */}
            <div className="relative w-full aspect-video">
              <img
                src={product.image_url || '/placeholder-roblox.png'}
                alt={product.title}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-roblox.png';
                }}
              />
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-xl font-semibold text-sm">
                ROBLOX
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#051923] to-transparent opacity-60" />
            </div>

            {/* Contenido del producto */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1">
                  {product.title}
                </h3>
                <div>
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Características */}
              <div className="flex flex-wrap gap-2">
                <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  Entrega Inmediata
                </div>
                <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                  Stock Disponible
                </div>
              </div>

              {/* Precio y botón */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Precio</span>
                  <span className="text-white text-2xl font-bold">
                    ${formatPrice(product.price)}
                  </span>
                </div>
                
                <button
                  onClick={() => handleAddGameProductToCart({
                    id: product.id,
                    title: product.title,
                    description: product.description,
                    price: product.price,
                    image_url: product.image_url,
                    type: 'roblox'
                  } as ExtendedGameProduct)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 group-hover:shadow-lg"
                >
                  <User className="w-5 h-5" />
                  Ingresar ID
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFortniteProducts = () => {
    if (!filteredItems.length) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Package className="w-12 h-12 text-gray-400" />
          <p className="text-gray-300">{t.noProducts}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
        {filteredItems.map((item) => {
          const rarityColor = RARITY_COLORS[item.rarity?.id?.toLowerCase() as keyof typeof RARITY_COLORS] || RARITY_COLORS.default;
          
          return (
            <div 
              key={item.mainId}
              className={`group bg-[#051923]/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col transform hover:-translate-y-1 hover:scale-[1.02] relative border border-white/10`}
            >
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" style={{
                background: `linear-gradient(45deg, ${rarityColor}00, ${rarityColor}40, ${rarityColor}00)`,
                backgroundSize: '200% 200%',
                animation: 'shimmer 2s linear infinite'
              }} />

              {/* Contenedor de imagen y descuento */}
              <div className="relative w-full aspect-square bg-black/20 flex items-center justify-center z-10">
                {/* Etiqueta de rareza */}
                <div className="absolute top-0 right-0 bg-black/60 text-white px-3 py-1 text-xs font-medium rounded-bl-lg z-20">
                  {item.rarity?.name || 'Normal'}
                </div>

                {/* Etiqueta de descuento */}
                {item.price.regularPrice > item.price.finalPrice && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 text-xs font-medium rounded-br-lg z-20">
                    {Math.round((1 - item.price.finalPrice/item.price.regularPrice) * 100)}% OFF
                  </div>
                )}
                
                {/* Imagen principal */}
                <img
                  src={
                    getValidImageUrl(item.displayAssets?.[0]?.full_background) ||
                    getValidImageUrl(item.displayAssets?.[0]?.background) ||
                    getValidImageUrl(item.granted?.[0]?.images?.icon) ||
                    '/placeholder-image.jpg'
                  }
                  alt={item.displayName}
                  className="h-full w-full object-contain p-2"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    if (!target.src.includes('/placeholder-image.jpg')) {
                      target.src = '/placeholder-image.jpg';
                    }
                  }}
                />
              </div>

              {/* Contenido del bundle */}
              <div className="p-4 flex flex-col gap-3 relative z-10">
                {/* Título del bundle */}
                <h3 className="text-lg font-bold text-white line-clamp-1">
                  {item.displayName}
                </h3>

                {/* Items incluidos */}
                <div className="flex flex-wrap gap-1">
                  {item.granted?.slice(0, 3).map((grantedItem, index) => (
                    <div key={index} className="bg-black/20 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-black/30 overflow-hidden flex-shrink-0">
                        <img 
                          src={getValidImageUrl(grantedItem.images?.icon) || '/placeholder-image.jpg'}
                          alt={grantedItem.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-white/90 text-xs font-medium line-clamp-1">
                        {grantedItem.name}
                      </span>
                    </div>
                  ))}
                  {item.granted && item.granted.length > 3 && (
                    <button
                      onClick={() => toggleItemExpansion(item.mainId, item)}
                      className="bg-black/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-white/90 text-xs font-medium hover:bg-black/30 transition-colors"
                    >
                      +{item.granted.length - 3} más
                    </button>
                  )}
                </div>

                {/* Precio y botón */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xl font-bold">
                      {formatPrice(item.price.finalPrice)}
                    </span>
                    {item.price.regularPrice > item.price.finalPrice && (
                      <span className="text-gray-400 line-through text-sm">
                        {formatPrice(item.price.regularPrice)}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(item)}
                    className={`px-3 py-1.5 bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-600 transition-colors flex items-center gap-1.5 ${
                      hasItems && getItemQuantity(item.mainId) === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    disabled={hasItems && getItemQuantity(item.mainId) === 0}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {getItemQuantity(item.mainId) > 0 ? (
                      <span className="bg-primary-700 px-1.5 rounded-full text-xs">
                        {getItemQuantity(item.mainId)}
                      </span>
                    ) : (
                      'Añadir'
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const loadExtrasProducts = async () => {
    try {
      setLoadingExtras(true);
      const products = await extrasService.getProducts();
      setExtrasProducts(products);
      setExtrasError(null);
    } catch (error) {
      console.error('Error loading extras products:', error);
      setExtrasError('Error al cargar los productos extras');
    } finally {
      setLoadingExtras(false);
    }
  };

  const renderExtrasProducts = () => {
    if (loadingExtras) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
          <p className="text-gray-400">Cargando productos extras...</p>
        </div>
      );
    }

    if (extrasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="p-4 bg-red-500/20 rounded-full">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
          <p className="text-red-400">{extrasError}</p>
        </div>
      );
    }

    if (!extrasProducts.length) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Package className="w-12 h-12 text-gray-400" />
          <p className="text-gray-300">No hay productos extras disponibles</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
        {extrasProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-[#051923]/90 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] border border-white/10"
          >
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
              background: 'linear-gradient(45deg, #10b98100, #10b98140, #10b98100)',
              backgroundSize: '200% 200%',
              animation: 'shimmer 2s linear infinite'
            }} />

            {/* Contenedor de imagen */}
            <div className="relative w-full aspect-video">
              <img
                src={getGameImageUrl(product.image_url)}
                alt={product.title}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.jpg';
                }}
              />
              <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 rounded-bl-xl font-semibold text-sm">
                EXTRAS
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#051923] to-transparent opacity-60" />
            </div>

            {/* Contenido del producto */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1">
                  {product.title}
                </h3>
                <div>
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Características */}
              <div className="flex flex-wrap gap-2">
                <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category || 'General'}
                </div>
                <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                  Stock Disponible
                </div>
              </div>

              {/* Precio y botón */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Precio</span>
                  <span className="text-white text-2xl font-bold">
                    ${formatPrice(product.price)}
                  </span>
                </div>
                
                <button
                  onClick={() => handleAddGameProductToCart(product as LocalExtrasProduct)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 group-hover:shadow-lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Comprar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Cargando productos...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="p-4 bg-red-500/20 rounded-full">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
          <p className="text-red-400">{error}</p>
        </div>
      );
    }

    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sidebar con filtros - Siempre visible */}
          <div className="lg:w-72 space-y-4 lg:mt-20">
            {selectedGameType === 'fortnite' && (
              <>
                <div className="bg-[#051923] rounded-xl p-4 border border-primary-500/20">
                  <div className="space-y-4">
                    {/* Filtro de Rareza */}
                    <div>
                      <button
                        onClick={() => handleFilterOpen('rarity')}
                        className="w-full flex items-center justify-between text-white hover:text-primary-400 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Filter className="w-5 h-5" />
                          <span className="font-medium">{t.filterByRarity}</span>
                        </div>
                        {isRarityOpen ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      
                      {isRarityOpen && (
                        <div className="mt-4 space-y-2">
                          {uniqueRarities.map((rarity) => rarity && (
                            <button
                              key={rarity}
                              onClick={() => handleRarityFilter(rarity)}
                              className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                                rarityFilters.includes(rarity.toLowerCase())
                                  ? 'bg-primary-500 text-white'
                                  : 'text-gray-300 hover:bg-primary-500/20'
                              }`}
                            >
                              {rarity}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Filtro de Precio */}
                    <div>
                      <button
                        onClick={() => handleFilterOpen('price')}
                        className="w-full flex items-center justify-between text-white hover:text-primary-400 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Filter className="w-5 h-5" />
                          <span className="font-medium">{t.filterByPrice}</span>
                        </div>
                        {isPriceFilterOpen ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      
                      {isPriceFilterOpen && (
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="text-gray-300 text-sm">{t.minimum}</label>
                            <input
                              type="number"
                              name="min"
                              value={priceRange.min}
                              onChange={handlePriceChange}
                              className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            />
                          </div>
                          <div>
                            <label className="text-gray-300 text-sm">{t.maximum}</label>
                            <input
                              type="number"
                              name="max"
                              value={priceRange.max}
                              onChange={handlePriceChange}
                              className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pasos para Comprar */}
                <div className="bg-[#051923] rounded-xl p-4 border border-primary-500/20">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {t.stepsForPurchase}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-bold">
                        1
                      </div>
                      <p className="text-gray-300 text-sm">
                        {t.step1}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-bold">
                        2
                      </div>
                      <p className="text-gray-300 text-sm">
                        {t.step2}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-bold">
                        3
                      </div>
                      <p className="text-gray-300 text-sm">
                        {t.step3}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Tiendas Disponibles - Siempre visible */}
            <div className="bg-[#051923] rounded-xl p-4 border border-primary-500/20">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {t.availableStores}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedGameType('fortnite')}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                    selectedGameType === 'fortnite' ? 'bg-primary-500 text-white' : 'text-gray-300 hover:bg-primary-500/20'
                  }`}
                >
                  <Trophy className="w-5 h-5" />
                  <span>{t.fortniteStore}</span>
                </button>
                <button
                  onClick={() => setSelectedGameType('roblox')}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                    selectedGameType === 'roblox' ? 'bg-primary-500 text-white' : 'text-gray-300 hover:bg-primary-500/20'
                  }`}
                >
                  <Gamepad className="w-5 h-5" />
                  <span>{t.robloxStore}</span>
                </button>
                <button
                  onClick={() => setSelectedGameType('supercell')}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                    selectedGameType === 'supercell' ? 'bg-primary-500 text-white' : 'text-gray-300 hover:bg-primary-500/20'
                  }`}
                >
                  <Gamepad className="w-5 h-5" />
                  <span>{t.supercellStore}</span>
                </button>
                <button
                  onClick={() => setSelectedGameType('streaming')}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                    selectedGameType === 'streaming' ? 'bg-primary-500 text-white' : 'text-gray-300 hover:bg-primary-500/20'
                  }`}
                >
                  <Gamepad className="w-5 h-5" />
                  <span>{t.streamingStore}</span>
                </button>
                <button
                  onClick={() => setSelectedGameType('leagueoflegends')}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                    selectedGameType === 'leagueoflegends' ? 'bg-primary-500 text-white' : 'text-gray-300 hover:bg-primary-500/20'
                  }`}
                >
                  <Sword className="w-5 h-5" />
                  <span>{t.leagueStore}</span>
                </button>
                <button
                  onClick={() => setSelectedGameType('extras')}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                    selectedGameType === 'extras' ? 'bg-primary-500 text-white' : 'text-gray-300 hover:bg-primary-500/20'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span>{t.extrasStore}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contenido principal - Cambia según la tienda seleccionada */}
          <div className="flex-1">
            <div className="text-center mb-6">
              {/* Encabezado dinámico según la tienda seleccionada */}
              <div className="inline-block p-3 rounded-2xl mb-4" style={{
                backgroundColor: selectedGameType === 'fortnite' ? 'rgba(79, 70, 229, 0.2)' :
                               selectedGameType === 'roblox' ? 'rgba(59, 130, 246, 0.2)' :
                               selectedGameType === 'supercell' ? 'rgba(245, 158, 11, 0.2)' :
                               selectedGameType === 'streaming' ? 'rgba(139, 92, 246, 0.2)' :
                               selectedGameType === 'leagueoflegends' ? 'rgba(239, 68, 68, 0.2)' :
                               'rgba(239, 68, 68, 0.2)'
              }}>
                {selectedGameType === 'fortnite' && <Trophy className="w-12 h-12 text-indigo-400" />}
                {selectedGameType === 'roblox' && <Gamepad className="w-12 h-12 text-blue-400" />}
                {selectedGameType === 'supercell' && <Trophy className="w-12 h-12 text-yellow-400" />}
                {selectedGameType === 'streaming' && <Gamepad className="w-12 h-12 text-purple-400" />}
                {selectedGameType === 'leagueoflegends' && <Sword className="w-12 h-12 text-red-400" />}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {selectedGameType === 'fortnite' && t.fortniteStore}
                {selectedGameType === 'roblox' && t.robloxStore}
                {selectedGameType === 'supercell' && t.supercellStore}
                {selectedGameType === 'streaming' && t.streamingStore}
                {selectedGameType === 'leagueoflegends' && t.leagueStore}
                {selectedGameType === 'extras' && t.extrasStore}
              </h1>
              <p className="text-gray-300 text-base max-w-2xl mx-auto">
                {selectedGameType === 'fortnite' && t.findBestItems}
                {selectedGameType === 'roblox' && t.findBestRoblox}
                {selectedGameType === 'supercell' && t.findBestSupercell}
                {selectedGameType === 'streaming' && t.findBestStreaming}
                {selectedGameType === 'leagueoflegends' && t.findBestLeague}
                {selectedGameType === 'extras' && t.findBestExtras}
              </p>
            </div>

            {/* Renderizar el contenido específico de cada tienda */}
            {selectedGameType === 'fortnite' && renderFortniteProducts()}
            {selectedGameType === 'roblox' && renderRobloxProducts()}
            {selectedGameType === 'supercell' && renderGameProducts('supercell')}
            {selectedGameType === 'streaming' && renderGameProducts('streaming')}
            {selectedGameType === 'leagueoflegends' && (
              <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-[#051923] rounded-2xl border border-red-500/20">
                <div className="w-20 h-20 mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Sword className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 text-center">
                  ¡Próximamente!
                </h2>
                <p className="text-gray-400 text-lg text-center max-w-lg">
                  La tienda de League of Legends estará disponible muy pronto. 
                  Estamos trabajando para traerte los mejores productos.
                </p>
              </div>
            )}
            {selectedGameType === 'extras' && renderExtrasProducts()}
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentModal = () => {
    if (!showPaymentModal || !selectedProduct) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div 
          ref={modalRef}
          className="bg-[#051923] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-primary-500/20"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{t.paymentInfo}</h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div className="flex gap-4 items-start pb-6 border-b border-gray-700">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/20">
                <img 
                  src={getGameImageUrl(selectedProduct.image_url)} 
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-supercell.png';
                  }}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedProduct.title}</h3>
                <p className="text-gray-400 mt-1">{selectedProduct.description}</p>
                <p className="text-2xl font-bold text-primary-400 mt-2">${formatPrice(selectedProduct.price)}</p>
              </div>
            </div>

            {/* Bank Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">{t.bankInformation}</h3>
              
              {/* BANRURAL */}
              <div className="p-4 bg-[#051923] border border-gray-700 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">BANRURAL</p>
                  <p className="text-gray-300">{t.accountType}</p>
                  <p className="text-gray-300">No. de cuenta: 03103500001370</p>
                  <p className="text-gray-300">{t.accountName}: Jose Martínez</p>
                </div>
              </div>

              {/* G&T CONTINENTAL */}
              <div className="p-4 bg-[#051923] border border-gray-700 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">BANCO G&T CONTINENTAL</p>
                  <p className="text-gray-300">{t.accountType}</p>
                  <p className="text-gray-300">No. de cuenta: 039-0019192-5</p>
                  <p className="text-gray-300">{t.accountName}: Jose Martínez</p>
                </div>
              </div>

              {/* BANCO INDUSTRIAL */}
              <div className="p-4 bg-[#051923] border border-gray-700 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">BANCO INDUSTRIAL</p>
                  <p className="text-gray-300">{t.savingsAccount}</p>
                  <p className="text-gray-300">No. de cuenta: 0525075</p>
                  <p className="text-gray-300">{t.accountName}: Jose Martínez</p>
                </div>
              </div>
            </div>

            {/* Roblox ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.robloxId}
              </label>
              <input
                type="text"
                value={robloxId}
                onChange={(e) => setRobloxId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#051923] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder={t.enterRobloxId}
              />
            </div>

            {/* Payment Proof Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.proofOfPayment}
              </label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 bg-[#051923] border-2 border-dashed border-gray-700 rounded-xl text-gray-300 hover:text-primary-400 hover:border-primary-400 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                {selectedFile ? t.changeProofButton : t.uploadProofButton}
              </button>
              
              {previewUrl && (
                <div className="mt-4 relative rounded-lg overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt={t.proofOfPayment} 
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 flex justify-between items-center">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={() => handleAddGameProductToCart(selectedProduct as GameProduct)}
              className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20 flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {t.confirmPurchase}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSupercellPaymentModal = () => {
    if (!showSupercellPaymentModal || !selectedProduct) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div 
          ref={modalRef}
          className="bg-[#051923] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-yellow-500/20"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Información de Pago - Supercell</h2>
              <button 
                onClick={() => setShowSupercellPaymentModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div className="flex gap-4 items-start pb-6 border-b border-gray-700">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/20">
                <img 
                  src={getGameImageUrl(selectedProduct.image_url)} 
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-supercell.png';
                  }}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedProduct.title}</h3>
                <p className="text-gray-400 mt-1">{selectedProduct.description}</p>
                <p className="text-2xl font-bold text-yellow-400 mt-2">${formatPrice(selectedProduct.price)}</p>
              </div>
            </div>

            {/* Bank Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Información Bancaria</h3>
              
              {/* BANRURAL */}
              <div className="p-4 bg-[#051923] border border-gray-700 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">BANRURAL</p>
                  <p className="text-gray-300">Cuenta Monetaria</p>
                  <p className="text-gray-300">No. de cuenta: 03103500001370</p>
                  <p className="text-gray-300">A nombre de: Jose Martínez</p>
                </div>
              </div>

              {/* G&T CONTINENTAL */}
              <div className="p-4 bg-[#051923] border border-gray-700 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">BANCO G&T CONTINENTAL</p>
                  <p className="text-gray-300">Cuenta Monetaria</p>
                  <p className="text-gray-300">No. de cuenta: 039-0019192-5</p>
                  <p className="text-gray-300">A nombre de: Jose Martínez</p>
                </div>
              </div>

              {/* BANCO INDUSTRIAL */}
              <div className="p-4 bg-[#051923] border border-gray-700 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">BANCO INDUSTRIAL</p>
                  <p className="text-gray-300">Cuenta de ahorro</p>
                  <p className="text-gray-300">No. de cuenta: 0525075</p>
                  <p className="text-gray-300">A nombre de: Jose Martínez</p>
                </div>
              </div>
            </div>

            {/* Supercell ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ID de Supercell
              </label>
              <input
                type="text"
                value={supercellId}
                onChange={(e) => setSupercellId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#051923] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                placeholder="Ingresa tu ID de Supercell"
              />
            </div>

            {/* Payment Proof Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Comprobante de Pago
              </label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 bg-[#051923] border-2 border-dashed border-gray-700 rounded-xl text-gray-300 hover:text-yellow-400 hover:border-yellow-400 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                {selectedFile ? 'Cambiar comprobante' : 'Subir comprobante'}
              </button>
              
              {previewUrl && (
                <div className="mt-4 relative rounded-lg overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Comprobante de pago" 
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 flex justify-between items-center">
            <button
              onClick={() => setShowSupercellPaymentModal(false)}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmitSupercellPayment}
              className="px-8 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors shadow-lg shadow-yellow-600/20 flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Confirmar Compra
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStreamingPaymentModal = () => {
    if (!showStreamingPaymentModal || !selectedProduct) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div 
          ref={modalRef}
          className="bg-[#051923] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/20"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {selectedProduct.game_type === 'leagueoflegends' 
                  ? 'Información de Pago - League of Legends'
                  : 'Información de Pago - Streaming'}
              </h2>
              <button 
                onClick={() => setShowStreamingPaymentModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div className="flex gap-4 items-start pb-6 border-b border-gray-700">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/20">
                <img 
                  src={getGameImageUrl(selectedProduct.image_url)} 
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedProduct.title}</h3>
                <p className="text-gray-400 mt-1">{selectedProduct.description}</p>
                <p className="text-2xl font-bold text-purple-400 mt-2">${formatPrice(selectedProduct.price)}</p>
              </div>
            </div>

            {/* Bank Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Información Bancaria</h3>
              
              {/* BANRURAL */}
              <div className="p-4 bg-[#051923] border border-gray-700 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">BANRURAL</p>
                  <p className="text-gray-300">Cuenta Monetaria</p>
                  <p className="text-gray-300">No. de cuenta: 03103500001370</p>
                  <p className="text-gray-300">A nombre de: Jose Martínez</p>
                </div>
              </div>

              {/* G&T CONTINENTAL */}
              <div className="p-4 bg-[#051923] border border-gray-700 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">BANCO G&T CONTINENTAL</p>
                  <p className="text-gray-300">Cuenta Monetaria</p>
                  <p className="text-gray-300">No. de cuenta: 039-0019192-5</p>
                  <p className="text-gray-300">A nombre de: Jose Martínez</p>
                </div>
              </div>

              {/* BANCO INDUSTRIAL */}
              <div className="p-4 bg-[#051923] border border-gray-700 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">BANCO INDUSTRIAL</p>
                  <p className="text-gray-300">Cuenta de ahorro</p>
                  <p className="text-gray-300">No. de cuenta: 0525075</p>
                  <p className="text-gray-300">A nombre de: Jose Martínez</p>
                </div>
              </div>
            </div>

            {/* League of Legends ID Input */}
            {selectedProduct.game_type === 'leagueoflegends' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ID de League of Legends
                </label>
                <input
                  type="text"
                  value={leagueId}
                  onChange={(e) => setLeagueId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#051923] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Ingresa tu ID de League of Legends"
                />
              </div>
            )}

            {/* Payment Proof Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Comprobante de Pago
              </label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 bg-[#051923] border-2 border-dashed border-gray-700 rounded-xl text-gray-300 hover:text-purple-400 hover:border-purple-400 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                {selectedFile ? 'Cambiar comprobante' : 'Subir comprobante'}
              </button>
              
              {previewUrl && (
                <div className="mt-4 relative rounded-lg overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Comprobante de pago" 
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 flex justify-between items-center">
            <button
              onClick={() => setShowStreamingPaymentModal(false)}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmitStreamingPayment}
              className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20 flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Confirmar Compra
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmitStreamingPayment = async () => {
    if (!selectedProduct) {
      toast.error('No se ha seleccionado ningún producto');
      return;
    }
    
    if (selectedProduct.game_type === 'leagueoflegends' && !leagueId) {
      toast.error('Necesitas proporcionar un ID de League of Legends');
      return;
    }

    if (!selectedFile) {
      toast.error('Necesitas subir un comprobante de pago');
      return;
    }

    // Validar el tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('El archivo debe ser una imagen (JPEG, JPG o PNG)');
      return;
    }

    // Validar el tamaño del archivo (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('El archivo no debe exceder los 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('store_type', selectedProduct.game_type);
      formData.append('product_id', selectedProduct.id.toString());
      formData.append('product_name', selectedProduct.title);
      formData.append('amount', selectedProduct.price.toString());
      if (selectedProduct.game_type === 'leagueoflegends') {
        formData.append('game_account_id', leagueId);
      }
      formData.append('proof_image', selectedFile);

      console.log('Enviando datos:', {
        store_type: selectedProduct.game_type,
        product_id: selectedProduct.id,
        product_name: selectedProduct.title,
        amount: selectedProduct.price,
        game_account_id: leagueId || undefined
      });

      const response = await fetch(`${API_URL}/db/api/payment-proofs`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      toast.success('Comprobante enviado correctamente. Te contactaremos pronto.');
      setShowStreamingPaymentModal(false);
      setSelectedProduct(null);
      setSelectedFile(null);
      setPreviewUrl('');
      setLeagueId('');
    } catch (error) {
      console.error('Error detallado:', error);
      toast.error(error instanceof Error ? error.message : 'Error al procesar la solicitud');
    }
  };

  const renderExtrasPaymentModal = () => {
    if (!showExtrasPaymentModal || !selectedProduct) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div 
          ref={modalRef}
          className="bg-[#051923] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-emerald-500/20"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Información de Pago - Extras</h2>
              <button 
                onClick={() => setShowExtrasPaymentModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div className="flex gap-4 items-start pb-6 border-b border-gray-700">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/20">
                <img 
                  src={getGameImageUrl(selectedProduct.image_url)}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedProduct.title}</h3>
                <p className="text-gray-400 mt-1">{selectedProduct.description}</p>
                <p className="text-2xl font-bold text-emerald-400 mt-2">${formatPrice(selectedProduct.price)}</p>
              </div>
            </div>

            {/* Bank Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Información Bancaria</h3>
              
              {/* BANRURAL */}
              <div className="p-4 bg-[#051923] border border-gray-700 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">BANRURAL</p>
                  <p className="text-gray-300">Cuenta Monetaria</p>
                  <p className="text-gray-300">No. de cuenta: 03103500001370</p>
                  <p className="text-gray-300">A nombre de: Jose Martínez</p>
                </div>
              </div>

              {/* G&T CONTINENTAL */}
              <div className="p-4 bg-[#051923] border border-gray-700 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">BANCO G&T CONTINENTAL</p>
                  <p className="text-gray-300">Cuenta Monetaria</p>
                  <p className="text-gray-300">No. de cuenta: 039-0019192-5</p>
                  <p className="text-gray-300">A nombre de: Jose Martínez</p>
                </div>
              </div>

              {/* BANCO INDUSTRIAL */}
              <div className="p-4 bg-[#051923] border border-gray-700 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">BANCO INDUSTRIAL</p>
                  <p className="text-gray-300">Cuenta de ahorro</p>
                  <p className="text-gray-300">No. de cuenta: 0525075</p>
                  <p className="text-gray-300">A nombre de: Jose Martínez</p>
                </div>
              </div>
            </div>

            {/* Payment Proof Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Comprobante de Pago
              </label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 bg-[#051923] border-2 border-dashed border-gray-700 rounded-xl text-gray-300 hover:text-emerald-400 hover:border-emerald-400 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                {selectedFile ? 'Cambiar comprobante' : 'Subir comprobante'}
              </button>
              
              {previewUrl && (
                <div className="mt-4 relative rounded-lg overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Comprobante de pago" 
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 flex justify-between items-center">
            <button
              onClick={() => setShowExtrasPaymentModal(false)}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmitExtrasPayment}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Confirmar Compra
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmitExtrasPayment = async () => {
    if (!selectedProduct) {
      toast.error('No se ha seleccionado ningún producto');
      return;
    }

    if (!selectedFile) {
      toast.error('Necesitas subir un comprobante de pago');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('store_type', 'extras');
      formData.append('product_id', selectedProduct.id.toString());
      formData.append('product_name', selectedProduct.title);
      formData.append('amount', selectedProduct.price.toString());
      formData.append('proof_image', selectedFile);

      const response = await fetch(`${API_URL}/db/api/payment-proofs`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al enviar el comprobante');
      }

      toast.success('Comprobante enviado correctamente. Te contactaremos pronto.');
      setShowExtrasPaymentModal(false);
      setSelectedProduct(null);
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar la solicitud');
    }
  };

  return (
    <div className="min-h-screen bg-[#051923] relative font-['Quicksand']">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap');

          * {
            font-family: 'Quicksand', sans-serif;
          }

          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
      {/* Fondos dinámicos */}
      {selectedGameType === 'roblox' && (
        <>
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url("https://i.postimg.cc/CLVSK60q/imagenes-de-roblox-kr9dxy2z296bf7b9.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#051923',
              width: '100vw',
              height: '100vh',
              position: 'fixed',
            }}
          />
          <div className="absolute inset-0 bg-black/70 z-0" style={{ position: 'fixed' }} />
        </>
      )}
      {selectedGameType === 'supercell' && (
        <>
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url("https://i.postimg.cc/ZKPTH0sL/newww.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#051923',
              width: '100vw',
              height: '100vh',
              position: 'fixed',
            }}
          />
          <div className="absolute inset-0 bg-black/70 z-0" style={{ position: 'fixed' }} />
        </>
      )}
      {selectedGameType === 'streaming' && (
        <>
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url("https://i.postimg.cc/cH7D2qpP/tcl-Best-Streaming-Apps-2022.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#051923',
              width: '100vw',
              height: '100vh',
              position: 'fixed',
            }}
          />
          <div className="absolute inset-0 bg-black/70 z-0" style={{ position: 'fixed' }} />
        </>
      )}
      {selectedGameType === 'fortnite' && (
        <>
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url("https://i.postimg.cc/1zHxjWFk/1143-3840x2160-desktop-4k-fortnite-background-photo.jpg")',
              backgroundSize: 'contain',
              backgroundPosition: 'top center',
              backgroundRepeat: 'repeat-y',
              backgroundColor: '#051923',
            }}
          />
          <div className="absolute inset-0 bg-black/70 z-0" />
        </>
      )}
      {selectedGameType === 'leagueoflegends' && (
        <>
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url("https://i.postimg.cc/5NrmPNH6/content-original-championillustrations-group-slashes-9828cf13cecf88fb9f21ee17afa6874e.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#051923',
              width: '100vw',
              height: '100vh',
              position: 'fixed',
            }}
          />
          <div className="absolute inset-0 bg-black/70 z-0" style={{ position: 'fixed' }} />
        </>
      )}
      {selectedGameType === 'extras' && (
        <>
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#051923',
              width: '100vw',
              height: '100vh',
              position: 'fixed',
            }}
          />
          <div className="absolute inset-0 bg-black/70 z-0" style={{ position: 'fixed' }} />
        </>
      )}
      <div className="container mx-auto px-4 pt-16 pb-16 relative z-10">
        {renderContent()}
      </div>

      {/* Notificaciones */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          {lastAddedItem} {t.addedToCart}
        </div>
      )}

      {showErrorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <X className="w-5 h-5" />
          {errorMessage}
        </div>
      )}

      {renderPaymentModal()}
      {renderSupercellPaymentModal()}
      {renderStreamingPaymentModal()}
      {renderExtrasPaymentModal()}
    </div>
  );
};

export default FortniteShop;