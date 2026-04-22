/* ============================================================
   LEARN-APP.JS — Core Application Logic for EduVerse
   Contains: Router, Theme, Dashboard, Quiz Engine, Progress
   ============================================================ */

// ══════════════════════════════════════════════════════
// CHAPTER DATA
// ══════════════════════════════════════════════════════

const chapters = [
    // Maths
    { id: 'linear-equations', subject: 'maths', icon: '📈', title: 'Linear Equations', desc: 'Plot y = mx + b with adjustable slope and intercept', tags: ['interactive'], category: 'maths' },
    { id: 'geometry', subject: 'maths', icon: '🧊', title: '3D Geometry', desc: 'Rotate and explore cubes, spheres, cones, cylinders in 3D', tags: ['3d'], category: 'maths' },
    { id: 'statistics', subject: 'maths', icon: '📊', title: 'Statistics', desc: 'Interactive bar charts — learn mean, median, mode, range', tags: ['interactive'], category: 'maths' },
    { id: 'probability', subject: 'maths', icon: '🎲', title: 'Probability', desc: 'Coin toss experiment — see probability in action', tags: ['interactive'], category: 'maths' },
    // Science - Physics
    { id: 'motion', subject: 'science', icon: '🚀', title: 'Motion', desc: 'Simulate a moving object with velocity and acceleration', tags: ['interactive'], category: 'physics' },
    { id: 'force', subject: 'science', icon: '💪', title: 'Force (F=ma)', desc: 'Push a box and see Newton\'s Second Law in real-time', tags: ['interactive'], category: 'physics' },
    // Science - Chemistry
    { id: 'atoms', subject: 'science', icon: '⚛️', title: 'Atoms', desc: '3D Bohr model with orbiting electrons', tags: ['3d'], category: 'chemistry' },
    { id: 'reactions', subject: 'science', icon: '🧪', title: 'Chemical Reactions', desc: 'Watch molecules collide and form new substances', tags: ['interactive'], category: 'chemistry' },
    // Science - Biology
    { id: 'cell', subject: 'science', icon: '🔬', title: 'Cell Structure', desc: '3D animal cell with nucleus, mitochondria, ER, membrane', tags: ['3d'], category: 'biology' },
    { id: 'tissues', subject: 'science', icon: '🧫', title: 'Tissues', desc: 'Explore the 4 types of animal tissues interactively', tags: ['interactive'], category: 'biology' },
];


// ══════════════════════════════════════════════════════
// QUIZ DATA
// ══════════════════════════════════════════════════════

