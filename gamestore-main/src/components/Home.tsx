import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight, Star, TrendingUp, Zap, ShoppingCart, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDailyShop, FortniteItem } from '../services/fortniteApi';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import LanguageSelector from './LanguageSelector';

// Datos de ejemplo para las notificaciones
const purchaseNotifications = [
  { username: 'NinjaGamer123', item: 'Skin Legendaria - Dragon Místico', time: '2 minutos' },
  { username: 'FortWarrior', item: 'Pico Estelar', time: '5 minutos' },
  { username: 'ProPlayer2024', item: 'Baile Épico - Victory Dance', time: '8 minutos' },
  { username: 'StormHunter', item: 'Alas de Fuego', time: '10 minutos' },
  { username: 'BattleQueen', item: 'Pack Legendario - Guerrero Celestial', time: '15 minutos' },
  { username: 'LootMaster', item: 'Mochila Reactiva', time: '18 minutos' },
  { username: 'VictoryRoyal', item: 'Skin Rara - Cazador Nocturno', time: '20 minutos' },
  { username: 'BuildPro99', item: 'Gesto Épico - Saludo Victorioso', time: '25 minutos' }
];

// Datos de ejemplo para los testimonios de Discord
const discordTestimonials = [
  {
    username: 'GamerPro123',
    avatar: 'https://i.postimg.cc/qRwZS1dG/discord-avatar-1.png',
    message: '¡Increíble servicio! Compré RP para League of Legends y la entrega fue instantánea. 100% recomendado.',
    rating: 5,
    role: 'Cliente Verificado',
    date: '2 días atrás'
  },
  {
    username: 'FortniteMaster',
    avatar: 'https://i.postimg.cc/3RZ6SX1B/discord-avatar-2.png',
    message: 'La mejor tienda para comprar skins de Fortnite. Precios competitivos y excelente atención al cliente.',
    rating: 5,
    role: 'Cliente VIP',
    date: '1 semana atrás'
  },
  {
    username: 'StreamerElite',
    avatar: 'https://i.postimg.cc/kg15BwW1/discord-avatar-3.png',
    message: 'Conseguí mi membresía de Twitch Prime super rápido. El soporte es muy profesional.',
    rating: 5,
    role: 'Streamer Verificado',
    date: '3 días atrás'
  },
  {
    username: 'ClashKing',
    avatar: 'https://i.postimg.cc/qRwZS1dG/discord-avatar-1.png',
    message: 'Excelentes precios para gemas de Clash Royale. Definitivamente volveré a comprar.',
    rating: 5,
    role: 'Cliente Verificado',
    date: '5 días atrás'
  },
  {
    username: 'RobloxPro',
    avatar: 'https://i.postimg.cc/3RZ6SX1B/discord-avatar-2.png',
    message: 'Compré Robux y todo fue muy seguro y rápido. ¡Gracias por el excelente servicio!',
    rating: 5,
    role: 'Cliente Premium',
    date: '1 día atrás'
  }
];

