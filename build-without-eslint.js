// Скрипт для сборки без ESLint
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.CI = 'false';

// Запускаем стандартный react-scripts build
const { spawnSync } = require('child_process');
console.log('Starting build with ESLint disabled...');
const result = spawnSync('react-scripts', ['build'], { 
  stdio: 'inherit',
  env: { ...process.env }
});

process.exit(result.status); 