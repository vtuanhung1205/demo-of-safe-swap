import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { mockPrices } from '../utils/mockData';
import toast from 'react-hot-toast';

// Toggle this for demo mode
const DEMO_MODE = true;

const SOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:5000';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (DEMO_MODE) {
      // Use mock data for demo
      setPrices(mockPrices);
      setIsConnected(true);
      setLastUpdate(new Date());
      console.log('Mock prices loaded:', Object.keys(mockPrices).length, 'tokens');
      
      // Simulate price updates
      const interval = setInterval(() => {
        setPrices(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(symbol => {
            const currentPrice = updated[symbol].price;
            const change = (Math.random() - 0.5) * 0.02; // ±1% random change
            updated[symbol] = {
              ...updated[symbol],
              price: currentPrice * (1 + change),
              change24h: updated[symbol].change24h + change * 100
            };
          });
          return updated;
        });
        setLastUpdate(new Date());
      }, 5000); // Update every 5 seconds
      
      return () => clearInterval(interval);
    } else {
      // Initialize socket connection
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
      });

      const socket = socketRef.current;

      // Connection event handlers
      socket.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
      });

      // Price update handlers
      socket.on('initial_prices', (data) => {
        if (data.success && data.data) {
          const priceMap = {};
          data.data.forEach(price => {
            priceMap[price.symbol] = price;
          });
          setPrices(priceMap);
          setLastUpdate(new Date());
          console.log('Initial prices loaded:', Object.keys(priceMap).length, 'tokens');
        }
      });

      socket.on('price_update', (data) => {
        if (data.type === 'price_update' && data.data) {
          setPrices(prev => ({
            ...prev,
            [data.data.symbol]: {
              ...prev[data.data.symbol],
              ...data.data,
            }
          }));
          setLastUpdate(new Date());
        }
      });

      socket.on('subscription_success', (data) => {
        console.log('Subscribed to tokens:', data.subscribed);
      });

      socket.on('unsubscription_success', (data) => {
        console.log('Unsubscribed from tokens:', data.unsubscribed);
      });

      // Cleanup on unmount
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, []);

  const subscribeToTokens = (tokens) => {
    if (DEMO_MODE) {
      // In demo mode, just log subscription
      console.log('Demo mode: Subscribed to tokens:', tokens);
    } else if (socketRef.current && isConnected) {
      socketRef.current.emit('subscribe_prices', tokens);
    }
  };

  const unsubscribeFromTokens = (tokens) => {
    if (DEMO_MODE) {
      // In demo mode, just log unsubscription
      console.log('Demo mode: Unsubscribed from tokens:', tokens);
    } else if (socketRef.current && isConnected) {
      socketRef.current.emit('unsubscribe_prices', tokens);
    }
  };

  const getTokenPrice = (symbol) => {
    return prices[symbol?.toUpperCase()] || null;
  };

  const getAllPrices = () => {
    return prices;
  };

  const getFormattedPrice = (symbol, decimals = 6) => {
    const price = getTokenPrice(symbol);
    if (!price) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price.price < 1 ? decimals : 2,
      maximumFractionDigits: price.price < 1 ? decimals : 2,
    }).format(price.price);
  };

  const getPriceChange24h = (symbol) => {
    const price = getTokenPrice(symbol);
    return price?.change24h || 0;
  };

  const getFormattedPriceChange = (symbol) => {
    const change = getPriceChange24h(symbol);
    const isPositive = change >= 0;
    
    return {
      value: change,
      formatted: `${isPositive ? '+' : ''}${change.toFixed(2)}%`,
      isPositive,
      className: isPositive ? 'text-green-500' : 'text-red-500',
    };
  };

  return {
    isConnected,
    prices,
    lastUpdate,
    subscribeToTokens,
    unsubscribeFromTokens,
    getTokenPrice,
    getAllPrices,
    getFormattedPrice,
    getPriceChange24h,
    getFormattedPriceChange,
  };
}; 