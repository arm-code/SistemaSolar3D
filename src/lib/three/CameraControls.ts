import * as THREE from 'three';

export class CameraControls {
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private isRotating: boolean = false;
    private previousMousePosition: { x: number; y: number } = { x: 0, y: 0 };
    private cameraDistance: number = 150;
    private minDistance: number = 20;
    private maxDistance: number = 500;
    private theta: number = Math.PI / 4;
    private phi: number = Math.PI / 3;

    constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        this.camera = camera;
        this.renderer = renderer;
        this.setupEventListeners();
        this.updateCameraPosition();
    }

    private setupEventListeners(): void {
        const canvas = this.renderer.domElement;

        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
        canvas.addEventListener('wheel', (e) => this.onMouseWheel(e), false);
    }

    private onMouseDown(event: MouseEvent): void {
        this.isRotating = true;
        this.previousMousePosition = { x: event.clientX, y: event.clientY };
    }

    private onMouseMove(event: MouseEvent): void {
        if (!this.isRotating) return;

        const deltaX = event.clientX - this.previousMousePosition.x;
        const deltaY = event.clientY - this.previousMousePosition.y;

        const rotationSpeed = 0.005;
        this.theta -= deltaX * rotationSpeed;
        this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi + deltaY * rotationSpeed));

        this.updateCameraPosition();
        this.previousMousePosition = { x: event.clientX, y: event.clientY };
    }

    private onMouseUp(): void {
        this.isRotating = false;
    }

    private onMouseWheel(event: WheelEvent): void {
        event.preventDefault();

        if (event.deltaY > 0) {
            this.cameraDistance *= 1.1;
        } else {
            this.cameraDistance *= 0.9;
        }

        this.cameraDistance = Math.max(
            this.minDistance,
            Math.min(this.maxDistance, this.cameraDistance)
        );

        this.updateCameraPosition();
    }

    private updateCameraPosition(): void {
        const x = this.cameraDistance * Math.sin(this.phi) * Math.cos(this.theta);
        const y = this.cameraDistance * Math.cos(this.phi);
        const z = this.cameraDistance * Math.sin(this.phi) * Math.sin(this.theta);

        this.camera.position.set(x, y, z);
        this.camera.lookAt(0, 0, 0);
    }

    reset(): void {
        this.cameraDistance = 150;
        this.theta = Math.PI / 4;
        this.phi = Math.PI / 3;
        this.updateCameraPosition();
    }

    dispose(): void {
        const canvas = this.renderer.domElement;
        canvas.removeEventListener('mousedown', (e) => this.onMouseDown(e));
        document.removeEventListener('mousemove', (e) => this.onMouseMove(e));
        document.removeEventListener('mouseup', () => this.onMouseUp());
        canvas.removeEventListener('wheel', (e) => this.onMouseWheel(e));
    }
}