"""
EduAI Demo Platform — Flask Backend
India's First AI Content Integration Partner for Educational Institutes
"""

from flask import Flask, render_template, request, jsonify
import json
import os
import random

app = Flask(__name__)

# ─── Load MCQ data ───────────────────────────────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
MODULES_DIR = os.path.join(DATA_DIR, 'modules')

def load_mcq_data():
    with open(os.path.join(DATA_DIR, 'mcq_data.json'), 'r', encoding='utf-8') as f:
        return json.load(f)

MCQ_DATA = load_mcq_data()

# ─── Load Science Learning Modules ───────────────────────────────────────────

def load_module_index():
    index_path = os.path.join(MODULES_DIR, 'index.json')
    if not os.path.exists(index_path):
        return {"modules": []}
    with open(index_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_module(module_id):
    """Load a full module JSON file by module_id."""
    index = MODULE_INDEX
    for mod in index.get('modules', []):
        if mod['module_id'] == module_id:
            filepath = os.path.join(MODULES_DIR, mod['file'])
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    return json.load(f)
    return None

def find_topic(module_data, topic_id):
    """Find a specific topic within a loaded module."""
    if not module_data:
        return None
    for topic in module_data.get('topics', []):
        if topic['topic_id'] == topic_id:
            return topic
    return None

MODULE_INDEX = load_module_index()

# Pre-load all modules into memory for fast search
MODULE_CACHE = {}
for _mod_entry in MODULE_INDEX.get('modules', []):
    _loaded = load_module(_mod_entry['module_id'])
    if _loaded:
        MODULE_CACHE[_mod_entry['module_id']] = _loaded

# ─── Chatbot knowledge base ─────────────────────────────────────────────────
CHAT_RESPONSES = {
    "biology": {
        "photosynthesis": "🌱 **Photosynthesis** is the process by which green plants convert sunlight, water (H₂O), and carbon dioxide (CO₂) into glucose (C₆H₁₂O₆) and oxygen (O₂).\n\n**Equation:** 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂\n\nIt occurs in the **chloroplasts** of plant cells, specifically in the thylakoid membranes and stroma.",
        "cell": "🔬 A **cell** is the basic structural and functional unit of life. There are two main types:\n\n• **Prokaryotic cells** — no nucleus (e.g., bacteria)\n• **Eukaryotic cells** — have a nucleus (e.g., plant, animal cells)\n\nKey organelles: nucleus, mitochondria, ribosomes, endoplasmic reticulum, Golgi apparatus.",
        "dna": "🧬 **DNA (Deoxyribonucleic Acid)** is the molecule that carries genetic instructions. It has a double helix structure discovered by Watson and Crick in 1953.\n\nDNA is made of nucleotides containing: a phosphate group, a sugar (deoxyribose), and a nitrogenous base (A, T, G, C).\n\n**Base pairing:** A-T (2 hydrogen bonds), G-C (3 hydrogen bonds).",
        "heart": "❤️ The **human heart** is a muscular organ with 4 chambers:\n\n• Right Atrium → receives deoxygenated blood\n• Right Ventricle → pumps blood to lungs\n• Left Atrium → receives oxygenated blood\n• Left Ventricle → pumps blood to body\n\nThe heart beats ~72 times per minute, pumping about 5 liters of blood.",
        "default": "🧬 I can help with Biology topics! Try asking about:\n• Photosynthesis\n• Cell structure\n• DNA\n• Human heart\n• Any biology concept!"
    },
    "physics": {
        "newton": "⚡ **Newton's Laws of Motion:**\n\n1️⃣ **First Law (Inertia):** An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.\n\n2️⃣ **Second Law:** F = ma (Force equals mass times acceleration)\n\n3️⃣ **Third Law:** For every action, there is an equal and opposite reaction.",
        "gravity": "🌍 **Gravity** is the force of attraction between any two masses.\n\n**Newton's Law of Gravitation:** F = G(m₁m₂)/r²\n\nWhere G = 6.674 × 10⁻¹¹ N⋅m²/kg²\n\nAcceleration due to gravity on Earth: g ≈ 9.8 m/s²",
        "wave": "🌊 **Waves** transfer energy without transferring matter.\n\n**Types:**\n• Transverse (light, water) — perpendicular oscillation\n• Longitudinal (sound) — parallel oscillation\n\n**Key equation:** v = fλ (velocity = frequency × wavelength)\n\nWave interference creates constructive (amplified) and destructive (cancelled) patterns.",
        "light": "💡 **Light** is an electromagnetic wave that travels at 3 × 10⁸ m/s in vacuum.\n\n**Properties:** reflection, refraction, diffraction, interference, polarization.\n\n**Dual nature:** Light behaves as both a wave and a particle (photon). E = hf, where h is Planck's constant.",
        "default": "⚛️ I can help with Physics topics! Try asking about:\n• Newton's Laws\n• Gravity\n• Waves\n• Light\n• Any physics concept!"
    },
    "chemistry": {
        "periodic": "🧪 The **Periodic Table** organizes 118 elements by atomic number.\n\n**Groups (columns):** Elements in the same group have similar properties.\n• Group 1: Alkali metals (Li, Na, K...)\n• Group 17: Halogens (F, Cl, Br...)\n• Group 18: Noble gases (He, Ne, Ar...)\n\n**Periods (rows):** Show increasing atomic number left to right.",
        "bond": "🔗 **Chemical Bonds:**\n\n• **Ionic Bond:** Transfer of electrons (Na⁺Cl⁻)\n• **Covalent Bond:** Sharing of electrons (H₂O)\n• **Metallic Bond:** Sea of shared electrons\n• **Hydrogen Bond:** Weak attraction (in water)\n\nBond strength: Covalent > Ionic > Hydrogen > Van der Waals",
        "acid": "⚗️ **Acids and Bases:**\n\n**Acids** (pH < 7): Donate H⁺ ions\n• HCl, H₂SO₄, HNO₃\n\n**Bases** (pH > 7): Donate OH⁻ ions\n• NaOH, KOH, Ca(OH)₂\n\n**Neutral** (pH = 7): Pure water\n\n**Litmus test:** Acid turns blue litmus red; Base turns red litmus blue.",
        "reaction": "⚡ **Types of Chemical Reactions:**\n\n1. **Combination:** A + B → AB\n2. **Decomposition:** AB → A + B\n3. **Displacement:** A + BC → AC + B\n4. **Double Displacement:** AB + CD → AD + CB\n5. **Combustion:** Fuel + O₂ → CO₂ + H₂O\n6. **Redox:** Involves oxidation and reduction",
        "default": "🧪 I can help with Chemistry topics! Try asking about:\n• Periodic Table\n• Chemical Bonds\n• Acids & Bases\n• Chemical Reactions\n• Any chemistry concept!"
    },
    "maths": {
        "calculus": "📐 **Calculus** is the study of change and has two branches:\n\n**Differential Calculus:**\n• Derivatives measure rate of change\n• d/dx(xⁿ) = nxⁿ⁻¹\n\n**Integral Calculus:**\n• Integrals measure area under curves\n• ∫xⁿ dx = xⁿ⁺¹/(n+1) + C\n\n**Fundamental Theorem:** Integration and differentiation are inverse operations.",
        "algebra": "📊 **Algebra** uses symbols (variables) to represent numbers.\n\n**Key concepts:**\n• Linear equations: ax + b = 0 → x = -b/a\n• Quadratic: ax² + bx + c = 0 → x = (-b ± √(b²-4ac))/2a\n• Polynomials, inequalities, functions\n\nAlgebra is the foundation for all advanced mathematics.",
        "trigonometry": "📐 **Trigonometry** studies relationships between angles and sides of triangles.\n\n**Basic ratios (SOH-CAH-TOA):**\n• sin θ = Opposite/Hypotenuse\n• cos θ = Adjacent/Hypotenuse\n• tan θ = Opposite/Adjacent\n\n**Key identity:** sin²θ + cos²θ = 1",
        "geometry": "📏 **Geometry** studies shapes, sizes, and spatial properties.\n\n**Area formulas:**\n• Circle: πr²\n• Triangle: ½ × base × height\n• Rectangle: length × width\n\n**Volume formulas:**\n• Sphere: (4/3)πr³\n• Cylinder: πr²h\n• Cone: (1/3)πr²h",
        "default": "📐 I can help with Maths topics! Try asking about:\n• Calculus\n• Algebra\n• Trigonometry\n• Geometry\n• Any math concept!"
    },
    "english": {
        "grammar": "📖 **English Grammar Basics:**\n\n**Parts of Speech:**\n1. Noun — person, place, thing\n2. Pronoun — replaces a noun (he, she, it)\n3. Verb — action word (run, write)\n4. Adjective — describes a noun (big, red)\n5. Adverb — modifies a verb (quickly, well)\n6. Preposition — shows relation (in, on, at)\n7. Conjunction — joins (and, but, or)\n8. Interjection — exclamation (wow!, oh!)",
        "tense": "⏰ **Tenses in English:**\n\n**Present:** I write / I am writing / I have written\n**Past:** I wrote / I was writing / I had written\n**Future:** I will write / I will be writing / I will have written\n\nTotal: 12 tenses (4 types × 3 times)\nTypes: Simple, Continuous, Perfect, Perfect Continuous",
        "vocabulary": "📚 **Vocabulary Building Tips:**\n\n1. Read extensively every day\n2. Learn word roots (Latin/Greek)\n3. Use context clues\n4. Practice with flashcards\n5. Write sentences using new words\n\n**Today's words:**\n• Ephemeral — lasting briefly\n• Ubiquitous — found everywhere\n• Pragmatic — practical, realistic",
        "default": "📖 I can help with English topics! Try asking about:\n• Grammar\n• Tenses\n• Vocabulary\n• Literature\n• Any English concept!"
    },
    "geography": {
        "climate": "🌍 **Climate Zones:**\n\n1. **Tropical** — hot & humid year-round (near equator)\n2. **Arid/Desert** — very dry, extreme temperatures\n3. **Temperate** — moderate temperatures, distinct seasons\n4. **Continental** — hot summers, cold winters\n5. **Polar** — extremely cold year-round\n\nClimate ≠ Weather. Climate is long-term average; weather is short-term.",
        "tectonic": "🌋 **Tectonic Plates:**\n\nEarth's lithosphere is divided into ~15 major plates that float on the asthenosphere.\n\n**Plate boundaries:**\n• **Convergent** — plates collide (mountains, subduction)\n• **Divergent** — plates move apart (mid-ocean ridges)\n• **Transform** — plates slide past (earthquakes)\n\nIndia sits on the Indo-Australian Plate.",
        "india": "🇮🇳 **India — Geographic Facts:**\n\n• Area: 3.287 million km² (7th largest)\n• States: 28 + 8 Union Territories\n• Highest point: Kangchenjunga (8,586 m)\n• Longest river: Ganga (2,525 km)\n• Coastline: 7,516 km\n• Climate: Tropical monsoon\n• Major deserts: Thar Desert\n• Major plateaus: Deccan Plateau",
        "default": "🌍 I can help with Geography topics! Try asking about:\n• Climate zones\n• Tectonic plates\n• India's geography\n• Countries & capitals\n• Any geography concept!"
    },
    "history": {
        "mughal": "🏛️ **Mughal Empire (1526-1857):**\n\n👑 **Emperors:**\n1. Babur (1526) — founded the empire\n2. Humayun (1530)\n3. Akbar (1556) — greatest Mughal emperor\n4. Jahangir (1605)\n5. Shah Jahan (1628) — built Taj Mahal\n6. Aurangzeb (1658) — last great Mughal\n\nThe empire unified much of the Indian subcontinent.",
        "independence": "🇮🇳 **Indian Independence Movement:**\n\n**Key events:**\n• 1857 — First War of Independence\n• 1885 — Indian National Congress founded\n• 1919 — Jallianwala Bagh massacre\n• 1920 — Non-Cooperation Movement\n• 1930 — Dandi March (Salt Satyagraha)\n• 1942 — Quit India Movement\n• 1947 — Independence on August 15",
        "world war": "⚔️ **World Wars:**\n\n**WWI (1914-1918):**\n• Trigger: Assassination of Archduke Franz Ferdinand\n• Allied vs Central Powers\n• ~20 million dead\n\n**WWII (1939-1945):**\n• Trigger: Germany's invasion of Poland\n• Allied vs Axis Powers\n• ~75 million dead\n• Ended with atomic bombs on Hiroshima & Nagasaki",
        "default": "🏛️ I can help with History topics! Try asking about:\n• Mughal Empire\n• Indian Independence\n• World Wars\n• Ancient civilizations\n• Any history topic!"
    }
}

# ─── Page Routes ─────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/demo')
def demo():
    return render_template('demo.html')

@app.route('/learn')
def learn():
    return render_template('learn.html')

# ─── API Routes ──────────────────────────────────────────────────────────────

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    subjects = [
        {"id": "biology", "name": "Biology", "icon": "🧬", "color": "#00d4aa",
         "description": "Explore life sciences with 3D blood flow simulations and interactive anatomy"},
        {"id": "physics", "name": "Physics", "icon": "⚛️", "color": "#6c5ce7",
         "description": "Visualize wave interference, projectile motion, and fundamental forces"},
        {"id": "chemistry", "name": "Chemistry", "icon": "🧪", "color": "#fd79a8",
         "description": "Interact with 3D molecules, reactions, and periodic table"},
        {"id": "maths", "name": "Mathematics", "icon": "📐", "color": "#fdcb6e",
         "description": "Plot 3D graphs, explore calculus, and visualize equations"},
        {"id": "english", "name": "English", "icon": "📖", "color": "#74b9ff",
         "description": "Build vocabulary, practice grammar, and master language skills"},
        {"id": "geography", "name": "Geography", "icon": "🌍", "color": "#55efc4",
         "description": "Explore climate zones, tectonic plates, and world map"},
        {"id": "history", "name": "History", "icon": "🏛️", "color": "#ffeaa7",
         "description": "Journey through timelines, empires, and historic events"}
    ]
    return jsonify({"subjects": subjects})

@app.route('/api/mcq', methods=['GET'])
def get_mcq():
    subject = request.args.get('subject', 'biology').lower()
    difficulty = request.args.get('difficulty', 'all')
    count = int(request.args.get('count', 5))

    if subject not in MCQ_DATA:
        return jsonify({"error": f"Subject '{subject}' not found",
                        "available": list(MCQ_DATA.keys())}), 404

    questions = MCQ_DATA[subject]

    # Filter by difficulty if specified
    if difficulty != 'all':
        filtered = [q for q in questions if q.get('difficulty') == difficulty]
        if filtered:
            questions = filtered

    # Random selection
    selected = random.sample(questions, min(count, len(questions)))

    return jsonify({
        "subject": subject,
        "count": len(selected),
        "questions": selected
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '').lower().strip()
    subject = data.get('subject', 'biology').lower()

    if not message:
        return jsonify({"error": "Message is required"}), 400

    # Get subject responses
    subject_responses = CHAT_RESPONSES.get(subject, CHAT_RESPONSES['biology'])

    # Find matching topic
    response = subject_responses.get('default', "I can help you learn! Please ask a specific question.")

    for keyword, answer in subject_responses.items():
        if keyword != 'default' and keyword in message:
            response = answer
            break

    return jsonify({
        "response": response,
        "subject": subject,
        "timestamp": "just now"
    })

@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.get_json()
    name = data.get('name', '')
    email = data.get('email', '')
    institute = data.get('institute', '')
    message = data.get('message', '')

    if not all([name, email, message]):
        return jsonify({"error": "Name, email and message are required"}), 400

    # In a real app, this would save to database / send email
    return jsonify({
        "success": True,
        "message": f"Thank you {name}! We'll contact you at {email} within 24 hours.",
        "reference": f"EDU-{random.randint(10000, 99999)}"
    })

# ─── Science Learning Module API Routes ──────────────────────────────────────

@app.route('/api/modules', methods=['GET'])
def get_modules():
    """List all available learning modules with metadata."""
    modules_list = []
    for mod in MODULE_INDEX.get('modules', []):
        modules_list.append({
            "module_id": mod['module_id'],
            "title": mod['title'],
            "icon": mod['icon'],
            "color": mod['color'],
            "description": mod['description'],
            "topics": mod['topics'],
            "topic_count": len(mod['topics']),
            "tags": mod.get('tags', []),
            "prerequisites": mod.get('prerequisites', []),
        })
    return jsonify({
        "count": len(modules_list),
        "modules": modules_list
    })


@app.route('/api/modules/<module_id>', methods=['GET'])
def get_module_detail(module_id):
    """Get full module data including all topics."""
    module_data = MODULE_CACHE.get(module_id)
    if not module_data:
        return jsonify({"error": f"Module '{module_id}' not found",
                        "available": list(MODULE_CACHE.keys())}), 404

    # Build a summary (without full quiz/visualization data for overview)
    include_full = request.args.get('full', 'false').lower() == 'true'

    if include_full:
        return jsonify(module_data)

    # Summary view
    topics_summary = []
    for topic in module_data.get('topics', []):
        topics_summary.append({
            "topic_id": topic['topic_id'],
            "title": topic['title'],
            "order": topic['order'],
            "explanation_simple": topic['explanation']['simple'],
            "formula_count": len(topic.get('formulas', [])),
            "quiz_mcq_count": len(topic.get('quiz', {}).get('mcq', [])),
            "quiz_short_count": len(topic.get('quiz', {}).get('short_answer', [])),
            "has_visualization": 'visualization_3d' in topic,
            "has_proofs": 'theorem_proofs' in topic,
            "real_world_examples": len(topic.get('real_world_examples', [])),
        })

    return jsonify({
        "module_id": module_data['module_id'],
        "module_title": module_data['module_title'],
        "version": module_data.get('version', '1.0.0'),
        "topic_count": len(topics_summary),
        "topics": topics_summary
    })


@app.route('/api/modules/<module_id>/topics/<topic_id>', methods=['GET'])
def get_topic(module_id, topic_id):
    """Get a specific topic with all content."""
    module_data = MODULE_CACHE.get(module_id)
    if not module_data:
        return jsonify({"error": f"Module '{module_id}' not found"}), 404

    topic = find_topic(module_data, topic_id)
    if not topic:
        available = [t['topic_id'] for t in module_data.get('topics', [])]
        return jsonify({"error": f"Topic '{topic_id}' not found in module '{module_id}'",
                        "available_topics": available}), 404

    return jsonify({
        "module_id": module_id,
        "module_title": module_data['module_title'],
        "topic": topic
    })


@app.route('/api/modules/<module_id>/topics/<topic_id>/quiz', methods=['GET'])
def get_topic_quiz(module_id, topic_id):
    """Get quiz questions for a specific topic. Supports type and count filters."""
    module_data = MODULE_CACHE.get(module_id)
    if not module_data:
        return jsonify({"error": f"Module '{module_id}' not found"}), 404

    topic = find_topic(module_data, topic_id)
    if not topic:
        return jsonify({"error": f"Topic '{topic_id}' not found"}), 404

    quiz = topic.get('quiz', {})
    quiz_type = request.args.get('type', 'all')  # 'mcq', 'short_answer', 'all'
    difficulty = request.args.get('difficulty', 'all')
    count = int(request.args.get('count', 50))
    shuffle = request.args.get('shuffle', 'false').lower() == 'true'

    result = {"module_id": module_id, "topic_id": topic_id, "topic_title": topic['title']}

    if quiz_type in ('mcq', 'all'):
        mcqs = quiz.get('mcq', [])
        if difficulty != 'all':
            mcqs = [q for q in mcqs if q.get('difficulty') == difficulty]
        if shuffle:
            mcqs = list(mcqs)
            random.shuffle(mcqs)
        result['mcq'] = mcqs[:count]
        result['mcq_count'] = len(result['mcq'])

    if quiz_type in ('short_answer', 'all'):
        shorts = quiz.get('short_answer', [])
        if shuffle:
            shorts = list(shorts)
            random.shuffle(shorts)
        result['short_answer'] = shorts[:count]
        result['short_answer_count'] = len(result['short_answer'])

    return jsonify(result)


@app.route('/api/modules/<module_id>/topics/<topic_id>/visualization', methods=['GET'])
def get_topic_visualization(module_id, topic_id):
    """Get 3D visualization instructions and interaction config for a topic."""
    module_data = MODULE_CACHE.get(module_id)
    if not module_data:
        return jsonify({"error": f"Module '{module_id}' not found"}), 404

    topic = find_topic(module_data, topic_id)
    if not topic:
        return jsonify({"error": f"Topic '{topic_id}' not found"}), 404

    viz = topic.get('visualization_3d', {})
    interaction = topic.get('interaction', {})

    return jsonify({
        "module_id": module_id,
        "topic_id": topic_id,
        "topic_title": topic['title'],
        "visualization_3d": viz,
        "interaction": interaction
    })


@app.route('/api/modules/<module_id>/topics/<topic_id>/formulas', methods=['GET'])
def get_topic_formulas(module_id, topic_id):
    """Get LaTeX formulas and variable descriptions for a topic."""
    module_data = MODULE_CACHE.get(module_id)
    if not module_data:
        return jsonify({"error": f"Module '{module_id}' not found"}), 404

    topic = find_topic(module_data, topic_id)
    if not topic:
        return jsonify({"error": f"Topic '{topic_id}' not found"}), 404

    return jsonify({
        "module_id": module_id,
        "topic_id": topic_id,
        "topic_title": topic['title'],
        "formulas": topic.get('formulas', []),
        "formula_count": len(topic.get('formulas', []))
    })


@app.route('/api/modules/<module_id>/topics/<topic_id>/examples', methods=['GET'])
def get_topic_examples(module_id, topic_id):
    """Get real-world examples for a topic."""
    module_data = MODULE_CACHE.get(module_id)
    if not module_data:
        return jsonify({"error": f"Module '{module_id}' not found"}), 404

    topic = find_topic(module_data, topic_id)
    if not topic:
        return jsonify({"error": f"Topic '{topic_id}' not found"}), 404

    return jsonify({
        "module_id": module_id,
        "topic_id": topic_id,
        "topic_title": topic['title'],
        "real_world_examples": topic.get('real_world_examples', []),
        "count": len(topic.get('real_world_examples', []))
    })


@app.route('/api/modules/search', methods=['GET'])
def search_modules():
    """Full-text search across all modules, topics, formulas, and quizzes."""
    query = request.args.get('q', '').lower().strip()
    if not query or len(query) < 2:
        return jsonify({"error": "Search query must be at least 2 characters",
                        "usage": "/api/modules/search?q=kinetic+energy"}), 400

    results = []

    for mod_id, mod_data in MODULE_CACHE.items():
        for topic in mod_data.get('topics', []):
            score = 0
            matches = []

            # Search in title
            if query in topic['title'].lower():
                score += 10
                matches.append('title')

            # Search in explanations
            if query in topic['explanation'].get('simple', '').lower():
                score += 5
                matches.append('explanation_simple')
            if query in topic['explanation'].get('advanced', '').lower():
                score += 3
                matches.append('explanation_advanced')

            # Search in formulas
            for formula in topic.get('formulas', []):
                if query in formula.get('name', '').lower():
                    score += 7
                    matches.append(f"formula:{formula['name']}")

            # Search in quiz questions
            for q in topic.get('quiz', {}).get('mcq', []):
                if query in q.get('question', '').lower():
                    score += 2
                    matches.append('quiz_mcq')

            # Search in real-world examples
            for ex in topic.get('real_world_examples', []):
                if query in ex.get('title', '').lower() or query in ex.get('description', '').lower():
                    score += 4
                    matches.append(f"example:{ex['title']}")

            if score > 0:
                results.append({
                    "module_id": mod_id,
                    "module_title": mod_data['module_title'],
                    "topic_id": topic['topic_id'],
                    "topic_title": topic['title'],
                    "relevance_score": score,
                    "matched_in": list(set(matches)),
                    "explanation_preview": topic['explanation']['simple'][:200] + '...',
                    "endpoint": f"/api/modules/{mod_id}/topics/{topic['topic_id']}"
                })

    # Sort by relevance
    results.sort(key=lambda x: x['relevance_score'], reverse=True)

    return jsonify({
        "query": query,
        "result_count": len(results),
        "results": results[:20]  # Cap at 20 results
    })


@app.route('/api/modules/stats', methods=['GET'])
def module_stats():
    """Get aggregate statistics across all modules."""
    total_topics = 0
    total_formulas = 0
    total_mcqs = 0
    total_short_answers = 0
    total_examples = 0
    total_proofs = 0
    total_visualizations = 0

    for mod_id, mod_data in MODULE_CACHE.items():
        for topic in mod_data.get('topics', []):
            total_topics += 1
            total_formulas += len(topic.get('formulas', []))
            total_mcqs += len(topic.get('quiz', {}).get('mcq', []))
            total_short_answers += len(topic.get('quiz', {}).get('short_answer', []))
            total_examples += len(topic.get('real_world_examples', []))
            total_proofs += len(topic.get('theorem_proofs', []))
            if 'visualization_3d' in topic:
                total_visualizations += 1

    return jsonify({
        "module_count": len(MODULE_CACHE),
        "topic_count": total_topics,
        "formula_count": total_formulas,
        "mcq_count": total_mcqs,
        "short_answer_count": total_short_answers,
        "real_world_example_count": total_examples,
        "theorem_proof_count": total_proofs,
        "visualization_count": total_visualizations,
        "total_quiz_questions": total_mcqs + total_short_answers
    })

# ─── Run ─────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    app.run(debug=True, port=5000)
