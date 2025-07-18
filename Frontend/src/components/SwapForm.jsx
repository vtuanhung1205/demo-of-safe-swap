import React, { useState, useEffect, useRef } from "react";
import {
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useWebSocket } from "../hooks/useWebSocket";
import { swapAPI, priceAPI, handleApiError } from "../utils/api";
import { mockPrices } from "../utils/mockData";
import toast from "react-hot-toast";

// --- Helper Hook for On-Scroll Animations (from OurStory) ---
const useInView = (options) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        // Stop observing after it's visible once to prevent re-animation
        observer.unobserve(entry.target);
      }
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return [ref, isInView];
};

// Toggle this for demo mode
const DEMO_MODE = true;

const tokens = [
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "https://static1.tokenterminal.com//ethereum/logo.png?logo_hash=fd8f54cab23f8f4980041f4e74607cac0c7ab880",
  },
  {
    symbol: "APT",
    name: "Aptos",
    icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/21794.png",
  },
  {
    symbol: "USDT",
    name: "Tether",
    icon: "https://public.bnbstatic.com/static/academy/uploads-original/2fd4345d8c3a46278941afd9ab7ad225.png",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/800px-Bitcoin.svg.png",
  },
];

const SwapForm = () => {
  const { user, isAuthenticated } = useAuth();
  const {
    isConnected,
    getFormattedPrice,
    getFormattedPriceChange,
    subscribeToTokens,
  } = useWebSocket();

  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [scamAnalysis, setScamAnalysis] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(null);

  const [formRef, isFormInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const animationClasses = isFormInView
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-10";

  useEffect(() => {
    const symbols = tokens.map((token) => token.symbol);
    subscribeToTokens(symbols);
  }, [subscribeToTokens]);

  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0 && fromToken && toToken) {
      getSwapQuote();
    } else {
      setToAmount("");
      setQuote(null);
    }
  }, [fromAmount, fromToken, toToken]);

  const getSwapQuote = async () => {
    if (!fromAmount || !fromToken || !toToken) return;
    setIsLoadingQuote(true);
    try {
      if (DEMO_MODE) {
        const fromPrice = mockPrices[fromToken.symbol]?.price || 1;
        const toPrice = mockPrices[toToken.symbol]?.price || 1;
        const rate = fromPrice / toPrice;
        const calculatedAmount = parseFloat(fromAmount) * rate * 0.997;
        const mockQuote = {
          fromAmount: parseFloat(fromAmount),
          toAmount: calculatedAmount,
          exchangeRate: rate,
          slippage: 0.5,
          fee: parseFloat(fromAmount) * 0.003,
          priceImpact: 0.1,
          feeUsd: parseFloat(fromAmount) * 0.003 * fromPrice,
        };
        await new Promise((resolve) => setTimeout(resolve, 800));
        setQuote(mockQuote);
        setToAmount(calculatedAmount.toFixed(6));
        analyzeToken(toToken.symbol);
      } else {
        const response = await swapAPI.getQuote(fromToken.symbol, toToken.symbol, fromAmount);
        if (response.data.success) {
          const quoteData = response.data.data.quote;
          setQuote(quoteData);
          setToAmount(quoteData.toAmount.toFixed(6));
          analyzeToken(toToken.symbol);
        }
      }
    } catch (error) {
      console.error("Quote error:", error);
      toast.error(handleApiError(error));
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const analyzeToken = async (symbol) => {
    try {
      if (DEMO_MODE) {
        const mockAnalysis = {
          isScam: Math.random() > 0.8,
          riskScore: Math.floor(Math.random() * 100),
          confidence: Math.floor(Math.random() * 30) + 70,
          reasons: ["Price volatility detected", "Low liquidity warning"],
          recommendation: "Proceed with caution",
        };
        await new Promise((resolve) => setTimeout(resolve, 500));
        setScamAnalysis(mockAnalysis);
      } else {
        const mockAddress = `0x${symbol.toLowerCase()}${"0".repeat(40)}`;
        const response = await priceAPI.analyzeToken(mockAddress, symbol, symbol);
        if (response.data.success) {
          setScamAnalysis(response.data.data.analysis);
        }
      }
    } catch (error) {
      console.error("Token analysis error:", error);
    }
  };

  const handleSwap = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to swap tokens");
      return;
    }
    if (!quote) {
      toast.error("Please get a quote first");
      return;
    }
    if (scamAnalysis && scamAnalysis.isScam && scamAnalysis.riskScore > 80) {
      if (!confirm(`Warning: This token has a high scam risk (${scamAnalysis.riskScore}%). Do you want to continue?`)) {
        return;
      }
    }
    setIsSwapping(true);
    try {
      if (DEMO_MODE) {
        const mockTransaction = {
          hash: "0x" + Math.random().toString(16).substr(2, 64),
          status: "pending",
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          fromAmount: quote.fromAmount,
          toAmount: quote.toAmount,
        };
        await new Promise((resolve) => setTimeout(resolve, 2000));
        toast.success(`Swap initiated! Transaction: ${mockTransaction.hash.slice(0, 10)}...`);
        setFromAmount("");
        setToAmount("");
        setQuote(null);
        setScamAnalysis(null);
      } else {
        const response = await swapAPI.executeSwap(fromToken.symbol, toToken.symbol, quote.fromAmount, quote.toAmount, "quote_id");
        if (response.data.success) {
          const transaction = response.data.data.transaction;
          toast.success(`Swap initiated! Transaction: ${transaction.hash.slice(0, 10)}...`);
          setFromAmount("");
          setToAmount("");
          setQuote(null);
          setScamAnalysis(null);
        }
      }
    } catch (error) {
      console.error("Swap error:", error);
      toast.error(handleApiError(error));
    } finally {
      setIsSwapping(false);
    }
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount("");
  };

  const selectToken = (token, type) => {
    if (type === "from") {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    setShowTokenModal(null);
  };

  const getRiskColor = (riskScore) => {
    if (riskScore < 30) return "text-green-500";
    if (riskScore < 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div ref={formRef} className={`flex flex-col items-center justify-center min-h-[80vh] bg-transparent px-4 transition-all duration-700 ease-out ${animationClasses}`}>
      <h2 className="text-4xl font-bold text-center text-white mb-6">
        Swap anytime,
        <br />
        anywhere.
      </h2>

      <div className="mb-4 flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
        <span className="text-sm text-gray-400">
          {isConnected ? "Live prices connected" : "Price feed offline"}
        </span>
      </div>

      <div className="relative group bg-[#18181c] rounded-3xl shadow-2xl p-6 w-full max-w-md border border-[#23232a]">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-pink-600 rounded-3xl blur-lg opacity-0 group-hover:opacity-50 transition duration-500 -z-10"></div>

        <div className="rounded-2xl bg-[#111112] p-5 mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 text-sm">Sell</span>
            <span className="text-xs text-gray-500">Balance: {user?.walletAddress ? "0.00" : "--"}</span>
          </div>
          <div className="flex items-center justify-between">
            {/* --- CHANGE IS HERE --- */}
            <input
              type="number"
              min="0"
              step="any"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="bg-transparent text-3xl font-semibold text-white outline-none w-1/2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.0"
            />
            <button onClick={() => setShowTokenModal("from")} className="flex items-center bg-cyan-600 hover:bg-cyan-700 transition text-white rounded-full px-4 py-2 ml-2 font-medium text-lg">
              <img src={fromToken.icon} alt={fromToken.symbol} className="w-6 h-6 mr-2" />
              {fromToken.symbol}
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">{getFormattedPrice(fromToken.symbol)}</span>
            <span className={`text-xs ${getFormattedPriceChange(fromToken.symbol).className}`}>{getFormattedPriceChange(fromToken.symbol).formatted}</span>
          </div>
        </div>

        <div className="flex justify-center -my-2">
          <button onClick={swapTokens} className="bg-[#18181c] border border-[#23232a] rounded-full w-10 h-10 flex items-center justify-center hover:border-cyan-600 transition">
            <ArrowUpDown size={20} className="text-white" />
          </button>
        </div>

        <div className="rounded-2xl bg-[#111112] p-5 mt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 text-sm">Buy</span>
            {isLoadingQuote && <Loader2 size={16} className="animate-spin text-cyan-500" />}
          </div>
          <div className="flex items-center justify-between">
            <input type="number" min="0" value={toAmount} readOnly className="bg-transparent text-3xl font-semibold text-white outline-none w-1/2" placeholder="0.0" />
            <button onClick={() => setShowTokenModal("to")} className="flex items-center bg-pink-500 hover:bg-pink-600 transition text-white rounded-full px-4 py-2 ml-2 font-medium text-lg">
              {toToken ? (<><img src={toToken.icon} alt={toToken.symbol} className="w-6 h-6 mr-2" />{toToken.symbol}</>) : ("Select token")}
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">{getFormattedPrice(toToken?.symbol)}</span>
            <span className={`text-xs ${getFormattedPriceChange(toToken?.symbol).className}`}>{getFormattedPriceChange(toToken?.symbol).formatted}</span>
          </div>
        </div>

        {quote && (
          <div className="mt-4 p-4 bg-[#111112] rounded-2xl">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Exchange Rate</span>
              <span>1 {fromToken.symbol} = {quote.exchangeRate.toFixed(6)} {toToken.symbol}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Price Impact</span>
              <span className={quote.priceImpact > 5 ? "text-red-400" : "text-green-400"}>{quote.priceImpact.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span>Fee</span>
              <span>{quote.fee.toFixed(6)} {fromToken.symbol} (${quote.feeUsd.toFixed(2)})</span>
            </div>
          </div>
        )}

        {scamAnalysis && scamAnalysis.riskScore > 30 && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-2xl">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle size={20} className="text-red-400" />
              <span className="text-red-400 font-medium">Security Warning</span>
            </div>
            <p className="text-sm text-gray-300 mb-2">Risk Score: <span className={getRiskColor(scamAnalysis.riskScore)}>{scamAnalysis.riskScore}/100</span></p>
            <ul className="text-xs text-gray-400 space-y-1">
              {scamAnalysis.reasons.slice(0, 3).map((reason, index) => (<li key={index}>• {reason}</li>))}
            </ul>
          </div>
        )}

        {scamAnalysis && scamAnalysis.riskScore <= 30 && (
          <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-2xl">
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-green-400 text-sm font-medium">Token appears safe</span>
              <span className="text-xs text-gray-400">({scamAnalysis.riskScore}/100 risk)</span>
            </div>
          </div>
        )}

        <button
          onClick={handleSwap}
          disabled={!isAuthenticated || !quote || isSwapping || isLoadingQuote}
          className="w-full mt-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          {!isAuthenticated ? (<><Wallet size={20} /><span>Connect Wallet to Swap</span></>) : isSwapping ? (<><Loader2 size={20} className="animate-spin" /><span>Swapping...</span></>) : (<><TrendingUp size={20} /><span>Swap</span></>)}
        </button>
      </div>

      <p className="text-gray-400 text-center mt-6 max-w-md">
        The safest token swap platform on Aptos with real-time scam detection
        and live price feeds.
      </p>

      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181c] rounded-2xl border border-[#23232a] p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Select {showTokenModal === "from" ? "source" : "destination"} token</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {tokens.map((token) => (
                <button key={token.symbol} onClick={() => selectToken(token, showTokenModal)} className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-[#23232a] transition">
                  <img src={token.icon} alt={token.symbol} className="w-8 h-8 rounded-full" />
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium">{token.symbol}</div>
                    <div className="text-gray-400 text-sm">{token.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm">{getFormattedPrice(token.symbol)}</div>
                    <div className={`text-xs ${getFormattedPriceChange(token.symbol).className}`}>{getFormattedPriceChange(token.symbol).formatted}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowTokenModal(null)} className="w-full mt-4 py-2 text-gray-400 hover:text-white transition">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapForm;