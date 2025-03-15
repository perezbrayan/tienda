import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Grid } from '@mui/material';
import { 
  MdCurrencyExchange, 
  MdShoppingCart,
  MdSupervisorAccount,
  MdShoppingBasket,
  MdGames,
  MdGamepad,
  MdReceipt,
  MdAddBox
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { UserManagement } from '../components/admin/UserManagement';
import { VBucksManagement } from '../components/admin/VBucksManagement';
import { FortniteOrdersManagement } from '../components/admin/FortniteOrdersManagement';
import { GameProductsManagement } from '../components/admin/GameProductsManagement';
import { RobloxProductsManagement } from '../components/admin/RobloxProductsManagement';
import { PaymentProofsManagement } from '../components/admin/PaymentProofsManagement';
import { ExtrasProductsManagement } from '../components/admin/ExtrasProductsManagement';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  const handleCardClick = (section: string) => {
    setSelectedSection(section);
  };

  const renderSection = () => {
    switch (selectedSection) {
      case 'usuarios':
        return <UserManagement />;
      case 'vbucks':
        return <VBucksManagement />;
      case 'fortnite':
        return <FortniteOrdersManagement />;
      case 'juegos':
        return <GameProductsManagement />;
      case 'roblox':
        return <RobloxProductsManagement />;
      case 'comprobantes':
        return <PaymentProofsManagement />;
      case 'extras':
        return <ExtrasProductsManagement />;
      default:
        return null;
    }
  };

  const menuItems = [
    {
      id: 'vbucks',
      title: 'GESTIONAR VBUCKS',
      description: 'Configura y actualiza las tasas de VBucks',
      icon: <MdCurrencyExchange size={48} style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }} />,
      buttonText: 'Gestionar VBucks'
    },
    {
      id: 'usuarios',
      title: 'GESTIONAR USUARIOS',
      description: 'Administra los usuarios y sus permisos',
      icon: <MdSupervisorAccount size={48} style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }} />,
      buttonText: 'Gestionar Usuarios'
    },
    {
      id: 'fortnite',
      title: 'GESTIONAR ÓRDENES',
      description: 'Administra las órdenes de Fortnite',
      icon: <MdShoppingBasket size={48} style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }} />,
      buttonText: 'Gestionar Órdenes'
    },
    {
      id: 'juegos',
      title: 'GESTIONAR JUEGOS',
      description: 'Administra los productos de otros juegos',
      icon: <MdGames size={48} style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }} />,
      buttonText: 'Gestionar Juegos'
    },
    {
      id: 'roblox',
      title: 'GESTIONAR ROBLOX',
      description: 'Administra los productos de Roblox',
      icon: <MdGamepad size={48} style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }} />,
      buttonText: 'Gestionar Roblox'
    },
    {
      id: 'comprobantes',
      title: 'GESTIONAR COMPROBANTES',
      description: 'Administra los comprobantes de pago',
      icon: <MdReceipt size={48} style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }} />,
      buttonText: 'Gestionar Comprobantes'
    },
    {
      id: 'extras',
      title: 'GESTIONAR EXTRAS',
      description: 'Administra los productos extras',
      icon: <MdAddBox size={48} style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }} />,
      buttonText: 'Gestionar Extras'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', pt: 12 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <Typography variant="h4" sx={{ color: '#1a1a1a', fontWeight: 'bold' }}>
            PANEL DE ADMINISTRACIÓN
          </Typography>
          <Button
            onClick={handleLogout}
            sx={{
              color: '#00bcd4',
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                bgcolor: 'transparent',
                opacity: 0.8
              }
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>

        {selectedSection ? (
          <Box>
            <Button
              onClick={() => setSelectedSection(null)}
              sx={{
                mb: 3,
                color: '#00bcd4',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'transparent',
                  opacity: 0.8
                }
              }}
            >
              Volver al menú
            </Button>
            {renderSection()}
          </Box>
        ) : (
          <Grid container spacing={4}>
            {menuItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Box
                  sx={{
                    bgcolor: '#f8f9fa',
                    borderRadius: 3,
                    p: 4,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => handleCardClick(item.id)}
                >
                  <Box sx={{ 
                    color: '#00bcd4', 
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    bgcolor: 'rgba(0, 188, 212, 0.1)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }}>
                    {item.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#1a1a1a',
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666666',
                      mb: 3
                    }}
                  >
                    {item.description}
                  </Typography>
                  <Button
                    fullWidth
                    sx={{
                      bgcolor: '#1a1a1a',
                      color: 'white',
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: '#333333'
                      }
                    }}
                  >
                    {item.buttonText}
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default AdminPanel;
