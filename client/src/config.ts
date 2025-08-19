const isProduction = import.meta.env.PROD;

export const config = {
  apiBaseUrl: isProduction ? '' : '/api',
};