const quizData = {
    'linear-equations': [
        { q: 'In y = 3x + 2, what is the slope?', options: ['2', '3', '5', '1'], correct: 1, explain: 'In y = mx + b, m is the slope. Here m = 3.' },
        { q: 'What does the y-intercept represent?', options: ['Where line crosses X-axis', 'Where line crosses Y-axis', 'The slope', 'The origin'], correct: 1, explain: 'The y-intercept (b) is where the line crosses the Y-axis (x=0).' },
        { q: 'A line with slope 0 is:', options: ['Vertical', 'Horizontal', 'Diagonal', 'Not a line'], correct: 1, explain: 'Slope 0 means no rise — the line is perfectly horizontal.' },
    ],
    'geometry': [
        { q: 'How many faces does a cube have?', options: ['4', '6', '8', '12'], correct: 1, explain: 'A cube has 6 square faces.' },
        { q: 'Volume of a sphere with radius r is:', options: ['4πr²', '(4/3)πr³', 'πr²h', '2πr'], correct: 1, explain: 'V = (4/3)πr³ for a sphere.' },
        { q: 'A cylinder has how many curved surfaces?', options: ['0', '1', '2', '3'], correct: 1, explain: 'A cylinder has exactly 1 curved surface connecting its 2 circular bases.' },
    ],
    'statistics': [
        { q: 'Mean of 2, 4, 6, 8 is:', options: ['4', '5', '6', '20'], correct: 1, explain: '(2+4+6+8)/4 = 20/4 = 5' },
        { q: 'Median of 3, 7, 1, 9, 5 is:', options: ['3', '5', '7', '9'], correct: 1, explain: 'Sorted: 1,3,5,7,9 — middle value is 5.' },
        { q: 'Range is defined as:', options: ['Mean − Median', 'Max − Min', 'Sum / Count', 'Most frequent value'], correct: 1, explain: 'Range = Largest value − Smallest value.' },
    ],
    'probability': [
        { q: 'Probability of getting heads in a fair coin toss is:', options: ['1', '0.5', '0.25', '0.75'], correct: 1, explain: 'P(H) = 1 favorable outcome / 2 total outcomes = 0.5' },
        { q: 'Sum of probabilities of all outcomes equals:', options: ['0', '0.5', '1', '2'], correct: 2, explain: 'The total probability of the sample space is always 1.' },
        { q: 'An impossible event has probability:', options: ['0', '0.5', '1', '-1'], correct: 0, explain: 'An event that cannot happen has P = 0.' },
    ],
    'motion': [
        { q: 'If a car moves with constant velocity, its acceleration is:', options: ['Positive', 'Negative', 'Zero', 'Cannot determine'], correct: 2, explain: 'Constant velocity → no change in speed → acceleration = 0.' },
        { q: 'SI unit of acceleration is:', options: ['m/s', 'm/s²', 'km/h', 'N'], correct: 1, explain: 'Acceleration = change in velocity / time = m/s per s = m/s².' },
        { q: 's = ut + ½at² calculates:', options: ['Velocity', 'Force', 'Distance', 'Time'], correct: 2, explain: 'This equation gives the distance (s) traveled.' },
    ],
    'force': [
        { q: 'If F = 20N and m = 4kg, acceleration is:', options: ['5 m/s²', '80 m/s²', '0.2 m/s²', '24 m/s²'], correct: 0, explain: 'a = F/m = 20/4 = 5 m/s²' },
        { q: 'Newton\'s Second Law states:', options: ['Every action has a reaction', 'F = ma', 'Objects at rest stay at rest', 'Energy is conserved'], correct: 1, explain: 'Newton\'s 2nd Law: Force = mass × acceleration.' },
        { q: 'Doubling the mass while keeping force same:', options: ['Doubles acceleration', 'Halves acceleration', 'No change', 'Triples acceleration'], correct: 1, explain: 'a = F/m → double m means half a.' },
    ],
    'atoms': [
        { q: 'How many electrons does Carbon have?', options: ['4', '6', '8', '12'], correct: 1, explain: 'Carbon has atomic number 6 → 6 electrons.' },
        { q: 'Electrons orbit the nucleus in:', options: ['Random paths', 'Fixed shells/orbits', 'A straight line', 'The nucleus'], correct: 1, explain: 'Bohr model: electrons orbit in fixed energy shells.' },
        { q: 'The nucleus contains:', options: ['Only protons', 'Protons and neutrons', 'Only electrons', 'Protons and electrons'], correct: 1, explain: 'The nucleus has protons (+) and neutrons (no charge).' },
    ],
    'reactions': [
        { q: 'Rusting of iron is an example of:', options: ['Physical change', 'Chemical change', 'No change', 'Nuclear reaction'], correct: 1, explain: 'Rusting forms a new substance (iron oxide) → chemical change.' },
        { q: 'An exothermic reaction:', options: ['Absorbs heat', 'Releases heat', 'Has no energy change', 'Only occurs in labs'], correct: 1, explain: 'Exothermic = releases energy as heat (e.g., combustion).' },
        { q: 'In CH₄ + 2O₂ → CO₂ + 2H₂O, the reactants are:', options: ['CO₂ and H₂O', 'CH₄ and O₂', 'Only CH₄', 'Only O₂'], correct: 1, explain: 'Reactants are on the left side of the arrow: CH₄ and O₂.' },
    ],
    'cell': [
        { q: 'The control center of a cell is:', options: ['Mitochondria', 'Nucleus', 'Cell membrane', 'Ribosome'], correct: 1, explain: 'The nucleus contains DNA and controls all cell activities.' },
        { q: 'Mitochondria are called the:', options: ['Brain of cell', 'Powerhouse of cell', 'Gate of cell', 'Factory of cell'], correct: 1, explain: 'Mitochondria produce ATP (energy) → powerhouse.' },
        { q: 'Which organelle controls what enters/exits the cell?', options: ['Nucleus', 'ER', 'Cell membrane', 'Golgi body'], correct: 2, explain: 'The cell membrane is selectively permeable — controls entry/exit.' },
    ],
    'tissues': [
        { q: 'Blood is a type of:', options: ['Epithelial tissue', 'Connective tissue', 'Muscular tissue', 'Nervous tissue'], correct: 1, explain: 'Blood is connective tissue — cells in a liquid matrix (plasma).' },
        { q: 'Which tissue type is responsible for body movement?', options: ['Epithelial', 'Connective', 'Muscular', 'Nervous'], correct: 2, explain: 'Muscular tissue contracts to produce movement.' },
        { q: 'Neurons belong to which tissue type?', options: ['Epithelial', 'Connective', 'Muscular', 'Nervous'], correct: 3, explain: 'Neurons are nerve cells → part of nervous tissue.' },
    ],
};


