// Script principal - Version clean (v2)
document.addEventListener('DOMContentLoaded', function() {
    console.log('Programme Musical 2026 - Script clean v2 chargé!');
    
    // Initialiser les fonctionnalités de base
    initTabs();
    initVideoModal();
    addSearchFunctionality();
    
    console.log('✅ Site web complètement initialisé et prêt!');
});

// Gestion des onglets
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // Fonction pour afficher un onglet
    function showTab(targetId) {
        // Masquer tous les contenus d'onglets
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Désactiver tous les boutons d'onglets
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        
        // Afficher le contenu de l'onglet ciblé
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Activer le bouton correspondant
        const activeButton = document.querySelector(`[data-tab="${targetId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
    
    // Ajouter les événements de clic aux boutons d'onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            showTab(targetTab);
        });
    });
}

// Gestion de la modale vidéo
function initVideoModal() {
    const videoModal = document.getElementById('video-modal');
    const youtubePlayer = document.getElementById('youtube-player');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const audioModeBtn = document.getElementById('audio-mode-btn');
    const audioPlayer = document.getElementById('audio-player');
    const audioTitle = document.getElementById('audio-title');
    const showVideoBtn = document.getElementById('show-video-btn');
    const stopAudioBtn = document.getElementById('stop-audio-btn');

    let currentVideoData = null;

    // Ouvrir la modale vidéo
    function openVideoModal(videoUrl, title) {
        const videoId = extractVideoId(videoUrl);
        if (videoId) {
            youtubePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            videoModal.classList.add('active'); // Utiliser la classe active
            document.body.style.overflow = 'hidden';
            currentVideoData = { videoId, title, fullUrl: videoUrl };
        }
    }

    // Fermer la modale vidéo
    function closeVideoModal() {
        youtubePlayer.src = '';
        videoModal.classList.remove('active'); // Utiliser la classe active
        document.body.style.overflow = '';
        audioPlayer.classList.remove('active'); // Utiliser classList au lieu de style.display
    }

    // Mode audio uniquement
    function switchToAudioMode() {
        if (currentVideoData) {
            audioTitle.textContent = currentVideoData.title;
            audioPlayer.classList.add('active'); // Utiliser la classe au lieu de style.display
            videoModal.classList.remove('active'); // Utiliser classList au lieu de style.display
            document.body.style.overflow = ''; // Restaurer le scroll
        }
    }

    // Retour au mode vidéo
    function switchToVideoMode() {
        if (currentVideoData) {
            youtubePlayer.src = `https://www.youtube.com/embed/${currentVideoData.videoId}?autoplay=1`;
            videoModal.classList.add('active'); // Utiliser la classe active
            audioPlayer.classList.remove('active'); // Utiliser classList au lieu de style.display
            document.body.style.overflow = 'hidden'; // Bloquer le scroll pour la modale
        }
    }

    // Extraire l'ID vidéo YouTube
    function extractVideoId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    // Événements
    closeModalBtn?.addEventListener('click', closeVideoModal);
    audioModeBtn?.addEventListener('click', switchToAudioMode);
    showVideoBtn?.addEventListener('click', switchToVideoMode);
    stopAudioBtn?.addEventListener('click', closeVideoModal);

    // Fermer avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeVideoModal();
        }
    });

    // Fermer en cliquant à l'extérieur
    videoModal?.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });

    // Ajouter les événements aux liens YouTube
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.href.includes('youtube.com')) {
            e.preventDefault();
            const pieceCard = e.target.closest('.piece-card');
            const title = pieceCard ? pieceCard.querySelector('h3')?.textContent || 'Vidéo YouTube' : 'Vidéo YouTube';
            openVideoModal(e.target.href, title);
        }
    });
}

