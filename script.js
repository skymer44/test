// 📱 PWA Service Worker Registration (simple)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker enregistré');
        } catch (error) {
            console.error('❌ Échec Service Worker:', error);
        }
    });
}
// �📱 FONCTIONS MOBILE-FIRST
function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0) ||
           window.innerWidth <= 768;
}

// Configuration adaptée au device
function getDeviceConfig() {
    const mobile = isMobileDevice();
    return {
        isMobile: mobile,
        showUpdateIndicator: !mobile, // ✅ Pas d'indicateur "mis à jour" sur mobile
        showCalendarText: !mobile,    // ✅ Pas de texte calendrier sur mobile
        compactView: mobile           // ✅ Vue compacte sur mobile
    };
}


// ========================================
// FONCTIONS UTILITAIRES POUR EXTRACTION NOTION
// ========================================

/**
 * Extrait proprement un titre depuis les données Notion (gère objets et tableaux)
 */
function extractCleanTitle(titleData) {
    if (Array.isArray(titleData) && titleData.length > 0) {
        if (typeof titleData[0] === 'object' && titleData[0].name) {
            return titleData[0].name;
        } else if (typeof titleData[0] === 'string') {
            return titleData[0];
        }
    } else if (typeof titleData === 'object' && titleData && titleData.name) {
        return titleData.name;
    } else if (typeof titleData === 'string') {
        return titleData;
    }
    return 'Événement';
}

/**
 * Extrait proprement un type depuis les données Notion (gère objets et tableaux)
 */
function extractCleanType(typeData) {
    if (Array.isArray(typeData) && typeData.length > 0) {
        if (typeof typeData[0] === 'object' && typeData[0].name) {
            return typeData[0].name;
        } else if (typeof typeData[0] === 'string') {
            return typeData[0];
        }
    } else if (typeof typeData === 'object' && typeData && typeData.name) {
        return typeData.name;
    } else if (typeof typeData === 'string') {
        return typeData;
    }
    return 'Événement';
}


// 🎵 CHARGEUR DE DONNÉES NOTION ROBUSTE
class NotionDataLoader {
    constructor() {
        this.cache = new Map();
        this.baseUrl = window.location.origin + window.location.pathname.replace('/index.html', '');
    }

    async loadData(fileName, fallback = []) {
        if (this.cache.has(fileName)) {
            return this.cache.get(fileName);
        }

        const urls = [
            `${this.baseUrl}/data/${fileName}`,
            `./data/${fileName}`,
            `/data/${fileName}`,
            `data/${fileName}`
        ];

        for (const url of urls) {
            try {
                console.log(`🔄 Tentative de chargement: ${url}`);
                const response = await fetch(url + '?t=' + Date.now());
                
                if (response.ok) {
                    const data = await response.json();
                    this.cache.set(fileName, data);
                    console.log(`✅ Données chargées depuis: ${url}`);
                    return data;
                }
            } catch (error) {
                console.warn(`⚠️ Échec ${url}:`, error.message);
            }
        }

        console.warn(`⚠️ Impossible de charger ${fileName}, utilisation du fallback`);
        return fallback;
    }

    async loadPieces() {
        const data = await this.loadData('pieces.json', { pieces: [] });
        return data.pieces || [];
    }

    async loadEvents() {
        const data = await this.loadData('events.json', { events: [] });
        return data.events || [];
    }

    async loadConcerts() {
        const data = await this.loadData('concerts.json', { concerts: [] });
        return data.concerts || [];
    }
}

// Instance globale du chargeur
window.notionLoader = new NotionDataLoader();

// 🔄 FONCTION DE CHARGEMENT DES DONNÉES NOTION AMÉLIORÉE
async function loadNotionDataRobust() {
    try {
        console.log('🎵 Chargement des données Notion...');
        
        // Charger toutes les données en parallèle
        const [pieces, events, concerts] = await Promise.all([
            window.notionLoader.loadPieces(),
            window.notionLoader.loadEvents(),
            window.notionLoader.loadConcerts()
        ]);

        console.log(`✅ Données Notion chargées: ${pieces.length} pièces, ${events.length} événements, ${concerts.length} concerts`);
        
        // Mettre à jour l'affichage
        if (pieces.length > 0) {
            updateConcertsWithNotionData(pieces);
        }
        
        if (events.length > 0) {
            updateEventsWithNotionData(events);
        }

        return { pieces, events, concerts };

    } catch (error) {
        console.error('❌ Erreur chargement données Notion:', error);
        return { pieces: [], events: [], concerts: [] };
    }
}

// 🎭 MISE À JOUR DES CONCERTS AVEC DONNÉES NOTION
function updateConcertsWithNotionData(pieces) {
    // Organiser les pièces par sections
    const sections = organizePiecesBySections(pieces);
    
    // Mettre à jour chaque section
    Object.values(sections).forEach(section => {
        if (section.pieces.length > 0) {
            updateSectionDisplay(section);
        }
    });
}

function organizePiecesBySections(pieces) {
    const sections = {};
    
    const sectionMapping = {
        'Ma région virtuose': 'ma-region-virtuose',
        'Concert du 11 d\'avril avec Eric Aubier': 'concert-eric-aubier',
        'Insertion dans les 60 ans du Conservatoire ': 'conservatoire-60-ans',
        'Retour Karaoké': 'retour-karaoke',
        'Programme fête de la musique': 'fete-musique',
        'Loto': 'loto',
        'Pièces d\'ajout sans direction': 'pieces-ajout',
        'Pièces qui n\'ont pas trouvé leur concert': 'pieces-orphelines'
    };
    
    // Initialiser les sections
    Object.entries(sectionMapping).forEach(([dbName, sectionId]) => {
        sections[sectionId] = {
            id: sectionId,
            title: dbName,
            pieces: []
        };
    });
    
    // Répartir les pièces
    pieces.forEach(piece => {
        const dbName = piece.source?.database;
        if (dbName) {
            const normalizedName = dbName.replace(/[’‘‛`´]/g, "'");
            const sectionId = sectionMapping[normalizedName] || 'pieces-orphelines';
            
            if (sections[sectionId]) {
                sections[sectionId].pieces.push(piece);
            }
        }
    });
    
    return sections;
}

function updateSectionDisplay(section) {
    const sectionElement = document.getElementById(section.id);
    if (!sectionElement) {
        console.warn(`⚠️ Section ${section.id} non trouvée dans le DOM`);
        return;
    }
    
    const piecesGrid = sectionElement.querySelector('.pieces-grid');
    if (piecesGrid) {
        // Vider la grille actuelle
        piecesGrid.innerHTML = '';
        
        // Ajouter les nouvelles pièces
        section.pieces.forEach(piece => {
            const pieceElement = createPieceElement(piece);
            piecesGrid.appendChild(pieceElement);
        });
        
        console.log(`✅ Section ${section.title}: ${section.pieces.length} pièces mises à jour`);
    }
}

function createPieceElement(piece) {
    const div = document.createElement('div');
    div.className = 'piece-card';
    
    let linksHTML = '';
    if (piece.links) {
        const links = [];
        if (piece.links.audio) links.push(`<a href="${piece.links.audio}" target="_blank" title="Arrangement audio">🎵 Audio</a>`);
        if (piece.links.original) links.push(`<a href="${piece.links.original}" target="_blank" title="Œuvre originale">🎬 Original</a>`);
        if (piece.links.purchase) links.push(`<a href="${piece.links.purchase}" target="_blank" title="Lien d'achat">🛒 Achat</a>`);
        
        if (links.length > 0) {
            linksHTML = `<div class="links">${links.join(' ')}</div>`;
        }
    }
    
    div.innerHTML = `
        <h3>${piece.title}</h3>
        ${piece.composer ? `<p><strong>Compositeur:</strong> ${piece.composer}</p>` : ''}
        ${piece.duration ? `<p><strong>Durée:</strong> ${piece.duration}</p>` : ''}
        ${piece.info ? `<p><strong>Info:</strong> ${piece.info}</p>` : ''}
        ${linksHTML}
    `;
    
    return div;
}

// 🎭 MISE À JOUR DES ÉVÉNEMENTS AVEC DONNÉES NOTION
function updateEventsWithNotionData(events) {
    // Mettre à jour l'affichage des événements
    console.log(`🗓️ Mise à jour de ${events.length} événements`);
    // Implémentation selon votre structure HTML existante
}


// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('Fiche Musicien - Chargement terminé!');
    
    // Initialiser les onglets en priorité
    initTabs();
    
    // Initialiser les autres fonctionnalités
    try {
        initNextEventsSystem(); // Nouveau système d'événements
        initVideoModal();
        addSearchFunctionality();
        initScrollAnimations();
        addTooltips();
        addBackToTopButton();
        initPDFGeneration();
        initNotionSync();
        
        // Charger les données Notion de façon robuste
        loadNotionDataRobust().then(data => {
            console.log('🎵 Données Notion intégrées au site:', data);
        }).catch(error => {
            console.warn('⚠️ Chargement Notion échoué, site fonctionne avec données statiques');
        });
        initManualSync();
    } catch (error) {
        console.log('Certaines fonctionnalités avancées ne se sont pas chargées:', error);
    }
    
    console.log('✅ Site web complètement initialisé et prêt!');
console.log('🚫 SYSTÈME DE RECHARGEMENT AUTOMATIQUE DÉSACTIVÉ - Plus d\'interruptions!');

// 🛡️ PROTECTION ANTI-RECHARGEMENT : Intercepter toute tentative de rechargement automatique
(function() {
    const originalReload = Location.prototype.reload;
    Location.prototype.reload = function(forcedReload) {
        console.warn('🚫 Tentative de rechargement interceptée et bloquée pour éviter les interruptions');
        console.log('💡 Pour recharger manuellement, utilisez F5 ou les contrôles du navigateur');
        
        // Afficher une notification au lieu de recharger
        if (typeof showNotification === 'function') {
            showNotification('🔄 Rechargement automatique bloqué - Utilisez F5 pour actualiser manuellement', 'warning', 4000);
        }
        
        return false; // Bloquer le rechargement
    };
    
    console.log('🛡️ Protection anti-rechargement activée');
})();
});

// Initialisation des onglets - VERSION SIMPLE ET ROBUSTE
function initTabs() {
    console.log('🔄 Initialisation des onglets...');
    
    const tabButtons = document.querySelectorAll('.tab-button');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('Onglets desktop trouvés:', tabButtons.length, 'Onglets mobile trouvés:', mobileNavItems.length, 'Contenus trouvés:', tabContents.length);
    
    // Debug: Lister tous les éléments trouvés
    console.log('📱 Éléments mobiles détectés:');
    mobileNavItems.forEach((item, index) => {
        const dataTab = item.getAttribute('data-tab');
        console.log(`  ${index}: data-tab="${dataTab}"`);
    });
    
    console.log('💻 Éléments desktop détectés:');
    tabButtons.forEach((button, index) => {
        const dataTab = button.getAttribute('data-tab');
        console.log(`  ${index}: data-tab="${dataTab}"`);
    });
    
    console.log('📄 Contenus d\'onglets détectés:');
    tabContents.forEach((content, index) => {
        console.log(`  ${index}: id="${content.id}"`);
    });
    
    // Fonction pour afficher un onglet
    function showTab(targetId) {
        console.log('Affichage onglet:', targetId);
        
        // Masquer tous les contenus d'onglets
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Désactiver tous les boutons d'onglets desktop
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Désactiver tous les items de navigation mobile
        mobileNavItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Afficher le contenu de l'onglet ciblé
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.classList.add('active');
            console.log('✅ Onglet', targetId, 'activé');
        } else {
            console.error('❌ Contenu introuvable pour:', targetId);
        }
        
        // Activer le bouton correspondant (desktop)
        const activeButton = document.querySelector(`.tab-button[data-tab="${targetId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Activer l'item correspondant (mobile)
        const activeMobileItem = document.querySelector(`.mobile-nav-item[data-tab="${targetId}"]`);
        if (activeMobileItem) {
            activeMobileItem.classList.add('active');
        }
    }
    
    // Gérer les clics sur les boutons d'onglets desktop
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-tab');
            showTab(targetId);
        });
    });
    
    // Gérer les clics sur la navigation mobile
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-tab');
            console.log('🔄 Mobile - Clic sur onglet:', targetId);
            showTab(targetId);
        });
    });
    
    // Activer le premier onglet par défaut
    if (tabButtons.length > 0) {
        const firstTabId = tabButtons[0].getAttribute('data-tab');
        showTab(firstTabId);
    }
}

// ========================================
// SYSTÈME DE GESTION DES PROCHAINS ÉVÉNEMENTS
// ========================================

