import * as THREE from 'three';
import { PLANETS, SUN, SCALE } from './constants';
import { PlanetData } from '../types';
import { ThreeObjects } from '../types';

export class PlanetManager {
    private scene: THREE.Scene;
    private textureLoader: THREE.TextureLoader;
    private planets: Map<string, { group: THREE.Group; mesh: THREE.Mesh; data: PlanetData }> =
        new Map();
    private time: number = 0;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
    }

    createSun(): void {
        const geometry = new THREE.SphereGeometry(SUN.size, 50, 50);

        let material: THREE.Material;

        try {
            const texture = this.textureLoader.load(SUN.texture);
            material = new THREE.MeshPhongMaterial({ map: texture });
        } catch (error) {
            console.warn('No se pudo cargar textura del Sol, usando color:', error);
            material = new THREE.MeshPhongMaterial({ color: SUN.color });
        }

        const sun = new THREE.Mesh(geometry, material);
        sun.castShadow = true;
        sun.receiveShadow = true;
        sun.name = 'Sun';

        this.scene.add(sun);
    }

    createPlanet(planetData: PlanetData): void {
        // Crear grupo para órbita + planeta
        const group = new THREE.Group();
        group.name = `orbit-${planetData.name}`;

        // Dibujar órbita
        const orbitPoints: THREE.Vector3[] = [];
        const segments = 200;

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * planetData.distance * SCALE.position;
            const z = Math.sin(angle) * planetData.distance * SCALE.position;
            orbitPoints.push(new THREE.Vector3(x, 0, z));
        }

        const orbitGeometry = new THREE.BufferGeometry();
        orbitGeometry.setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0x888888,
            linewidth: 1,
        });
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        group.add(orbitLine);

        // Crear planeta
        const planetGeometry = new THREE.SphereGeometry(
            planetData.size * SCALE.size,
            50,
            50
        );

        let planetMaterial: THREE.Material;

        try {
            if (planetData.texture) {
                const texture = this.textureLoader.load(planetData.texture);
                planetMaterial = new THREE.MeshPhongMaterial({ map: texture });
            } else {
                planetMaterial = new THREE.MeshPhongMaterial({ color: planetData.color });
            }
        } catch (error) {
            console.warn(`No se pudo cargar textura de ${planetData.name}:`, error);
            planetMaterial = new THREE.MeshPhongMaterial({ color: planetData.color });
        }

        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.castShadow = true;
        planet.receiveShadow = true;
        planet.userData = {
            name: planetData.name,
            distance: planetData.distance * SCALE.position,
            speed: planetData.speed,
            info: planetData.info,
        };

        group.add(planet);
        this.scene.add(group);

        this.planets.set(planetData.name, {
            group,
            mesh: planet,
            data: planetData,
        });
    }

    createAllPlanets(): void {
        this.createSun();
        PLANETS.forEach((planetData) => {
            this.createPlanet(planetData);
        });
    }

    update(speedMultiplier: number = 1, deltaTime: number = 1): void {
        this.planets.forEach((planet) => {
            const speed = planet.data.speed * speedMultiplier * SCALE.time;
            planet.group.rotation.z += speed * deltaTime;

            // Rotación del planeta sobre su eje
            planet.mesh.rotation.y += 0.005 * speedMultiplier;
        });

        this.time += speedMultiplier;
    }

    getSelectedPlanet(
        raycaster: THREE.Raycaster,
        mouse: THREE.Vector2,
        camera: THREE.PerspectiveCamera
    ): PlanetData | null {
        raycaster.setFromCamera(mouse, camera);

        const planetMeshes = Array.from(this.planets.values()).map((p) => p.mesh);
        const intersects = raycaster.intersectObjects(planetMeshes);

        if (intersects.length > 0) {
            const selectedMesh = intersects[0].object as THREE.Mesh;
            const selectedPlanetData = Array.from(this.planets.values()).find(
                (p) => p.mesh === selectedMesh
            );

            return selectedPlanetData?.data || null;
        }

        return null;
    }

    getPlanets(): Map<string, { group: THREE.Group; mesh: THREE.Mesh; data: PlanetData }> {
        return this.planets;
    }

    dispose(): void {
        this.planets.forEach((planet) => {
            planet.mesh.geometry.dispose();
            if (planet.mesh.material instanceof THREE.Material) {
                planet.mesh.material.dispose();
            }
        });
        this.planets.clear();
    }
}