// Fonction de recherche avec réorganisation des sections
function addSearchFunctionality() {
    console.log('🔄 Initialisation de la fonction de recherche...');
    const searchInput = document.getElementById('search-input');
    if (!searchInput) {
        console.error('❌ Champ de recherche non trouvé!');
        return;
    }
    console.log('✅ Champ de recherche trouvé');

    const programmesContainer = document.getElementById('programmes');
    
    // Stocker l'ordre original des sections (seulement celles avec du contenu)
    const originalSectionOrder = Array.from(programmesContainer.querySelectorAll('.concert-section:not(.empty-section)'));
    const originalCardOrders = new Map();
    
    console.log(`📋 ${originalSectionOrder.length} sections trouvées`);
    
    // Sauvegarder l'ordre original des cartes dans chaque section
    originalSectionOrder.forEach(section => {
        const grid = section.querySelector('.pieces-grid');
        if (grid) {
            const cards = Array.from(grid.querySelectorAll('.piece-card'));
            originalCardOrders.set(section, cards);
            console.log(`📦 Section "${section.querySelector('h2')?.textContent}" avec ${cards.length} cartes sauvegardée`);
        }
    });

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        console.log(`🔍 Recherche: "${searchTerm}"`);
        
        if (searchTerm === '') {
            console.log('🔄 Restauration de l\'ordre original...');
            
            // Restaurer l'ordre original des sections
            originalSectionOrder.forEach((section, index) => {
                // Réinsérer chaque section dans l'ordre original
                if (index === 0) {
                    programmesContainer.insertBefore(section, programmesContainer.firstChild);
                } else {
                    programmesContainer.insertBefore(section, originalSectionOrder[index - 1].nextSibling);
                }
                section.style.opacity = '1';
            });
            
            // Restaurer l'ordre original des cartes
            originalCardOrders.forEach((originalCards, section) => {
                const grid = section.querySelector('.pieces-grid');
                if (grid) {
                    // Vider la grille et remettre les cartes dans l'ordre
                    grid.innerHTML = '';
                    originalCards.forEach(card => {
                        card.style.display = '';
                        card.classList.remove('hidden', 'search-match');
                        grid.appendChild(card);
                    });
                }
            });
            
            console.log('✅ Ordre original restauré');
            return;
        }
        
        const sectionsWithMatches = [];
        const sectionsWithoutMatches = [];
        
        // Analyser chaque section
        originalSectionOrder.forEach(section => {
            const grid = section.querySelector('.pieces-grid');
            if (!grid) return;
            
            const cards = Array.from(grid.querySelectorAll('.piece-card'));
            let hasMatches = false;
            const matchingCards = [];
            const nonMatchingCards = [];
            
            cards.forEach(card => {
                const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const composer = card.textContent.toLowerCase();
                
                if (title.includes(searchTerm) || composer.includes(searchTerm)) {
                    console.log(`✅ Correspondance trouvée: ${title}`);
                    card.style.display = '';
                    card.classList.remove('hidden');
                    card.classList.add('search-match');
                    matchingCards.push(card);
                    hasMatches = true;
                } else {
                    card.style.display = 'none';
                    card.classList.add('hidden');
                    card.classList.remove('search-match');
                    nonMatchingCards.push(card);
                }
            });
            
            // Réorganiser les cartes dans cette section : correspondances en premier
            grid.innerHTML = '';
            [...matchingCards, ...nonMatchingCards].forEach(card => {
                grid.appendChild(card);
            });
            
            // Classer la section selon qu'elle a des correspondances ou non
            if (hasMatches) {
                sectionsWithMatches.push(section);
                section.style.opacity = '1';
                console.log(`📌 Section avec correspondances: ${section.querySelector('h2')?.textContent}`);
            } else {
                sectionsWithoutMatches.push(section);
                section.style.opacity = '0.5';
            }
        });
        
        console.log(`📊 ${sectionsWithMatches.length} sections avec correspondances, ${sectionsWithoutMatches.length} sans`);
        
        // Réorganiser les sections : d'abord celles avec des correspondances, puis les autres
        // On doit manipuler le DOM correctement
        const allSectionsInOrder = [...sectionsWithMatches, ...sectionsWithoutMatches];
        
        // Détacher toutes les sections d'abord
        allSectionsInOrder.forEach(section => {
            if (section.parentNode) {
                section.parentNode.removeChild(section);
            }
        });
        
        // Réinsérer dans le bon ordre
        const emptySection = programmesContainer.querySelector('.empty-section');
        allSectionsInOrder.forEach(section => {
            if (emptySection) {
                programmesContainer.insertBefore(section, emptySection);
            } else {
                programmesContainer.appendChild(section);
            }
        });
        
        console.log('🎯 Réorganisation terminée!');
    });
    
    console.log('✅ Fonction de recherche initialisée avec succès');
}

console.log('✨ Script clean v2 chargé avec succès - AUCUNE fonction PDF dans ce script!');