// Données d'événements temporaires (sera remplacé par Notion)
const tempEventsData = [
    {
        date: "2025-07-08",
        type: "Pas de répétition",
        title: "Vacances d'été",
        pieces: ["Test piece 1", "Test piece 2"], // Ces pièces ne doivent pas s'afficher
        notes: "Pas de répétition pendant les vacances d'été"
    },
    {
        date: "2025-07-15",
        type: "Répétition pendant les vacances",
        title: "Répétition exceptionnelle",
        pieces: ["Ammerland", "The Lion King"], // Ces pièces DOIVENT s'afficher
        notes: "Répétition exceptionnelle pendant les vacances"
    },
    {
        date: "2025-09-04",
        type: "Répétition",
        title: "Première répétition de l'année",
        pieces: ["Allegretto from Symphony No. 7", "Ammerland", "The Lion King"],
        notes: "Première répétition de l'année. Première lecture des pièces"
    },
    {
        date: "2025-09-11", 
        type: "Répétition",
        title: "Répétition",
        pieces: ["Music from How To Train Your Dragon", "Selections from The Nightmare Before Christmas"],
        notes: "Pièces déjà lues une fois avant les vacances"
    },
    {
        date: "2025-09-18",
        type: "Répétition", 
        title: "Répétition",
        pieces: [],
        notes: ""
    },
    {
        date: "2025-01-25",
        type: "Ma Région Virtuose",
        title: "Ma Région Virtuose",
        pieces: ["Allegretto from Symphony No. 7", "Ammerland", "Music from How To Train Your Dragon", "Selections from The Nightmare Before Christmas", "The Lion King"],
        notes: "Date provisoire à confirmer"
    }
];

/**
 * Initialise le système des prochains événements
 */
function initNextEventsSystem() {
    console.log('🗓️ Initialisation du système des prochains événements...');
    
    // Charger et afficher les événements
    loadAndDisplayEvents();
    
    // Configurer les boutons d'interaction
    setupEventInteractions();
    
    // DÉSACTIVÉ : Mettre à jour automatiquement les données pour éviter les rafraîchissements intempestifs
    // setInterval(updateEventDisplay, 60000); // Mettre à jour toutes les minutes
    
    console.log('✅ Système des prochains événements initialisé (sans mise à jour automatique)');
}

/**
 * Charge et affiche les événements
 */
async function loadAndDisplayEvents() {
    try {
        const eventsData = await loadEventsData();
        
        // Calculer le prochain événement et les suivants
        const { nextEvent, upcomingEvents, allEvents } = processEvents(eventsData);
        
        // Sauvegarder les données globalement pour les interactions
        window.currentNextEvent = nextEvent;
        window.currentUpcomingEvents = upcomingEvents;
        window.currentAllEvents = allEvents;
        window.displayedEventsCount = 0; // Compteur pour le scroll infini
        
        // Afficher le prochain événement principal
        displayMainEvent(nextEvent);
        
        // Initialiser l'affichage progressif des événements
        initProgressiveEventDisplay(upcomingEvents);
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des événements:', error);
        displayEventError();
    }
}

/**
 * Charge les données d'événements depuis Notion (via fichier JSON)
 */
async function loadEventsData() {
    try {
        console.log('🔍 Tentative de chargement de /data/events.json...');
        const response = await fetch('/data/events.json');
        console.log('📡 Réponse fetch:', response.status, response.ok);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 Données reçues:', { hasEvents: !!data.events, length: data.events?.length });
            
            if (data.events && data.events.length > 0) {
                console.log(`✅ ${data.events.length} événements chargés depuis Notion`);
                return data.events;
            } else {
                console.warn('⚠️ Fichier chargé mais pas d\'événements trouvés');
            }
        } else {
            console.warn('⚠️ Erreur HTTP:', response.status);
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement depuis Notion:', error);
    }
    
    // Fallback : utiliser les données temporaires
    console.log('📊 Utilisation des données d\'événements temporaires');
    return tempEventsData;
}

/**
 * Traite les événements pour déterminer le prochain et les suivants
 */
function processEvents(eventsData) {
    const now = new Date();
    const currentTime = now.getHours();
    
    // Filtrer et trier les événements futurs
    const futureEvents = eventsData
        .map(event => {
            const eventDate = new Date(event.date);
            return {
                ...event,
                dateObj: eventDate,
                daysDiff: Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24))
            };
        })
        .filter(event => {
            // Si c'est aujourd'hui et qu'il est après 22h, passer au suivant
            if (event.daysDiff === 0 && currentTime >= 22) {
                return false;
            }
            // Sinon, garder tous les événements futurs ou d'aujourd'hui (avant 22h)
            return event.daysDiff >= 0;
        })
        .sort((a, b) => a.dateObj - b.dateObj);
    
    const nextEvent = futureEvents[0] || null;
    const upcomingEvents = futureEvents.slice(1) || [];
    const allEvents = futureEvents || [];
    
    return { nextEvent, upcomingEvents, allEvents };
}

/**
 * Extrait les noms des pièces depuis le nouveau format ou l'ancien
 */
function extractPieceNames(pieces) {
    if (!pieces || !Array.isArray(pieces)) return [];
    return pieces.map(piece => typeof piece === 'object' && piece.name ? piece.name : piece);
}

/**
 * Affiche l'événement principal
 */
function displayMainEvent(event) {
    const mainEventContainer = document.getElementById('main-next-event');
    
    if (!event) {
        mainEventContainer.innerHTML = `
            <div class="main-event-content">
                <div class="no-events-message">
                    <h3>🎵 Aucun événement prévu</h3>
                    <p>Les prochains événements seront bientôt annoncés !</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Déterminer le type d'événement pour le style
    const eventTypeClass = determineEventTypeClass(event.type);
    const eventTypeEmoji = getEventTypeEmoji(event.type);
    
    // Gérer les titres et types qui peuvent être des tableaux avec couleurs
    const eventTitle = extractCleanTitle(event.title);
    
    // Extraire le nom du type depuis le nouveau format ou l'ancien
    const eventType = extractCleanType(event.type);
    
    // Calculer le countdown
    const countdownText = generateCountdownText(event);
    
    // Vérifier si c'est un événement "Pas de répétition" ou similaire
    const isNoRehearsalEvent = eventType.toLowerCase().includes('pas de répétition') || 
                               eventType.toLowerCase().includes('annulé') ||
                               eventType.toLowerCase().includes('annulée') ||
                               (eventType.toLowerCase().includes('vacances') && !eventType.toLowerCase().includes('répétition'));
    
    // Générer la liste des pièces seulement si ce n'est pas un événement "Pas de répétition"
    const piecesHtml = !isNoRehearsalEvent && event.pieces && event.pieces.length > 0 
        ? generatePiecesHtml(event.pieces)
        : !isNoRehearsalEvent 
            ? '<div class="piece-item"><h5>Le programme n\'est pas encore disponible</h5></div>'
            : '';
    
    mainEventContainer.innerHTML = `
        <div class="main-event-content">
            <div class="main-event-header">
                <div class="header-left">
                    ${window.selectedEventForHighlight ? `
                        <button class="back-to-default-btn-modern" onclick="hideSpecificEvent()" title="Revenir au prochain événement">
                            ←
                        </button>
                    ` : ''}
                    <div class="event-type-badge ${eventTypeClass}">
                        ${eventTypeEmoji} ${eventType}
                    </div>
                </div>
                <div class="header-right">
                    ${getDeviceConfig().showUpdateIndicator ? `
                    <div class="live-indicator">
                        <span class="live-dot"></span>
                        <span class="live-indicator-text">Mis à jour automatiquement</span>
                    </div>
                    ` : `
                    <div class="live-indicator">
                        <span class="live-dot" title="Mis à jour automatiquement"></span>
                    </div>
                    `}
                    <button class="add-to-calendar-btn" onclick="addEventToCalendar('${event.date}', '${eventType}', '${eventTitle}', ${JSON.stringify(extractPieceNames(event.pieces || [])).replace(/"/g, '&quot;')}, '${event.notes || ''}')">
                        📅
                    </button>
                </div>
            </div>
            
            <div class="event-meta">
                <div class="event-date">
                    📅 ${formatEventDate(event.date)} - dans
                </div>
                <div class="event-countdown">
                    <span class="countdown-number">${countdownText}</span>
                </div>
            </div>
            
            ${!isNoRehearsalEvent ? `
            <div class="event-pieces">
                <h4>🎼 Programme</h4>
                <div class="pieces-list">
                    ${piecesHtml}
                </div>
            </div>
            ` : ''}
            
            ${event.notes ? `
                <div class="event-notes">
                    <strong>ℹ️ Informations :</strong> ${event.notes}
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Configuration du scroll infini pour les événements (fonction de compatibilité)
 */
function displayUpcomingEventsPreview(events, selectedEvent = null) {
    // Si on a déjà des événements affichés et qu'on veut juste changer la sélection
    // éviter de tout recréer pour éviter le flash blanc
    const upcomingContainer = document.getElementById('upcoming-events-list');
    const existingCards = upcomingContainer.querySelectorAll('.mini-event-card');
    
    if (existingCards.length > 0 && events.length === existingCards.length) {
        console.log('🎯 Mise à jour de la sélection sans recréer les cartes (éviter flash)');
        
        // Juste mettre à jour les classes de sélection
        events.forEach((event, index) => {
            const eventCard = existingCards[index];
            if (eventCard) {
                // Vérifier si c'est l'événement sélectionné
                const isSelected = selectedEvent && 
                    event.date === selectedEvent.date && 
                    JSON.stringify(event.pieces) === JSON.stringify(selectedEvent.pieces);
                
                // Mettre à jour la classe de sélection
                if (isSelected) {
                    eventCard.classList.add('selected');
                } else {
                    eventCard.classList.remove('selected');
                }
            }
        });
        
        return; // Sortir sans recréer
    }
    
    // Sinon, réinitialiser l'affichage progressif avec mise en évidence (pour les nouveaux cas)
    initProgressiveEventDisplay(events, selectedEvent);
}

/**
 * Initialise l'affichage progressif des événements - STYLE PROGRAMMES MUSICAUX
 */
function initProgressiveEventDisplay(events, selectedEvent = null) {
    const upcomingContainer = document.getElementById('upcoming-events-list');
    
    if (!events || events.length === 0) {
        upcomingContainer.innerHTML = `
            <div class="no-events-message">
                <p>Aucun autre événement prévu pour le moment</p>
            </div>
        `;
        return;
    }
    
    console.log(`🎯 Affichage style "Programmes Musicaux" pour ${events.length} événements`);
    
    // Vider le conteneur
    upcomingContainer.innerHTML = '';
    
    // 🚀 NOUVEAU SYSTÈME INSPIRÉ DE "PROGRAMMES MUSICAUX" :
    // Créer TOUS les événements d'un coup, mais avec animation au scroll comme les piece-cards
    // MODIFICATION : Les 3 premières cartes sont déjà visibles
    
    events.forEach((event, index) => {
        const eventCard = createEventCardElement(event, selectedEvent);
        
        // 🎯 MODIFICATION : Les 3 premières cartes sont déjà visibles
        if (index < 3) {
            // Les 3 premières cartes : déjà visibles (pas d'animation)
            eventCard.style.opacity = '1';
            eventCard.style.transform = 'translateY(0)';
            eventCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        } else {
            // Les cartes suivantes : préparer l'animation (comme avant)
            eventCard.style.opacity = '0';
            eventCard.style.transform = 'translateY(20px)';
            eventCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        }
        
        upcomingContainer.appendChild(eventCard);
    });
    
    console.log(`📊 ${events.length} événements créés (3 premières visibles, ${Math.max(0, events.length - 3)} avec animation scroll)`);
    
    // Configurer l'observateur comme dans "Programmes Musicaux"
    setupEventScrollAnimations();
    
    window.displayedEventsCount = events.length; // Pour compatibilité
}

/**
 * Crée un élément de carte d'événement
 */
function createEventCardElement(event, selectedEvent = null) {
    const div = document.createElement('div');
    div.innerHTML = generateMiniEventCard(event, selectedEvent);
    return div.firstElementChild;
}

/**
 * Configure les animations au scroll pour les événements - STYLE PROGRAMMES MUSICAUX
 */
function setupEventScrollAnimations() {
    console.log('🎯 Configuration des animations scroll style "Programmes Musicaux"');
    
    // Options identiques à celles des Programmes Musicaux
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animation identique aux piece-cards
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                console.log('✨ Événement révélé au scroll');
            }
        });
    }, observerOptions);
    
    // Observer seulement les événements qui ont besoin d'animation (à partir du 4ème)
    const eventCards = document.querySelectorAll('#upcoming-events-list .mini-event-card');
    let animatedCardsCount = 0;
    
    eventCards.forEach((card, index) => {
        // Ne surveiller que les cartes à partir de la 4ème (index >= 3)
        if (index >= 3) {
            observer.observe(card);
            animatedCardsCount++;
        }
    });
    
    console.log(`🔍 Observation de ${animatedCardsCount} cartes d'événements (${eventCards.length - animatedCardsCount} déjà visibles)`);
    
    // Sauvegarder l'observateur
    window.eventsScrollObserver = observer;
}



