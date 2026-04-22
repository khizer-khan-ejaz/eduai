/* ============================================================
   LEARN-THREE.JS — Three.js 3D Models for EduVerse
   Contains: Hero particles, Geometry shapes, Atom model, Cell model
   ============================================================ */

// ══════════════════════════════════════════════════════
// 1. HERO PARTICLE BACKGROUND
// ══════════════════════════════════════════════════════

let heroScene, heroCamera, heroRenderer, heroParticles, heroAnimId;

function initHeroScene() {
    const canvas = document.getElementById('hero-three-canvas');
    if (!canvas || heroRenderer) return;

    heroScene = new THREE.Scene();
    heroCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    heroCamera.position.z = 5;

    heroRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create particle system
    const particleCount = 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorPalette = [
        new THREE.Color(0x6c5ce7), // purple
        new THREE.Color(0x00cec9), // teal
        new THREE.Color(0xa29bfe), // light purple
        new THREE.Color(0x55efc4), // light teal
        new THREE.Color(0xfd79a8), // pink
    ];

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

        const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;

        sizes[i] = Math.random() * 3 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });

    heroParticles = new THREE.Points(geometry, material);
    heroScene.add(heroParticles);

    // Add some floating geometry shapes
    const shapeMaterials = [
        new THREE.MeshPhongMaterial({ color: 0x6c5ce7, transparent: true, opacity: 0.15, wireframe: true }),
        new THREE.MeshPhongMaterial({ color: 0x00cec9, transparent: true, opacity: 0.15, wireframe: true }),
        new THREE.MeshPhongMaterial({ color: 0xfd79a8, transparent: true, opacity: 0.1, wireframe: true }),
    ];

    const shapes = [
        new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 1), shapeMaterials[0]),
        new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), shapeMaterials[1]),
        new THREE.Mesh(new THREE.TetrahedronGeometry(0.5, 0), shapeMaterials[2]),
    ];

    shapes[0].position.set(-3, 1.5, -2);
    shapes[1].position.set(3, -1, -1);
    shapes[2].position.set(0, -2, -3);

    shapes.forEach(s => heroScene.add(s));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    heroScene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x6c5ce7, 1, 20);
    pointLight.position.set(5, 5, 5);
    heroScene.add(pointLight);

    // Mouse interaction
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animateHero() {
        heroAnimId = requestAnimationFrame(animateHero);

        const time = Date.now() * 0.001;

        // Rotate particles
        heroParticles.rotation.x = time * 0.05 + mouseY * 0.1;
        heroParticles.rotation.y = time * 0.08 + mouseX * 0.1;

        // Float positions
        const pos = heroParticles.geometry.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
            pos[i + 1] += Math.sin(time + i) * 0.001;
        }
        heroParticles.geometry.attributes.position.needsUpdate = true;

        // Rotate shapes
        shapes.forEach((s, idx) => {
            s.rotation.x = time * (0.2 + idx * 0.1);
            s.rotation.y = time * (0.15 + idx * 0.08);
            s.position.y += Math.sin(time * 0.5 + idx) * 0.003;
        });

        heroRenderer.render(heroScene, heroCamera);
    }

    animateHero();

    // Handle resize
    window.addEventListener('resize', () => {
        if (!heroRenderer) return;
        heroCamera.aspect = window.innerWidth / window.innerHeight;
        heroCamera.updateProjectionMatrix();
        heroRenderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function destroyHeroScene() {
    if (heroAnimId) cancelAnimationFrame(heroAnimId);
    heroAnimId = null;
    // Don't destroy renderer — just stop animation
}


// ══════════════════════════════════════════════════════
// 2. GEOMETRY 3D SHAPES
// ══════════════════════════════════════════════════════

let geoScene, geoCamera, geoRenderer, geoMesh, geoAnimId, geoControls;
let currentShapeType = 'cube';

const shapeData = {
    cube: {
        name: 'Cube', 
        formula: 'Volume = a³ &nbsp;|&nbsp; Surface Area = 6a²',
        desc: 'A cube has 6 equal square faces, 12 edges, and 8 vertices. All edges are equal in length. Example: A dice, Rubik\'s cube.',
        create: () => new THREE.BoxGeometry(2, 2, 2),
        color: 0x6c5ce7
    },
    sphere: {
        name: 'Sphere',
        formula: 'Volume = (4/3)πr³ &nbsp;|&nbsp; Surface Area = 4πr²',
        desc: 'A sphere has no edges or vertices. Every point on its surface is equidistant from the center. Example: Football, Earth.',
        create: () => new THREE.SphereGeometry(1.2, 32, 32),
        color: 0x00cec9
    },
    cone: {
        name: 'Cone',
        formula: 'Volume = (1/3)πr²h &nbsp;|&nbsp; CSA = πrl',
        desc: 'A cone has a circular base and one vertex (apex). The curved surface connects the base circle to the apex. Example: Ice cream cone, party hat.',
        create: () => new THREE.ConeGeometry(1.2, 2.5, 32),
        color: 0xfd79a8
    },
    cylinder: {
        name: 'Cylinder',
        formula: 'Volume = πr²h &nbsp;|&nbsp; CSA = 2πrh',
        desc: 'A cylinder has two parallel circular bases connected by a curved surface. Example: Soda can, water pipe, batteries.',
        create: () => new THREE.CylinderGeometry(1, 1, 2.5, 32),
        color: 0xfdcb6e
    },
    torus: {
        name: 'Torus',
        formula: 'Volume = 2π²Rr² &nbsp;|&nbsp; SA = 4π²Rr',
        desc: 'A torus is a donut shape formed by revolving a circle around an axis. R is the distance from center, r is the tube radius. Example: Donut, tire tube.',
        create: () => new THREE.TorusGeometry(1, 0.4, 16, 64),
        color: 0x55efc4
    }
};

function initGeometryScene() {
    const container = document.getElementById('geometryThreeContainer');
    if (!container || geoRenderer) return;

    geoScene = new THREE.Scene();
    geoCamera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    geoCamera.position.set(3, 2, 4);

    geoRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    geoRenderer.setSize(container.clientWidth, container.clientHeight);
    geoRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    geoRenderer.setClearColor(0x000000, 0);
    container.appendChild(geoRenderer.domElement);

    // Lights
    geoScene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 5);
    geoScene.add(dirLight);
    const pointL = new THREE.PointLight(0x6c5ce7, 0.5, 15);
    pointL.position.set(-3, 3, 3);
    geoScene.add(pointL);

    // Grid helper
    const grid = new THREE.GridHelper(8, 8, 0x333355, 0x222244);
    grid.position.y = -1.8;
    geoScene.add(grid);

    // Create initial shape
    createGeoShape('cube');

    // Simple mouse rotation (orbit-like)
    let isDragging = false, prevX = 0, prevY = 0, rotX = 0.3, rotY = 0;
    const el = geoRenderer.domElement;

    el.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
    el.addEventListener('mousemove', e => {
        if (!isDragging) return;
        rotY += (e.clientX - prevX) * 0.01;
        rotX += (e.clientY - prevY) * 0.01;
        prevX = e.clientX; prevY = e.clientY;
    });
    el.addEventListener('mouseup', () => isDragging = false);
    el.addEventListener('mouseleave', () => isDragging = false);
    
    // Touch events
    el.addEventListener('touchstart', e => { isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; }, {passive: true});
    el.addEventListener('touchmove', e => {
        if (!isDragging) return;
        rotY += (e.touches[0].clientX - prevX) * 0.01;
        rotX += (e.touches[0].clientY - prevY) * 0.01;
        prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
    }, {passive: true});
    el.addEventListener('touchend', () => isDragging = false);

    // Scroll to zoom
    el.addEventListener('wheel', e => {
        geoCamera.position.z += e.deltaY * 0.005;
        geoCamera.position.z = Math.max(2, Math.min(10, geoCamera.position.z));
    }, {passive: true});

    function animateGeo() {
        geoAnimId = requestAnimationFrame(animateGeo);
        if (geoMesh) {
            if (!isDragging) rotY += 0.005;
            geoMesh.rotation.x = rotX;
            geoMesh.rotation.y = rotY;
        }
        geoCamera.lookAt(0, 0, 0);
        geoRenderer.render(geoScene, geoCamera);
    }
    animateGeo();

    // Resize
    const ro = new ResizeObserver(() => {
        if (!container.clientWidth) return;
        geoCamera.aspect = container.clientWidth / container.clientHeight;
        geoCamera.updateProjectionMatrix();
        geoRenderer.setSize(container.clientWidth, container.clientHeight);
    });
    ro.observe(container);
}

function createGeoShape(type) {
    if (geoMesh) geoScene.remove(geoMesh);
    const data = shapeData[type];
    if (!data) return;

    const geom = data.create();
    
    // Main solid mesh
    const mat = new THREE.MeshPhongMaterial({
        color: data.color,
        transparent: true,
        opacity: 0.7,
        shininess: 100,
    });
    geoMesh = new THREE.Mesh(geom, mat);

    // Wireframe overlay
    const wireGeom = data.create();
    const wireMat = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.15 
    });
    const wire = new THREE.Mesh(wireGeom, wireMat);
    geoMesh.add(wire);

    geoScene.add(geoMesh);
}

