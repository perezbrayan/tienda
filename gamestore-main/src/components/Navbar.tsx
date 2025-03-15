import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Gamepad2, Home, Gift, Sparkles, Tag, Trash2, MessageSquare, Users, LogOut, Globe, Trophy, Sword, Gamepad } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const NavLink = ({ to, icon, children }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 ${
        isActive 
          ? 'text-primary-400 bg-primary-500/20 font-medium' 
          : 'text-gray-300 hover:text-primary-400 hover:bg-primary-500/10'
      }`}
    >
      {icon}
      <span className="text-sm">{children}</span>
    </Link>
  );
};

interface UserDropdownProps {
  isOpen: boolean;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="absolute right-0 mt-2 w-72 bg-[#00171f] rounded-xl shadow-lg py-2 z-50 border border-gray-800">
        <div className="px-4 py-3">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">{t.welcome}</h3>
            <p className="text-sm text-gray-300 mb-4">{t.loginToContinue}</p>
            <Link 
              to="/login" 
              className="block w-full px-4 py-2 mb-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t.login}
            </Link>
            <Link 
              to="/register" 
              className="block w-full px-4 py-2 text-primary-400 bg-primary-500/20 rounded-lg hover:bg-primary-500/30 transition-colors"
            >
              {t.register}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 mt-2 w-72 bg-[#00171f] rounded-xl shadow-lg py-2 z-50 border border-gray-800">
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
            <User className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{user.username}</h3>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{t.logout}</span>
        </button>
      </div>
    </div>
  );
};

interface CartItem {
  mainId: string;
  displayName: string;
  price: {
    finalPrice: number;
  };
  quantity: number;
  image: string;
}

interface LanguageDropdownProps {
  isOpen: boolean;
}

interface CurrencyDropdownProps {
  isOpen: boolean;
}

interface CartDropdownProps {
  isOpen: boolean;
  onRemoveItem: (id: string) => void;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ isOpen }) => {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-48 bg-[#00171f] rounded-xl shadow-lg py-2 z-50 border border-gray-800">
      {(['es', 'en', 'tw'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`w-full px-4 py-2 text-left hover:bg-primary-500/10 transition-colors ${
            language === lang ? 'text-primary-400 font-medium' : 'text-gray-300'
          }`}
        >
          {t.languageNames[lang]}
        </button>
      ))}
    </div>
  );
};

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({ isOpen }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'GTQ' | 'USD' | 'COP'>('GTQ');

  if (!isOpen) return null;

  const handleCurrencyChange = (currency: 'GTQ' | 'USD' | 'COP') => {
    setSelectedCurrency(currency);
    // Emitir un evento personalizado para que FortniteShop lo escuche
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: currency }));
  };

  return (
    <div className="absolute right-0 mt-2 w-48 bg-[#00171f] rounded-xl shadow-lg py-2 z-50 border border-gray-800">
      <button
        onClick={() => handleCurrencyChange('GTQ')}
        className={`w-full px-4 py-2 text-left hover:bg-primary-500/10 transition-colors ${
          selectedCurrency === 'GTQ' ? 'text-primary-400 font-medium' : 'text-gray-300'
        }`}
      >
        Quetzales (GTQ)
      </button>
      <button
        onClick={() => handleCurrencyChange('USD')}
        className={`w-full px-4 py-2 text-left hover:bg-primary-500/10 transition-colors ${
          selectedCurrency === 'USD' ? 'text-primary-400 font-medium' : 'text-gray-300'
        }`}
      >
        US Dollar (USD)
      </button>
      <button
        onClick={() => handleCurrencyChange('COP')}
        className={`w-full px-4 py-2 text-left hover:bg-primary-500/10 transition-colors ${
          selectedCurrency === 'COP' ? 'text-primary-400 font-medium' : 'text-gray-300'
        }`}
      >
        Pesos (COP)
      </button>
    </div>
  );
};

const CartDropdown: React.FC<CartDropdownProps> = ({ isOpen, onRemoveItem }) => {
  const { items: cartItems } = useCart();
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();

  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + (item.price.finalPrice * item.quantity), 0);

  return (
    <div className="absolute right-0 mt-2 w-96 bg-[#00171f] rounded-xl shadow-lg py-4 z-50 border border-gray-800">
      <div className="px-4">
        <h3 className="text-lg font-medium text-white">{t.cart}</h3>
      </div>

      <div className="mt-4 max-h-96 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-gray-300">{t.emptyCart}</p>
            <p className="text-sm text-gray-400 mt-1">{t.addItems}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {cartItems.map((item) => (
              <div key={item.mainId} className="px-4 py-3 flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.displayName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">
                    {item.displayName}
                  </h4>
                  <p className="mt-1 text-sm text-gray-400">
                    {item.price.finalPrice} {t.vbucks}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.mainId)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="mt-4 px-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-white">{t.total}</span>
            <span className="font-medium text-white">{total} {t.vbucks}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t.checkout}
          </button>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const { items: cartItems, removeItem, isOpen: isCartOpen, toggleCart, closeCart } = useCart();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(cartDropdownRef, () => closeCart());
  useClickOutside(languageDropdownRef, () => setIsLanguageOpen(false));
  useClickOutside(currencyDropdownRef, () => setIsCurrencyOpen(false));

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const navLinks = [
    { 
      to: "/", 
      icon: <Home className="w-5 h-5 stroke-[1.5]" />, 
      label: t.home 
    },
    { 
      to: "/crew", 
      icon: <Users className="w-5 h-5 stroke-[1.5]" />, 
      label: t.crew 
    },
    { 
      to: "/bot", 
      icon: <MessageSquare className="w-5 h-5 stroke-[1.5]" />, 
      label: t.bot 
    },
    { 
      to: "/fortnite-shop", 
      icon: <Gamepad2 className="w-5 h-5 stroke-[1.5]" />, 
      label: t.fortnite 
    },
  ];

  return (
    <header className="w-full fixed top-0 z-50 px-4 py-3">
      <nav className="container mx-auto">
        <div className="mx-4 bg-[#00171f]/80 backdrop-blur-md shadow-lg rounded-2xl border border-white/10">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Logo and Navigation Links */}
            <div className="flex items-center gap-8">
              <Link 
                to="/" 
                className="flex-shrink-0 flex items-center"
              >
                <img src="https://i.postimg.cc/hvCg7M0R/Logo-1.png" alt="GameStore" className="h-10 w-auto" />
              </Link>

              {/* Navigation Links */}
              <div className="hidden lg:flex items-center gap-2">
                {navLinks.map((link, index) => 
                  link.to === "/fortnite-shop" ? (
                    <div key={index} className="relative group">
                      <NavLink to={link.to} icon={link.icon}>
                        {link.label}
                      </NavLink>
                      <div className="absolute left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div className="bg-[#051923] rounded-xl shadow-lg border border-gray-800 overflow-hidden">
                          <div className="p-2">
                            <button
                              onClick={() => {
                                const event = new CustomEvent('gameSelected', { detail: 'fortnite' });
                                window.dispatchEvent(event);
                                navigate('/fortnite-shop?game=fortnite');
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-primary-700/20 transition-all"
                            >
                              <div className="p-1 rounded bg-primary-700/20">
                                <Trophy className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium">Fortnite</span>
                            </button>
                            <button
                              onClick={() => {
                                const event = new CustomEvent('gameSelected', { detail: 'roblox' });
                                window.dispatchEvent(event);
                                navigate('/fortnite-shop?game=roblox');
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-primary-700/20 transition-all"
                            >
                              <div className="p-1 rounded bg-primary-700/20">
                                <Sword className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium">Roblox</span>
                            </button>
                            <button
                              onClick={() => {
                                const event = new CustomEvent('gameSelected', { detail: 'supercell' });
                                window.dispatchEvent(event);
                                navigate('/fortnite-shop?game=supercell');
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-primary-700/20 transition-all"
                            >
                              <div className="p-1 rounded bg-primary-700/20">
                                <Trophy className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium">SuperCell</span>
                            </button>
                            <button
                              onClick={() => {
                                const event = new CustomEvent('gameSelected', { detail: 'streaming' });
                                window.dispatchEvent(event);
                                navigate('/fortnite-shop?game=streaming');
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-primary-700/20 transition-all"
                            >
                              <div className="p-1 rounded bg-primary-700/20">
                                <Gamepad className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium">Streaming</span>
                            </button>
                            <button
                              onClick={() => {
                                const event = new CustomEvent('gameSelected', { detail: 'leagueoflegends' });
                                window.dispatchEvent(event);
                                navigate('/fortnite-shop?game=leagueoflegends');
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-primary-700/20 transition-all"
                            >
                              <div className="p-1 rounded bg-primary-700/20">
                                <Sword className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium">League of Legends</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <NavLink key={index} to={link.to} icon={link.icon}>
                      {link.label}
                    </NavLink>
                  )
                )}
              </div>
            </div>

            {/* Desktop Actions - Right Side */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Selector de moneda */}
              <div ref={currencyDropdownRef} className="relative">
                <button
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                  className="p-2 text-gray-300 hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-500/10"
                >
                  <Tag className="w-5 h-5" />
                </button>
                <CurrencyDropdown isOpen={isCurrencyOpen} />
              </div>

              {/* Selector de idioma */}
              <div ref={languageDropdownRef} className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="p-2 text-gray-300 hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-500/10"
                >
                  <Globe className="w-5 h-5" />
                </button>
                <LanguageDropdown isOpen={isLanguageOpen} />
              </div>

              {/* Cart Button with Dropdown */}
              <div className="relative" ref={cartDropdownRef}>
                <button 
                  className="p-2.5 hover:bg-white/5 rounded-xl transition-all duration-300 relative flex items-center gap-2 text-gray-300 hover:text-primary-400"
                  onClick={toggleCart}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
                <CartDropdown isOpen={isCartOpen} onRemoveItem={removeItem} />
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2.5 hover:bg-white/5 rounded-xl transition-all duration-300 flex items-center gap-2 text-gray-300 hover:text-primary-400"
                >
                  <User className="w-5 h-5" />
                </button>
                <UserDropdown isOpen={isUserMenuOpen} />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 hover:bg-white/5 rounded-xl transition-all duration-300 text-gray-300 hover:text-primary-400"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden px-4 pb-4">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} icon={link.icon}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;