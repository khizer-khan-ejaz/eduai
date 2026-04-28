/**
 * cell-data.js — Biology knowledge base for cell organelles.
 * Maps mesh name keywords to rich educational descriptions.
 */

export const PLANT_ORGANELLES = {
    nucleus: {
        name: "Nucleus",
        icon: "🧬",
        function: "The control center of the cell",
        description: "The nucleus is the brain of the cell. It houses all of the cell's DNA (genetic material) organized into chromosomes. The nucleus controls cell activities like growth, metabolism, protein synthesis, and cell division. It is enclosed by a double-layered nuclear membrane with tiny pores.",
        badge: "common",
        color: "#6366f1",
        facts: [
            { icon: "📏", text: "Typically 5–10 µm in diameter" },
            { icon: "🧵", text: "Contains chromatin that condenses into chromosomes during division" },
            { icon: "🔵", text: "Has a nucleolus inside that makes ribosomal RNA" }
        ]
    },
    chloroplast: {
        name: "Chloroplast",
        icon: "🌿",
        function: "Site of photosynthesis",
        description: "Chloroplasts are the food factories of plant cells. They contain a green pigment called chlorophyll that captures sunlight energy and converts carbon dioxide (CO₂) and water (H₂O) into glucose (sugar) and oxygen (O₂). This process is called photosynthesis.",
        badge: "plant",
        color: "#22c55e",
        facts: [
            { icon: "☀️", text: "Equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂" },
            { icon: "📚", text: "Contains its own DNA — likely evolved from ancient cyanobacteria" },
            { icon: "🟢", text: "Has stacked thylakoids called grana inside" }
        ]
    },
    vacuole: {
        name: "Central Vacuole",
        icon: "💧",
        function: "Storage and structural support",
        description: "The central vacuole is a large, water-filled sac that can occupy up to 90% of a plant cell's volume. It stores water, nutrients, pigments, and waste products. It also provides turgor pressure — the force that keeps the plant cell rigid and upright.",
        badge: "plant",
        color: "#38bdf8",
        facts: [
            { icon: "🌊", text: "Stores water, ions, sugars, amino acids, and toxins" },
            { icon: "🏗️", text: "Turgor pressure prevents wilting in plants" },
            { icon: "🎨", text: "Can store pigments that give flowers their color" }
        ]
    },
    mitochondria: {
        name: "Mitochondria",
        icon: "⚡",
        function: "The powerhouse of the cell",
        description: "Mitochondria generate most of the cell's supply of ATP (adenosine triphosphate) — the chemical energy currency. They do this through a process called cellular respiration, breaking down glucose to release energy. They have their own DNA and double membrane.",
        badge: "common",
        color: "#ef4444",
        facts: [
            { icon: "🔋", text: "Produces ~36 ATP molecules per glucose molecule" },
            { icon: "🧬", text: "Has its own circular DNA (inherited from mother)" },
            { icon: "🔬", text: "Has an outer membrane and a folded inner membrane (cristae)" }
        ]
    },
    cell_membrane: {
        name: "Cell Membrane",
        icon: "🛡️",
        function: "The gatekeeper of the cell",
        description: "The cell membrane (plasma membrane) is a thin, flexible barrier made of a phospholipid bilayer with embedded proteins. It controls what enters and exits the cell, maintaining a stable internal environment. Think of it as the cell's security system.",
        badge: "common",
        color: "#a3e635",
        facts: [
            { icon: "🧱", text: "Made of a phospholipid bilayer (two layers of fat molecules)" },
            { icon: "🚪", text: "Uses active & passive transport to move molecules" },
            { icon: "🏷️", text: "Surface proteins help cells recognize each other" }
        ]
    },
    cell_wall: {
        name: "Cell Wall",
        icon: "🧱",
        function: "Rigid structural boundary",
        description: "The cell wall is a thick, rigid layer found outside the cell membrane in plant cells. It is made mainly of cellulose and provides structural support, protection, and shape to the cell. It allows water and dissolved substances to pass through freely.",
        badge: "plant",
        color: "#84cc16",
        facts: [
            { icon: "🌾", text: "Made primarily of cellulose (a complex carbohydrate)" },
            { icon: "💪", text: "Prevents the cell from bursting when water enters" },
            { icon: "🔗", text: "Connected to neighboring cells via plasmodesmata" }
        ]
    },
    endoplasmic_reticulum: {
        name: "Endoplasmic Reticulum",
        icon: "🔄",
        function: "Internal transport network",
        description: "The ER is a vast network of membranes that manufactures and transports materials inside the cell. Rough ER (with ribosomes) makes proteins. Smooth ER makes lipids and detoxifies chemicals.",
        badge: "common",
        color: "#c084fc",
        facts: [
            { icon: "📦", text: "Rough ER is studded with ribosomes for protein synthesis" },
            { icon: "🧴", text: "Smooth ER synthesizes lipids and steroid hormones" },
            { icon: "🚛", text: "Transports materials to the Golgi apparatus" }
        ]
    },
    golgi: {
        name: "Golgi Apparatus",
        icon: "📦",
        function: "The cell's shipping center",
        description: "The Golgi apparatus modifies, sorts, and packages proteins and lipids received from the ER. It prepares them for transport to other parts of the cell or for export outside the cell via vesicles.",
        badge: "common",
        color: "#f59e0b",
        facts: [
            { icon: "📬", text: "Consists of stacked, flattened membrane sacs (cisternae)" },
            { icon: "🏷️", text: "Adds molecular 'address labels' for protein delivery" },
            { icon: "🫧", text: "Creates lysosomes for cellular waste disposal" }
        ]
    },
    ribosome: {
        name: "Ribosomes",
        icon: "🔩",
        function: "Protein factories",
        description: "Ribosomes are tiny molecular machines that read messenger RNA instructions and assemble amino acids into proteins. They can be found floating freely in the cytoplasm or attached to the rough endoplasmic reticulum.",
        badge: "common",
        color: "#fbbf24",
        facts: [
            { icon: "🧩", text: "Made of two subunits: large and small" },
            { icon: "📖", text: "Reads mRNA codons and links amino acids" },
            { icon: "🏭", text: "A single cell can have millions of ribosomes" }
        ]
    }
};

