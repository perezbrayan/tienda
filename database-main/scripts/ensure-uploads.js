const fs = require('fs');
const path = require('path');

const directories = [
  '../uploads',
  '../uploads/products',
  '../uploads/games',
  '../uploads/roblox',
  '../uploads/payment_proofs'
];

function ensureDirectoryExists(dir) {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    console.log(`Creando directorio: ${fullPath}`);
    fs.mkdirSync(fullPath, { recursive: true });
  } else {
    console.log(`El directorio ya existe: ${fullPath}`);
  }
}

console.log('Verificando directorios de uploads...');
directories.forEach(ensureDirectoryExists);
console.log('Verificación completada.'); 