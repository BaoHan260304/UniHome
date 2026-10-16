import { useEffect, useRef, useState } from 'react';

interface PanoramaViewerProps {
  imageUrl?: string;
  src?: string;
  title?: string;
  height?: string | number;
  className?: string;
}

export default function PanoramaViewer({
  imageUrl,
  src,
  title = 'Ảnh toàn cảnh 360°',
  height = '480px',
  className = '',
}: PanoramaViewerProps) {
  const finalUrl = src || imageUrl || '';
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [zoom, setZoom] = useState(1);

  // View state
  const stateRef = useRef({
    lon: 0,
    lat: 0,
    fov: 75,
    isUserInteracting: false,
    onMouseDownMouseX: 0,
    onMouseDownMouseY: 0,
    onMouseDownLon: 0,
    onMouseDownLat: 0,
    img: null as HTMLImageElement | null,
    animId: 0,
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = finalUrl;

    img.onload = () => {
      if (!active) return;
      stateRef.current.img = img;
      setLoading(false);
      renderFrame();
    };

    img.onerror = () => {
      if (!active) return;
      setError('Không thể tải hình ảnh panorama 360°');
      setLoading(false);
    };

    return () => {
      active = false;
      cancelAnimationFrame(stateRef.current.animId);
    };
  }, [finalUrl]);

  const renderFrame = () => {
    const canvas = canvasRef.current;
    const img = stateRef.current.img;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Auto rotate
    if (isAutoRotate && !stateRef.current.isUserInteracting) {
      stateRef.current.lon = (stateRef.current.lon + 0.15) % 360;
    }

    // Equirectangular cylindrical slice rendering
    const currentLon = ((stateRef.current.lon % 360) + 360) % 360;
    const currentLat = Math.max(-85, Math.min(85, stateRef.current.lat));

    // Calculate source rect
    const srcX = (currentLon / 360) * img.width;
    const srcY = ((currentLat + 90) / 180) * (img.height * 0.4);

    const aspect = width / height;
    const effectiveFov = stateRef.current.fov / zoom;
    const fovFrac = effectiveFov / 360;
    const srcW = img.width * fovFrac;
    const srcH = (srcW / aspect);

    // Draw panoramic image with wrap-around
    if (srcX + srcW <= img.width) {
      ctx.drawImage(img, srcX, Math.max(0, srcY), srcW, Math.min(img.height, srcH), 0, 0, width, height);
    } else {
      const part1W = img.width - srcX;
      const part2W = srcW - part1W;
      const dest1W = (part1W / srcW) * width;
      const dest2W = width - dest1W;

      ctx.drawImage(img, srcX, Math.max(0, srcY), part1W, Math.min(img.height, srcH), 0, 0, dest1W, height);
      ctx.drawImage(img, 0, Math.max(0, srcY), part2W, Math.min(img.height, srcH), dest1W, 0, dest2W, height);
    }

    stateRef.current.animId = requestAnimationFrame(renderFrame);
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        renderFrame();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse & Touch events
  const onPointerDown = (e: React.PointerEvent) => {
    const s = stateRef.current;
    s.isUserInteracting = true;
    s.onMouseDownMouseX = e.clientX;
    s.onMouseDownMouseY = e.clientY;
    s.onMouseDownLon = s.lon;
    s.onMouseDownLat = s.lat;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = stateRef.current;
    if (!s.isUserInteracting) return;
    const dx = e.clientX - s.onMouseDownMouseX;
    const dy = e.clientY - s.onMouseDownMouseY;
    s.lon = (s.onMouseDownLon - dx * 0.18 / zoom) % 360;
    s.lat = Math.max(-85, Math.min(85, s.onMouseDownLat + dy * 0.18 / zoom));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    stateRef.current.isUserInteracting = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.7, Math.min(2.5, prev - e.deltaY * 0.0015)));
  };

  const toggleFullscreen = () => {
    const elem = containerRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const resetView = () => {
    stateRef.current.lon = 0;
    stateRef.current.lat = 0;
    setZoom(1);
  };

  return (
    <div
      ref={containerRef}
      style={{ height: isFullscreen ? '100vh' : height }}
      className={`relative w-full bg-black rounded-2xl overflow-hidden select-none group shadow-inner ${className}`}
    >
      {/* 360 Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>{title}</span>
      </div>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/20 text-white">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
          className="p-1.5 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
          title="Phóng to"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))}
          className="p-1.5 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
          title="Thu nhỏ"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => setIsAutoRotate(!isAutoRotate)}
          className={`px-2 py-1 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors ${
            isAutoRotate ? 'bg-indigo-600/80 text-white' : ''
          }`}
          title="Tự động xoay"
        >
          {isAutoRotate ? 'Dừng xoay' : 'Tự xoay'}
        </button>
        <button
          type="button"
          onClick={resetView}
          className="px-2 py-1 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors"
          title="Góc nhìn mặc định"
        >
          Đặt lại
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 hover:bg-white/20 rounded-lg text-xs transition-colors"
          title="Toàn màn hình"
        >
          {isFullscreen ? '⛶ Thu nhỏ' : '⛶ Toàn màn hình'}
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Hint overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-xs text-white/90 text-xs px-4 py-1.5 rounded-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
        🖱 Kéo chuột hoặc ngón tay để nhìn quanh không gian 360° • Cuộn chuột để phóng to/thu nhỏ
      </div>

      {loading && (
        <div className="absolute inset-0 z-30 bg-gray-900/80 flex flex-col items-center justify-center text-white">
          <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="text-sm font-semibold">Đang tải toàn cảnh 360°...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-30 bg-gray-900/90 flex flex-col items-center justify-center text-red-400 p-6 text-center">
          <span className="text-2xl mb-2">⚠️</span>
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}
    </div>
  );
}
