// Configuration for the API server
export const config = {
  // NLP Service Configuration
  nlp: {
    // Local development URL
    localUrl: 'http://localhost:8000',
    // Deployed URL on Render
    deployedUrl: 'https://hai-wallet-nlp.onrender.com',
    // Current environment - change this to switch between local and deployed
    useDeployed: true,
    
    // Get the current NLP service URL based on configuration
    getUrl(): string {
      return this.useDeployed ? this.deployedUrl : this.localUrl;
    }
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Debug mode
  debug: process.env.DEBUG === 'true' || false
};

export default config; 