// ══════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════

let currentPage = 'landing';
let currentDashSection = 'overview';
let quizStates = {}; // { topicId: { current: 0, score: 0, total: 0, answered: [] } }
let navigationHistory = ['landing'];

// Progress from localStorage
let progressData = JSON.parse(localStorage.getItem('eduverse_progress') || '{}');
// { 'linear-equations': { explored: true, quizPassed: true, experimented: true }, ... }


// ══════════════════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Init Lucide icons
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Theme
    const savedTheme = localStorage.getItem('eduverse_theme') || 'dark';
    setTheme(savedTheme);

    // Build dashboard
    buildChapterGrids();
    updateProgressStats();

    // Loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 800);

    // Init hero Three.js
    initHeroScene();

    // Handle hash routing
    handleHash();
    window.addEventListener('hashchange', handleHash);

    // Resize handler for canvases
    window.addEventListener('resize', handleResize);
});

function handleResize() {
    // Redraw active canvases
    if (currentPage === 'linear-equations') drawLinearGraph();
    if (currentPage === 'probability') drawCoinChart();
    if (currentPage === 'motion') drawMotionScene();
    if (currentPage === 'force') drawForceScene();
    if (currentPage === 'statistics') drawStatsChart();
    if (currentPage === 'reactions') drawReaction();
    if (currentPage === 'tissues') drawTissue();
}


// ══════════════════════════════════════════════════════
// ROUTING
// ══════════════════════════════════════════════════════

function navigate(pageId) {
    if (pageId === currentPage) return;
    
    // Deactivate old
    const oldSection = document.getElementById('page-' + currentPage);
    if (oldSection) {
        oldSection.classList.remove('active');
    }

    // Push to history
    if (currentPage !== pageId) {
        navigationHistory.push(pageId);
    }

    currentPage = pageId;
    window.location.hash = pageId;

    // Activate new
    const newSection = document.getElementById('page-' + pageId);
    if (newSection) {
        newSection.classList.add('active');
        window.scrollTo(0, 0);
    }

    // Show/hide back button
    const backBtn = document.getElementById('navBackBtn');
    if (backBtn) {
        backBtn.classList.toggle('visible', pageId !== 'landing');
    }

    // Initialize page-specific modules
    initPageModules(pageId);

    // Close sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.classList.remove('visible');
}

