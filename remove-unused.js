const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Files with issues based on the Netlify error log
const filesToFix = [
  'src/components/CarSpecifications.tsx',
  'src/components/CarSpecificationsIcons.tsx',
  'src/components/CarSpecificationsModal.tsx',
  'src/components/CarSpecificationsSimple.tsx',
  'src/components/WinnersList.tsx',
  'src/components/admin/AdminsManager.tsx',
  'src/components/admin/AppSettingsForm.tsx',
  'src/components/admin/CarSpecificationsForm.tsx',
  'src/components/admin/CompaniesManager.tsx',
  'src/components/admin/CompanyForm.tsx',
  'src/components/admin/SuperAdminAssigner.tsx',
  'src/components/admin/TransactionsManager.tsx',
  'src/components/admin/WalletsManager.tsx',
  'src/components/admin/WinnersManager.tsx',
  'src/components/cards/CarCard.tsx',
  'src/components/company/CompanySelector.tsx',
  'src/components/layout/AppHeader.tsx',
  'src/components/layout/BottomNavigation.tsx',
  'src/components/layout/MainLayout.tsx',
  'src/components/profile/ModernProfileHeader.tsx',
  'src/components/profile/ModernProfileInfo.tsx',
  'src/components/profile/ModernTabPanel.tsx',
  'src/components/profile/ModernTabs.tsx',
  'src/components/profile/TicketHistory.tsx',
  'src/components/ui/card.tsx',
  'src/components/wallet/TelegramWalletConnect.tsx',
  'src/components/wallet/WalletWidget.tsx',
  'src/context/FirebaseContext.tsx',
  'src/context/ThemeContext.tsx',
  'src/context/UserContext.tsx',
  'src/firebase/migrations.ts',
  'src/firebase/services.ts',
  'src/pages/AdminPage.tsx',
  'src/pages/HomePage.tsx',
  'src/pages/PaymentEmulatorPage.tsx',
  'src/pages/ProfilePage.tsx',
  'src/pages/RaffleDetailPage.tsx',
  'src/pages/SettingsPage.tsx',
  'src/pages/WalletPage.tsx',
  'src/pages/admin/SuperAdminPage.tsx',
  'src/pages/wallet/TelegramWalletPage.tsx',
  'src/pages/wallet/WalletHistoryPage.tsx',
  'src/services/payment/PaymentProcessorService.ts'
];

// Function to fix React Hook dependencies
function fixReactHookDependencies(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content;
  
  // Find useEffect hooks with missing dependencies
  const useEffectRegex = /useEffect\(\(\) => {([\s\S]*?)}, \[(.*?)\]\)/g;
  const matches = [...content.matchAll(useEffectRegex)];
  
  for (const match of matches) {
    const hookBody = match[1];
    const dependencies = match[2];
    
    // Extract the function names referenced in the hook body
    const functionRegex = /(\w+)\(/g;
    const functionMatches = [...hookBody.matchAll(functionRegex)];
    const functionNames = functionMatches
      .map(m => m[1])
      .filter(name => 
        // Filter out common built-in functions
        !['setTimeout', 'clearTimeout', 'console', 'fetch', 'JSON'].includes(name)
      );
    
    // Extract variable names referenced in the hook body
    const variableRegex = /(\b[a-zA-Z_$][a-zA-Z0-9_$]*\b)(?!\s*\()/g;
    const variableMatches = [...hookBody.matchAll(variableRegex)];
    const variableNames = variableMatches
      .map(m => m[1])
      .filter(name => 
        // Filter out JavaScript keywords and common variables
        !['if', 'else', 'return', 'const', 'let', 'var', 'function', 'async', 'await', 'try', 'catch', 'finally', 'this', 'true', 'false', 'null', 'undefined'].includes(name)
      );
    
    // Combine the dependencies
    const existingDeps = dependencies.split(',').map(d => d.trim()).filter(d => d);
    const allDeps = [...new Set([...existingDeps, ...functionNames, ...variableNames])];
    
    // Update the useEffect hook with all dependencies
    const newDependencies = allDeps.join(', ');
    const newUseEffect = `useEffect(() => {${match[1]}}, [${newDependencies}])`;
    
    // Replace the original hook with the updated one
    updatedContent = updatedContent.replace(match[0], newUseEffect);
  }
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Fixed React Hook dependencies in ${filePath}`);
  }
}

// Function to fix the no-mixed-operators issue
function fixNoMixedOperators(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content;
  
  // Find lines with mixed operators (specifically && and ||)
  // This is a simple approach and might not catch all cases
  const mixedOperatorsRegex = /([^\s(]+)\s*&&\s*([^\s)]+)\s*\|\|\s*([^\s)]+)/g;
  updatedContent = content.replace(mixedOperatorsRegex, '($1 && $2) || $3');
  
  // Also check for the reverse pattern
  const reverseMixedOperatorsRegex = /([^\s(]+)\s*\|\|\s*([^\s)]+)\s*&&\s*([^\s)]+)/g;
  updatedContent = updatedContent.replace(reverseMixedOperatorsRegex, '($1 || $2) && $3');
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Fixed mixed operators in ${filePath}`);
  }
}

