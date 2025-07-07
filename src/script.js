// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('Programme Musical 2026 - Chargement terminé!');
    
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
        initManualSync();
    } catch (error) {
        console.log('Certaines fonctionnalités avancées ne se sont pas chargées:', error);
    }
    
    console.log('✅ Site web complètement initialisé et prêt!');
});

// Initialisation des onglets - VERSION SIMPLE ET ROBUSTE
function initTabs() {
    console.log('🔄 Initialisation des onglets...');
    
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('Onglets trouvés:', tabButtons.length, 'Contenus trouvés:', tabContents.length);
    
    // Fonction pour afficher un onglet
    function showTab(targetId) {
        console.log('Affichage onglet:', targetId);
        
        // Masquer tous les contenus d'onglets
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Désactiver tous les boutons d'onglets
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Afficher le contenu de l'onglet ciblé
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.classList.add('active');
            console.log('✅ Onglet', targetId, 'activé');
        } else {
            console.error('❌ Contenu introuvable pour:', targetId);
        }
        
        // Activer le bouton correspondant
        const activeButton = document.querySelector(`[data-tab="${targetId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
    
    // Gérer les clics sur les boutons d'onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-tab');
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
    
    // Mettre à jour automatiquement les données
    setInterval(updateEventDisplay, 60000); // Mettre à jour toutes les minutes
    
    console.log('✅ Système des prochains événements initialisé');
}

/**
 * Charge et affiche les événements
 */
async function loadAndDisplayEvents() {
    try {
        const eventsData = await loadEventsData();
        
        // Calculer le prochain événement et les suivants
        const { nextEvent, upcomingEvents, allEvents } = processEvents(eventsData);
        
        // Afficher le prochain événement principal
        displayMainEvent(nextEvent);
        
        // Afficher l'aperçu des événements suivants
        displayUpcomingEventsPreview(upcomingEvents.slice(0, 3));
        
        // Préparer la liste complète (cachée)
        prepareAllEventsList(allEvents);
        
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
    
    // Gérer les titres et types qui peuvent être des tableaux
    const eventTitle = Array.isArray(event.title) ? event.title[0] || 'Événement' : event.title || 'Événement';
    const eventType = Array.isArray(event.type) ? event.type[0] || 'Événement' : event.type || 'Événement';
    
    // Calculer le countdown
    const countdownText = generateCountdownText(event);
    
    // Générer la liste des pièces
    const piecesHtml = event.pieces && event.pieces.length > 0 
        ? generatePiecesHtml(event.pieces)
        : '<div class="piece-item"><h5>Programme à définir</h5></div>';
    
    mainEventContainer.innerHTML = `
        <div class="main-event-content">
            <div class="main-event-header">
                <div class="event-type-badge ${eventTypeClass}">
                    ${eventTypeEmoji} ${eventType}
                </div>
                <div class="header-right">
                    <div class="live-indicator">
                        <span class="live-dot"></span>
                        <span>Mis à jour automatiquement</span>
                    </div>
                    <button class="add-to-calendar-btn" onclick="addEventToCalendar('${event.date}', '${eventType}', '${eventTitle}', ${JSON.stringify(event.pieces || []).replace(/"/g, '&quot;')}, '${event.notes || ''}')">
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
            
            <div class="event-pieces">
                <h4>🎼 Programme</h4>
                <div class="pieces-list">
                    ${piecesHtml}
                </div>
            </div>
            
            ${event.notes ? `
                <div class="event-notes">
                    <strong>ℹ️ Informations :</strong> ${event.notes}
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Affiche l'aperçu des événements suivants
 */
function displayUpcomingEventsPreview(events) {
    const upcomingContainer = document.getElementById('upcoming-events-list');
    
    if (!events || events.length === 0) {
        upcomingContainer.innerHTML = `
            <div class="no-events-message">
                <p>Aucun autre événement prévu pour le moment</p>
            </div>
        `;
        return;
    }
    
    const eventsHtml = events.map(event => generateMiniEventCard(event)).join('');
    upcomingContainer.innerHTML = eventsHtml;
}

/**
 * Prépare la liste complète des événements
 */
function prepareAllEventsList(events) {
    const allEventsContainer = document.getElementById('all-events-list');
    
    if (!events || events.length === 0) {
        allEventsContainer.innerHTML = `
            <div class="no-events-message">
                <p>Aucun événement à venir</p>
            </div>
        `;
        return;
    }
    
    const eventsHtml = events.map(event => generateMiniEventCard(event)).join('');
    allEventsContainer.innerHTML = eventsHtml;
}

/**
 * Configure les interactions des boutons
 */
function setupEventInteractions() {
    const showAllBtn = document.getElementById('show-all-events-btn');
    const hideAllBtn = document.getElementById('hide-all-events-btn');
    const allEventsSection = document.getElementById('all-events-section');
    const upcomingPreview = document.querySelector('.upcoming-events-preview');
    
    if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
            allEventsSection.style.display = 'block';
            upcomingPreview.style.display = 'none';
            showAllBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }
    
    if (hideAllBtn) {
        hideAllBtn.addEventListener('click', () => {
            allEventsSection.style.display = 'none';
            upcomingPreview.style.display = 'block';
            upcomingPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }
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
    // Gérer le cas où type est un tableau ou une chaîne
    const typeStr = Array.isArray(type) ? type[0] || '' : type || '';
    const lowerType = typeStr.toLowerCase();
    
    if (lowerType.includes('répétition')) return 'repetition';
    if (lowerType.includes('concert')) return 'concert';
    if (lowerType.includes('pas de')) return 'vacances';
    return 'other';
}

function getEventTypeEmoji(type) {
    // Gérer le cas où type est un tableau ou une chaîne
    const typeStr = Array.isArray(type) ? type[0] || '' : type || '';
    const lowerType = typeStr.toLowerCase();
    
    if (lowerType.includes('répétition')) return '🎵';
    if (lowerType.includes('concert')) return '🎼';
    if (lowerType.includes('pas de')) return '🏖️';
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

function generatePiecesHtml(pieces) {
    if (!pieces || pieces.length === 0) {
        return '<div class="piece-item"><h5>Programme à définir</h5></div>';
    }
    
    return pieces.map(piece => `
        <div class="piece-item">
            <h5>${piece}</h5>
        </div>
    `).join('');
}

function generateMiniEventCard(event) {
    const eventTypeClass = determineEventTypeClass(event.type);
    const eventTypeEmoji = getEventTypeEmoji(event.type);
    const countdownText = generateCountdownText(event);
    
    // Gérer les titres et types qui peuvent être des tableaux
    const eventTitle = Array.isArray(event.title) ? event.title[0] || 'Événement' : event.title || 'Événement';
    const eventType = Array.isArray(event.type) ? event.type[0] || 'Événement' : event.type || 'Événement';
    
    const piecesText = event.pieces && event.pieces.length > 0 
        ? `${event.pieces.slice(0, 2).join(', ')}${event.pieces.length > 2 ? ` +${event.pieces.length - 2} autres` : ''}`
        : 'Programme à définir';
    
    return `
        <div class="mini-event-card ${eventTypeClass}">
            <div class="mini-event-header">
                <div class="mini-event-type">${eventTypeEmoji} ${eventType}</div>
                <div class="mini-event-actions">
                    <div class="mini-event-countdown">${countdownText}</div>
                    <button class="mini-add-to-calendar-btn" onclick="addEventToCalendar('${event.date}', '${eventType}', '${eventTitle}', ${JSON.stringify(event.pieces || []).replace(/"/g, '&quot;')}, '${event.notes || ''}')" title="Ajouter au calendrier">
                        📅
                    </button>
                </div>
            </div>
            
            <div class="mini-event-date">${formatEventDate(event.date)}</div>
            
            <div class="mini-event-pieces">🎼 ${piecesText}</div>
            
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