function handleHash() {
    const hash = window.location.hash.replace('#', '') || 'landing';
    navigate(hash);
}

function goBack() {
    if (currentPage === 'landing') {
        window.location.href = '/';
        return;
    }

    if (navigationHistory.length > 1) {
        navigationHistory.pop(); // remove current
        const prev = navigationHistory[navigationHistory.length - 1];
        navigate(prev);
    } else {
        navigate('landing');
    }
}

function initPageModules(pageId) {
    switch(pageId) {
        case 'landing':
            initHeroScene();
            break;
        case 'dashboard':
            updateProgressStats();
            break;
        case 'linear-equations':
            setTimeout(() => { initLinearGraph(); initQuiz('linear-equations'); }, 100);
            break;
        case 'geometry':
            setTimeout(() => { initGeometryScene(); initQuiz('geometry'); }, 100);
            break;
        case 'statistics':
            setTimeout(() => { initStats(); initQuiz('statistics'); }, 100);
            break;
        case 'probability':
            setTimeout(() => { drawCoinChart(); initQuiz('probability'); }, 100);
            break;
        case 'motion':
            setTimeout(() => { initMotion(); initQuiz('motion'); }, 100);
            break;
        case 'force':
            setTimeout(() => { initForce(); initQuiz('force'); }, 100);
            break;
        case 'atoms':
            setTimeout(() => { initAtomScene(); initQuiz('atoms'); }, 100);
            break;
        case 'reactions':
            setTimeout(() => { drawReaction(); initQuiz('reactions'); }, 100);
            break;
        case 'cell':
            setTimeout(() => { initCellScene(); initQuiz('cell'); }, 100);
            break;
        case 'tissues':
            setTimeout(() => { drawTissue(); initQuiz('tissues'); }, 100);
            break;
    }
}


// ══════════════════════════════════════════════════════
// THEME TOGGLE
// ══════════════════════════════════════════════════════

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('eduverse_theme', theme);
    
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.textContent = theme === 'dark' ? '🌙' : '☀️';

    // Redraw canvases with new colors
    handleResize();
}


// ══════════════════════════════════════════════════════
// SIDEBAR & DASHBOARD
// ══════════════════════════════════════════════════════

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
}

function showDashboard(section) {
    currentDashSection = section;

    // Hide all dash content
    document.querySelectorAll('[id^="dash-"]').forEach(el => el.style.display = 'none');
    const target = document.getElementById('dash-' + section);
    if (target) target.style.display = 'block';

    // Update sidebar active
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.querySelector(`[data-dash="${section}"]`);
    if (activeItem) activeItem.classList.add('active');

    // Make sure we're on dashboard page
    if (currentPage !== 'dashboard') navigate('dashboard');

    // Close sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.classList.remove('visible');

    if (section === 'progress') buildProgressPage();
}

function buildChapterGrids() {
    const allGrid = document.getElementById('allChaptersGrid');
    const mathsGrid = document.getElementById('mathsChaptersGrid');
    const scienceGrid = document.getElementById('scienceChaptersGrid');
    const expGrid = document.getElementById('experimentsGrid');

    chapters.forEach(ch => {
        const card = createChapterCard(ch);
        
        if (allGrid) allGrid.appendChild(card.cloneNode(true));
        if (ch.subject === 'maths' && mathsGrid) mathsGrid.appendChild(card.cloneNode(true));
        if (ch.subject === 'science' && scienceGrid) scienceGrid.appendChild(card.cloneNode(true));
        if (ch.tags.includes('interactive') && expGrid) expGrid.appendChild(card.cloneNode(true));
    });

    // Add click handlers (since cloneNode doesn't copy event listeners)
    document.querySelectorAll('.chapter-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-chapter');
            if (id) navigate(id);
        });
    });
}

