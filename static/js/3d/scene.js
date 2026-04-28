// src/static/js/3d/scene.js
/**
 * Main application coordinator for Three.js
 */

class BiologySimulation {
    constructor() {
        this.container = document.getElementById("canvas-container");
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        // 1. Scene
        this.scene = new THREE.Scene();
        
        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 5, 15);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // 4. Lights
        this.setupLights();

        // 5. Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 50;

        // Dependencies Initializations
        this.ui = new window.UIManager();
        this.loader = new window.ModelLoader(this.scene, 
            // Progress callback (unused essentially since GLBLoader handles local fast)
            (percent) => { console.log(`Loading: ${percent}%`); },
            // Complete callback
            (model) => {
                this.controls.target.set(0,0,0); // Center orbit
                this.ui.setLoading(false);
            }
        );

        this.interaction = new window.InteractionManager(this.camera, this.scene, this.renderer.domElement, this.ui);

        // 6. Listeners
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        document.getElementById("btn-animal").addEventListener('click', () => this.switchModel('animal'));
        document.getElementById("btn-plant").addEventListener('click', () => this.switchModel('plant'));

        // Start Initial
        this.switchModel('animal');
        this.animate();
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7.5);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        const pointLight = new THREE.PointLight(0x38bdf8, 0.5, 50); // Small blue tint
        pointLight.position.set(-5, -5, -5);
        this.scene.add(pointLight);
    }

    switchModel(type) {
        this.ui.switchToggle(type);
        this.ui.setLoading(true);

        const urls = window.STATIC_URLS;
        if (type === 'animal') {
            // Using true boolean to force procedural generation fallback
            this.loader.loadModelString(urls.animalCell, 'animal'); 
        } else {
            // Force procedural fallback for plant cell as well
            this.loader.loadModelString(urls.plantCell, 'plant');
        }
    }

    onWindowResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        this.controls.update();

        // Optional specific passive rotation on child meshes over time could be added here
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Bootstrap Application
document.addEventListener("DOMContentLoaded", () => {
    // Ensuring basic THREE environment is loaded
    if (typeof THREE !== 'undefined') {
        const app = new BiologySimulation();
        window.bioApp = app; 
    } else {
        console.error("Three.js not loaded. Cannot start simulation.");
    }
});