/**
 * ═══════════════════════════════════════════════
 * DEMO.JS — Full Demo Page Logic
 * Biology, Physics, Chemistry, Maths, Languages,
 * Geography, History, AI Chatbot
 * ═══════════════════════════════════════════════
 */

// ─── STATE ───
let activeTab = 'biology';
let chatSubject = 'general';

// Quiz states per subject
const quizState = {};
const SUBJECTS_LIST = ['biology', 'physics', 'chemistry', 'maths', 'languages', 'geography', 'history'];

// ─── FLASHCARD DATA ───
const BIO_FLASHCARDS = [
    { emoji: '🫀', title: 'Human Heart', back: 'The human heart has 4 chambers: Right Atrium, Right Ventricle, Left Atrium, and Left Ventricle. It pumps ~5L of blood per minute and beats ~100,000 times daily.' },
    { emoji: '🧬', title: 'DNA Structure', back: 'DNA is a double helix made of nucleotides. Base pairs: Adenine-Thymine (A-T) and Guanine-Cytosine (G-C). It carries genetic instructions for all living organisms.' },
    { emoji: '🔬', title: 'Cell Division', back: 'Mitosis: One cell divides into 2 identical daughter cells (growth/repair). Meiosis: One cell produces 4 genetically unique cells (gametes for reproduction).' },
    { emoji: '🧠', title: 'Nervous System', back: 'The nervous system has two parts: CNS (brain + spinal cord) and PNS (nerves). Neurons transmit electrical signals at speeds up to 120 m/s.' },
];

const GEO_FLASHCARDS = [
    { emoji: '🇮🇳', title: 'India', back: 'Capital: New Delhi\nContinent: Asia\nPopulation: ~1.4 billion\nArea: 3.28 million km²\nLargest democracy in the world.' },
    { emoji: '🇯🇵', title: 'Japan', back: 'Capital: Tokyo\nContinent: Asia\nPopulation: ~125 million\nKnown as the "Land of the Rising Sun"\nArchipelago of 6,852 islands.' },
    { emoji: '🇧🇷', title: 'Brazil', back: 'Capital: Brasília\nContinent: South America\nPopulation: ~215 million\nLargest country in South America\nHome to the Amazon Rainforest.' },
    { emoji: '🇪🇬', title: 'Egypt', back: 'Capital: Cairo\nContinent: Africa\nPopulation: ~104 million\nHome to the Great Pyramids of Giza\nThe Nile River flows through it.' },
    { emoji: '🇦🇺', title: 'Australia', back: 'Capital: Canberra\nContinent: Oceania\nPopulation: ~26 million\nThe only country that is also a continent\nGreat Barrier Reef.' },
];

// ─── VOCABULARY DATA ───
const VOCAB_DATA = [
    { word: 'Ephemeral', pron: '/ɪˈfem.ər.əl/', type: 'adjective', meaning: 'Lasting for a very short time; transitory.', example: '"The ephemeral beauty of cherry blossoms makes them all the more precious."' },
    { word: 'Ubiquitous', pron: '/juːˈbɪk.wɪ.təs/', type: 'adjective', meaning: 'Present, appearing, or found everywhere.', example: '"Smartphones have become ubiquitous in modern society."' },
    { word: 'Serendipity', pron: '/ˌser.ənˈdɪp.ə.ti/', type: 'noun', meaning: 'The occurrence of events by chance in a happy or beneficial way.', example: '"Finding that rare book at the garage sale was pure serendipity."' },
    { word: 'Eloquent', pron: '/ˈel.ə.kwənt/', type: 'adjective', meaning: 'Fluent or persuasive in speaking or writing.', example: '"The lawyer gave an eloquent closing argument that moved the jury."' },
    { word: 'Resilience', pron: '/rɪˈzɪl.i.əns/', type: 'noun', meaning: 'The capacity to recover quickly from difficulties; toughness.', example: '"Her resilience in the face of adversity was truly inspiring."' },
    { word: 'Paradigm', pron: '/ˈpær.ə.daɪm/', type: 'noun', meaning: 'A typical example or pattern of something; a model.', example: '"The discovery caused a paradigm shift in our understanding of physics."' },
];

let vocabIndex = 0;
let bioFlashIndex = 0;
let geoFlashIndex = 0;

