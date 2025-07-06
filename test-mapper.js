const SmartMapper = require('./scripts/smart-mapper.js');

// Test avec les propriétés de la base "Programme répétitions 2025-2026"
const testDatabase = {
    title: [{ plain_text: "Programme répétitions 2025-2026" }],
    id: "test",
    properties: {
        "Evènement": { 
            type: "title",
            title: {}
        },
        "Date": { 
            type: "date",
            date: {}
        },
        "Multi-select": { 
            type: "multi_select",
            multi_select: {
                options: []
            }
        },
        "Notes": { 
            type: "rich_text",
            rich_text: {}
        }
    }
};

const mapper = new SmartMapper();

// Test direct de la fonction detectDatabaseType
console.log('🔍 Test de détection de type:');
const keys = Object.keys(testDatabase.properties).map(k => k.toLowerCase());
console.log('Clés des propriétés (lowercase):', keys);

// Test des indicateurs
const indicators = {
    concerts: ['concert', 'programme', 'date', 'événement', 'spectacle'],
    pieces: ['titre', 'compositeur', 'durée', 'pièce', 'musique', 'morceau'],
    financement: ['financement', 'dispositif', 'montant', 'subvention', 'aide'],
    events: ['date', 'événement', 'répétition', 'répétitions', 'multi-select', 'notes', 'evènement']
};

for (const [type, words] of Object.entries(indicators)) {
    const score = words.reduce((sum, word) => {
        const matches = keys.filter(key => key.includes(word));
        console.log(`  ${type} - mot "${word}" -> matches:`, matches);
        return sum + matches.length;
    }, 0);
    console.log(`Score pour ${type}: ${score}`);
}

const analysis = mapper.analyzeDatabaseStructure(testDatabase);
console.log('\nRésultat final:');
console.log('Type détecté:', analysis.detectedType);
console.log('Confiance:', analysis.confidence);
