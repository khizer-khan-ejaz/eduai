/**
 * CARBON STRUCTURE DEMO
 * Adds a carbon atom model and methane (CH4) structure viewer.
 */
(function () {
    'use strict';

    if (window.__eduCarbonModuleLoaded) {
        return;
    }
    window.__eduCarbonModuleLoaded = true;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function createTextSprite(text, colorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 96;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(10, 10, 26, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

        ctx.fillStyle = colorHex || '#ffffff';
        ctx.font = 'bold 42px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(1.4, 0.52, 1);
        return sprite;
    }

    const CarbonStructure = {
        initialized: false,
        renderer: null,
        scene: null,
        camera: null,
        root: null,
        atomGroup: null,
        methaneGroup: null,
        electrons: [],
        mode: 'atom',
        animationId: null,
        pointerDown: false,
        pointerPos: { x: 0, y: 0 },
        targetRotation: { x: 0.25, y: 0.6 },
        smoothRotation: { x: 0.25, y: 0.6 },

        init() {
            if (this.initialized) return;
            if (typeof THREE === 'undefined') return;

            const chemistryVisual = document.getElementById('chemistryCanvas');
            const chemistryCard = chemistryVisual?.closest('.glass-card');
            if (!chemistryCard) return;

            const mount = document.createElement('div');
            mount.id = 'carbonStructureMount';
            mount.style.marginTop = '1rem';
            mount.innerHTML = `
                <div style="display:flex; gap:0.45rem; flex-wrap:wrap; margin-bottom:0.65rem;">
                    <button class="fill-option" id="carbonModeAtom" title="Show nucleus and electron orbits">Carbon Atom</button>
                    <button class="fill-option" id="carbonModeMethane" title="Show CH4 tetrahedral geometry">Methane (CH4)</button>
                </div>
                <div class="demo-visual" style="min-height:260px; border:none;" id="carbonStructureVisual">
                    <canvas id="carbon-structure-canvas"></canvas>
                    <div class="demo-visual-overlay" id="carbonStructureOverlay"><strong>Carbon Atom:</strong> Nucleus and electron orbit layers</div>
                </div>
                <div id="carbonStructureMeta" style="margin-top:0.65rem; font-size:0.8rem; color:var(--text-secondary); padding:0.55rem 0.7rem; border-radius:8px; border:1px solid var(--border-glass); background:rgba(255,255,255,0.03);">
                    Drag to rotate. Electrons are animated by orbital shells.
                </div>
            `;
            chemistryCard.appendChild(mount);

            const canvas = document.getElementById('carbon-structure-canvas');
            if (!canvas) return;

            const width = canvas.parentElement.clientWidth;
            const height = canvas.parentElement.clientHeight || 260;

            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x0a0a1a);

            this.camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
            this.camera.position.set(0, 1.8, 7.4);
            this.camera.lookAt(0, 0, 0);

            this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            this.scene.add(new THREE.AmbientLight(0xffffff, 0.46));
            const keyLight = new THREE.DirectionalLight(0xffffff, 0.92);
            keyLight.position.set(4, 6, 5);
            keyLight.castShadow = true;
            keyLight.shadow.mapSize.set(1024, 1024);
            this.scene.add(keyLight);

            const rimLight = new THREE.DirectionalLight(0x74b9ff, 0.35);
            rimLight.position.set(-4, 3, -4);
            this.scene.add(rimLight);

            this.root = new THREE.Group();
            this.scene.add(this.root);

            this.atomGroup = this.buildCarbonAtom();
            this.methaneGroup = this.buildMethane();
            this.root.add(this.atomGroup);
            this.root.add(this.methaneGroup);
            this.methaneGroup.visible = false;

            this.bindUI();
            this.bindPointer(canvas);
            this.initialized = true;

            const animate = () => {
                this.animationId = requestAnimationFrame(animate);
                this.tick();
                this.renderer.render(this.scene, this.camera);
            };
            animate();

            window.addEventListener('resize', () => {
                if (!canvas.parentElement || !this.camera || !this.renderer) return;
                const w = canvas.parentElement.clientWidth;
                const h = canvas.parentElement.clientHeight || 260;
                this.camera.aspect = w / h;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(w, h);
            });
        },

        buildCarbonAtom() {
            const group = new THREE.Group();

            const nucleus = new THREE.Group();
            const protonMat = new THREE.MeshStandardMaterial({ color: 0xff7675, roughness: 0.35, metalness: 0.12 });
            const neutronMat = new THREE.MeshStandardMaterial({ color: 0x74b9ff, roughness: 0.35, metalness: 0.12 });

            for (let i = 0; i < 12; i++) {
                const small = new THREE.Mesh(
                    new THREE.SphereGeometry(0.14, 12, 12),
                    i % 2 === 0 ? protonMat : neutronMat
                );
                const phi = Math.acos(2 * Math.random() - 1);
                const theta = Math.random() * Math.PI * 2;
                const radius = 0.42 * Math.cbrt(Math.random());
                small.position.set(
                    radius * Math.sin(phi) * Math.cos(theta),
                    radius * Math.cos(phi),
                    radius * Math.sin(phi) * Math.sin(theta)
                );
                small.castShadow = true;
                nucleus.add(small);
            }

            const nucleusGlow = new THREE.Mesh(
                new THREE.SphereGeometry(0.58, 24, 24),
                new THREE.MeshStandardMaterial({ color: 0xff9f8f, transparent: true, opacity: 0.08, roughness: 0.7 })
            );
            nucleus.add(nucleusGlow);
            group.add(nucleus);

            const orbitRadii = [1.5, 2.3];
            orbitRadii.forEach((radius, ringIndex) => {
                const orbit = new THREE.Mesh(
                    new THREE.TorusGeometry(radius, 0.02, 8, 80),
                    new THREE.MeshBasicMaterial({ color: 0x5d6d99, transparent: true, opacity: 0.45 })
                );
                orbit.rotation.x = ringIndex === 0 ? Math.PI / 2 : Math.PI / 3;
                orbit.rotation.y = ringIndex === 0 ? 0 : Math.PI / 4;
                group.add(orbit);
            });

            const electronMat = new THREE.MeshStandardMaterial({ color: 0x55efc4, emissive: 0x0a3d2f, roughness: 0.2 });
            const electronCount = 6;
            for (let i = 0; i < electronCount; i++) {
                const electron = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), electronMat);
                electron.castShadow = true;
                electron.userData = {
                    shell: i < 2 ? 0 : 1,
                    phase: (i / electronCount) * Math.PI * 2,
                    speed: i < 2 ? 1.2 : 0.75,
                    tilt: i % 2 === 0 ? Math.PI / 2 : Math.PI / 3,
                };
                group.add(electron);
                this.electrons.push(electron);
            }

            const carbonLabel = createTextSprite('C', '#ffffff');
            carbonLabel.position.set(0, 0.95, 0);
            group.add(carbonLabel);

            return group;
        },

        makeBond(start, end) {
            const dir = new THREE.Vector3().subVectors(end, start);
            const length = dir.length();
            const cylinder = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, length, 10),
                new THREE.MeshStandardMaterial({ color: 0xc9c9c9, roughness: 0.45, metalness: 0.2 })
            );
            cylinder.position.copy(start).add(dir.clone().multiplyScalar(0.5));
            cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
            cylinder.castShadow = true;
            cylinder.receiveShadow = true;
            return cylinder;
        },

        buildMethane() {
            const group = new THREE.Group();

            const carbon = new THREE.Mesh(
                new THREE.SphereGeometry(0.42, 30, 30),
                new THREE.MeshStandardMaterial({ color: 0x2d3436, roughness: 0.25, metalness: 0.15 })
            );
            carbon.castShadow = true;
            carbon.name = 'methane-carbon';
            group.add(carbon);

            const cLabel = createTextSprite('C', '#ffffff');
            cLabel.position.set(0, 0.78, 0);
            group.add(cLabel);

            const tetra = [
                new THREE.Vector3(1, 1, 1),
                new THREE.Vector3(-1, -1, 1),
                new THREE.Vector3(-1, 1, -1),
                new THREE.Vector3(1, -1, -1),
            ].map((v) => v.normalize().multiplyScalar(1.78));

            tetra.forEach((pos, index) => {
                const hydrogen = new THREE.Mesh(
                    new THREE.SphereGeometry(0.26, 22, 22),
                    new THREE.MeshStandardMaterial({ color: 0xeef4ff, roughness: 0.35, metalness: 0.04 })
                );
                hydrogen.position.copy(pos);
                hydrogen.castShadow = true;
                hydrogen.name = `hydrogen-${index}`;
                group.add(hydrogen);

                const hLabel = createTextSprite('H', '#74b9ff');
                hLabel.position.copy(pos.clone().multiplyScalar(1.1));
                group.add(hLabel);

                const bond = this.makeBond(new THREE.Vector3(0, 0, 0), pos);
                bond.name = `bond-${index}`;
                group.add(bond);

                if (index === 0) {
                    const angleLabel = createTextSprite('109.5 deg', '#fdcb6e');
                    angleLabel.position.copy(pos.clone().multiplyScalar(0.62)).add(new THREE.Vector3(0.45, 0.45, 0));
                    group.add(angleLabel);
                }
            });

            return group;
        },

        setMode(nextMode) {
            this.mode = nextMode;
            this.atomGroup.visible = nextMode === 'atom';
            this.methaneGroup.visible = nextMode === 'methane';

            const atomBtn = document.getElementById('carbonModeAtom');
            const methaneBtn = document.getElementById('carbonModeMethane');
            const overlay = document.getElementById('carbonStructureOverlay');
            const meta = document.getElementById('carbonStructureMeta');

            if (atomBtn) {
                atomBtn.style.borderColor = nextMode === 'atom' ? '#74b9ff' : 'var(--border-glass)';
                atomBtn.style.background = nextMode === 'atom' ? 'rgba(116,185,255,0.15)' : 'var(--bg-glass)';
            }
            if (methaneBtn) {
                methaneBtn.style.borderColor = nextMode === 'methane' ? '#00b894' : 'var(--border-glass)';
                methaneBtn.style.background = nextMode === 'methane' ? 'rgba(0,184,148,0.15)' : 'var(--bg-glass)';
            }

            if (overlay) {
                overlay.innerHTML = nextMode === 'atom'
                    ? '<strong>Carbon Atom:</strong> Nucleus and electron orbit layers'
                    : '<strong>Methane:</strong> Tetrahedral CH4 with 109.5 deg bond geometry';
            }

            if (meta) {
                meta.textContent = nextMode === 'atom'
                    ? 'Drag to rotate. Electrons are animated by orbital shells.'
                    : 'Drag to rotate. Carbon is central, with 4 hydrogen atoms at tetrahedral positions.';
            }
        },

        bindUI() {
            const atomBtn = document.getElementById('carbonModeAtom');
            const methaneBtn = document.getElementById('carbonModeMethane');

            if (atomBtn) atomBtn.addEventListener('click', () => this.setMode('atom'));
            if (methaneBtn) methaneBtn.addEventListener('click', () => this.setMode('methane'));

            this.setMode('atom');
        },

        bindPointer(canvas) {
            canvas.addEventListener('pointerdown', (ev) => {
                this.pointerDown = true;
                this.pointerPos.x = ev.clientX;
                this.pointerPos.y = ev.clientY;
                canvas.setPointerCapture(ev.pointerId);
            });

            canvas.addEventListener('pointermove', (ev) => {
                if (!this.pointerDown) return;
                const dx = ev.clientX - this.pointerPos.x;
                const dy = ev.clientY - this.pointerPos.y;
                this.pointerPos.x = ev.clientX;
                this.pointerPos.y = ev.clientY;

                this.targetRotation.y += dx * 0.008;
                this.targetRotation.x += dy * 0.006;
                this.targetRotation.x = clamp(this.targetRotation.x, -1.1, 1.1);
            });

            const pointerUp = (ev) => {
                this.pointerDown = false;
                if (ev && ev.pointerId !== undefined) {
                    try {
                        canvas.releasePointerCapture(ev.pointerId);
                    } catch (err) {
                        // Ignore capture release errors.
                    }
                }
            };

            canvas.addEventListener('pointerup', pointerUp);
            canvas.addEventListener('pointercancel', pointerUp);
            canvas.addEventListener('mouseleave', pointerUp);
        },

        tick() {
            this.smoothRotation.x = lerp(this.smoothRotation.x, this.targetRotation.x, 0.08);
            this.smoothRotation.y = lerp(this.smoothRotation.y, this.targetRotation.y, 0.08);

            if (!this.pointerDown) {
                this.targetRotation.y += this.mode === 'atom' ? 0.0035 : 0.0028;
            }

            this.root.rotation.x = this.smoothRotation.x;
            this.root.rotation.y = this.smoothRotation.y;

            const time = performance.now() * 0.001;

            if (this.mode === 'atom') {
                this.electrons.forEach((electron) => {
                    const shellRadius = electron.userData.shell === 0 ? 1.5 : 2.3;
                    const angle = time * electron.userData.speed + electron.userData.phase;
                    const x = Math.cos(angle) * shellRadius;
                    const z = Math.sin(angle) * shellRadius;
                    const y = Math.sin(angle * 0.5) * 0.35;
                    electron.position.set(x, y, z);
                });
            } else {
                this.methaneGroup.children.forEach((child) => {
                    if (child.name && child.name.startsWith('hydrogen-')) {
                        const phase = parseInt(child.name.split('-')[1], 10) * 0.7;
                        const pulse = 1 + Math.sin(time * 2 + phase) * 0.015;
                        child.scale.setScalar(pulse);
                    }
                });
            }
        },
    };

    function onTabChanged(tab) {
        if (tab === 'chemistry') {
            CarbonStructure.init();
        }
    }

    function registerTabHook(hook) {
        if (window.__eduTabHooks) {
            window.__eduTabHooks.push(hook);
            return;
        }

        if (typeof window.switchDemoTab === 'function' && !window.__eduTabHookPatched) {
            const originalSwitch = window.switchDemoTab;
            window.__eduTabHooks = [hook];
            window.switchDemoTab = function patchedSwitchDemoTab(tab) {
                const result = originalSwitch.apply(this, arguments);
                window.__eduTabHooks.forEach((registeredHook) => {
                    try {
                        registeredHook(tab);
                    } catch (err) {
                        console.warn('Tab hook failed:', err);
                    }
                });
                return result;
            };
            window.__eduTabHookPatched = true;
            return;
        }

        if (!window.__eduTabHooks) {
            window.__eduTabHooks = [];
        }
        window.__eduTabHooks.push(hook);
    }

    function bootstrap() {
        registerTabHook(onTabChanged);

        const activePanel = document.querySelector('.demo-panel.active');
        if (activePanel && activePanel.id === 'panel-chemistry') {
            CarbonStructure.init();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
