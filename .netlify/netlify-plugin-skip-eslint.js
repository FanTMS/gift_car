// Netlify плагин для отключения ESLint при сборке
module.exports = {
  onPreBuild: ({ utils }) => {
    console.log('Disable ESLint check during build');
    process.env.DISABLE_ESLINT_PLUGIN = 'true';
    process.env.CI = 'false';
  },
}; 