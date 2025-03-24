import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

interface OrderSuccessData {
  message: string;
  orderId: string;
  username: string;
  itemName: string;
  price: number;
}

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [orderData, setOrderData] = useState<OrderSuccessData | null>(null);

  useEffect(() => {
    const successData = localStorage.getItem('orderSuccess');
    if (!successData) {
      navigate('/');
      return;
    }

    setOrderData(JSON.parse(successData));

    // Limpiar el localStorage después de 5 segundos
    const timer = setTimeout(() => {
      localStorage.removeItem('orderSuccess');
      navigate('/', { 
        state: { 
          message: t.orderSuccess,
          type: 'success'
        }
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, t]);

  if (!orderData) return null;

  return (
    <div className="min-h-screen bg-[#003554] pt-24 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-[#051923] p-8 rounded-2xl shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-900/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{t.orderSuccess}</h3>
            <div className="bg-[#051923] border border-gray-700 p-4 rounded-xl mb-4">
              <div className="text-left space-y-2">
                <p className="text-gray-300">
                  <span className="font-medium text-white">{t.fortniteUsername}:</span> {orderData.username}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium text-white">{t.item}:</span> {orderData.itemName}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium text-white">{t.price}:</span> {orderData.price} {t.vbucks}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium text-white">{t.orderId}:</span> {orderData.orderId}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium text-white">{t.status}:</span> 
                  <span className="text-green-400"> {t.orderSuccess}</span>
                </p>
              </div>
            </div>
            <p className="text-gray-300 mb-2">{orderData.message}</p>
            <p className="text-gray-400 text-sm mt-4">{t.redirectingToHome}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess; 