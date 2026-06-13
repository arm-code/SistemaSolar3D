import * as THREE from 'three';
import { PLANETS, SUN, SCALE } from './constants';
import { PlanetData } from '../types';

// Tipo interno para registrar planetas y sus satélites
interface PlanetEntry {
    group: THREE.Group;
    mesh: THREE.Mesh;
    data: PlanetData;
    // Grupos de lunas que orbitan al planeta
    moons: Array<{ orbitGroup: THREE.Group; mesh: THREE.Mesh; speed: number }>;
}

export class PlanetManager {
    private scene: THREE.Scene;
    private textureLoader: THREE.TextureLoader;
    private planets: Map<string, PlanetEntry> = new Map();
    private time: number = 0;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
    }

    // ─── Helpers privados ────────────────────────────────────────────────────

    private loadTexture(path: string, label: string): THREE.Texture {
        return this.textureLoader.load(
            path,
            () => console.log(`✅ Textura cargada: ${label}`),
            undefined,
            (err) => console.warn(`⚠️ Error cargando textura ${label}:`, err)
        );
    }

    private buildPlanetMaterial(planetData: PlanetData): THREE.Material {
        if (planetData.texture) {
            const tex = this.loadTexture(planetData.texture, planetData.name);
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            return new THREE.MeshPhongMaterial({ map: tex, shininess: 30 });
        }
        return new THREE.MeshPhongMaterial({ color: planetData.color, emissive: 0x333333 });
    }

    // ─── Sol ─────────────────────────────────────────────────────────────────

    createSun(): void {
        const geometry = new THREE.SphereGeometry(SUN.size, 50, 50);
        // MeshBasicMaterial: el Sol siempre brilla independientemente de la iluminación
        const texture = this.loadTexture(SUN.texture, 'Sol');
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const sun = new THREE.Mesh(geometry, material);
        sun.name = 'Sun';
        this.scene.add(sun);
    }

    // ─── Anillos de Saturno ──────────────────────────────────────────────────

    private addSaturnRings(planetMesh: THREE.Mesh, planetSize: number): void {
        // RingGeometry: innerRadius, outerRadius, thetaSegments
        const innerR = planetSize * 1.3;
        const outerR = planetSize * 2.3;
        const ringGeo = new THREE.RingGeometry(innerR, outerR, 128);

        // Remapear las UV del anillo para que la textura se aplique radialmente
        const pos = ringGeo.attributes.position as THREE.BufferAttribute;
        const uv = ringGeo.attributes.uv as THREE.BufferAttribute;
        const v3 = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i);
            const r = (v3.length() - innerR) / (outerR - innerR);
            uv.setXY(i, r, 1);
        }

        const ringTex = this.loadTexture('/textures/saturn_ring_alpha.png', 'Anillos de Saturno');
        ringTex.minFilter = THREE.LinearFilter;

        const ringMat = new THREE.MeshBasicMaterial({
            map: ringTex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
        });

        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        // Inclinar ligeramente los anillos (como en la realidad ~26°)
        ringMesh.rotation.x = Math.PI / 2 - THREE.MathUtils.degToRad(26);
        ringMesh.name = 'SaturnRings';

        // Añadir al mesh del planeta para que rote junto a él
        planetMesh.add(ringMesh);
    }

    // ─── Luna de la Tierra ───────────────────────────────────────────────────

    private addEarthMoon(planetMesh: THREE.Mesh, planetSize: number): void {
        const moonOrbitGroup = new THREE.Group();
        moonOrbitGroup.name = 'moon-orbit';

        const moonSize = planetSize * 0.27; // La Luna ≈ 27% del radio terrestre
        const moonOrbitR = planetSize * 3.0;  // Distancia orbital visual

        // Geometría y material de la Luna
        const moonGeo = new THREE.SphereGeometry(moonSize, 32, 32);
        const moonTex = this.loadTexture('/textures/moon.jpg', 'Luna');
        moonTex.minFilter = THREE.LinearMipmapLinearFilter;
        moonTex.magFilter = THREE.LinearFilter;
        const moonMat = new THREE.MeshPhongMaterial({ map: moonTex, shininess: 5 });

        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.position.x = moonOrbitR;
        moonMesh.castShadow = true;
        moonMesh.name = 'Moon';

        moonOrbitGroup.add(moonMesh);
        // El grupo de órbita de la luna se adjunta al mesh del planeta
        planetMesh.add(moonOrbitGroup);

        // Guardar referencia para animarla
        // La buscaremos en update() por el nombre del planeta
        (planetMesh as any).__moonOrbitGroup = moonOrbitGroup;
    }

    // ─── Planeta genérico ────────────────────────────────────────────────────

    createPlanet(planetData: PlanetData): void {
        const group = new THREE.Group();
        group.name = `orbit-${planetData.name}`;

        // --- Órbita visual ---
        const orbitPoints: THREE.Vector3[] = [];
        const segments = 200;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            orbitPoints.push(new THREE.Vector3(
                Math.cos(angle) * planetData.distance * SCALE.position,
                0,
                Math.sin(angle) * planetData.distance * SCALE.position
            ));
        }
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitLine = new THREE.Line(
            orbitGeo,
            new THREE.LineBasicMaterial({ color: 0x444466, linewidth: 1 })
        );
        group.add(orbitLine);

        // --- Mesh del planeta ---
        const radius = planetData.size * SCALE.size;
        const planetGeo = new THREE.SphereGeometry(radius, 50, 50);
        const planetMat = this.buildPlanetMaterial(planetData);
        const planet = new THREE.Mesh(planetGeo, planetMat);
        planet.castShadow = true;
        planet.receiveShadow = true;
        planet.position.x = planetData.distance * SCALE.position;
        planet.userData = {
            name: planetData.name,
            distance: planetData.distance * SCALE.position,
            speed: planetData.speed,
            info: planetData.info,
        };

        // --- Extras por planeta ---
        if (planetData.hasRings) {
            this.addSaturnRings(planet, radius);
        }
        if (planetData.name === 'Tierra') {
            this.addEarthMoon(planet, radius);
        }

        group.add(planet);
        this.scene.add(group);

        this.planets.set(planetData.name, {
            group,
            mesh: planet,
            data: planetData,
            moons: [],
        });
    }

    createAllPlanets(): void {
        this.createSun();
        PLANETS.forEach((p) => this.createPlanet(p));
    }

    // ─── Animación ────────────────────────────────────────────────────────────

    update(speedMultiplier: number = 1, deltaTime: number = 1): void {
        this.planets.forEach((planet) => {
            const speed = planet.data.speed * speedMultiplier * SCALE.time;

            // Órbita del planeta alrededor del Sol
            planet.group.rotation.y += speed * deltaTime;

            // Rotación del planeta sobre su propio eje
            planet.mesh.rotation.y += 0.005 * speedMultiplier;

            // Órbita de la Luna alrededor de la Tierra
            const moonOrbit = (planet.mesh as any).__moonOrbitGroup as THREE.Group | undefined;
            if (moonOrbit) {
                // La Luna orbita ~13× más rápido que la Tierra da vuelta al Sol
                moonOrbit.rotation.y += speed * 13 * deltaTime;
            }
        });

        this.time += speedMultiplier;
    }

    // ─── Raycast / selección ─────────────────────────────────────────────────

    getSelectedPlanet(
        raycaster: THREE.Raycaster,
        mouse: THREE.Vector2,
        camera: THREE.PerspectiveCamera
    ): PlanetData | null {
        raycaster.setFromCamera(mouse, camera);
        const meshes = Array.from(this.planets.values()).map((p) => p.mesh);
        const hits = raycaster.intersectObjects(meshes);
        if (hits.length > 0) {
            const hit = hits[0].object as THREE.Mesh;
            return Array.from(this.planets.values()).find((p) => p.mesh === hit)?.data ?? null;
        }
        return null;
    }

    getPlanets(): Map<string, PlanetEntry> {
        return this.planets;
    }

    // ─── Limpieza ─────────────────────────────────────────────────────────────

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