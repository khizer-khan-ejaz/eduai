/**
 * ═══════════════════════════════════════════════
 * MAIN.JS — Homepage Logic
 * AI Education Platform
 * ═══════════════════════════════════════════════
 */

// ─── STATE ───
let currentSubject = 'biology';
let homeQuizData = [];
let homeQuizIndex = 0;
let homeScore = { correct: 0, total: 0 };
let homeFlashcardIndex = 0;

// ─── FLASHCARD DATA ───
const FLASHCARD_DATA = {
    biology: [
        { emoji: '🫀', title: 'Human Heart', back: 'The human heart has 4 chambers: Right Atrium, Right Ventricle, Left Atrium, and Left Ventricle. It pumps ~5L of blood per minute.' },
        { emoji: '🧬', title: 'DNA Structure', back: 'DNA is a double helix made of nucleotides. Base pairs: Adenine-Thymine (A-T) and Guanine-Cytosine (G-C), connected by hydrogen bonds.' },
        { emoji: '🔬', title: 'Cell Membrane', back: 'The cell membrane is a phospholipid bilayer that controls what enters and exits the cell. It is semi-permeable and uses active/passive transport.' },
        { emoji: '🌱', title: 'Chloroplast', back: 'Chloroplasts contain chlorophyll for photosynthesis. They have thylakoids (light reactions) and stroma (Calvin cycle/dark reactions).' },
    ],
    physics: [
        { emoji: '🌊', title: 'Wave Properties', back: 'Waves transfer energy without transferring matter. Key properties: amplitude, frequency, wavelength, and speed. v = fλ.' },
        { emoji: '🍎', title: "Newton's Laws", back: "1st: Inertia, 2nd: F=ma, 3rd: Action-Reaction. These form the foundation of classical mechanics." },
        { emoji: '⚡', title: "Ohm's Law", back: "V = IR. Voltage equals current times resistance. Power P = VI = I²R = V²/R." },
        { emoji: '🌡️', title: 'Thermodynamics', back: '0th: Thermal equilibrium. 1st: Energy conservation (ΔU = Q - W). 2nd: Entropy always increases. 3rd: Cannot reach absolute zero.' },
    ],
    chemistry: [
        { emoji: '⚗️', title: 'Chemical Bonding', back: 'Ionic bonds: electron transfer (NaCl). Covalent bonds: electron sharing (H₂O). Metallic bonds: electron sea model.' },
        { emoji: '🧪', title: 'Acids & Bases', back: 'Arrhenius: H⁺/OH⁻. Brønsted-Lowry: Proton donor/acceptor. Lewis: Electron pair acceptor/donor. pH = -log[H⁺].' },
        { emoji: '💎', title: 'Crystal Structure', back: 'Atoms arranged in repeating 3D patterns. Types: FCC, BCC, HCP. Defines physical properties like melting point and hardness.' },
        { emoji: '🔥', title: 'Oxidation States', back: 'Oxidation = loss of electrons (increase in oxidation state). Reduction = gain of electrons (decrease). Remember: OIL RIG.' },
    ],
    maths: [
        { emoji: '📊', title: 'Derivatives', back: "The derivative f'(x) represents the instantaneous rate of change. Power rule: d/dx(xⁿ) = nxⁿ⁻¹. Chain rule: d/dx[f(g(x))] = f'(g(x))·g'(x)." },
        { emoji: '∫', title: 'Integration', back: 'Integration is the reverse of differentiation. ∫xⁿ dx = xⁿ⁺¹/(n+1) + C. Definite integrals compute area under curves.' },
        { emoji: '📐', title: 'Pythagorean Theorem', back: 'In a right triangle: a² + b² = c² where c is the hypotenuse. Extends to distance formula: d = √((x₂-x₁)² + (y₂-y₁)²).' },
        { emoji: '🔢', title: 'Matrices', back: 'A matrix is a rectangular array of numbers. Operations: addition, multiplication, transpose, inverse. det(A) ≠ 0 for invertible matrices.' },
    ],
    languages: [
        { emoji: '📝', title: 'Parts of Speech', back: '8 parts: Noun, Pronoun, Verb, Adjective, Adverb, Preposition, Conjunction, Interjection. Every sentence needs at least a subject and verb.' },
        { emoji: '📚', title: 'Active vs Passive', back: 'Active: Subject does the action (The cat chased the mouse). Passive: Subject receives the action (The mouse was chased by the cat).' },
        { emoji: '🗣️', title: 'Figures of Speech', back: 'Simile (like/as), Metaphor (is), Personification (human traits), Hyperbole (exaggeration), Alliteration (same sound), Onomatopoeia (sound words).' },
        { emoji: '✍️', title: 'Tenses', back: '12 tenses in English: Past/Present/Future × Simple/Continuous/Perfect/Perfect Continuous. Each expresses different time relationships.' },
    ],
    geography: [
        { emoji: '🌋', title: 'Plate Tectonics', back: 'Earth\'s lithosphere is divided into tectonic plates. Convergent: collide (mountains). Divergent: separate (rift valleys). Transform: slide past (earthquakes).' },
        { emoji: '🏔️', title: 'Mountain Types', back: 'Fold mountains (Himalayas), Volcanic (Fuji), Block (Sierra Nevada), Dome (Black Hills). Formed by tectonic forces and erosion.' },
        { emoji: '🌊', title: 'Ocean Currents', back: 'Warm currents (Gulf Stream) move from equator to poles. Cold currents (Labrador) move from poles. They regulate climate and marine ecosystems.' },
        { emoji: '🏜️', title: 'Climate Zones', back: 'Tropical (hot, wet), Dry (arid), Temperate (moderate), Continental (extreme seasons), Polar (very cold). Classified by Köppen system.' },
    ],
    history: [
        { emoji: '🏺', title: 'Indus Valley', back: 'One of the earliest urban civilizations (3300-1300 BCE). Advanced drainage, grid cities (Harappa, Mohenjo-daro), standardized weights.' },
        { emoji: '👑', title: 'Maurya Empire', back: 'Founded by Chandragupta Maurya (~322 BCE). Largest Indian empire. Ashoka embraced Buddhism after Kalinga War. Spread non-violence.' },
        { emoji: '🕌', title: 'Mughal Empire', back: 'Founded by Babur (1526). Peak under Akbar (religious tolerance), Shah Jahan (Taj Mahal), declined under Aurangzeb.' },
        { emoji: '🇮🇳', title: 'Indian Independence', back: 'Key figures: Gandhi (non-violence), Nehru, Bose, Patel. Salt March (1930), Quit India (1942). Independence on Aug 15, 1947.' },
    ],
};

