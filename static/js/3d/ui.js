// src/static/js/3d/ui.js
/**
 * Handles DOM manipulation, Panel updates, and Buttons logic 
 * detached from Three.js renderer.
 */
class UIManager {
    constructor() {
        this.infoContent = document.getElementById("info-content");
        this.loaderPanel = document.getElementById("loading-overlay");
        this.btnAnimal = document.getElementById("btn-animal");
        this.btnPlant = document.getElementById("btn-plant");
    }

    setLoading(isLoading) {
        if(isLoading) {
            this.loaderPanel.classList.remove('hidden');
        } else {
            this.loaderPanel.classList.add('hidden');
        }
    }

    switchToggle(toType) {
        if (toType === 'plant') {
            this.btnPlant.classList.add('active');
            this.btnAnimal.classList.remove('active');
        } else {
            this.btnAnimal.classList.add('active');
            this.btnPlant.classList.remove('active');
        }
        this.clearInfo(); // Reset panel on switch
    }

    updateInfo(meshName, biologyDataMap) {
        // Fallback string manipulation to match data.js keys
        const nameLower = meshName.toLowerCase();
        let matchedData = null;

        // Try direct match or partial match
        for (const [key, data] of Object.entries(biologyDataMap)) {
            if (nameLower.includes(key)) {
                matchedData = data;
                break;
            }
        }

        if (matchedData) {
            this.infoContent.className = "info-content";
            this.infoContent.innerHTML = `
                <div class="info-header">
                    <h2 class="info-title">${matchedData.name}</h2>
                    <h3 class="info-function">"${matchedData.function}"</h3>
                </div>
                <p class="info-desc">${matchedData.description}</p>
                <div class="controls-hint" style="margin-top:auto; font-size:0.8rem">
                    Selected Model: <strong>${meshName}</strong>
                </div>
            `;
        } else {
            // Render basic info if not mapped in data.js
            this.infoContent.className = "info-content";
            this.infoContent.innerHTML = `
                <div class="info-header">
                    <h2 class="info-title">${meshName}</h2>
                    <h3 class="info-function">"Cell component"</h3>
                </div>
                <p class="info-desc">An internal structure of the cell.</p>
            `;
        }
    }

    clearInfo() {
        this.infoContent.className = "info-content empty";
        this.infoContent.innerHTML = `
            <div class="placeholder-icon">👆</div>
            <h2>Explore the Cell</h2>
            <p>Click on any organelle in the 3D viewer to learn more about its structure and function.</p>
        `;
    }
}

window.UIManager = UIManager;