import { useEffect, useRef, useState, useCallback } from 'react';
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
    const animationIdRef = useRef<number | null>(null);
    const isInitializedRef = useRef(false);

    const [sceneState, setSceneState] = useState<SceneState>({
        isPlaying: true,
        speedMultiplier: 1,
        selectedPlanet: null,
        time: 0,
    });

    // Inicializar escena solo una vez
    useEffect(() => {
        if (isInitializedRef.current || !containerRef.current) return;

        isInitializedRef.current = true;

        console.log('🚀 Inicializando escena...');

        try {
            // Crear gerentes
            const sceneManager = new SceneManager(containerRef.current);
            const scene = sceneManager.getScene();

            if (!scene) {
                console.error('❌ No se pudo crear la escena');
                return;
            }

            const planetManager = new PlanetManager(scene);
            planetManager.createAllPlanets();

            const camera = sceneManager.getCamera();
            const renderer = sceneManager.getRenderer();

            if (!camera || !renderer) {
                console.error('❌ No se pudo obtener cámara o renderer');
                return;
            }

            const cameraControls = new CameraControls(camera, renderer);

            sceneManagerRef.current = sceneManager;
            planetManagerRef.current = planetManager;
            cameraControlsRef.current = cameraControls;

            console.log('✅ Escena inicializada correctamente');

            // Loop de animación
            const animate = () => {
                if (sceneManagerRef.current && planetManagerRef.current && sceneState.isPlaying) {
                    planetManagerRef.current.update(sceneState.speedMultiplier);
                }

                sceneManagerRef.current?.render();
                animationIdRef.current = requestAnimationFrame(animate);
            };

            animate();

            // Limpiar al desmontar
            return () => {
                console.log('🧹 Limpiando escena...');

                if (animationIdRef.current) {
                    cancelAnimationFrame(animationIdRef.current);
                }

                sceneManagerRef.current?.dispose();
                cameraControlsRef.current?.dispose();
                planetManagerRef.current?.dispose();

                sceneManagerRef.current = null;
                planetManagerRef.current = null;
                cameraControlsRef.current = null;
                isInitializedRef.current = false;
            };
        } catch (error) {
            console.error('❌ Error inicializando escena:', error);
            isInitializedRef.current = false;
        }
    }, [containerRef]); // Solo en montaje

    // Actualizar estado de reproducción sin reinicializar
    useEffect(() => {
        if (!planetManagerRef.current) return;
        // El estado se usa en el loop de animación
    }, [sceneState.isPlaying, sceneState.speedMultiplier]);

    const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
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
    }, []);

    const togglePlayPause = useCallback(() => {
        setSceneState((prev) => ({
            ...prev,
            isPlaying: !prev.isPlaying,
        }));
    }, []);

    const reset = useCallback(() => {
        cameraControlsRef.current?.reset();
        setSceneState((prev) => ({
            ...prev,
            isPlaying: true,
            speedMultiplier: 1,
            selectedPlanet: null,
        }));
    }, []);

    const setSpeed = useCallback((speed: number) => {
        setSceneState((prev) => ({
            ...prev,
            speedMultiplier: speed,
        }));
    }, []);

    return {
        sceneState,
        handleCanvasClick,
        togglePlayPause,
        reset,
        setSpeed,
    };
}