// ─── FILL IN THE BLANK DATA ───
const FILL_BLANK_DATA = [
    { sentence: 'The scientist made an important ___ that changed the world.', blank: 'discovery', options: ['discovery', 'recipe', 'journey', 'melody'], explanation: 'A "discovery" is something found or learned for the first time. Scientists make discoveries through research and experimentation.' },
    { sentence: 'She ___ the exam with flying colors after months of preparation.', blank: 'passed', options: ['failed', 'passed', 'ignored', 'forgot'], explanation: '"Passed" means to successfully complete or achieve a required standard. "With flying colors" means with great success.' },
    { sentence: 'The ___ of the ancient city revealed many artifacts.', blank: 'excavation', options: ['demolition', 'excavation', 'celebration', 'decoration'], explanation: '"Excavation" means the act of digging, especially archaeological digging to uncover ancient remains.' },
    { sentence: 'The teacher\'s ___ explanation made the concept easy to understand.', blank: 'lucid', options: ['confusing', 'lucid', 'vague', 'boring'], explanation: '"Lucid" means expressed clearly and easy to understand. A lucid explanation helps students grasp difficult concepts.' },
    { sentence: 'Water ___ at 100 degrees Celsius under normal atmospheric pressure.', blank: 'boils', options: ['freezes', 'boils', 'evaporates', 'condenses'], explanation: 'Water boils (reaches its boiling point) at 100°C / 212°F at standard atmospheric pressure (1 atm).' },
];
let fillBlankIndex = 0;

// ─── SYNONYM MATCHING DATA ───
const SYNONYM_PAIRS = [
    ['Happy', 'Joyful'],
    ['Brave', 'Courageous'],
    ['Smart', 'Intelligent'],
    ['Big', 'Enormous'],
    ['Fast', 'Rapid'],
    ['Beautiful', 'Gorgeous'],
];

let synonymSelection = null;
let synonymMatched = 0;

// ─── PERIODIC TABLE DATA ───
const ELEMENTS = [
    { number: 1, symbol: 'H', name: 'Hydrogen', desc: 'Lightest element. Makes up 75% of the universe. Used in fuel cells and rocket fuel.' },
    { number: 2, symbol: 'He', name: 'Helium', desc: 'Noble gas. Second lightest element. Used in balloons and deep-sea diving.' },
    { number: 6, symbol: 'C', name: 'Carbon', desc: 'Basis of organic chemistry. Found in all living things. Forms diamonds and graphite.' },
    { number: 7, symbol: 'N', name: 'Nitrogen', desc: 'Makes up 78% of atmosphere. Essential for amino acids and proteins.' },
    { number: 8, symbol: 'O', name: 'Oxygen', desc: '21% of atmosphere. Essential for respiration. Produced by photosynthesis.' },
    { number: 11, symbol: 'Na', name: 'Sodium', desc: 'Highly reactive alkali metal. Combines with Cl to form table salt (NaCl).' },
    { number: 12, symbol: 'Mg', name: 'Magnesium', desc: 'Light structural metal. Burns with bright white light. Essential for chlorophyll.' },
    { number: 13, symbol: 'Al', name: 'Aluminium', desc: 'Most abundant metal in Earth\'s crust. Light, strong, corrosion-resistant.' },
    { number: 14, symbol: 'Si', name: 'Silicon', desc: 'Semiconductor. Basis of computer chips. Second most abundant element in Earth\'s crust.' },
    { number: 17, symbol: 'Cl', name: 'Chlorine', desc: 'Halogen element. Used in water purification. Part of table salt (NaCl).' },
    { number: 20, symbol: 'Ca', name: 'Calcium', desc: 'Essential for bones and teeth. Fifth most abundant element in Earth\'s crust.' },
    { number: 26, symbol: 'Fe', name: 'Iron', desc: 'Most used metal. Core component of steel. Essential for hemoglobin in blood.' },
    { number: 29, symbol: 'Cu', name: 'Copper', desc: 'Excellent conductor. Used in electrical wiring. One of the first metals used by humans.' },
    { number: 47, symbol: 'Ag', name: 'Silver', desc: 'Precious metal. Best conductor of electricity. Used in jewelry and electronics.' },
    { number: 79, symbol: 'Au', name: 'Gold', desc: 'Precious metal. Highly malleable and ductile. Does not corrode or tarnish.' },
    { number: 82, symbol: 'Pb', name: 'Lead', desc: 'Dense, soft metal. Historically used in pipes and paint. Now known to be toxic.' },
    { number: 92, symbol: 'U', name: 'Uranium', desc: 'Radioactive element. Used as nuclear fuel. Named after the planet Uranus.' },
    { number: 118, symbol: 'Og', name: 'Oganesson', desc: 'Heaviest known element. Synthetic, extremely radioactive. Named after Yuri Oganessian.' },
];

