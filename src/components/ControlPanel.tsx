'use client';

import { useState } from 'react';
import { SceneState, PlanetData } from '@/lib/types';
import styles from '@/styles/canvas.module.css';

interface ControlPanelProps {
    sceneState: SceneState;
    onTogglePlay: () => void;
    onReset: () => void;
    onSpeedChange: (speed: number) => void;
}

export function ControlPanel({
    sceneState,
    onTogglePlay,
    onReset,
    onSpeedChange,
}: ControlPanelProps) {
    const [showInfo, setShowInfo] = useState(true);

    return (
        <div className={styles.controlPanel}>
            <div className={styles.header}>
                <h1>🌍 Sistema Solar 3D</h1>
                <button
                    className={styles.infoToggle}
                    onClick={() => setShowInfo(!showInfo)}
                    title="Toggle panel"
                >
                    ✕
                </button>
            </div>

            {showInfo && (
                <>
                    {/* Controles de reproducción */}
                    <div className={styles.controls}>
                        <button
                            className={styles.btn}
                            onClick={onTogglePlay}
                            title={sceneState.isPlaying ? 'Pausar' : 'Reanudar'}
                        >
                            {sceneState.isPlaying ? '⏸️ Pausar' : '▶️ Reanudar'}
                        </button>
                        <button
                            className={styles.btn}
                            onClick={onReset}
                            title="Reiniciar vista"
                        >
                            ↻ Reiniciar
                        </button>
                    </div>

                    {/* Control de velocidad */}
                    <div className={styles.speedControl}>
                        <label htmlFor="speed-slider">
                            Velocidad de simulación:
                        </label>
                        <input
                            id="speed-slider"
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={sceneState.speedMultiplier}
                            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                            className={styles.slider}
                        />
                        <span className={styles.speedValue}>
                            {sceneState.speedMultiplier.toFixed(1)}x
                        </span>
                    </div>

                    {/* Información del planeta */}
                    <PlanetInfo planet={sceneState.selectedPlanet} />

                    {/* Instrucciones */}
                    <div className={styles.instructions}>
                        <h4>Controles:</h4>
                        <ul>
                            <li>🖱️ Arrastra para rotar</li>
                            <li>🔍 Scroll para zoom</li>
                            <li>Click en planeta para info</li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}

interface PlanetInfoProps {
    planet: PlanetData | null;
}

function PlanetInfo({ planet }: PlanetInfoProps) {
    if (!planet) {
        return (
            <div className={styles.planetInfo}>
                <h3>ℹ️ Información</h3>
                <p>Haz click en un planeta para ver información</p>
            </div>
        );
    }

    return (
        <div className={styles.planetInfo}>
            <h3>{planet.name}</h3>
            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.label}>Distancia:</span>
                    <span className={styles.value}>{planet.info.distancia}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.label}>Temperatura:</span>
                    <span className={styles.value}>
                        {planet.info.temperatura}°C
                    </span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.label}>Duración del día:</span>
                    <span className={styles.value}>
                        {planet.info.dia} horas
                    </span>
                </div>
                {planet.info.radio && (
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Radio:</span>
                        <span className={styles.value}>{planet.info.radio}</span>
                    </div>
                )}
                {planet.info.masa && (
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Masa:</span>
                        <span className={styles.value}>{planet.info.masa}</span>
                    </div>
                )}
                {planet.info.lunas && (
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Lunas:</span>
                        <span className={styles.value}>{planet.info.lunas}</span>
                    </div>
                )}
            </div>
        </div>
    );
}