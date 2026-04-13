/**
 * COMPONENT / COMPOUND BUILDER
 * Drag-and-drop atoms to form H2O and CO2 with snapping animations.
 */
(function () {
    'use strict';

    if (window.__eduCompoundBuilderLoaded) {
        return;
    }
    window.__eduCompoundBuilderLoaded = true;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function atomColor(symbol) {
        switch (symbol) {
            case 'H': return { bg: 'rgba(116,185,255,0.25)', border: '#74b9ff' };
            case 'O': return { bg: 'rgba(255,118,117,0.25)', border: '#ff7675' };
            case 'C': return { bg: 'rgba(253,203,110,0.25)', border: '#fdcb6e' };
            default: return { bg: 'rgba(255,255,255,0.15)', border: 'var(--border-glass)' };
        }
    }

    const CompoundBuilder = {
        initialized: false,
        workspace: null,
        atoms: [],
        formedMolecule: null,

        init() {
            if (this.initialized) return;

            const periodicTable = document.getElementById('periodicTable');
            const targetCard = periodicTable?.closest('.glass-card');
            if (!targetCard) return;

            const mount = document.createElement('div');
            mount.id = 'compoundBuilderMount';
            mount.style.marginTop = '1rem';
            mount.innerHTML = `
                <h4 style="font-size:0.92rem; color:var(--accent-secondary); margin-bottom:0.55rem;">Component / Compound Builder</h4>
                <div id="compoundPalette" style="display:flex; gap:0.45rem; flex-wrap:wrap; margin-bottom:0.55rem;">
                    <button class="fill-option" draggable="true" data-atom="H" title="Drag Hydrogen atom">Drag H</button>
                    <button class="fill-option" draggable="true" data-atom="O" title="Drag Oxygen atom">Drag O</button>
                    <button class="fill-option" draggable="true" data-atom="C" title="Drag Carbon atom">Drag C</button>
                    <button class="fill-option" id="compoundReset" title="Reset builder">Reset</button>
                </div>
                <div id="compoundWorkspace" style="position:relative; min-height:220px; border:1px dashed var(--border-glass); border-radius:10px; background:rgba(10,10,26,0.65); overflow:hidden;">
                    <div id="compoundHint" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; text-align:center; color:var(--text-muted); font-size:0.78rem; pointer-events:none;">
                        Drag atoms here and snap them to form H2O or CO2
                    </div>
                </div>
                <div id="compoundResult" style="margin-top:0.55rem; font-size:0.8rem; color:var(--text-secondary); padding:0.5rem 0.65rem; border:1px solid var(--border-glass); border-radius:8px; background:rgba(255,255,255,0.03);">
                    Awaiting atoms. Try H + H + O or O + C + O.
                </div>
            `;

            targetCard.appendChild(mount);

            this.workspace = document.getElementById('compoundWorkspace');
            if (!this.workspace) return;

            this.bindPalette();
            this.bindWorkspace();
            this.bindReset();
            this.initialized = true;
        },

        bindPalette() {
            const palette = document.getElementById('compoundPalette');
            if (!palette) return;

            palette.querySelectorAll('[data-atom]').forEach((btn) => {
                btn.addEventListener('dragstart', (ev) => {
                    const symbol = ev.currentTarget.dataset.atom;
                    ev.dataTransfer.setData('text/plain', symbol);
                    ev.dataTransfer.effectAllowed = 'copy';
                });
            });
        },

        bindWorkspace() {
            const ws = this.workspace;
            ws.addEventListener('dragover', (ev) => {
                ev.preventDefault();
                ws.style.borderColor = '#74b9ff';
            });

            ws.addEventListener('dragleave', () => {
                ws.style.borderColor = 'var(--border-glass)';
            });

            ws.addEventListener('drop', (ev) => {
                ev.preventDefault();
                ws.style.borderColor = 'var(--border-glass)';

                const symbol = ev.dataTransfer.getData('text/plain');
                if (!symbol) return;

                const rect = ws.getBoundingClientRect();
                const x = clamp(ev.clientX - rect.left - 18, 8, rect.width - 44);
                const y = clamp(ev.clientY - rect.top - 18, 8, rect.height - 44);

                this.spawnAtom(symbol, x, y);
                this.tryFormMolecule();
            });
        },

        bindReset() {
            const reset = document.getElementById('compoundReset');
            if (!reset) return;
            reset.addEventListener('click', () => {
                this.clearWorkspace();
            });
        },

        spawnAtom(symbol, x, y) {
            const ws = this.workspace;
            if (!ws) return;

            const atom = document.createElement('div');
            atom.className = 'compound-atom';
            atom.dataset.atom = symbol;
            atom.style.position = 'absolute';
            atom.style.left = `${x}px`;
            atom.style.top = `${y}px`;
            atom.style.width = '36px';
            atom.style.height = '36px';
            atom.style.borderRadius = '50%';
            atom.style.display = 'flex';
            atom.style.alignItems = 'center';
            atom.style.justifyContent = 'center';
            atom.style.fontWeight = '700';
            atom.style.fontSize = '0.85rem';
            atom.style.userSelect = 'none';
            atom.style.cursor = 'grab';
            atom.style.transition = 'left 360ms cubic-bezier(0.2,0.8,0.2,1), top 360ms cubic-bezier(0.2,0.8,0.2,1), transform 220ms ease';
            atom.style.color = '#ffffff';
            atom.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.08), 0 6px 14px rgba(0,0,0,0.25)';
            atom.title = `${symbol} atom`;

            const color = atomColor(symbol);
            atom.style.background = color.bg;
            atom.style.border = `1px solid ${color.border}`;
            atom.textContent = symbol;

            ws.appendChild(atom);
            this.makeDraggable(atom);

            this.atoms.push(atom);
            this.updateHint();
        },

        makeDraggable(atom) {
            const ws = this.workspace;
            if (!ws) return;

            let dragging = false;
            let offsetX = 0;
            let offsetY = 0;

            atom.addEventListener('pointerdown', (ev) => {
                if (this.formedMolecule) return;
                dragging = true;
                const rect = atom.getBoundingClientRect();
                offsetX = ev.clientX - rect.left;
                offsetY = ev.clientY - rect.top;
                atom.style.cursor = 'grabbing';
                atom.style.zIndex = '3';
                atom.style.transform = 'scale(1.04)';
                atom.setPointerCapture(ev.pointerId);
            });

            atom.addEventListener('pointermove', (ev) => {
                if (!dragging || this.formedMolecule) return;
                const wsRect = ws.getBoundingClientRect();
                const x = clamp(ev.clientX - wsRect.left - offsetX, 6, wsRect.width - 42);
                const y = clamp(ev.clientY - wsRect.top - offsetY, 6, wsRect.height - 42);
                atom.style.left = `${x}px`;
                atom.style.top = `${y}px`;
            });

            const stopDrag = (ev) => {
                if (!dragging) return;
                dragging = false;
                atom.style.cursor = 'grab';
                atom.style.zIndex = '1';
                atom.style.transform = 'scale(1)';
                if (ev && ev.pointerId !== undefined) {
                    try {
                        atom.releasePointerCapture(ev.pointerId);
                    } catch (err) {
                        // Ignore release errors.
                    }
                }
                this.tryFormMolecule();
            };

            atom.addEventListener('pointerup', stopDrag);
            atom.addEventListener('pointercancel', stopDrag);
        },

        atomCenter(atom) {
            return {
                x: parseFloat(atom.style.left || '0') + 18,
                y: parseFloat(atom.style.top || '0') + 18,
            };
        },

        distance(a, b) {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            return Math.sqrt(dx * dx + dy * dy);
        },

        atomsBySymbol(symbol) {
            return this.atoms.filter((atom) => atom.dataset.atom === symbol);
        },

        removeBonds() {
            this.workspace.querySelectorAll('.compound-bond').forEach((bond) => bond.remove());
        },

        drawBond(a, b) {
            const ac = this.atomCenter(a);
            const bc = this.atomCenter(b);
            const dx = bc.x - ac.x;
            const dy = bc.y - ac.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            const line = document.createElement('div');
            line.className = 'compound-bond';
            line.style.position = 'absolute';
            line.style.left = `${ac.x}px`;
            line.style.top = `${ac.y}px`;
            line.style.width = `${length}px`;
            line.style.height = '3px';
            line.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.85), rgba(255,255,255,0.2))';
            line.style.transformOrigin = '0 50%';
            line.style.transform = `rotate(${angle}deg) scaleX(0)`;
            line.style.transition = 'transform 380ms cubic-bezier(0.2,0.8,0.2,1)';
            line.style.pointerEvents = 'none';
            line.style.zIndex = '0';

            this.workspace.appendChild(line);

            requestAnimationFrame(() => {
                line.style.transform = `rotate(${angle}deg) scaleX(1)`;
            });
        },

        tryFormMolecule() {
            if (this.formedMolecule) return;
            if (this.atoms.length !== 3) {
                this.updateResult('Keep adding atoms to reach 3 total atoms.');
                return;
            }

            const hAtoms = this.atomsBySymbol('H');
            const oAtoms = this.atomsBySymbol('O');
            const cAtoms = this.atomsBySymbol('C');

            if (hAtoms.length === 2 && oAtoms.length === 1) {
                const oxygen = oAtoms[0];
                const center = this.atomCenter(oxygen);
                const h1 = this.atomCenter(hAtoms[0]);
                const h2 = this.atomCenter(hAtoms[1]);

                const closeEnough = this.distance(center, h1) < 130 && this.distance(center, h2) < 130;
                if (closeEnough) {
                    this.snapToWater(oxygen, hAtoms[0], hAtoms[1]);
                    return;
                }
                this.updateResult('Bring both H atoms near O to form water.');
                return;
            }

            if (cAtoms.length === 1 && oAtoms.length === 2) {
                const carbon = cAtoms[0];
                const center = this.atomCenter(carbon);
                const o1 = this.atomCenter(oAtoms[0]);
                const o2 = this.atomCenter(oAtoms[1]);

                const closeEnough = this.distance(center, o1) < 140 && this.distance(center, o2) < 140;
                if (closeEnough) {
                    this.snapToCO2(carbon, oAtoms[0], oAtoms[1]);
                    return;
                }
                this.updateResult('Bring both O atoms near C to form carbon dioxide.');
                return;
            }

            this.updateResult('This combination is not a target molecule. Try H2O or CO2.');
        },

        animateAtomTo(atom, x, y) {
            atom.style.left = `${x}px`;
            atom.style.top = `${y}px`;
        },

        lockAtoms() {
            this.atoms.forEach((atom) => {
                atom.style.cursor = 'default';
                atom.style.pointerEvents = 'none';
            });
        },

        snapToWater(oxygen, h1, h2) {
            const wsRect = this.workspace.getBoundingClientRect();
            const cx = wsRect.width * 0.5 - 18;
            const cy = wsRect.height * 0.52 - 18;

            const angle = 52.2 * Math.PI / 180;
            const bond = 64;

            const h1x = cx - Math.sin(angle) * bond;
            const h1y = cy + Math.cos(angle) * bond;
            const h2x = cx + Math.sin(angle) * bond;
            const h2y = cy + Math.cos(angle) * bond;

            this.animateAtomTo(oxygen, cx, cy);
            this.animateAtomTo(h1, h1x, h1y);
            this.animateAtomTo(h2, h2x, h2y);

            setTimeout(() => {
                this.removeBonds();
                this.drawBond(oxygen, h1);
                this.drawBond(oxygen, h2);
                this.lockAtoms();
                this.formedMolecule = 'H2O';
                this.updateResult('Bond formation complete: Water (H2O). Bent structure, angle approx 104.5 deg.');
            }, 380);
        },

        snapToCO2(carbon, o1, o2) {
            const wsRect = this.workspace.getBoundingClientRect();
            const cx = wsRect.width * 0.5 - 18;
            const cy = wsRect.height * 0.5 - 18;

            const sep = 86;
            this.animateAtomTo(carbon, cx, cy);
            this.animateAtomTo(o1, cx - sep, cy);
            this.animateAtomTo(o2, cx + sep, cy);

            setTimeout(() => {
                this.removeBonds();
                this.drawBond(carbon, o1);
                this.drawBond(carbon, o2);
                this.lockAtoms();
                this.formedMolecule = 'CO2';
                this.updateResult('Bond formation complete: Carbon Dioxide (CO2). Linear molecule, angle 180 deg.');
            }, 380);
        },

        updateHint() {
            const hint = document.getElementById('compoundHint');
            if (!hint) return;
            hint.style.display = this.atoms.length > 0 ? 'none' : 'flex';
        },

        updateResult(text) {
            const result = document.getElementById('compoundResult');
            if (!result) return;
            result.textContent = text;
        },

        clearWorkspace() {
            if (!this.workspace) return;
            this.workspace.querySelectorAll('.compound-atom, .compound-bond').forEach((node) => node.remove());
            this.atoms = [];
            this.formedMolecule = null;
            this.updateHint();
            this.updateResult('Awaiting atoms. Try H + H + O or O + C + O.');
        }
    };

    function onTabChanged(tab) {
        if (tab === 'chemistry') {
            CompoundBuilder.init();
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
            CompoundBuilder.init();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
