// Tipos principales del proyecto

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface PlanetData {
    name: string;
    size: number;           // Radio relativo
    distance: number;       // Distancia del Sol (en unidades)
    speed: number;          // Velocidad orbital
    color: number;          // Color hexadecimal
    texture: string | null; // Ruta a textura
    hasRings?: boolean;     // Si tiene anillos (ej: Saturno)
    info: PlanetInfo;
}

export interface PlanetInfo {
    dia: number;              // Duración del día en horas
    temperatura: number;      // Temperatura en °C
    distancia: string;        // Distancia del Sol en km
    radio?: string;           // Radio del planeta
    masa?: string;            // Masa relativa
    lunas?: number;           // Número de lunas
    gravedad?: number;        // Gravedad superficial
}

export interface SunData {
    size: number;
    color: number;
    texture: string;
    info: {
        temperatura: number;
        radio: string;
        masa: string;
    };
}

export interface CameraState {
    position: Vector3;
    lookAt: Vector3;
    distance: number;
    theta: number;  // Ángulo horizontal
    phi: number;    // Ángulo vertical
}

export interface SceneState {
    isPlaying: boolean;
    speedMultiplier: number;
    selectedPlanet: PlanetData | null;
    time: number;
}

export interface ThreeObjects {
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    planets: Map<string, THREE.Group>;
    sun?: THREE.Mesh;
}