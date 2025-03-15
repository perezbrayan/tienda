import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { apiConfig } from '../config/api';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { Send, Bot as BotIcon } from 'lucide-react';

const Bot: React.FC = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error(t.enterUsername);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiConfig.botURL}/bot2/api/friend-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          username,
          botId: 'bot1',
          sendFromAllBots: true
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t.friendRequestSent);
        setUsername('');
      } else {
        toast.error(data.error || t.friendRequestError);
      }
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      toast.error(t.friendRequestError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#003554] flex items-center p-4">
      <div className="container mx-auto">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-8">
          {/* Sección izquierda - Imagen decorativa */}
          <div className="w-full lg:flex-1 relative mt-8 lg:mt-0">
            <div className="relative w-full aspect-square max-w-xl mx-auto">
              {/* Efecto de brillo detrás de la imagen */}
              <div className="absolute inset-0 bg-primary-500/20 blur-[100px] rounded-full"></div>
              
              {/* Imagen del item de Fortnite */}
              <img
                src="https://i.postimg.cc/hvCg7M0R/Logo-1.png"
                alt="GameStore Logo"
                className="relative z-10 w-full h-full object-contain"
                style={{
                  maxHeight: '500px',
                  width: 'auto',
                  margin: 'auto'
                }}
              />
              
              {/* Detalles decorativos */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
              
              {/* Texto decorativo */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                <span className="text-primary-400 text-sm font-semibold px-4 py-1 rounded-full bg-primary-500/10 backdrop-blur-sm border border-primary-500/20">
                  GameStore
                </span>
              </div>
            </div>
          </div>

          {/* Sección derecha - Formulario */}
          <div className="w-full lg:flex-1 max-w-xl">
            <div className="bg-[#051923] rounded-2xl p-8 border border-primary-500/20 shadow-lg backdrop-blur-sm relative overflow-hidden">
              {/* Patrón de fondo */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                  backgroundSize: '20px 20px'
                }}></div>
              </div>

              {/* Contenido del formulario */}
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-primary-500/20 rounded-xl">
                    <BotIcon className="w-8 h-8 text-primary-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      Bot Accounts
                    </h1>
                    <p className="text-gray-400 mt-1">
                      Ready to receive gifts
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className="relative">
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-5 py-4 bg-[#051923] border border-primary-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        placeholder={t.usernamePlaceholder}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t.sendingRequest}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>{t.sendFriendRequest}</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Detalles adicionales */}
                <div className="mt-6 pt-6 border-t border-primary-500/10">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Bots online and ready to send gifts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer 
        position="bottom-right"
        theme="dark"
      />
    </div>
  );
};

export default Bot;

// Agregar al archivo de estilos (index.css)
/*
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
*/