function changeShape(type) {
    currentShapeType = type;
    createGeoShape(type);

    // Update info
    const data = shapeData[type];
    document.getElementById('shapeInfoPanel').querySelector('h3').textContent = '📐 ' + data.name;
    document.getElementById('shapeFormula').innerHTML = data.formula;
    document.getElementById('shapeDescription').textContent = data.desc;

    // Update buttons
    document.querySelectorAll('[id^="shapeBtn-"]').forEach(btn => btn.classList.remove('primary'));
    const activeBtn = document.getElementById('shapeBtn-' + type);
    if (activeBtn) activeBtn.classList.add('primary');

    trackProgress('geometry', 'explored');
}


// ══════════════════════════════════════════════════════
// 3. ATOM 3D MODEL
// ══════════════════════════════════════════════════════

let atomScene, atomCamera, atomRenderer, atomAnimId, atomGroup;
let currentAtom = 'carbon';

const atomData = {
    carbon: {
        name: 'Carbon', symbol: 'C', protons: 6, neutrons: 6, electrons: 6,
        shells: [2, 4],
        config: 'Electronic Configuration: 2, 4',
        desc: 'Carbon has 6 protons, 6 neutrons, and 6 electrons. Electrons orbit in 2 shells: 2 in the first, 4 in the second. Carbon is the basis of all organic life!',
        nucleusColor: 0xff6b6b,
    },
    oxygen: {
        name: 'Oxygen', symbol: 'O', protons: 8, neutrons: 8, electrons: 8,
        shells: [2, 6],
        config: 'Electronic Configuration: 2, 6',
        desc: 'Oxygen has 8 protons, 8 neutrons, and 8 electrons (2 in first shell, 6 in second). It\'s essential for respiration and makes up 21% of air.',
        nucleusColor: 0x74b9ff,
    },
    sodium: {
        name: 'Sodium', symbol: 'Na', protons: 11, neutrons: 12, electrons: 11,
        shells: [2, 8, 1],
        config: 'Electronic Configuration: 2, 8, 1',
        desc: 'Sodium has 11 protons, 12 neutrons, and 11 electrons in 3 shells (2, 8, 1). It easily loses 1 electron to form Na⁺. Found in common salt (NaCl).',
        nucleusColor: 0xfdcb6e,
    },
    neon: {
        name: 'Neon', symbol: 'Ne', protons: 10, neutrons: 10, electrons: 10,
        shells: [2, 8],
        config: 'Electronic Configuration: 2, 8 (Noble gas — stable)',
        desc: 'Neon has 10 protons, 10 neutrons, 10 electrons. Both shells are full (2, 8), making neon extremely stable (noble gas). Used in neon signs!',
        nucleusColor: 0x55efc4,
    }
};

