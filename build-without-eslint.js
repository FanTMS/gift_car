// Скрипт для сборки без ESLint
console.log('Starting build with ESLint disabled...');

// Установка переменных окружения
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.CI = 'false';
process.env.EXTEND_ESLINT = 'false';
process.env.SKIP_PREFLIGHT_CHECK = 'true';

// Запускаем стандартный react-scripts build с переопределенной опцией ESLINT_NO_DEV_ERRORS
const { spawnSync } = require('child_process');

// Создаем объект с переменными окружения
const envVars = { 
  ...process.env,
  DISABLE_ESLINT_PLUGIN: 'true',
  CI: 'false',
  EXTEND_ESLINT: 'false',
  SKIP_PREFLIGHT_CHECK: 'true',
  ESLINT_NO_DEV_ERRORS: 'true'
};

console.log('Environment variables set:', {
  DISABLE_ESLINT_PLUGIN: envVars.DISABLE_ESLINT_PLUGIN,
  CI: envVars.CI,
  EXTEND_ESLINT: envVars.EXTEND_ESLINT,
  SKIP_PREFLIGHT_CHECK: envVars.SKIP_PREFLIGHT_CHECK,
  ESLINT_NO_DEV_ERRORS: envVars.ESLINT_NO_DEV_ERRORS
});

// Запускаем сборку с обновленными переменными окружения
const result = spawnSync('react-scripts', ['build'], { 
  stdio: 'inherit',
  env: envVars
});

// Выходим с кодом состояния дочернего процесса
console.log(`Build completed with status code: ${result.status}`);
process.exit(result.status); 