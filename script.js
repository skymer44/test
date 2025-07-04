// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('Programme Musical 2026 - Site chargé avec succès!');
    
    // Initialiser les onglets
    initTabs();
    
    // Ajouter des animations au scroll
    initScrollAnimations();
    
    // Calculer et afficher les durées totales
    calculateTotalDurations();
    
    // Ajouter des tooltips informatifs
    addTooltips();
});

// Gestion des onglets
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Retirer la classe active de tous les boutons et contenus
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            
            // Afficher le contenu correspondant
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Scroll vers le haut du contenu
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
}

// Animations au scroll
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observer toutes les cartes de pièces
    document.querySelectorAll('.piece-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Calculer les durées totales de chaque concert
function calculateTotalDurations() {
    const sections = document.querySelectorAll('.concert-section');
    
    sections.forEach(section => {
        const pieces = section.querySelectorAll('.piece-card');
        let totalMinutes = 0;
        let totalSeconds = 0;
        
        pieces.forEach(piece => {
            const durationText = piece.querySelector('p:contains("Durée:")');
            if (durationText) {
                const durationMatch = durationText.textContent.match(/(\d{2}):(\d{2})/);
                if (durationMatch) {
                    totalMinutes += parseInt(durationMatch[1]);
                    totalSeconds += parseInt(durationMatch[2]);
                }
            }
        });
        
        // Convertir les secondes en minutes si nécessaire
        totalMinutes += Math.floor(totalSeconds / 60);
        totalSeconds = totalSeconds % 60;
        
        // Ajouter le total à la section si des durées ont été trouvées
        if (totalMinutes > 0 || totalSeconds > 0) {
            const totalElement = document.createElement('div');
            totalElement.className = 'total-duration';
            totalElement.innerHTML = `
                <p><strong>Durée totale estimée: ${String(totalMinutes).padStart(2, '0')}:${String(totalSeconds).padStart(2, '0')}</strong></p>
            `;
            totalElement.style.cssText = `
                background: #f7fafc;
                padding: 1.5rem;
                border-radius: 10px;
                margin-top: 2rem;
                text-align: center;
                border: 1px solid #e2e8f0;
                color: #2d3748;
                font-size: 1rem;
            `;
            
            section.appendChild(totalElement);
        }
    });
}

// Ajouter des tooltips informatifs
function addTooltips() {
    // Ajouter des tooltips aux étoiles de probabilité
    const probabilityElements = document.querySelectorAll('td:contains("★")');
    probabilityElements.forEach(element => {
        element.title = 'Probabilité d\'obtention du financement';
        element.style.cursor = 'help';
    });
    
    // Ajouter des tooltips aux liens
    const links = document.querySelectorAll('.links a');
    links.forEach(link => {
        if (link.textContent.includes('🎵')) {
            link.title = 'Écouter l\'arrangement';
        } else if (link.textContent.includes('🎬')) {
            link.title = 'Voir l\'œuvre originale';
        } else if (link.textContent.includes('🛒')) {
            link.title = 'Acheter la partition';
        }
    });
}

// Fonction helper pour sélectionner les éléments contenant du texte
HTMLElement.prototype.querySelector_contains = function(selector, text) {
    return Array.from(this.querySelectorAll(selector))
        .find(el => el.textContent.includes(text));
};

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

// Initialiser le bouton retour en haut
addBackToTopButton();

// Ajouter des effets de hover sur les cartes
document.querySelectorAll('.piece-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px) scale(1.01)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Fonction pour rechercher dans les pièces
function addSearchFunctionality() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    // Cacher la barre de recherche par défaut (seulement visible sur l'onglet programmes)
    const searchContainer = document.querySelector('.search-container');
    
    // Gérer la visibilité de la barre de recherche selon l'onglet actif
    function toggleSearchVisibility() {
        const programmesTab = document.getElementById('programmes');
        const isVisible = programmesTab && programmesTab.classList.contains('active');
        searchContainer.style.display = isVisible ? 'block' : 'none';
    }
    
    // Initialiser la visibilité
    toggleSearchVisibility();
    
    // Ajouter l'événement de recherche
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const programmesTab = document.getElementById('programmes');
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
            return;
        }
        
        // Créer un tableau pour trier les sections
        const sectionsWithResults = [];
        const sectionsWithoutResults = [];
        
        sections.forEach(section => {
            const pieces = section.querySelectorAll('.piece-card');
            let hasResults = false;
            
            // D'abord vérifier si le terme de recherche correspond au titre de la section
            const sectionTitle = section.querySelector('h2').textContent.toLowerCase();
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
                section.style.display = 'none'; // Cacher les sections sans résultats
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
            setTimeout(toggleSearchVisibility, 10); // Petit délai pour que l'onglet soit activé
        });
    });
}

// Initialiser la recherche
addSearchFunctionality();

// Gestionnaire de modale vidéo YouTube
function initVideoModal() {
    const modal = document.getElementById('video-modal');
    const audioPlayer = document.getElementById('audio-player');
    const youtubePlayer = document.getElementById('youtube-player');
    const audioTitle = document.getElementById('audio-title');
    
    const closeModalBtn = document.getElementById('close-modal-btn');
    const audioModeBtn = document.getElementById('audio-mode-btn');
    const showVideoBtn = document.getElementById('show-video-btn');
    const stopAudioBtn = document.getElementById('stop-audio-btn');
    
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
                const title = pieceCard ? pieceCard.querySelector('h3').textContent : 'Vidéo YouTube';
                
                openVideoModal(videoId, title);
            }
        }
    });
    
    // Ouvrir la modale vidéo
    function openVideoModal(videoId, title) {
        currentVideoId = videoId;
        currentTitle = title;
        
        audioTitle.textContent = title;
        
        // URL avec autoplay
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        youtubePlayer.src = embedUrl;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Empêcher le scroll de la page
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
        audioPlayer.classList.add('active');
        
        // Garder la vidéo en cours mais invisible
        document.body.style.overflow = '';
    }
    
    // Revenir au mode vidéo
    function switchToVideoMode() {
        audioPlayer.classList.remove('active');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Arrêter complètement
    function stopAudio() {
        console.log('🛑 Arrêt demandé');
        audioPlayer.classList.remove('active');
        youtubePlayer.src = ''; // Arrêter complètement la vidéo
        currentVideoId = '';
        currentTitle = '';
        document.body.style.overflow = '';
        console.log('✅ Audio arrêté et nettoyé');
    }
    
    // Événements des boutons
    closeModalBtn.addEventListener('click', function() {
        console.log('🗙 Fermeture modale');
        closeModal();
    });
    
    audioModeBtn.addEventListener('click', function() {
        console.log('🎧 Basculement en mode audio');
        switchToAudioMode();
    });
    
    showVideoBtn.addEventListener('click', function() {
        console.log('▶ Retour en mode vidéo');
        switchToVideoMode();
    });
    
    stopAudioBtn.addEventListener('click', function() {
        console.log('⏹ Clic sur arrêt audio');
        stopAudio();
    });
    
    // Fermer avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal.classList.contains('active')) {
                closeModal();
            } else if (audioPlayer.classList.contains('active')) {
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

// Initialiser la modale vidéo
initVideoModal();

console.log('✨ Toutes les fonctionnalités JavaScript ont été initialisées!');
console.log('🎵 Système de modale vidéo YouTube activé!');
