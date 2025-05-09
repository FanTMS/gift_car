# Car Raffle App

This application is a platform for running car raffles.

## Deploying to Netlify

The application is configured to deploy to Netlify with proper ESLint error handling.

### Automatic Deployment

1. Connect your GitHub repository to Netlify
2. Netlify will automatically use the settings in `netlify.toml`
3. The build will run `npm run build:netlify` which automatically:
   - Fixes unused variable errors with our script
   - Sets `CI=false` to prevent treating warnings as errors
   - Builds the React application

### Manual Deployment

If you want to deploy manually:

1. Run `npm run fix:unused` to automatically fix unused variables
2. Run `npm run build` to create a production build
3. Deploy the `build` folder to any static hosting service

## Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. To fix unused variables during development:
   ```
   npm run fix:unused
   ```

## ESLint Configuration

The project is configured to treat ESLint warnings as warnings (not errors) during development, but CI environments might still treat warnings as errors. Our `build:netlify` script handles this automatically.

## Project Structure

- `/src` - Source code of the application
- `/public` - Static assets
- `remove-unused.js` - Script to automatically fix unused variables
- `netlify.toml` - Netlify deployment configuration
