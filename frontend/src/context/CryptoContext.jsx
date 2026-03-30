import { createContext } from 'react';

export const CryptoContext = createContext({
  cryptoData: {},
  portfolio: null,
  refreshPortfolio: async () => {},
  socket: null,
  userId: 'mock-trader-01'
});
