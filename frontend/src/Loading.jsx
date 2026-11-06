import React, { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';

export default function Loading({ onLoadingComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Wait for fade-out animation to complete before calling onLoadingComplete
      const completionTimer = setTimeout(() => {
        onLoadingComplete();
      }, 600); // Should match your CSS transition duration
      
      return () => clearTimeout(completionTimer);
    }, 3000);
  
    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-emerald-50 via-green-100 to-teal-50 flex items-center justify-center relative overflow-hidden transition-all duration-800 ${fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      
      {/* Floating Nature Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Leaves */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatLeaf ${8 + Math.random() * 4}s linear infinite`,
              animationDelay: `${Math.random() * 8}s`
            }}
          >
            <Leaf className="w-6 h-6 text-green-600 transform rotate-12" />
          </div>
        ))}
        
        {/* Gradient Orbs */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-16 w-32 h-32 bg-gradient-to-r from-teal-400/30 to-green-500/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-r from-emerald-300/25 to-green-400/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="text-center z-10 relative">
        {/* Enhanced Logo Section */}
        <div className="mb-16 relative">
          {/* Outer Ring Animation */}
          <div className="absolute inset-0 w-40 h-40 mx-auto">
            <div className="w-40 h-40 border-4 border-green-300/40 rounded-full animate-spin-slow"></div>
          </div>
          <div className="absolute inset-2 w-36 h-36 mx-auto">
            <div className="w-36 h-36 border-2 border-emerald-400/30 rounded-full animate-ping"></div>
          </div>
          
          {/* Main Logo Container */}
          <div className="w-40 h-40 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl logo-container relative overflow-hidden">
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-200/50 to-emerald-300/50 rounded-full"></div>
            
            {/* Nature Pattern Background */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-full"></div>
            </div>
            
            <img 
              src="/10_year_logo.png" 
              alt="NITS Eco Club Logo" 
              loading="eager"
              className="w-24 h-24 logo-bounce z-10 relative drop-shadow-lg"
            />
            
            {/* Particle Effects */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-green-400 rounded-full opacity-60"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${i * 45}deg) translateY(-60px)`,
                    animation: `sparkle 2s ease-in-out infinite`,
                    animationDelay: `${i * 0.25}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Welcome Text */}
        <div className="space-y-8 animate-fadeIn">
          <div className="space-y-4">
            <h1 className="text-7xl md:text-8xl font-black mb-6 animate-slideUp">
              <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-teal-700 bg-clip-text text-transparent drop-shadow-sm">
                WELCOME
              </span>
            </h1>
            
            <div className="flex items-center justify-center space-x-4 mb-6 animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-green-500"></div>
              <p className="text-3xl md:text-4xl text-green-800/80 font-light italic">
                to the 10 years celebration of
              </p>
              <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-green-500"></div>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold animate-slideUp" style={{ animationDelay: '0.6s' }}>
              <span className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 bg-clip-text text-transparent">
                ECO CLUB NITS
              </span>
            </h2>
            
            <div className="flex items-center justify-center space-x-3 mt-6 animate-slideUp" style={{ animationDelay: '0.9s' }}>
              <div className="w-8 h-0.5 bg-green-500/60"></div>
              <p className="text-xl text-green-700/80 font-medium tracking-wide">
                National Institute of Technology Silchar
              </p>
              <div className="w-8 h-0.5 bg-green-500/60"></div>
            </div>
          </div>

          {/* Nature Quote */}
          <div className="mt-12 animate-slideUp" style={{ animationDelay: '1.2s' }}>
            <p className="text-lg text-green-600/80 italic font-light max-w-2xl mx-auto leading-relaxed">
              "In every walk with nature, one receives far more than they seek"
            </p>
          </div>
        </div>

        {/* Enhanced Loading Animation */}
        <div className="mt-20 animate-slideUp" style={{ animationDelay: '1.5s' }}>
          <div className="flex justify-center items-center space-x-3 mb-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative">
                <div
                  className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full loading-dot shadow-lg"
                  style={{ animationDelay: `${i * 0.4}s` }}
                ></div>
                <div
                  className="absolute inset-0 w-4 h-4 bg-green-400/30 rounded-full animate-ping"
                  style={{ animationDelay: `${i * 0.4}s` }}
                ></div>
              </div>
            ))}
          </div>
          <p className="text-sm text-green-600/70 font-medium tracking-wider">
            LOADING EXPERIENCE
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(40px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes logoBounce {
          0%, 60%, 100% {
            transform: translateY(0) scale(1);
          }
          20% {
            transform: translateY(-15px) scale(1.05);
          }
          40% {
            transform: translateY(-8px) scale(1.02);
          }
          80% {
            transform: translateY(-4px) scale(1.01);
          }
        }
        @keyframes loadingBounce {
          0%, 40%, 100% {
            transform: translateY(0) scale(1);
          }
          20% {
            transform: translateY(-12px) scale(1.1);
          }
        }
        @keyframes logoContainerPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 20px 40px rgba(34, 197, 94, 0.2), 0 0 0 0 rgba(34, 197, 94, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 25px 50px rgba(34, 197, 94, 0.3), 0 0 0 10px rgba(34, 197, 94, 0.1);
          }
        }
        @keyframes floatLeaf {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: rotate(var(--rotation)) translateY(-60px) scale(0);
          }
          50% {
            opacity: 1;
            transform: rotate(var(--rotation)) translateY(-70px) scale(1);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 1s ease-out forwards;
          opacity: 0;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .logo-bounce {
          animation: logoBounce 3s infinite ease-in-out;
        }
        .logo-container {
          animation: logoContainerPulse 4s infinite ease-in-out;
        }
        .loading-dot {
          animation: loadingBounce 1.6s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}