function initAtomScene() {
    const container = document.getElementById('atomThreeContainer');
    if (!container || atomRenderer) return;

    atomScene = new THREE.Scene();
    atomCamera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    atomCamera.position.set(0, 0, 12);

    atomRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    atomRenderer.setSize(container.clientWidth, container.clientHeight);
    atomRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    atomRenderer.setClearColor(0x000000, 0);
    container.appendChild(atomRenderer.domElement);

    // Lights
    atomScene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dLight.position.set(5, 8, 5);
    atomScene.add(dLight);
    const pLight = new THREE.PointLight(0xff6b6b, 0.8, 20);
    atomScene.add(pLight);

    buildAtomModel('carbon');

    // Mouse orbit
    let isDragging = false, prevX = 0, prevY = 0;
    const el = atomRenderer.domElement;

    el.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
    el.addEventListener('mousemove', e => {
        if (!isDragging || !atomGroup) return;
        atomGroup.rotation.y += (e.clientX - prevX) * 0.01;
        atomGroup.rotation.x += (e.clientY - prevY) * 0.01;
        prevX = e.clientX; prevY = e.clientY;
    });
    el.addEventListener('mouseup', () => isDragging = false);
    el.addEventListener('mouseleave', () => isDragging = false);
    
    el.addEventListener('touchstart', e => { isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; }, {passive: true});
    el.addEventListener('touchmove', e => {
        if (!isDragging || !atomGroup) return;
        atomGroup.rotation.y += (e.touches[0].clientX - prevX) * 0.01;
        atomGroup.rotation.x += (e.touches[0].clientY - prevY) * 0.01;
        prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
    }, {passive: true});
    el.addEventListener('touchend', () => isDragging = false);

    el.addEventListener('wheel', e => {
        atomCamera.position.z += e.deltaY * 0.01;
        atomCamera.position.z = Math.max(5, Math.min(25, atomCamera.position.z));
    }, {passive: true});

    function animateAtom() {
        atomAnimId = requestAnimationFrame(animateAtom);
        if (atomGroup && !isDragging) {
            atomGroup.rotation.y += 0.003;
        }

        // Animate electron orbits
        if (atomGroup) {
            const time = Date.now() * 0.002;
            atomGroup.children.forEach(child => {
                if (child.userData && child.userData.isElectron) {
                    const r = child.userData.orbitRadius;
                    const speed = child.userData.speed;
                    const offset = child.userData.offset;
                    const tiltX = child.userData.tiltX || 0;
                    const tiltZ = child.userData.tiltZ || 0;
                    
                    const angle = time * speed + offset;
                    child.position.x = Math.cos(angle) * r;
                    child.position.y = Math.sin(angle) * r * Math.cos(tiltX);
                    child.position.z = Math.sin(angle) * r * Math.sin(tiltZ);
                }
            });
        }

        atomRenderer.render(atomScene, atomCamera);
    }
    animateAtom();

    const ro = new ResizeObserver(() => {
        if (!container.clientWidth) return;
        atomCamera.aspect = container.clientWidth / container.clientHeight;
        atomCamera.updateProjectionMatrix();
        atomRenderer.setSize(container.clientWidth, container.clientHeight);
    });
    ro.observe(container);
}

