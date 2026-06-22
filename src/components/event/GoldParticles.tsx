import { useEffect, useRef } from "react";

export function GoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;
    }> = [];

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const createParticle = (x: number, y: number, isInitial = false) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: isInitial ? Math.random() * rect.width : x,
        y: isInitial ? Math.random() * rect.height : y,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: -Math.random() * 0.4 - 0.1, // Move upwards slowly
        opacity: Math.random() * 0.5 + 0.1,
        fadeSpeed: Math.random() * 0.005 + 0.002,
      };
    };

    // Initialize particles
    const rect = canvas.getBoundingClientRect();
    const particleCount = Math.min(60, Math.floor((rect.width * rect.height) / 15000));
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(0, 0, true));
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const rect = canvas.getBoundingClientRect();

      // Update and draw particles
      particles.forEach((p, index) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Mouse interaction: gentle repulsion
        if (mouseX >= 0 && mouseY >= 0) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            const force = (80 - dist) / 80;
            p.x += (dx / dist) * force * 1.5;
            p.y += (dy / dist) * force * 1.5;
          }
        }

        // Slow fade out as it climbs
        p.opacity -= p.fadeSpeed;

        // Recreate particle if it goes off screen or fades out
        if (p.y < 0 || p.x < 0 || p.x > rect.width || p.opacity <= 0) {
          particles[index] = createParticle(Math.random() * rect.width, rect.height + 10);
        } else {
          // Draw particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = "rgba(212, 175, 55, 0.4)";
          ctx.fill();
        }
      });

      // Reset shadows
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
