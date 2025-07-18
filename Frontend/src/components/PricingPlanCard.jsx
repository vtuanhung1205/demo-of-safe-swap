// components/PricingPlanCard.jsx
import React from 'react';
import { CheckCircle } from 'lucide-react'; // Using lucide-react for a nice icon

const PricingPlanCard = ({ plan, billingCycle, navigate, isLoaded, index }) => {
  const isCustom = plan.displayPrice === "Custom";

  // Staggered animation delay based on the card's index
  const animationDelay = `${index * 150}ms`;
  const animationClasses = isLoaded
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-10";

  return (
    <div
      className={`flex-1 flex flex-col bg-[#18181c] border border-[#23232a] rounded-2xl p-8 transition-all duration-500 ease-out ${animationClasses} ${
        plan.isPopular ? 'border-cyan-500/80 scale-105' : 'hover:border-gray-600'
      }`}
      style={{ transitionDelay: animationDelay }}
    >
      {plan.isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="px-4 py-1 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full">
            POPULAR
          </span>
        </div>
      )}

      <div className="flex-grow">
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-gray-400 mb-6 h-12">{plan.description}</p>

        <div className="mb-8">
          {isCustom ? (
            <p className="text-4xl font-extrabold text-white">Contact Us</p>
          ) : (
            <p className="text-4xl font-extrabold text-white">
              ${plan.displayPrice}
              <span className="text-lg font-medium text-gray-400">
                /{billingCycle === 'monthly' ? 'mo' : 'yr'}
              </span>
            </p>
          )}
        </div>

        <ul className="space-y-4 text-gray-300">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => navigate('/payment', { state: { plan } })}
        className={`w-full mt-10 py-3 rounded-lg font-bold text-lg transition-all duration-300 ${
          plan.isPopular
            ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white hover:shadow-lg hover:shadow-cyan-500/20'
            : 'bg-gray-700/50 text-white hover:bg-gray-600'
        }`}
      >
        {isCustom ? 'Get a Quote' : 'Choose Plan'}
      </button>
    </div>
  );
};

export default PricingPlanCard;