// Función para censurar parcialmente el nombre de usuario
const censorUsername = (username: string) => {
  if (username.length <= 4) {
    return username[0] + '***';
  }
  const visibleStart = Math.ceil(username.length * 0.4); // Muestra el 40% inicial
  const censored = username.slice(0, visibleStart) + '***';
  return censored;
};

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState<FortniteItem[]>([]);
  const [latestItems, setLatestItems] = useState<FortniteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(true);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isHoveringTestimonials, setIsHoveringTestimonials] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        // Primero intentamos obtener las skins guardadas
        const savedSkins = JSON.parse(localStorage.getItem('fixedHeroSkins') || 'null');
        
        // Si tenemos skins guardadas, las usamos y no hacemos nada más
        if (savedSkins && Array.isArray(savedSkins) && savedSkins.length === 3) {
          console.log('Usando skins fijas guardadas...');
          setFeaturedItems(savedSkins);
          setLoading(false);
          return; // Importante: salimos aquí para no hacer nada más
        }

        // Si no hay skins guardadas, seleccionamos nuevas (esto solo ocurre la primera vez)
        console.log('Seleccionando skins fijas por primera vez...');
        const items = await getDailyShop();

        // Filtrar todas las skins (outfits)
        const skins = items.filter((item: FortniteItem) => {
          const isOutfit = item.granted?.some(grant => 
            grant.type?.name?.toLowerCase() === 'outfit' ||
            item.mainType?.toLowerCase().includes('outfit')
          );

          const hasProfileIcon = Boolean(
            item.images?.icon || 
            item.granted?.[0]?.images?.icon
          );

          const hasValidImage = Boolean(
            item.images?.transparent ||
            item.granted?.[0]?.images?.transparent ||
            item.displayAssets?.[0]?.full_background ||
            item.images?.featured
          );

          return isOutfit && (hasProfileIcon || hasValidImage);
        });

        // Separar skins con imagen de perfil para el centro
        const centralSkins = skins.filter((skin: FortniteItem) => 
          Boolean(skin.images?.icon || skin.granted?.[0]?.images?.icon)
        );
        
        if (centralSkins.length === 0) {
          console.error('No hay skins con imagen de perfil para el centro');
          setLoading(false);
          return;
        }

        // Seleccionar una skin aleatoria para el centro
        const randomCentralSkin = centralSkins[Math.floor(Math.random() * centralSkins.length)];

        // Seleccionar dos skins aleatorias diferentes para los lados
        const availableSideSkins = skins.filter(skin => skin.mainId !== randomCentralSkin.mainId);
        
        if (availableSideSkins.length < 2) {
          console.error('No hay suficientes skins para los lados');
          setLoading(false);
          return;
        }

        const shuffledSideSkins = availableSideSkins.sort(() => 0.5 - Math.random());
        const selectedSideSkins = shuffledSideSkins.slice(0, 2);

        // Guardar las skins seleccionadas
        const selectedSkins = [
          selectedSideSkins[0],
          randomCentralSkin,
          selectedSideSkins[1]
        ].filter(Boolean);

        // Guardamos en un key diferente para asegurarnos de que no hay conflicto
        localStorage.setItem('fixedHeroSkins', JSON.stringify(selectedSkins));
        setFeaturedItems(selectedSkins);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching featured items:', error);
        // Si hay error pero tenemos skins guardadas, las usamos
        const savedSkins = JSON.parse(localStorage.getItem('fixedHeroSkins') || 'null');
        if (savedSkins && Array.isArray(savedSkins) && savedSkins.length === 3) {
          setFeaturedItems(savedSkins);
        }
        setLoading(false);
      }
    };

    const fetchLatestItems = async () => {
      try {
        const shopItems = await getDailyShop();
        setLatestItems(shopItems);
      } catch (error) {
        console.error('Error fetching Fortnite items:', error);
      }
    };

    fetchFeaturedItems();
    fetchLatestItems();
  }, []);

  // Efecto para rotar las notificaciones
  useEffect(() => {
    const interval = setInterval(() => {
      setShowNotification(false);
      setTimeout(() => {
        setCurrentNotificationIndex((prevIndex) => 
          prevIndex === purchaseNotifications.length - 1 ? 0 : prevIndex + 1
        );
        setShowNotification(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Función para manejar el carrusel de testimonios
  useEffect(() => {
    if (isHoveringTestimonials) return;

    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) =>
        prevIndex === discordTestimonials.length - 3 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isHoveringTestimonials]);

  const getBestImage = (item: FortniteItem, isMainItem: boolean = false): string | undefined => {
    if (!item) return undefined;

    if (isMainItem) {
      // Para el item central, intentar obtener la imagen de perfil
      const iconImage = item.images?.icon || item.granted?.[0]?.images?.icon;
      if (iconImage) {
        return iconImage;
      }
    } else {
      // Para los items laterales, intentar obtener la imagen en este orden:
      return (
        item.images?.transparent ||  // 1. Imagen transparente directa
        item.granted?.[0]?.images?.transparent || // 2. Imagen transparente del granted
        item.displayAssets?.[0]?.full_background || // 3. Imagen completa de displayAssets
        item.images?.featured || // 4. Imagen featured
        item.images?.icon || // 5. Icono como último recurso
        item.granted?.[0]?.images?.icon
      );
    }
  };

  const t = translations[language];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (carouselRef.current) {
      setStartX(e.pageX - carouselRef.current.offsetLeft);
      setScrollLeft(carouselRef.current.scrollLeft);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    if (carouselRef.current) {
      const x = e.pageX - carouselRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      carouselRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen relative">
      {/* Fondo fijo */}
      <div className="fixed inset-0 bg-black" style={{ zIndex: -3 }}></div>
      
      {/* Efecto de difuminado azul general */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -2 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-transparent"></div>
      </div>

      {/* Overlay para oscurecer un poco */}
      <div className="fixed inset-0 bg-black/70" style={{ zIndex: -1 }}></div>

      <div className="relative">
        <LanguageSelector />
        
        {/* Hero Section */}
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden py-20">
          <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-16">
              {/* Contenido Hero */}
              <div className="max-w-3xl lg:flex-1 relative z-20">
                <h1 
                  className="text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-8 leading-tight"
                  dangerouslySetInnerHTML={{ __html: t.heroTitle }}
                />
                <p className="text-xl lg:text-2xl text-gray-200 mb-12 leading-relaxed">
                  {t.heroSubtitle}<br/>
                  {t.heroDescription}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 relative">
                  <Link 
                    to="/fortnite-shop"
                    className="px-12 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 shadow-lg shadow-primary-600/20"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {t.exploreStore}
                  </Link>
                </div>
              </div>

              {/* Imágenes a la derecha */}
              {!loading && featuredItems.length >= 3 && (
                <div className="flex items-center justify-center gap-8 lg:flex-1 relative">
                  {/* Efecto de luz brillante detrás de las imágenes */}
                  <div className="absolute inset-0 -top-20 -bottom-20 -left-20 -right-20 z-0">
                    <div className="w-full h-full relative">
                      <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full"></div>
                      <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full transform rotate-45"></div>
                      <div className="absolute inset-0 bg-cyan-400/10 blur-[80px] rounded-full transform -rotate-45"></div>
                    </div>
                  </div>

                  {featuredItems.map((item, index) => (
                    <div
                      key={item.mainId}
                      className={`relative transform transition-all duration-500 z-10 ${
                        index === 1 
                          ? 'w-[400px] h-[500px] z-20' 
                          : 'w-[220px] h-[300px] opacity-90'
                      } ${index === 0 ? '-rotate-6' : index === 2 ? 'rotate-6' : ''}`}
                    >
                      <div className={`relative w-full h-full ${
                        index !== 1 ? 'rounded-xl overflow-hidden border border-blue-500/30 bg-gradient-to-b from-blue-900/20 to-black/40 backdrop-blur-sm shadow-xl shadow-blue-900/20' : 'flex items-center justify-center'
                      }`}>
                        {index !== 1 && (
                          <>
                            {/* Overlay superior con nombre y precio */}
                            <div className="absolute top-0 left-0 right-0 p-3 z-10">
                              <h3 className="text-white font-semibold text-lg truncate">{item.displayName}</h3>
                              <div className="flex items-center gap-2">
                                <span className="text-blue-400 font-bold">${item.price?.finalPrice || '???'}</span>
                                <span className="text-amber-400 text-sm">{item.rarity?.name || 'Rare'}</span>
                              </div>
                            </div>
                          </>
                        )}
                        <img
                          src={getBestImage(item, index === 1)}
                          alt={item.displayName}
                          className={`w-full h-full ${
                            index === 1 
                              ? 'object-contain scale-125' 
                              : 'object-cover'
                          }`}
                          loading="eager"
                          style={index === 1 ? {
                            imageRendering: 'high-quality',
                            transform: 'translateY(-10%)'
                          } : {
                            imageRendering: 'high-quality'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Nueva sección de Testimonios de Discord */}
        <section className="relative py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Encabezado de la sección */}
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
                Lo que dice nuestra comunidad
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Miles de jugadores confían en nosotros para sus compras de juegos. 
                Únete a nuestra comunidad de Discord y descubre por qué somos la mejor opción.
              </p>
            </div>

            {/* Carrusel de testimonios */}
            <div 
              className="relative overflow-hidden"
              onMouseEnter={() => setIsHoveringTestimonials(true)}
              onMouseLeave={() => {
                setIsHoveringTestimonials(false);
                setIsDragging(false);
              }}
            >
              <div 
                ref={carouselRef}
                className={`flex gap-6 transition-transform duration-500 ease-in-out testimonial-carousel ${isDragging ? 'cursor-grabbing select-none' : 'cursor-ew-resize'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ 
                  transform: `translateX(-${currentTestimonialIndex * (100/3)}%)`,
                  userSelect: 'none'
                }}
              >
                {discordTestimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`min-w-[calc(33.333%-1rem)] bg-[#1e2124] rounded-xl p-6 border border-[#36393f] transform transition-all duration-300 hover:scale-105 hover:border-discord hover:animate-border-glow ${isDragging ? 'pointer-events-none' : ''}`}
                    style={{ 
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                    }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.username}
                          className="w-12 h-12 rounded-full border-2 border-discord"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-discord rounded-full p-1">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold">
                            {testimonial.username}
                          </h3>
                        </div>
                        <span className="text-discord text-sm flex items-center gap-1">
                          {testimonial.role}
                        </span>
                      </div>
                      <div className="ml-auto flex items-center">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">
                      {testimonial.message}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-400">
                      <span>{testimonial.date}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Verificado
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Indicadores de navegación con cursor tipo línea */}
              <div className="flex justify-center gap-2 mt-8">
                {[...Array(discordTestimonials.length - 2)].map((_, index) => (
                  <button
                    key={index}
                    className={`h-1 rounded-full transition-all duration-300 cursor-ew-resize ${
                      currentTestimonialIndex === index
                        ? 'bg-discord w-12'
                        : 'bg-gray-600 w-6 hover:w-8'
                    }`}
                    onClick={() => setCurrentTestimonialIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Fortnite Items - Renovado */}
        <section className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">{t.featuredItems}</h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                {t.featuredDescription}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {loading ? (
                Array(4).fill(0).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-700/20 h-80 rounded-2xl mb-4"></div>
                    <div className="bg-gray-700/20 h-6 w-3/4 rounded mb-2"></div>
                    <div className="bg-gray-700/20 h-4 w-1/2 rounded mb-2"></div>
                    <div className="bg-gray-700/20 h-4 w-1/4 rounded"></div>
                  </div>
                ))
              ) : (
                featuredItems.map((item) => (
                  <div key={item.mainId} className="group">
                    <div className="relative overflow-hidden rounded-2xl mb-4 bg-[#051923]/80 backdrop-blur-sm">
                      {getBestImage(item) ? (
                        <img 
                          src={getBestImage(item)}
                          alt={item.displayName}
                          className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-80 bg-[#051923]/80 flex items-center justify-center p-4 text-center">
                          <span className="text-gray-300 font-semibold">{item.displayName}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <Link 
                            to="/fortnite-shop" 
                            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <ShoppingCart className="w-5 h-5" />
                            {t.viewInStore}
                          </Link>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors duration-300">
                      {item.displayName}
                    </h3>
                    <p className="text-gray-400 mb-2">{item.mainType}</p>
                    <p className="text-primary-400 font-bold text-lg">{item.price.finalPrice} V-Bucks</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Notificaciones de Compra */}
        <div className={`fixed bottom-8 left-8 z-50 transition-all duration-500 transform ${showNotification ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="bg-[#051923]/90 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-primary-500/20 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {censorUsername(purchaseNotifications[currentNotificationIndex].username)}
                </p>
                <p className="text-gray-400 text-sm">
                  compró {purchaseNotifications[currentNotificationIndex].item}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  hace {purchaseNotifications[currentNotificationIndex].time}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;