/**
 * Configure les interactions des événements (scroll infini)
 */
function setupEventInteractions() {
    // Plus besoin de boutons - tout est géré par le scroll infini
    console.log('✅ Interactions d\'événements configurées (scroll infini)');
}

/**
 * Met à jour l'affichage des événements
 */
function updateEventDisplay() {
    console.log('🔄 Mise à jour de l\'affichage des événements...');
    loadAndDisplayEvents();
}

// Fonctions utilitaires

function determineEventTypeClass(type) {
    // Gérer le cas où type est un tableau d'objets avec couleurs ou une chaîne
    if (Array.isArray(type) && type.length > 0) {
        // Si c'est un array d'objets avec couleurs (nouveau format)
        if (typeof type[0] === 'object' && type[0].color) {
            return getNotionColorClass(type[0].color);
        }
        // Si c'est un array de strings (ancien format)
        const typeStr = type[0] || '';
        return getEventTypeClassFromString(typeStr);
    }
    
    // Si c'est un objet avec couleur
    if (typeof type === 'object' && type.color) {
        return getNotionColorClass(type.color);
    }
    
    // Si c'est une chaîne simple (ancien format)
    const typeStr = type || '';
    return getEventTypeClassFromString(typeStr);
}

/**
 * Convertit une couleur Notion en classe CSS
 * 
 * CONVENTION DES COULEURS POUR LES ÉVÉNEMENTS :
 * - GREEN (vert) : Concerts publics
 * - BLUE (bleu) : Répétitions régulières  
 * - PURPLE (violet) : Répétitions spéciales
 * - RED (rouge) : Événements importants/urgents
 * - ORANGE (orange) : Événements de formation
 * - YELLOW (jaune) : Événements sociaux
 * - GRAY (gris) : Pas de répétition / vacances
 * - DEFAULT : Événements généraux
 */
function getNotionColorClass(notionColor) {
    const colorMap = {
        'default': 'event-default',
        'gray': 'event-gray',
        'brown': 'event-brown',
        'orange': 'event-orange',
        'yellow': 'event-yellow',
        'green': 'event-green',      // CONCERTS
        'blue': 'event-blue',        // RÉPÉTITIONS
        'purple': 'event-purple',    // RÉPÉTITIONS SPÉCIALES
        'pink': 'event-pink',
        'red': 'event-red'           // ÉVÉNEMENTS IMPORTANTS
    };
    
    return colorMap[notionColor] || 'event-default';
}

/**
 * Fallback pour l'ancien système basé sur le texte
 */
function getEventTypeClassFromString(typeStr) {
    const lowerType = typeStr.toLowerCase();
    
    if (lowerType.includes('répétition')) return 'repetition';
    if (lowerType.includes('concert')) return 'concert';
    if (lowerType.includes('pas de répétition') || 
        lowerType.includes('annulé') ||
        (lowerType.includes('vacances') && !lowerType.includes('répétition'))) return 'vacances';
    return 'other';
}

function getEventTypeEmoji(type) {
    // Extraire le nom du type depuis le nouveau format ou l'ancien
    let typeStr = '';
    
    if (Array.isArray(type) && type.length > 0) {
        if (typeof type[0] === 'object' && type[0].name) {
            typeStr = type[0].name;
        } else {
            typeStr = type[0] || '';
        }
    } else if (typeof type === 'object' && type.name) {
        typeStr = type.name;
    } else {
        typeStr = type || '';
    }
    
    const lowerType = typeStr.toLowerCase();
    
    if (lowerType.includes('répétition')) return '🎵';
    if (lowerType.includes('concert')) return '🎼';
    if (lowerType.includes('pas de répétition') || 
        lowerType.includes('annulé') ||
        (lowerType.includes('vacances') && !lowerType.includes('répétition'))) return '🏖️';
    return '📅';
}

function generateCountdownText(event) {
    const daysDiff = event.daysDiff;
    
    if (daysDiff === 0) return "aujourd'hui";
    if (daysDiff === 1) return "1 jour";
    if (daysDiff < 7) return `${daysDiff} jours`;
    
    const weeks = Math.floor(daysDiff / 7);
    const remainingDays = daysDiff % 7;
    
    if (weeks === 1 && remainingDays === 0) return "1 semaine";
    if (weeks === 1) return `1 semaine et ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`;
    if (remainingDays === 0) return `${weeks} semaines`;
    
    return `${weeks} semaines et ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`;
}

function formatEventDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function truncateTitleForMobile(title, maxLength = 35) {
    // Sur mobile, tronquer les titres trop longs pour éviter la superposition avec la flèche
    if (window.innerWidth <= 768 && title.length > maxLength) {
        return title.substring(0, maxLength - 3) + '...';
    }
    return title;
}

function generatePiecesHtml(pieces) {
    if (!pieces || pieces.length === 0) {
        return '<div class="piece-item"><h5>Programme à définir</h5></div>';
    }
    
    return pieces.map(piece => {
        // Gérer le nouveau format avec couleurs et l'ancien format
        const pieceName = typeof piece === 'object' && piece.name ? piece.name : piece;
        const pieceColor = typeof piece === 'object' && piece.color ? piece.color : null;
        
        // Tronquer le titre sur mobile pour éviter la superposition avec la flèche
        const displayName = truncateTitleForMobile(pieceName);
        
        // Échapper les guillemets pour l'attribut onclick
        const escapedPieceName = pieceName.replace(/'/g, "\\'").replace(/"/g, '\\"');
        
        return `
            <div class="piece-item${pieceColor ? ` piece-${pieceColor}` : ''} clickable-piece" 
                 onclick="navigateToPieceInPrograms('${escapedPieceName}')" 
                 title="Cliquer pour voir cette pièce dans les programmes musicaux${displayName !== pieceName ? ' - Titre complet: ' + pieceName : ''}">
                <h5>${displayName}</h5>
                <span class="piece-click-indicator">→</span>
            </div>
        `;
    }).join('');
}

