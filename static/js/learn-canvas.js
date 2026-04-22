/* ============================================================
   LEARN-CANVAS.JS — Canvas API Simulations for EduVerse
   Contains: Graph plotter, Coin toss, Motion sim, Force sim,
             Statistics chart, Reaction animation, Tissue diagrams
   ============================================================ */

// Utility: get DPI-aware canvas context
function setupCanvas(canvasId, minHeight) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const parent = canvas.parentElement;
    const w = parent.clientWidth || 600;
    const h = minHeight || parent.clientHeight || 350;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    return { ctx, w, h, canvas };
}

// Theme-aware colors
function getCanvasColors() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return {
        bg: isDark ? '#0d0d15' : '#f0f0f8',
        grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        axis: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
        text: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
        accent: '#6c5ce7',
        teal: '#00cec9',
        pink: '#fd79a8',
        green: '#00b894',
        yellow: '#fdcb6e',
        red: '#ff6b6b',
        blue: '#74b9ff',
    };
}


// ══════════════════════════════════════════════════════
// 1. LINEAR EQUATIONS — GRAPH PLOTTER
// ══════════════════════════════════════════════════════

let linearGraphRAF;

function initLinearGraph() {
    drawLinearGraph();
    
    const slopeSlider = document.getElementById('slopeSlider');
    const interceptSlider = document.getElementById('interceptSlider');
    
    if (slopeSlider) {
        slopeSlider.addEventListener('input', drawLinearGraph);
    }
    if (interceptSlider) {
        interceptSlider.addEventListener('input', drawLinearGraph);
    }
}