function buildAtomModel(type) {
    if (atomGroup) atomScene.remove(atomGroup);
    atomGroup = new THREE.Group();

    const data = atomData[type];
    if (!data) return;

    // Nucleus (cluster of protons + neutrons)
    const nucleusGroup = new THREE.Group();
    const nucMat = new THREE.MeshPhongMaterial({ color: data.nucleusColor, shininess: 80 });
    const neutMat = new THREE.MeshPhongMaterial({ color: 0x888888, shininess: 60 });

    const totalNucleons = data.protons + data.neutrons;
    for (let i = 0; i < totalNucleons; i++) {
        const mat = i < data.protons ? nucMat : neutMat;
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), mat);
        
        // Arrange in a cluster
        const phi = Math.acos(-1 + (2 * i + 1) / totalNucleons);
        const theta = Math.sqrt(totalNucleons * Math.PI) * phi;
        const r = 0.35 * Math.pow(totalNucleons, 1/3);
        
        sphere.position.set(
            r * Math.cos(theta) * Math.sin(phi),
            r * Math.sin(theta) * Math.sin(phi),
            r * Math.cos(phi)
        );
        nucleusGroup.add(sphere);
    }

    // Glow around nucleus
    const glowMat = new THREE.MeshBasicMaterial({ color: data.nucleusColor, transparent: true, opacity: 0.15 });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), glowMat);
    nucleusGroup.add(glow);

    atomGroup.add(nucleusGroup);

    // Electron shells (orbit rings + electrons)
    data.shells.forEach((electronCount, shellIdx) => {
        const radius = 2.5 + shellIdx * 2;

        // Orbit ring
        const ringGeom = new THREE.TorusGeometry(radius, 0.02, 8, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x6c5ce7, transparent: true, opacity: 0.3 });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2 + shellIdx * 0.3;
        atomGroup.add(ring);

        // Add another ring at different angle
        const ring2 = ring.clone();
        ring2.rotation.x = Math.PI / 2 - (shellIdx + 1) * 0.4;
        ring2.rotation.z = (shellIdx + 1) * 0.5;
        atomGroup.add(ring2);

        // Electrons
        const electronMat = new THREE.MeshPhongMaterial({ 
            color: 0x74b9ff,
            emissive: 0x3498db,
            emissiveIntensity: 0.5,
            shininess: 100,
        });

        for (let e = 0; e < electronCount; e++) {
            const electron = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), electronMat);
            
            // Electron glow
            const eGlow = new THREE.Mesh(
                new THREE.SphereGeometry(0.25, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0x74b9ff, transparent: true, opacity: 0.2 })
            );
            electron.add(eGlow);

            electron.userData = {
                isElectron: true,
                orbitRadius: radius,
                speed: 0.8 - shellIdx * 0.15,
                offset: (e / electronCount) * Math.PI * 2,
                tiltX: shellIdx * 0.3 + e * 0.2,
                tiltZ: shellIdx * 0.5 + e * 0.3,
            };
            atomGroup.add(electron);
        }
    });

    atomScene.add(atomGroup);
}

