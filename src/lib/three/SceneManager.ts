import * as THREE from 'three';
import { CAMERA_CONFIG, LIGHTS_CONFIG } from './constants';
import { ThreeObjects, CameraState } from '../types';

export class SceneManager {
    private container: HTMLDivElement | null = null;
    private objects: ThreeObjects = {
        planets: new Map(),
    };

    constructor(containerElement: HTMLDivElement) {
        this.container = containerElement;
        this.initScene();
    }

    private initScene(): void {
        if (!this.container) return;

        // Crear escena
        this.objects.scene = new THREE.Scene();
        this.objects.scene.background = new THREE.Color(0x000000);

        // Crear cámara
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.objects.camera = new THREE.PerspectiveCamera(
            CAMERA_CONFIG.fov,
            width / height,
            CAMERA_CONFIG.near,
            CAMERA_CONFIG.far
        );

        const { initialPosition } = CAMERA_CONFIG;
        this.objects.camera.position.set(
            initialPosition.x,
            initialPosition.y,
            initialPosition.z
        );
        this.objects.camera.lookAt(0, 0, 0);

        // Crear renderer
        this.objects.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            precision: 'highp' as any,
        });

        this.objects.renderer.setSize(width, height);
        this.objects.renderer.setPixelRatio(window.devicePixelRatio);
        this.objects.renderer.shadowMap.enabled = true;
        this.objects.renderer.shadowMap.type = THREE.PCFShadowMap;

        this.container.appendChild(this.objects.renderer.domElement);

        // Configurar iluminación
        this.setupLights();

        // Agregar estrellas de fondo
        this.addStars();

        // Event listeners para resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    private setupLights(): void {
        if (!this.objects.scene) return;

        const { ambient, sun, fill } = LIGHTS_CONFIG;

        // Luz ambiental - AUMENTAR intensidad
        const ambientLight = new THREE.AmbientLight(ambient.color, 0.6);  // ← Cambiar de 0.4 a 0.6
        this.objects.scene.add(ambientLight);

        // Luz puntual en el Sol - AUMENTAR intensidad
        const sunLight = new THREE.PointLight(sun.color, 3, 5000);  // ← Cambiar de 2 a 3
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        this.objects.scene.add(sunLight);

        // Luz de relleno - AUMENTAR
        const fillLight = new THREE.DirectionalLight(fill.color, 0.4);  // ← Cambiar de 0.2 a 0.4
        fillLight.position.set(100, 100, 100);
        this.objects.scene.add(fillLight);
    }

    private addStars(): void {
        if (!this.objects.scene) return;

        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 100,
            sizeAttenuation: true,
        });

        const starsVertices: number[] = [];
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 40000;
            const y = (Math.random() - 0.5) * 40000;
            const z = (Math.random() - 0.5) * 40000;
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(starsVertices), 3)
        );

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.objects.scene.add(stars);
    }

    private onWindowResize(): void {
        if (!this.objects.camera || !this.objects.renderer) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.objects.camera.aspect = width / height;
        this.objects.camera.updateProjectionMatrix();

        this.objects.renderer.setSize(width, height);
    }

    getScene(): THREE.Scene | undefined {
        return this.objects.scene;
    }

    getCamera(): THREE.PerspectiveCamera | undefined {
        return this.objects.camera;
    }

    getRenderer(): THREE.WebGLRenderer | undefined {
        return this.objects.renderer;
    }

    getObjects(): ThreeObjects {
        return this.objects;
    }

    render(): void {
        if (!this.objects.renderer || !this.objects.scene || !this.objects.camera) {
            return;
        }

        this.objects.renderer.render(this.objects.scene, this.objects.camera);
    }

    dispose(): void {
        if (this.objects.renderer) {
            this.objects.renderer.dispose();
            this.container?.removeChild(this.objects.renderer.domElement);
        }
    }
}