// ─── INITIALIZATION ───
document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('mainNav');
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });

    // Mobile menu
    const menuBtn = document.getElementById('mobileMenuBtn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            document.getElementById('navLinks').classList.toggle('open');
        });
    }

    // Init Biology (default tab)
    initBiologyDemo();
    loadDemoQuiz('biology', 'bioQuizContent', 'bioScore', 'bioDifficulty');

    // Init periodic table
    buildPeriodicTable();

    // Init fill in the blank
    renderFillBlank();

    // Init synonym game
    resetSynonymGame();

    // Init geography map
    drawClimateMap();
    drawEmpireMap('maurya');

    // Init projectile calculator
    updateProjectile();
});

// ─── TAB SWITCHING ───
function switchDemoTab(tab) {
    activeTab = tab;

    // Update tab buttons
    document.querySelectorAll('.demo-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });

    // Update panels
    document.querySelectorAll('.demo-panel').forEach(p => {
        p.classList.toggle('active', p.id === `panel-${tab}`);
    });

    // Initialize demos lazily
    switch (tab) {
        case 'biology':
            initBiologyDemo();
            loadDemoQuiz('biology', 'bioQuizContent', 'bioScore', 'bioDifficulty');
            break;
        case 'physics':
            initPhysicsDemo();
            loadDemoQuiz('physics', 'physicsQuizContent', 'physicsScore', 'physicsDifficulty');
            break;
        case 'chemistry':
            initChemistryDemo();
            loadDemoQuiz('chemistry', 'chemQuizContent', 'chemScore', 'chemDifficulty');
            break;
        case 'maths':
            initMathsDemo();
            loadDemoQuiz('maths', 'mathsQuizContent', 'mathsScore', 'mathsDifficulty');
            plotGraph();
            break;
        case 'languages':
            loadDemoQuiz('languages', 'langQuizContent', 'langScore', 'langDifficulty');
            break;
        case 'geography':
            loadDemoQuiz('geography', 'geoQuizContent', 'geoScore', 'geoDifficulty');
            drawClimateMap();
            break;
        case 'history':
            loadDemoQuiz('history', 'histQuizContent', 'histScore', 'histDifficulty');
            drawEmpireMap('maurya');
            break;
    }
}

// ─── THREE.JS DEMO INITIALIZERS ───
let bioInitialized = false;
let physicsInitialized = false;
let chemInitialized = false;
let mathsInitialized = false;

function initBiologyDemo() {
    if (bioInitialized) return;
    bioInitialized = true;
    setTimeout(() => ThreeScenes.initBiology('bio-demo-canvas'), 100);
}

function initPhysicsDemo() {
    if (physicsInitialized) return;
    physicsInitialized = true;
    setTimeout(() => ThreeScenes.initPhysics('physics-demo-canvas'), 100);
}

function initChemistryDemo() {
    if (chemInitialized) return;
    chemInitialized = true;
    setTimeout(() => ThreeScenes.initChemistry('chem-demo-canvas'), 100);
}

function initMathsDemo() {
    if (mathsInitialized) return;
    mathsInitialized = true;
    setTimeout(() => ThreeScenes.initMaths('maths-demo-canvas'), 100);
}

// ─── QUIZ SYSTEM ───
async function loadDemoQuiz(subject, containerId, scoreId, diffId) {
    if (!quizState[subject]) {
        quizState[subject] = { data: [], index: 0, score: { correct: 0, total: 0 } };
    }

    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const resp = await fetch(`/api/mcq?subject=${subject}&count=5`);
        const data = await resp.json();
        quizState[subject].data = data.questions;
        quizState[subject].index = 0;
        quizState[subject].score = { correct: 0, total: 0 };
        updateDemoScore(subject, scoreId);
        renderDemoQuestion(subject, containerId, scoreId, diffId);
    } catch (err) {
        container.innerHTML = '<p style="color:var(--text-muted);">Failed to load quiz. Ensure Flask server is running on port 5000.</p>';
    }
}