// Fonction pour ajouter un événement au calendrier - VERSION GOOGLE CALENDAR OPTIMISÉE
function addEventToCalendar(date, type, title, pieces, notes) {
    try {
        // Créer la date de l'événement
        const eventDate = new Date(date);
        
        // Déterminer les heures selon le type d'événement
        let startTime, endTime, isAllDay = false;
        
        const lowerType = type.toLowerCase();
        let eventTitle, location;
        
        if (lowerType.includes('répétition')) {
            // Répétitions : toujours 20h-22h
            startTime = new Date(eventDate);
            startTime.setHours(20, 0, 0);
            endTime = new Date(eventDate);
            endTime.setHours(22, 0, 0);
            eventTitle = `Répétition de l'Harmonie de Châteaubriant`;
            location = "Conservatoire de Châteaubriant, 6 Rue Guy Môquet, 44110 Châteaubriant";
        } else {
            // Concerts et autres événements : toute la journée
            startTime = new Date(eventDate);
            startTime.setHours(0, 0, 0);
            endTime = new Date(eventDate);
            endTime.setHours(23, 59, 59);
            isAllDay = true;
            eventTitle = title;
            location = "Conservatoire de Châteaubriant, 6 Rue Guy Môquet, 44110 Châteaubriant";
        }
        
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
    
    // Mettre à jour l'élément des statistiques globales s'il existe
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
    document.title = `Programme Musical 2026 - ${stats.totalPieces} pièces, ${timeForTitle}`;
    
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
        doc.text('Programme Musical 2026', pageWidth / 2, currentY, { align: 'center' });
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
        doc.text('Programme Musical 2026', pageWidth / 2, footerY, { align: 'center' });
        
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

// Ajouter un bouton "retour en haut"
function addBackToTopButton() {
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
    }
    
    // Initialiser la visibilité
    toggleSearchVisibility();
    
    // Ajouter l'événement de recherche
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const sections = Array.from(programmesTab.querySelectorAll('.concert-section'));
        
        if (!searchTerm) {
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
            
            if (sectionMatchesSearch) {
                // Si la section correspond, afficher toutes les pièces de cette section
                pieces.forEach(piece => {
                    piece.style.display = 'block';
                    piece.style.opacity = '1';
                });
                hasResults = true;
            } else {
                // Sinon, vérifier pièce par pièce
                pieces.forEach(piece => {
                    const text = piece.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        piece.style.display = 'block';
                        piece.style.opacity = '1';
                        hasResults = true;
                    } else {
                        piece.style.display = 'none';
                    }
                });
            }
            
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
    });
    
    // Écouter les changements d'onglets pour ajuster la visibilité
    document.querySelectorAll('.tab-button').forEach(button => {
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
                // Trouver le titre de la pièce
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



// Système de vérification automatique des versions
(function() {
    const CURRENT_VERSION = 'v20250707_471cdbda';
    const CHECK_INTERVAL = 30000; // 30 secondes
    
    let isCheckingVersion = false;
    
    // Fonction pour vérifier la version
    async function checkVersion() {
        if (isCheckingVersion) return;
        isCheckingVersion = true;
        
        try {
            const response = await fetch('/version.json?t=' + Date.now());
            const versionData = await response.json();
            
            if (versionData.version !== CURRENT_VERSION) {
                console.log('🔄 Nouvelle version détectée:', versionData.version);
                showUpdateNotification(versionData);
            }
        } catch (error) {
            console.log('Erreur vérification version:', error);
        } finally {
            isCheckingVersion = false;
        }
    }
    
    // Afficher une notification de mise à jour
    function showUpdateNotification(versionData) {
        // Créer une notification discrète
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <span class="update-icon">🔄</span>
                <span class="update-text">Nouvelle version disponible!</span>
                <button class="update-btn" onclick="location.reload(true)">Mettre à jour</button>
                <button class="dismiss-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4299e1;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: system-ui;
            animation: slideIn 0.3s ease;
        `;
        
        // Ajouter les styles pour l'animation
        if (!document.getElementById('update-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'update-notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .update-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .update-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.875rem;
                }
                .update-btn:hover {
                    background: rgba(255,255,255,0.3);
                }
                .dismiss-btn {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 1.2rem;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto-mise à jour après 10 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                location.reload(true);
            }
        }, 10000);
    }
    
    // Démarrer la vérification périodique
    setInterval(checkVersion, CHECK_INTERVAL);
    
    // Vérifier aussi quand la page redevient visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(checkVersion, 1000);
        }
    });
    
    // Vérifier au chargement initial
    setTimeout(checkVersion, 5000);
    
    console.log('🔄 Système de vérification des versions activé - Version courante:', CURRENT_VERSION);
})();