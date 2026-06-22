import { useEffect, useRef } from "react";

export function ChampagneBubbles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let bubbles: Array<{
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
      wobble: number;
      wobbleSpeed: number;
    }> = [];

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const createBubble = (x: number, y: number, isInitial = false) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: isInitial ? Math.random() * rect.width : x,
        y: isInitial ? Math.random() * rect.height : y,
        radius: Math.random() * 2.5 + 0.8,
        speedY: -Math.random() * 0.8 - 0.4, // float up
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.7 + 0.1,
        wobble: Math.random() * Math.PI,
        wobbleSpeed: Math.random() * 0.05 + 0.02,
      };
    };

    const rect = canvas.getBoundingClientRect();
    const bubbleCount = 35;
    for (let i = 0; i < bubbleCount; i++) {
      bubbles.push(createBubble(0, 0, true));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const rect = canvas.getBoundingClientRect();

      // Draw golden glow background (halo doré)
      const gradient = ctx.createRadialGradient(
        rect.width / 2,
        rect.height / 2,
        10,
        rect.width / 2,
        rect.height / 2,
        rect.width / 1.5
      );
      gradient.addColorStop(0, "rgba(212, 175, 55, 0.15)");
      gradient.addColorStop(1, "rgba(212, 175, 55, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw bubbles
      bubbles.forEach((b, index) => {
        b.y += b.speedY;
        b.wobble += b.wobbleSpeed;
        b.x += Math.sin(b.wobble) * 0.25 + b.speedX;

        // If off-screen, recreate at the bottom
        if (b.y < -10) {
          bubbles[index] = createBubble(Math.random() * rect.width, rect.height + 10);
        } else {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);

          // Give bubbles a glossy glass look with a tiny bright spot
          ctx.fillStyle = `rgba(255, 235, 180, ${b.opacity})`;
          ctx.strokeStyle = `rgba(212, 175, 55, ${b.opacity + 0.2})`;
          ctx.lineWidth = 0.5;
          ctx.fill();
          ctx.stroke();

          // Bubble highlight (tiny reflection)
          ctx.beginPath();
          ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity + 0.3})`;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-sm">
      {/* Visual ring/light around the parent content */}
      <div className="absolute inset-0 border border-gold/15 rounded-sm shadow-[inset_0_0_20px_rgba(212,175,55,0.1)]" />
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
