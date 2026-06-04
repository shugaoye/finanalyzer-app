import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseIconsDir = path.join(__dirname, '../../node_modules/@openbb/ui/src/icons');
const outputPath = path.join(__dirname, '../public/spritemap.svg');

const iconDirs = ['custom', 'untitled-ui', '22', '41', '64', 'brands'];

let symbols = '';

iconDirs.forEach(dir => {
  const iconsDir = path.join(baseIconsDir, dir);
  if (fs.existsSync(iconsDir)) {
    const iconFiles = fs.readdirSync(iconsDir).filter(file => file.endsWith('.svg'));
    iconFiles.forEach(file => {
      const iconName = path.basename(file, '.svg');
      const content = fs.readFileSync(path.join(iconsDir, file), 'utf-8');
      
      let svgContent = content
        .replace(/<\?xml[^?]*\?>/g, '')
        .replace(/<!DOCTYPE[^>]*>/g, '')
        .replace(/<svg[^>]*>/g, '')
        .replace(/<\/svg>/g, '')
        .trim();
      
      symbols += `<symbol id="sprite-${iconName}" viewBox="0 0 24 24">${svgContent}</symbol>\n`;
    });
  }
});

const spritemap = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
${symbols}</svg>`;

fs.writeFileSync(outputPath, spritemap);
console.log(`Generated spritemap with icons from ${iconDirs.length} directories at ${outputPath}`);