function changeAtom(type) {
    currentAtom = type;
    buildAtomModel(type);

    const data = atomData[type];
    document.getElementById('atomInfoPanel').querySelector('h3').textContent = '⚛️ ' + data.name + ' Atom';
    document.getElementById('atomDescription').textContent = data.desc;
    document.getElementById('atomConfig').textContent = data.config;

    document.querySelectorAll('[id^="atomBtn-"]').forEach(btn => btn.classList.remove('primary'));
    const activeBtn = document.getElementById('atomBtn-' + type);
    if (activeBtn) activeBtn.classList.add('primary');

    trackProgress('atoms', 'explored');
}


// ══════════════════════════════════════════════════════
// 4. CELL 3D MODEL
// ══════════════════════════════════════════════════════

let cellScene, cellCamera, cellRenderer, cellAnimId, cellGroup;
let cellOrganelles = {};

function initCellScene() {
    const container = document.getElementById('cellThreeContainer');
    if (!container || cellRenderer) return;

    cellScene = new THREE.Scene();
    cellCamera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    cellCamera.position.set(0, 2, 8);

    cellRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    cellRenderer.setSize(container.clientWidth, container.clientHeight);
    cellRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    cellRenderer.setClearColor(0x000000, 0);
    container.appendChild(cellRenderer.domElement);

    // Lights
    cellScene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dLight.position.set(5, 8, 5);
    cellScene.add(dLight);
    const pLight = new THREE.PointLight(0x55efc4, 0.5, 15);
    pLight.position.set(-2, 2, 3);
    cellScene.add(pLight);

    buildCellModel();

    // Mouse orbit
    let isDragging = false, prevX = 0, prevY = 0;
    const el = cellRenderer.domElement;

    el.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
    el.addEventListener('mousemove', e => {
        if (!isDragging || !cellGroup) return;
        cellGroup.rotation.y += (e.clientX - prevX) * 0.008;
        cellGroup.rotation.x += (e.clientY - prevY) * 0.008;
        prevX = e.clientX; prevY = e.clientY;
    });
    el.addEventListener('mouseup', () => isDragging = false);
    el.addEventListener('mouseleave', () => isDragging = false);

    el.addEventListener('touchstart', e => { isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; }, {passive: true});
    el.addEventListener('touchmove', e => {
        if (!isDragging || !cellGroup) return;
        cellGroup.rotation.y += (e.touches[0].clientX - prevX) * 0.008;
        cellGroup.rotation.x += (e.touches[0].clientY - prevY) * 0.008;
        prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
    }, {passive: true});
    el.addEventListener('touchend', () => isDragging = false);

    el.addEventListener('wheel', e => {
        cellCamera.position.z += e.deltaY * 0.01;
        cellCamera.position.z = Math.max(4, Math.min(15, cellCamera.position.z));
    }, {passive: true});

    function animateCell() {
        cellAnimId = requestAnimationFrame(animateCell);
        if (cellGroup && !isDragging) {
            cellGroup.rotation.y += 0.002;
        }

        // Subtle floating animation for organelles
        const time = Date.now() * 0.001;
        if (cellOrganelles.mitochondria) {
            cellOrganelles.mitochondria.forEach((m, i) => {
                m.position.y += Math.sin(time * 2 + i) * 0.002;
            });
        }

        cellRenderer.render(cellScene, cellCamera);
    }
    animateCell();

    const ro = new ResizeObserver(() => {
        if (!container.clientWidth) return;
        cellCamera.aspect = container.clientWidth / container.clientHeight;
        cellCamera.updateProjectionMatrix();
        cellRenderer.setSize(container.clientWidth, container.clientHeight);
    });
    ro.observe(container);
}