function generateMiniEventCard(event, selectedEvent = null) {
    const eventTypeClass = determineEventTypeClass(event.type);
    const eventTypeEmoji = getEventTypeEmoji(event.type);
    const countdownText = generateCountdownText(event);
    
    // Gérer les titres et types qui peuvent être des tableaux avec couleurs
    const eventTitle = extractCleanTitle(event.title);
    
    // Extraire le nom du type depuis le nouveau format ou l'ancien
    const eventType = extractCleanType(event.type);
    
    // Vérifier si c'est un événement "Pas de répétition" ou similaire
    const isNoRehearsalEvent = eventType.toLowerCase().includes('pas de répétition') || 
                               eventType.toLowerCase().includes('annulé') ||
                               eventType.toLowerCase().includes('annulée') ||
                               (eventType.toLowerCase().includes('vacances') && !eventType.toLowerCase().includes('répétition'));
    
    // Vérifier s'il y a des pièces définies
    const hasPieces = event.pieces && event.pieces.length > 0;
    
    // Créer l'affichage des pièces avec des bulles délicates
    let piecesContent = '';
    if (!isNoRehearsalEvent && hasPieces) {
        const displayPieces = event.pieces.slice(0, 2);
        const piecesBubbles = displayPieces.map(piece => {
            const pieceName = typeof piece === 'object' && piece.name ? piece.name : piece;
            // Tronquer le nom pour les bulles avec une longueur plus courte
            const displayName = truncateTitleForMobile(pieceName, 25);
            return `<span class="piece-bubble" title="${pieceName}">${displayName}</span>`;
        }).join('');
        
        const extraCount = event.pieces.length - 2;
        const extraBubble = extraCount > 0 ? `<span class="piece-bubble extra">+${extraCount} autres</span>` : '';
        
        piecesContent = piecesBubbles + extraBubble;
    } else if (!isNoRehearsalEvent) {
        piecesContent = '<span class="piece-bubble placeholder">Programme à définir</span>';
    }
    
    // Vérifier si c'est l'événement actuellement sélectionné
    const isSelected = selectedEvent && 
        event.date === selectedEvent.date && 
        JSON.stringify(event.pieces) === JSON.stringify(selectedEvent.pieces);
    
    // Créer un ID unique pour cet événement (s'assurer que eventTitle est une chaîne)
    const eventTitleString = String(eventTitle || 'evenement');
    const eventId = `event_${event.date}_${eventTitleString.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    return `
        <div class="mini-event-card ${eventTypeClass} clickable-event${isSelected ? ' selected' : ''}" data-event-id="${eventId}" onclick="selectMiniEvent('${eventId}')">
            <div class="mini-event-header">
                <div class="mini-event-type ${eventTypeClass}">${eventTypeEmoji} ${eventType}</div>
                <div class="mini-event-actions">
                    <div class="mini-event-countdown">${countdownText}</div>
                </div>
            </div>
            
            <div class="mini-event-date-container">
                <div class="mini-event-date">${formatEventDate(event.date)}</div>
            </div>
            
            ${piecesContent ? `
            <div class="mini-event-pieces">
                <div class="pieces-bubbles-container">
                    ${piecesContent}
                </div>
            </div>
            ` : ''}
            
            ${event.notes ? `
                <div class="mini-event-notes">
                    ℹ️ ${event.notes}
                </div>
            ` : ''}
        </div>
    `;
}

function displayEventError() {
    const mainEventContainer = document.getElementById('main-next-event');
    mainEventContainer.innerHTML = `
        <div class="main-event-content">
            <div class="no-events-message">
                <h3>⚠️ Erreur de chargement</h3>
                <p>Impossible de charger les événements. Veuillez recharger la page.</p>
            </div>
        </div>
    `;
}

/**
 * Affiche un événement spécifique en tant qu'événement principal
 */
function displaySpecificEvent(eventData) {
    // Sauvegarder l'événement sélectionné pour la mise en évidence
    window.selectedEventForHighlight = eventData;
    
    // Afficher l'événement sélectionné comme événement principal
    displayMainEvent(eventData);
    
    // Régénérer les mini-cartes SANS changer l'ordre, juste avec la mise en évidence
    // OPTIMISATION: éviter le flash blanc en ne recréant pas tout
    const currentUpcomingEvents = window.currentUpcomingEvents || [];
    displayUpcomingEventsPreview(currentUpcomingEvents, eventData);
    
    // Scroller vers le haut seulement si l'événement principal n'est pas visible
    // OPTIMISATION: scroll plus doux pour éviter le flash
    const mainEventContainer = document.getElementById('main-next-event');
    if (mainEventContainer) {
        const rect = mainEventContainer.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.top <= window.innerHeight * 0.5;
        
        // Scroll seulement si l'événement n'est pas visible dans la partie haute de l'écran
        if (!isVisible) {
            // Utiliser un scroll plus doux avec une transition CSS
            window.scrollTo({ 
                top: 0, 
                behavior: 'smooth' 
            });
        }
    }
}

// Fonction pour cacher l'événement spécifique et revenir à l'affichage normal
function hideSpecificEvent() {
    // Supprimer la sélection
    window.selectedEventForHighlight = null;
    
    // Restaurer l'affichage normal
    if (window.currentNextEvent) {
        displayMainEvent(window.currentNextEvent);
    }
    
    // Réinitialiser l'affichage progressif sans sélection
    // OPTIMISATION: éviter le flash en ne recréant que si nécessaire
    const currentUpcomingEvents = window.currentUpcomingEvents || [];
    displayUpcomingEventsPreview(currentUpcomingEvents, null);
}

/**
 * Ajoute un bouton pour revenir à l'événement actuel
 */
function addBackToCurrentButton() {
    const mainEventContainer = document.getElementById('main-next-event');
    const backButton = `
        <div class="back-to-current-container">
            <button class="back-to-current-btn" onclick="backToCurrentEvent()">
                ← Revenir au prochain événement
            </button>
        </div>
    `;
    mainEventContainer.insertAdjacentHTML('afterbegin', backButton);
}

/**
 * Revient à l'affichage du prochain événement réel
 */
function backToCurrentEvent() {
    if (window.originalEventData) {
        displayMainEvent(window.originalEventData.nextEvent);
        displayUpcomingEventsPreview(window.originalEventData.upcomingEvents.slice(0, 3));
        
        // Supprimer le bouton de retour
        const backButton = document.querySelector('.back-to-current-container');
        if (backButton) {
            backButton.remove();
        }
        
        // Réinitialiser les données sauvegardées
        window.originalEventData = null;
    }
}

/**
 * Gère la sélection d'un mini-événement
 */
function selectMiniEvent(eventId) {
    // Trouver l'événement correspondant dans les données globales
    const selectedEvent = window.currentAllEvents.find(event => {
        const eventTitle = extractCleanTitle(event.title);
        const eventTitleString = String(eventTitle || 'evenement');
        const computedId = `event_${event.date}_${eventTitleString.replace(/[^a-zA-Z0-9]/g, '_')}`;
        return computedId === eventId;
    });
    
    if (selectedEvent) {
        displaySpecificEvent(selectedEvent);
    } else {
        console.warn('⚠️ Événement non trouvé pour ID:', eventId);
        console.log('📊 IDs disponibles:', window.currentAllEvents?.map(event => {
            const eventTitle = extractCleanTitle(event.title);
            const eventTitleString = String(eventTitle || 'evenement');
            return `event_${event.date}_${eventTitleString.replace(/[^a-zA-Z0-9]/g, '_')}`;
        }));
    }
}

// ========================================
// SYSTÈME DE NAVIGATION INTER-ONGLETS POUR LES PIÈCES
// ========================================

/**
 * Normalise le nom d'une pièce pour la correspondance
 */
function normalizePieceName(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[''‛`´]/g, "'")  // Normaliser les apostrophes
        .replace(/[^\w\s'-]/g, '') // Supprimer la ponctuation sauf apostrophes et tirets
        .replace(/\s+/g, ' ');     // Normaliser les espaces
}

/**
 * Trouve une pièce dans les programmes musicaux par son nom
 */
function findPieceInPrograms(pieceName) {
    const normalizedSearchName = normalizePieceName(pieceName);
    console.log(`🔍 Recherche de la pièce: "${pieceName}" (normalisé: "${normalizedSearchName}")`);
    
    // Chercher dans toutes les sections de programmes musicaux
    const sections = [
        'ma-region-virtuose',
        'concert-eric-aubier', 
        'conservatoire-60-ans',
        'retour-karaoke',
        'fete-musique',
        'loto',
        'pieces-ajout',
        'pieces-orphelines'
    ];
    
    for (const sectionId of sections) {
        const sectionElement = document.getElementById(sectionId);
        if (!sectionElement) continue;
        
        const pieceCards = sectionElement.querySelectorAll('.piece-card');
        
        for (const pieceCard of pieceCards) {
            const titleElement = pieceCard.querySelector('h3');
            if (!titleElement) continue;
            
            const pieceTitle = titleElement.textContent;
            const normalizedPieceTitle = normalizePieceName(pieceTitle);
            
            if (normalizedPieceTitle === normalizedSearchName) {
                console.log(`✅ Pièce trouvée: "${pieceTitle}" dans la section ${sectionId}`);
                return {
                    element: pieceCard,
                    section: sectionId,
                    title: pieceTitle
                };
            }
        }
    }
    
    console.warn(`⚠️ Pièce "${pieceName}" non trouvée dans les programmes musicaux`);
    return null;
}

/**
 * Navigue vers une pièce spécifique dans l'onglet Programme musical
 */
function navigateToPieceInPrograms(pieceName) {
    console.log(`🎯 Navigation vers la pièce: "${pieceName}"`);
    
    // 1. Basculer vers l'onglet Programme musical
    switchToTab('programmes');
    
    // 2. Attendre que l'onglet soit actif, puis chercher la pièce
    setTimeout(() => {
        const pieceInfo = findPieceInPrograms(pieceName);
        
        if (pieceInfo) {
            // 3. Scroller vers la pièce et la mettre en évidence
            highlightPiece(pieceInfo.element, pieceInfo.title);
        } else {
            // 4. Afficher une notification si la pièce n'est pas trouvée
            showPieceNotFoundNotification(pieceName);
        }
    }, 300); // Délai pour laisser l'onglet se charger
}

/**
 * Bascule vers un onglet spécifique (réutilise la logique existante)
 */
function switchToTab(targetId) {
    console.log(`🔄 Basculement vers l'onglet: ${targetId}`);
    
    // Utiliser la logique complète de showTab avec synchronisation mobile
    const tabContents = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-button');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    // Masquer tous les contenus d'onglets
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Désactiver tous les boutons d'onglets desktop
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Désactiver tous les items de navigation mobile
    mobileNavItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Afficher le contenu de l'onglet ciblé
    const targetContent = document.getElementById(targetId);
    if (targetContent) {
        targetContent.classList.add('active');
        console.log(`✅ Onglet ${targetId} activé`);
    }
    
    // Activer le bouton correspondant (desktop)
    const activeButton = document.querySelector(`.tab-button[data-tab="${targetId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Activer l'item correspondant (mobile)
    const activeMobileItem = document.querySelector(`.mobile-nav-item[data-tab="${targetId}"]`);
    if (activeMobileItem) {
        activeMobileItem.classList.add('active');
    }
    
    // Déclencher la mise à jour de la visibilité de la recherche (desktop seulement)
    const programmesTab = document.getElementById('programmes');
    const searchContainer = document.querySelector('.search-container');
    
    const isVisible = programmesTab && programmesTab.classList.contains('active');
    if (searchContainer) {
        searchContainer.style.display = isVisible ? 'flex' : 'none';
    }
}

/**
 * Met en évidence une pièce avec animation et scroll
 */
function highlightPiece(pieceElement, pieceTitle) {
    console.log(`✨ Mise en évidence de la pièce: "${pieceTitle}"`);
    
    // Supprimer toute mise en évidence précédente
    const previousHighlight = document.querySelector('.piece-highlighted');
    if (previousHighlight) {
        previousHighlight.classList.remove('piece-highlighted');
    }
    
    // Scroller vers la pièce avec un offset pour la rendre bien visible
    const elementRect = pieceElement.getBoundingClientRect();
    const offset = window.innerHeight * 0.2; // 20% de la hauteur de l'écran
    
    window.scrollTo({
        top: window.pageYOffset + elementRect.top - offset,
        behavior: 'smooth'
    });
    
    // Attendre le scroll, puis appliquer la mise en évidence
    setTimeout(() => {
        pieceElement.classList.add('piece-highlighted');
        
        // Supprimer la mise en évidence après 4 secondes
        setTimeout(() => {
            pieceElement.classList.remove('piece-highlighted');
        }, 4000);
        
        // Pas de notification - l'animation suffit
        
    }, 800); // Attendre que le scroll soit terminé
}

/**
 * Affiche une notification quand une pièce est trouvée
 */
function showPieceFoundNotification(pieceTitle) {
    showNotification(`� "${pieceTitle}"`, 'success', 2500);
}

/**
 * Affiche une notification quand une pièce n'est pas trouvée
 */
function showPieceNotFoundNotification(pieceName) {
    showNotification(`⚠️ Pièce "${pieceName}" non trouvée dans les programmes`, 'warning', 4000);
}

/**
 * Système de notifications réutilisable
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.piece-navigation-notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `piece-navigation-notification notification-${type}`;
    notification.textContent = message;
    
    // Styles de base
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Couleurs selon le type
    switch (type) {
        case 'success':
            notification.style.background = '#48bb78';
            break;
        case 'warning':
            notification.style.background = '#ed8936';
            break;
        case 'error':
            notification.style.background = '#f56565';
            break;
        default:
            notification.style.background = '#4299e1';
    }
    
    document.body.appendChild(notification);
    
    // Animation d'apparition
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Auto-suppression
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, duration);
}

// Fonction pour ajouter un événement au calendrier - VERSION GOOGLE CALENDAR OPTIMISÉE
function addEventToCalendar(date, type, title, pieces, notes) {
    try {
        // 🐛 DEBUG: Log des paramètres reçus
        console.log('📅 addEventToCalendar - Paramètres reçus:', {
            date,
            type: typeof type === 'object' ? JSON.stringify(type) : type,
            title: typeof title === 'object' ? JSON.stringify(title) : title,
            pieces: pieces?.length || 0,
            notes
        });
        
        // Créer la date de l'événement
        const eventDate = new Date(date);
        
        // Déterminer les heures selon le type d'événement
        let startTime, endTime, isAllDay = false;
        
        // Extraire le type et le titre proprement (gérer les objets Notion)
        const eventType = extractCleanType(type);
        const cleanTitle = extractCleanTitle(title);
        
        const lowerType = eventType.toLowerCase();
        let eventTitle, location;
        
        if (lowerType.includes('répétition') && !lowerType.includes('pas de') && !lowerType.includes('annul')) {
            // Répétitions : toujours 20h-22h
            startTime = new Date(eventDate);
            startTime.setHours(20, 0, 0);
            endTime = new Date(eventDate);
            endTime.setHours(22, 0, 0);
            
            // Distinguer répétition normale vs répétition spéciale
            if (lowerType === 'répétition' || lowerType.includes('répétition régulière')) {
                // Répétition normale
                eventTitle = `Répétition de l'Harmonie de Châteaubriant`;
            } else {
                // Répétition spéciale (ex: "Répétition pendant les vacances")
                eventTitle = `${eventType} - Harmonie de Châteaubriant`;
            }
            location = "Conservatoire de Châteaubriant, 6 Rue Guy Môquet, 44110 Châteaubriant";
        } else if (lowerType.includes('pas de répétition')) {
            // Pas de répétition : même horaire qu'une répétition normale (20h-22h)
            startTime = new Date(eventDate);
            startTime.setHours(20, 0, 0);
            endTime = new Date(eventDate);
            endTime.setHours(22, 0, 0);
            eventTitle = `${eventType} - Harmonie de Châteaubriant`;
            location = "Conservatoire de Châteaubriant, 6 Rue Guy Môquet, 44110 Châteaubriant";
        } else if (lowerType.includes('annulé') ||
                   lowerType.includes('annulée') ||
                   (lowerType.includes('vacances') && !lowerType.includes('répétition'))) {
            // Autres événements d'annulation : toute la journée
            startTime = new Date(eventDate);
            startTime.setHours(0, 0, 0);
            endTime = new Date(eventDate);
            endTime.setHours(23, 59, 59);
            isAllDay = true;
            eventTitle = `${eventType} - Harmonie de Châteaubriant`;
            location = "Conservatoire de Châteaubriant, 6 Rue Guy Môquet, 44110 Châteaubriant";
        } else {
            // Concerts et autres événements : toute la journée
            startTime = new Date(eventDate);
            startTime.setHours(0, 0, 0);
            endTime = new Date(eventDate);
            endTime.setHours(23, 59, 59);
            isAllDay = true;
            // Utiliser le titre propre ou le type comme fallback
            eventTitle = cleanTitle !== 'Événement' ? `${cleanTitle} - Harmonie de Châteaubriant` : `${eventType} - Harmonie de Châteaubriant`;
            location = "Conservatoire de Châteaubriant, 6 Rue Guy Môquet, 44110 Châteaubriant";
        }
        
        // 🐛 DEBUG: Log du titre final déterminé
        console.log('📅 Titre final de l\'événement:', eventTitle);
        
        // Créer la description avec les pièces
        let description = `${eventTitle}\n\n`;
        if (pieces && pieces.length > 0) {
            description += `Programme :\n`;
            pieces.forEach(piece => {
                description += `• ${piece}\n`;
            });
        }
        if (notes) {
            description += `\nInformations : ${notes}`;
        }
        
        // 🎯 STRATÉGIE SIMPLIFIÉE: Google Calendar d'abord, avec détection intelligente
        console.log('📅 Ouverture de Google Calendar...');
        tryGoogleCalendarWithFallback(eventTitle, startTime, endTime, description, location, isAllDay);
        
    } catch (error) {
        console.error('❌ Erreur lors de la création du calendrier:', error);
        showCalendarNotification('❌ Erreur lors de l\'ajout au calendrier', 'error');
    }
}

// Fonction principale: Google Calendar avec détection intelligente
function tryGoogleCalendarWithFallback(title, startTime, endTime, description, location, isAllDay) {
    try {
        // Créer l'URL Google Calendar
        const start = formatGoogleDate(startTime, isAllDay);
        const end = formatGoogleDate(endTime, isAllDay);
        
        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
        
        // Ouvrir Google Calendar dans un nouvel onglet
        const googleWindow = window.open(googleUrl, '_blank');
        
        // Vérification intelligente et fallback
        setTimeout(() => {
            checkGoogleCalendarSuccess(googleWindow, title, startTime, endTime, description, location, isAllDay);
        }, 3000); // Attendre 3 secondes pour voir si ça fonctionne
        
        // Notification immédiate
        showCalendarNotification('📅 Ouverture de Google Calendar...', 'info');
        
    } catch (error) {
        console.error('❌ Erreur Google Calendar:', error);
        // Fallback direct vers ICS
        console.log('� Fallback vers fichier ICS...');
        createICSFallback(title, startTime, endTime, description, location, isAllDay);
    }
}