// Function to remove unused imports and variables
function fixUnusedVarsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let updatedLines = [...lines];
    
    // Step 1: Find unused imports with ESLint
    // First, get the list of unused vars from ESLint
    const unusedVarsOutput = execSync(`npx eslint --format json ${filePath}`).toString();
    let unusedVars = [];
    
    try {
      const eslintResults = JSON.parse(unusedVarsOutput);
      
      if (eslintResults && eslintResults.length > 0) {
        // Extract the unused variable names from the eslint output
        unusedVars = eslintResults[0].messages
          .filter(msg => msg.ruleId === '@typescript-eslint/no-unused-vars')
          .map(msg => msg.message.match(/'([^']+)'/)[1]);
      }
    } catch (e) {
      console.log(`Error parsing ESLint output for ${filePath}: ${e.message}`);
      return;
    }
    
    if (unusedVars.length === 0) {
      console.log(`No unused variables found in ${filePath}`);
      return;
    }
    
    console.log(`Found ${unusedVars.length} unused variables in ${filePath}: ${unusedVars.join(', ')}`);
    
    // Step 2: Process imports - naively remove the unused imports
    // This is a simplified approach and may not work for all import styles
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
    let importMatch;
    
    while ((importMatch = importRegex.exec(content)) !== null) {
      const importLine = importMatch[0];
      const importedItems = importMatch[1].split(',').map(item => item.trim());
      const importSource = importMatch[2];
      
      // Filter out unused imports
      const usedImports = importedItems.filter(item => !unusedVars.includes(item));
      
      // If all imports are unused, remove the entire line
      if (usedImports.length === 0) {
        updatedLines = updatedLines.filter(line => !line.includes(importLine));
        console.log(`Removed entire import: ${importLine}`);
      } 
      // Otherwise, update the import statement with only used imports
      else if (usedImports.length !== importedItems.length) {
        const updatedImport = `import { ${usedImports.join(', ')} } from '${importSource}'`;
        for (let i = 0; i < updatedLines.length; i++) {
          if (updatedLines[i].includes(importLine)) {
            updatedLines[i] = updatedLines[i].replace(importLine, updatedImport);
            console.log(`Updated import: ${updatedLines[i]}`);
            break;
          }
        }
      }
    }
    
    // Step 3: Handle variable declarations - comment them out
    const varRegex = /const\s+([^=]+)\s*=/g;
    let varMatch;
    
    while ((varMatch = varRegex.exec(content)) !== null) {
      const varName = varMatch[1].trim();
      
      if (unusedVars.includes(varName)) {
        for (let i = 0; i < updatedLines.length; i++) {
          const line = updatedLines[i];
          if (line.includes(`const ${varName} =`)) {
            // Comment out the line with the unused variable
            updatedLines[i] = `// Unused: ${line}`;
            console.log(`Commented out unused variable: ${varName}`);
            break;
          }
        }
      }
    }
    
    // Also handle destructured assignments
    const destructuredRegex = /const\s+{([^}]+)}\s*=/g;
    let destructuredMatch;
    
    while ((destructuredMatch = destructuredRegex.exec(content)) !== null) {
      const vars = destructuredMatch[1].split(',').map(v => v.trim());
      let hasUnused = false;
      
      // Check if any of the destructured variables are unused
      for (const v of vars) {
        if (unusedVars.includes(v)) {
          hasUnused = true;
          break;
        }
      }
      
      if (hasUnused) {
        const originalLine = destructuredMatch[0];
        const usedVars = vars.filter(v => !unusedVars.includes(v));
        
        if (usedVars.length === 0) {
          // If all variables in the destructuring are unused, comment out the line
          for (let i = 0; i < updatedLines.length; i++) {
            if (updatedLines[i].includes(originalLine)) {
              updatedLines[i] = `// Unused: ${updatedLines[i]}`;
              console.log(`Commented out entirely unused destructuring: ${originalLine}`);
              break;
            }
          }
        } else {
          // Otherwise, remove only the unused variables from the destructuring
          for (let i = 0; i < updatedLines.length; i++) {
            if (updatedLines[i].includes(originalLine)) {
              const newDestructuring = `const { ${usedVars.join(', ')} } =`;
              updatedLines[i] = updatedLines[i].replace(originalLine, newDestructuring);
              console.log(`Updated destructuring to remove unused vars: ${updatedLines[i]}`);
              break;
            }
          }
        }
      }
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf8');
    console.log(`Updated ${filePath}`);
    
    // Also fix React Hook dependencies and mixed operators
    fixReactHookDependencies(filePath);
    fixNoMixedOperators(filePath);
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Main execution
console.log('Starting to fix unused variables...');

// Make sure all files exist before proceeding
const existingFiles = filesToFix.filter(file => {
  const exists = fs.existsSync(file);
  if (!exists) {
    console.log(`File not found: ${file}`);
  }
  return exists;
});

// Fix all files
existingFiles.forEach(file => {
  console.log(`Processing ${file}...`);
  fixUnusedVarsInFile(file);
});

console.log('Finished fixing unused variables.'); 