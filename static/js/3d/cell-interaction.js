/**
 * cell-interaction.js — Raycaster-based click/hover detection for organelles.
 * Handles highlighting, glow effects, and dispatches events to the UI.
 */

import * as THREE from 'three';

export class CellInteraction {
    constructor(camera, scene, domElement, onSelect, onHover, onDeselect) {
        this.camera = camera;
        this.scene = scene;
        this.domElement = domElement;

        // Callbacks
        this.onSelect = onSelect;
        this.onHover = onHover;
        this.onDeselect = onDeselect;

        // Raycaster
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // State
        this.hoveredMesh = null;
        this.selectedMesh = null;
        this.isPointerDown = false;
        this.pointerMoved = false;

        // Mesh names to ignore during raycasting (outer shells, bounding geometry)
        this.ignorePatterns = ['cytoplasm', 'boundingbox', 'glass', 'container'];

        // Selection material — golden glow
        this.selectColor = new THREE.Color(0xfbbf24);
        this.selectEmissive = new THREE.Color(0xf59e0b);

        // Bind events
        this._onPointerMove = this._handlePointerMove.bind(this);
        this._onPointerDown = this._handlePointerDown.bind(this);
        this._onPointerUp = this._handlePointerUp.bind(this);

        this.domElement.addEventListener('pointermove', this._onPointerMove);
        this.domElement.addEventListener('pointerdown', this._onPointerDown);
        this.domElement.addEventListener('pointerup', this._onPointerUp);
    }

    /**
     * Check if a mesh name should be ignored
     */
    _shouldIgnore(name) {
        if (!name) return true;
        const lower = name.toLowerCase();
        return this.ignorePatterns.some(p => lower.includes(p));
    }

    /**
     * Get the normalized organelle key from a mesh name
     */
    getOrganelleKey(meshName) {
        if (!meshName) return null;
        const lower = meshName.toLowerCase().replace(/[\s_]+/g, '_').replace(/[^a-z_]/g, '');

        // Map known names to keys
        const keyMap = {
            'nucleus': 'nucleus',
            'nucleolus': 'nucleus',
            'chloroplast': 'chloroplast',
            'vacuole': 'vacuole',
            'mitochondria': 'mitochondria',
            'mitochondrion': 'mitochondria',
            'cell_membrane': 'cell_membrane',
            'cell_wall': 'cell_wall',
            'ribosome': 'ribosome',
            'golgi': 'golgi',
            'golgi_apparatus': 'golgi',
            'endoplasmic_reticulum': 'endoplasmic_reticulum',
            'endoplasmic': 'endoplasmic_reticulum',
            'lysosome': 'lysosome',
            'centriole': 'centriole',
            'cytoplasm': 'cytoplasm'
        };

        // Direct match
        if (keyMap[lower]) return keyMap[lower];

        // Partial match
        for (const [pattern, key] of Object.entries(keyMap)) {
            if (lower.includes(pattern)) return key;
        }

        return lower;
    }

    /**
     * Find the first valid mesh from raycast intersections
     */
    _findValidMesh(intersects) {
        for (const intersect of intersects) {
            const obj = intersect.object;
            if (obj.isMesh && !this._shouldIgnore(obj.name) && obj.name) {
                return obj;
            }
        }
        return null;
    }

    /**
     * Apply hover glow effect to a mesh
     */
    _applyHoverEffect(mesh) {
        if (!mesh || mesh === this.selectedMesh) return;
        if (!mesh.userData.originalMaterial) return;

        const hoverMat = mesh.userData.originalMaterial.clone();
        // Brighten slightly
        if (hoverMat.color) {
            hoverMat.color.lerp(new THREE.Color(0xffffff), 0.2);
        }
        if (hoverMat.emissive) {
            hoverMat.emissive.lerp(new THREE.Color(0x22d3ee), 0.3);
            hoverMat.emissiveIntensity = 0.3;
        }
        mesh.material = hoverMat;
    }

    /**
     * Apply selection highlight to mesh (and siblings with same name)
     */
    _applySelectEffect(mesh) {
        if (!mesh) return;

        const name = mesh.name;
        const parent = mesh.parent;

        // Highlight all meshes with the same name in the group
        if (parent) {
            parent.traverse((child) => {
                if (child.isMesh && child.name === name && child.userData.originalMaterial) {
                    const mat = child.userData.originalMaterial.clone();
                    mat.emissive = this.selectEmissive.clone();
                    mat.emissiveIntensity = 0.45;
                    if (mat.color) mat.color.lerp(this.selectColor, 0.35);
                    child.material = mat;
                    child.userData._isSelected = true;
                }
            });
        }
    }

    /**
     * Remove selection highlight from all selected meshes
     */
    _clearSelectEffect() {
        if (!this.selectedMesh) return;

        const name = this.selectedMesh.name;
        const parent = this.selectedMesh.parent;

        if (parent) {
            parent.traverse((child) => {
                if (child.isMesh && child.userData._isSelected && child.userData.originalMaterial) {
                    child.material = child.userData.originalMaterial.clone();
                    child.userData._isSelected = false;
                }
            });
        }
    }

    /**
     * Restore hover material
     */
    _restoreHoverMesh() {
        if (this.hoveredMesh && !this.hoveredMesh.userData._isSelected && this.hoveredMesh.userData.originalMaterial) {
            this.hoveredMesh.material = this.hoveredMesh.userData.originalMaterial.clone();
        }
    }

    // ─── Event Handlers ─── //

    _handlePointerMove(event) {
        const rect = this.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        if (this.isPointerDown) {
            this.pointerMoved = true;
        }

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        const mesh = this._findValidMesh(intersects);

        if (mesh !== this.hoveredMesh) {
            // Restore previous hovered
            this._restoreHoverMesh();
            this.hoveredMesh = mesh;

            if (mesh) {
                this._applyHoverEffect(mesh);
                this.domElement.style.cursor = 'pointer';
                const key = this.getOrganelleKey(mesh.name);
                if (this.onHover) this.onHover(key, event);
            } else {
                this.domElement.style.cursor = 'default';
                if (this.onHover) this.onHover(null, event);
            }
        } else if (mesh && this.onHover) {
            // Update tooltip position even if same mesh
            const key = this.getOrganelleKey(mesh.name);
            this.onHover(key, event);
        }
    }

    _handlePointerDown() {
        this.isPointerDown = true;
        this.pointerMoved = false;
    }

    _handlePointerUp(event) {
        this.isPointerDown = false;

        // Only register click if pointer didn't move (not orbiting)
        if (this.pointerMoved) return;

        if (this.hoveredMesh) {
            // Clear previous selection
            this._clearSelectEffect();

            this.selectedMesh = this.hoveredMesh;
            this._applySelectEffect(this.selectedMesh);

            const key = this.getOrganelleKey(this.selectedMesh.name);
            if (this.onSelect) this.onSelect(key);
        } else {
            // Clicked empty space → deselect
            if (this.selectedMesh) {
                this._clearSelectEffect();
                this.selectedMesh = null;
                if (this.onDeselect) this.onDeselect();
            }
        }
    }

    /**
     * Clean up event listeners
     */
    dispose() {
        this.domElement.removeEventListener('pointermove', this._onPointerMove);
        this.domElement.removeEventListener('pointerdown', this._onPointerDown);
        this.domElement.removeEventListener('pointerup', this._onPointerUp);
    }
}
