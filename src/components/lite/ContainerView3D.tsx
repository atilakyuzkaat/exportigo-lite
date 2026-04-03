'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ContainerResult, PalletResult } from '@/lib/lite/types';
import { useLiteStore } from '@/lib/lite/store';
import { useMemo } from 'react';
import * as THREE from 'three';

const PALLET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

function ContainerBox({ containerType }: { containerType: ContainerResult['containerType'] }) {
  const s = 0.001;
  const l = containerType.lengthMM * s;
  const w = containerType.widthMM * s;
  const h = containerType.heightMM * s;

  const edgeGeo = useMemo(() => new THREE.BoxGeometry(l, h, w), [l, w, h]);

  return (
    <group>
      {/* Floor */}
      <mesh position={[l / 2, 0.005, w / 2]}>
        <boxGeometry args={[l, 0.01, w]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* Wireframe edges */}
      <lineSegments position={[l / 2, h / 2, w / 2]}>
        <edgesGeometry args={[edgeGeo]} />
        <lineBasicMaterial color="#2563EB" linewidth={2} />
      </lineSegments>

      {/* Corner posts */}
      {[[0, 0], [l, 0], [0, w], [l, w]].map(([x, z], i) => (
        <mesh key={`post-${i}`} position={[x, h / 2, z]}>
          <boxGeometry args={[0.04, h, 0.04]} />
          <meshStandardMaterial color="#1E40AF" />
        </mesh>
      ))}

      {/* Top beams */}
      <mesh position={[l / 2, h, 0]}><boxGeometry args={[l, 0.03, 0.03]} /><meshStandardMaterial color="#1E40AF" /></mesh>
      <mesh position={[l / 2, h, w]}><boxGeometry args={[l, 0.03, 0.03]} /><meshStandardMaterial color="#1E40AF" /></mesh>
      <mesh position={[0, h, w / 2]}><boxGeometry args={[0.03, 0.03, w]} /><meshStandardMaterial color="#1E40AF" /></mesh>
      <mesh position={[l, h, w / 2]}><boxGeometry args={[0.03, 0.03, w]} /><meshStandardMaterial color="#1E40AF" /></mesh>

      {/* Bottom beams */}
      <mesh position={[l / 2, 0, 0]}><boxGeometry args={[l, 0.03, 0.03]} /><meshStandardMaterial color="#1E40AF" /></mesh>
      <mesh position={[l / 2, 0, w]}><boxGeometry args={[l, 0.03, 0.03]} /><meshStandardMaterial color="#1E40AF" /></mesh>
      <mesh position={[0, 0, w / 2]}><boxGeometry args={[0.03, 0.03, w]} /><meshStandardMaterial color="#1E40AF" /></mesh>
      <mesh position={[l, 0, w / 2]}><boxGeometry args={[0.03, 0.03, w]} /><meshStandardMaterial color="#1E40AF" /></mesh>

      {/* Semi-transparent walls - rendered last with depthWrite off */}
      <mesh position={[l, h / 2, w / 2]} renderOrder={999}>
        <boxGeometry args={[0.01, h, w]} />
        <meshStandardMaterial color="#93C5FD" transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[l / 2, h / 2, 0]} renderOrder={999}>
        <boxGeometry args={[l, h, 0.01]} />
        <meshStandardMaterial color="#93C5FD" transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[l / 2, h / 2, w]} renderOrder={999}>
        <boxGeometry args={[l, h, 0.01]} />
        <meshStandardMaterial color="#93C5FD" transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[l / 2, h, w / 2]} renderOrder={999}>
        <boxGeometry args={[l, 0.01, w]} />
        <meshStandardMaterial color="#93C5FD" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
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
  const s = 0.001;
  const pt = palletResult.palletType;
  const pL = (pallet.rotated ? pt.width : pt.length) * s;
  const pW = (pallet.rotated ? pt.length : pt.width) * s;
  const baseH = 0.15; // pallet base 150mm

  // Calculate actual load height from boxes
  const maxBoxY = palletResult.boxes.reduce((max, box) => {
    return Math.max(max, (box.y + box.h));
  }, 0);
  const loadH = maxBoxY * s;

  const color = PALLET_COLORS[colorIndex % PALLET_COLORS.length];

  return (
    <group position={[pallet.x * s, 0, pallet.y * s]}>
      {/* Pallet base (wood) */}
      <mesh position={[pL / 2, baseH / 2, pW / 2]}>
        <boxGeometry args={[pL, baseH, pW]} />
        <meshStandardMaterial color="#C4A36E" />
      </mesh>

      {/* Load block - OPAQUE, no transparency issues */}
      {loadH > 0 && (
        <mesh position={[pL / 2, baseH + loadH / 2, pW / 2]}>
          <boxGeometry args={[pL * 0.96, loadH, pW * 0.96]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}

      {/* Top highlight edge */}
      {loadH > 0 && (
        <mesh position={[pL / 2, baseH + loadH, pW / 2]}>
          <boxGeometry args={[pL * 0.96, 0.005, pW * 0.96]} />
          <meshStandardMaterial color="white" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

export default function ContainerView3D({ containerResult }: { containerResult: ContainerResult }) {
  const { palletResults } = useLiteStore();
  const ct = containerResult.containerType;
  const s = 0.001;

  const center = useMemo(() => [
    ct.lengthMM * s / 2,
    ct.heightMM * s / 2,
    ct.widthMM * s / 2,
  ] as [number, number, number], [ct.lengthMM, ct.heightMM, ct.widthMM]);

  const maxDim = Math.max(ct.lengthMM, ct.widthMM, ct.heightMM) * s;

  return (
    <div className="w-full h-full min-h-[300px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [maxDim * 1.0, maxDim * 0.7, maxDim * 1.0], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#1e293b']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 15, 10]} intensity={1.0} />
        <directionalLight position={[-5, 8, -5]} intensity={0.5} />
        <pointLight position={[0, 10, 0]} intensity={0.3} />

        <ContainerBox containerType={ct} />

        {containerResult.pallets.map((p, i) => {
          const pr = palletResults.find(r => r.id === p.palletResultId) || palletResults[0];
          return pr ? (
            <PalletMesh
              key={i}
              pallet={p}
              palletResult={pr}
              colorIndex={i}
            />
          ) : null;
        })}

        <gridHelper
          args={[maxDim * 2, 20, '#475569', '#334155']}
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
