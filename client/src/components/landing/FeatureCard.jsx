import React from "react";

const FeatureCard = ({ title, description }) => {
  return (
    <div
      className="bg-white border border-[#246608]/20 rounded-2xl p-8 
                    hover:shadow-lg transition-all duration-300 h-full 
                    font-poppins"
    >
      {/* Title */}
      <h3 className="text-xl font-bold text-[#246608] mb-4">{title}</h3>

      {/* Description */}
      <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
