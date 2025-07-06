/**
 * Analyse de la structure de données actuelle
 * Programme Musical 2026
 */

// Structure détectée depuis votre index.html
const STRUCTURE_ANALYSIS = {
    // Sections de concerts identifiées
    sections: [
        {
            id: "ma-region-virtuose",
            title: "Ma région virtuose",
            type: "concert",
            piecesCount: 5
        },
        {
            id: "concert-eric-aubier", 
            title: "Concert du 11 d'avril avec Eric Aubier",
            type: "concert",
            piecesCount: 6
        },
        {
            id: "fete-musique",
            title: "Programme fête de la musique", 
            type: "concert",
            piecesCount: 2
        },
        {
            id: "autres-pieces",
            title: "Pièces qui n'ont pas trouvé leur concert",
            type: "collection",
            piecesCount: 2
        }
    ],
    
    // Structure d'une pièce musicale
    pieceStructure: {
        required: ["title"],
        optional: ["composer", "duration", "info"],
        links: ["audio", "original", "purchase"],
        format: {
            title: "string", // Titre de la pièce
            composer: "string", // Nom du compositeur/arrangeur
            duration: "string", // Format MM:SS ou "XX:XX"
            info: "string", // Commentaire/note sur la pièce
            links: {
                audio: "url", // Lien YouTube audio (🎵)
                original: "url", // Lien YouTube original (🎬) 
                purchase: "url" // Lien d'achat (🛒)
            }
        }
    },
    
    // Exemples de données extraites
    examples: {
        piece: {
            title: "Ammerland",
            composer: "Jacob de Haan", 
            duration: "03:10",
            info: "Très interessant pour le son mais assez chère",
            links: {
                audio: "https://www.youtube.com/watch?v=y5GQ0we6dOc",
                purchase: "https://www.laflutedepan.com/partition/10102812/de-haan-jacob-ammerland-concert-bandharmonie.html"
            }
        }
    }
};

// Mapping Notion → Site Web
const NOTION_MAPPING = {
    // Propriétés pour les concerts/programmes
    concerts: {
        "Nom du concert": "title",
        "Title": "title", 
        "Titre": "title",
        "Date": "date",
        "Durée estimée": "duration",
        "Duration": "duration",
        "Description": "description",
        "Notes": "info"
    },
    
    // Propriétés pour les pièces musicales
    pieces: {
        "Titre": "title",
        "Title": "title",
        "Nom de la pièce": "title",
        "Compositeur": "composer", 
        "Composer": "composer",
        "Auteur": "composer",
        "Durée": "duration",
        "Duration": "duration",
        "Temps": "duration",
        "Informations": "info",
        "Info": "info",
        "Notes": "info",
        "Commentaires": "info",
        "Lien Audio": "links.audio",
        "Audio": "links.audio", 
        "YouTube": "links.audio",
        "Lien Achat": "links.purchase",
        "Achat": "links.purchase",
        "Purchase": "links.purchase",
        "Partition": "links.purchase",
        "Lien Original": "links.original",
        "Original": "links.original",
        "Video": "links.original",
        "Programme": "concert",
        "Concert": "concert"
    },
    
    // Propriétés pour les événements/répétitions
    events: {
        "Date": "date",
        "Evènement": "type",
        "Événement": "type", 
        "Event": "type",
        "Type": "type",
        "Multi-select": "pieces",
        "Pieces": "pieces",
        "Pièces": "pieces",
        "Programme": "pieces",
        "Notes": "notes",
        "Note": "notes",
        "Commentaires": "notes",
        "Info": "notes",
        "Informations": "notes"
    }
};

// Suggestions de structure Notion
const NOTION_SUGGESTIONS = {
    databases: [
        {
            name: "🎭 Concerts & Programmes",
            description: "Base principale pour les concerts et événements",
            properties: [
                { name: "Titre", type: "Title", description: "Nom du concert/programme" },
                { name: "Date", type: "Date", description: "Date de l'événement" },
                { name: "Durée estimée", type: "Text", description: "ex: 25 minutes, 1h30" },
                { name: "Description", type: "Text", description: "Description ou notes" },
                { name: "Statut", type: "Select", options: ["Planifié", "En cours", "Terminé", "Annulé"] },
                { name: "Type", type: "Select", options: ["Concert", "Festival", "Récital", "Autre"] }
            ]
        },
        {
            name: "🎵 Pièces Musicales", 
            description: "Répertoire de toutes les pièces musicales",
            properties: [
                { name: "Titre", type: "Title", description: "Nom de la pièce" },
                { name: "Compositeur", type: "Text", description: "Nom du compositeur/arrangeur" },
                { name: "Durée", type: "Text", description: "Format MM:SS (ex: 03:45)" },
                { name: "Informations", type: "Text", description: "Notes, commentaires, niveau" },
                { name: "Concert", type: "Relation", description: "Lien vers la base Concerts" },
                { name: "Lien Audio", type: "URL", description: "YouTube ou autre" },
                { name: "Lien Achat", type: "URL", description: "Partition, location" },
                { name: "Lien Original", type: "URL", description: "Version originale" },
                { name: "Niveau", type: "Select", options: ["Facile", "Moyen", "Difficile", "Expert"] },
                { name: "Genre", type: "Multi-select", options: ["Classique", "Film", "Jazz", "Populaire", "Marche"] }
            ]
        },
        {
            name: "💰 Financement",
            description: "Suivi des demandes de financement",
            properties: [
                { name: "Dispositif", type: "Title", description: "Nom du dispositif de financement" },
                { name: "Date limite", type: "Date", description: "Date limite de dépôt" },
                { name: "Montant", type: "Text", description: "Montant indicatif" },
                { name: "Probabilité", type: "Select", options: ["★", "★★", "★★★"] },
                { name: "Master-class", type: "Checkbox", description: "Master-class obligatoire" },
                { name: "Conditions", type: "Text", description: "Conditions clés" },
                { name: "Statut", type: "Select", options: ["À déposer", "Déposé", "Accepté", "Refusé"] }
            ]
        }
    ]
};

module.exports = {
    STRUCTURE_ANALYSIS,
    NOTION_MAPPING, 
    NOTION_SUGGESTIONS
};
