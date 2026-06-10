import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SceneManager } from '@/lib/three/SceneManager';
import { PlanetManager } from '@/lib/three/PlanetManager';
import { CameraControls } from '@/lib/three/CameraControls';
import { PlanetData, SceneState } from '@/lib/types';

export function useThreeScene(containerRef: React.RefObject<HTMLDivElement | null>) {
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const planetManagerRef = useRef<PlanetManager | null>(null);
    const cameraControlsRef = useRef<CameraControls | null>(null);
    const raycastRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

    const [sceneState, setSceneState] = useState<SceneState>({
        isPlaying: true,
        speedMultiplier: 1,
        selectedPlanet: null,
        time: 0,
    });

    // Inicializar escena
    useEffect(() => {
        if (!containerRef.current) return;

        // Crear gerentes
        const sceneManager = new SceneManager(containerRef.current);
        const scene = sceneManager.getScene();

        if (!scene) return;

        const planetManager = new PlanetManager(scene);
        planetManager.createAllPlanets();

        const camera = sceneManager.getCamera();
        const renderer = sceneManager.getRenderer();

        if (!camera || !renderer) return;

        const cameraControls = new CameraControls(camera, renderer);

        sceneManagerRef.current = sceneManager;
        planetManagerRef.current = planetManager;
        cameraControlsRef.current = cameraControls;

        // Loop de animación
        let animationId: number;

        const animate = () => {
            animationId = requestAnimationFrame(animate);

            if (sceneState.isPlaying) {
                planetManager.update(sceneState.speedMultiplier);
            }

            sceneManager.render();
        };

        animate();

        // Limpiar
        return () => {
            cancelAnimationFrame(animationId);
            sceneManager.dispose();
            cameraControls.dispose();
            planetManager.dispose();
        };
    }, []);

    // Actualizar cuando cambia el estado
    useEffect(() => {
        if (planetManagerRef.current) {
            // El estado se actualiza en el loop de animación
        }
    }, [sceneState.isPlaying, sceneState.speedMultiplier]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const canvas = sceneManagerRef.current?.getRenderer()?.domElement;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const camera = sceneManagerRef.current?.getCamera();
        if (camera && planetManagerRef.current) {
            const selectedPlanet = planetManagerRef.current.getSelectedPlanet(
                raycastRef.current,
                mouseRef.current,
                camera
            );

            setSceneState((prev) => ({
                ...prev,
                selectedPlanet,
            }));
        }
    };

    const togglePlayPause = () => {
        setSceneState((prev) => ({
            ...prev,
            isPlaying: !prev.isPlaying,
        }));
    };

    const reset = () => {
        cameraControlsRef.current?.reset();
        setSceneState((prev) => ({
            ...prev,
            isPlaying: true,
            speedMultiplier: 1,
            selectedPlanet: null,
        }));
    };

    const setSpeed = (speed: number) => {
        setSceneState((prev) => ({
            ...prev,
            speedMultiplier: speed,
        }));
    };

    return {
        sceneState,
        handleCanvasClick,
        togglePlayPause,
        reset,
        setSpeed,
    };
}