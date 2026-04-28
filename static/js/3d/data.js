// src/static/js/3d/data.js
/**
 * Maps mesh names to biological information for the UI Panel.
 * The keys should generally match the mesh names in your GLB file.
 * Keys are lowercased for case-insensitive matching.
 */
const CellBiologyData = {
    // Common
    "nucleus": {
        name: "Nucleus",
        function: "The control center of the cell.",
        description: "Contains the cell's DNA and genetic instructions. It coordinates cell activities like growth, metabolism, protein synthesis, and reproduction."
    },
    "mitochondria": {
        name: "Mitochondrion",
        function: "The powerhouse of the cell.",
        description: "Generates most of the chemical energy needed to power the cell's biochemical reactions through a process called cellular respiration."
    },
    "ribosome": {
        name: "Ribosomes",
        function: "Protein synthesizers.",
        description: "Tiny structures that read RNA instructions and link amino acids together to build proteins."
    },
    "cytoplasm": {
        name: "Cytoplasm",
        function: "Jelly-like substance filling the cell.",
        description: "Provides a medium for organelles to reside and where most cellular activities, like metabolic pathways, occur."
    },
    "golgi": {
        name: "Golgi Apparatus",
        function: "The cell's shipping center.",
        description: "Modifies, sorts, and packages proteins and lipids for transport."
    },

    // Plant specific
    "chloroplast": {
        name: "Chloroplast",
        function: "Site of photosynthesis.",
        description: "Contains chlorophyll, which captures sunlight to convert water and carbon dioxide into glucose (food for the plant)."
    },
    "vacuole": {
        name: "Central Vacuole",
        function: "Storage and structural support.",
        description: "A large sac that stores water, nutrients, and waste products. It also provides turgor pressure to keep the plant upright."
    },
    "cell_wall": {
        name: "Cell Wall",
        function: "Structural boundary.",
        description: "A rigid layer outside the cell membrane that provides structural support and protection to plant cells."
    },

    // Animal specific
    "cell_membrane": {
        name: "Cell Membrane",
        function: "The gatekeeper.",
        description: "A semi-permeable lipid bilayer that controls what enters and exits the cell."
    },
    "lysosome": {
        name: "Lysosome",
        function: "Waste disposal system.",
        description: "Contains digestive enzymes to break down excess or worn-out cell parts and invading viruses or bacteria."
    }
};

window.CellBiologyData = CellBiologyData;