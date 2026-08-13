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

  const cat = (category || "").toLowerCase();
  let borderColor = "#D4A650"; // Gold
  if (cat.includes("collectible")) borderColor = "#2DD4BF";
  else if (cat.includes("domain")) borderColor = "#818CF8";
  else if (cat.includes("music")) borderColor = "#E879F9";
  else if (cat.includes("photography")) borderColor = "#FBBF24";

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

  const cardHeight = 4.2;
  const cardWidth = Math.max(2.4, Math.min(5.2, cardHeight * aspectRatio));

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
        {/* Main 3D Metallic Card Frame Box (Scaled dynamically) */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[cardWidth, cardHeight, 0.14]} />
          <meshStandardMaterial color={borderColor} metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Outer Metallic Bevel Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[cardWidth + 0.12, cardHeight + 0.12, 0.07]} />
          <meshStandardMaterial color={borderColor} metalness={0.95} roughness={0.12} />
        </mesh>

        {/* Front Face: Dynamic 3D HTML Image matching the card bounds 100% */}
        <Html
          transform
          distanceFactor={3.5}
          position={[0, 0, 0.075]}
          style={{
            width: `${cardWidth * 78}px`,
            height: `${cardHeight * 78}px`,
          }}
          className="pointer-events-none select-none rounded-sm overflow-hidden shadow-2xl bg-[#15181C]"
        >
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
        </Html>

        {/* Back Face: Sleek Dark Metallic Emblem */}
        <mesh position={[0, 0, -0.075]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[cardWidth - 0.05, cardHeight - 0.05]} />
          <meshStandardMaterial color="#0B0D10" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>
    </Float>
  );
}

function TokenCylinderGeometry({ category }: { category: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cat = (category || "").toLowerCase();

  let primaryColor = "#D4A650";
  if (cat.includes("collectible")) primaryColor = "#2DD4BF";
  else if (cat.includes("domain")) primaryColor = "#818CF8";
  else if (cat.includes("music")) primaryColor = "#E879F9";

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
      <group>
        <mesh ref={meshRef} castShadow receiveShadow>
          <cylinderGeometry args={[2.2, 2.2, 0.25, 64]} />
          <meshStandardMaterial color={primaryColor} metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.35, 0.06, 32, 64]} />
          <meshStandardMaterial color="#FFFFFF" metalness={0.9} roughness={0.1} emissive={primaryColor} emissiveIntensity={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

function CanvasLoader() {
  return (
    <Html center>
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

  return (
    <div className="space-y-2">
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
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gradient-to-b from-[#13161A] to-[#0B0D10] border border-surface-border group shadow-2xl">
        {viewMode === "2d" || !webGLSupported ? (
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
