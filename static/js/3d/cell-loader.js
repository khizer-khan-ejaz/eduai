/**
 * cell-loader.js — Handles GLB model loading and procedural cell generation.
 * Supports lazy loading, progress tracking, and fallback to Three.js primitives.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class CellLoader {
    constructor(scene) {
        this.scene = scene;
        this.currentModel = null;
        this.currentType = null;

        // Setup loaders
        this.gltfLoader = new GLTFLoader();

        // Optional: DRACO compression support
        try {
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');
            this.gltfLoader.setDRACOLoader(dracoLoader);
        } catch (e) {
            console.warn('DRACO loader not available, continuing without compression support.');
        }
    }

    /**
     * Dispose of current model completely to prevent memory leaks
     */
    disposeCurrentModel() {
        if (!this.currentModel) return;

        this.currentModel.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
                // Dispose original material refs
                if (child.userData.originalMaterial) {
                    child.userData.originalMaterial.dispose();
                }
            }
        });

        this.scene.remove(this.currentModel);
        this.currentModel = null;
    }

    /**
     * Load a plant cell — tries GLB first, falls back to procedural
     */
    async loadPlantCell(onProgress) {
        this.disposeCurrentModel();
        this.currentType = 'plant';

        const urls = window.STATIC_URLS || {};
        const tryUrls = [urls.plantCellAlt2, urls.plantCell, urls.plantCellAlt1].filter(Boolean);

        for (const url of tryUrls) {
            try {
                const model = await this._loadGLB(url, onProgress);
                if (model) {
                    this.currentModel = model;
                    this._prepareModel(model);
                    this.scene.add(model);
                    return { type: 'glb', model };
                }
            } catch (err) {
                console.warn(`GLB load failed for ${url}:`, err.message);
            }
        }

        // Fallback to procedural
        console.log('Using procedural plant cell fallback');
        const procedural = this._buildProceduralPlantCell();
        this.currentModel = procedural;
        this.scene.add(procedural);
        if (onProgress) onProgress(100);
        return { type: 'procedural', model: procedural };
    }

    /**
     * Load an animal cell — procedural only (no GLB available)
     */
    async loadAnimalCell(onProgress) {
        this.disposeCurrentModel();
        this.currentType = 'animal';

        const procedural = this._buildProceduralAnimalCell();
        this.currentModel = procedural;
        this.scene.add(procedural);
        if (onProgress) onProgress(100);
        return { type: 'procedural', model: procedural };
    }

    /**
     * Internal: Load a GLB file with progress tracking
     */
    _loadGLB(url, onProgress) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf) => {
                    resolve(gltf.scene);
                },
                (xhr) => {
                    if (xhr.total > 0 && onProgress) {
                        onProgress(Math.round((xhr.loaded / xhr.total) * 100));
                    }
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    /**
     * Prepare loaded GLB model — center, scale, cache materials
     */
    _prepareModel(model) {
        // Center model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(center);

        // Auto-scale to fit nicely in view
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
            const targetSize = 8;
            const scale = targetSize / maxDim;
            model.scale.setScalar(scale);
        }

        // Cache original materials for highlight/restore
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    child.userData.originalMaterial = child.material.clone();
                }
            }
        });
    }

    /**
     * Premium material factory
     */
    _mat(color, opts = {}) {
        const {
            opacity = 1.0,
            metalness = 0.1,
            roughness = 0.45,
            emissive = 0x000000,
            emissiveIntensity = 0,
            clearcoat = 0
        } = opts;

        return new THREE.MeshPhysicalMaterial({
            color,
            transparent: opacity < 1.0,
            opacity,
            metalness,
            roughness,
            emissive,
            emissiveIntensity,
            clearcoat,
            clearcoatRoughness: 0.3,
            side: opacity < 1.0 ? THREE.DoubleSide : THREE.FrontSide
        });
    }

    /**
     * Build procedural plant cell with rich detail
     */
    _buildProceduralPlantCell() {
        const group = new THREE.Group();
        group.name = 'PlantCellGroup';

        // ─── Cell Wall (rectangular, translucent) ───
        const wallGeo = new THREE.BoxGeometry(7, 5.5, 5.5, 2, 2, 2);
        const wall = new THREE.Mesh(wallGeo, this._mat(0x4ade80, {
            opacity: 0.18, roughness: 0.6, clearcoat: 0.5
        }));
        wall.name = 'Cell Wall';
        group.add(wall);

        // ─── Cell Membrane (inner box) ───
        const memGeo = new THREE.BoxGeometry(6.6, 5.1, 5.1, 2, 2, 2);
        const membrane = new THREE.Mesh(memGeo, this._mat(0x86efac, {
            opacity: 0.25, roughness: 0.5, clearcoat: 0.3
        }));
        membrane.name = 'Cell Membrane';
        group.add(membrane);

        // ─── Large Central Vacuole ───
        const vacGeo = new THREE.SphereGeometry(1.8, 32, 32);
        vacGeo.scale(1.3, 1, 1);
        const vacuole = new THREE.Mesh(vacGeo, this._mat(0x7dd3fc, {
            opacity: 0.55, roughness: 0.2, clearcoat: 0.8,
            emissive: 0x0ea5e9, emissiveIntensity: 0.08
        }));
        vacuole.position.set(0.5, 0, 0);
        vacuole.name = 'Vacuole';
        group.add(vacuole);

        // ─── Nucleus ───
        const nucGeo = new THREE.SphereGeometry(0.85, 32, 32);
        const nucleus = new THREE.Mesh(nucGeo, this._mat(0x6366f1, {
            roughness: 0.3, emissive: 0x4338ca, emissiveIntensity: 0.15
        }));
        nucleus.position.set(-2, 0.3, -0.5);
        nucleus.name = 'Nucleus';
        group.add(nucleus);

        // Nucleolus
        const nucleolusGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const nucleolus = new THREE.Mesh(nucleolusGeo, this._mat(0x312e81, {
            emissive: 0x1e1b4b, emissiveIntensity: 0.2
        }));
        nucleolus.position.set(-2, 0.3, -0.5);
        nucleolus.name = 'Nucleus';
        group.add(nucleolus);

        // ─── Chloroplasts (lens shaped) ───
        const chloroPositions = [
            { pos: [2.2, 1.5, 1.2], rot: [0.3, 0.2, 0.5] },
            { pos: [1.8, -1.2, 1.5], rot: [0.7, 0.4, 0.1] },
            { pos: [-1.5, 1.8, 1.0], rot: [0.1, 0.8, 0.3] },
            { pos: [2.5, 0.2, -1.6], rot: [0.5, 0.1, 0.7] },
            { pos: [-2.0, -1.5, -0.8], rot: [0.4, 0.6, 0.2] }
        ];
        const chloroGeo = new THREE.SphereGeometry(0.5, 16, 16);
        chloroGeo.scale(1, 0.45, 0.7);
        chloroPositions.forEach((cp) => {
            const chloro = new THREE.Mesh(chloroGeo, this._mat(0x15803d, {
                roughness: 0.35, emissive: 0x166534, emissiveIntensity: 0.12
            }));
            chloro.position.set(...cp.pos);
            chloro.rotation.set(...cp.rot);
            chloro.name = 'Chloroplast';
            group.add(chloro);
        });

        // ─── Mitochondria (elongated capsules) ───
        const mitoPositions = [
            { pos: [1.0, -0.8, -1.8], rot: [0.8, 0.3, 0.5] },
            { pos: [-1.8, -1.0, 1.5], rot: [0.2, 0.9, 0.3] },
            { pos: [2.0, 0.8, -0.5], rot: [0.5, 0.2, 0.8] }
        ];
        const mitoGeo = new THREE.CapsuleGeometry(0.22, 0.7, 8, 16);
        mitoPositions.forEach((mp) => {
            const mito = new THREE.Mesh(mitoGeo, this._mat(0xdc2626, {
                roughness: 0.4, emissive: 0x991b1b, emissiveIntensity: 0.1
            }));
            mito.position.set(...mp.pos);
            mito.rotation.set(...mp.rot);
            mito.name = 'Mitochondria';
            group.add(mito);
        });

        // ─── Endoplasmic Reticulum (wavy tubes) ───
        const erCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.5, 0.8, 0.5),
            new THREE.Vector3(0.2, 1.0, 0.8),
            new THREE.Vector3(0.8, 0.6, 0.3),
            new THREE.Vector3(1.3, 0.9, 0.9),
            new THREE.Vector3(1.8, 0.5, 0.4)
        ]);
        const erGeo = new THREE.TubeGeometry(erCurve, 32, 0.08, 8, false);
        const er = new THREE.Mesh(erGeo, this._mat(0xc084fc, {
            roughness: 0.3, emissive: 0x9333ea, emissiveIntensity: 0.1
        }));
        er.name = 'Endoplasmic Reticulum';
        group.add(er);

        // Second ER strand
        const erCurve2 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.8, -0.5, 0.8),
            new THREE.Vector3(-0.2, -0.3, 1.2),
            new THREE.Vector3(0.5, -0.7, 0.6),
            new THREE.Vector3(1.0, -0.4, 1.0)
        ]);
        const erGeo2 = new THREE.TubeGeometry(erCurve2, 24, 0.07, 8, false);
        const er2 = new THREE.Mesh(erGeo2, this._mat(0xc084fc, {
            roughness: 0.3, emissive: 0x9333ea, emissiveIntensity: 0.1
        }));
        er2.name = 'Endoplasmic Reticulum';
        group.add(er2);

        // ─── Golgi Apparatus (stacked discs) ───
        const golgiGeo = new THREE.TorusGeometry(0.4, 0.08, 8, 32);
        for (let i = 0; i < 5; i++) {
            const disc = new THREE.Mesh(golgiGeo, this._mat(0xf59e0b, {
                roughness: 0.35, emissive: 0xd97706, emissiveIntensity: 0.08
            }));
            disc.position.set(-0.5, -1.5 + i * 0.12, -1.2);
            disc.rotation.x = Math.PI / 2;
            disc.scale.set(1 - i * 0.08, 1 - i * 0.08, 1);
            disc.name = 'Golgi';
            group.add(disc);
        }

        // ─── Ribosomes (small spheres) ───
        const ribGeo = new THREE.SphereGeometry(0.07, 8, 8);
        for (let i = 0; i < 25; i++) {
            const rib = new THREE.Mesh(ribGeo, this._mat(0xfbbf24, {
                emissive: 0xf59e0b, emissiveIntensity: 0.15
            }));
            // Distribute inside cell bounds
            rib.position.set(
                (Math.random() - 0.5) * 5.5,
                (Math.random() - 0.5) * 4.2,
                (Math.random() - 0.5) * 4.2
            );
            rib.name = 'Ribosome';
            group.add(rib);
        }

        // Subtle initial rotation
        group.rotation.x = Math.PI / 8;
        group.rotation.y = Math.PI / 6;

        // Cache original materials
        group.traverse((child) => {
            if (child.isMesh) {
                child.userData.originalMaterial = child.material.clone();
            }
        });

        return group;
    }

    /**
     * Build procedural animal cell with rich detail
     */
    _buildProceduralAnimalCell() {
        const group = new THREE.Group();
        group.name = 'AnimalCellGroup';

        // ─── Cell Membrane (main sphere, translucent) ───
        const memGeo = new THREE.SphereGeometry(3.5, 48, 48);
        const membrane = new THREE.Mesh(memGeo, this._mat(0x86efac, {
            opacity: 0.2, roughness: 0.3, clearcoat: 0.6,
            emissive: 0x34d399, emissiveIntensity: 0.05
        }));
        membrane.name = 'Cell Membrane';
        group.add(membrane);

        // Cytoplasm inner sphere
        const cytoGeo = new THREE.SphereGeometry(3.3, 32, 32);
        const cytoplasm = new THREE.Mesh(cytoGeo, this._mat(0xd1fae5, {
            opacity: 0.08, roughness: 0.5
        }));
        cytoplasm.name = 'Cytoplasm';
        group.add(cytoplasm);

        // ─── Nucleus (with nucleolus) ───
        const nucGeo = new THREE.SphereGeometry(1.1, 32, 32);
        const nucleus = new THREE.Mesh(nucGeo, this._mat(0x6366f1, {
            roughness: 0.25, emissive: 0x4338ca, emissiveIntensity: 0.2,
            clearcoat: 0.4
        }));
        nucleus.position.set(0, 0, -0.3);
        nucleus.name = 'Nucleus';
        group.add(nucleus);

        // Nuclear envelope hint
        const nucEnvGeo = new THREE.SphereGeometry(1.2, 24, 24);
        const nucEnv = new THREE.Mesh(nucEnvGeo, this._mat(0x818cf8, {
            opacity: 0.15, roughness: 0.4
        }));
        nucEnv.position.copy(nucleus.position);
        nucEnv.name = 'Nucleus';
        group.add(nucEnv);

        // Nucleolus
        const nucleolusGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const nucleolus = new THREE.Mesh(nucleolusGeo, this._mat(0x312e81, {
            emissive: 0x1e1b4b, emissiveIntensity: 0.25
        }));
        nucleolus.position.set(0.15, 0.1, -0.3);
        nucleolus.name = 'Nucleus';
        group.add(nucleolus);

        // ─── Mitochondria ───
        const mitoPositions = [
            { pos: [1.8, 0.8, 1.2], rot: [0.8, 0.3, 0.5] },
            { pos: [-1.5, -1.2, 0.8], rot: [0.2, 0.9, 0.3] },
            { pos: [0.5, 2.0, -1.0], rot: [0.5, 0.2, 0.8] },
            { pos: [-2.0, 0.5, -1.2], rot: [1.0, 0.4, 0.1] },
            { pos: [1.2, -1.8, -0.5], rot: [0.3, 0.7, 0.6] }
        ];
        const mitoGeo = new THREE.CapsuleGeometry(0.25, 0.8, 8, 16);
        mitoPositions.forEach((mp) => {
            const mito = new THREE.Mesh(mitoGeo, this._mat(0xdc2626, {
                roughness: 0.35, emissive: 0xb91c1c, emissiveIntensity: 0.12
            }));
            mito.position.set(...mp.pos);
            mito.rotation.set(...mp.rot);
            mito.name = 'Mitochondria';
            group.add(mito);
        });

        // ─── Endoplasmic Reticulum ───
        const erPoints = [
            [new THREE.Vector3(0.5, 0.5, 1.0), new THREE.Vector3(1.0, 0.8, 1.5),
             new THREE.Vector3(1.8, 0.3, 1.2), new THREE.Vector3(2.3, 0.7, 0.8)],
            [new THREE.Vector3(-0.3, -0.5, 1.2), new THREE.Vector3(-0.8, -0.8, 1.8),
             new THREE.Vector3(-1.5, -0.3, 1.5), new THREE.Vector3(-2.0, -0.6, 0.9)]
        ];
        erPoints.forEach((pts) => {
            const curve = new THREE.CatmullRomCurve3(pts);
            const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.06, 8, false);
            const tube = new THREE.Mesh(tubeGeo, this._mat(0xc084fc, {
                roughness: 0.3, emissive: 0x9333ea, emissiveIntensity: 0.1
            }));
            tube.name = 'Endoplasmic Reticulum';
            group.add(tube);
        });

        // ─── Golgi Apparatus ───
        const golgiGeo = new THREE.TorusGeometry(0.45, 0.09, 8, 32);
        for (let i = 0; i < 5; i++) {
            const disc = new THREE.Mesh(golgiGeo, this._mat(0xf59e0b, {
                roughness: 0.35, emissive: 0xd97706, emissiveIntensity: 0.08
            }));
            disc.position.set(-1.5, 1.3 + i * 0.14, -0.8);
            disc.rotation.set(0.3, 0.5, 0);
            disc.scale.set(1 - i * 0.07, 1 - i * 0.07, 1);
            disc.name = 'Golgi';
            group.add(disc);
        }

        // ─── Lysosomes ───
        const lysoGeo = new THREE.SphereGeometry(0.28, 16, 16);
        const lysoPositions = [
            [2.0, -0.5, -0.8],
            [-0.8, 1.8, 1.5],
            [1.5, 1.2, -1.8]
        ];
        lysoPositions.forEach((pos) => {
            const lyso = new THREE.Mesh(lysoGeo, this._mat(0xf97316, {
                roughness: 0.3, emissive: 0xea580c, emissiveIntensity: 0.15
            }));
            lyso.position.set(...pos);
            lyso.name = 'Lysosome';
            group.add(lyso);
        });

        // ─── Centrioles (pair of cylinders) ───
        const centGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 9, 1, true);
        const cent1 = new THREE.Mesh(centGeo, this._mat(0x8b5cf6, {
            roughness: 0.3, emissive: 0x7c3aed, emissiveIntensity: 0.15
        }));
        cent1.position.set(1.5, -1.5, -1.5);
        cent1.name = 'Centriole';
        group.add(cent1);

        const cent2 = new THREE.Mesh(centGeo, this._mat(0x8b5cf6, {
            roughness: 0.3, emissive: 0x7c3aed, emissiveIntensity: 0.15
        }));
        cent2.position.set(1.5, -1.5, -1.5);
        cent2.rotation.x = Math.PI / 2;
        cent2.name = 'Centriole';
        group.add(cent2);

        // ─── Ribosomes ───
        const ribGeo = new THREE.SphereGeometry(0.07, 8, 8);
        for (let i = 0; i < 30; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 0.5 + Math.random() * 2.5;
            const rib = new THREE.Mesh(ribGeo, this._mat(0xfbbf24, {
                emissive: 0xf59e0b, emissiveIntensity: 0.2
            }));
            rib.position.set(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            );
            rib.name = 'Ribosome';
            group.add(rib);
        }

        // Cache original materials
        group.traverse((child) => {
            if (child.isMesh) {
                child.userData.originalMaterial = child.material.clone();
            }
        });

        return group;
    }
}