export const ANIMAL_ORGANELLES = {
    nucleus: { ...PLANT_ORGANELLES.nucleus },
    mitochondria: { ...PLANT_ORGANELLES.mitochondria },
    ribosome: { ...PLANT_ORGANELLES.ribosome },
    golgi: { ...PLANT_ORGANELLES.golgi },
    endoplasmic_reticulum: { ...PLANT_ORGANELLES.endoplasmic_reticulum },
    cell_membrane: {
        name: "Cell Membrane",
        icon: "🛡️",
        function: "Flexible boundary of the animal cell",
        description: "Unlike plant cells which also have a rigid cell wall, the animal cell membrane is the only boundary. This phospholipid bilayer is flexible, allowing the cell to change shape, move, and engulf food particles (phagocytosis).",
        badge: "animal",
        color: "#65a30d",
        facts: [
            { icon: "🧱", text: "Phospholipid bilayer with cholesterol for flexibility" },
            { icon: "🔄", text: "Allows cell movement and shape changes" },
            { icon: "🍽️", text: "Enables phagocytosis (engulfing food)" }
        ]
    },
    lysosome: {
        name: "Lysosome",
        icon: "♻️",
        function: "Waste disposal and recycling",
        description: "Lysosomes are membrane-bound sacs filled with powerful digestive enzymes. They break down worn-out organelles, food particles, and invading bacteria or viruses. Think of them as the cell's recycling center and defense system.",
        badge: "animal",
        color: "#f97316",
        facts: [
            { icon: "🧪", text: "Contains over 50 different hydrolytic enzymes" },
            { icon: "🦠", text: "Destroys invading bacteria and viruses" },
            { icon: "⚠️", text: "If they burst, they can digest the entire cell (autolysis)" }
        ]
    },
    centriole: {
        name: "Centrioles",
        icon: "🎯",
        function: "Cell division organizer",
        description: "Centrioles are cylindrical structures found only in animal cells. During cell division, they help organize the spindle fibers that separate chromosomes. They come in pairs and are located near the nucleus.",
        badge: "animal",
        color: "#8b5cf6",
        facts: [
            { icon: "🔧", text: "Made of 9 triplets of microtubules arranged in a ring" },
            { icon: "🧫", text: "Help form the mitotic spindle during division" },
            { icon: "🏗️", text: "Also help form cilia and flagella" }
        ]
    },
    cytoplasm: {
        name: "Cytoplasm",
        icon: "🫧",
        function: "Jelly-like cellular medium",
        description: "The cytoplasm is the gel-like fluid that fills the interior of the cell between the nucleus and the cell membrane. It provides a medium where organelles float and where many cellular chemical reactions occur.",
        badge: "common",
        color: "#34d399",
        facts: [
            { icon: "🧊", text: "Composed of ~80% water plus salts, enzymes, and organic molecules" },
            { icon: "🏠", text: "Provides a supportive environment for organelles" },
            { icon: "⚗️", text: "Site of glycolysis (first step of cellular respiration)" }
        ]
    }
};

/**
 * Loading tips shown during model load
 */
export const LOADING_TIPS = [
    "A single human cell contains about 6 feet of DNA.",
    "The average human body has approximately 37.2 trillion cells.",
    "Red blood cells are the only cells without a nucleus.",
    "Plant cells are typically 10–100 µm in size.",
    "Mitochondria have their own DNA, inherited only from your mother.",
    "A cell's membrane is only about 7 nanometers thick.",
    "Your body produces about 3.8 million cells every second.",
    "Chloroplasts evolved from ancient photosynthetic bacteria."
];
