'use client';

import { useRef, useState } from 'react';
import { Canvas3D } from '@/components/Canvas3D';
import { ControlPanel } from '@/components/ControlPanel';
import { useThreeScene } from '@/hooks/useThreeScene';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    sceneState,
    handleCanvasClick,
    togglePlayPause,
    reset,
    setSpeed,
  } = useThreeScene(containerRef);

  return (
    <main ref={containerRef} style={{ width: '100vw', height: '100vh' }}>
      <Canvas3D />
      <ControlPanel
        sceneState={sceneState}
        onTogglePlay={togglePlayPause}
        onReset={reset}
        onSpeedChange={setSpeed}
      />
    </main>
  );
}