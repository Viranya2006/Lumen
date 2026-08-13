"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, MeshReflectorMaterial, Html } from "@react-three/drei";
import * as THREE from "three";
import { AssetPlaceholder } from "./AssetPlaceholder";
import { Loader2, RotateCw } from "lucide-react";

interface Asset3DViewerProps {
  assetId: number;
  name: string;
  category: string;
  imageUrl?: string;
}

function TokenGeometry({ category, imageUrl }: { category: string; imageUrl?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cat = (category || "").toLowerCase();

  // Pick colors based on category
  let primaryColor = "#D4A650"; // Amber default
  let metalness = 0.85;
  let roughness = 0.2;

  if (cat.includes("collectible")) {
    primaryColor = "#2DD4BF"; // Teal
    metalness = 0.9;
    roughness = 0.15;
  } else if (cat.includes("domain")) {
    primaryColor = "#818CF8";
    metalness = 0.7;
    roughness = 0.3;
  } else if (cat.includes("music")) {
    primaryColor = "#E879F9";
    metalness = 0.75;
    roughness = 0.25;
  } else if (cat.includes("photography")) {
    primaryColor = "#FBBF24";
    metalness = 0.8;
    roughness = 0.2;
  } else if (cat.includes("virtual")) {
    primaryColor = "#34D399";
    metalness = 0.85;
    roughness = 0.2;
  }

  // Smooth continuous rotation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
      <group>
        {/* Main 3D Token / Medallion */}
        <mesh ref={meshRef} castShadow receiveShadow>
          <cylinderGeometry args={[2.2, 2.2, 0.25, 64]} />
          <meshStandardMaterial
            color={primaryColor}
            metalness={metalness}
            roughness={roughness}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* Outer Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.35, 0.06, 32, 64]} />
          <meshStandardMaterial
            color="#FFFFFF"
            metalness={0.9}
            roughness={0.1}
            emissive={primaryColor}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Inner Core Detail */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.13]}>
          <ringGeometry args={[0.8, 1.8, 48]} />
          <meshStandardMaterial
            color="#15181C"
            roughness={0.4}
            metalness={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </Float>
  );
}

function Loader() {
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

  if (!mounted) {
    return (
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-surface flex items-center justify-center border border-surface-border">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Fallback for environments where WebGL is unsupported
  if (!webGLSupported) {
    return (
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-surface border border-surface-border">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <AssetPlaceholder category={category} name={name} assetId={assetId} />
        )}
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gradient-to-b from-[#13161A] to-[#0B0D10] border border-surface-border group shadow-2xl">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} color="#FFF5EA" />
        <directionalLight position={[-5, -4, -5]} intensity={0.8} color="#2DD4BF" />
        <pointLight position={[0, 0, 4]} intensity={0.5} color="#D4A650" />

        <Suspense fallback={<Loader />}>
          <TokenGeometry category={category} imageUrl={imageUrl} />
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
    </div>
  );
}
