'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useLiteStore } from '@/lib/lite/store';
import { PlacedBox, PalletResult } from '@/lib/lite/types';
import { useMemo, useState } from 'react';

function Box({
  box,
  highlighted,
  dimmed,
  onClick,
}: {
  box: PlacedBox;
  highlighted: boolean;
  dimmed: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  // Scale from cm to scene units (1 unit = 1 cm)
  const scale = 0.01;
  const pos: [number, number, number] = [
    (box.x + box.length / 2) * scale,
    (box.z + box.height / 2) * scale,
    (box.y + box.width / 2) * scale,
  ];
  const size: [number, number, number] = [
    box.length * scale,
    box.height * scale,
    box.width * scale,
  ];

  return (
    <group>
      <mesh
        position={pos}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={box.color}
          transparent={dimmed}
          opacity={dimmed ? 0.15 : highlighted || hovered ? 1 : 0.85}
          emissive={highlighted || hovered ? box.color : '#000000'}
          emissiveIntensity={highlighted ? 0.3 : hovered ? 0.15 : 0}
        />
      </mesh>
      {/* Wireframe */}
      <mesh position={pos}>
        <boxGeometry args={size} />
        <meshBasicMaterial
          color="#000000"
          wireframe
          transparent
          opacity={dimmed ? 0.05 : 0.2}
        />
      </mesh>
    </group>
  );
}

function PalletBase({ lengthCm, widthCm }: { lengthCm: number; widthCm: number }) {
  const scale = 0.01;
  const thickness = 0.015; // 1.5cm pallet base height in scene units

  return (
    <mesh position={[lengthCm * scale / 2, -thickness / 2, widthCm * scale / 2]}>
      <boxGeometry args={[lengthCm * scale, thickness, widthCm * scale]} />
      <meshStandardMaterial color="#C4A36E" />
    </mesh>
  );
}

export default function Viewer3D({ palletResult }: { palletResult: PalletResult }) {
  const { highlightedLayer, setHighlightedLayer } = useLiteStore();
  const scale = 0.01;

  const palletLengthCm = palletResult.palletType.length / 10;
  const palletWidthCm = palletResult.palletType.width / 10;

  const center = useMemo(() => [
    palletLengthCm * scale / 2,
    palletResult.palletType.maxHeight * scale / 2,
    palletWidthCm * scale / 2,
  ] as [number, number, number], [palletLengthCm, palletWidthCm, palletResult.palletType.maxHeight]);

  const maxDim = Math.max(palletLengthCm, palletWidthCm, palletResult.palletType.maxHeight) * scale;

  return (
    <div className="w-full h-[350px] bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [maxDim * 2, maxDim * 1.5, maxDim * 2], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={0.8} />
        <directionalLight position={[-3, 4, -3]} intensity={0.3} />

        <PalletBase lengthCm={palletLengthCm} widthCm={palletWidthCm} />

        {palletResult.boxes.map((box, i) => (
          <Box
            key={i}
            box={box}
            highlighted={highlightedLayer === box.layer}
            dimmed={highlightedLayer !== null && highlightedLayer !== box.layer}
            onClick={() =>
              setHighlightedLayer(highlightedLayer === box.layer ? null : box.layer)
            }
          />
        ))}

        {/* Grid helper */}
        <gridHelper
          args={[maxDim * 3, 20, '#e0e0e0', '#f0f0f0']}
          position={[center[0], -0.02, center[2]]}
        />

        <OrbitControls
          target={center}
          enableDamping
          dampingFactor={0.1}
          minDistance={maxDim * 0.5}
          maxDistance={maxDim * 5}
        />
      </Canvas>
    </div>
  );
}

export function Viewer2D({ palletResult }: { palletResult: PalletResult }) {
  const { highlightedLayer } = useLiteStore();

  const palletLengthCm = palletResult.palletType.length / 10;
  const palletWidthCm = palletResult.palletType.width / 10;

  // Scale to fit in a 400x300 viewport
  const scaleX = 380 / palletLengthCm;
  const scaleY = 280 / palletWidthCm;
  const sc = Math.min(scaleX, scaleY);

  const layerBoxes = highlightedLayer !== null
    ? palletResult.boxes.filter(b => b.layer === highlightedLayer)
    : palletResult.boxes.filter(b => b.layer === 0);

  return (
    <div className="w-full h-[350px] bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
      <svg
        width={palletLengthCm * sc + 20}
        height={palletWidthCm * sc + 20}
        viewBox={`-10 -10 ${palletLengthCm * sc + 20} ${palletWidthCm * sc + 20}`}
      >
        {/* Pallet outline */}
        <rect
          x={0}
          y={0}
          width={palletLengthCm * sc}
          height={palletWidthCm * sc}
          fill="#F5E6D3"
          stroke="#C4A36E"
          strokeWidth={2}
        />

        {/* Boxes */}
        {layerBoxes.map((box, i) => (
          <g key={i}>
            <rect
              x={box.x * sc}
              y={box.y * sc}
              width={box.length * sc}
              height={box.width * sc}
              fill={box.color}
              fillOpacity={0.75}
              stroke="#ffffff"
              strokeWidth={1}
            />
            <text
              x={box.x * sc + box.length * sc / 2}
              y={box.y * sc + box.width * sc / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={Math.min(box.length * sc, box.width * sc) * 0.25}
              fill="white"
              fontWeight="bold"
            >
              {box.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
