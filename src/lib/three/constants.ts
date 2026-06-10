import * as THREE from 'three';
import { PlanetData, SunData } from '../types';

// Escala de renderizado
export const SCALE = {
    position: 0.15,  // Escala las distancias
    size: 0.5,       // Escala los tamaños
    time: 0.01,      // Escala el tiempo de simulación
};

// Datos del Sol
export const SUN: SunData = {
    size: 10.0,
    color: 0xFDB813,
    texture: '/textures/sun.jpg',
    info: {
        temperatura: 5778,
        radio: '696,000 km',
        masa: '333,000 veces la Tierra',
    },
};

// Datos de los 9 planetas
export const PLANETS: PlanetData[] = [
    {
        name: 'Mercurio',
        size: 0.4879,
        distance: 57.9,
        speed: 0.04,
        color: 0x808080,
        texture: '/textures/mercury.jpg',
        info: {
            dia: 176,
            temperatura: 430,
            distancia: '57.9 millones km',
            radio: '2,439 km',
            masa: '0.055 veces la Tierra',
        },
    },
    {
        name: 'Venus',
        size: 1.2104,
        distance: 108.2,
        speed: 0.015,
        color: 0xE6801A,
        texture: '/textures/venus.jpg',
        info: {
            dia: 243,
            temperatura: 464,
            distancia: '108.2 millones km',
            radio: '6,052 km',
            masa: '0.815 veces la Tierra',
        },
    },
    {
        name: 'Tierra',
        size: 1.2756,
        distance: 149.6,
        speed: 0.01,
        color: 0x007FFF,
        texture: '/textures/earth.jpg',
        info: {
            dia: 24,
            temperatura: 15,
            distancia: '149.6 millones km (1 UA)',
            radio: '6,371 km',
            masa: '1.0',
            lunas: 1,
        },
    },
    {
        name: 'Marte',
        size: 0.6794,
        distance: 227.9,
        speed: 0.008,
        color: 0x8B2611,
        texture: '/textures/mars.jpg',
        info: {
            dia: 25,
            temperatura: -65,
            distancia: '227.9 millones km',
            radio: '3,390 km',
            masa: '0.107 veces la Tierra',
            lunas: 2,
        },
    },
    {
        name: 'Júpiter',
        size: 14.2984,
        distance: 778.5,
        speed: 0.002,
        color: 0xFFB366,
        texture: '/textures/jupiter.jpg',
        info: {
            dia: 10,
            temperatura: -110,
            distancia: '778.5 millones km',
            radio: '69,911 km',
            masa: '318 veces la Tierra',
            lunas: 95,
        },
    },
    {
        name: 'Saturno',
        size: 12.1200,
        distance: 1433.4,
        speed: 0.0009,
        color: 0xDAA520,
        texture: '/textures/saturn.jpg',
        hasRings: true,
        info: {
            dia: 11,
            temperatura: -140,
            distancia: '1433.4 millones km',
            radio: '58,232 km',
            masa: '95 veces la Tierra',
            lunas: 146,
        },
    },
    {
        name: 'Urano',
        size: 5.1118,
        distance: 2872.5,
        speed: 0.0004,
        color: 0xADD8E6,
        texture: '/textures/uranus.jpg',
        info: {
            dia: 17,
            temperatura: -195,
            distancia: '2872.5 millones km',
            radio: '25,559 km',
            masa: '14.5 veces la Tierra',
            lunas: 28,
        },
    },
    {
        name: 'Neptuno',
        size: 4.9528,
        distance: 4495.1,
        speed: 0.0001,
        color: 0x014BA0,
        texture: '/textures/neptune.jpg',
        info: {
            dia: 16,
            temperatura: -200,
            distancia: '4495.1 millones km',
            radio: '24,764 km',
            masa: '17 veces la Tierra',
            lunas: 16,
        },
    },
    {
        name: 'Plutón',
        size: 0.237,
        distance: 5906.4,
        speed: 0.00005,
        color: 0x9B8B7E,
        texture: '/textures/pluto.jpg',
        info: {
            dia: 153,
            temperatura: -223,
            distancia: '5906.4 millones km',
            radio: '1,188 km',
            masa: '0.0022 veces la Tierra',
        },
    },
];

// Configuración de cámara
export const CAMERA_CONFIG = {
    fov: 45,
    near: 0.1,
    far: 100000,
    initialPosition: { x: 0, y: 150, z: 150 },
    initialLookAt: { x: 0, y: 0, z: 0 },
};

// Configuración de luces
// Configuración de luces
export const LIGHTS_CONFIG = {
    ambient: { color: 0xffffff, intensity: 0.6 },   // ← Aumentado de 0.4
    sun: { color: 0xfdb813, intensity: 2.5, distance: 5000 },  // ← Aumentado de 2
    fill: { color: 0xffffff, intensity: 0.4 },     // ← Aumentado de 0.2
};

// Colores UI
export const UI_COLORS = {
    primary: '#00ffff',
    success: '#00ff00',
    warning: '#ffff00',
    error: '#ff0000',
    background: 'rgba(0, 0, 0, 0.85)',
    text: '#ffffff',
};