function renderDemoQuestion(subject, containerId, scoreId, diffId) {
    const state = quizState[subject];
    const container = document.getElementById(containerId);

    if (state.index >= state.data.length) {
        container.innerHTML = `
            <div style="text-align:center; padding:1rem;">
                <div style="font-size:2.5rem; margin-bottom:0.5rem;">🎉</div>
                <h4>Quiz Complete!</h4>
                <p style="color:var(--text-secondary); margin:0.5rem 0;">Score: ${state.score.correct}/${state.score.total}</p>
                <button class="mcq-next-btn" onclick="loadDemoQuiz('${subject}','${containerId}','${scoreId}','${diffId}')">Try Again</button>
            </div>
        `;
        return;
    }

    const q = state.data[state.index];
    const markers = ['A', 'B', 'C', 'D'];

    container.innerHTML = `
        <div class="mcq-question">${q.question}</div>
        <div class="mcq-options">
            ${q.options.map((opt, i) => `
                <div class="mcq-option" onclick="answerDemoQuiz('${subject}',${i},${q.correct},'${containerId}','${scoreId}','${diffId}')" id="${subject}Opt${i}">
                    <span class="option-marker">${markers[i]}</span>
                    <span>${opt}</span>
                </div>
            `).join('')}
        </div>
        <div class="mcq-explanation" id="${subject}Explanation">${q.explanation}</div>
    `;

    const diffEl = document.getElementById(diffId);
    if (diffEl) {
        diffEl.textContent = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
        diffEl.style.color = q.difficulty === 'easy' ? '#00b894' : q.difficulty === 'medium' ? '#fdcb6e' : '#e17055';
    }
}

function answerDemoQuiz(subject, selected, correct, containerId, scoreId, diffId) {
    const container = document.getElementById(containerId);
    const options = container.querySelectorAll('.mcq-option');

    if (options[0].style.pointerEvents === 'none') return;

    options.forEach((opt, i) => {
        opt.style.pointerEvents = 'none';
        if (i === correct) opt.classList.add('correct');
        if (i === selected && i !== correct) opt.classList.add('incorrect');
    });

    quizState[subject].score.total++;
    if (selected === correct) quizState[subject].score.correct++;
    updateDemoScore(subject, scoreId);

    const explEl = document.getElementById(`${subject}Explanation`);
    if (explEl) explEl.classList.add('show');

    setTimeout(() => {
        quizState[subject].index++;
        renderDemoQuestion(subject, containerId, scoreId, diffId);
    }, 2500);
}

function updateDemoScore(subject, scoreId) {
    const el = document.getElementById(scoreId);
    if (el) el.textContent = `${quizState[subject].score.correct}/${quizState[subject].score.total}`;
}

// ─── PHYSICS CONTROLS ───
function updatePhysicsParam(param, value) {
    if (param === 'frequency') {
        document.getElementById('freqValue').textContent = parseFloat(value).toFixed(1) + ' Hz';
    } else if (param === 'amplitude') {
        document.getElementById('ampValue').textContent = parseFloat(value).toFixed(1);
    }
    ThreeScenes.updatePhysicsParams(param, value);
}

function updateProjectile() {
    const angle = parseFloat(document.getElementById('launchAngle').value);
    const velocity = parseFloat(document.getElementById('launchVelocity').value);
    const g = 9.8;

    document.getElementById('angleValue').textContent = angle + '°';
    document.getElementById('velValue').textContent = velocity + ' m/s';

    const rad = angle * Math.PI / 180;
    const maxH = (velocity * velocity * Math.sin(rad) * Math.sin(rad)) / (2 * g);
    const range = (velocity * velocity * Math.sin(2 * rad)) / g;
    const time = (2 * velocity * Math.sin(rad)) / g;

    document.getElementById('maxHeight').textContent = maxH.toFixed(1) + ' m';
    document.getElementById('projRange').textContent = range.toFixed(1) + ' m';
    document.getElementById('flightTime').textContent = time.toFixed(2) + ' s';
}

