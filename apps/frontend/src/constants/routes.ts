// Export routes for the application
// Using re-export pattern to make routes available from both files
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TOKENS: '/tokens',
  TOKEN_DETAILS: (address: string) => `/token/${address}`,
  CREATE_TOKEN: '/create-token',
  TRANSFERS: '/transfers', 
  TRANSACTIONS: '/transactions',
  WALLET: '/wallet',
  ABOUT: '/about',
  CONTACT: '/contact'
}; 