// Vérification du succès Google Calendar avec fallback automatique
function checkGoogleCalendarSuccess(googleWindow, title, startTime, endTime, description, location, isAllDay) {
    try {
        // Vérifier si la fenêtre Google est encore ouverte
        if (!googleWindow || googleWindow.closed) {
            // L'utilisateur a fermé rapidement = problème potentiel
            console.log('⚠️ Fenêtre Google Calendar fermée rapidement - Proposition de fallback');
            offerICSFallback(title, startTime, endTime, description, location, isAllDay);
            return;
        }
        
        // Essayer de détecter si l'utilisateur est connecté à Google
        try {
            // Vérifier l'URL de la fenêtre (si possible)
            const currentUrl = googleWindow.location.href;
            
            if (currentUrl && currentUrl.includes('accounts.google.com')) {
                // Redirection vers login = pas connecté
                console.log('🔑 Redirection vers login Google détectée');
                showCalendarNotification('� Connexion Google requise ou fichier ICS en alternative', 'info');
                
                // Proposer ICS en alternative après 5 secondes
                setTimeout(() => {
                    offerICSFallback(title, startTime, endTime, description, location, isAllDay);
                }, 5000);
            } else {
                // Semble fonctionner
                console.log('✅ Google Calendar ouvert avec succès');
                showCalendarNotification('✅ Google Calendar ouvert - Validez l\'événement', 'success');
            }
        } catch (securityError) {
            // Erreur de sécurité = fenêtre sur un autre domaine = probablement OK
            console.log('🔒 Google Calendar dans un autre domaine (normal)');
            showCalendarNotification('✅ Google Calendar ouvert - Validez l\'événement', 'success');
        }
        
    } catch (error) {
        console.error('❌ Erreur vérification Google:', error);
        offerICSFallback(title, startTime, endTime, description, location, isAllDay);
    }
}

// Proposer fichier ICS en fallback avec notification interactive
function offerICSFallback(title, startTime, endTime, description, location, isAllDay) {
    // Créer une notification interactive
    const notification = document.createElement('div');
    notification.className = 'calendar-fallback-notification';
    notification.innerHTML = `
        <div class="fallback-content">
            <div class="fallback-header">
                <span>📋 Alternative disponible</span>
                <button class="fallback-close" onclick="this.closest('.calendar-fallback-notification').remove()">×</button>
            </div>
            <div class="fallback-body">
                <p>Problème avec Google Calendar ?</p>
                <div class="fallback-actions">
                    <button class="fallback-btn primary" onclick="downloadICSFile('${encodeURIComponent(title)}', '${startTime.toISOString()}', '${endTime.toISOString()}', '${encodeURIComponent(description)}', '${encodeURIComponent(location)}', ${isAllDay}); this.closest('.calendar-fallback-notification').remove();">
                        📥 Télécharger fichier ICS
                    </button>
                    <button class="fallback-btn secondary" onclick="this.closest('.calendar-fallback-notification').remove();">
                        ✅ C'est bon
                    </button>
                </div>
            </div>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 2px solid #4299e1;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 320px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
    `;
    
    // Styles pour le contenu
    const style = document.createElement('style');
    style.textContent = `
        .fallback-content {
            padding: 0;
        }
        
        .fallback-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #e2e8f0;
            font-weight: 600;
            color: #2d3748;
        }
        
        .fallback-close {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: #718096;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
        }
        
        .fallback-close:hover {
            background: #f7fafc;
        }
        
        .fallback-body {
            padding: 1rem;
        }
        
        .fallback-body p {
            margin: 0 0 1rem 0;
            color: #4a5568;
            font-size: 0.9rem;
        }
        
        .fallback-actions {
            display: flex;
            gap: 0.5rem;
            flex-direction: column;
        }
        
        .fallback-btn {
            padding: 0.75rem 1rem;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .fallback-btn.primary {
            background: #4299e1;
            color: white;
        }
        
        .fallback-btn.primary:hover {
            background: #3182ce;
        }
        
        .fallback-btn.secondary {
            background: #f7fafc;
            color: #4a5568;
            border: 1px solid #e2e8f0;
        }
        
        .fallback-btn.secondary:hover {
            background: #edf2f7;
        }
    `;
    
    if (!document.getElementById('fallback-styles')) {
        style.id = 'fallback-styles';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Animation d'apparition
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Auto-fermeture après 15 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 15000);
}

