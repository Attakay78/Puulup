#!/usr/bin/env node

/**
 * This script helps optimize images for production
 * To use it, install sharp:
 * npm install --save-dev sharp
 * 
 * Then run:
 * node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('Image optimization helper script');
console.log('--------------------------------');
console.log('');
console.log('This script will help you optimize images for production.');
console.log('To run full automatic optimization, please install sharp:');
console.log('');
console.log('  npm install --save-dev sharp');
console.log('');
console.log('Then you can run this script with node:');
console.log('');
console.log('  node scripts/optimize-images.js');
console.log('');

// Check if sharp is installed
try {
  // This will throw if sharp is not installed
  require.resolve('sharp');
  
  console.log('Sharp is installed. Proceeding with optimization...');
  console.log('');
  
  // Example code for how to use sharp (uncomment to use)
  /*
  const sharp = require('sharp');
  const sourceFile = path.join(__dirname, '../public/puulup-logo.png');
  const sizes = [32, 48, 96, 192, 512];
  const outputDir = path.join(__dirname, '../public/images/optimized');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Create optimized versions of the logo
  Promise.all([
    // Favicon
    sharp(sourceFile)
      .resize(32, 32)
      .png({ quality: 80 })
      .toFile(path.join(outputDir, 'favicon.png')),
    
    // Mobile icon
    sharp(sourceFile)
      .resize(48, 48)
      .png({ quality: 80 })
      .toFile(path.join(outputDir, 'mobile.png')),
    
    // Primary icon
    sharp(sourceFile)
      .resize(96, 96)
      .png({ quality: 80 })
      .toFile(path.join(outputDir, 'primary.png')),
    
    // 192x192 icon
    sharp(sourceFile)
      .resize(192, 192)
      .png({ quality: 80 })
      .toFile(path.join(outputDir, 'icon-192.png')),
    
    // 512x512 icon
    sharp(sourceFile)
      .resize(512, 512)
      .png({ quality: 80 })
      .toFile(path.join(outputDir, 'icon-512.png'))
  ])
    .then(() => {
      console.log('All images have been optimized and saved to public/images/optimized/');
    })
    .catch(err => {
      console.error('Error optimizing images:', err);
    });
  */
  
  console.log('Image optimization guide:');
  console.log('');
  console.log('1. Use the original logo at public/puulup-logo.png');
  console.log('2. Create optimized versions at these sizes:');
  console.log('   - favicon.png: 32x32px');
  console.log('   - mobile.png: 48x48px');
  console.log('   - primary.png: 96x96px');
  console.log('   - icon-192.png: 192x192px');
  console.log('   - icon-512.png: 512x512px');
  console.log('3. Save all optimized versions to public/images/optimized/');
  console.log('4. Make sure each file is properly compressed (PNG or WebP format)');
  console.log('');
  
} catch (e) {
  console.log('Sharp is not installed. Manual optimization instructions:');
  console.log('');
  console.log('1. Use an image editor like GIMP, Photoshop, or online tools');
  console.log('2. Create versions of your logo at these sizes:');
  console.log('   - 32x32px (favicon.png)');
  console.log('   - 48x48px (mobile.png)');
  console.log('   - 96x96px (primary.png)');
  console.log('   - 192x192px (icon-192.png)');
  console.log('   - 512x512px (icon-512.png)');
  console.log('3. Save them to public/images/optimized/');
  console.log('4. Compress the images using a tool like TinyPNG.com');
  console.log('');
  console.log('Recommended online tools:');
  console.log('- https://tinypng.com/ (for compression)');
  console.log('- https://squoosh.app/ (for resizing and compression)');
  console.log('');
}

// Check sizes of existing images
const imageSizes = [];
const imageDir = path.join(__dirname, '../public/images/optimized');

if (fs.existsSync(imageDir)) {
  const files = fs.readdirSync(imageDir);
  
  files.forEach(file => {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.webp')) {
      const filePath = path.join(imageDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      
      imageSizes.push({
        file,
        size: `${sizeKB} KB`,
        tooLarge: sizeKB > 30
      });
    }
  });
  
  if (imageSizes.length > 0) {
    console.log('Current image sizes:');
    console.log('');
    
    imageSizes.forEach(image => {
      const sizeInfo = image.tooLarge 
        ? `${image.size} (❌ too large, aim for under 30KB)` 
        : `${image.size} (✅ good)`;
      
      console.log(`- ${image.file}: ${sizeInfo}`);
    });
    
    console.log('');
  } else {
    console.log('No optimized images found in public/images/optimized/');
    console.log('Please create optimized versions of your images.');
    console.log('');
  }
} else {
  console.log('The optimized images directory does not exist yet.');
  console.log('Please create public/images/optimized/ and add your optimized images.');
  console.log('');
} 