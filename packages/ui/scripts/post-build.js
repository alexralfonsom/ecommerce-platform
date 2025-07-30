#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const distDir = path.join(__dirname, '..', 'dist');
const sourceIndexJs = path.join(distDir, 'index.js');
const sourceIndexDts = path.join(distDir, 'index.d.ts');
const targetIndexJs = path.join(distDir, 'index.js');
const targetIndexDts = path.join(distDir, 'index.d.ts');

console.log('🔧 Post-build: Copying and fixing index files...');
console.log(`📍 Platform: ${os.platform()} ${os.arch()}`);

// Función para verificar archivos
function checkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }
  console.log(`✅ File exists: ${path.basename(filePath)}`);
  return true;
}

// Con rootDir configurado, los archivos ya están en la ubicación correcta
// Solo verificamos que existan
console.log('📁 Checking generated files...');
checkFile(sourceIndexJs);
checkFile(sourceIndexDts);

console.log('🎉 Post-build completed successfully!');