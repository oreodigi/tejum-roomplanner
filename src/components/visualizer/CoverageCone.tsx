'use client';

import type { CoverageData } from '@/lib/types';

export function CoverageCone({ coverage }: { coverage: CoverageData }) {
  if (coverage.kind === 'network') {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <circleGeometry args={[coverage.rangeM, 40]} />
        <meshBasicMaterial color="#14b8a6" transparent opacity={0.09} depthWrite={false} />
      </mesh>
    );
  }

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 1.25]}>
      <coneGeometry args={[coverage.rangeM * 0.62, coverage.rangeM, 28, 1, true]} />
      <meshBasicMaterial color={coverage.kind === 'camera' ? '#ffce26' : '#14b8a6'} transparent opacity={0.13} depthWrite={false} />
    </mesh>
  );
}