const DEMO_LABELS = {
    biology: '<strong>🧬 Biology:</strong> Red blood cell flow simulation — Observe how RBCs travel through blood vessels',
    physics: '<strong>⚛️ Physics:</strong> Wave interference pattern — Two sources creating constructive & destructive interference',
    chemistry: '<strong>🧪 Chemistry:</strong> Methane (CH₄) molecule — Carbon atom bonded to 4 hydrogens in tetrahedral arrangement',
    maths: '<strong>📐 Mathematics:</strong> 3D surface plot of z = sin(x)·cos(y) — Animated multivariable function visualization',
    languages: '<strong>📖 Languages:</strong> Floating letter blocks representing the building blocks of language and literacy',
    geography: '<strong>🌍 Geography:</strong> Earth globe visualization showing land distribution and rotation',
    history: '<strong>🏛️ History:</strong> Timeline blocks representing key historical events through the ages',
};

// ─── INITIALIZATION ───
document.addEventListener('DOMContentLoaded', () => {
    // Init hero background
    if (document.getElementById('hero-canvas')) {
        ThreeScenes.initHero('hero-canvas');
    }

    // Init demo canvas
    if (document.getElementById('demo-canvas')) {
        ThreeScenes.initHomeDemo('demo-canvas', 'biology');
    }

    // Load initial quiz
    if (document.getElementById('homeQuizContent')) {
        loadHomeQuiz('biology');
    }

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('mainNav');
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile menu
    const menuBtn = document.getElementById('mobileMenuBtn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            document.getElementById('navLinks').classList.toggle('open');
        });
    }

    // Animate stats on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    });
    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) observer.observe(statsBar);
});

// ─── SUBJECT SELECTION ───
function selectSubject(subject) {
    currentSubject = subject;

    // Update active card
    document.querySelectorAll('.subject-card').forEach(card => {
        card.classList.toggle('active', card.dataset.subject === subject);
    });

    // Update 3D scene
    if (document.getElementById('demo-canvas')) {
        ThreeScenes.initHomeDemo('demo-canvas', subject);
    }

    // Update overlay label
    const label = document.getElementById('demoOverlayLabel');
    if (label) label.innerHTML = DEMO_LABELS[subject] || DEMO_LABELS.biology;

    // Load quiz
    homeQuizIndex = 0;
    homeScore = { correct: 0, total: 0 };
    if (document.getElementById('homeQuizContent')) {
        loadHomeQuiz(subject);
    }

    // Update flashcard
    homeFlashcardIndex = 0;
    if (document.getElementById('homeFlashcard')) {
        updateHomeFlashcard(subject);
    }
}

// ─── QUIZ SYSTEM ───
async function loadHomeQuiz(subject) {
    const container = document.getElementById('homeQuizContent');
    if (!container) return;
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const resp = await fetch(`/api/mcq?subject=${subject}&count=5`);
        const data = await resp.json();
        homeQuizData = data.questions;
        homeQuizIndex = 0;
        homeScore = { correct: 0, total: 0 };
        updateHomeScore();
        renderHomeQuestion();
    } catch (err) {
        container.innerHTML = '<p style="color:var(--text-muted);">Failed to load quiz. Make sure the Flask server is running.</p>';
    }
}

