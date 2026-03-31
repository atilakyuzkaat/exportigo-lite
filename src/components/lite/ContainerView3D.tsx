'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ContainerResult, PalletResult } from '@/lib/lite/types';
import { useLiteStore } from '@/lib/lite/store';
import { useMemo } from 'react';
import * as THREE from 'three';

const PALLET_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

function ContainerBox({ containerType }: { containerType: ContainerResult['containerType'] }) {
  const scale = 0.001;
  const l = containerType.lengthMM * scale;
  const w = containerType.widthMM * scale;
  const h = containerType.heightMM * scale;

  const edgeGeo = useMemo(() => new THREE.BoxGeometry(l, h, w), [l, w, h]);

  return (
    <group>
      {/* Floor */}
      <mesh position={[l / 2, 0.005, w / 2]}>
        <boxGeometry args={[l, 0.01, w]} />
        <meshStandardMaterial color="#6B5B45" />
      </mesh>

      {/* Back wall */}
      <mesh position={[l, h / 2, w / 2]}>
        <boxGeometry args={[0.02, h, w]} />
        <meshStandardMaterial color="#5BA3E6" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* Left wall */}
      <mesh position={[l / 2, h / 2, 0]}>
        <boxGeometry args={[l, h, 0.02]} />
        <meshStandardMaterial color="#5BA3E6" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* Right wall */}
      <mesh position={[l / 2, h / 2, w]}>
        <boxGeometry args={[l, h, 0.02]} />
        <meshStandardMaterial color="#5BA3E6" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[l / 2, h, w / 2]}>
        <boxGeometry args={[l, 0.02, w]} />
        <meshStandardMaterial color="#5BA3E6" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Bold wireframe edges */}
      <lineSegments position={[l / 2, h / 2, w / 2]}>
        <edgesGeometry args={[edgeGeo]} />
        <lineBasicMaterial color="#2563EB" linewidth={2} />
      </lineSegments>

      {/* Corner posts - vertical */}
      {[[0, 0], [l, 0], [0, w], [l, w]].map(([x, z], i) => (
        <mesh key={`post-${i}`} position={[x, h / 2, z]}>
          <boxGeometry args={[0.04, h, 0.04]} />
          <meshStandardMaterial color="#2563EB" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Top edge beams */}
      <mesh position={[l / 2, h, 0]}><boxGeometry args={[l, 0.03, 0.03]} /><meshStandardMaterial color="#2563EB" transparent opacity={0.5} /></mesh>
      <mesh position={[l / 2, h, w]}><boxGeometry args={[l, 0.03, 0.03]} /><meshStandardMaterial color="#2563EB" transparent opacity={0.5} /></mesh>
      <mesh position={[0, h, w / 2]}><boxGeometry args={[0.03, 0.03, w]} /><meshStandardMaterial color="#2563EB" transparent opacity={0.5} /></mesh>
      <mesh position={[l, h, w / 2]}><boxGeometry args={[0.03, 0.03, w]} /><meshStandardMaterial color="#2563EB" transparent opacity={0.5} /></mesh>

      {/* Bottom edge beams */}
      <mesh position={[l / 2, 0, 0]}><boxGeometry args={[l, 0.03, 0.03]} /><meshStandardMaterial color="#2563EB" transparent opacity={0.5} /></mesh>
      <mesh position={[l / 2, 0, w]}><boxGeometry args={[l, 0.03, 0.03]} /><meshStandardMaterial color="#2563EB" transparent opacity={0.5} /></mesh>
      <mesh position={[0, 0, w / 2]}><boxGeometry args={[0.03, 0.03, w]} /><meshStandardMaterial color="#2563EB" transparent opacity={0.5} /></mesh>
      <mesh position={[l, 0, w / 2]}><boxGeometry args={[0.03, 0.03, w]} /><meshStandardMaterial color="#2563EB" transparent opacity={0.5} /></mesh>
    </group>
  );
}

function PalletMesh({
  pallet,
  palletResult,
  colorIndex,
}: {
  pallet: { x: number; y: number; z: number; rotated: boolean };
  palletResult: PalletResult;
  colorIndex: number;
}) {
  const scale = 0.001;
  const pt = palletResult.palletType;
  const l = (pallet.rotated ? pt.width : pt.length) * scale;
  const w = (pallet.rotated ? pt.length : pt.width) * scale;
  const h = pt.maxHeight * 0.01;

  const color = PALLET_COLORS[colorIndex % PALLET_COLORS.length];

  return (
    <group position={[pallet.x * scale, 0, pallet.y * scale]}>
      {/* Pallet base */}
      <mesh position={[l / 2, 0.075, w / 2]}>
        <boxGeometry args={[l, 0.15, w]} />
        <meshStandardMaterial color="#C4A36E" />
      </mesh>

      {/* Load block */}
      <mesh position={[l / 2, 0.15 + h * (palletResult.fillPercentVolume / 100) / 2, w / 2]}>
        <boxGeometry args={[l * 0.95, h * (palletResult.fillPercentVolume / 100), w * 0.95]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>

      {/* Wireframe around load */}
      <mesh position={[l / 2, 0.15 + h * (palletResult.fillPercentVolume / 100) / 2, w / 2]}>
        <boxGeometry args={[l * 0.95, h * (palletResult.fillPercentVolume / 100), w * 0.95]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

export default function ContainerView3D({ containerResult }: { containerResult: ContainerResult }) {
  const { palletResults } = useLiteStore();
  const ct = containerResult.containerType;
  const scale = 0.001;

  const center = useMemo(() => [
    ct.lengthMM * scale / 2,
    ct.heightMM * scale / 2,
    ct.widthMM * scale / 2,
  ] as [number, number, number], [ct.lengthMM, ct.heightMM, ct.widthMM]);

  const maxDim = Math.max(ct.lengthMM, ct.widthMM, ct.heightMM) * scale;

  return (
    <div className="w-full h-full min-h-[300px] bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [maxDim * 0.8, maxDim * 0.6, maxDim * 0.8], fov: 50 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={0.8} />
        <directionalLight position={[-5, 8, -5]} intensity={0.4} />

        <ContainerBox containerType={ct} />

        {containerResult.pallets.map((p, i) => {
          const pr = palletResults.find(r => r.id === p.palletResultId) || palletResults[0];
          return (
            <PalletMesh
              key={i}
              pallet={p}
              palletResult={pr}
              colorIndex={i}
            />
          );
        })}

        <gridHelper
          args={[maxDim * 2, 20, '#d0d0d0', '#e8e8e8']}
          position={[center[0], -0.01, center[2]]}
        />

        <OrbitControls
          target={center}
          enableDamping
          dampingFactor={0.1}
          minDistance={maxDim * 0.3}
          maxDistance={maxDim * 3}
        />
      </Canvas>
    </div>
  );
}