// Fonction pour télécharger le fichier ICS (fallback)
function downloadICSFile(title, startTime, endTime, description, location, isAllDay) {
    try {
        const icsContent = generateICSContent(title, startTime, endTime, description, location, isAllDay);
        
        const blob = new Blob([icsContent], { 
            type: 'text/calendar;charset=utf-8'
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${decodeURIComponent(title).replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showCalendarNotification('📥 Fichier ICS téléchargé avec succès', 'success');
        
    } catch (error) {
        console.error('❌ Erreur téléchargement ICS:', error);
        showCalendarNotification('❌ Erreur lors du téléchargement', 'error');
    }
}

// Fallback ICS direct (pour les cas d'erreur)
function createICSFallback(title, startTime, endTime, description, location, isAllDay) {
    console.log('📋 Création du fichier ICS de secours...');
    downloadICSFile(encodeURIComponent(title), startTime.toISOString(), endTime.toISOString(), encodeURIComponent(description), encodeURIComponent(location), isAllDay);
}

// Vérification du succès Google Calendar avec fallback automatique
function checkGoogleCalendarSuccess(googleWindow, title, startTime, endTime, description, location, isAllDay) {
    try {
        // Vérifier si la fenêtre Google est encore ouverte
        if (!googleWindow || googleWindow.closed) {
            // L'utilisateur a fermé rapidement = problème potentiel
            console.log('⚠️ Fenêtre Google Calendar fermée rapidement - Proposition de fallback');
            offerICSFallback(title, startTime, endTime, description, location, isAllDay);
            return;
        }
        
        // Essayer de détecter si l'utilisateur est connecté à Google
        try {
            // Vérifier l'URL de la fenêtre (si possible)
            const currentUrl = googleWindow.location.href;
            
            if (currentUrl && currentUrl.includes('accounts.google.com')) {
                // Redirection vers login = pas connecté
                console.log('🔑 Redirection vers login Google détectée');
                showCalendarNotification('🔑 Connexion Google requise ou fichier ICS en alternative', 'info');
                
                // Proposer ICS en alternative après 5 secondes
                setTimeout(() => {
                    offerICSFallback(title, startTime, endTime, description, location, isAllDay);
                }, 5000);
            } else {
                // Semble fonctionner
                console.log('✅ Google Calendar ouvert avec succès');
                showCalendarNotification('✅ Google Calendar ouvert - Validez l\'événement', 'success');
            }
        } catch (securityError) {
            // Erreur de sécurité = fenêtre sur un autre domaine = probablement OK
            console.log('🔒 Google Calendar dans un autre domaine (normal)');
            showCalendarNotification('✅ Google Calendar ouvert - Validez l\'événement', 'success');
        }
        
    } catch (error) {
        console.error('❌ Erreur vérification Google:', error);
        offerICSFallback(title, startTime, endTime, description, location, isAllDay);
    }
}

// Proposer fichier ICS en fallback avec notification interactive
function offerICSFallback(title, startTime, endTime, description, location, isAllDay) {
    // Créer une notification interactive
    const notification = document.createElement('div');
    notification.className = 'calendar-fallback-notification';
    notification.innerHTML = `
        <div class="fallback-content">
            <div class="fallback-header">
                <span>📋 Alternative disponible</span>
                <button class="fallback-close" onclick="this.closest('.calendar-fallback-notification').remove()">×</button>
            </div>
            <div class="fallback-body">
                <p>Problème avec Google Calendar ?</p>
                <div class="fallback-actions">
                    <button class="fallback-btn primary" onclick="downloadICSFile('${encodeURIComponent(title)}', '${startTime.toISOString()}', '${endTime.toISOString()}', '${encodeURIComponent(description)}', '${encodeURIComponent(location)}', ${isAllDay}); this.closest('.calendar-fallback-notification').remove();">
                        📥 Télécharger fichier ICS
                    </button>
                    <button class="fallback-btn secondary" onclick="this.closest('.calendar-fallback-notification').remove();">
                        ✅ C'est bon
                    </button>
                </div>
            </div>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 2px solid #4299e1;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 320px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
    `;
    
    // Styles pour le contenu
    const style = document.createElement('style');
    style.textContent = `
        .fallback-content {
            padding: 0;
        }
        
        .fallback-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #e2e8f0;
            font-weight: 600;
            color: #2d3748;
        }
        
        .fallback-close {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: #718096;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
        }
        
        .fallback-close:hover {
            background: #f7fafc;
        }
        
        .fallback-body {
            padding: 1rem;
        }
        
        .fallback-body p {
            margin: 0 0 1rem 0;
            color: #4a5568;
            font-size: 0.9rem;
        }
        
        .fallback-actions {
            display: flex;
            gap: 0.5rem;
            flex-direction: column;
        }
        
        .fallback-btn {
            padding: 0.75rem 1rem;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .fallback-btn.primary {
            background: #4299e1;
            color: white;
        }
        
        .fallback-btn.primary:hover {
            background: #3182ce;
        }
        
        .fallback-btn.secondary {
            background: #f7fafc;
            color: #4a5568;
            border: 1px solid #e2e8f0;
        }
        
        .fallback-btn.secondary:hover {
            background: #edf2f7;
        }
    `;
    
    if (!document.getElementById('fallback-styles')) {
        style.id = 'fallback-styles';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Animation d'apparition
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Auto-fermeture après 15 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 15000);
}

// Fonction pour afficher le modal de sélection de calendrier
function showCalendarSelectionModal(title, startTime, endTime, description, location, isAllDay) {
    // Supprimer un modal existant s'il y en a un
    const existingModal = document.querySelector('.calendar-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Créer le modal
    const modal = document.createElement('div');
    modal.className = 'calendar-modal';
    modal.innerHTML = `
        <div class="calendar-modal-content">
            <div class="calendar-modal-header">
                <h3>📅 Ajouter à votre calendrier</h3>
                <button class="calendar-modal-close" onclick="this.closest('.calendar-modal').remove()">×</button>
            </div>
            <div class="calendar-modal-body">
                <p><strong>${title}</strong></p>
                <p>📍 ${location}</p>
                <p>🕒 ${formatTimeRange(startTime, endTime, isAllDay)}</p>
                
                <div class="calendar-options">
                    <button class="calendar-option google" onclick="addToGoogleCalendar('${encodeURIComponent(title)}', '${startTime.toISOString()}', '${endTime.toISOString()}', '${encodeURIComponent(description)}', '${encodeURIComponent(location)}', ${isAllDay})">
                        📧 Google Calendar
                    </button>
                    <button class="calendar-option outlook" onclick="addToOutlookCalendar('${encodeURIComponent(title)}', '${startTime.toISOString()}', '${endTime.toISOString()}', '${encodeURIComponent(description)}', '${encodeURIComponent(location)}', ${isAllDay})">
                        📮 Outlook
                    </button>
                    <button class="calendar-option apple" onclick="addToAppleCalendar('${encodeURIComponent(title)}', '${startTime.toISOString()}', '${endTime.toISOString()}', '${encodeURIComponent(description)}', '${encodeURIComponent(location)}', ${isAllDay})">
                        🍎 Apple Calendar
                    </button>
                    <button class="calendar-option yahoo" onclick="addToYahooCalendar('${encodeURIComponent(title)}', '${startTime.toISOString()}', '${endTime.toISOString()}', '${encodeURIComponent(description)}', '${encodeURIComponent(location)}', ${isAllDay})">
                        🟣 Yahoo Calendar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Styles du modal
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    // Ajouter les styles CSS
    if (!document.getElementById('calendar-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'calendar-modal-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .calendar-modal-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                max-width: 400px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .calendar-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .calendar-modal-header h3 {
                margin: 0;
                color: #2d3748;
                font-size: 1.25rem;
            }
            
            .calendar-modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #718096;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }
            
            .calendar-modal-close:hover {
                background: #f7fafc;
            }
            
            .calendar-modal-body {
                padding: 1.5rem;
            }
            
            .calendar-modal-body p {
                margin: 0.5rem 0;
                color: #4a5568;
            }
            
            .calendar-options {
                display: grid;
                gap: 0.75rem;
                margin-top: 1.5rem;
            }
            
            .calendar-option {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                gap: 0.75rem;
                padding: 0.75rem 1rem;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 0.95rem;
                font-weight: 500;
            }
            
            .calendar-option:hover {
                border-color: #4299e1;
                background: #f7fafc;
                transform: translateY(-1px);
            }
            
            .calendar-option.google:hover { border-color: #4285f4; }
            .calendar-option.outlook:hover { border-color: #0078d4; }
            .calendar-option.apple:hover { border-color: #007aff; }
            .calendar-option.yahoo:hover { border-color: #7b68ee; }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(modal);
    
    // Fermer en cliquant sur le fond
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Fonctions pour chaque calendrier
function addToGoogleCalendar(title, startTime, endTime, description, location, isAllDay) {
    const start = formatGoogleDate(new Date(startTime), isAllDay);
    const end = formatGoogleDate(new Date(endTime), isAllDay);
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${description}&location=${location}`;
    window.open(url, '_blank');
    document.querySelector('.calendar-modal').remove();
    showCalendarNotification('📅 Ouverture de Google Calendar...', 'success');
}

function addToOutlookCalendar(title, startTime, endTime, description, location, isAllDay) {
    const start = new Date(startTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = new Date(endTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${start}&enddt=${end}&body=${description}&location=${location}`;
    window.open(url, '_blank');
    document.querySelector('.calendar-modal').remove();
    showCalendarNotification('📅 Ouverture d\'Outlook...', 'success');
}

function addToAppleCalendar(title, startTime, endTime, description, location, isAllDay) {
    // Générer un fichier ICS pour Apple Calendar
    const icsContent = generateICSContent(title, startTime, endTime, description, location, isAllDay);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${decodeURIComponent(title).replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    document.querySelector('.calendar-modal').remove();
    showCalendarNotification('📅 Fichier téléchargé pour Apple Calendar', 'success');
}

function addToYahooCalendar(title, startTime, endTime, description, location, isAllDay) {
    const start = formatYahooDate(new Date(startTime));
    const duration = Math.round((new Date(endTime) - new Date(startTime)) / (1000 * 60)); // en minutes
    
    const url = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${title}&st=${start}&dur=${isAllDay ? '1440' : duration}&desc=${description}&in_loc=${location}`;
    window.open(url, '_blank');
    document.querySelector('.calendar-modal').remove();
    showCalendarNotification('📅 Ouverture de Yahoo Calendar...', 'success');
}

// Fonctions utilitaires pour les dates
function formatGoogleDate(date, isAllDay) {
    if (isAllDay) {
        return date.toISOString().split('T')[0].replace(/-/g, '');
    } else {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
}

function formatYahooDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function formatTimeRange(startTime, endTime, isAllDay) {
    if (isAllDay) {
        return 'Toute la journée';
    } else {
        const start = startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const end = endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return `${start} - ${end}`;
    }
}

function generateICSContent(title, startTime, endTime, description, location, isAllDay) {
    function formatICSDate(date, allDay = false) {
        if (allDay) {
            return date.toISOString().split('T')[0].replace(/-/g, '');
        } else {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        }
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Harmonie de Châteaubriant//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@harmonie-chateaubriant.fr
DTSTAMP:${formatICSDate(new Date())}
DTSTART${isAllDay ? ';VALUE=DATE:' + formatICSDate(start, true) : ':' + formatICSDate(start)}
DTEND${isAllDay ? ';VALUE=DATE:' + formatICSDate(new Date(end.getTime() + 24*60*60*1000), true) : ':' + formatICSDate(end)}
SUMMARY:${decodeURIComponent(title)}
DESCRIPTION:${decodeURIComponent(description)}
LOCATION:${decodeURIComponent(location)}
CATEGORIES:MUSIC,REHEARSAL
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

// Fonction pour afficher une notification de calendrier
function showCalendarNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `calendar-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'error' ? '#fed7d7' : '#e6fffa'};
        color: ${type === 'error' ? '#c53030' : '#234e52'};
        padding: 0.75rem 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 0.875rem;
        font-weight: 500;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'apparition
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Disparition automatique après 3 secondes
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Animations de défilement
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observer toutes les cartes de pièces
    document.querySelectorAll('.piece-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Observer les sections
    document.querySelectorAll('.concert-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
}

// Initialisation du système Notion avec synchronisation automatique via proxy
function initNotionSync() {
    // Vérifier si la classe NotionSyncProxy est disponible
    if (typeof NotionSyncProxy === 'undefined') {
        console.warn('⚠️ Classe NotionSyncProxy non trouvée - Utilisation du proxy impossible');
        return;
    }

    try {
        const notionSync = new NotionSyncProxy();
        let lastSyncTimestamp = Date.now();
        let syncInProgress = false;
        
        // Fonction de synchronisation intelligente
        async function performSync(isInitial = false) {
            if (syncInProgress) {
                console.log('⏳ Synchronisation déjà en cours, passage ignoré');
                return;
            }
            
            syncInProgress = true;
            const syncType = isInitial ? 'initiale' : 'automatique';
            
            try {
                console.log(`🔄 Synchronisation ${syncType} démarrée...`);
                
                // Mettre à jour l'indicateur de statut
                if (window.updateSyncIndicator) {
                    window.updateSyncIndicator(isInitial ? 'Synchronisation...' : 'Vérification...', true);
                }
                
                if (isInitial) {
                    // Synchronisation complète au démarrage
                    const results = await notionSync.syncAllData();
                    updateSiteStatistics();
                    updateLastSyncIndicator();
                    console.log(`✅ Synchronisation ${syncType} terminée - ${Object.keys(results).length} sections mises à jour`);
                    
                    if (window.updateSyncIndicator) {
                        window.updateSyncIndicator('Synchronisé', false);
                    }
                } else {
                    // Synchronisation rapide pour les mises à jour automatiques
                    const syncResult = await notionSync.syncAllDataFast();
                    
                    if (syncResult.hasChanges) {
                        if (window.updateSyncIndicator) {
                            window.updateSyncIndicator('Mise à jour...', true);
                        }
                        updateSiteStatistics();
                        updateLastSyncIndicator();
                        showSyncNotification('🔄 Nouvelles données synchronisées depuis Notion');
                        console.log(`✅ Synchronisation ${syncType} terminée - Changements appliqués`);
                        
                        if (window.updateSyncIndicator) {
                            window.updateSyncIndicator('Mis à jour', false);
                            setTimeout(() => window.updateSyncIndicator('Synchronisé', false), 3000);
                        }
                    } else {
                        console.log(`ℹ️ Synchronisation ${syncType} - Aucun changement détecté`);
                        if (window.updateSyncIndicator) {
                            window.updateSyncIndicator('Synchronisé', false);
                        }
                    }
                }
                
                lastSyncTimestamp = Date.now();
                
            } catch (error) {
                console.error(`❌ Erreur lors de la synchronisation ${syncType}:`, error);
                showSyncNotification('⚠️ Erreur de synchronisation', 'error');
                if (window.updateSyncIndicator) {
                    window.updateSyncIndicator('Erreur', false);
                }
            } finally {
                syncInProgress = false;
            }
        }
        
        // Fonction pour afficher des notifications discrètes
        function showSyncNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `sync-notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'error' ? '#fed7d7' : '#c6f6d5'};
                color: ${type === 'error' ? '#c53030' : '#276749'};
                padding: 0.75rem 1rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                font-size: 0.875rem;
                font-weight: 500;
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.3s ease;
            `;
            
            document.body.appendChild(notification);
            
            // Animation d'apparition
            setTimeout(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateY(0)';
            }, 100);
            
            // Disparition automatique après 3 secondes
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
        
        // Mettre à jour l'indicateur de dernière synchronisation
        function updateLastSyncIndicator() {
            const lastSyncElement = document.getElementById('last-sync');
            if (lastSyncElement) {
                const now = new Date();
                const timeString = now.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                });
                lastSyncElement.textContent = timeString;
            }
        }
        
        // Synchronisation initiale au chargement
        console.log('� Démarrage du système de synchronisation automatique...');
        performSync(true);
        
        // Synchronisation automatique toutes les 2 minutes (plus fréquent)
        setInterval(() => {
            performSync(false);
        }, 2 * 60 * 1000); // 2 minutes
        
        // Synchronisation additionnelle quand la page retrouve le focus
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('👀 Page visible - Vérification des mises à jour...');
                setTimeout(() => performSync(false), 1000);
            }
        });
        
        // Synchronisation lors d'événements réseau
        window.addEventListener('online', () => {
            console.log('🌐 Connexion rétablie - Synchronisation...');
            setTimeout(() => performSync(false), 2000);
        });
        
        console.log('✅ Système de synchronisation automatique configuré');
        console.log('📡 Vérification des changements toutes les 90 secondes');
        
        // Fonction pour ajouter un indicateur de statut discret
        function addSyncStatusIndicator() {
            const indicator = document.createElement('div');
            indicator.id = 'sync-indicator';
            indicator.innerHTML = `
                <div class="sync-dot"></div>
                <span class="sync-text">Synchronisé</span>
            `;
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid #e2e8f0;
                border-radius: 20px;
                padding: 0.5rem 0.75rem;
                font-size: 0.75rem;
                color: #4a5568;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
            `;
            
            const dot = indicator.querySelector('.sync-dot');
            dot.style.cssText = `
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #38a169;
                animation: pulse 2s infinite;
            `;
            
            // Animation CSS pour le point
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(56, 161, 105, 0.7); }
                    70% { box-shadow: 0 0 0 4px rgba(56, 161, 105, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(56, 161, 105, 0); }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(indicator);
            
            // Mettre à jour le statut
            window.updateSyncIndicator = function(status, isActive = false) {
                const text = indicator.querySelector('.sync-text');
                const dot = indicator.querySelector('.sync-dot');
                
                text.textContent = status;
                
                if (isActive) {
                    dot.style.background = '#3182ce';
                    dot.style.animation = 'pulse 1s infinite';
                } else {
                    dot.style.background = '#38a169';
                    dot.style.animation = 'pulse 2s infinite';
                }
            };
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de Notion:', error);
    }
}

// Calculer la durée totale
function calculateTotalDurations() {
    const sections = document.querySelectorAll('.concert-section');
    let totalSeconds = 0;
    let totalSections = 0;
    let totalPieces = 0;
    let sectionDurations = {};
    
    sections.forEach(section => {
        const sectionId = section.id;
        let sectionSeconds = 0;
        
        const pieces = section.querySelectorAll('.piece-card');
        const realPieces = Array.from(pieces).filter(piece => {
            const title = piece.querySelector('h3');
            return title && !piece.textContent.includes('Aucune pièce ajoutée') && !piece.textContent.includes('Section en cours');
        });
        
        if (realPieces.length > 0) {
            totalSections++;
            totalPieces += realPieces.length;
        }
        
        realPieces.forEach(piece => {
            // Gérer le format MM:SS ou MM:SS:ms ou "X min"
            const durationText = piece.textContent.match(/Durée:\s*([0-9:]+)/);
            if (durationText) {
                const duration = durationText[1];
                const timeComponents = duration.split(':');
                
                if (timeComponents.length >= 2) {
                    // Format MM:SS ou MM:SS:ms
                    const minutes = parseInt(timeComponents[0]) || 0;
                    const seconds = parseInt(timeComponents[1]) || 0;
                    const pieceSeconds = minutes * 60 + seconds;
                    totalSeconds += pieceSeconds;
                    sectionSeconds += pieceSeconds;
                }
            } else {
                // Fallback pour format "X min"
                const minText = piece.textContent.match(/Durée:\s*(\d+)\s*min/);
                if (minText) {
                    const minutes = parseInt(minText[1]);
                    totalSeconds += minutes * 60;
                    sectionSeconds += minutes * 60;
                }
            }
        });
        
        sectionDurations[sectionId] = sectionSeconds;
    });
    
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    
    return {
        totalSeconds,
        totalMinutes,
        totalHours: Math.floor(totalMinutes / 60),
        remainingMinutes: totalMinutes % 60,
        totalSections,
        totalPieces,
        sectionDurations,
        formatTime: (seconds) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            if (h > 0) {
                return `${h}h ${m.toString().padStart(2, '0')}min`;
            } else if (m > 0) {
                return `${m}min ${s.toString().padStart(2, '0')}s`;
            } else {
                return `${s}s`;
            }
        }
    };
}

// Mettre à jour les statistiques du site
function updateSiteStatistics() {
    const stats = calculateTotalDurations();
    
    // Mettre à jour l'élément des statistiques globales desktop s'il existe
    const statsElement = document.getElementById('site-stats');
    if (statsElement) {
        const timeDisplay = stats.formatTime(stats.totalSeconds);
            
        statsElement.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${stats.totalSections}</span>
                <span class="stat-label">Concerts</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.totalPieces}</span>
                <span class="stat-label">Pièces</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${timeDisplay}</span>
                <span class="stat-label">Durée totale</span>
            </div>
        `;
    }
    
    // Les statistiques mobiles ne sont plus nécessaires
    
    // Mettre à jour les durées de chaque section
    Object.keys(stats.sectionDurations).forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const header = section.querySelector('.section-header h2');
            const durationSpan = section.querySelector('.section-duration');
            const sectionSeconds = stats.sectionDurations[sectionId];
            
            if (header && sectionSeconds > 0) {
                // Supprimer l'ancienne durée si elle existe
                if (durationSpan) {
                    durationSpan.remove();
                }
                
                // Ajouter la nouvelle durée
                const newDurationSpan = document.createElement('span');
                newDurationSpan.className = 'section-duration';
                newDurationSpan.textContent = ` (${stats.formatTime(sectionSeconds)})`;
                header.appendChild(newDurationSpan);
            }
        }
    });
    
    // Mettre à jour le titre de la page avec les statistiques
    const timeForTitle = stats.formatTime(stats.totalSeconds);
    document.title = `Fiche Musicien - ${stats.totalPieces} pièces, ${timeForTitle}`;
    
    console.log(`📊 Statistiques mises à jour: ${stats.totalPieces} pièces, ${stats.totalSections} concerts, ${stats.formatTime(stats.totalSeconds)} au total`);
}

// Fonction pour générer un PDF
function generatePDF(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) {
        console.error('Section non trouvée:', sectionId);
        return;
    }

    if (typeof window.jspdf === 'undefined') {
        alert('Erreur: jsPDF non disponible');
        return;
    }

    try {
        // Créer une nouvelle instance jsPDF
        const doc = new window.jspdf.jsPDF();
        
        // Configuration de base
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let currentY = margin;
        
        // Récupérer le titre de la section
        const titleElement = section.querySelector('h2');
        const sectionTitle = titleElement ? titleElement.textContent.trim() : 'Programme Musical';
        
        // En-tête du document
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Fiche Musicien', pageWidth / 2, currentY, { align: 'center' });
        currentY += 15;
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(sectionTitle, pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;
        
        // Ligne de séparation
        doc.setLineWidth(0.5);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 15;
        
        // Date de génération
        doc.setFontSize(9);
        doc.setFont(undefined, 'italic');
        const currentDate = new Date().toLocaleDateString('fr-FR');
        const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        doc.text(`Document généré le ${currentDate} à ${currentTime}`, pageWidth / 2, currentY, { align: 'center' });
        currentY += 20;
        
        // Récupérer toutes les pièces de la section
        const pieces = section.querySelectorAll('.piece-card');
        const realPieces = Array.from(pieces).filter(piece => {
            const title = piece.querySelector('h3');
            return title && !piece.textContent.includes('Aucune pièce ajoutée') && !piece.textContent.includes('Section en cours');
        });
        
        // Calculer la durée totale de cette section
        let sectionTotalSeconds = 0;
        realPieces.forEach(piece => {
            const durationElement = Array.from(piece.querySelectorAll('p')).find(p => 
                p.textContent.includes('Durée:')
            );
            if (durationElement) {
                const durationText = durationElement.textContent.match(/Durée:\s*([0-9:]+)/);
                if (durationText) {
                    const duration = durationText[1];
                    const timeComponents = duration.split(':');
                    if (timeComponents.length >= 2) {
                        const minutes = parseInt(timeComponents[0]) || 0;
                        const seconds = parseInt(timeComponents[1]) || 0;
                        sectionTotalSeconds += minutes * 60 + seconds;
                    }
                }
            }
        });
        
        currentY += 5; // Espacement avant la liste des pièces
        
        if (realPieces.length === 0) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'italic');
            doc.text('Cette section ne contient pas encore de pièces musicales.', pageWidth / 2, currentY, { align: 'center' });
        } else {
            // Traiter chaque pièce
            realPieces.forEach((piece, index) => {
                const title = piece.querySelector('h3')?.textContent.trim() || 'Titre non spécifié';
                
                // Chercher le compositeur
                const composerElement = Array.from(piece.querySelectorAll('p')).find(p => 
                    p.textContent.includes('Compositeur:')
                );
                const composer = composerElement ? 
                    composerElement.textContent.replace('Compositeur:', '').trim() : 
                    'Compositeur non spécifié';
                
                // Chercher la durée
                const durationElement = Array.from(piece.querySelectorAll('p')).find(p => 
                    p.textContent.includes('Durée:')
                );
                const duration = durationElement ? 
                    durationElement.textContent.replace('Durée:', '').trim() : '';
                
                // Ajouter un espacement entre les pièces
                if (index > 0) {
                    currentY += 8;
                }
                
                // Vérifier si on a besoin d'une nouvelle page
                if (currentY > pageHeight - 40) {
                    doc.addPage();
                    currentY = margin;
                }
                
                // Titre de la pièce
                doc.setFontSize(13);
                doc.setFont(undefined, 'bold');
                doc.text(`${index + 1}. ${title}`, margin, currentY);
                currentY += 6;
                
                // Compositeur
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                doc.text(`Compositeur : ${composer}`, margin + 10, currentY);
                currentY += 5;
                
                // Durée (si disponible)
                if (duration) {
                    doc.text(`Durée : ${duration}`, margin + 10, currentY);
                    currentY += 5;
                }
            });
        }
        
        // Ajouter un divider et les statistiques après les pièces
        if (realPieces.length > 0) {
            currentY += 15; // Espacement avant le divider
            
            // Vérifier si on a besoin d'une nouvelle page
            if (currentY > pageHeight - 60) {
                doc.addPage();
                currentY = margin;
            }
            
            // Divider (ligne de séparation)
            doc.setLineWidth(0.5);
            doc.setDrawColor(100, 100, 100); // Gris
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 10;
            
            // Statistiques sous le divider - alignées à droite
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Nombre de pieces : ${realPieces.length}`, pageWidth - margin, currentY, { align: 'right' });
            currentY += 6;
            
            if (sectionTotalSeconds > 0) {
                const totalMinutes = Math.floor(sectionTotalSeconds / 60);
                const remainingSeconds = sectionTotalSeconds % 60;
                const timeDisplay = totalMinutes > 0 ? 
                    `${totalMinutes}min ${remainingSeconds.toString().padStart(2, '0')}s` : 
                    `${remainingSeconds}s`;
                doc.text(`Duree totale estimee : ${timeDisplay}`, pageWidth - margin, currentY, { align: 'right' });
                currentY += 6;
            }
        }
        
        // Pied de page
        const footerY = pageHeight - 15;
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text('Fiche Musicien', pageWidth / 2, footerY, { align: 'center' });
        
        // Générer le nom de fichier
        const fileName = `Programme_${sectionTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        
        // Télécharger le PDF
        doc.save(fileName);
        
        console.log(`✅ PDF généré: ${fileName}`);
    } catch (error) {
        console.error('❌ Erreur lors de la génération PDF:', error);
        alert('Erreur lors de la génération du PDF');
    }
}

// Ajouter des infobulles aux liens
function addTooltips() {
    document.querySelectorAll('a').forEach(link => {
        if (link.textContent.includes('🎵')) {
            link.title = 'Écouter l\'enregistrement audio';
        } else if (link.textContent.includes('📄')) {
            link.title = 'Télécharger la partition PDF';
        } else if (link.textContent.includes('🛒')) {
            link.title = 'Acheter la partition';
        }
    });
}

// Ajouter un bouton "retour en haut" (seulement sur desktop)
function addBackToTopButton() {
    // Ne pas créer le bouton sur mobile
    if (window.innerWidth <= 768) {
        console.log('📱 Bouton retour en haut désactivé sur mobile');
        return;
    }
    
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.className = 'back-to-top';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        border-radius: 10px;
        background: #4299e1;
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(66, 153, 225, 0.3);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
        font-weight: 600;
    `;
    
    document.body.appendChild(backToTopButton);
    
    // Effet hover
    backToTopButton.addEventListener('mouseenter', function() {
        this.style.background = '#3182ce';
        this.style.transform = 'translateY(-2px)';
    });
    
    backToTopButton.addEventListener('mouseleave', function() {
        this.style.background = '#4299e1';
        this.style.transform = 'translateY(0)';
    });
    
    // Afficher/masquer le bouton selon la position de scroll
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.style.opacity = '1';
        } else {
            backToTopButton.style.opacity = '0';
        }
    });
    
    // Action du bouton
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Fonction pour ajouter la recherche
function addSearchFunctionality() {
    const searchInput = document.getElementById('search-input');
    
    if (!searchInput) return;
    
    const searchContainer = document.querySelector('.search-container');
    const programmesTab = document.getElementById('programmes');
    
    if (!programmesTab) return;
    
    // Sauvegarder l'ordre original des sections
    const originalSections = Array.from(programmesTab.querySelectorAll('.concert-section'));
    
    // Gérer la visibilité de la barre de recherche selon l'onglet actif
    function toggleSearchVisibility() {
        const isVisible = programmesTab && programmesTab.classList.contains('active');
        if (searchContainer) {
            searchContainer.style.display = isVisible ? 'flex' : 'none';
        }
        // Plus de recherche mobile à gérer
    }
    
    // Fonction de recherche centralisée
    function performSearch(searchTerm) {
        const sections = Array.from(programmesTab.querySelectorAll('.concert-section'));
        const lowerSearchTerm = searchTerm.toLowerCase();
        
        if (!lowerSearchTerm) {
            // Si pas de recherche, remettre l'ordre original et tout afficher
            sections.forEach(section => {
                const pieces = section.querySelectorAll('.piece-card');
                pieces.forEach(piece => {
                    piece.style.display = 'block';
                    piece.style.opacity = '1';
                });
                section.style.display = 'block';
            });
            
            // Restaurer l'ordre original
            originalSections.forEach(section => {
                programmesTab.appendChild(section);
            });
            return;
        }
        
        // Créer un tableau pour trier les sections
        const sectionsWithResults = [];
        const sectionsWithoutResults = [];
        
        sections.forEach(section => {
            const pieces = section.querySelectorAll('.piece-card');
            let hasResults = false;
            
            // D'abord vérifier si le terme de recherche correspond au titre de la section
            const sectionTitle = section.querySelector('h2')?.textContent.toLowerCase() || '';
            const sectionMatchesSearch = sectionTitle.includes(searchTerm);
            pieces.forEach(piece => {
                const text = piece.textContent.toLowerCase();
                if (text.includes(lowerSearchTerm)) {
                    piece.style.display = 'block';
                    piece.style.opacity = '1';
                    hasResults = true;
                } else {
                    piece.style.display = 'none';
                }
            });
            
            if (hasResults) {
                sectionsWithResults.push(section);
                section.style.display = 'block';
            } else {
                sectionsWithoutResults.push(section);
                section.style.display = 'none';
            }
        });
        
        // Réorganiser les sections : résultats en haut, puis sections vides
        const allSections = [...sectionsWithResults, ...sectionsWithoutResults];
        
        // Réinsérer les sections dans le bon ordre
        allSections.forEach(section => {
            programmesTab.appendChild(section);
        });
    }
    
    // Initialiser la visibilité
    toggleSearchVisibility();
    
    // Ajouter l'événement de recherche pour le champ desktop
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            performSearch(this.value);
        });
    }
    
    // Écouter les changements d'onglets pour ajuster la visibilité
    document.querySelectorAll('.tab-button, .mobile-nav-item').forEach(button => {
        button.addEventListener('click', function() {
            setTimeout(toggleSearchVisibility, 10);
        });
    });
}

