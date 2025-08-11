import { useCallback, useEffect } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";

/** Finance-themed glass-morphism particle field with multiple layers */
export default function ParticleBackdropFinance() {
  const init = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  // Add custom CSS for enhanced bubble and symbol effects
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .bubble-particle {
        background: radial-gradient(circle at 30% 30%, 
          rgba(255, 255, 255, 0.9) 0%, 
          rgba(255, 255, 255, 0.6) 40%, 
          rgba(255, 255, 255, 0.2) 70%, 
          rgba(255, 255, 255, 0.1) 100%);
        border-radius: 50%;
        box-shadow: 
          inset 2px 2px 4px rgba(255, 255, 255, 0.3),
          inset -2px -2px 4px rgba(0, 0, 0, 0.1),
          0 4px 8px rgba(0, 0, 0, 0.1);
      }
      
      .finance-symbol {
        background: linear-gradient(135deg, 
          rgba(255, 255, 255, 0.8), 
          rgba(255, 255, 255, 0.4));
        border-radius: 4px;
        box-shadow: 
          0 2px 4px rgba(0, 0, 0, 0.1),
          inset 1px 1px 2px rgba(255, 255, 255, 0.5);
      }
      
      .sparkle-particle {
        background: radial-gradient(circle, 
          rgba(255, 215, 0, 0.8) 0%, 
          rgba(255, 255, 255, 0.6) 50%, 
          transparent 100%);
        border-radius: 50%;
        box-shadow: 
          0 0 8px rgba(255, 215, 0, 0.4),
          inset 1px 1px 2px rgba(255, 255, 255, 0.8);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <>
      {/* Layer 1: Large background blobs */}
      <Particles
        id="finance-blobs"
        init={init}
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          width: "100%", 
          height: "100%", 
          zIndex: 0 
        }}
        options={{
          fullScreen: false,
          fpsLimit: 45,
          background: { color: "transparent" },
          particles: {
            number: { 
              value: 8, 
              density: { enable: true, area: 2000 } 
            },
            shape: { type: "circle" },
            color: { 
              value: [
                "rgba(255, 255, 255, 0.1)",
                "rgba(255, 255, 255, 0.08)",
                "rgba(255, 255, 255, 0.06)"
              ]
            },
            opacity: { 
              value: 0.2,
              animation: {
                enable: true,
                speed: 0.1,
                sync: false,
                minimumValue: 0.05
              }
            },
            size: { 
              value: { min: 120, max: 240 },
              animation: { 
                enable: true,
                speed: 1,
                sync: false,
                minimumValue: 80
              } 
            },
            move: {
              enable: true,
              speed: { min: 0.1, max: 0.3 },
              direction: "none",
              random: true,
              straight: false,
              outModes: { default: "bounce" }
            }
          },
          detectRetina: true,
          interactivity: {
            events: {
              onHover: { enable: false },
              onClick: { enable: false }
            }
          }
        }}
      />

      {/* Layer 2: Medium glass bubbles */}
      <Particles
        id="finance-bubbles"
        init={init}
        className="bubble-particle"
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          width: "100%", 
          height: "100%", 
          zIndex: 0 
        }}
        options={{
          fullScreen: false,
          fpsLimit: 45,
          background: { color: "transparent" },
          particles: {
            number: { 
              value: 22, 
              density: { enable: true, area: 1500 } 
            },
            shape: { type: "circle" },
            color: { 
              value: [
                "rgba(255, 255, 255, 0.8)",
                "rgba(255, 255, 255, 0.6)",
                "rgba(255, 255, 255, 0.4)"
              ]
            },
            opacity: { 
              value: 0.3,
              animation: {
                enable: true,
                speed: 0.2,
                sync: false,
                minimumValue: 0.1
              }
            },
            size: { 
              value: { min: 40, max: 80 },
              animation: { 
                enable: true,
                speed: 2,
                sync: false,
                minimumValue: 20
              } 
            },
            stroke: { 
              width: 1, 
              color: "rgba(255,255,255,0.4)" 
            },
            move: {
              enable: true,
              speed: { min: 0.3, max: 0.7 },
              direction: "none",
              random: true,
              straight: false,
              outModes: { default: "bounce" }
            },
            shadow: {
              enable: true,
              color: "rgba(255, 255, 255, 0.2)",
              blur: 5,
              offset: { x: 2, y: 2 }
            }
          },
          detectRetina: true,
          interactivity: {
            events: {
              onHover: { enable: false },
              onClick: { enable: false }
            }
          }
        }}
      />


    </>
  );
} 