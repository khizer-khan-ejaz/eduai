/**
 * app.js — Main entry point for the 3D Cell Biology Simulation.
 * Coordinates scene setup, model loading, interactions, and UI.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CellLoader } from './cell-loader.js';
import { CellInteraction } from './cell-interaction.js';
import { CellUI } from './cell-ui.js';

class BiologyCellApp {
    constructor() {
        // DOM
        this.container = document.getElementById('canvas-container');
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        // ─── Three.js Core ─── //
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 4, 12);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap for performance
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        // ─── Lighting ─── //
        this._setupLighting();

        // ─── OrbitControls ─── //
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.06;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 30;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.8;
        this.controls.target.set(0, 0, 0);

        // ─── Modules ─── //
        this.ui = new CellUI();
        this.loader = new CellLoader(this.scene);
        this.interaction = new CellInteraction(
            this.camera,
            this.scene,
            this.renderer.domElement,
            (key) => this._onOrganelleSelect(key),
            (key, event) => this._onOrganelleHover(key, event),
            () => this._onOrganelleDeselect()
        );

        // ─── State ─── //
        this.currentType = 'plant';
        this.clock = new THREE.Clock();

        // ─── Events ─── //
        window.addEventListener('resize', this._onResize.bind(this));
        document.getElementById('btn-plant').addEventListener('click', () => this.switchCell('plant'));
        document.getElementById('btn-animal').addEventListener('click', () => this.switchCell('animal'));
        document.getElementById('btn-autorotate').addEventListener('click', () => this._toggleAutoRotate());
        document.getElementById('btn-reset-cam').addEventListener('click', () => this._resetCamera());
        document.getElementById('btn-fullscreen').addEventListener('click', () => this._toggleFullscreen());

        // Listen for deselect from UI close button
        window.addEventListener('cell-deselect', () => {
            if (this.interaction.selectedMesh) {
                this.interaction._clearSelectEffect();
                this.interaction.selectedMesh = null;
            }
        });

        // ─── Start ─── //
        this._initParticleBackground();
        this.switchCell('plant');
        this._animate();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // LIGHTING
    // ═══════════════════════════════════════════════════════════════════════

    _setupLighting() {
        // Ambient — soft fill
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambient);

        // Main directional light
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
        dirLight.position.set(5, 8, 6);
        this.scene.add(dirLight);

        // Cool rim light (back)
        const rimLight = new THREE.DirectionalLight(0x22d3ee, 0.4);
        rimLight.position.set(-5, -3, -6);
        this.scene.add(rimLight);

        // Warm accent (below)
        const warmLight = new THREE.PointLight(0xfbbf24, 0.3, 30);
        warmLight.position.set(0, -6, 0);
        this.scene.add(warmLight);

        // Emerald accent (side)
        const emeraldLight = new THREE.PointLight(0x34d399, 0.25, 25);
        emeraldLight.position.set(8, 2, -4);
        this.scene.add(emeraldLight);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CELL SWITCHING
    // ═══════════════════════════════════════════════════════════════════════

    async switchCell(type) {
        if (this.isLoading) return;
        this.isLoading = true;
        this.currentType = type;

        // Update UI
        this.ui.setActiveToggle(type);
        this.ui.showLoading(type);

        // Clear interaction state
        this.interaction.selectedMesh = null;
        this.interaction.hoveredMesh = null;

        try {
            const onProgress = (percent) => this.ui.updateProgress(percent);

            if (type === 'plant') {
                await this.loader.loadPlantCell(onProgress);
            } else {
                await this.loader.loadAnimalCell(onProgress);
            }

            // Reset camera
            this.controls.target.set(0, 0, 0);
            this._animateCameraToDefault();

        } catch (err) {
            console.error('Failed to load cell:', err);
        } finally {
            this.ui.hideLoading();
            this.isLoading = false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INTERACTION CALLBACKS
    // ═══════════════════════════════════════════════════════════════════════

    _onOrganelleSelect(key) {
        this.ui.showOrganelleInfo(key);
        this.ui.hideTooltip();
        // Pause auto-rotate briefly on selection
        this.controls.autoRotate = false;
        this.ui.setAutoRotateState(false);
    }

    _onOrganelleHover(key, event) {
        if (key) {
            this.ui.showTooltip(key, event);
        } else {
            this.ui.hideTooltip();
        }
    }

    _onOrganelleDeselect() {
        this.ui.clearInfo();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CAMERA CONTROLS
    // ═══════════════════════════════════════════════════════════════════════

    _resetCamera() {
        this._animateCameraToDefault();
    }

    _animateCameraToDefault() {
        const target = { x: 0, y: 4, z: 12 };
        const start = {
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z
        };
        const duration = 800;
        const startTime = Date.now();

        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const t = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - t, 3);

            this.camera.position.x = start.x + (target.x - start.x) * ease;
            this.camera.position.y = start.y + (target.y - start.y) * ease;
            this.camera.position.z = start.z + (target.z - start.z) * ease;

            this.controls.target.lerp(new THREE.Vector3(0, 0, 0), ease);

            if (t < 1) {
                requestAnimationFrame(animateCamera);
            }
        };
        animateCamera();
    }

    _toggleAutoRotate() {
        this.controls.autoRotate = !this.controls.autoRotate;
        this.ui.setAutoRotateState(this.controls.autoRotate);
    }

    _toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // AMBIENT PARTICLE BACKGROUND
    // ═══════════════════════════════════════════════════════════════════════

    _initParticleBackground() {
        const canvas = document.getElementById('particle-bg');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        const count = 60;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.3 + 0.1
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(52, 211, 153, ${p.alpha})`;
                ctx.fill();
            });
            requestAnimationFrame(draw);
        };
        draw();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RENDER LOOP
    // ═══════════════════════════════════════════════════════════════════════

    _onResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    _animate() {
        requestAnimationFrame(this._animate.bind(this));

        const delta = this.clock.getDelta();

        // Gentle floating animation on model
        if (this.loader.currentModel) {
            this.loader.currentModel.position.y = Math.sin(Date.now() * 0.001) * 0.08;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.bioApp = new BiologyCellApp();
    } catch (err) {
        console.error('Failed to initialize Biology Cell App:', err);
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.innerHTML = `
                <div style="text-align:center;color:#fb7185;padding:2rem;">
                    <h3>⚠️ WebGL Not Available</h3>
                    <p style="color:#94a3b8;margin-top:0.5rem;">Your browser doesn't support WebGL. Please use a modern browser like Chrome or Firefox.</p>
                </div>
            `;
        }
    }
});