// Gestionnaire de modale vidéo YouTube
function initVideoModal() {
    const modal = document.getElementById('video-modal');
    const audioPlayer = document.getElementById('audio-player');
    const youtubePlayer = document.getElementById('youtube-player');
    const audioTitle = document.getElementById('audio-title');
    const audioTitleFloating = document.getElementById('audio-title-floating');
    
    const closeModalBtn = document.getElementById('close-modal-btn');
    const audioModeBtn = document.getElementById('audio-mode-btn');
    const showVideoBtn = document.getElementById('show-video-btn');
    const stopAudioBtn = document.getElementById('stop-audio-btn');
    
    if (!modal || !youtubePlayer) {
        console.warn('⚠️ Éléments de la modale vidéo non trouvés');
        return;
    }
    
    let currentVideoId = '';
    let currentTitle = '';
    
    // Fonction pour extraire l'ID YouTube d'une URL
    function getYouTubeVideoId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
    
    // Intercepter les clics sur les liens audio YouTube
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href*="youtube.com"]');
        if (link && link.textContent.includes('🎵')) {
            e.preventDefault();
            
            const videoUrl = link.href;
            const videoId = getYouTubeVideoId(videoUrl);
            
            if (videoId) {
                // Sur mobile, rediriger directement vers YouTube
                if (window.innerWidth <= 768) {
                    // Essayer d'ouvrir l'app YouTube, sinon fallback vers le navigateur
                    window.open(videoUrl, '_blank');
                    return;
                }
                
                // Sur desktop, utiliser le lecteur modal
                const pieceCard = link.closest('.piece-card');
                const title = pieceCard ? pieceCard.querySelector('h3')?.textContent : 'Vidéo YouTube';
                
                openVideoModal(videoId, title);
            }
        }
    });
    
    // Ouvrir la modale vidéo
    function openVideoModal(videoId, title) {
        currentVideoId = videoId;
        currentTitle = title;
        
        // Mettre à jour les titres
        if (audioTitle) audioTitle.textContent = title;
        if (audioTitleFloating) audioTitleFloating.textContent = title;
        
        // URL avec autoplay
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        youtubePlayer.src = embedUrl;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Fermer la modale
    function closeModal() {
        modal.classList.remove('active');
        youtubePlayer.src = '';
        document.body.style.overflow = '';
        currentVideoId = '';
    }
    
    // Basculer en mode audio
    function switchToAudioMode() {
        modal.classList.remove('active');
        if (audioPlayer) audioPlayer.classList.add('active');
        document.body.style.overflow = '';
    }
    
    // Revenir au mode vidéo
    function switchToVideoMode() {
        if (audioPlayer) audioPlayer.classList.remove('active');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Arrêter complètement
    function stopAudio() {
        if (audioPlayer) audioPlayer.classList.remove('active');
        youtubePlayer.src = '';
        currentVideoId = '';
        currentTitle = '';
        document.body.style.overflow = '';
    }
    
    // Événements des boutons
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (audioModeBtn) {
        audioModeBtn.addEventListener('click', switchToAudioMode);
    }
    
    if (showVideoBtn) {
        showVideoBtn.addEventListener('click', switchToVideoMode);
    }
    
    if (stopAudioBtn) {
        stopAudioBtn.addEventListener('click', stopAudio);
    }
    
    // Fermer avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal.classList.contains('active')) {
                closeModal();
            } else if (audioPlayer && audioPlayer.classList.contains('active')) {
                stopAudio();
            }
        }
    });
    
    // Fermer en cliquant sur le fond
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Fonction de génération de PDF
function initPDFGeneration() {
    // Vérifier que jsPDF est disponible
    function checkJsPDF() {
        return typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF !== 'undefined';
    }
    
    // Fonction pour configurer les boutons PDF
    function setupPDFButtons() {
        document.querySelectorAll('.pdf-download-btn').forEach(button => {
            button.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                generatePDF(sectionId);
            });
        });
    }
    
    // Vérifier immédiatement
    if (checkJsPDF()) {
        console.log('✅ jsPDF chargé avec succès');
        setupPDFButtons();
    } else {
        console.log('⏳ En attente du chargement de jsPDF...');
        // Réessayer après un délai
        setTimeout(() => {
            if (checkJsPDF()) {
                setupPDFButtons();
            } else {
                console.warn('❌ jsPDF non disponible');
                // Désactiver les boutons PDF
                document.querySelectorAll('.pdf-download-btn').forEach(button => {
                    button.disabled = true;
                    button.textContent = '❌ PDF indisponible';
                    button.style.opacity = '0.5';
                });
            }
        }, 2000);
    }
}

