import { useEffect, useRef } from "react";

export function AnimatedNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Define coordinates for the 4 country hubs in a diamond or quad layout
    // Coordinates are normalized (0 to 1) and mapped to canvas size in the loop
    const hubs = [
      { name: "FR", label: "France", xPct: 0.2, yPct: 0.5, size: 8, pulse: 0, glow: 15 },
      { name: "BE", label: "Belgique", xPct: 0.5, yPct: 0.15, size: 8, pulse: Math.PI / 3, glow: 12 },
      { name: "LU", label: "Luxembourg", xPct: 0.8, yPct: 0.5, size: 8, pulse: (2 * Math.PI) / 3, glow: 12 },
      { name: "CH", label: "Suisse", xPct: 0.5, yPct: 0.85, size: 8, pulse: Math.PI, glow: 15 },
    ];

    // Floating individual investor/deal nodes
    const nodes: Array<{
      xPct: number;
      yPct: number;
      speedX: number;
      speedY: number;
      size: number;
      opacity: number;
      targetHub: number;
    }> = [];

    for (let i = 0; i < 20; i++) {
      nodes.push({
        xPct: Math.random() * 0.6 + 0.2,
        yPct: Math.random() * 0.6 + 0.2,
        speedX: (Math.random() - 0.5) * 0.002,
        speedY: (Math.random() - 0.5) * 0.002,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        targetHub: Math.floor(Math.random() * 4),
      });
    }

    // Path progress lines (data flow packet traversals)
    const packets: Array<{
      fromHub: number;
      toHub: number;
      progress: number;
      speed: number;
    }> = [];

    const spawnPacket = () => {
      const from = Math.floor(Math.random() * 4);
      let to = Math.floor(Math.random() * 4);
      while (to === from) {
        to = Math.floor(Math.random() * 4);
      }
      packets.push({
        fromHub: from,
        toHub: to,
        progress: 0,
        speed: Math.random() * 0.008 + 0.004,
      });
    };

    // Spawn initial packets
    for (let i = 0; i < 3; i++) {
      spawnPacket();
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Draw background network glow grid
      ctx.strokeStyle = "rgba(212,175,55,0.03)";
      ctx.lineWidth = 0.5;

      // Draw grid
      const gridSize = 30;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw connections between the country hubs
      ctx.strokeStyle = "rgba(212, 175, 55, 0.15)";
      ctx.lineWidth = 1;
      for (let i = 0; i < hubs.length; i++) {
        for (let j = i + 1; j < hubs.length; j++) {
          const fromX = hubs[i].xPct * w;
          const fromY = hubs[i].yPct * h;
          const toX = hubs[j].xPct * w;
          const toY = hubs[j].yPct * h;

          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.lineTo(toX, toY);
          ctx.stroke();
        }
      }

      // Update and Draw Data Packets
      packets.forEach((p, index) => {
        p.progress += p.speed;

        if (p.progress >= 1) {
          // Re-spawn new packet
          const from = Math.floor(Math.random() * 4);
          let to = Math.floor(Math.random() * 4);
          while (to === from) {
            to = Math.floor(Math.random() * 4);
          }
          packets[index] = {
            fromHub: from,
            toHub: to,
            progress: 0,
            speed: Math.random() * 0.008 + 0.004,
          };
        } else {
          const fromHub = hubs[p.fromHub];
          const toHub = hubs[p.toHub];

          const fromX = fromHub.xPct * w;
          const fromY = fromHub.yPct * h;
          const toX = toHub.xPct * w;
          const toY = toHub.yPct * h;

          // Interpolated coordinate
          const currentX = fromX + (toX - fromX) * p.progress;
          const currentY = fromY + (toY - fromY) * p.progress;

          // Packet glow tail
          ctx.beginPath();
          ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(231, 196, 106, 0.8)";
          ctx.shadowBlur = 6;
          ctx.shadowColor = "rgba(231, 196, 106, 0.8)";
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Update and Draw Floating Nodes
      nodes.forEach((n) => {
        n.xPct += n.speedX;
        n.yPct += n.speedY;

        // Keep within bounds
        if (n.xPct < 0.15 || n.xPct > 0.85) n.speedX *= -1;
        if (n.yPct < 0.15 || n.yPct > 0.85) n.speedY *= -1;

        const x = n.xPct * w;
        const y = n.yPct * h;

        // Draw node
        ctx.beginPath();
        ctx.arc(x, y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${n.opacity})`;
        ctx.fill();

        // Connect nodes to their closest hub lightly
        const hub = hubs[n.targetHub];
        const hubX = hub.xPct * w;
        const hubY = hub.yPct * h;
        const dist = Math.sqrt((x - hubX) * (x - hubX) + (y - hubY) * (y - hubY));
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(hubX, hubY);
          ctx.strokeStyle = `rgba(212, 175, 55, ${0.08 * (1 - dist / 100)})`;
          ctx.stroke();
        }
      });

      // Draw Main Hubs (Country Nodes)
      hubs.forEach((hub) => {
        hub.pulse += 0.02;
        const pulseScale = 1 + Math.sin(hub.pulse) * 0.25;
        const x = hub.xPct * w;
        const y = hub.yPct * h;

        // Ripple/Glow Circle
        ctx.beginPath();
        ctx.arc(x, y, hub.glow * pulseScale, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(212, 175, 55, 0.08)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, hub.glow * 0.5 * pulseScale, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(212, 175, 55, 0.2)";
        ctx.stroke();

        // Solid Core
        ctx.beginPath();
        ctx.arc(x, y, hub.size, 0, Math.PI * 2);
        ctx.fillStyle = "#D4AF37";
        ctx.fill();

        // White inner core
        ctx.beginPath();
        ctx.arc(x, y, hub.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();

        // Label
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(hub.name, x, y - hub.size - 6);
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
    <div className="flex flex-col items-center justify-center p-3 bg-foreground/5 rounded-md border border-border/10 relative overflow-hidden h-44 w-full">
      <div className="absolute top-2 left-4 text-[9px] uppercase tracking-wider text-muted-foreground z-10">
        International Connections
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
    </div>
  );
}
