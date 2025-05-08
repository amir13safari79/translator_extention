const fs = require('fs');
const path = require('path');

// Simple SVG template for icon
const createSvg = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#4285f4"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${Math.floor(size * 0.6)}" fill="white" text-anchor="middle" dominant-baseline="middle">ف</text>
</svg>
`;

// Function to convert SVG string to PNG data URL (simple placeholder for now)
function svgToDataURL(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Ensure the icons directory exists
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create the icons in different sizes
const sizes = [16, 48, 128];

sizes.forEach(size => {
  const svg = createSvg(size);
  
  // Create SVG file
  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svg);
  
  // For now, we'll just copy the SVG files to PNG files as placeholders
  fs.copyFileSync(
    path.join(iconsDir, `icon${size}.svg`),
    path.join(iconsDir, `icon${size}.png`)
  );
  
  console.log(`Created icon${size}.png`);
});

// Also create copies for the dist directory
const distIconsDir = path.join(__dirname, 'dist', 'icons');
if (!fs.existsSync(distIconsDir)) {
  fs.mkdirSync(distIconsDir, { recursive: true });
}

sizes.forEach(size => {
  fs.copyFileSync(
    path.join(iconsDir, `icon${size}.png`),
    path.join(distIconsDir, `icon${size}.png`)
  );
  console.log(`Copied icon${size}.png to dist/icons/`);
}); 