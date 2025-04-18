declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_API_URL?: string;
    }
  }
}

interface Window {
  ENV: {
    API_URL: string;
  };
}

// Load environment variables into window.ENV
(window as any).ENV = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
};

export {} 