import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="bg-[#051923] text-gray-300 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-4">{t.home}</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">{t.home}</Link></li>
              <li><Link to="/fortnite-shop" className="hover:text-primary-400 transition-colors">{t.fortnite}</Link></li>
              <li><Link to="/crew" className="hover:text-primary-400 transition-colors">{t.crew}</Link></li>
            </ul>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-4">{t.followUs}</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors flex items-center justify-center">
                  <i className="fab fa-instagram mr-2"></i> Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="text-center mt-8 pt-8 border-t border-gray-800">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} GameStore. {t.allRightsReserved}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