// ─── GRAPH PLOTTER ───
function plotGraph() {
    const canvas = document.getElementById('graphCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight || 300;
    canvas.width = w;
    canvas.height = h;

    const funcStr = document.getElementById('functionInput').value;

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const scaleX = 40;
    const scaleY = 40;

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += scaleX) {
        ctx.beginPath();
        ctx.moveTo(centerX + gx, 0); ctx.lineTo(centerX + gx, h);
        ctx.moveTo(centerX - gx, 0); ctx.lineTo(centerX - gx, h);
        ctx.stroke();
    }
    for (let gy = 0; gy < h; gy += scaleY) {
        ctx.beginPath();
        ctx.moveTo(0, centerY + gy); ctx.lineTo(w, centerY + gy);
        ctx.moveTo(0, centerY - gy); ctx.lineTo(w, centerY - gy);
        ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, centerY); ctx.lineTo(w, centerY);
    ctx.moveTo(centerX, 0); ctx.lineTo(centerX, h);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Inter, sans-serif';
    for (let i = -Math.floor(centerX / scaleX); i <= Math.floor(centerX / scaleX); i++) {
        if (i !== 0) ctx.fillText(i, centerX + i * scaleX - 3, centerY + 12);
    }
    for (let i = -Math.floor(centerY / scaleY); i <= Math.floor(centerY / scaleY); i++) {
        if (i !== 0) ctx.fillText(-i, centerX + 5, centerY + i * scaleY + 3);
    }

    // Plot function
    try {
        ctx.strokeStyle = '#6c5ce7';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#6c5ce7';
        ctx.shadowBlur = 8;
        ctx.beginPath();

        let started = false;
        for (let px = 0; px < w; px++) {
            const x = (px - centerX) / scaleX;
            let y;
            try {
                y = eval(funcStr);
            } catch (e) { continue; }

            if (isNaN(y) || !isFinite(y)) {
                started = false;
                continue;
            }

            const py = centerY - y * scaleY;

            if (py < -100 || py > h + 100) {
                started = false;
                continue;
            }

            if (!started) {
                ctx.moveTo(px, py);
                started = true;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Function label
        ctx.fillStyle = '#a29bfe';
        ctx.font = '13px JetBrains Mono, monospace';
        ctx.fillText(`f(x) = ${funcStr}`, 10, 20);
    } catch (err) {
        ctx.fillStyle = '#e17055';
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText('Invalid function. Try: Math.sin(x)', 10, 20);
    }
}

// ─── FLASHCARD SYSTEM (Demo Page) ───
function flipFlashcard(prefix) {
    const el = document.getElementById(prefix + 'Flashcard');
    if (el) el.classList.toggle('flipped');
}

function nextFlashcard(prefix) {
    if (prefix === 'bio') {
        bioFlashIndex = (bioFlashIndex + 1) % BIO_FLASHCARDS.length;
        updateFlashcard('bio', BIO_FLASHCARDS, bioFlashIndex);
    } else if (prefix === 'geo') {
        geoFlashIndex = (geoFlashIndex + 1) % GEO_FLASHCARDS.length;
        updateFlashcard('geo', GEO_FLASHCARDS, geoFlashIndex);
    }
}

function prevFlashcard(prefix) {
    if (prefix === 'bio') {
        bioFlashIndex = (bioFlashIndex - 1 + BIO_FLASHCARDS.length) % BIO_FLASHCARDS.length;
        updateFlashcard('bio', BIO_FLASHCARDS, bioFlashIndex);
    } else if (prefix === 'geo') {
        geoFlashIndex = (geoFlashIndex - 1 + GEO_FLASHCARDS.length) % GEO_FLASHCARDS.length;
        updateFlashcard('geo', GEO_FLASHCARDS, geoFlashIndex);
    }
}

function updateFlashcard(prefix, data, index) {
    const card = data[index];
    document.getElementById(`${prefix}FlashEmoji`).textContent = card.emoji;
    document.getElementById(`${prefix}FlashTitle`).textContent = card.title;
    document.getElementById(`${prefix}FlashBack`).textContent = card.back;
    document.getElementById(`${prefix}Flashcard`).classList.remove('flipped');
}

// ─── VOCABULARY BUILDER ───
function nextVocab() {
    vocabIndex = (vocabIndex + 1) % VOCAB_DATA.length;
    updateVocab();
}

function prevVocab() {
    vocabIndex = (vocabIndex - 1 + VOCAB_DATA.length) % VOCAB_DATA.length;
    updateVocab();
}

function updateVocab() {
    const v = VOCAB_DATA[vocabIndex];
    document.getElementById('vocabWord').textContent = v.word;
    document.getElementById('vocabPron').textContent = v.pron;
    document.getElementById('vocabType').textContent = v.type;
    document.getElementById('vocabMeaning').textContent = v.meaning;
    document.getElementById('vocabExample').textContent = v.example;
}

// ─── FILL IN THE BLANK ───
function renderFillBlank() {
    const data = FILL_BLANK_DATA[fillBlankIndex];
    const sentenceEl = document.getElementById('fillSentence');
    const optionsEl = document.getElementById('fillOptions');
    const explEl = document.getElementById('fillExplanation');

    if (!sentenceEl) return;

    sentenceEl.innerHTML = data.sentence.replace('___', '<span class="blank" id="blankSpot">______</span>');
    explEl.classList.remove('show');
    explEl.textContent = data.explanation;

    // Shuffle options
    const shuffled = [...data.options].sort(() => Math.random() - 0.5);
    optionsEl.innerHTML = shuffled.map(opt =>
        `<button class="fill-option" onclick="checkFillBlank('${opt}', '${data.blank}', this)">${opt}</button>`
    ).join('');
}

function checkFillBlank(selected, correct, btn) {
    const optionsEl = document.getElementById('fillOptions');
    const buttons = optionsEl.querySelectorAll('.fill-option');

    buttons.forEach(b => {
        b.style.pointerEvents = 'none';
        if (b.textContent === correct) b.classList.add('correct');
    });

    if (selected !== correct) {
        btn.classList.add('incorrect');
    }

    document.getElementById('blankSpot').textContent = correct;
    document.getElementById('fillExplanation').classList.add('show');
}

function nextFillBlank() {
    fillBlankIndex = (fillBlankIndex + 1) % FILL_BLANK_DATA.length;
    renderFillBlank();
}

// ─── SYNONYM MATCHING GAME ───
function resetSynonymGame() {
    synonymMatched = 0;
    synonymSelection = null;

    const gameEl = document.getElementById('synonymGame');
    const resultEl = document.getElementById('synonymResult');
    if (!gameEl) return;

    resultEl.textContent = '';

    // Pick 4 random pairs
    const shuffled = [...SYNONYM_PAIRS].sort(() => Math.random() - 0.5).slice(0, 4);
    const words = shuffled.map(p => p[0]).sort(() => Math.random() - 0.5);
    const matches = shuffled.map(p => p[1]).sort(() => Math.random() - 0.5);

    // Create mapping
    const pairMap = {};
    shuffled.forEach(p => { pairMap[p[0]] = p[1]; pairMap[p[1]] = p[0]; });

    gameEl.innerHTML = '';
    words.forEach(w => {
        gameEl.innerHTML += `<div class="synonym-word" onclick="selectSynonym(this, '${w}', 'word')" data-word="${w}" data-pair="${pairMap[w]}">${w}</div>`;
    });
    matches.forEach(m => {
        gameEl.innerHTML += `<div class="synonym-match" onclick="selectSynonym(this, '${m}', 'match')" data-word="${m}" data-pair="${pairMap[m]}">${m}</div>`;
    });

    gameEl.dataset.total = shuffled.length;
}

function selectSynonym(el, word, type) {
    if (el.classList.contains('matched')) return;

    if (!synonymSelection) {
        // First selection
        document.querySelectorAll('.synonym-word, .synonym-match').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        synonymSelection = { el, word, type };
    } else {
        // Second selection — check match
        if (synonymSelection.type === type) {
            // Same column — just reselect
            synonymSelection.el.classList.remove('selected');
            el.classList.add('selected');
            synonymSelection = { el, word, type };
            return;
        }

        const pair1 = synonymSelection.el.dataset.pair;
        
        if (pair1 === word) {
            // Correct match!
            el.classList.add('matched');
            synonymSelection.el.classList.add('matched');
            el.classList.remove('selected');
            synonymSelection.el.classList.remove('selected');
            synonymMatched++;

            const total = parseInt(document.getElementById('synonymGame').dataset.total);
            if (synonymMatched >= total) {
                document.getElementById('synonymResult').innerHTML = '🎉 <span style="color:#00b894;">All matched! Great job!</span>';
            }
        } else {
            // Incorrect
            el.classList.add('selected');
            setTimeout(() => {
                el.classList.remove('selected');
                synonymSelection.el.classList.remove('selected');
            }, 500);
        }
        synonymSelection = null;
    }
}

// ─── PERIODIC TABLE ───
function buildPeriodicTable() {
    const container = document.getElementById('periodicTable');
    if (!container) return;

    container.innerHTML = ELEMENTS.map(el => `
        <div class="element-card" onclick="showElementInfo(${ELEMENTS.indexOf(el)})" title="${el.name}">
            <div class="el-number">${el.number}</div>
            <div class="el-symbol">${el.symbol}</div>
            <div class="el-name">${el.name}</div>
        </div>
    `).join('');
}

function showElementInfo(idx) {
    const el = ELEMENTS[idx];
    const info = document.getElementById('elementInfo');
    info.style.display = 'block';
    document.getElementById('elInfoTitle').textContent = `${el.symbol} — ${el.name} (Atomic №${el.number})`;
    document.getElementById('elInfoDesc').textContent = el.desc;
    info.style.animation = 'fadeInUp 0.3s ease';
}

// ─── REACTION SIMULATION ───
function playReaction() {
    const emoji = document.getElementById('reactionEmoji');
    const stages = ['🧊', '🔥', '💨', '💧', '✨'];
    const labels = ['CH₄ + O₂', 'Ignition!', 'CO₂ released', 'H₂O formed', 'Reaction complete!'];
    let i = 0;

    const interval = setInterval(() => {
        if (i >= stages.length) {
            clearInterval(interval);
            return;
        }
        emoji.textContent = stages[i];
        emoji.style.fontSize = i === 1 ? '3rem' : '2rem';
        emoji.title = labels[i];
        i++;
    }, 600);
}

// ─── CLIMATE MAP (Canvas) ───
function drawClimateMap() {
    const canvas = document.getElementById('geoMapCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    // Simplified climate zone bands
    const zones = [
        { y: 0, h: h * 0.12, color: '#ecf0f1', label: 'Polar (Arctic)' },
        { y: h * 0.12, h: h * 0.15, color: '#2980b9', label: 'Cold (Subarctic)' },
        { y: h * 0.27, h: h * 0.15, color: '#27ae60', label: 'Temperate' },
        { y: h * 0.42, h: h * 0.08, color: '#f39c12', label: 'Dry (Subtropical)' },
        { y: h * 0.50, h: h * 0.10, color: '#e74c3c', label: 'Tropical' },
        { y: h * 0.60, h: h * 0.08, color: '#f39c12', label: 'Dry' },
        { y: h * 0.68, h: h * 0.12, color: '#27ae60', label: 'Temperate' },
        { y: h * 0.80, h: h * 0.10, color: '#2980b9', label: 'Cold' },
        { y: h * 0.90, h: h * 0.10, color: '#ecf0f1', label: 'Polar (Antarctic)' },
    ];

    zones.forEach(z => {
        ctx.fillStyle = z.color + '40';
        ctx.fillRect(0, z.y, w, z.h);

        // Label
        ctx.fillStyle = z.color;
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(z.label, 8, z.y + z.h / 2 + 4);
    });

    // Latitude lines
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([3, 3]);
    [0.12, 0.27, 0.42, 0.50, 0.60, 0.68, 0.80, 0.90].forEach(p => {
        ctx.beginPath();
        ctx.moveTo(0, h * p);
        ctx.lineTo(w, h * p);
        ctx.stroke();
    });
    ctx.setLineDash([]);

    // Equator
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.5);
    ctx.lineTo(w, h * 0.5);
    ctx.stroke();

    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('Equator (0°)', w - 80, h * 0.5 - 5);

    // Tropics
    ctx.strokeStyle = 'rgba(243, 156, 18, 0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.42); ctx.lineTo(w, h * 0.42);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, h * 0.60); ctx.lineTo(w, h * 0.60);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(243, 156, 18, 0.8)';
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText('Tropic of Cancer (23.5°N)', w - 150, h * 0.42 - 3);
    ctx.fillText('Tropic of Capricorn (23.5°S)', w - 160, h * 0.60 + 12);

    // Simplified continent outlines using shapes
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    // North America
    drawContinent(ctx, w * 0.15, h * 0.18, w * 0.15, h * 0.25);
    // South America
    drawContinent(ctx, w * 0.22, h * 0.52, w * 0.08, h * 0.25);
    // Europe
    drawContinent(ctx, w * 0.45, h * 0.18, w * 0.12, h * 0.12);
    // Africa
    drawContinent(ctx, w * 0.45, h * 0.35, w * 0.12, h * 0.28);
    // Asia
    drawContinent(ctx, w * 0.58, h * 0.15, w * 0.25, h * 0.25);
    // Australia
    drawContinent(ctx, w * 0.75, h * 0.60, w * 0.1, h * 0.1);

    ctx.lineWidth = 1;
}

function drawContinent(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
}

// ─── EMPIRE MAP ───
function drawEmpireMap(empire) {
    const canvas = document.getElementById('empireMapCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    // Base India outline (simplified)
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.15);
    ctx.lineTo(w * 0.7, h * 0.15);
    ctx.lineTo(w * 0.75, h * 0.4);
    ctx.lineTo(w * 0.6, h * 0.85);
    ctx.lineTo(w * 0.5, h * 0.9);
    ctx.lineTo(w * 0.4, h * 0.8);
    ctx.lineTo(w * 0.25, h * 0.4);
    ctx.closePath();
    ctx.fill();

    let empireColor, empireName, empireArea;
    switch (empire) {
        case 'maurya':
            empireColor = 'rgba(255, 152, 0, 0.3)';
            empireName = 'Maurya Empire (322-185 BCE)';
            // Large coverage
            empireArea = [[0.3, 0.15], [0.7, 0.15], [0.72, 0.45], [0.6, 0.7], [0.5, 0.75], [0.4, 0.65], [0.28, 0.4]];
            break;
        case 'mughal':
            empireColor = 'rgba(76, 175, 80, 0.3)';
            empireName = 'Mughal Empire (1526-1857)';
            empireArea = [[0.32, 0.15], [0.68, 0.15], [0.7, 0.42], [0.6, 0.72], [0.5, 0.78], [0.42, 0.65], [0.3, 0.38]];
            break;
        case 'british':
            empireColor = 'rgba(244, 67, 54, 0.3)';
            empireName = 'British India (1858-1947)';
            empireArea = [[0.28, 0.12], [0.72, 0.12], [0.75, 0.42], [0.62, 0.82], [0.5, 0.9], [0.38, 0.78], [0.23, 0.38]];
            break;
    }

    // Draw empire area with animation
    ctx.fillStyle = empireColor;
    ctx.strokeStyle = empireColor.replace('0.3', '0.6');
    ctx.lineWidth = 2;
    ctx.beginPath();
    empireArea.forEach((p, i) => {
        const x = p[0] * w, y = p[1] * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(empireName, 15, 25);

    // Key cities
    const cities = [
        { x: 0.5, y: 0.25, name: 'Delhi' },
        { x: 0.38, y: 0.55, name: 'Mumbai' },
        { x: 0.62, y: 0.6, name: 'Kolkata' },
        { x: 0.55, y: 0.8, name: 'Chennai' },
    ];

    cities.forEach(c => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(c.x * w, c.y * h, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText(c.name, c.x * w + 6, c.y * h + 3);
    });
}

function showEmpire(empire) {
    drawEmpireMap(empire);
}

// ─── CHATBOT ───
let currentChatSubject = 'general';

function setChatSubject(subject) {
    currentChatSubject = subject;

    // Highlight active context button
    document.querySelectorAll('[id^="chatCtx-"]').forEach(btn => {
        btn.style.background = 'var(--bg-glass)';
        btn.style.borderColor = 'var(--border-glass)';
    });
    const activeBtn = document.getElementById(`chatCtx-${subject}`);
    if (activeBtn) {
        activeBtn.style.background = 'rgba(108, 92, 231, 0.2)';
        activeBtn.style.borderColor = '#6c5ce7';
    }

    addChatMessage('bot', `📚 Switched to ${subject.charAt(0).toUpperCase() + subject.slice(1)} context. Ask me anything about this subject!`);
}

async function sendChat() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    addChatMessage('user', message);

    // Show typing indicator
    const typingId = 'typing-' + Date.now();
    addChatMessage('bot', '⏳ Thinking...', typingId);

    try {
        const resp = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, subject: currentChatSubject })
        });
        const data = await resp.json();

        // Remove typing indicator
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();

        addChatMessage('bot', data.response);
    } catch (err) {
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();
        addChatMessage('bot', '❌ Could not connect to the server. Make sure Flask is running on port 5000.');
    }
}

function quickChat(msg) {
    document.getElementById('chatInput').value = msg;
    sendChat();
}

function addChatMessage(type, content, id) {
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = `chat-message ${type}`;
    if (id) msg.id = id;

    // Simple markdown-like formatting
    let formatted = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    msg.innerHTML = `<div class="msg-content">${formatted}</div>`;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

// ─── SCROLL TO CONTACT (for demo page CTA) ───
function scrollToContact() {
    window.location.href = '/#contact';
}

// ─── TOAST ───
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