function createChapterCard(ch) {
    const progress = progressData[ch.id] || {};
    const pct = calculateChapterProgress(ch.id);

    const card = document.createElement('div');
    card.className = 'chapter-card';
    card.setAttribute('data-chapter', ch.id);
    
    let tagsHTML = '';
    if (ch.tags.includes('interactive')) tagsHTML += '<span class="chapter-card-tag tag-interactive">Interactive</span> ';
    if (ch.tags.includes('3d')) tagsHTML += '<span class="chapter-card-tag tag-3d">3D Model</span> ';

    card.innerHTML = `
        <div class="chapter-card-icon">${ch.icon}</div>
        <h3>${ch.title}</h3>
        <p>${ch.desc}</p>
        <div>${tagsHTML}</div>
        <div class="chapter-progress">
            <div class="chapter-progress-fill" style="width: ${pct}%"></div>
        </div>
    `;
    return card;
}


// ══════════════════════════════════════════════════════
// QUIZ ENGINE
// ══════════════════════════════════════════════════════

function initQuiz(topicId) {
    const data = quizData[topicId];
    if (!data || data.length === 0) return;

    if (!quizStates[topicId]) {
        quizStates[topicId] = { current: 0, score: 0, total: 0, answered: [] };
    }

    renderQuizQuestion(topicId);
}

function renderQuizQuestion(topicId) {
    const data = quizData[topicId];
    const state = quizStates[topicId];
    const container = document.getElementById('quizContent-' + topicId);
    if (!container || !data) return;

    const q = data[state.current];
    if (!q) {
        // All questions done
        container.innerHTML = `
            <div style="text-align:center; padding:1rem;">
                <p style="font-size:1.2rem; font-weight:700;">🎉 Quiz Complete!</p>
                <p style="color:var(--text-secondary); margin-top:0.5rem;">You scored ${state.score}/${data.length}</p>
                <button class="quiz-next-btn" onclick="resetQuiz('${topicId}')" style="margin-top:1rem;">Retry Quiz</button>
            </div>
        `;
        return;
    }

    const letters = ['A', 'B', 'C', 'D'];
    let optionsHTML = q.options.map((opt, i) => `
        <button class="quiz-option" onclick="answerQuiz('${topicId}', ${i})" id="quizOpt-${topicId}-${i}">
            <span class="quiz-option-letter">${letters[i]}</span>
            ${opt}
        </button>
    `).join('');

    container.innerHTML = `
        <div class="quiz-question">Q${state.current + 1}. ${q.q}</div>
        <div class="quiz-options">${optionsHTML}</div>
        <div class="quiz-explanation" id="quizExplain-${topicId}">${q.explain}</div>
    `;

    updateQuizScore(topicId);
}

function answerQuiz(topicId, optionIdx) {
    const data = quizData[topicId];
    const state = quizStates[topicId];
    const q = data[state.current];
    
    if (state.answered.includes(state.current)) return; // Already answered
    state.answered.push(state.current);
    state.total++;

    const isCorrect = optionIdx === q.correct;
    if (isCorrect) state.score++;

    // Highlight options
    q.options.forEach((_, i) => {
        const btn = document.getElementById(`quizOpt-${topicId}-${i}`);
        if (!btn) return;
        btn.style.pointerEvents = 'none';
        if (i === q.correct) btn.classList.add('correct');
        else if (i === optionIdx && !isCorrect) btn.classList.add('wrong');
    });

    // Show explanation
    const explainEl = document.getElementById('quizExplain-' + topicId);
    if (explainEl) explainEl.classList.add('visible');

    updateQuizScore(topicId);

    // Auto-advance after delay
    setTimeout(() => {
        state.current++;
        renderQuizQuestion(topicId);
        
        // Track progress if quiz is complete
        if (state.current >= data.length && state.score >= data.length * 0.5) {
            trackProgress(topicId, 'quizPassed');
        }
    }, 2500);
}

