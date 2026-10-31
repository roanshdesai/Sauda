export type SilkMode = "characters" | "dither" | "mosaic" | "pixel" | "dots" | "cross" | "diamond" | "voxel" | "lego" | "mixed" | "lines" | "diagonal" | "braille" | "disco" | "hexdump" | "matrix" | "rings" | "hearts" | "stars" | "hexagons" | "triangles" | "bubbles" | "hatch" | "contour" | "halfblocks";
export type SilkAnimation = "wave" | "pulse" | "shimmer" | "ripple" | "flicker";

type Effect = { enabled: boolean; intensity: number };
type Light = { x: number; y: number; radius: number; color?: string; intensity: number };
export type SilkRecipe = {
  renderMode: SilkMode;
  bgMode: "solid" | "source"; bgBlur: number; bgOpacity: number;
  cellSize: number; coverage: number; invert: boolean; styleBlend: GlobalCompositeOperation;
  charSet: "binary" | "ascii"; customChars: string; brightness: number; contrast: number;
  edgeEmphasis: number; density: number; toneCurve: "identity" | "ease-in" | "ease-out";
  tint: string; tintOpacity: number; overlayBlend: GlobalCompositeOperation;
  saturation: number; grayscale: number; blurType: "off" | "gaussian"; blurAmount: number;
  pfx: { vignette: Effect; scanLines: Effect; chromatic: Effect; bloom: Effect; filmGrain: Effect; glitch: Effect; pixelate: Effect; halftone: Effect; filmDust: Effect };
  animated: boolean; animStyle: SilkAnimation; animationSpeed: Effect; animationIntensity: number;
  lights: { enabled: boolean; points: Light[] };
  mask: { enabled: boolean; dataUrl: string | null; invert: boolean };
  shaderSource: {
    type: "silk"; variant: number; colors: string[]; speed: number; zoom: number; intensity: number;
    paramA: number; warp: number; detail: number; contrast: number; brightness: number; saturation: number;
    hue: number; vignette: number; blur: number; grain: number; rotate: number; offsetX: number; offsetY: number;
    seed: number; animated: boolean; drift: number; reverse: boolean; mouseReactive: boolean;
    cursorSwirlStrength: number; cursorSwirlRadius: number; oklab: boolean; customCode: string | null;
  };
};

