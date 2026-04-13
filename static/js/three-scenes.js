/**
 * ═══════════════════════════════════════════════
 * THREE.JS SCENES — AI Education Platform
 * 4 Interactive 3D Scenes:
 *   1. Hero Background (floating education objects)
 *   2. Biology (blood cells)
 *   3. Physics (wave interference)
 *   4. Chemistry (molecule)
 *   5. Maths (3D surface)
 * ═══════════════════════════════════════════════
 */

const ThreeScenes = {
    scenes: {},
    animationIds: {},

    // ─── HERO BACKGROUND SCENE ───
    initHero(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x0a0a1a, 1);

        camera.position.z = 30;

        // Particles
        const particleCount = 300;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const palette = [
            new THREE.Color(0x6c5ce7),
            new THREE.Color(0xa29bfe),
            new THREE.Color(0x74b9ff),
            new THREE.Color(0x00b894),
            new THREE.Color(0xfd79a8),
        ];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

            const color = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = Math.random() * 0.3 + 0.1;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        // Floating geometric shapes
        const shapes = [];
        const shapeMaterials = palette.map(c => new THREE.MeshPhongMaterial({
            color: c, transparent: true, opacity: 0.3, wireframe: true
        }));

        for (let i = 0; i < 8; i++) {
            let geometry;
            const type = Math.floor(Math.random() * 4);
            switch (type) {
                case 0: geometry = new THREE.IcosahedronGeometry(Math.random() * 1.5 + 0.5, 0); break;
                case 1: geometry = new THREE.OctahedronGeometry(Math.random() * 1.5 + 0.5, 0); break;
                case 2: geometry = new THREE.TetrahedronGeometry(Math.random() * 1.5 + 0.5, 0); break;
                default: geometry = new THREE.TorusGeometry(Math.random() + 0.5, 0.3, 8, 16); break;
            }
            const mesh = new THREE.Mesh(geometry, shapeMaterials[i % shapeMaterials.length]);
            mesh.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 25,
                (Math.random() - 0.5) * 15 - 5
            );
            mesh.userData = {
                rotSpeed: { x: Math.random() * 0.01, y: Math.random() * 0.01, z: Math.random() * 0.005 },
                floatSpeed: Math.random() * 0.005 + 0.002,
                floatOffset: Math.random() * Math.PI * 2
            };
            scene.add(mesh);
            shapes.push(mesh);
        }

        // Connection lines
        const lineMat = new THREE.LineBasicMaterial({ color: 0x6c5ce7, transparent: true, opacity: 0.1 });
        const connectionLines = [];
        for (let i = 0; i < 20; i++) {
            const lineGeom = new THREE.BufferGeometry();
            const pts = new Float32Array(6);
            lineGeom.setAttribute('position', new THREE.BufferAttribute(pts, 3));
            const line = new THREE.Line(lineGeom, lineMat);
            scene.add(line);
            connectionLines.push(line);
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0x6c5ce7, 1, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        let time = 0;
        const animate = () => {
            this.animationIds.hero = requestAnimationFrame(animate);
            time += 0.01;

            particles.rotation.y += 0.0005;
            particles.rotation.x += 0.0002;

            shapes.forEach(s => {
                s.rotation.x += s.userData.rotSpeed.x;
                s.rotation.y += s.userData.rotSpeed.y;
                s.rotation.z += s.userData.rotSpeed.z;
                s.position.y += Math.sin(time + s.userData.floatOffset) * s.userData.floatSpeed;
            });

            // Update connection lines between nearby particles
            const pos = particlesGeometry.attributes.position.array;
            let lineIdx = 0;
            for (let i = 0; i < particleCount && lineIdx < connectionLines.length; i += 10) {
                for (let j = i + 10; j < particleCount && lineIdx < connectionLines.length; j += 10) {
                    const dx = pos[i * 3] - pos[j * 3];
                    const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
                    const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (dist < 12) {
                        const linePos = connectionLines[lineIdx].geometry.attributes.position.array;
                        linePos[0] = pos[i * 3]; linePos[1] = pos[i * 3 + 1]; linePos[2] = pos[i * 3 + 2];
                        linePos[3] = pos[j * 3]; linePos[4] = pos[j * 3 + 1]; linePos[5] = pos[j * 3 + 2];
                        connectionLines[lineIdx].geometry.attributes.position.needsUpdate = true;
                        lineIdx++;
                    }
                }
            }

            renderer.render(scene, camera);
        };

        animate();

        // Resize handler
        const handleResize = () => {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        this.scenes.hero = { scene, camera, renderer };
    },

    // ─── BIOLOGY: BLOOD CELL FLOW ───
    initBiology(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const w = canvas.parentElement.clientWidth;
        const h = canvas.parentElement.clientHeight || 300;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a1a);
        const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        camera.position.set(0, 0, 12);

        // Blood vessel (tube)
        const tubePath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-8, 0, 0),
            new THREE.Vector3(-4, 2, 1),
            new THREE.Vector3(0, -1, -1),
            new THREE.Vector3(4, 1, 1),
            new THREE.Vector3(8, 0, 0),
        ]);
        const tubeGeom = new THREE.TubeGeometry(tubePath, 64, 1.5, 16, false);
        const tubeMat = new THREE.MeshPhongMaterial({
            color: 0x8b0000, transparent: true, opacity: 0.15, side: THREE.DoubleSide
        });
        const tube = new THREE.Mesh(tubeGeom, tubeMat);
        scene.add(tube);

        // Inner vessel glow
        const innerTube = new THREE.Mesh(
            new THREE.TubeGeometry(tubePath, 64, 1.3, 16, false),
            new THREE.MeshPhongMaterial({ color: 0xff2222, transparent: true, opacity: 0.05, side: THREE.DoubleSide })
        );
        scene.add(innerTube);

        // Red blood cells
        const cells = [];
        const cellGeom = new THREE.SphereGeometry(0.25, 16, 8);
        // Make it disc-shaped
        cellGeom.scale(1, 0.4, 1);

        for (let i = 0; i < 30; i++) {
            const cellMat = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(0, 0.8, 0.35 + Math.random() * 0.15),
                emissive: 0x330000,
                shininess: 80
            });
            const cell = new THREE.Mesh(cellGeom, cellMat);
            cell.userData = {
                t: Math.random(),
                speed: 0.001 + Math.random() * 0.002,
                offsetR: Math.random() * 0.8,
                offsetAngle: Math.random() * Math.PI * 2,
                rotSpeed: Math.random() * 0.05
            };
            scene.add(cell);
            cells.push(cell);
        }

        // White blood cells (larger, fewer)
        for (let i = 0; i < 3; i++) {
            const wbcMat = new THREE.MeshPhongMaterial({
                color: 0xeeeecc, emissive: 0x222200, shininess: 60, transparent: true, opacity: 0.8
            });
            const wbc = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), wbcMat);
            wbc.userData = {
                t: Math.random(),
                speed: 0.0008 + Math.random() * 0.001,
                offsetR: Math.random() * 0.5,
                offsetAngle: Math.random() * Math.PI * 2,
                rotSpeed: Math.random() * 0.02
            };
            scene.add(wbc);
            cells.push(wbc);
        }

        // Lighting
        scene.add(new THREE.AmbientLight(0x404040, 0.6));
        const light1 = new THREE.PointLight(0xff4444, 1, 30);
        light1.position.set(5, 5, 5);
        scene.add(light1);
        const light2 = new THREE.PointLight(0xff0000, 0.5, 30);
        light2.position.set(-5, -3, 3);
        scene.add(light2);

        const animate = () => {
            this.animationIds.biology = requestAnimationFrame(animate);

            cells.forEach(cell => {
                cell.userData.t += cell.userData.speed;
                if (cell.userData.t > 1) cell.userData.t = 0;

                const point = tubePath.getPointAt(cell.userData.t);
                const tangent = tubePath.getTangentAt(cell.userData.t);

                // Offset from center
                const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
                const binormal = new THREE.Vector3().crossVectors(tangent, normal);

                cell.position.copy(point)
                    .add(normal.multiplyScalar(Math.cos(cell.userData.offsetAngle) * cell.userData.offsetR))
                    .add(binormal.multiplyScalar(Math.sin(cell.userData.offsetAngle) * cell.userData.offsetR));

                cell.rotation.x += cell.userData.rotSpeed;
                cell.rotation.z += cell.userData.rotSpeed * 0.5;
            });

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            const w2 = canvas.parentElement.clientWidth;
            const h2 = canvas.parentElement.clientHeight || 300;
            camera.aspect = w2 / h2;
            camera.updateProjectionMatrix();
            renderer.setSize(w2, h2);
        };
        window.addEventListener('resize', handleResize);
        this.scenes.biology = { scene, camera, renderer };
    },

    // ─── PHYSICS: WAVE INTERFERENCE ───
    initPhysics(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const w = canvas.parentElement.clientWidth;
        const h = canvas.parentElement.clientHeight || 300;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a1a);
        const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        camera.position.set(0, 8, 15);
        camera.lookAt(0, 0, 0);

        // Wave surface
        const gridSize = 60;
        const gridGeom = new THREE.PlaneGeometry(20, 20, gridSize, gridSize);
        const gridMat = new THREE.MeshPhongMaterial({
            color: 0x2196F3,
            wireframe: true,
            transparent: true,
            opacity: 0.6,
            emissive: 0x0a1a3a,
            side: THREE.DoubleSide,
        });
        const grid = new THREE.Mesh(gridGeom, gridMat);
        grid.rotation.x = -Math.PI / 2;
        scene.add(grid);

        // Solid surface underneath
        const solidGeom = new THREE.PlaneGeometry(20, 20, gridSize, gridSize);
        const solidMat = new THREE.MeshPhongMaterial({
            color: 0x1565C0,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3,
            shininess: 100,
        });
        const solidMesh = new THREE.Mesh(solidGeom, solidMat);
        solidMesh.rotation.x = -Math.PI / 2;
        scene.add(solidMesh);

        // Source indicators
        const src1Geom = new THREE.SphereGeometry(0.15, 16, 16);
        const src1Mat = new THREE.MeshPhongMaterial({ color: 0xff4444, emissive: 0x440000 });
        const src1 = new THREE.Mesh(src1Geom, src1Mat);
        src1.position.set(-3, 0, 0);
        scene.add(src1);

        const src2 = new THREE.Mesh(src1Geom, new THREE.MeshPhongMaterial({ color: 0x44ff44, emissive: 0x004400 }));
        src2.position.set(3, 0, 0);
        scene.add(src2);

        // Lighting
        scene.add(new THREE.AmbientLight(0x404040, 0.5));
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(5, 10, 5);
        scene.add(light);

        let time = 0;
        const params = { frequency: 1.0, amplitude: 1.0 };

        const animate = () => {
            this.animationIds.physics = requestAnimationFrame(animate);
            time += 0.03;

            const positions = gridGeom.attributes.position.array;
            const solidPositions = solidGeom.attributes.position.array;

            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const y = positions[i + 1];

                // Two wave sources
                const d1 = Math.sqrt((x + 3) * (x + 3) + y * y);
                const d2 = Math.sqrt((x - 3) * (x - 3) + y * y);

                const wave1 = Math.sin(d1 * params.frequency * 2 - time * 3) / (d1 * 0.5 + 1);
                const wave2 = Math.sin(d2 * params.frequency * 2 - time * 3) / (d2 * 0.5 + 1);

                const z = (wave1 + wave2) * params.amplitude;
                positions[i + 2] = z;
                solidPositions[i + 2] = z;
            }

            gridGeom.attributes.position.needsUpdate = true;
            solidGeom.attributes.position.needsUpdate = true;
            gridGeom.computeVertexNormals();
            solidGeom.computeVertexNormals();

            // Pulse source indicators
            src1.scale.setScalar(1 + Math.sin(time * 3) * 0.3);
            src2.scale.setScalar(1 + Math.sin(time * 3) * 0.3);

            renderer.render(scene, camera);
        };

        animate();

        // Expose params for slider control
        this.scenes.physics = { scene, camera, renderer, params };

        const handleResize = () => {
            const w2 = canvas.parentElement.clientWidth;
            const h2 = canvas.parentElement.clientHeight || 300;
            camera.aspect = w2 / h2;
            camera.updateProjectionMatrix();
            renderer.setSize(w2, h2);
        };
        window.addEventListener('resize', handleResize);
    },

    updatePhysicsParams(key, value) {
        if (this.scenes.physics && this.scenes.physics.params) {
            this.scenes.physics.params[key] = parseFloat(value);
        }
    },

    // ─── CHEMISTRY: MOLECULE STRUCTURE ───
    initChemistry(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const w = canvas.parentElement.clientWidth;
        const h = canvas.parentElement.clientHeight || 300;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a1a);
        const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        camera.position.set(0, 2, 8);
        camera.lookAt(0, 0, 0);

        const moleculeGroup = new THREE.Group();
        scene.add(moleculeGroup);

        // Water molecule (H₂O)
        // Oxygen
        const oGeom = new THREE.SphereGeometry(0.8, 32, 32);
        const oMat = new THREE.MeshPhongMaterial({
            color: 0xff4444, emissive: 0x220000, shininess: 100
        });
        const oxygen = new THREE.Mesh(oGeom, oMat);
        oxygen.position.set(0, 0, 0);
        moleculeGroup.add(oxygen);

        // Hydrogens
        const hGeom = new THREE.SphereGeometry(0.5, 32, 32);
        const hMat = new THREE.MeshPhongMaterial({
            color: 0x4488ff, emissive: 0x001122, shininess: 100
        });

        const angle = 104.5 * Math.PI / 180;
        const bondLen = 2;

        const h1 = new THREE.Mesh(hGeom, hMat);
        h1.position.set(-bondLen * Math.sin(angle / 2), -bondLen * Math.cos(angle / 2), 0);
        moleculeGroup.add(h1);

        const h2 = new THREE.Mesh(hGeom, hMat);
        h2.position.set(bondLen * Math.sin(angle / 2), -bondLen * Math.cos(angle / 2), 0);
        moleculeGroup.add(h2);

        // Bonds
        const bondMat = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0x111111 });

        function createBond(from, to) {
            const dir = new THREE.Vector3().subVectors(to, from);
            const len = dir.length();
            const bondGeom = new THREE.CylinderGeometry(0.1, 0.1, len, 8);
            const bond = new THREE.Mesh(bondGeom, bondMat);
            bond.position.copy(from).add(dir.multiplyScalar(0.5));
            bond.lookAt(to);
            bond.rotateX(Math.PI / 2);
            return bond;
        }

        moleculeGroup.add(createBond(oxygen.position, h1.position));
        moleculeGroup.add(createBond(oxygen.position, h2.position));

        // Electron cloud (transparent shell around oxygen)
        const cloudGeom = new THREE.SphereGeometry(1.2, 32, 32);
        const cloudMat = new THREE.MeshPhongMaterial({
            color: 0xff6666, transparent: true, opacity: 0.08, side: THREE.DoubleSide
        });
        const cloud = new THREE.Mesh(cloudGeom, cloudMat);
        moleculeGroup.add(cloud);

        // Lone pair electrons (small spheres above oxygen)
        const lpMat = new THREE.MeshPhongMaterial({ color: 0xffff00, emissive: 0x222200 });
        const lp1 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), lpMat);
        lp1.position.set(-0.5, 1.2, 0);
        moleculeGroup.add(lp1);
        const lp2 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), lpMat);
        lp2.position.set(0.5, 1.2, 0);
        moleculeGroup.add(lp2);

        // Lighting
        scene.add(new THREE.AmbientLight(0x404040, 0.6));
        const l1 = new THREE.PointLight(0xffffff, 1, 30);
        l1.position.set(5, 5, 5);
        scene.add(l1);
        const l2 = new THREE.PointLight(0x6c5ce7, 0.5, 30);
        l2.position.set(-5, -3, 5);
        scene.add(l2);

        let mouseX = 0, mouseY = 0;
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        });

        const animate = () => {
            this.animationIds.chemistry = requestAnimationFrame(animate);

            moleculeGroup.rotation.y += 0.005;
            moleculeGroup.rotation.y += mouseX * 0.02;
            moleculeGroup.rotation.x = mouseY * 0.3;

            // Electron pulse
            cloud.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.05);
            lp1.position.y = 1.2 + Math.sin(Date.now() * 0.004) * 0.1;
            lp2.position.y = 1.2 + Math.cos(Date.now() * 0.004) * 0.1;

            renderer.render(scene, camera);
        };

        animate();
        this.scenes.chemistry = { scene, camera, renderer };

        const handleResize = () => {
            const w2 = canvas.parentElement.clientWidth;
            const h2 = canvas.parentElement.clientHeight || 300;
            camera.aspect = w2 / h2;
            camera.updateProjectionMatrix();
            renderer.setSize(w2, h2);
        };
        window.addEventListener('resize', handleResize);
    },

    // ─── MATHS: 3D SURFACE PLOT ───
    initMaths(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const w = canvas.parentElement.clientWidth;
        const h = canvas.parentElement.clientHeight || 300;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a1a);
        const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        camera.position.set(8, 6, 8);
        camera.lookAt(0, 0, 0);

        // 3D surface: z = sin(x) * cos(y)
        const size = 40;
        const surfaceGeom = new THREE.PlaneGeometry(10, 10, size, size);
        
        const positions = surfaceGeom.attributes.position.array;
        const colorsArr = new Float32Array(positions.length);

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = Math.sin(x) * Math.cos(y);
            positions[i + 2] = z;

            // Color based on height
            const t = (z + 1) / 2;
            const color = new THREE.Color().setHSL(0.6 - t * 0.4, 0.8, 0.4 + t * 0.3);
            colorsArr[i] = color.r;
            colorsArr[i + 1] = color.g;
            colorsArr[i + 2] = color.b;
        }

        surfaceGeom.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3));
        surfaceGeom.computeVertexNormals();

        const surfaceMat = new THREE.MeshPhongMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            shininess: 50,
        });
        const surface = new THREE.Mesh(surfaceGeom, surfaceMat);
        surface.rotation.x = -Math.PI / 2;
        scene.add(surface);

        // Wireframe overlay
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0x6c5ce7,
            wireframe: true,
            transparent: true,
            opacity: 0.15,
        });
        const wireframe = new THREE.Mesh(surfaceGeom.clone(), wireMat);
        wireframe.rotation.x = -Math.PI / 2;
        scene.add(wireframe);

        // Axes
        const axesMat = new THREE.LineBasicMaterial({ color: 0x666666 });
        function createAxis(start, end) {
            const geom = new THREE.BufferGeometry().setFromPoints([start, end]);
            return new THREE.Line(geom, axesMat);
        }
        scene.add(createAxis(new THREE.Vector3(-6, 0, 0), new THREE.Vector3(6, 0, 0)));
        scene.add(createAxis(new THREE.Vector3(0, -3, 0), new THREE.Vector3(0, 3, 0)));
        scene.add(createAxis(new THREE.Vector3(0, 0, -6), new THREE.Vector3(0, 0, 6)));

        // Grid floor
        const gridHelper = new THREE.GridHelper(10, 10, 0x333366, 0x222244);
        gridHelper.position.y = -2;
        scene.add(gridHelper);

        // Lighting
        scene.add(new THREE.AmbientLight(0x404040, 0.5));
        const dl = new THREE.DirectionalLight(0xffffff, 0.8);
        dl.position.set(5, 10, 5);
        scene.add(dl);
        const pl = new THREE.PointLight(0x6c5ce7, 0.5, 30);
        pl.position.set(-5, 5, -5);
        scene.add(pl);

        let time = 0;
        const animate = () => {
            this.animationIds.maths = requestAnimationFrame(animate);
            time += 0.02;

            // Slow auto-rotation
            surface.rotation.z += 0.003;
            wireframe.rotation.z += 0.003;

            // Animate surface
            const pos = surfaceGeom.attributes.position.array;
            const cols = surfaceGeom.attributes.color.array;
            for (let i = 0; i < pos.length; i += 3) {
                const x = pos[i];
                const y = pos[i + 1];
                const z = Math.sin(x + time * 0.5) * Math.cos(y + time * 0.3);
                pos[i + 2] = z;

                const t = (z + 1) / 2;
                const c = new THREE.Color().setHSL(0.6 - t * 0.4, 0.8, 0.4 + t * 0.3);
                cols[i] = c.r; cols[i + 1] = c.g; cols[i + 2] = c.b;
            }
            surfaceGeom.attributes.position.needsUpdate = true;
            surfaceGeom.attributes.color.needsUpdate = true;
            surfaceGeom.computeVertexNormals();

            renderer.render(scene, camera);
        };

        animate();
        this.scenes.maths = { scene, camera, renderer };

        const handleResize = () => {
            const w2 = canvas.parentElement.clientWidth;
            const h2 = canvas.parentElement.clientHeight || 300;
            camera.aspect = w2 / h2;
            camera.updateProjectionMatrix();
            renderer.setSize(w2, h2);
        };
        window.addEventListener('resize', handleResize);
    },

    // ─── HOMEPAGE DEMO CANVAS ───
    initHomeDemo(canvasId, subject) {
        // Cancel existing animation
        if (this.animationIds.homeDemo) {
            cancelAnimationFrame(this.animationIds.homeDemo);
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Clear existing renderer
        if (this.scenes.homeDemo && this.scenes.homeDemo.renderer) {
            this.scenes.homeDemo.renderer.dispose();
        }

        const w = canvas.parentElement.clientWidth;
        const h = canvas.parentElement.clientHeight || 400;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a1a);
        const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        scene.add(new THREE.AmbientLight(0x404040, 0.6));
        const light = new THREE.PointLight(0xffffff, 1, 50);
        light.position.set(5, 5, 5);
        scene.add(light);

        let time = 0;
        let animateFunc;

        switch (subject) {
            case 'biology': {
                camera.position.set(0, 0, 10);
                // Simplified blood cells
                const cells = [];
                for (let i = 0; i < 20; i++) {
                    const geom = new THREE.SphereGeometry(0.3, 16, 8);
                    geom.scale(1, 0.4, 1);
                    const mat = new THREE.MeshPhongMaterial({
                        color: new THREE.Color().setHSL(0, 0.7, 0.3 + Math.random() * 0.2),
                        emissive: 0x220000
                    });
                    const cell = new THREE.Mesh(geom, mat);
                    cell.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4);
                    cell.userData.speed = 0.01 + Math.random() * 0.02;
                    cell.userData.yOff = Math.random() * Math.PI * 2;
                    scene.add(cell);
                    cells.push(cell);
                }
                animateFunc = () => {
                    time += 0.01;
                    cells.forEach(c => {
                        c.position.x -= c.userData.speed;
                        c.position.y += Math.sin(time * 2 + c.userData.yOff) * 0.005;
                        c.rotation.z += 0.01;
                        if (c.position.x < -7) c.position.x = 7;
                    });
                };
                break;
            }
            case 'physics': {
                camera.position.set(0, 6, 12);
                camera.lookAt(0, 0, 0);
                const waveGeom = new THREE.PlaneGeometry(16, 16, 40, 40);
                const waveMat = new THREE.MeshPhongMaterial({
                    color: 0x2196F3, wireframe: true, transparent: true, opacity: 0.5
                });
                const wave = new THREE.Mesh(waveGeom, waveMat);
                wave.rotation.x = -Math.PI / 2;
                scene.add(wave);

                animateFunc = () => {
                    time += 0.03;
                    const pos = waveGeom.attributes.position.array;
                    for (let i = 0; i < pos.length; i += 3) {
                        const x = pos[i], y = pos[i + 1];
                        const d = Math.sqrt(x * x + y * y);
                        pos[i + 2] = Math.sin(d * 1.5 - time * 3) / (d * 0.3 + 1) * 1.5;
                    }
                    waveGeom.attributes.position.needsUpdate = true;
                };
                break;
            }
            case 'chemistry': {
                camera.position.set(0, 1, 7);
                const molGroup = new THREE.Group();
                // Simple CH4 molecule
                const c = new THREE.Mesh(
                    new THREE.SphereGeometry(0.6, 32, 32),
                    new THREE.MeshPhongMaterial({ color: 0x333333, emissive: 0x111111 })
                );
                molGroup.add(c);
                const hPositions = [
                    [1.5, 1.5, 0], [-1.5, 1.5, 0], [0, -1.5, 1.5], [0, -1.5, -1.5]
                ];
                hPositions.forEach(p => {
                    const h = new THREE.Mesh(
                        new THREE.SphereGeometry(0.35, 32, 32),
                        new THREE.MeshPhongMaterial({ color: 0x4488ff, emissive: 0x001122 })
                    );
                    h.position.set(...p);
                    molGroup.add(h);
                    // Bond
                    const bondGeom = new THREE.CylinderGeometry(0.06, 0.06, new THREE.Vector3(...p).length(), 8);
                    const bond = new THREE.Mesh(bondGeom, new THREE.MeshPhongMaterial({ color: 0x888888 }));
                    bond.position.set(p[0] / 2, p[1] / 2, p[2] / 2);
                    bond.lookAt(new THREE.Vector3(...p));
                    bond.rotateX(Math.PI / 2);
                    molGroup.add(bond);
                });
                scene.add(molGroup);
                animateFunc = () => {
                    molGroup.rotation.y += 0.008;
                    molGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.2;
                };
                break;
            }
            case 'maths': {
                camera.position.set(6, 5, 6);
                camera.lookAt(0, 0, 0);
                const surfGeom = new THREE.PlaneGeometry(8, 8, 30, 30);
                const surfMat = new THREE.MeshPhongMaterial({
                    color: 0x9C27B0, wireframe: true, transparent: true, opacity: 0.6
                });
                const surf = new THREE.Mesh(surfGeom, surfMat);
                surf.rotation.x = -Math.PI / 2;
                scene.add(surf);
                scene.add(new THREE.GridHelper(8, 8, 0x333366, 0x222244));
                animateFunc = () => {
                    time += 0.02;
                    const pos = surfGeom.attributes.position.array;
                    for (let i = 0; i < pos.length; i += 3) {
                        pos[i + 2] = Math.sin(pos[i] + time) * Math.cos(pos[i + 1] + time * 0.5);
                    }
                    surfGeom.attributes.position.needsUpdate = true;
                    surf.rotation.z += 0.002;
                };
                break;
            }
            case 'languages': {
                camera.position.set(0, 0, 10);
                // Floating text-like particles
                const textParticles = [];
                const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                for (let i = 0; i < 15; i++) {
                    const geom = new THREE.BoxGeometry(0.5, 0.7, 0.1);
                    const mat = new THREE.MeshPhongMaterial({
                        color: new THREE.Color().setHSL(0.9, 0.6, 0.4 + Math.random() * 0.2),
                        emissive: 0x110011
                    });
                    const mesh = new THREE.Mesh(geom, mat);
                    mesh.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4);
                    mesh.userData.floatY = Math.random() * Math.PI * 2;
                    mesh.userData.rotSpeed = (Math.random() - 0.5) * 0.02;
                    scene.add(mesh);
                    textParticles.push(mesh);
                }
                animateFunc = () => {
                    time += 0.01;
                    textParticles.forEach(p => {
                        p.position.y += Math.sin(time * 2 + p.userData.floatY) * 0.003;
                        p.rotation.y += p.userData.rotSpeed;
                    });
                };
                break;
            }
            case 'geography': {
                camera.position.set(0, 0, 5);
                // Simple globe
                const globeGeom = new THREE.SphereGeometry(2, 32, 32);
                const globeMat = new THREE.MeshPhongMaterial({
                    color: 0x00BCD4, wireframe: false, transparent: true, opacity: 0.8,
                    emissive: 0x002233
                });
                const globe = new THREE.Mesh(globeGeom, globeMat);
                scene.add(globe);
                const wireGlobe = new THREE.Mesh(
                    new THREE.SphereGeometry(2.02, 24, 24),
                    new THREE.MeshBasicMaterial({ color: 0x00BCD4, wireframe: true, transparent: true, opacity: 0.2 })
                );
                scene.add(wireGlobe);
                // Land masses (rough dots)
                for (let i = 0; i < 50; i++) {
                    const phi = Math.random() * Math.PI;
                    const theta = Math.random() * Math.PI * 2;
                    const r = 2.05;
                    const dot = new THREE.Mesh(
                        new THREE.SphereGeometry(0.05, 8, 8),
                        new THREE.MeshPhongMaterial({ color: 0x27ae60, emissive: 0x002200 })
                    );
                    dot.position.set(
                        r * Math.sin(phi) * Math.cos(theta),
                        r * Math.cos(phi),
                        r * Math.sin(phi) * Math.sin(theta)
                    );
                    globe.add(dot);
                }
                animateFunc = () => {
                    globe.rotation.y += 0.005;
                    wireGlobe.rotation.y += 0.005;
                };
                break;
            }
            case 'history': {
                camera.position.set(0, 0, 10);
                // Floating timeline blocks
                const blocks = [];
                const years = ['3000 BCE', '322 BCE', '1526', '1857', '1947'];
                for (let i = 0; i < 5; i++) {
                    const geom = new THREE.BoxGeometry(1.5, 0.8, 0.2);
                    const mat = new THREE.MeshPhongMaterial({
                        color: new THREE.Color().setHSL(0.08, 0.5, 0.3 + i * 0.08),
                        emissive: 0x110500
                    });
                    const block = new THREE.Mesh(geom, mat);
                    block.position.set(-4 + i * 2, Math.sin(i) * 1.5, 0);
                    scene.add(block);
                    blocks.push(block);
                    // Connection line
                    if (i > 0) {
                        const lineGeom = new THREE.BufferGeometry().setFromPoints([
                            blocks[i - 1].position,
                            block.position
                        ]);
                        scene.add(new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ color: 0x795548, transparent: true, opacity: 0.5 })));
                    }
                }
                animateFunc = () => {
                    time += 0.01;
                    blocks.forEach((b, i) => {
                        b.position.y = Math.sin(i) * 1.5 + Math.sin(time + i) * 0.3;
                        b.rotation.z = Math.sin(time + i) * 0.05;
                    });
                };
                break;
            }
            default: {
                camera.position.set(0, 0, 10);
                const sphereGeom = new THREE.SphereGeometry(2, 32, 32);
                const sphereMat = new THREE.MeshPhongMaterial({ color: 0x6c5ce7, wireframe: true });
                const sphere = new THREE.Mesh(sphereGeom, sphereMat);
                scene.add(sphere);
                animateFunc = () => { sphere.rotation.y += 0.01; };
            }
        }

        const animate = () => {
            this.animationIds.homeDemo = requestAnimationFrame(animate);
            if (animateFunc) animateFunc();
            renderer.render(scene, camera);
        };
        animate();

        this.scenes.homeDemo = { scene, camera, renderer };

        const handleResize = () => {
            const w2 = canvas.parentElement.clientWidth;
            const h2 = canvas.parentElement.clientHeight || 400;
            camera.aspect = w2 / h2;
            camera.updateProjectionMatrix();
            renderer.setSize(w2, h2);
        };
        window.addEventListener('resize', handleResize);
    },

    // ─── CLEANUP ───
    destroy(key) {
        if (this.animationIds[key]) {
            cancelAnimationFrame(this.animationIds[key]);
        }
        if (this.scenes[key] && this.scenes[key].renderer) {
            this.scenes[key].renderer.dispose();
        }
    }
};
