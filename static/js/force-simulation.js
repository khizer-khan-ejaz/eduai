/**
 * FORCE SIMULATION + QUIZ/CHAT ENHANCEMENTS
 * Adds advanced physics interactivity without changing page layout.
 */
(function () {
    'use strict';

    if (window.__eduForceEnhancementsLoaded) {
        return;
    }
    window.__eduForceEnhancementsLoaded = true;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function getActiveDemoTab() {
        const activePanel = document.querySelector('.demo-panel.active');
        if (!activePanel || !activePanel.id) return null;
        return activePanel.id.replace('panel-', '');
    }

    function registerTabHook(hook) {
        if (!window.__eduTabHooks) {
            window.__eduTabHooks = [];
        }
        window.__eduTabHooks.push(hook);

        if (!window.__eduTabHookPatched && typeof window.switchDemoTab === 'function') {
            const originalSwitch = window.switchDemoTab;
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
        }
    }

    function addTooltipTitles() {
        document.querySelectorAll('input[type="range"]').forEach((input) => {
            const label = input.closest('.control-group')?.querySelector('label');
            const labelText = label ? label.textContent.replace(/\s+/g, ' ').trim() : 'Interactive slider';
            input.title = labelText;
        });

        document.querySelectorAll('.fill-option, .mcq-option, .flashcard, .chat-input-area button').forEach((el) => {
            if (!el.title || !el.title.trim()) {
                el.title = 'Interactive control';
            }
        });
    }

    function parseAnsweredCount(scoreEl) {
        if (!scoreEl) return 0;
        const match = scoreEl.textContent.match(/(\d+)\s*\/\s*(\d+)/);
        if (!match) return 0;
        return parseInt(match[2], 10) || 0;
    }

    function ensureProgressUI(card, answered, total) {
        if (!card) return;
        const scoreRow = card.querySelector('.mcq-score');
        if (!scoreRow) return;

        let wrap = card.querySelector('.edu-progress-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.className = 'edu-progress-wrap';
            wrap.style.margin = '0.35rem 0 0.9rem';

            const label = document.createElement('div');
            label.className = 'edu-progress-label';
            label.style.display = 'flex';
            label.style.justifyContent = 'space-between';
            label.style.fontSize = '0.72rem';
            label.style.color = 'var(--text-muted)';
            label.style.marginBottom = '0.35rem';

            const text = document.createElement('span');
            text.className = 'edu-progress-text';
            text.textContent = 'Progress';

            const pct = document.createElement('span');
            pct.className = 'edu-progress-pct';
            pct.textContent = '0%';

            label.appendChild(text);
            label.appendChild(pct);

            const bar = document.createElement('div');
            bar.style.height = '7px';
            bar.style.borderRadius = '999px';
            bar.style.background = 'rgba(255,255,255,0.08)';
            bar.style.overflow = 'hidden';

            const fill = document.createElement('div');
            fill.className = 'edu-progress-fill';
            fill.style.height = '100%';
            fill.style.width = '0%';
            fill.style.background = 'linear-gradient(90deg, #00b894, #74b9ff)';
            fill.style.transition = 'width 320ms cubic-bezier(0.2, 0.7, 0.2, 1)';

            bar.appendChild(fill);
            wrap.appendChild(label);
            wrap.appendChild(bar);
            scoreRow.insertAdjacentElement('afterend', wrap);
        }

        const safeTotal = Math.max(1, total);
        const ratio = clamp(answered / safeTotal, 0, 1);
        const pct = Math.round(ratio * 100);

        const textEl = wrap.querySelector('.edu-progress-text');
        const pctEl = wrap.querySelector('.edu-progress-pct');
        const fillEl = wrap.querySelector('.edu-progress-fill');

        if (textEl) textEl.textContent = `Question ${Math.min(answered + 1, safeTotal)} / ${safeTotal}`;
        if (pctEl) pctEl.textContent = `${pct}%`;
        if (fillEl) fillEl.style.width = `${pct}%`;
    }

    function ensureConfidenceBadge(card) {
        if (!card) return null;
        const scoreRow = card.querySelector('.mcq-score');
        if (!scoreRow) return null;

        let badge = card.querySelector('.edu-confidence-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'edu-confidence-badge';
            badge.textContent = 'Confidence: 3/5';
            badge.style.fontSize = '0.75rem';
            badge.style.color = 'var(--text-muted)';
            badge.style.marginLeft = '0.75rem';
            scoreRow.appendChild(badge);
        }
        return badge;
    }

    function ensureConfidenceSlider(container) {
        if (!container || container.querySelector('.edu-confidence-wrap')) return;
        const options = container.querySelector('.mcq-options');
        if (!options) return;

        const wrap = document.createElement('div');
        wrap.className = 'edu-confidence-wrap';
        wrap.style.marginTop = '0.85rem';
        wrap.style.padding = '0.65rem 0.75rem';
        wrap.style.background = 'rgba(255,255,255,0.03)';
        wrap.style.border = '1px solid var(--border-glass)';
        wrap.style.borderRadius = '8px';

        const title = document.createElement('label');
        title.style.display = 'flex';
        title.style.justifyContent = 'space-between';
        title.style.alignItems = 'center';
        title.style.fontSize = '0.78rem';
        title.style.color = 'var(--text-secondary)';
        title.style.marginBottom = '0.45rem';

        const labelText = document.createElement('span');
        labelText.textContent = 'Confidence Level';

        const valueText = document.createElement('span');
        valueText.className = 'edu-confidence-value';
        valueText.textContent = '3/5';
        valueText.style.color = 'var(--accent-secondary)';

        title.appendChild(labelText);
        title.appendChild(valueText);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '1';
        slider.max = '5';
        slider.step = '1';
        slider.value = container.dataset.confidence || '3';
        slider.title = 'Set how confident you are before answering';

        slider.addEventListener('input', () => {
            valueText.textContent = `${slider.value}/5`;
            container.dataset.confidence = slider.value;

            const card = container.closest('.mcq-container');
            const badge = ensureConfidenceBadge(card);
            if (badge) badge.textContent = `Confidence: ${slider.value}/5`;
        });

        wrap.appendChild(title);
        wrap.appendChild(slider);
        options.insertAdjacentElement('afterend', wrap);

        const card = container.closest('.mcq-container');
        const badge = ensureConfidenceBadge(card);
        if (badge) badge.textContent = `Confidence: ${slider.value}/5`;
    }

    function animateChoice(el) {
        if (!el || !el.animate) return;
        el.animate(
            [
                { transform: 'scale(1)', boxShadow: '0 0 0 rgba(0,0,0,0)' },
                { transform: 'scale(1.03)', boxShadow: '0 0 18px rgba(108,92,231,0.25)' },
                { transform: 'scale(1)', boxShadow: '0 0 0 rgba(0,0,0,0)' },
            ],
            {
                duration: 360,
                easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            }
        );
    }

    function refreshHomeQuizUI() {
        const card = document.getElementById('homeQuizContent')?.closest('.mcq-container');
        const scoreEl = document.getElementById('homeScore');
        if (!card || !scoreEl) return;
        const answered = parseAnsweredCount(scoreEl);
        ensureProgressUI(card, answered, 5);
        ensureConfidenceBadge(card);
        ensureConfidenceSlider(document.getElementById('homeQuizContent'));
    }

    function refreshDemoQuizUI(subject, containerId, scoreId) {
        const container = document.getElementById(containerId);
        const scoreEl = document.getElementById(scoreId);
        if (!container || !scoreEl) return;

        const card = container.closest('.mcq-container');
        if (!card) return;

        const answered = parseAnsweredCount(scoreEl);
        ensureProgressUI(card, answered, 5);
        ensureConfidenceBadge(card);
        ensureConfidenceSlider(container);

        if (subject) {
            card.dataset.subject = subject;
        }
    }

    function installQuizEnhancements() {
        if (window.__eduQuizEnhancementsInstalled) return;
        window.__eduQuizEnhancementsInstalled = true;

        if (typeof window.renderHomeQuestion === 'function') {
            const originalRenderHome = window.renderHomeQuestion;
            window.renderHomeQuestion = function patchedRenderHomeQuestion() {
                const result = originalRenderHome.apply(this, arguments);
                refreshHomeQuizUI();
                return result;
            };
        }

        if (typeof window.updateHomeScore === 'function') {
            const originalUpdateHome = window.updateHomeScore;
            window.updateHomeScore = function patchedUpdateHomeScore() {
                const result = originalUpdateHome.apply(this, arguments);
                refreshHomeQuizUI();
                return result;
            };
        }

        if (typeof window.answerHomeQuiz === 'function') {
            const originalAnswerHome = window.answerHomeQuiz;
            window.answerHomeQuiz = function patchedAnswerHomeQuiz(selected) {
                const selectedEl = document.getElementById(`homeOpt${selected}`);
                animateChoice(selectedEl);

                const container = document.getElementById('homeQuizContent');
                if (container) {
                    const conf = parseInt(container.dataset.confidence || '3', 10);
                    const badge = ensureConfidenceBadge(container.closest('.mcq-container'));
                    if (badge) badge.textContent = `Confidence: ${conf}/5`;
                }
                return originalAnswerHome.apply(this, arguments);
            };
        }

        if (typeof window.renderDemoQuestion === 'function') {
            const originalRenderDemo = window.renderDemoQuestion;
            window.renderDemoQuestion = function patchedRenderDemoQuestion(subject, containerId, scoreId) {
                const result = originalRenderDemo.apply(this, arguments);
                refreshDemoQuizUI(subject, containerId, scoreId);
                return result;
            };
        }

        if (typeof window.updateDemoScore === 'function') {
            const originalUpdateDemo = window.updateDemoScore;
            window.updateDemoScore = function patchedUpdateDemoScore(subject, scoreId) {
                const result = originalUpdateDemo.apply(this, arguments);

                const containerMap = {
                    biology: 'bioQuizContent',
                    physics: 'physicsQuizContent',
                    chemistry: 'chemQuizContent',
                    maths: 'mathsQuizContent',
                    languages: 'langQuizContent',
                    geography: 'geoQuizContent',
                    history: 'histQuizContent',
                };

                const containerId = containerMap[subject];
                if (containerId) {
                    refreshDemoQuizUI(subject, containerId, scoreId);
                }
                return result;
            };
        }

        if (typeof window.answerDemoQuiz === 'function') {
            const originalAnswerDemo = window.answerDemoQuiz;
            window.answerDemoQuiz = function patchedAnswerDemoQuiz(subject, selected, correct, containerId, scoreId) {
                const selectedEl = document.getElementById(`${subject}Opt${selected}`);
                animateChoice(selectedEl);

                const container = document.getElementById(containerId);
                if (container) {
                    const conf = parseInt(container.dataset.confidence || '3', 10);
                    const badge = ensureConfidenceBadge(container.closest('.mcq-container'));
                    if (badge) badge.textContent = `Confidence: ${conf}/5`;
                }

                return originalAnswerDemo.apply(this, arguments);
            };
        }

        setTimeout(() => {
            refreshHomeQuizUI();
            refreshDemoQuizUI('biology', 'bioQuizContent', 'bioScore');
            refreshDemoQuizUI('physics', 'physicsQuizContent', 'physicsScore');
            refreshDemoQuizUI('chemistry', 'chemQuizContent', 'chemScore');
            refreshDemoQuizUI('maths', 'mathsQuizContent', 'mathsScore');
            refreshDemoQuizUI('languages', 'langQuizContent', 'langScore');
            refreshDemoQuizUI('geography', 'geoQuizContent', 'geoScore');
            refreshDemoQuizUI('history', 'histQuizContent', 'histScore');
        }, 100);
    }

    function findSubjectAwareFallback(subject, message) {
        const msg = message.toLowerCase();
        const knowledge = {
            biology: [
                {
                    keys: ['photosynthesis', 'plant', 'chlorophyll'],
                    text: 'Photosynthesis uses light energy to convert carbon dioxide and water into glucose and oxygen. It mainly happens in chloroplasts, and chlorophyll captures the light.'
                },
                {
                    keys: ['cell', 'organelle', 'nucleus'],
                    text: 'A cell is the basic unit of life. The nucleus stores DNA, mitochondria release energy, and ribosomes synthesize proteins.'
                },
            ],
            physics: [
                {
                    keys: ['force', 'newton', 'acceleration'],
                    text: 'Newton\'s second law states that force equals mass times acceleration. If mass stays constant, increasing force increases acceleration proportionally.'
                },
                {
                    keys: ['gravity', 'fall', 'projectile'],
                    text: 'Gravity gives objects a downward acceleration of about 9.8 m/s^2 on Earth, which shapes projectile paths into parabolas.'
                },
            ],
            chemistry: [
                {
                    keys: ['bond', 'ionic', 'covalent'],
                    text: 'Ionic bonding transfers electrons, while covalent bonding shares electrons. Molecules like H2O and CO2 rely on covalent bonds.'
                },
                {
                    keys: ['methane', 'ch4', 'tetrahedral'],
                    text: 'Methane (CH4) has a central carbon with four hydrogen atoms in a tetrahedral geometry. The bond angle is approximately 109.5 degrees.'
                },
            ],
            maths: [
                {
                    keys: ['derivative', 'differentiate', 'rate'],
                    text: 'A derivative measures how quickly a function changes. For example, d/dx(x^2) = 2x, which gives the slope at each x-value.'
                },
                {
                    keys: ['integral', 'area', 'calculus'],
                    text: 'An integral accumulates quantity, often interpreted as area under a curve. For instance, integral of x^2 is x^3/3 + C.'
                },
            ],
            geography: [
                {
                    keys: ['climate', 'zone', 'equator'],
                    text: 'Climate zones vary by latitude because solar energy is distributed unevenly, with tropical zones near the equator and colder zones near the poles.'
                },
                {
                    keys: ['plate', 'tectonic', 'earthquake'],
                    text: 'Tectonic plates move over geological time. Their interactions at boundaries cause earthquakes, mountain formation, and volcanic activity.'
                },
            ],
            history: [
                {
                    keys: ['independence', 'india', 'freedom'],
                    text: 'India gained independence in 1947 after decades of mass movements, civil resistance, and political negotiations.'
                },
                {
                    keys: ['world war', 'ww2', 'ww1'],
                    text: 'The world wars reshaped global politics, borders, technology, and diplomacy, with lasting impacts on modern international institutions.'
                },
            ],
            general: [
                {
                    keys: ['hello', 'hi', 'help'],
                    text: 'I can explain concepts step by step. Ask me with a subject context for better answers, such as physics, chemistry, or biology.'
                },
            ],
        };

        const subjectKnowledge = knowledge[subject] || knowledge.general;
        for (let i = 0; i < subjectKnowledge.length; i++) {
            const entry = subjectKnowledge[i];
            if (entry.keys.some((key) => msg.includes(key))) {
                return entry.text;
            }
        }

        return `I can help with ${subject}. Ask for a definition, formula, step-by-step explanation, or a real-life example.`;
    }

    function createTypingIndicator() {
        const container = document.getElementById('chatMessages');
        if (!container) return null;

        const id = `typing-${Date.now()}`;
        const wrapper = document.createElement('div');
        wrapper.className = 'chat-message bot';
        wrapper.id = id;

        const content = document.createElement('div');
        content.className = 'msg-content';
        content.textContent = 'Typing';
        wrapper.appendChild(content);
        container.appendChild(wrapper);
        container.scrollTop = container.scrollHeight;

        let dots = 0;
        const timer = setInterval(() => {
            dots = (dots + 1) % 4;
            content.textContent = `Typing${'.'.repeat(dots)}`;
            container.scrollTop = container.scrollHeight;
        }, 280);

        return {
            id,
            stop: () => {
                clearInterval(timer);
                wrapper.remove();
            }
        };
    }

    function typeBotMessage(content) {
        return new Promise((resolve) => {
            const container = document.getElementById('chatMessages');
            if (!container) {
                resolve();
                return;
            }

            const message = document.createElement('div');
            message.className = 'chat-message bot';
            const inner = document.createElement('div');
            inner.className = 'msg-content';
            message.appendChild(inner);
            container.appendChild(message);

            let index = 0;
            const plain = String(content || '');
            const speed = plain.length > 240 ? 6 : 12;

            const tick = () => {
                index = Math.min(plain.length, index + 2);
                inner.textContent = plain.slice(0, index);
                container.scrollTop = container.scrollHeight;

                if (index >= plain.length) {
                    const formatted = plain
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br>');
                    inner.innerHTML = formatted;
                    resolve();
                    return;
                }

                setTimeout(tick, speed);
            };

            tick();
        });
    }

    function installChatEnhancements() {
        if (window.__eduChatEnhancementsInstalled) return;
        if (typeof window.sendChat !== 'function' || typeof window.addChatMessage !== 'function') return;

        window.__eduChatEnhancementsInstalled = true;

        const enhancedSendChat = async function enhancedSendChat() {
            const input = document.getElementById('chatInput');
            if (!input) return;

            const message = input.value.trim();
            if (!message) return;

            input.value = '';
            window.addChatMessage('user', message);

            const subject = (() => {
                try {
                    if (typeof currentChatSubject !== 'undefined' && currentChatSubject) {
                        return currentChatSubject;
                    }
                } catch (err) {
                    // Ignore lexical lookup errors.
                }
                return 'general';
            })();

            const typing = createTypingIndicator();
            const realismDelay = 500 + Math.floor(Math.random() * 450) + Math.min(1000, message.length * 18);

            let responseText = '';
            try {
                const responsePromise = fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, subject })
                }).then((resp) => resp.json());

                const data = await Promise.all([
                    responsePromise,
                    new Promise((resolve) => setTimeout(resolve, realismDelay))
                ]).then((result) => result[0]);

                const backendText = (data && data.response) ? String(data.response) : '';
                const normalized = backendText.toLowerCase();
                const isGeneric =
                    !backendText ||
                    normalized.includes('i can help with') ||
                    normalized.includes('ask a specific question') ||
                    normalized.includes('i can help you learn');

                responseText = isGeneric
                    ? findSubjectAwareFallback(subject, message)
                    : backendText;
            } catch (err) {
                responseText = findSubjectAwareFallback(subject, message);
            }

            if (typing) typing.stop();
            await typeBotMessage(responseText);
        };

        window.sendChat = enhancedSendChat;
    }

    const ProjectileVector = {
        initialized: false,
        canvas: null,
        ctx: null,

        init() {
            if (this.initialized) return;

            const angleSlider = document.getElementById('launchAngle');
            const velocitySlider = document.getElementById('launchVelocity');
            if (!angleSlider || !velocitySlider) return;

            const physicsPanel = document.getElementById('panel-physics');
            if (!physicsPanel) return;

            const projectileCard = angleSlider.closest('.glass-card');
            if (!projectileCard) return;

            const mount = document.createElement('div');
            mount.id = 'projectileVectorMount';
            mount.style.marginTop = '0.75rem';
            mount.style.padding = '0.7rem';
            mount.style.background = 'rgba(255,255,255,0.03)';
            mount.style.border = '1px solid var(--border-glass)';
            mount.style.borderRadius = '8px';

            const label = document.createElement('div');
            label.style.display = 'flex';
            label.style.justifyContent = 'space-between';
            label.style.fontSize = '0.75rem';
            label.style.color = 'var(--text-secondary)';
            label.style.marginBottom = '0.35rem';
            label.innerHTML = '<span>Vector Arrows (magnitude + direction)</span><span id="projectileVectorText">v = 0 m/s</span>';

            const canvas = document.createElement('canvas');
            canvas.id = 'projectile-vector-canvas';
            canvas.height = 130;
            canvas.style.width = '100%';
            canvas.style.display = 'block';
            canvas.style.borderRadius = '8px';
            canvas.style.background = 'rgba(10,10,26,0.7)';

            mount.appendChild(label);
            mount.appendChild(canvas);
            projectileCard.appendChild(mount);

            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.initialized = true;

            const originalUpdateProjectile = typeof window.updateProjectile === 'function'
                ? window.updateProjectile
                : null;

            if (originalUpdateProjectile && !window.__eduProjectilePatched) {
                window.updateProjectile = function patchedUpdateProjectile() {
                    const result = originalUpdateProjectile.apply(this, arguments);
                    ProjectileVector.draw();
                    return result;
                };
                window.__eduProjectilePatched = true;
            }

            window.addEventListener('resize', () => this.draw());
            this.draw();
        },

        drawArrow(ctx, x, y, dx, dy, color, label) {
            const length = Math.sqrt(dx * dx + dy * dy);
            if (length < 0.001) return;

            const ux = dx / length;
            const uy = dy / length;
            const endX = x + dx;
            const endY = y + dy;

            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - ux * 10 - uy * 6, endY - uy * 10 + ux * 6);
            ctx.lineTo(endX - ux * 10 + uy * 6, endY - uy * 10 - ux * 6);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            ctx.fillStyle = color;
            ctx.font = '12px Inter, sans-serif';
            ctx.fillText(label, endX + 6, endY - 6);
        },

        draw() {
            if (!this.initialized || !this.canvas || !this.ctx) return;

            const rect = this.canvas.getBoundingClientRect();
            const width = Math.max(220, Math.floor(rect.width));
            const height = this.canvas.height;
            if (this.canvas.width !== width) this.canvas.width = width;

            const angle = parseFloat(document.getElementById('launchAngle')?.value || '45');
            const velocity = parseFloat(document.getElementById('launchVelocity')?.value || '20');

            const theta = angle * Math.PI / 180;
            const vx = velocity * Math.cos(theta);
            const vy = velocity * Math.sin(theta);

            const ctx = this.ctx;
            ctx.clearRect(0, 0, width, height);

            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(20, height - 20);
            ctx.lineTo(width - 20, height - 20);
            ctx.moveTo(20, height - 20);
            ctx.lineTo(20, 20);
            ctx.stroke();

            const scale = 2.2;
            const originX = 34;
            const originY = height - 28;

            this.drawArrow(ctx, originX, originY, vx * scale, -vy * scale, '#74b9ff', 'Velocity');
            this.drawArrow(ctx, originX, originY, vx * scale, 0, '#00b894', 'Vx');
            this.drawArrow(ctx, originX, originY, 0, 42, '#fdcb6e', 'g');

            const magText = document.getElementById('projectileVectorText');
            if (magText) {
                magText.textContent = `|v| = ${velocity.toFixed(1)} m/s @ ${angle.toFixed(0)} deg`;
            }
        }
    };

    const ForceSimulation = {
        initialized: false,
        renderer: null,
        scene: null,
        camera: null,
        state: {
            mass: 1.4,
            force: 8,
            speed: 2,
            angleDeg: 25,
            gravityOn: true,
            frictionOn: true,
            frictionMu: 0.18,
        },
        bodyState: {
            position: null,
            velocity: null,
            acceleration: null,
        },
        vectors: {
            forceArrow: null,
            velArrow: null,
            accArrow: null,
            smoothForce: 0,
            smoothVel: 0,
            smoothAcc: 0,
        },
        animationId: null,
        lastTick: 0,

        init() {
            if (this.initialized) return;
            if (typeof THREE === 'undefined') return;

            const physicsPanel = document.getElementById('panel-physics');
            const conceptCard = physicsPanel?.querySelector('.concept-panel');
            if (!conceptCard) return;

            const mount = document.createElement('div');
            mount.id = 'forceSimulationMount';
            mount.style.marginTop = '1rem';
            mount.innerHTML = `
                <h4 style="font-size:0.95rem; margin-bottom:0.7rem; color:var(--accent-secondary);">Interactive Force Simulation</h4>
                <div class="demo-visual" id="forceSimVisual" style="min-height:250px; border:none;">
                    <canvas id="force-sim-canvas"></canvas>
                    <div class="demo-visual-overlay" id="forceSimOverlay"><strong>Live:</strong> F = m * a with dynamic vector arrows</div>
                </div>
                <div style="padding:0.8rem 0 0;">
                    <div class="control-group">
                        <label>Applied Force <span class="value-display" id="forceValue">8.0 N</span></label>
                        <input type="range" id="forceSlider" min="0" max="20" step="0.1" value="8">
                    </div>
                    <div class="control-group">
                        <label>Initial Speed <span class="value-display" id="simSpeedValue">2.0 m/s</span></label>
                        <input type="range" id="simSpeedSlider" min="0" max="10" step="0.1" value="2">
                    </div>
                    <div class="control-group">
                        <label>Force Angle <span class="value-display" id="forceAngleValue">25 deg</span></label>
                        <input type="range" id="forceAngleSlider" min="0" max="360" step="1" value="25">
                    </div>
                    <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.6rem;">
                        <button class="fill-option" id="gravityToggle">Gravity ON</button>
                        <button class="fill-option" id="frictionToggle">Friction ON</button>
                        <button class="fill-option" id="forceReset">Reset</button>
                    </div>
                    <div id="forceReadout" style="margin-top:0.65rem; font-size:0.78rem; color:var(--text-secondary); line-height:1.7; background:rgba(255,255,255,0.03); border:1px solid var(--border-glass); border-radius:8px; padding:0.55rem 0.7rem;">
                        <div>Acceleration: <span id="accelReadout" style="color:#55efc4;">0.00 m/s^2</span></div>
                        <div>Velocity: <span id="velocityReadout" style="color:#74b9ff;">0.00 m/s</span></div>
                        <div>Direction: <span id="directionReadout" style="color:#fdcb6e;">25 deg</span></div>
                    </div>
                </div>
            `;

            conceptCard.appendChild(mount);

            const canvas = document.getElementById('force-sim-canvas');
            if (!canvas) return;

            const width = canvas.parentElement.clientWidth;
            const height = canvas.parentElement.clientHeight || 250;

            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x0a0a1a);

            this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
            this.camera.position.set(7, 5.6, 7);
            this.camera.lookAt(0, 0.5, 0);

            this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            const ambient = new THREE.AmbientLight(0xffffff, 0.45);
            const dir = new THREE.DirectionalLight(0xffffff, 0.9);
            dir.position.set(5, 8, 6);
            dir.castShadow = true;
            dir.shadow.mapSize.set(1024, 1024);
            dir.shadow.camera.left = -8;
            dir.shadow.camera.right = 8;
            dir.shadow.camera.top = 8;
            dir.shadow.camera.bottom = -8;

            this.scene.add(ambient);
            this.scene.add(dir);

            const plane = new THREE.Mesh(
                new THREE.PlaneGeometry(12, 12),
                new THREE.MeshStandardMaterial({ color: 0x172038, roughness: 0.85, metalness: 0.08 })
            );
            plane.rotation.x = -Math.PI / 2;
            plane.receiveShadow = true;
            this.scene.add(plane);

            const grid = new THREE.GridHelper(12, 12, 0x2b3555, 0x1a2342);
            grid.position.y = 0.001;
            this.scene.add(grid);

            const body = new THREE.Mesh(
                new THREE.BoxGeometry(0.9, 0.9, 0.9),
                new THREE.MeshStandardMaterial({ color: 0x6c5ce7, roughness: 0.35, metalness: 0.18 })
            );
            body.position.set(-3, 0.45, 0);
            body.castShadow = true;
            body.receiveShadow = true;
            body.name = 'forceBody';
            this.scene.add(body);

            this.bodyState.position = new THREE.Vector2(-3, 0);
            this.bodyState.velocity = new THREE.Vector2(0, 0);
            this.bodyState.acceleration = new THREE.Vector2(0, 0);

            this.vectors.forceArrow = new THREE.ArrowHelper(
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(body.position.x, 1.15, body.position.z),
                1,
                0xff6b6b,
                0.25,
                0.12
            );
            this.vectors.velArrow = new THREE.ArrowHelper(
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(body.position.x, 1.35, body.position.z),
                1,
                0x74b9ff,
                0.25,
                0.12
            );
            this.vectors.accArrow = new THREE.ArrowHelper(
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(body.position.x, 1.55, body.position.z),
                1,
                0x55efc4,
                0.25,
                0.12
            );
            this.scene.add(this.vectors.forceArrow, this.vectors.velArrow, this.vectors.accArrow);

            this.bindControls();
            this.initialized = true;
            this.lastTick = performance.now();

            const animate = () => {
                this.animationId = requestAnimationFrame(animate);

                const now = performance.now();
                const dt = clamp((now - this.lastTick) / 1000, 0.001, 0.033);
                this.lastTick = now;

                this.stepPhysics(dt);
                this.renderer.render(this.scene, this.camera);
            };
            animate();

            window.addEventListener('resize', () => {
                if (!this.renderer || !this.camera || !canvas.parentElement) return;
                const w = canvas.parentElement.clientWidth;
                const h = canvas.parentElement.clientHeight || 250;
                this.camera.aspect = w / h;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(w, h);
            });
        },

        bindControls() {
            const forceSlider = document.getElementById('forceSlider');
            const speedSlider = document.getElementById('simSpeedSlider');
            const angleSlider = document.getElementById('forceAngleSlider');
            const gravityBtn = document.getElementById('gravityToggle');
            const frictionBtn = document.getElementById('frictionToggle');
            const resetBtn = document.getElementById('forceReset');

            if (!forceSlider || !speedSlider || !angleSlider || !gravityBtn || !frictionBtn || !resetBtn) return;

            forceSlider.title = 'Adjust external force magnitude in Newtons';
            speedSlider.title = 'Set initial speed for the object';
            angleSlider.title = 'Set force direction angle';
            gravityBtn.title = 'Toggle gravity effect';
            frictionBtn.title = 'Toggle friction with the surface';
            resetBtn.title = 'Reset object motion and vectors';

            forceSlider.addEventListener('input', () => {
                this.state.force = parseFloat(forceSlider.value);
                document.getElementById('forceValue').textContent = `${this.state.force.toFixed(1)} N`;
            });

            speedSlider.addEventListener('input', () => {
                this.state.speed = parseFloat(speedSlider.value);
                document.getElementById('simSpeedValue').textContent = `${this.state.speed.toFixed(1)} m/s`;

                const rad = this.state.angleDeg * Math.PI / 180;
                this.bodyState.velocity.set(Math.cos(rad) * this.state.speed, Math.sin(rad) * this.state.speed);
            });

            angleSlider.addEventListener('input', () => {
                this.state.angleDeg = parseFloat(angleSlider.value);
                document.getElementById('forceAngleValue').textContent = `${this.state.angleDeg.toFixed(0)} deg`;
            });

            gravityBtn.addEventListener('click', () => {
                this.state.gravityOn = !this.state.gravityOn;
                gravityBtn.textContent = this.state.gravityOn ? 'Gravity ON' : 'Gravity OFF';
                gravityBtn.style.borderColor = this.state.gravityOn ? '#00b894' : 'var(--border-glass)';
                gravityBtn.style.background = this.state.gravityOn ? 'rgba(0,184,148,0.12)' : 'var(--bg-glass)';
            });

            frictionBtn.addEventListener('click', () => {
                this.state.frictionOn = !this.state.frictionOn;
                frictionBtn.textContent = this.state.frictionOn ? 'Friction ON' : 'Friction OFF';
                frictionBtn.style.borderColor = this.state.frictionOn ? '#74b9ff' : 'var(--border-glass)';
                frictionBtn.style.background = this.state.frictionOn ? 'rgba(116,185,255,0.12)' : 'var(--bg-glass)';
            });

            resetBtn.addEventListener('click', () => {
                this.bodyState.position.set(-3, 0);
                this.bodyState.velocity.set(0, 0);
                this.bodyState.acceleration.set(0, 0);

                this.vectors.smoothForce = 0;
                this.vectors.smoothVel = 0;
                this.vectors.smoothAcc = 0;
            });
        },

        setArrow(helper, vec2, magnitude, smoothKey, color) {
            const body = this.scene.getObjectByName('forceBody');
            if (!helper || !body) return;

            this.vectors[smoothKey] = lerp(this.vectors[smoothKey], magnitude, 0.18);
            const shownMag = this.vectors[smoothKey];

            const dir3 = new THREE.Vector3(vec2.x, 0, vec2.y);
            if (dir3.lengthSq() < 1e-8) {
                helper.visible = false;
                return;
            }

            helper.visible = true;
            dir3.normalize();
            helper.setColor(new THREE.Color(color));
            helper.position.set(body.position.x, helper.position.y, body.position.z);
            helper.setDirection(dir3);
            helper.setLength(0.3 + shownMag * 0.24, 0.22, 0.11);
        },

        stepPhysics(dt) {
            const body = this.scene.getObjectByName('forceBody');
            if (!body) return;

            const theta = this.state.angleDeg * Math.PI / 180;
            const forceVec = new THREE.Vector2(Math.cos(theta), Math.sin(theta)).multiplyScalar(this.state.force);

            const velocity = this.bodyState.velocity;
            const frictionVec = new THREE.Vector2(0, 0);

            if (this.state.frictionOn && velocity.lengthSq() > 1e-6) {
                const effectiveG = this.state.gravityOn ? 9.8 : 1.0;
                const frictionMag = this.state.frictionMu * this.state.mass * effectiveG;
                const velDir = velocity.clone().normalize();
                frictionVec.copy(velDir).multiplyScalar(-frictionMag);
            }

            const netForce = forceVec.clone().add(frictionVec);
            this.bodyState.acceleration.copy(netForce).multiplyScalar(1 / this.state.mass);

            const accel = this.bodyState.acceleration;
            velocity.add(accel.clone().multiplyScalar(dt));

            const damping = this.state.frictionOn ? 0.992 : 0.997;
            velocity.multiplyScalar(Math.pow(damping, dt * 60));

            this.bodyState.position.add(velocity.clone().multiplyScalar(dt));

            const limit = 5.2;
            if (this.bodyState.position.x > limit || this.bodyState.position.x < -limit) {
                this.bodyState.position.x = clamp(this.bodyState.position.x, -limit, limit);
                velocity.x *= -0.64;
            }
            if (this.bodyState.position.y > limit || this.bodyState.position.y < -limit) {
                this.bodyState.position.y = clamp(this.bodyState.position.y, -limit, limit);
                velocity.y *= -0.64;
            }

            body.position.x = this.bodyState.position.x;
            body.position.z = this.bodyState.position.y;
            body.position.y = 0.45 + Math.min(0.08, velocity.length() * 0.02);
            body.rotation.y += velocity.length() * dt * 0.7;

            const forceMag = forceVec.length();
            const velMag = velocity.length();
            const accelMag = accel.length();

            this.setArrow(this.vectors.forceArrow, forceVec, forceMag * 0.08, 'smoothForce', '#ff6b6b');
            this.setArrow(this.vectors.velArrow, velocity, velMag * 0.22, 'smoothVel', '#74b9ff');
            this.setArrow(this.vectors.accArrow, accel, accelMag * 0.18, 'smoothAcc', '#55efc4');

            const angle = (Math.atan2(velocity.y, velocity.x) * 180 / Math.PI + 360) % 360;
            const accelReadout = document.getElementById('accelReadout');
            const velocityReadout = document.getElementById('velocityReadout');
            const directionReadout = document.getElementById('directionReadout');
            if (accelReadout) accelReadout.textContent = `${accelMag.toFixed(2)} m/s^2`;
            if (velocityReadout) velocityReadout.textContent = `${velMag.toFixed(2)} m/s`;
            if (directionReadout) directionReadout.textContent = `${angle.toFixed(1)} deg`;
        }
    };

    function enhanceWaveSceneVectors() {
        if (typeof ThreeScenes === 'undefined' || typeof ThreeScenes.initPhysics !== 'function') return;
        if (ThreeScenes.__eduWaveVectorsPatched) return;

        const originalInitPhysics = ThreeScenes.initPhysics.bind(ThreeScenes);
        ThreeScenes.initPhysics = function patchedInitPhysics(canvasId) {
            originalInitPhysics(canvasId);

            const state = this.scenes.physics;
            if (!state || state.__eduVectorsAttached || typeof THREE === 'undefined') {
                return;
            }

            state.__eduVectorsAttached = true;
            const arrows = [];
            const sourcePositions = [
                new THREE.Vector3(-3, 0.25, 0),
                new THREE.Vector3(3, 0.25, 0)
            ];
            const colors = [0xff7675, 0x55efc4];

            sourcePositions.forEach((pos, i) => {
                const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), pos, 1, colors[i], 0.22, 0.1);
                arrows.push(arrow);
                state.scene.add(arrow);
            });

            let phase = 0;
            const updateArrows = () => {
                if (!state.__eduVectorsAttached) return;
                phase += 0.05;

                const amp = state.params?.amplitude || 1;
                const freq = state.params?.frequency || 1;

                arrows.forEach((arrow, index) => {
                    const offset = index === 0 ? 0 : Math.PI / 3;
                    const waveComponent = Math.sin(phase * freq + offset);
                    const dir = new THREE.Vector3(0.4 * waveComponent, 1, 0.2 * Math.cos(phase + offset)).normalize();
                    const mag = 0.5 + Math.abs(waveComponent) * 0.55 * amp;
                    arrow.setDirection(dir);
                    arrow.setLength(mag, 0.22, 0.1);
                });

                requestAnimationFrame(updateArrows);
            };

            updateArrows();
        };

        ThreeScenes.__eduWaveVectorsPatched = true;
    }

    function handleTabChange(tab) {
        if (tab === 'physics') {
            ForceSimulation.init();
            ProjectileVector.init();
        }
        if (tab === 'chatbot') {
            installChatEnhancements();
        }

        addTooltipTitles();
    }

    function bootstrap() {
        enhanceWaveSceneVectors();
        installQuizEnhancements();
        installChatEnhancements();
        addTooltipTitles();

        registerTabHook(handleTabChange);

        const active = getActiveDemoTab();
        if (active) {
            handleTabChange(active);
        }

        // Homepage MCQ enhancements should also run even without demo tabs.
        refreshHomeQuizUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
