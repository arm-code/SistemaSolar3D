'use client';

import { useRef, useEffect } from 'react';
import { useThreeScene } from '@/hooks/useThreeScene';
import styles from '@/styles/canvas.module.css';

export function Canvas3D() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { sceneState, handleCanvasClick } = useThreeScene(containerRef);

    return (
        <div
            ref={containerRef}
            className={styles.container}
            onClick={handleCanvasClick}
        />
    );
}