function resetQuiz(topicId) {
    quizStates[topicId] = { current: 0, score: 0, total: 0, answered: [] };
    renderQuizQuestion(topicId);
}

function updateQuizScore(topicId) {
    const state = quizStates[topicId];
    const scoreEl = document.getElementById('quizScore-' + topicId);
    if (scoreEl) scoreEl.textContent = `${state.score}/${state.total}`;
}


// ══════════════════════════════════════════════════════
// PROGRESS TRACKING
// ══════════════════════════════════════════════════════

function trackProgress(chapterId, type) {
    if (!progressData[chapterId]) progressData[chapterId] = {};
    progressData[chapterId][type] = true;
    localStorage.setItem('eduverse_progress', JSON.stringify(progressData));
    updateProgressStats();
}

function calculateChapterProgress(chapterId) {
    const p = progressData[chapterId] || {};
    let count = 0;
    if (p.explored) count++;
    if (p.experimented) count++;
    if (p.quizPassed) count++;
    return Math.round((count / 3) * 100);
}

function updateProgressStats() {
    const topicsExplored = Object.keys(progressData).filter(k => progressData[k].explored).length;
    const expDone = Object.keys(progressData).filter(k => progressData[k].experimented).length;
    const quizzesPassed = Object.keys(progressData).filter(k => progressData[k].quizPassed).length;
    
    const totalPossible = chapters.length * 3;
    let totalAchieved = 0;
    chapters.forEach(ch => {
        const p = progressData[ch.id] || {};
        if (p.explored) totalAchieved++;
        if (p.experimented) totalAchieved++;
        if (p.quizPassed) totalAchieved++;
    });
    const overallPct = totalPossible > 0 ? Math.round((totalAchieved / totalPossible) * 100) : 0;

    const elTopics = document.getElementById('statTopics');
    const elExp = document.getElementById('statExperiments');
    const elQuiz = document.getElementById('statQuizzes');
    const elScore = document.getElementById('statScore');

    if (elTopics) elTopics.textContent = topicsExplored;
    if (elExp) elExp.textContent = expDone;
    if (elQuiz) elQuiz.textContent = quizzesPassed;
    if (elScore) elScore.textContent = overallPct + '%';
}

function buildProgressPage() {
    const container = document.getElementById('progressChaptersList');
    if (!container) return;

    let html = '<div class="chapters-grid">';
    chapters.forEach(ch => {
        const p = progressData[ch.id] || {};
        const pct = calculateChapterProgress(ch.id);
        
        html += `
            <div class="chapter-card" data-chapter="${ch.id}" onclick="navigate('${ch.id}')">
                <div class="chapter-card-icon">${ch.icon}</div>
                <h3>${ch.title}</h3>
                <p style="font-size:0.8rem;">
                    ${p.explored ? '✅' : '⬜'} Explored &nbsp;
                    ${p.experimented ? '✅' : '⬜'} Experimented &nbsp;
                    ${p.quizPassed ? '✅' : '⬜'} Quiz Passed
                </p>
                <div class="chapter-progress">
                    <div class="chapter-progress-fill" style="width: ${pct}%"></div>
                </div>
                <p style="font-size:0.75rem; color:var(--text-muted); margin-top:0.5rem;">${pct}% complete</p>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}


// ══════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════

// Canvas roundRect polyfill for older browsers
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
        if (typeof radii === 'number') radii = [radii, radii, radii, radii];
        if (!Array.isArray(radii)) radii = [0, 0, 0, 0];
        while (radii.length < 4) radii.push(radii[radii.length - 1] || 0);
        
        const [tl, tr, br, bl] = radii;
        this.moveTo(x + tl, y);
        this.lineTo(x + w - tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + tr);
        this.lineTo(x + w, y + h - br);
        this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        this.lineTo(x + bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - bl);
        this.lineTo(x, y + tl);
        this.quadraticCurveTo(x, y, x + tl, y);
        this.closePath();
        return this;
    };
}