function renderHomeQuestion() {
    const container = document.getElementById('homeQuizContent');
    if (!container) return;

    if (homeQuizIndex >= homeQuizData.length) {
        container.innerHTML = `
            <div style="text-align:center; padding:1rem;">
                <div style="font-size:2.5rem; margin-bottom:0.5rem;">🎉</div>
                <h4>Quiz Complete!</h4>
                <p style="color:var(--text-secondary); margin:0.5rem 0;">Score: ${homeScore.correct}/${homeScore.total}</p>
                <button class="mcq-next-btn" onclick="loadHomeQuiz('${currentSubject}')">Try Again</button>
            </div>
        `;
        return;
    }

    const q = homeQuizData[homeQuizIndex];
    const markers = ['A', 'B', 'C', 'D'];

    container.innerHTML = `
        <div class="mcq-question">${q.question}</div>
        <div class="mcq-options">
            ${q.options.map((opt, i) => `
                <div class="mcq-option" onclick="answerHomeQuiz(${i}, ${q.correct})" id="homeOpt${i}">
                    <span class="option-marker">${markers[i]}</span>
                    <span>${opt}</span>
                </div>
            `).join('')}
        </div>
        <div class="mcq-explanation" id="homeExplanation">${q.explanation}</div>
    `;

    const difficulty = document.getElementById('homeDifficulty');
    if (difficulty) {
        difficulty.textContent = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
        difficulty.style.color = q.difficulty === 'easy' ? '#00b894' : q.difficulty === 'medium' ? '#fdcb6e' : '#e17055';
    }
}

function answerHomeQuiz(selected, correct) {
    const options = document.querySelectorAll('#homeQuizContent .mcq-option');
    if (!options.length) return;

    // Prevent double click
    if (options[0].style.pointerEvents === 'none') return;

    options.forEach((opt, i) => {
        opt.style.pointerEvents = 'none';
        if (i === correct) opt.classList.add('correct');
        if (i === selected && i !== correct) opt.classList.add('incorrect');
    });

    homeScore.total++;
    if (selected === correct) homeScore.correct++;
    updateHomeScore();

    const explanation = document.getElementById('homeExplanation');
    if (explanation) explanation.classList.add('show');

    setTimeout(() => {
        homeQuizIndex++;
        renderHomeQuestion();
    }, 2500);
}

function updateHomeScore() {
    const score = document.getElementById('homeScore');
    if (score) score.textContent = `${homeScore.correct}/${homeScore.total}`;
}

// ─── FLASHCARD SYSTEM ───
function updateHomeFlashcard(subject) {
    const cards = FLASHCARD_DATA[subject] || FLASHCARD_DATA.biology;
    const card = cards[homeFlashcardIndex % cards.length];

    const emoji = document.getElementById('homeFlashEmoji');
    const title = document.getElementById('homeFlashTitle');
    const back = document.getElementById('homeFlashBack');
    const flashcard = document.getElementById('homeFlashcard');

    if (!emoji || !title || !back || !flashcard) return;

    emoji.textContent = card.emoji;
    title.textContent = card.title;
    back.textContent = card.back;

    // Reset flip
    flashcard.classList.remove('flipped');
}

function flipFlashcard(prefix) {
    const el = document.getElementById(prefix + 'Flashcard');
    if (el) el.classList.toggle('flipped');
}

function nextFlashcard(prefix) {
    if (prefix === 'home') {
        const cards = FLASHCARD_DATA[currentSubject] || FLASHCARD_DATA.biology;
        homeFlashcardIndex = (homeFlashcardIndex + 1) % cards.length;
        updateHomeFlashcard(currentSubject);
    }
}

function prevFlashcard(prefix) {
    if (prefix === 'home') {
        const cards = FLASHCARD_DATA[currentSubject] || FLASHCARD_DATA.biology;
        homeFlashcardIndex = (homeFlashcardIndex - 1 + cards.length) % cards.length;
        updateHomeFlashcard(currentSubject);
    }
}

// ─── ANIMATE STATS ───
function animateStats() {
    document.querySelectorAll('.stat-number').forEach(el => {
        const target = parseInt(el.dataset.count);
        const suffix = el.textContent.includes('+') ? '+' : '';
        let current = 0;
        const step = Math.ceil(target / 60);
        const interval = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(interval);
            }
            el.textContent = current.toLocaleString() + suffix;
        }, 30);
    });
}

// ─── CONTACT FORM ───
async function submitContact(e) {
    e.preventDefault();

    const data = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        institute: document.getElementById('contactInstitute').value,
        message: document.getElementById('contactMessage').value,
    };

    try {
        const resp = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await resp.json();
        showToast(result.message, 'success');
        document.getElementById('contactForm').reset();
    } catch (err) {
        showToast('Something went wrong. Please try again.', 'error');
    }
}

function scrollToContact() {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ─── TOAST NOTIFICATION ───
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
