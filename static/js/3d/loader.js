// src/static/js/3d/loader.js
/**
 * Handles Three.js texture and model asynchronous loading
 */

class ModelLoader {
    constructor(scene, onProgress, onLoadComplete) {
        this.scene = scene;
        this.currentModel = null;
        this.gltfLoader = new THREE.GLTFLoader();
        this.onProgressCb = onProgress;
        this.onCompleteCb = onLoadComplete;
    }

    loadModelString(url, fallbackType = false) {
        if(this.currentModel) {
            this.scene.remove(this.currentModel);
            // Optional: iterate and dispose geometries/materials
            this.currentModel = null;
        }

        if (fallbackType) {
            if (fallbackType === 'plant') {
                this.buildFallbackPlantCell();
            } else {
                this.buildFallbackAnimalCell();
            }
            return;
        }

        this.gltfLoader.load(
            url,
            (gltf) => {
                this.currentModel = gltf.scene;

                // Center object based on bounding box
                const box = new THREE.Box3().setFromObject(this.currentModel);
                const center = box.getCenter(new THREE.Vector3());
                this.currentModel.position.x += (this.currentModel.position.x - center.x);
                this.currentModel.position.y += (this.currentModel.position.y - center.y);
                this.currentModel.position.z += (this.currentModel.position.z - center.z);
                
                // Add outlines or standard materials
                this.currentModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        // Keep a reference to original material for highlighting
                        child.userData.originalMaterial = child.material.clone();
                    }
                });

                this.scene.add(this.currentModel);
                if(this.onCompleteCb) this.onCompleteCb(this.currentModel);
            },
            (xhr) => {
                // Progress callback logging
                if(this.onProgressCb) this.onProgressCb(Math.round((xhr.loaded / xhr.total) * 100));
            },
            (error) => {
                console.error('An error happened loading GLTF:', error);
                alert("Could not load GLB file. Providing fallback cell simulation instead.");
                if(url.includes('plant')) this.buildFallbackPlantCell();
                else this.buildFallbackAnimalCell();
            }
        );
    }

    buildFallbackPlantCell() {
        const group = new THREE.Group();

        const getMat = (color, opacity = 1.0) => new THREE.MeshPhongMaterial({
            color: color, 
            transparent: opacity < 1.0, 
            opacity: opacity,
            shininess: 50
        });

        // Cell Wall (Box)
        const wallGeo = new THREE.BoxGeometry(5.2, 5.2, 5.2);
        const wallMaterial = getMat(0x22c55e, 0.4);
        const wall = new THREE.Mesh(wallGeo, wallMaterial);
        wall.name = "Cell Wall";
        group.add(wall);

        // Cytoplasm/Membrane (Inner Box)
        const membraneGeo = new THREE.BoxGeometry(4.8, 4.8, 4.8);
        const membrane = new THREE.Mesh(membraneGeo, getMat(0x86efac, 0.6));
        membrane.name = "Cell Membrane";
        group.add(membrane);

        // Nucleus
        const nuclesGeo = new THREE.SphereGeometry(0.8, 32, 32);
        const nuclues = new THREE.Mesh(nuclesGeo, getMat(0x4338ca));
        nuclues.position.set(-1, 0, -1);
        nuclues.name = "Nucleus";
        group.add(nuclues);

        // Chloroplasts
        const chloroGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.0, 16);
        const c1 = new THREE.Mesh(chloroGeo, getMat(0x166534));
        c1.position.set(1.5, 1.5, 1);
        c1.name = "Chloroplast";
        
        const c2 = new THREE.Mesh(chloroGeo, getMat(0x166534));
        c2.position.set(1.2, -1.5, 0.5);
        c2.name = "Chloroplast";
        group.add(c1);
        group.add(c2);

        // Large Vacuole
        const vacuoleGeo = new THREE.SphereGeometry(1.4, 32, 32);
        vacuoleGeo.scale(1, 1.5, 1);
        const vacuole = new THREE.Mesh(vacuoleGeo, getMat(0x93c5fd, 0.8));
        vacuole.position.set(0.8, 0, 0);
        vacuole.name = "Vacuole";
        group.add(vacuole);

        // Rotate for better initial view
        group.rotation.x = Math.PI / 6;
        group.rotation.y = Math.PI / 4;

        group.traverse(child => {
            if (child.isMesh) {
                child.userData.originalMaterial = child.material.clone();
            }
        });

        this.currentModel = group;
        this.scene.add(this.currentModel);

        if(this.onCompleteCb) this.onCompleteCb(this.currentModel);
    }

    // fallback simulation specifically requested
    buildFallbackAnimalCell() {
        const group = new THREE.Group();

        // Material builder
        const getMat = (color, opacity = 1.0) => new THREE.MeshPhongMaterial({
            color: color, 
            transparent: opacity < 1.0, 
            opacity: opacity,
            shininess: 50
        });

        // Cytoplasm Membrane
        const membraneGeo = new THREE.SphereGeometry(3, 32, 32);
        const membrane = new THREE.Mesh(membraneGeo, getMat(0x65a30d, 0.4));
        membrane.name = "Cell_Membrane";
        group.add(membrane);

        // Nucleus
        const nuclesGeo = new THREE.SphereGeometry(1, 32, 32);
        const nuclues = new THREE.Mesh(nuclesGeo, getMat(0x4338ca));
        nuclues.position.set(0, 0, -0.5);
        nuclues.name = "Nucleus";
        group.add(nuclues);

        // Mitochondria (Cylinders instead of Capsules for r128 compat)
        const mitoGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 16);
        
        const m1 = new THREE.Mesh(mitoGeo, getMat(0xb91c1c));
        m1.position.set(1.5, 0.5, 1);
        m1.rotation.z = Math.PI / 4;
        m1.name = "Mitochondria_1";
        group.add(m1);

        const m2 = new THREE.Mesh(mitoGeo, getMat(0xb91c1c));
        m2.position.set(-1.2, -1.2, 0.5);
        m2.rotation.x = Math.PI / 4;
        m2.name = "Mitochondria_2";
        group.add(m2);

        // Ribosomes (Dots)
        const ribGeo = new THREE.SphereGeometry(0.1, 8, 8);
        for(let i=0; i<15; i++) {
            const r = new THREE.Mesh(ribGeo, getMat(0xf59e0b));
            r.position.set(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
            );
            r.name = "Ribosome_Group";
            group.add(r);
        }

        // Cache original materials
        group.traverse(child => {
            if (child.isMesh) child.userData.originalMaterial = child.material.clone();
        });

        this.currentModel = group;
        this.scene.add(group);
        if(this.onCompleteCb) this.onCompleteCb(this.currentModel);
    }
}
window.ModelLoader = ModelLoader;