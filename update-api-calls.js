#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const srcDir = path.join(__dirname, 'src');

// Files to update
const filesToUpdate = [
  'src/pages/AdminDashboard.jsx',
  'src/pages/AdminProductDetail.jsx',
  'src/pages/ProductDetailView.jsx',
  'src/pages/Products.jsx',
  'src/pages/AddToCart.jsx',
  'src/pages/Payment.jsx',
  'src/pages/PaymentSuccess.jsx',
  'src/pages/AdminAnnouncements.jsx',
  'src/pages/Announcements.jsx'
];

// Replacements to make
const replacements = [
  // Replace hardcoded API URLs
  {
    from: /http:\/\/localhost:5000\/api\//g,
    to: "getApiUrl('/api/"
  },
  {
    from: /'http:\/\/localhost:5000\/api\/([^']+)'/g,
    to: "getApiUrl('/api/$1')"
  },
  {
    from: /`http:\/\/localhost:5000\/api\/([^`]+)`/g,
    to: "getApiUrl('/api/$1')"
  },
  // Replace hardcoded image URLs
  {
    from: /http:\/\/localhost:5000\$\{([^}]+)\}/g,
    to: "getImageUrl($1)"
  },
  {
    from: /`http:\/\/localhost:5000\$\{([^}]+)\}`/g,
    to: "getImageUrl($1)"
  },
  // Replace BASE_URL definitions
  {
    from: /const BASE_URL = 'http:\/\/localhost:5000';/g,
    to: "// BASE_URL handled by getApiUrl utility"
  },
  {
    from: /const BASE_URL = "http:\/\/localhost:5000";/g,
    to: "// BASE_URL handled by getApiUrl utility"
  }
];

// Add import statement
const addImportStatement = (content) => {
  if (content.includes("import { getApiUrl, getImageUrl } from '../utils/api';")) {
    return content;
  }
  
  const importLines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < importLines.length; i++) {
    if (importLines[i].trim().startsWith('import')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex >= 0) {
    importLines.splice(lastImportIndex + 1, 0, "import { getApiUrl, getImageUrl } from '../utils/api';");
  }
  
  return importLines.join('\n');
};

// Process each file
filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`Processing ${filePath}...`);
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Add import statement
    content = addImportStatement(content);
    
    // Apply replacements
    replacements.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });
    
    // Write back
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated ${filePath}`);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n🎉 All files updated successfully!');
console.log('\n📝 Next steps:');
console.log('1. Update .env.production with your actual Hobby Dyno URL');
console.log('2. Test locally with: npm run dev');
console.log('3. Deploy to Vercel with: npm run build');