function buildCellModel() {
    cellGroup = new THREE.Group();
    cellOrganelles = {};

    // Cell membrane (outer transparent sphere)
    const membraneMat = new THREE.MeshPhongMaterial({
        color: 0x55efc4,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        shininess: 100,
    });
    const membrane = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 32), membraneMat);
    cellGroup.add(membrane);
    cellOrganelles.membrane = membrane;

    // Membrane wireframe
    const memWire = new THREE.Mesh(
        new THREE.SphereGeometry(3.02, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x55efc4, wireframe: true, transparent: true, opacity: 0.08 })
    );
    cellGroup.add(memWire);

    // Cytoplasm (inner semi-transparent)
    const cytoMat = new THREE.MeshPhongMaterial({
        color: 0xffeaa7,
        transparent: true,
        opacity: 0.05,
    });
    const cyto = new THREE.Mesh(new THREE.SphereGeometry(2.8, 16, 16), cytoMat);
    cellGroup.add(cyto);

    // Nucleus
    const nucleusMat = new THREE.MeshPhongMaterial({
        color: 0x6c5ce7,
        transparent: true,
        opacity: 0.6,
        shininess: 80,
    });
    const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 24), nucleusMat);
    nucleus.position.set(0, 0.2, 0);
    cellGroup.add(nucleus);
    cellOrganelles.nucleus = nucleus;

    // Nucleolus (dark spot inside nucleus)
    const nucleolusMat = new THREE.MeshPhongMaterial({ color: 0x2d1b69 });
    const nucleolus = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), nucleolusMat);
    nucleolus.position.set(0.2, 0.3, 0.2);
    cellGroup.add(nucleolus);

    // Nuclear membrane
    const nucMembrane = new THREE.Mesh(
        new THREE.SphereGeometry(0.95, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x6c5ce7, wireframe: true, transparent: true, opacity: 0.15 })
    );
    nucMembrane.position.copy(nucleus.position);
    cellGroup.add(nucMembrane);

    // Mitochondria (elongated ellipsoids)
    const mitoMat = new THREE.MeshPhongMaterial({ color: 0xff6b6b, shininess: 60 });
    cellOrganelles.mitochondria = [];
    const mitoPositions = [
        [1.5, 0.5, 0.8], [-1.2, -0.3, 1.2], [0.8, -1, -1.5], [-1.5, 1, -0.5]
    ];
    mitoPositions.forEach(pos => {
        const mito = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), mitoMat);
        mito.scale.set(1.8, 0.8, 0.8);
        mito.position.set(...pos);
        mito.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        cellGroup.add(mito);
        cellOrganelles.mitochondria.push(mito);
    });

    // Endoplasmic Reticulum (wavy tubes)
    const erMat = new THREE.MeshPhongMaterial({ color: 0x74b9ff, transparent: true, opacity: 0.4 });
    cellOrganelles.er = [];
    for (let i = 0; i < 6; i++) {
        const erPiece = new THREE.Mesh(new THREE.TorusGeometry(0.6 + i * 0.15, 0.06, 8, 32), erMat);
        erPiece.position.set(0.5, -0.3 + i * 0.15, 0);
        erPiece.rotation.set(i * 0.3, 0, i * 0.2);
        cellGroup.add(erPiece);
        cellOrganelles.er.push(erPiece);
    }

    // Ribosomes (tiny dots scattered)
    const riboMat = new THREE.MeshPhongMaterial({ color: 0xfdcb6e });
    for (let i = 0; i < 20; i++) {
        const ribo = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), riboMat);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const r = 1.5 + Math.random() * 1;
        ribo.position.set(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.cos(phi),
            r * Math.sin(phi) * Math.sin(theta)
        );
        cellGroup.add(ribo);
    }

    // Golgi apparatus (stacked discs)
    const golgiMat = new THREE.MeshPhongMaterial({ color: 0xfd79a8, transparent: true, opacity: 0.5 });
    for (let i = 0; i < 4; i++) {
        const disc = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 6, 24), golgiMat);
        disc.position.set(-1.5, -0.5 + i * 0.12, -0.5);
        disc.rotation.x = Math.PI / 2;
        cellGroup.add(disc);
    }

    cellScene.add(cellGroup);
}

