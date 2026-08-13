"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { AssetPlaceholder } from "./AssetPlaceholder";
import { Loader2, RotateCw, Box, Image as ImageIcon } from "lucide-react";

interface Asset3DViewerProps {
  assetId: number;
  name: string;
  category: string;
  imageUrl?: string;
  isModalOpen?: boolean;
}

function ThreeDCardGeometry({
  imageUrl,
  category,
  name,
  assetId,
}: {
  imageUrl?: string;
  category: string;
  name: string;
  assetId: number;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(0.85);

  // Calculate dynamic image aspect ratio
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    };
  }, [imageUrl]);

  const cardHeight = 4.4;
  const cardWidth = Math.max(2.0, Math.min(5.5, cardHeight * aspectRatio));

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.45;
    }
  });

  const hasValidImage = Boolean(
    imageUrl &&
      (imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://") ||
        imageUrl.startsWith("data:"))
  );

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>
      <group ref={meshRef}>
        {/* Sleek 3D Slab Backing (Exact flush backing, zero margin) */}
        <mesh position={[0, 0, -0.03]}>
          <boxGeometry args={[cardWidth, cardHeight, 0.06]} />
          <meshStandardMaterial color="#15181C" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Full Edge-to-Edge 3D Image (Low zIndexRange to prevent modal clipping) */}
        <Html
          transform
          distanceFactor={3.5}
          zIndexRange={[0, 1]}
          position={[0, 0, 0.005]}
          style={{
            width: `${cardWidth * 85}px`,
            height: `${cardHeight * 85}px`,
            zIndex: 0,
          }}
          className="pointer-events-none select-none rounded-lg overflow-hidden shadow-2xl bg-transparent"
        >
          {hasValidImage ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <AssetPlaceholder category={category} name={name} assetId={assetId} />
          )}
        </Html>
      </group>
    </Float>
  );
}

function CanvasLoader() {
  return (
    <Html center zIndexRange={[0, 1]}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-surface/90 px-3 py-1.5 rounded-full border border-surface-border backdrop-blur-sm">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
        <span>Loading 3D Canvas...</span>
      </div>
    </Html>
  );
}

export function Asset3DViewer({
  assetId,
  name,
  category,
  imageUrl,
  isModalOpen = false,
}: Asset3DViewerProps) {
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setWebGLSupported(Boolean(gl));
    } catch {
      setWebGLSupported(false);
    }
  }, []);

  const hasValidImage = Boolean(
    imageUrl &&
      (imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://") ||
        imageUrl.startsWith("data:"))
  );

  if (!mounted) {
    return (
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-surface flex items-center justify-center border border-surface-border">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Switch to clean 2D view while modal dialog is open to prevent 3D CSS matrix overlap over backdrop
  const show2D = viewMode === "2d" || !webGLSupported || isModalOpen;

  return (
    <div className="space-y-2 relative z-0">
      {/* Mode Switcher Buttons */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface border border-surface-border text-xs">
          <button
            type="button"
            onClick={() => setViewMode("3d")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
              viewMode === "3d"
                ? "bg-accent text-[#0B0D10] font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Box className="w-3.5 h-3.5" /> 3D Interactive Card
          </button>
          <button
            type="button"
            onClick={() => setViewMode("2d")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
              viewMode === "2d"
                ? "bg-accent text-[#0B0D10] font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> High-Res Image
          </button>
        </div>
      </div>

      {/* Preview Display Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gradient-to-b from-[#13161A] to-[#0B0D10] border border-surface-border group shadow-2xl z-0">
        {show2D ? (
          <div className="w-full h-full relative bg-surface-subtle overflow-hidden flex items-center justify-center">
            {hasValidImage ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <AssetPlaceholder category={category} name={name} assetId={assetId} />
            )}
          </div>
        ) : (
          <>
            <Canvas
              camera={{ position: [0, 0, 6.5], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              dpr={[1, 2]}
              style={{ position: "relative", zIndex: 0 }}
            >
              <ambientLight intensity={0.9} />
              <directionalLight position={[5, 8, 5]} intensity={1.6} color="#FFF5EA" />
              <directionalLight position={[-5, -4, -5]} intensity={0.8} color="#2DD4BF" />
              <pointLight position={[0, 0, 4]} intensity={0.6} color="#D4A650" />

              <Suspense fallback={<CanvasLoader />}>
                <ThreeDCardGeometry
                  imageUrl={imageUrl}
                  category={category}
                  name={name}
                  assetId={assetId}
                />
              </Suspense>

              <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={(3 * Math.PI) / 4}
                autoRotate={false}
              />
            </Canvas>

            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface/80 border border-surface-border text-[11px] text-muted-foreground backdrop-blur-sm pointer-events-none select-none">
              <RotateCw className="w-3 h-3 text-accent" />
              <span>Drag to rotate 3D preview</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
