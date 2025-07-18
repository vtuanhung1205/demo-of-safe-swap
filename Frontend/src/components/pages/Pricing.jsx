// pages/Pricing.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PricingPlanCard from "../PricingPlanCard";
import SkeletonCard from "../SkeletonCard";

// --- UPDATED: Plan data now includes monthly and yearly pricing ---
// This would typically be in your `utils/pricingPlans.js` file
const plans = [
  {
    name: "Basic",
    price: {
      monthly: 29,
      yearly: 246.5, // e.g., 12 months for the price of 10
    },
    description: "For individuals and small teams just getting started.",
    features: [
      "Limited 10/day swaps",
      "Basic scam detection (Safe/Suspicious)",
      "Standard support",
      "Last 5 swaps",
    ],
    isPopular: false,
  },
  {
    name: "Pro",
    price: {
      monthly: 79,
      yearly: 671.5, // e.g., 12 months for the price of 10
    },
    description: "For growing businesses that need more power and support.",
    features: [
      "Unlimited swaps",
      "Detailed (Confident Score) scam detection",
      "Priority email support",
      "API Access",
      "Full History",
      "Priority support",
    ],
    isPopular: true,
  },
  {
    name: "Advance",
    price: {
      monthly: "Contact",
      yearly: "Contact",
    },
    description: "For large-scale applications with custom needs.",
    features: [
      "Multiple Wallet Connect",
      "Unlimited swaps + Cross Chain",
      "ML + Analytic scam detection",
      "Full API access + docs",
      "24/7 dedicated support",
      "Full history + analytics",
    ],
    isPopular: false,
  },
];


const Pricing = () => {
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' or 'yearly'
  const navigate = useNavigate();

  useEffect(() => {
    const dataFetchTimer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(dataFetchTimer);
  }, []);

  useEffect(() => {
    if (!loading) {
      const animationTimer = setTimeout(() => setIsLoaded(true), 50);
      return () => clearTimeout(animationTimer);
    }
  }, [loading]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#18181c] to-[#111112] text-white overflow-hidden">
      {/* --- NEW: Radial gradient for a modern spotlight effect --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-[-20%] right-[-20%] top-[20%] bg-[radial-gradient(circle_500px_at_50%_200px,#3182ce22,transparent)]"></div>
      </div>

      <div className="relative z-10 px-4 py-12 md:px-12 lg:px-24">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            Find Your Perfect Plan
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Simple, transparent pricing. No hidden fees.
            Choose the plan that scales with you.
          </p>
        </section>

        {/* --- NEW: Billing Cycle Toggle Switch --- */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className={`font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-14 h-8 flex items-center bg-gray-700 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out"
          >
            <div
              className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
            Yearly
          </span>
          <span className="ml-2 px-3 py-1 text-xs font-bold text-cyan-300 bg-cyan-500/20 rounded-full border border-cyan-500/30">
            SAVE 15%
          </span>
        </div>

        {/* Pricing Cards Section */}
        <div className="flex flex-col lg:flex-row gap-8 justify-center items-stretch max-w-6xl mx-auto">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard isPopular={true} />
              <SkeletonCard />
            </>
          ) : (
            plans.map((plan, index) => (
              <PricingPlanCard
                key={plan.name}
                plan={{
                  ...plan,
                  // Pass the correct price based on the selected cycle
                  displayPrice: plan.price[billingCycle],
                }}
                billingCycle={billingCycle}
                navigate={navigate}
                isLoaded={isLoaded}
                index={index}
              />
            ))
          )}
        </div>

        {/* FAQ or Footer Section (Optional) */}
        <section className="text-center mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">
                Have more questions? <a href="/contact" className="text-cyan-400 hover:underline">Contact us</a> and we'll be happy to help.
            </p>
        </section>
      </div>
    </div>
  );
};

export default Pricing;