function drawLinearGraph() {
    const setup = setupCanvas('linearGraphCanvas', 350);
    if (!setup) return;
    const { ctx, w, h } = setup;
    const colors = getCanvasColors();

    const m = parseFloat(document.getElementById('slopeSlider')?.value || 1);
    const b = parseFloat(document.getElementById('interceptSlider')?.value || 0);

    // Update displays
    const slopeVal = document.getElementById('slopeValue');
    const interceptVal = document.getElementById('interceptValue');
    const formulaEl = document.getElementById('linearFormula');
    
    if (slopeVal) slopeVal.textContent = m.toFixed(1);
    if (interceptVal) interceptVal.textContent = b.toFixed(1);
    if (formulaEl) formulaEl.textContent = `y = ${m.toFixed(1)}x + ${b.toFixed(1)}`;

    // Clear
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;
    const scale = 30; // pixels per unit
    const rangeX = Math.ceil(w / (2 * scale));
    const rangeY = Math.ceil(h / (2 * scale));

    // Grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let x = -rangeX; x <= rangeX; x++) {
        ctx.beginPath();
        ctx.moveTo(cx + x * scale, 0);
        ctx.lineTo(cx + x * scale, h);
        ctx.stroke();
    }
    for (let y = -rangeY; y <= rangeY; y++) {
        ctx.beginPath();
        ctx.moveTo(0, cy + y * scale);
        ctx.lineTo(w, cy + y * scale);
        ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = colors.text;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    for (let x = -rangeX; x <= rangeX; x++) {
        if (x === 0) continue;
        ctx.fillText(x, cx + x * scale, cy + 15);
    }
    ctx.textAlign = 'right';
    for (let y = -rangeY; y <= rangeY; y++) {
        if (y === 0) continue;
        ctx.fillText(-y, cx - 5, cy + y * scale + 4);
    }

    // Plot line: y = mx + b
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    
    for (let px = 0; px < w; px++) {
        const x = (px - cx) / scale;
        const y = m * x + b;
        const py = cy - y * scale;
        
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Mark y-intercept
    const yIntPx = cy - b * scale;
    ctx.fillStyle = colors.teal;
    ctx.beginPath();
    ctx.arc(cx, yIntPx, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'left';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(`(0, ${b.toFixed(1)})`, cx + 10, yIntPx - 8);

    // Label
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`y = ${m.toFixed(1)}x + ${b.toFixed(1)}`, 15, 25);

    trackProgress('linear-equations', 'explored');
}


// ══════════════════════════════════════════════════════
// 2. PROBABILITY — COIN TOSS
// ══════════════════════════════════════════════════════

let heads = 0, tails = 0, isFlipping = false;

function tossCoin() {
    if (isFlipping) return;
    isFlipping = true;

    const coin = document.getElementById('theCoin');
    coin.classList.add('flipping');

    setTimeout(() => {
        const result = Math.random() < 0.5 ? 'H' : 'T';
        if (result === 'H') heads++;
        else tails++;

        coin.textContent = result;
        coin.style.background = result === 'H' 
            ? 'linear-gradient(135deg, #ffd700, #ffaa00)' 
            : 'linear-gradient(135deg, #c0c0c0, #a0a0a0)';
        coin.style.color = result === 'H' ? '#5a3e00' : '#333';
        coin.classList.remove('flipping');

        updateCoinDisplay();
        drawCoinChart();
        isFlipping = false;
    }, 600);

    trackProgress('probability', 'experimented');
}

function tossMultiple(n) {
    for (let i = 0; i < n; i++) {
        const result = Math.random() < 0.5 ? 'H' : 'T';
        if (result === 'H') heads++;
        else tails++;
    }
    updateCoinDisplay();
    drawCoinChart();
    
    const coin = document.getElementById('theCoin');
    coin.textContent = Math.random() < 0.5 ? 'H' : 'T';
}

function updateCoinDisplay() {
    document.getElementById('headsCount').textContent = heads;
    document.getElementById('tailsCount').textContent = tails;
    document.getElementById('totalTosses').textContent = heads + tails;
}

function resetCoinToss() {
    heads = 0;
    tails = 0;
    updateCoinDisplay();
    drawCoinChart();
    document.getElementById('theCoin').textContent = 'H';
    document.getElementById('theCoin').style.background = 'linear-gradient(135deg, #ffd700, #ffaa00)';
    document.getElementById('theCoin').style.color = '#5a3e00';
}

function drawCoinChart() {
    const setup = setupCanvas('coinChartCanvas', 250);
    if (!setup) return;
    const { ctx, w, h } = setup;
    const colors = getCanvasColors();

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    const total = heads + tails;
    if (total === 0) {
        ctx.fillStyle = colors.text;
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Toss some coins to see the chart!', w / 2, h / 2);
        return;
    }

    const barWidth = 80;
    const maxBarH = h - 80;
    const gap = 60;

    const hPct = heads / total;
    const tPct = tails / total;

    // Heads bar
    const hBarH = hPct * maxBarH;
    const hx = w / 2 - gap - barWidth / 2;
    
    const hGrad = ctx.createLinearGradient(hx, h - 40, hx, h - 40 - hBarH);
    hGrad.addColorStop(0, colors.green);
    hGrad.addColorStop(1, '#55efc4');
    ctx.fillStyle = hGrad;
    ctx.beginPath();
    ctx.roundRect(hx, h - 40 - hBarH, barWidth, hBarH, [8, 8, 0, 0]);
    ctx.fill();

    // Tails bar
    const tBarH = tPct * maxBarH;
    const tx = w / 2 + gap - barWidth / 2;
    
    const tGrad = ctx.createLinearGradient(tx, h - 40, tx, h - 40 - tBarH);
    tGrad.addColorStop(0, colors.accent);
    tGrad.addColorStop(1, '#a29bfe');
    ctx.fillStyle = tGrad;
    ctx.beginPath();
    ctx.roundRect(tx, h - 40 - tBarH, barWidth, tBarH, [8, 8, 0, 0]);
    ctx.fill();

    // Labels
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Heads', hx + barWidth / 2, h - 20);
    ctx.fillText('Tails', tx + barWidth / 2, h - 20);

    // Percentages
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillStyle = colors.green;
    ctx.fillText(`${(hPct * 100).toFixed(1)}%`, hx + barWidth / 2, h - 50 - hBarH);
    ctx.fillStyle = colors.accent;
    ctx.fillText(`${(tPct * 100).toFixed(1)}%`, tx + barWidth / 2, h - 50 - tBarH);

    // 50% reference line
    ctx.strokeStyle = colors.yellow;
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    const refY = h - 40 - (0.5 * maxBarH);
    ctx.beginPath();
    ctx.moveTo(w / 2 - 120, refY);
    ctx.lineTo(w / 2 + 120, refY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = colors.yellow;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('50% (expected)', w / 2 + 120, refY - 5);
}


// ══════════════════════════════════════════════════════
// 3. MOTION SIMULATION
// ══════════════════════════════════════════════════════

let motionPlaying = false, motionRAF;
let motionTime = 0, motionPos = 0, motionCurrentVel = 0;
let motionTrail = [];

function initMotion() {
    drawMotionScene();
    
    document.getElementById('velocitySlider')?.addEventListener('input', () => {
        document.getElementById('velocityValue').textContent = 
            parseFloat(document.getElementById('velocitySlider').value).toFixed(1) + ' m/s';
    });
    document.getElementById('accelSlider')?.addEventListener('input', () => {
        document.getElementById('accelValue').textContent = 
            parseFloat(document.getElementById('accelSlider').value).toFixed(1) + ' m/s²';
    });
}

function drawMotionScene() {
    const setup = setupCanvas('motionCanvas', 350);
    if (!setup) return;
    const { ctx, w, h } = setup;
    const colors = getCanvasColors();

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    // Ground
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(0, h - 80, w, 80);
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h - 80);
    ctx.lineTo(w, h - 80);
    ctx.stroke();

    // Distance markers
    ctx.fillStyle = colors.text;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 10; i++) {
        const x = 40 + (i / 10) * (w - 80);
        ctx.beginPath();
        ctx.moveTo(x, h - 80);
        ctx.lineTo(x, h - 72);
        ctx.strokeStyle = colors.grid;
        ctx.stroke();
        ctx.fillText(`${i * 10}m`, x, h - 60);
    }

    // Trail
    if (motionTrail.length > 1) {
        ctx.strokeStyle = colors.teal;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        motionTrail.forEach((p, i) => {
            const px = 40 + (p / 100) * (w - 80);
            const py = h - 110;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Object (car-like box)
    const objX = 40 + (motionPos / 100) * (w - 80);
    const objY = h - 110;
    const objW = 40;
    const objH = 25;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(objX, h - 80, 25, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const bodyGrad = ctx.createLinearGradient(objX - objW/2, objY - objH, objX - objW/2, objY);
    bodyGrad.addColorStop(0, colors.accent);
    bodyGrad.addColorStop(1, '#4834d4');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(objX - objW/2, objY - objH, objW, objH, 4);
    ctx.fill();

    // Windshield
    ctx.fillStyle = 'rgba(116, 185, 255, 0.4)';
    ctx.beginPath();
    ctx.roundRect(objX + 5, objY - objH + 3, 12, objH - 10, 2);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(objX - 12, objY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(objX + 12, objY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Velocity arrow
    if (motionCurrentVel > 0.5) {
        const arrowLen = Math.min(motionCurrentVel * 10, 80);
        ctx.strokeStyle = colors.green;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(objX + objW/2 + 5, objY - objH/2);
        ctx.lineTo(objX + objW/2 + 5 + arrowLen, objY - objH/2);
        ctx.stroke();
        // Arrow head
        ctx.fillStyle = colors.green;
        ctx.beginPath();
        ctx.moveTo(objX + objW/2 + 5 + arrowLen, objY - objH/2);
        ctx.lineTo(objX + objW/2 + arrowLen - 3, objY - objH/2 - 5);
        ctx.lineTo(objX + objW/2 + arrowLen - 3, objY - objH/2 + 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = colors.green;
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`v = ${motionCurrentVel.toFixed(1)} m/s`, objX + objW/2 + 8, objY - objH/2 - 10);
    }

    // Info
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Motion Simulation — s = ut + ½at²', 15, 25);
}

function toggleMotion() {
    motionPlaying = !motionPlaying;
    document.getElementById('motionPlayBtn').textContent = motionPlaying ? '⏸ Pause' : '▶ Play';
    
    if (motionPlaying) {
        const u = parseFloat(document.getElementById('velocitySlider').value);
        motionCurrentVel = u;
        motionLoop();
    } else {
        cancelAnimationFrame(motionRAF);
    }
}

function motionLoop() {
    if (!motionPlaying) return;
    
    const u = parseFloat(document.getElementById('velocitySlider').value);
    const a = parseFloat(document.getElementById('accelSlider').value);
    
    motionTime += 0.016;
    motionCurrentVel = u + a * motionTime;
    if (motionCurrentVel < 0) motionCurrentVel = 0;
    motionPos = u * motionTime + 0.5 * a * motionTime * motionTime;

    if (motionPos > 100) motionPos = 100;
    if (motionPos < 0) motionPos = 0;

    motionTrail.push(motionPos);
    if (motionTrail.length > 200) motionTrail = motionTrail.slice(-200);

    document.getElementById('motionTime').textContent = motionTime.toFixed(1);
    document.getElementById('motionDist').textContent = motionPos.toFixed(1);
    document.getElementById('motionVel').textContent = motionCurrentVel.toFixed(1);

    drawMotionScene();

    if (motionPos >= 100 || (motionCurrentVel <= 0 && a <= 0)) {
        motionPlaying = false;
        document.getElementById('motionPlayBtn').textContent = '▶ Play';
        return;
    }

    motionRAF = requestAnimationFrame(motionLoop);
}

function resetMotion() {
    motionPlaying = false;
    cancelAnimationFrame(motionRAF);
    motionTime = 0;
    motionPos = 0;
    motionCurrentVel = parseFloat(document.getElementById('velocitySlider')?.value || 2);
    motionTrail = [];
    document.getElementById('motionPlayBtn').textContent = '▶ Play';
    document.getElementById('motionTime').textContent = '0.0';
    document.getElementById('motionDist').textContent = '0.0';
    document.getElementById('motionVel').textContent = motionCurrentVel.toFixed(1);
    drawMotionScene();
}


// ══════════════════════════════════════════════════════
// 4. FORCE SIMULATION (F = ma)
// ══════════════════════════════════════════════════════

let forcePlaying = false, forceRAF;
let forceTime = 0, forcePos = 0, forceVel = 0;

function initForce() {
    drawForceScene();
    updateForceFormula();

    document.getElementById('forceSlider')?.addEventListener('input', () => {
        document.getElementById('forceValue').textContent = document.getElementById('forceSlider').value + ' N';
        updateForceFormula();
    });
    document.getElementById('massSlider')?.addEventListener('input', () => {
        document.getElementById('massValue').textContent = document.getElementById('massSlider').value + ' kg';
        updateForceFormula();
    });
}

function updateForceFormula() {
    const F = parseFloat(document.getElementById('forceSlider')?.value || 10);
    const m = parseFloat(document.getElementById('massSlider')?.value || 5);
    const a = F / m;
    document.getElementById('forceFormula').textContent = `F = ${m} × a → a = ${a.toFixed(2)} m/s²`;
}

function drawForceScene() {
    const setup = setupCanvas('forceCanvas', 350);
    if (!setup) return;
    const { ctx, w, h } = setup;
    const colors = getCanvasColors();

    const F = parseFloat(document.getElementById('forceSlider')?.value || 10);
    const m = parseFloat(document.getElementById('massSlider')?.value || 5);

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    // Floor
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(0, h - 60, w, 60);
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h - 60);
    ctx.lineTo(w, h - 60);
    ctx.stroke();

    // Box
    const boxSize = 30 + m * 3; // size proportional to mass
    const boxX = 40 + (forcePos / 100) * (w - 80 - boxSize);
    const boxY = h - 60 - boxSize;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(boxX + boxSize/2, h - 60, boxSize/2 + 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Box gradient
    const boxGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxSize, boxY + boxSize);
    boxGrad.addColorStop(0, colors.pink);
    boxGrad.addColorStop(1, '#e84393');
    ctx.fillStyle = boxGrad;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxSize, boxSize, 4);
    ctx.fill();

    // Mass label on box
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${m}kg`, boxX + boxSize/2, boxY + boxSize/2 + 5);

    // Force arrow
    if (F > 0) {
        const arrowLen = F * 2;
        ctx.strokeStyle = colors.green;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(boxX - 10, boxY + boxSize/2);
        ctx.lineTo(boxX - 10 - arrowLen, boxY + boxSize/2);
        ctx.stroke();

        // Arrow head at box
        ctx.fillStyle = colors.green;
        ctx.beginPath();
        ctx.moveTo(boxX - 5, boxY + boxSize/2);
        ctx.lineTo(boxX - 15, boxY + boxSize/2 - 8);
        ctx.lineTo(boxX - 15, boxY + boxSize/2 + 8);
        ctx.closePath();
        ctx.fill();

        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`F = ${F}N`, boxX - 10 - arrowLen/2, boxY + boxSize/2 - 15);
    }

    // Info
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Force Simulation — F = m × a', 15, 25);
    
    ctx.fillStyle = colors.text;
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(`Acceleration = ${(F/m).toFixed(2)} m/s²  |  Velocity = ${forceVel.toFixed(1)} m/s`, 15, 45);
}

function toggleForce() {
    forcePlaying = !forcePlaying;
    document.getElementById('forcePlayBtn').textContent = forcePlaying ? '⏸ Stop' : '▶ Apply Force';
    
    if (forcePlaying) forceLoop();
    else cancelAnimationFrame(forceRAF);
}

function forceLoop() {
    if (!forcePlaying) return;
    
    const F = parseFloat(document.getElementById('forceSlider').value);
    const m = parseFloat(document.getElementById('massSlider').value);
    const a = F / m;
    
    forceTime += 0.016;
    forceVel += a * 0.016;
    forcePos += forceVel * 0.3;

    if (forcePos > 100) {
        forcePos = 0; // wrap around
        forceVel = 0;
    }

    drawForceScene();
    forceRAF = requestAnimationFrame(forceLoop);

    trackProgress('force', 'experimented');
}

function resetForce() {
    forcePlaying = false;
    cancelAnimationFrame(forceRAF);
    forceTime = 0;
    forcePos = 0;
    forceVel = 0;
    document.getElementById('forcePlayBtn').textContent = '▶ Apply Force';
    drawForceScene();
}


// ══════════════════════════════════════════════════════
// 5. STATISTICS — INTERACTIVE CHART
// ══════════════════════════════════════════════════════

let statsData = [25, 40, 55, 30, 65, 45, 35];
let statsLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function initStats() {
    drawStatsChart();
    updateStatsCalculations();
}

function randomizeStats() {
    statsData = statsData.map(() => Math.floor(Math.random() * 90) + 10);
    drawStatsChart();
    updateStatsCalculations();
    trackProgress('statistics', 'experimented');
}

function addStatBar() {
    if (statsData.length >= 12) return;
    statsData.push(Math.floor(Math.random() * 90) + 10);
    statsLabels.push('D' + statsData.length);
    drawStatsChart();
    updateStatsCalculations();
}

function removeStatBar() {
    if (statsData.length <= 3) return;
    statsData.pop();
    statsLabels.pop();
    drawStatsChart();
    updateStatsCalculations();
}

function updateStatsCalculations() {
    const sorted = [...statsData].sort((a, b) => a - b);
    const mean = statsData.reduce((s, v) => s + v, 0) / statsData.length;
    
    let median;
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) median = (sorted[mid - 1] + sorted[mid]) / 2;
    else median = sorted[mid];

    // Mode
    const freq = {};
    statsData.forEach(v => freq[v] = (freq[v] || 0) + 1);
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.keys(freq).filter(k => freq[k] === maxFreq);
    const mode = maxFreq === 1 ? 'None' : modes.join(', ');

    const range = Math.max(...statsData) - Math.min(...statsData);

    document.getElementById('statMean').textContent = mean.toFixed(1);
    document.getElementById('statMedian').textContent = median.toFixed(1);
    document.getElementById('statMode').textContent = mode;
    document.getElementById('statRange').textContent = range;
}

function drawStatsChart() {
    const setup = setupCanvas('statsCanvas', 350);
    if (!setup) return;
    const { ctx, w, h } = setup;
    const colors = getCanvasColors();

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    const padding = { top: 40, bottom: 50, left: 50, right: 30 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const maxVal = Math.max(...statsData) * 1.2;
    const barGap = 8;
    const barW = (chartW - barGap * (statsData.length + 1)) / statsData.length;

    // Y-axis lines
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.fillStyle = colors.text;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (i / 5) * chartH;
        const val = Math.round(maxVal * (1 - i / 5));
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();
        ctx.fillText(val, padding.left - 8, y + 4);
    }

    // Bars
    const barColors = [colors.accent, colors.teal, colors.pink, colors.green, colors.yellow, colors.blue, colors.red];
    
    statsData.forEach((val, i) => {
        const x = padding.left + barGap + i * (barW + barGap);
        const barH = (val / maxVal) * chartH;
        const y = padding.top + chartH - barH;

        const grad = ctx.createLinearGradient(x, y + barH, x, y);
        const color = barColors[i % barColors.length];
        grad.addColorStop(0, color);
        grad.addColorStop(1, color + '88');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
        ctx.fill();

        // Value on top
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(val, x + barW / 2, y - 8);

        // Label below
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(statsLabels[i] || `D${i + 1}`, x + barW / 2, h - padding.bottom + 18);
    });

    // Mean line
    const mean = statsData.reduce((s, v) => s + v, 0) / statsData.length;
    const meanY = padding.top + chartH - (mean / maxVal) * chartH;
    ctx.strokeStyle = colors.yellow;
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, meanY);
    ctx.lineTo(w - padding.right, meanY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = colors.yellow;
    ctx.textAlign = 'left';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText(`Mean: ${mean.toFixed(1)}`, w - padding.right - 80, meanY - 5);

    // Title
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Student Scores', 15, 20);
}


// ══════════════════════════════════════════════════════
// 6. CHEMICAL REACTIONS — ANIMATION
// ══════════════════════════════════════════════════════

let reactionPlaying = false, reactionRAF, reactionProgress = 0;
let currentReaction = 'combustion';

const reactionData = {
    combustion: {
        name: '🔥 Combustion of Methane',
        formula: 'CH₄ + 2O₂ → CO₂ + 2H₂O + Energy',
        desc: 'Methane (natural gas) reacts with oxygen to produce carbon dioxide, water, and energy. This is an exothermic reaction used in gas stoves and heaters.',
        reactants: [
            { label: 'CH₄', color: '#55efc4', x: 0.2, y: 0.5 },
            { label: 'O₂', color: '#74b9ff', x: 0.6, y: 0.3 },
            { label: 'O₂', color: '#74b9ff', x: 0.6, y: 0.7 },
        ],
        products: [
            { label: 'CO₂', color: '#636e72', x: 0.5, y: 0.4 },
            { label: 'H₂O', color: '#74b9ff', x: 0.5, y: 0.65 },
        ],
        energyColor: '#fdcb6e',
    },
    water: {
        name: '💧 Formation of Water',
        formula: '2H₂ + O₂ → 2H₂O',
        desc: 'Two molecules of hydrogen gas react with one molecule of oxygen gas to form two molecules of water. This is a synthesis reaction.',
        reactants: [
            { label: 'H₂', color: '#ff6b6b', x: 0.15, y: 0.4 },
            { label: 'H₂', color: '#ff6b6b', x: 0.15, y: 0.6 },
            { label: 'O₂', color: '#74b9ff', x: 0.7, y: 0.5 },
        ],
        products: [
            { label: 'H₂O', color: '#00cec9', x: 0.45, y: 0.4 },
            { label: 'H₂O', color: '#00cec9', x: 0.45, y: 0.6 },
        ],
        energyColor: '#55efc4',
    },
    rust: {
        name: '🟤 Rusting of Iron',
        formula: '4Fe + 3O₂ → 2Fe₂O₃',
        desc: 'Iron reacts with oxygen and moisture in air to form iron oxide (rust). This is a slow oxidation reaction — it takes days or weeks in real life!',
        reactants: [
            { label: 'Fe', color: '#b0b0b0', x: 0.2, y: 0.4 },
            { label: 'Fe', color: '#b0b0b0', x: 0.2, y: 0.6 },
            { label: 'O₂', color: '#74b9ff', x: 0.65, y: 0.5 },
        ],
        products: [
            { label: 'Fe₂O₃', color: '#d35400', x: 0.45, y: 0.5 },
        ],
        energyColor: '#e17055',
    }
};

function selectReaction(type) {
    currentReaction = type;
    reactionProgress = 0;
    reactionPlaying = false;
    document.getElementById('reactionPlayBtn').textContent = '▶ Play Reaction';
    
    const data = reactionData[type];
    document.getElementById('reactionInfo').querySelector('h3').textContent = data.name;
    document.getElementById('reactionFormula').innerHTML = data.formula;
    document.getElementById('reactionDesc').textContent = data.desc;
    
    drawReaction();
}

function drawReaction() {
    const setup = setupCanvas('reactionCanvas', 350);
    if (!setup) return;
    const { ctx, w, h } = setup;
    const colors = getCanvasColors();
    const data = reactionData[currentReaction];

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    const progress = reactionProgress; // 0 to 1

    // Draw arrow
    const arrowY = h / 2;
    ctx.strokeStyle = colors.text;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(w * 0.35, arrowY);
    ctx.lineTo(w * 0.65, arrowY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrow head
    ctx.fillStyle = colors.text;
    ctx.beginPath();
    ctx.moveTo(w * 0.65, arrowY);
    ctx.lineTo(w * 0.63, arrowY - 6);
    ctx.lineTo(w * 0.63, arrowY + 6);
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.fillStyle = colors.text;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(progress < 0.5 ? 'Reactants' : 'Reacting...', w * 0.2, 30);
    ctx.fillText(progress > 0.5 ? 'Products' : 'Products', w * 0.8, 30);

    // Draw reactants (fade out as progress increases)
    data.reactants.forEach(r => {
        const opacity = Math.max(0, 1 - progress * 2);
        const x = r.x * w - progress * w * 0.15;
        const y = r.y * h;
        
        drawMolecule(ctx, x, y, r.label, r.color, opacity, 20 + Math.sin(Date.now() * 0.003) * 3);
    });

    // Collision flash at progress ~0.5
    if (progress > 0.35 && progress < 0.65) {
        const flashIntensity = 1 - Math.abs(progress - 0.5) * 4;
        ctx.fillStyle = `rgba(255, 200, 50, ${flashIntensity * 0.3})`;
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.5, 50 + flashIntensity * 30, 0, Math.PI * 2);
        ctx.fill();

        // Sparks
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Date.now() * 0.005;
            const dist = 30 + flashIntensity * 40;
            ctx.fillStyle = data.energyColor;
            ctx.beginPath();
            ctx.arc(
                w * 0.5 + Math.cos(angle) * dist,
                h * 0.5 + Math.sin(angle) * dist,
                3, 0, Math.PI * 2
            );
            ctx.fill();
        }
    }

    // Draw products (fade in)
    data.products.forEach(p => {
        const opacity = Math.max(0, (progress - 0.5) * 2);
        const x = p.x * w + (1 - progress) * w * 0.15 + w * 0.3;
        const y = p.y * h;
        
        drawMolecule(ctx, x, y, p.label, p.color, opacity, 22);
    });

    // Formula at bottom
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(data.formula, w / 2, h - 20);
}

function drawMolecule(ctx, x, y, label, color, opacity, radius) {
    if (opacity <= 0) return;
    
    ctx.globalAlpha = opacity;
    
    // Glow
    ctx.fillStyle = color + '33';
    ctx.beginPath();
    ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Main circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Label
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
    ctx.textBaseline = 'alphabetic';
    
    ctx.globalAlpha = 1;
}

function playReactionAnim() {
    if (reactionPlaying) {
        reactionPlaying = false;
        cancelAnimationFrame(reactionRAF);
        document.getElementById('reactionPlayBtn').textContent = '▶ Play Reaction';
        return;
    }

    reactionPlaying = true;
    reactionProgress = 0;
    document.getElementById('reactionPlayBtn').textContent = '⏸ Pause';
    
    function animLoop() {
        if (!reactionPlaying) return;
        reactionProgress += 0.005;
        if (reactionProgress >= 1) {
            reactionProgress = 1;
            reactionPlaying = false;
            document.getElementById('reactionPlayBtn').textContent = '▶ Play Again';
        }
        drawReaction();
        if (reactionPlaying) reactionRAF = requestAnimationFrame(animLoop);
    }
    animLoop();

    trackProgress('reactions', 'experimented');
}

function resetReactionAnim() {
    reactionPlaying = false;
    cancelAnimationFrame(reactionRAF);
    reactionProgress = 0;
    document.getElementById('reactionPlayBtn').textContent = '▶ Play Reaction';
    drawReaction();
}


// ══════════════════════════════════════════════════════
// 7. TISSUE DIAGRAMS
// ══════════════════════════════════════════════════════

let currentTissue = 'epithelial';

const tissueData = {
    epithelial: {
        name: '🧱 Epithelial Tissue',
        desc: 'Epithelial tissue forms a protective covering over body surfaces and lines organs. Cells are tightly packed with minimal intercellular space. Found in skin, lining of mouth, blood vessels, and lung alveoli.',
        funcs: ['Protection from injury & dehydration', 'Absorption (intestines)', 'Secretion (glands)'],
    },
    connective: {
        name: '🩸 Connective Tissue',
        desc: 'Connective tissue binds, supports, and protects body parts. It has cells spread in a matrix (solid, liquid, or gel). Blood, bone, cartilage, tendons, and fat are all connective tissues.',
        funcs: ['Binding organs together', 'Providing structural support', 'Transporting substances (blood)'],
    },
    muscular: {
        name: '💪 Muscular Tissue',
        desc: 'Muscular tissue is responsible for movement. It contains special proteins (actin & myosin) that allow contraction. Three types: skeletal (voluntary), smooth (involuntary), cardiac (heart).',
        funcs: ['Voluntary body movement', 'Digestion (smooth muscle)', 'Heart beating (cardiac muscle)'],
    },
    nervous: {
        name: '🧠 Nervous Tissue',
        desc: 'Nervous tissue is made of neurons (nerve cells) that transmit electrical impulses. Found in the brain, spinal cord, and nerves. Neurons have dendrites (receive signals) and axons (send signals).',
        funcs: ['Transmitting nerve impulses', 'Processing information (brain)', 'Coordinating body functions'],
    }
};

function showTissue(type) {
    currentTissue = type;
    const data = tissueData[type];

    document.getElementById('tissueDiagramTitle').textContent = data.name;
    document.getElementById('tissueDetailTitle').textContent = data.name;
    document.getElementById('tissueDetailDesc').textContent = data.desc;
    document.getElementById('tissueFunc1').textContent = data.funcs[0];
    document.getElementById('tissueFunc2').textContent = data.funcs[1];
    document.getElementById('tissueFunc3').textContent = data.funcs[2];

    // Update active state
    document.querySelectorAll('.tissue-item').forEach(item => item.classList.remove('active'));
    const items = document.querySelectorAll('.tissue-item');
    const idx = ['epithelial', 'connective', 'muscular', 'nervous'].indexOf(type);
    if (items[idx]) items[idx].classList.add('active');

    drawTissue();
    trackProgress('tissues', 'explored');
}

function drawTissue() {
    const setup = setupCanvas('tissueCanvas', 300);
    if (!setup) return;
    const { ctx, w, h } = setup;
    const colors = getCanvasColors();

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    switch(currentTissue) {
        case 'epithelial': drawEpithelialTissue(ctx, w, h, colors); break;
        case 'connective': drawConnectiveTissue(ctx, w, h, colors); break;
        case 'muscular': drawMuscularTissue(ctx, w, h, colors); break;
        case 'nervous': drawNervousTissue(ctx, w, h, colors); break;
    }
}

function drawEpithelialTissue(ctx, w, h, colors) {
    const cellW = 35, cellH = 30;
    const startX = w / 2 - 4 * cellW;
    const startY = h / 2 - 2 * cellH;

    // Basement membrane
    ctx.fillStyle = colors.yellow + '33';
    ctx.fillRect(startX - 10, startY + 4 * cellH, 8 * cellW + 20, 15);
    ctx.fillStyle = colors.yellow;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Basement Membrane', w / 2, startY + 4 * cellH + 30);

    // Stacked cells (tightly packed)
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 8; col++) {
            const x = startX + col * cellW + (row % 2 ? cellW / 2 : 0);
            const y = startY + row * cellH;

            // Cell body
            ctx.fillStyle = row < 2 ? 'rgba(108, 92, 231, 0.25)' : 'rgba(108, 92, 231, 0.15)';
            ctx.strokeStyle = colors.accent + '66';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x + 1, y + 1, cellW - 2, cellH - 2, 3);
            ctx.fill();
            ctx.stroke();

            // Nucleus
            ctx.fillStyle = '#6c5ce7';
            ctx.beginPath();
            ctx.arc(x + cellW / 2, y + cellH / 2, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Title
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Epithelial Tissue — Tightly Packed Cells', w / 2, 25);

    // Labels
    ctx.fillStyle = colors.green;
    ctx.font = '10px Inter, sans-serif';
    drawLabelLine(ctx, startX - 30, startY + cellH, startX + 5, startY + cellH, 'Cell', 'right');
    drawLabelLine(ctx, startX + 8 * cellW + 30, startY + cellH, startX + 8 * cellW - 5, startY + cellH, 'Nucleus', 'left');
}

function drawConnectiveTissue(ctx, w, h, colors) {
    // Matrix background
    ctx.fillStyle = 'rgba(253, 203, 110, 0.08)';
    ctx.beginPath();
    ctx.roundRect(w * 0.1, h * 0.1, w * 0.8, h * 0.7, 10);
    ctx.fill();

    // Scattered cells (widely spaced)
    const cells = [
        { x: w*0.25, y: h*0.3, label: 'Fibroblast' },
        { x: w*0.55, y: h*0.45, label: 'Mast Cell' },
        { x: w*0.75, y: h*0.3, label: 'Macrophage' },
        { x: w*0.35, y: h*0.6, label: 'Fat Cell' },
        { x: w*0.65, y: h*0.65, label: 'White Blood Cell' },
    ];

    // Fibers (collagen)
    ctx.strokeStyle = colors.pink + '44';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
        const sx = w * 0.15 + Math.random() * w * 0.7;
        const sy = h * 0.15 + Math.random() * h * 0.5;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(sx + 40, sy + (Math.random() - 0.5) * 50, sx + 80, sy + (Math.random() - 0.5) * 30);
        ctx.stroke();
    }

    // Draw cells
    cells.forEach(cell => {
        ctx.fillStyle = colors.teal + '55';
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.teal;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#00867f';
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = colors.text;
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cell.label, cell.x, cell.y + 25);
    });

    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Connective Tissue — Cells in Matrix', w / 2, 25);

    ctx.fillStyle = colors.yellow;
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Matrix (gel-like substance with fibers)', w / 2, h - 15);
}

function drawMuscularTissue(ctx, w, h, colors) {
    const centerY = h / 2;
    const fiberCount = 8;
    const fiberH = 20;
    const startY = centerY - (fiberCount * fiberH) / 2;

    for (let i = 0; i < fiberCount; i++) {
        const y = startY + i * fiberH;
        
        // Fiber
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 107, 107, 0.12)';
        ctx.fillRect(w * 0.15, y + 2, w * 0.7, fiberH - 4);

        // Striations
        ctx.strokeStyle = colors.red + '33';
        ctx.lineWidth = 1;
        for (let x = w * 0.15; x < w * 0.85; x += 12) {
            ctx.beginPath();
            ctx.moveTo(x, y + 2);
            ctx.lineTo(x, y + fiberH - 2);
            ctx.stroke();
        }

        // Nuclei (at periphery for skeletal muscle)
        ctx.fillStyle = '#d63031';
        for (let n = 0; n < 3; n++) {
            ctx.beginPath();
            ctx.ellipse(w * 0.2 + n * w * 0.25, y + 3, 8, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Skeletal Muscle Tissue — Striated Fibers', w / 2, 25);

    ctx.fillStyle = colors.text;
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('↔ Striated (striped) pattern | Multiple nuclei per fiber', w / 2, h - 15);
}

function drawNervousTissue(ctx, w, h, colors) {
    const cx = w * 0.35, cy = h * 0.5;

    // Cell body (soma)
    ctx.fillStyle = 'rgba(108, 92, 231, 0.3)';
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Nucleus
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();

    // Dendrites (input branches)
    ctx.strokeStyle = colors.teal;
    ctx.lineWidth = 2;
    const dendrites = [
        [cx - 20, cy - 25, cx - 60, cy - 60, cx - 80, cy - 50],
        [cx - 25, cy - 15, cx - 70, cy - 30, cx - 90, cy - 20],
        [cx - 25, cy + 10, cx - 60, cy + 20, cx - 85, cy + 35],
        [cx - 20, cy + 25, cx - 50, cy + 55, cx - 75, cy + 55],
    ];

    dendrites.forEach(d => {
        ctx.beginPath();
        ctx.moveTo(d[0], d[1]);
        ctx.quadraticCurveTo(d[2], d[3], d[4], d[5]);
        ctx.stroke();

        // Branch tips
        ctx.fillStyle = colors.teal;
        ctx.beginPath();
        ctx.arc(d[4], d[5], 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Axon (output)
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + 30, cy);
    ctx.lineTo(w * 0.85, cy);
    ctx.stroke();

    // Myelin sheath segments
    for (let i = 0; i < 4; i++) {
        const sx = cx + 50 + i * 50;
        ctx.fillStyle = 'rgba(253, 203, 110, 0.25)';
        ctx.beginPath();
        ctx.roundRect(sx, cy - 8, 35, 16, 8);
        ctx.fill();
        ctx.strokeStyle = colors.yellow + '66';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Axon terminals
    const termX = w * 0.85;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        const angle = ((i - 1) / 2) * 0.5;
        ctx.beginPath();
        ctx.moveTo(termX, cy);
        ctx.lineTo(termX + 20, cy + angle * 30);
        ctx.stroke();
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(termX + 20, cy + angle * 30, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Labels
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nerve Cell (Neuron)', w / 2, 25);

    ctx.fillStyle = colors.text;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';

    ctx.fillText('Dendrites', cx - 60, h - 20);
    ctx.fillText('Cell Body', cx, h - 20);
    ctx.fillText('Axon', w * 0.55, h - 20);
    ctx.fillText('Terminals', w * 0.85, h - 20);
}

function drawLabelLine(ctx, lx, ly, tx, ty, text, align) {
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.textAlign = align === 'right' ? 'right' : 'left';
    ctx.font = '10px Inter, sans-serif';
    if (align === 'right') ctx.fillText(text, lx - 5, ly + 4);
    else ctx.fillText(text, lx + 5, ly + 4);
}


// ══════════════════════════════════════════════════════
// All initializers called from learn-app.js as needed
// ══════════════════════════════════════════════════════