const effect = (enabled: boolean, intensity: number): Effect => ({ enabled, intensity });
// Procedural interpretation of the 21st.dev recipe by dwar; not the original shader.
export const asciiSilkRecipe: SilkRecipe = {
  renderMode: "voxel", bgMode: "solid", bgBlur: 12, bgOpacity: 90, cellSize: 3, coverage: 100,
  invert: false, styleBlend: "source-over", charSet: "binary", customChars: "", brightness: 0,
  contrast: 115, edgeEmphasis: 40, density: 0, toneCurve: "identity", tint: "#00ff66",
  tintOpacity: 45, overlayBlend: "overlay", saturation: 100, grayscale: 0, blurType: "off", blurAmount: 35,
  pfx: { vignette: effect(true, 38), scanLines: effect(true, 28), chromatic: effect(true, 40), bloom: effect(true, 60), filmGrain: effect(true, 40), glitch: effect(true, 20), pixelate: effect(false, 15), halftone: effect(false, 20), filmDust: effect(false, 20) },
  animated: true, animStyle: "flicker", animationSpeed: effect(true, 100), animationIntensity: 60,
  lights: { enabled: false, points: [] }, mask: { enabled: false, dataUrl: null, invert: false },
  shaderSource: { type: "silk", variant: 0, colors: ["#02010A", "#04052E", "#3D2C8D", "#916BBF"], speed: 30, zoom: 48, intensity: 44, paramA: 28, warp: 8, detail: 32, contrast: 45, brightness: 50, saturation: 50, hue: 0, vignette: 0, blur: 0, grain: 12, rotate: 0, offsetX: 0, offsetY: 0, seed: 1, animated: true, drift: 0, reverse: false, mouseReactive: false, cursorSwirlStrength: 65, cursorSwirlRadius: 50, oklab: false, customCode: null },
};

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
export const silkLuminance = (r: number, g: number, b: number) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
export const silkEdge = (center: number, right: number, below: number) => clamp(Math.abs(center - right) + Math.abs(center - below));
export const silkOverlay = (base: number, blend: number, opacity: number) => base * (1 - opacity) + (base < 128 ? 2 * base * blend / 255 : 255 - 2 * (255 - base) * (255 - blend) / 255) * opacity;
const hash = (x: number, y: number, seed = 1) => {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
};
const rgb = (hex: string) => {
  const value = parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

function correctedChannel(channel: number, gray: number, tint: number, motion: number, tone: number, edge: number, recipe: SilkRecipe) {
  const gain = motion * tone, brightness = recipe.brightness * 2.55 + edge * 90;
  const contrast = recipe.contrast / 100;
  const corrected = (channel * gain + brightness - 128) * contrast + 128;
  const correctedGray = (gray * gain + brightness - 128) * contrast + 128;
  const saturated = correctedGray + (corrected - correctedGray) * recipe.saturation / 100;
  const adjusted = clamp(saturated + (correctedGray - saturated) * recipe.grayscale / 100, 0, 255);
  const opacity = recipe.tintOpacity / 100;
  let blended = tint;
  if (recipe.overlayBlend === "overlay") return Math.round(silkOverlay(adjusted, tint, opacity));
  if (recipe.overlayBlend === "multiply") blended = adjusted * tint / 255;
  else if (recipe.overlayBlend === "screen") blended = 255 - (255 - adjusted) * (255 - tint) / 255;
  return Math.round(adjusted * (1 - opacity) + blended * opacity);
}

function drawShape(ctx: CanvasRenderingContext2D, mode: SilkMode, x: number, y: number, size: number, value: number, index: number, time: number, recipe: SilkRecipe) {
  const half = size / 2;
  const centerX = x + half, centerY = y + half;
  const radius = Math.max(0.2, half * (0.25 + value * 0.75));
  if (mode === "mixed") mode = (["voxel", "dots", "cross", "diamond"] as const)[index % 4];
  if (mode === "characters" || mode === "braille" || mode === "hexdump" || mode === "matrix") {
    const chars = recipe.customChars || (mode === "braille" ? "⠁⠃⠇⠏⠟⠿⣿" : mode === "hexdump" ? "0123456789ABCDEF" : recipe.charSet === "binary" ? "01" : " .:-=+*#%@");
    const charIndex = mode === "matrix" ? Math.floor(hash(index, Math.floor(time * 8)) * chars.length) : Math.min(chars.length - 1, Math.floor(value * chars.length));
    ctx.fillText(chars[charIndex], x, y + size * 0.85);
  } else if (mode === "pixel" || mode === "mosaic" || mode === "dither") {
    if (mode !== "dither" || hash(x, y) < value) ctx.fillRect(x, y, size + 0.2, size + 0.2);
  } else if (mode === "voxel" || mode === "lego") {
    ctx.fillRect(x, y, Math.max(0.5, size - 0.35), Math.max(0.5, size - 0.35));
    ctx.fillStyle = `rgba(255,255,255,${0.08 + value * 0.16})`;
    ctx.fillRect(x, y, size - 0.35, Math.max(0.4, size * 0.17));
    ctx.fillStyle = "rgba(0,0,0,0.24)";
    ctx.fillRect(x, y + size * 0.8, size - 0.35, size * 0.15);
    if (mode === "lego") { ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.beginPath(); ctx.arc(centerX, centerY, size * 0.17, 0, Math.PI * 2); ctx.fill(); }
  } else if (mode === "lines" || mode === "diagonal" || mode === "hatch" || mode === "cross") {
    ctx.lineWidth = Math.max(0.4, size * 0.12); ctx.strokeStyle = ctx.fillStyle; ctx.beginPath();
    if (mode === "diagonal" || mode === "hatch") { ctx.moveTo(x, y + size); ctx.lineTo(x + size, y); }
    else { ctx.moveTo(x, centerY); ctx.lineTo(x + size, centerY); }
    if (mode === "cross" || mode === "hatch") { ctx.moveTo(centerX, y); ctx.lineTo(centerX, y + size); }
    ctx.stroke();
  } else {
    ctx.beginPath();
    if (mode === "dots" || mode === "disco" || mode === "rings" || mode === "bubbles") {
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      if (mode === "rings" || mode === "bubbles") { ctx.lineWidth = Math.max(0.4, size * 0.1); ctx.strokeStyle = ctx.fillStyle; ctx.stroke(); return; }
    } else if (mode === "hearts") {
      ctx.moveTo(centerX, centerY + radius); ctx.bezierCurveTo(x - radius * 0.3, centerY, centerX - radius, y, centerX, y + radius * 0.5); ctx.bezierCurveTo(centerX + radius, y, x + size + radius * 0.3, centerY, centerX, centerY + radius);
    } else {
      const points = mode === "triangles" ? 3 : mode === "hexagons" ? 6 : mode === "stars" ? 10 : 4;
      for (let i = 0; i < points; i++) {
        const angle = -Math.PI / 2 + i * Math.PI * 2 / points;
        const r = mode === "stars" && i % 2 ? radius * 0.45 : radius;
        const px = centerX + Math.cos(angle) * r, py = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }
    ctx.fill();
  }
}

function drawContours(ctx: CanvasRenderingContext2D, x: number, y: number, cell: number, a: number, b: number, c: number, d: number) {
  const corners = [a, b, c, d];
  const xs = [x, x + cell, x + cell, x], ys = [y, y, y + cell, y + cell];
  const low = Math.min(a, b, c, d), high = Math.max(a, b, c, d);
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineWidth = Math.max(0.5, cell * 0.12);
  ctx.beginPath();
  for (let level = Math.floor(low * 8) + 1; level <= Math.floor(high * 8); level++) {
    const threshold = level / 8;
    let crossings = 0;
    for (let edge = 0; edge < 4; edge++) {
      const next = (edge + 1) % 4, from = corners[edge], to = corners[next];
      if ((from < threshold) === (to < threshold)) continue;
      const t = (threshold - from) / (to - from);
      const px = xs[edge] + (xs[next] - xs[edge]) * t, py = ys[edge] + (ys[next] - ys[edge]) * t;
      if (crossings++ % 2 === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
}

/** Reuses its raster and grid buffers until the canvas size changes. */
export function createAsciiSilkRenderer(canvas: HTMLCanvasElement, recipe: SilkRecipe = asciiSilkRecipe) {
  const ctx = canvas.getContext("2d")!;
  const source = document.createElement("canvas"), layer = document.createElement("canvas"), scratch = document.createElement("canvas");
  const sourceCtx = source.getContext("2d")!, layerCtx = layer.getContext("2d")!, scratchCtx = scratch.getContext("2d")!;
  let image: ImageData, values = new Float32Array(0), reds = new Float32Array(0), greens = new Float32Array(0), blues = new Float32Array(0);
  let columns = 0, rows = 0, cell = recipe.cellSize, stepX = cell, stepY = cell, maskImage: HTMLImageElement | null = null, maskUrl: string | null = null;
  const palette = recipe.shaderSource.colors.map(rgb), tint = rgb(recipe.tint);

  function resize(width: number, height: number, pixelScale = 1) {
    canvas.width = layer.width = scratch.width = Math.max(1, Math.round(width));
    canvas.height = layer.height = scratch.height = Math.max(1, Math.round(height));
    cell = Math.max(0.5, recipe.cellSize * pixelScale);
    stepX = recipe.renderMode === "hexagons" ? cell * Math.sqrt(3) / 2 : cell;
    stepY = recipe.renderMode === "hexagons" ? cell * 0.75 : cell;
    let sourceScale = Math.min(1, Math.sqrt(72000 / (canvas.width * canvas.height)));
    if (recipe.renderMode === "halfblocks") sourceScale = Math.min(1, Math.max(sourceScale, 2 / cell));
    source.width = Math.max(1, Math.round(canvas.width * sourceScale));
    source.height = Math.max(1, Math.round(canvas.height * sourceScale));
    image = sourceCtx.createImageData(source.width, source.height);
    columns = Math.ceil(canvas.width / stepX); rows = Math.ceil(canvas.height / stepY);
    values = new Float32Array(columns * rows); reds = new Float32Array(values.length); greens = new Float32Array(values.length); blues = new Float32Array(values.length);
  }

  function render(seconds: number) {
    const width = canvas.width, height = canvas.height, shader = recipe.shaderSource;
    const time = shader.animated ? seconds * shader.speed / 100 * (shader.reverse ? -1 : 1) : 0;
    const pixels = image.data, sw = source.width, sh = source.height, aspect = width / height, zoom = Math.max(0.1, shader.zoom / 48);
    const rotation = shader.rotate * Math.PI / 180, cs = Math.cos(rotation), sn = Math.sin(rotation);
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
      const px = ((x / sw - 0.5) * aspect + shader.offsetX / 100) / zoom;
      const py = ((y / sh - 0.5) + shader.offsetY / 100) / zoom;
      const u = px * cs - py * sn, v = px * sn + py * cs;
      const warp = shader.warp / 8;
      const fold = u * (5 + shader.paramA / 14) + Math.sin(v * 4.3 + time * 0.7) * warp + Math.sin(v * 9 - u * 2 + time * 0.35) * 0.4;
      const ribbon = Math.sin(fold + Math.sin(v * 6 + u * 3 + time * 0.5) * 1.1);
      const fine = Math.sin(fold * (2 + shader.detail / 32) - v * 7 + time) * 0.13;
      let value = clamp((ribbon * 0.5 + 0.5 + fine) * (0.6 + shader.intensity / 100) + (shader.brightness - 50) / 100);
      value = clamp((value - 0.5) * (0.55 + shader.contrast / 100) + 0.5 + (hash(x, y, shader.seed) - 0.5) * shader.grain / 500);
      const position = value * (palette.length - 1), low = Math.min(palette.length - 2, Math.floor(position)), mix = position - low;
      const i = (y * sw + x) * 4;
      for (let channel = 0; channel < 3; channel++) pixels[i + channel] = palette[low][channel] * (1 - mix) + palette[low + 1][channel] * mix;
      pixels[i + 3] = 255;
    }
    sourceCtx.putImageData(image, 0, 0);
    for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < columns; gx++) {
      let r = 0, g = 0, b = 0, count = 0;
      const cellX = gx * stepX + (recipe.renderMode === "hexagons" && gy % 2 ? stepX / 2 : 0), cellY = gy * stepY;
      const x0 = Math.min(sw - 1, Math.floor(cellX * sw / width));
      const x1 = Math.min(sw, Math.max(x0 + 1, Math.ceil((cellX + cell) * sw / width)));
      const y0 = Math.min(sh - 1, Math.floor(cellY * sh / height));
      const y1 = Math.min(sh, Math.max(y0 + 1, Math.ceil((cellY + cell) * sh / height)));
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const p = (y * sw + x) * 4; r += pixels[p]; g += pixels[p + 1]; b += pixels[p + 2]; count++;
      }
      const i = gy * columns + gx;
      reds[i] = r / count; greens[i] = g / count; blues[i] = b / count; values[i] = silkLuminance(reds[i], greens[i], blues[i]);
    }
    layerCtx.clearRect(0, 0, width, height);
    if (recipe.bgMode === "source") {
      layerCtx.save(); layerCtx.globalAlpha = recipe.bgOpacity / 100; layerCtx.filter = `blur(${recipe.bgBlur}px)`; layerCtx.drawImage(source, 0, 0, width, height); layerCtx.restore();
    } else { layerCtx.fillStyle = `rgba(2,1,10,${recipe.bgOpacity / 100})`; layerCtx.fillRect(0, 0, width, height); }
    layerCtx.save(); layerCtx.globalCompositeOperation = recipe.styleBlend;
    layerCtx.font = `${cell}px monospace`; layerCtx.textBaseline = "alphabetic";
    const animationTime = recipe.animated && recipe.animationSpeed.enabled ? seconds * recipe.animationSpeed.intensity / 100 : 0;
    const amount = recipe.animationIntensity / 100;
    for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < columns; gx++) {
      const i = gy * columns + gx, noise = hash(gx, gy, shader.seed);
      if (noise * 100 >= recipe.coverage) continue;
      const edge = silkEdge(values[i], values[gy * columns + Math.min(columns - 1, gx + 1)], values[Math.min(rows - 1, gy + 1) * columns + gx]);
      let v = clamp(values[i] + edge * recipe.edgeEmphasis / 100 + recipe.density / 100);
      if (recipe.invert) v = 1 - v;
      if (recipe.toneCurve === "ease-in") v *= v; else if (recipe.toneCurve === "ease-out") v = 1 - (1 - v) ** 2;
      let motion = 1;
      if (recipe.animated) {
        if (recipe.animStyle === "wave") motion += Math.sin(gx * 0.2 + animationTime * 2) * amount * 0.25;
        else if (recipe.animStyle === "pulse") motion += Math.sin(animationTime * 2) * amount * 0.25;
        else if (recipe.animStyle === "shimmer") motion += Math.sin(gx * 0.5 + gy * 0.6 + animationTime * 3) * amount * 0.25;
        else if (recipe.animStyle === "ripple") motion += Math.sin(Math.hypot(gx - columns / 2, gy - rows / 2) * 0.3 - animationTime * 3) * amount * 0.25;
        else motion += (hash(gx, gy, Math.floor(animationTime * 8)) - 0.5) * amount * 0.5;
      }
      const gray = values[i] * 255;
      const tone = clamp(v / (values[i] + 0.001), 0, 4);
      const red = correctedChannel(reds[i], gray, tint[0], motion, tone, edge, recipe);
      const green = correctedChannel(greens[i], gray, tint[1], motion, tone, edge, recipe);
      const blue = correctedChannel(blues[i], gray, tint[2], motion, tone, edge, recipe);
      const x = gx * stepX + (recipe.renderMode === "hexagons" && gy % 2 ? stepX / 2 : 0), y = gy * stepY;
      layerCtx.fillStyle = `rgb(${red},${green},${blue})`;
      if (recipe.renderMode === "halfblocks") {
        for (let half = 0; half < 2; half++) {
          const sx = Math.min(sw - 1, Math.floor((x + cell / 2) * sw / width));
          const sy = Math.min(sh - 1, Math.floor((y + cell * (half + 0.5) / 2) * sh / height));
          const p = (sy * sw + sx) * 4, sampleGray = silkLuminance(pixels[p], pixels[p + 1], pixels[p + 2]) * 255;
          const r = correctedChannel(pixels[p], sampleGray, tint[0], motion, tone, edge, recipe);
          const g = correctedChannel(pixels[p + 1], sampleGray, tint[1], motion, tone, edge, recipe);
          const b = correctedChannel(pixels[p + 2], sampleGray, tint[2], motion, tone, edge, recipe);
          layerCtx.fillStyle = `rgb(${r},${g},${b})`;
          layerCtx.fillRect(x, y + half * cell / 2, cell + 0.2, cell / 2 + 0.2);
        }
      } else if (recipe.renderMode === "contour") {
        if (gx + 1 < columns && gy + 1 < rows) drawContours(layerCtx, x + cell / 2, y + cell / 2, cell, values[i], values[i + 1], values[i + columns + 1], values[i + columns]);
      } else if (recipe.renderMode === "matrix") {
        const matrixTime = seconds * (recipe.animationSpeed.enabled ? recipe.animationSpeed.intensity / 100 : 1);
        const head = (matrixTime * (3 + hash(gx, 1) * 5) + hash(gx, 2) * rows) % (rows + 12);
        const distance = (head - gy + rows + 12) % (rows + 12);
        if (distance < 12) {
          const brightness = Math.round(255 * (1 - distance / 12));
          layerCtx.fillStyle = `rgb(${Math.round(brightness * 0.15)},${brightness},${Math.round(brightness * 0.35)})`;
          drawShape(layerCtx, "matrix", x, y, cell, v, i, matrixTime, recipe);
        }
      } else {
        drawShape(layerCtx, recipe.renderMode, x, y, cell, v, i, animationTime, recipe);
      }
    }
    layerCtx.restore();
    ctx.clearRect(0, 0, width, height);
    ctx.save(); if (recipe.blurType === "gaussian") ctx.filter = `blur(${recipe.blurAmount / 10}px)`; ctx.drawImage(layer, 0, 0); ctx.restore();
    const fx = recipe.pfx;
    if (fx.bloom.enabled) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = fx.bloom.intensity / 250; ctx.filter = `blur(${Math.max(1, cell)}px)`; ctx.drawImage(layer, 0, 0); ctx.restore(); }
    if (fx.chromatic.enabled) {
      ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = fx.chromatic.intensity / 600;
      for (const [color, offset] of [["#ff0000", 1], ["#00ffff", -1]] as const) {
        scratchCtx.clearRect(0, 0, width, height); scratchCtx.drawImage(layer, 0, 0);
        scratchCtx.globalCompositeOperation = "source-in"; scratchCtx.fillStyle = color; scratchCtx.fillRect(0, 0, width, height);
        scratchCtx.globalCompositeOperation = "source-over";
        ctx.drawImage(scratch, offset * Math.max(1, cell * 0.4), 0);
      }
      ctx.restore();
    }
    if (fx.vignette.enabled) { const gradient = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.15, width / 2, height / 2, Math.hypot(width, height) * 0.55); gradient.addColorStop(0, "rgba(0,0,0,0)"); gradient.addColorStop(1, `rgba(0,0,0,${fx.vignette.intensity / 100})`); ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height); }
    if (fx.scanLines.enabled) { ctx.fillStyle = `rgba(0,0,0,${fx.scanLines.intensity / 200})`; for (let y = 0; y < height; y += 3) ctx.fillRect(0, y, width, 1); }
    if (fx.filmGrain.enabled) { ctx.fillStyle = `rgba(255,255,255,${fx.filmGrain.intensity / 600})`; const frame = Math.floor(seconds * 12); for (let i = 0; i < width * height / 180; i++) ctx.fillRect(hash(i, frame) * width, hash(frame, i) * height, 1, 1); }
    if (fx.glitch.enabled && hash(Math.floor(seconds * 4), 8) < fx.glitch.intensity / 250) { const y = hash(Math.floor(seconds * 4), 9) * height; ctx.drawImage(layer, 0, y, width, Math.max(1, cell), cell * 2, y, width, Math.max(1, cell)); }
    if (fx.pixelate.enabled) { const scale = Math.max(2, Math.round(fx.pixelate.intensity / 10)); scratchCtx.clearRect(0, 0, width, height); scratchCtx.drawImage(canvas, 0, 0, width / scale, height / scale); ctx.imageSmoothingEnabled = false; ctx.drawImage(scratch, 0, 0, width / scale, height / scale, 0, 0, width, height); ctx.imageSmoothingEnabled = true; }
    if (fx.halftone.enabled) { ctx.fillStyle = `rgba(0,0,0,${fx.halftone.intensity / 200})`; for (let y = 0; y < height; y += 4) for (let x = 0; x < width; x += 4) { ctx.beginPath(); ctx.arc(x, y, 0.7, 0, Math.PI * 2); ctx.fill(); } }
    if (fx.filmDust.enabled) { ctx.fillStyle = `rgba(255,255,255,${fx.filmDust.intensity / 100})`; for (let i = 0; i < 8; i++) ctx.fillRect(hash(i, seconds) * width, hash(seconds, i) * height, 1, 2); }
    if (recipe.lights.enabled) for (const light of recipe.lights.points) { const x = light.x * width, y = light.y * height, gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, light.radius * Math.min(width, height))); gradient.addColorStop(0, light.color ?? recipe.tint); gradient.addColorStop(1, "transparent"); ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = clamp(light.intensity / 100); ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height); ctx.restore(); }
    if (recipe.mask.enabled && recipe.mask.dataUrl) {
      if (maskUrl !== recipe.mask.dataUrl) { maskUrl = recipe.mask.dataUrl; maskImage = new Image(); maskImage.src = maskUrl; }
      if (maskImage?.complete && maskImage.naturalWidth) {
        scratchCtx.clearRect(0, 0, width, height);
        scratchCtx.drawImage(source, 0, 0, width, height);
        scratchCtx.globalCompositeOperation = recipe.mask.invert ? "destination-out" : "destination-in";
        scratchCtx.drawImage(maskImage, 0, 0, width, height);
        scratchCtx.globalCompositeOperation = "source-over";
        ctx.drawImage(scratch, 0, 0);
      }
    }
  }
  return { resize, render };
}
