export function bytesToDisplaySize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export async function createDemoDisasterImage(type: "flood" | "fire") {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 800;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas is not available.");

  const sky = ctx.createLinearGradient(0, 0, 0, 800);
  sky.addColorStop(0, type === "flood" ? "#334155" : "#111827");
  sky.addColorStop(1, type === "flood" ? "#0f766e" : "#7f1d1d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1280, 800);

  ctx.fillStyle = "#111827";
  ctx.fillRect(70, 220, 230, 360);
  ctx.fillRect(940, 180, 220, 420);
  ctx.fillStyle = "#e5e7eb";
  for (let x = 100; x < 280; x += 48) {
    for (let y = 250; y < 500; y += 58) ctx.fillRect(x, y, 22, 28);
  }
  for (let x = 970; x < 1120; x += 48) {
    for (let y = 220; y < 510; y += 58) ctx.fillRect(x, y, 22, 28);
  }

  if (type === "flood") {
    ctx.fillStyle = "rgba(14, 165, 233, 0.78)";
    ctx.fillRect(0, 500, 1280, 300);
    ctx.strokeStyle = "rgba(226, 232, 240, 0.65)";
    ctx.lineWidth = 5;
    for (let y = 535; y < 760; y += 54) {
      ctx.beginPath();
      for (let x = 0; x <= 1280; x += 40) {
        ctx.lineTo(x, y + Math.sin(x / 55) * 12);
      }
      ctx.stroke();
    }
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(480, 545, 280, 75);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(520, 520, 72, 34);
  } else {
    const smoke = ctx.createRadialGradient(620, 230, 20, 620, 230, 330);
    smoke.addColorStop(0, "rgba(75, 85, 99, 0.8)");
    smoke.addColorStop(1, "rgba(17, 24, 39, 0)");
    ctx.fillStyle = smoke;
    ctx.fillRect(260, 0, 760, 520);

    const flame = ctx.createRadialGradient(650, 555, 20, 650, 555, 230);
    flame.addColorStop(0, "#fef3c7");
    flame.addColorStop(0.35, "#f97316");
    flame.addColorStop(1, "rgba(127, 29, 29, 0)");
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.ellipse(650, 555, 270, 220, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7f1d1d";
    ctx.fillRect(360, 610, 560, 85);
  }

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not create demo image."));
        return;
      }
      resolve(new File([blob], `resqai-demo-${type}.png`, { type: "image/png" }));
    }, "image/png");
  });
}
