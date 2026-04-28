// src/static/js/3d/interaction.js
/**
 * Handles Raycaster and mouse interaction to highlight and fire UI updates
 */
class InteractionManager {
    constructor(camera, scene, container, uiManagerCls) {
        this.camera = camera;
        this.scene = scene;
        this.container = container;
        this.uiManager = uiManagerCls;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.intersected = null; // Currently hovered mesh
        this.selected = null; // Currently clicked mesh

        // Highlights definition
        this.highlightMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x38bdf8, 
            wireframe: true, 
            transparent: true,
            opacity: 0.6 
        });

        this.selectMaterial = new THREE.MeshPhongMaterial({
            color: 0xfacc15,
            emissive: 0xca8a04,
            specular: 0x111111,
            shininess: 100 
        });

        // Optional specific mesh types to block interaction (like the main body bounding box if exists inside GLB)
        this.ignoredKeywords = ["glass", "container", "boundingbox"];

        this.initEvents();
    }

    initEvents() {
        this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.container.addEventListener('click', this.onClick.bind(this));
    }

    onMouseMove(event) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        let foundHover = null;
        for (let i = 0; i < intersects.length; i++) {
            let obj = intersects[i].object;
            // Ignore helper meshes based on name string
            let shouldIgnore = this.ignoredKeywords.some(kw => obj.name.toLowerCase().includes(kw));
            if (obj.isMesh && obj !== this.selected && !shouldIgnore) {
                foundHover = obj;
                break;
            }
        }

        if (this.intersected !== foundHover) {
            // Restore previous intersected
            if (this.intersected && this.intersected !== this.selected) {
                this.intersected.material = this.intersected.userData.originalMaterial;
            }

            this.intersected = foundHover;

            // Apply hover material
            if (this.intersected && this.intersected.name) {
                this.container.style.cursor = 'pointer';
                // Clone the original and tint it for a glow effect
                const glowMat = this.intersected.userData.originalMaterial.clone();
                glowMat.color.addScalar(0.2); // brighten slightly
                this.intersected.material = glowMat;
            } else {
                this.container.style.cursor = 'default';
            }
        }
    }

    onClick(event) {
        if (!this.intersected) {
             // Clicking background resets
            if (this.selected) {
                this.selected.material = this.selected.userData.originalMaterial;
                this.selected = null;
                this.uiManager.clearInfo();
            }
            return;
        }

        // Restore previous selection
        if (this.selected) {
            this.selected.material = this.selected.userData.originalMaterial;
        }

        this.selected = this.intersected;
        
        // Update Material to represent "Selected" state
        this.selected.material = this.selectMaterial.clone();
        
        // Dispatch UI update bridging through Biology data map
        this.uiManager.updateInfo(this.selected.name, window.CellBiologyData);
    }
}
window.InteractionManager = InteractionManager;