const organelleData = {
    nucleus: {
        name: '🧬 Nucleus',
        desc: 'The nucleus is the control center of the cell. It contains DNA (genetic material) that controls cell activities and reproduction. It\'s surrounded by a nuclear membrane with pores.',
    },
    mitochondria: {
        name: '🔋 Mitochondria',
        desc: 'Called the "powerhouse of the cell", mitochondria produce energy (ATP) through cellular respiration. They have a double membrane — the inner membrane is folded into cristae to increase surface area.',
    },
    er: {
        name: '🔬 Endoplasmic Reticulum',
        desc: 'The ER is a network of tubes that transports materials through the cell. Rough ER (with ribosomes) makes proteins. Smooth ER makes lipids and detoxifies chemicals.',
    },
    membrane: {
        name: '🛡️ Cell Membrane',
        desc: 'The cell membrane (plasma membrane) is a thin, flexible barrier that controls what enters and exits the cell. It\'s made of a phospholipid bilayer with embedded proteins — selectively permeable.',
    }
};

function highlightOrganelle(name) {
    const info = organelleData[name];
    if (!info) return;
    
    document.getElementById('organelleName').textContent = info.name;
    document.getElementById('organelleDesc').textContent = info.desc;

    // Reset all opacity
    if (cellOrganelles.membrane) cellOrganelles.membrane.material.opacity = 0.12;
    if (cellOrganelles.nucleus) cellOrganelles.nucleus.material.opacity = 0.6;
    if (cellOrganelles.mitochondria) cellOrganelles.mitochondria.forEach(m => m.material.opacity = 1);
    if (cellOrganelles.er) cellOrganelles.er.forEach(e => e.material.opacity = 0.4);

    // Highlight selected
    switch(name) {
        case 'nucleus':
            cellOrganelles.nucleus.material.opacity = 1;
            cellOrganelles.nucleus.material.emissive = new THREE.Color(0x6c5ce7);
            cellOrganelles.nucleus.material.emissiveIntensity = 0.3;
            setTimeout(() => {
                cellOrganelles.nucleus.material.emissiveIntensity = 0;
            }, 2000);
            break;
        case 'mitochondria':
            cellOrganelles.mitochondria.forEach(m => {
                m.material.emissive = new THREE.Color(0xff6b6b);
                m.material.emissiveIntensity = 0.5;
                setTimeout(() => { m.material.emissiveIntensity = 0; }, 2000);
            });
            break;
        case 'er':
            cellOrganelles.er.forEach(e => {
                e.material.opacity = 0.9;
                e.material.emissive = new THREE.Color(0x74b9ff);
                e.material.emissiveIntensity = 0.5;
                setTimeout(() => { e.material.emissiveIntensity = 0; }, 2000);
            });
            break;
        case 'membrane':
            cellOrganelles.membrane.material.opacity = 0.35;
            cellOrganelles.membrane.material.emissive = new THREE.Color(0x55efc4);
            cellOrganelles.membrane.material.emissiveIntensity = 0.3;
            setTimeout(() => {
                cellOrganelles.membrane.material.emissiveIntensity = 0;
                cellOrganelles.membrane.material.opacity = 0.12;
            }, 2000);
            break;
    }

    trackProgress('cell', 'explored');
}
