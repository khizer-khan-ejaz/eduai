/**
 * cell-ui.js — Manages DOM updates for info panel, loading state, 
 * tooltips, organelle list, and toggle buttons.
 */

import { PLANT_ORGANELLES, ANIMAL_ORGANELLES, LOADING_TIPS } from './cell-data.js';

export class CellUI {
    constructor() {
        // DOM refs
        this.infoContent = document.getElementById('info-content');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.loadingTitle = document.getElementById('loading-title');
        this.loadingProgress = document.getElementById('loading-progress');
        this.loadingTip = document.getElementById('loading-tip');
        this.hoverTooltip = document.getElementById('hover-tooltip');
        this.organelleList = document.getElementById('organelle-list');
        this.btnPlant = document.getElementById('btn-plant');
        this.btnAnimal = document.getElementById('btn-animal');
        this.btnAutoRotate = document.getElementById('btn-autorotate');

        // State
        this.currentType = 'plant';
        this._tipInterval = null;
    }

    /**
     * Get current organelle data map
     */
    getCurrentData() {
        return this.currentType === 'plant' ? PLANT_ORGANELLES : ANIMAL_ORGANELLES;
    }

    // ─── Loading State ─── //

    showLoading(cellType) {
        this.loadingOverlay.classList.remove('hidden');
        this.loadingProgress.style.width = '0%';
        this.loadingTitle.textContent = cellType === 'plant'
            ? 'Preparing Plant Cell...'
            : 'Preparing Animal Cell...';

        // Rotate tips
        this._showRandomTip();
        this._tipInterval = setInterval(() => this._showRandomTip(), 3500);
    }

    updateProgress(percent) {
        this.loadingProgress.style.width = `${Math.min(percent, 100)}%`;
    }

    hideLoading() {
        this.loadingProgress.style.width = '100%';
        clearInterval(this._tipInterval);
        setTimeout(() => {
            this.loadingOverlay.classList.add('hidden');
        }, 400);
    }

    _showRandomTip() {
        const tip = LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
        this.loadingTip.textContent = tip;
    }

    // ─── Toggle Buttons ─── //

    setActiveToggle(type) {
        this.currentType = type;
        if (type === 'plant') {
            this.btnPlant.classList.add('active');
            this.btnAnimal.classList.remove('active');
        } else {
            this.btnAnimal.classList.add('active');
            this.btnPlant.classList.remove('active');
        }
        this.clearInfo();
        this.populateOrganelleList(type);
    }

    // ─── Organelle Quick List ─── //

    populateOrganelleList(type, onChipClick) {
        const data = type === 'plant' ? PLANT_ORGANELLES : ANIMAL_ORGANELLES;
        // Clear existing
        const listContainer = this.organelleList;
        if (!listContainer) return;

        // Keep the h4
        listContainer.innerHTML = '<h4>Organelles</h4>';

        Object.entries(data).forEach(([key, org]) => {
            const chip = document.createElement('button');
            chip.className = 'organelle-chip';
            chip.dataset.key = key;
            chip.innerHTML = `<span class="chip-dot" style="background:${org.color}"></span>${org.icon} ${org.name}`;
            chip.addEventListener('click', () => {
                if (onChipClick) onChipClick(key);
                this.showOrganelleInfo(key);
            });
            listContainer.appendChild(chip);
        });
    }

    // ─── Info Panel ─── //

    showOrganelleInfo(key) {
        const data = this.getCurrentData();
        const info = data[key];

        if (!info) {
            // Fallback for unknown organelles
            this.infoContent.className = 'info-content active-state';
            this.infoContent.innerHTML = `
                <div class="info-card">
                    <div class="info-card-accent"></div>
                    <div class="info-card-body">
                        <span class="info-badge common">Cell Component</span>
                        <h2 class="info-card-title">${key.replace(/_/g, ' ')}</h2>
                        <p class="info-card-function">Part of the cell structure</p>
                        <div class="info-card-divider"></div>
                        <p class="info-card-desc">This is a structural component of the cell. Click on labeled organelles for detailed information.</p>
                    </div>
                </div>
                <button class="close-info-btn" id="close-info-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Clear Selection
                </button>
            `;
            this._bindCloseBtn();
            return;
        }

        const badgeClass = info.badge || 'common';
        const badgeLabel = badgeClass === 'plant' ? '🌱 Plant Cell'
            : badgeClass === 'animal' ? '🔬 Animal Cell'
            : '🧬 Common';

        let factsHTML = '';
        if (info.facts && info.facts.length > 0) {
            factsHTML = `
                <div class="info-facts">
                    <h5>Key Facts</h5>
                    ${info.facts.map(f => `
                        <div class="fact-item">
                            <span class="fact-icon">${f.icon}</span>
                            <span>${f.text}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        this.infoContent.className = 'info-content active-state';
        this.infoContent.innerHTML = `
            <div class="info-card">
                <div class="info-card-accent"></div>
                <div class="info-card-body">
                    <span class="info-badge ${badgeClass}">${badgeLabel}</span>
                    <h2 class="info-card-title">${info.icon} ${info.name}</h2>
                    <p class="info-card-function">"${info.function}"</p>
                    <div class="info-card-divider"></div>
                    <p class="info-card-desc">${info.description}</p>
                    ${factsHTML}
                </div>
            </div>
            <button class="close-info-btn" id="close-info-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Clear Selection
            </button>
        `;

        this._bindCloseBtn();
    }

    clearInfo() {
        this.infoContent.className = 'info-content empty-state';
        this.infoContent.innerHTML = `
            <div class="empty-hero">
                <div class="empty-icon-ring">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>
                </div>
                <h2>Explore the Cell</h2>
                <p>Click on any organelle in the 3D viewer to discover its structure and function.</p>
            </div>
            <div class="controls-hint">
                <div class="hint-row"><kbd>🖱️ Left Drag</kbd> <span>Rotate</span></div>
                <div class="hint-row"><kbd>🖱️ Right Drag</kbd> <span>Pan</span></div>
                <div class="hint-row"><kbd>🖱️ Scroll</kbd> <span>Zoom</span></div>
            </div>
            <div class="organelle-list" id="organelle-list">
                <h4>Organelles</h4>
            </div>
        `;

        // Re-bind organelle list ref
        this.organelleList = document.getElementById('organelle-list');
        this.populateOrganelleList(this.currentType);
    }

    _bindCloseBtn() {
        const btn = document.getElementById('close-info-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                this.clearInfo();
                // Dispatch custom event for deselect
                window.dispatchEvent(new CustomEvent('cell-deselect'));
            });
        }
    }

    // ─── Hover Tooltip ─── //

    showTooltip(key, event) {
        const data = this.getCurrentData();
        const info = data[key];
        const label = info ? `${info.icon} ${info.name}` : key;

        this.hoverTooltip.textContent = label;
        this.hoverTooltip.classList.add('visible');

        // Position near cursor
        const rect = this.hoverTooltip.parentElement.getBoundingClientRect();
        const x = event.clientX - rect.left + 16;
        const y = event.clientY - rect.top - 10;
        this.hoverTooltip.style.left = `${x}px`;
        this.hoverTooltip.style.top = `${y}px`;
    }

    hideTooltip() {
        this.hoverTooltip.classList.remove('visible');
    }

    // ─── Auto-Rotate Toggle ─── //

    setAutoRotateState(active) {
        if (active) {
            this.btnAutoRotate.classList.add('active');
        } else {
            this.btnAutoRotate.classList.remove('active');
        }
    }
}