// Fonction de synchronisation manuelle
function initManualSync() {
    const syncButton = document.getElementById('force-sync-btn');
    const syncStatus = document.getElementById('sync-status');
    const lastSyncElement = document.getElementById('last-sync');
    
    if (!syncButton) {
        console.warn('⚠️ Bouton de synchronisation non trouvé');
        return;
    }
    
    // Fonction pour afficher le statut
    function showSyncStatus(message, type = 'info') {
        if (syncStatus) {
            syncStatus.style.display = 'inline';
            syncStatus.textContent = message;
            syncStatus.className = `sync-status ${type}`;
            
            // Masquer après 5 secondes
            setTimeout(() => {
                syncStatus.style.display = 'none';
            }, 5000);
        }
    }
    
    // Fonction pour mettre à jour la dernière synchronisation
    function updateLastSync() {
        if (lastSyncElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            lastSyncElement.textContent = `${timeString}`;
        }
    }
    
    // Gestionnaire de clic sur le bouton de synchronisation
    syncButton.addEventListener('click', async function() {
        console.log('🔄 Synchronisation manuelle déclenchée');
        
        // Désactiver le bouton pendant la synchronisation
        syncButton.disabled = true;
        syncButton.textContent = '🔄 Synchronisation...';
        showSyncStatus('Synchronisation en cours...', 'info');
        
        try {
            // Vérifier la disponibilité de Notion
            if (typeof NotionSync === 'undefined' || typeof NOTION_CONFIG === 'undefined') {
                throw new Error('Configuration Notion non disponible');
            }
            
            const notionSync = new NotionSync(NOTION_CONFIG);
            
            // Synchroniser toutes les bases
            console.log('📊 Début de la synchronisation complète...');
            await notionSync.syncAllData();
            
            // Mettre à jour les statistiques
            updateSiteStatistics();
            updateLastSync();
            
            showSyncStatus('✅ Synchronisation terminée avec succès', 'success');
            console.log('✅ Synchronisation manuelle terminée avec succès');
            
        } catch (error) {
            console.error('❌ Erreur lors de la synchronisation manuelle:', error);
            showSyncStatus(`❌ Erreur: ${error.message}`, 'error');
        } finally {
            // Réactiver le bouton
            syncButton.disabled = false;
            syncButton.textContent = '🔄 Synchroniser maintenant';
        }
    });
    
    console.log('✅ Synchronisation manuelle initialisée');
}

console.log('✨ Toutes les fonctionnalités JavaScript ont été initialisées!');
console.log('🎵 Système de modale vidéo YouTube activé!');
console.log('📄 Génération de PDF activée!');
console.log('🔄 Synchronisation Notion configurée!');


// Système de vérification automatique des versions - DÉSACTIVÉ
// (Supprimé car interrompt inutilement l'expérience utilisateur)
/*
(function() {
    const CURRENT_VERSION = 'v20250707_e1ba978f'; // ✅ Version mobile optimisée
    const CHECK_INTERVAL = 300000; // ✅ 5 minutes au lieu de 30 secondes (beaucoup moins agressif)
    
    let isCheckingVersion = false;
    let lastNotificationTime = 0;
    let hasUserDismissed = false;
    let consecutiveErrors = 0;
    
    // Fonction pour vérifier la version de manière intelligente
    async function checkVersion() {
        // ✅ Multiples protections anti-spam + DÉSACTIVATION MOBILE
        if (isCheckingVersion || hasUserDismissed || consecutiveErrors > 3) return;
        
        // 📱 DÉSACTIVER les notifications de mise à jour sur mobile
        const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                              ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        
        if (isMobileDevice) {
            console.log('📱 Mobile détecté - Notifications de mise à jour désactivées');
            return; // ✅ Pas de notifications sur mobile
        }
        
        isCheckingVersion = true;
        
        try {
            const response = await fetch('/version.json?t=' + Date.now());
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const versionData = await response.json();
            consecutiveErrors = 0; // Reset sur succès
            
            // ✅ Vérification très stricte pour éviter les faux positifs
            if (versionData.version && 
                versionData.version !== CURRENT_VERSION && 
                versionData.version.length > 5) { // Sécurité supplémentaire
                
                // ✅ Éviter les notifications répétées (minimum 15 minutes entre notifications)
                const now = Date.now();
                if (now - lastNotificationTime > 900000) { // 15 minutes
                    console.log('🔄 Nouvelle version détectée:', versionData.version);
                    showUpdateNotification(versionData);
                    lastNotificationTime = now;
                }
            }
        } catch (error) {
            consecutiveErrors++;
            console.log(`ℹ️ Vérification version échouée (${consecutiveErrors}/3):`, error.message);
            
            // Arrêter les vérifications après 3 erreurs consécutives
            if (consecutiveErrors > 3) {
                console.log('⚠️ Trop d\'erreurs de vérification, arrêt du système');
            }
        } finally {
            isCheckingVersion = false;
        }
    }
    
    // Notification de mise à jour ultra-améliorée et discrète
    function showUpdateNotification(versionData) {
        // Supprimer toute notification existante
        const existingNotification = document.querySelector('.update-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Créer une notification très discrète
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <span class="update-icon">🔄</span>
                <div class="update-text-container">
                    <span class="update-title">Mise à jour disponible</span>
                    <span class="update-subtitle">Amélioration du site</span>
                </div>
                <div class="update-actions">
                    <button class="update-btn" onclick="smartReload()">Actualiser</button>
                    <button class="dismiss-btn" onclick="dismissUpdate()">×</button>
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 0.875rem;
            border-radius: 10px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 280px;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.4s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 0.85rem;
        `;
        
        // Styles CSS intégrés
        const style = document.createElement('style');
        style.textContent = `
            .update-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .update-icon {
                font-size: 1.1rem;
                flex-shrink: 0;
                animation: rotation 2s infinite linear;
            }
            
            @keyframes rotation {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .update-text-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 0.15rem;
            }
            
            .update-title {
                font-weight: 600;
                font-size: 0.85rem;
                line-height: 1.2;
            }
            
            .update-subtitle {
                font-size: 0.7rem;
                opacity: 0.85;
                line-height: 1.1;
            }
            
            .update-actions {
                display: flex;
                gap: 0.4rem;
                align-items: center;
            }
            
            .update-btn, .dismiss-btn {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 0.35rem 0.7rem;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.75rem;
                font-weight: 500;
                transition: all 0.2s;
                white-space: nowrap;
            }
            
            .update-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-1px);
            }
            
            .dismiss-btn {
                width: 24px;
                height: 24px;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            
            .dismiss-btn:hover {
                background: rgba(255, 255, 255, 0.25);
            }
        `;
        
        if (!document.getElementById('update-notification-styles')) {
            style.id = 'update-notification-styles';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Animation d'apparition fluide
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        // ✅ Auto-fermeture après 12 secondes (discret)
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 400);
            }
        }, 12000);
    }
     // ✅ Fonctions globales DÉSACTIVÉES (pour éviter les rechargements intempestifs)
    window.smartReload = function() {
        console.log('� Actualisation automatique désactivée pour éviter les interruptions');
        console.log('💡 Pour actualiser manuellement, utilisez F5 ou Ctrl+R');
        
        // Afficher une notification discrète au lieu de recharger
        showNotification('🔄 Actualisation automatique désactivée - Utilisez F5 pour actualiser manuellement', 'info', 5000);
    };

    window.dismissUpdate = function() {
        const notification = document.querySelector('.update-notification');
        if (notification) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(10px)';
            setTimeout(() => notification.remove(), 400);
        }
        
        console.log('ℹ️ Notification supprimée');
    };
    
    // ✅ Vérifier si l'utilisateur a déjà rejeté récemment
    const lastDismissed = localStorage.getItem('updateDismissed');
    if (lastDismissed && (Date.now() - parseInt(lastDismissed)) < 3600000) { // 1 heure
        hasUserDismissed = true;
        console.log('ℹ️ Notifications de mise à jour désactivées (rejetée récemment)');
    }
    
    // ✅ Démarrage très retardé et peu fréquent
    setTimeout(() => {
        console.log('✅ Système de vérification version démarré (mode discret)');
        console.log('📋 Version actuelle:', CURRENT_VERSION);
        
        // Première vérification après 5 minutes
        setTimeout(checkVersion, 300000); // 5 minutes
        
        // Puis vérifier toutes les 5 minutes SEULEMENT
        setInterval(checkVersion, CHECK_INTERVAL);
        
    }, 10000); // Attendre 10 secondes après le chargement
    
    // ✅ Vérification au focus TRÈS limitée
    let lastFocusCheck = 0;
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !hasUserDismissed) {
            const now = Date.now();
            // Minimum 10 minutes entre les vérifications au focus
            if (now - lastFocusCheck > 600000) {
                lastFocusCheck = now;
                setTimeout(checkVersion, 3000); // Délai de 3 secondes
            }
        }
    });
})();
*/

// 📱 SYSTÈME CACHE-BUSTING MOBILE ULTRA-SIMPLIFIÉ
(function() {
    // Détecter les appareils mobiles/tablettes
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    ('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0);
    
    if (isMobile) {
        console.log('📱 Mobile détecté - Cache-busting simplifié activé');
        
        // ✅ APPROCHE ULTRA-SIMPLE : Timestamp sur requêtes critiques uniquement
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            if (typeof url === 'string' && 
                (url.includes('events.json') || url.includes('version.json'))) {
                
                // Ajouter timestamp seulement sur fichiers critiques
                if (!url.includes('?t=') && !url.includes('&t=')) {
                    url += (url.includes('?') ? '&' : '?') + 't=' + Date.now();
                }
            }
            
            return originalFetch.call(this, url, options);
        };
        
        // ✅ Meta tag simple pour no-cache
        const metaNoCache = document.createElement('meta');
        metaNoCache.httpEquiv = 'Cache-Control';
        metaNoCache.content = 'no-cache, must-revalidate';
        document.head.appendChild(metaNoCache);
        
        console.log('✅ Cache-busting mobile ultra-simplifié opérationnel');
    }
})();