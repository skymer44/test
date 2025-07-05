// Script principal - Version clean
document.addEventListener('DOMContentLoaded', function() {
    console.log('Programme Musical 2026 - Chargement terminé!');
    
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
            videoModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            currentVideoData = { videoId, title, fullUrl: videoUrl };
        }
    }

    // Fermer la modale vidéo
    function closeVideoModal() {
        youtubePlayer.src = '';
        videoModal.style.display = 'none';
        document.body.style.overflow = '';
        audioPlayer.style.display = 'none';
    }

    // Mode audio uniquement
    function switchToAudioMode() {
        if (currentVideoData) {
            audioTitle.textContent = currentVideoData.title;
            audioPlayer.style.display = 'flex';
            videoModal.style.display = 'none';
        }
    }

    // Retour au mode vidéo
    function switchToVideoMode() {
        if (currentVideoData) {
            youtubePlayer.src = `https://www.youtube.com/embed/${currentVideoData.videoId}?autoplay=1`;
            videoModal.style.display = 'flex';
            audioPlayer.style.display = 'none';
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

// Fonction de recherche
function addSearchFunctionality() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const pieceCards = document.querySelectorAll('.piece-card');
        
        pieceCards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const composer = card.textContent.toLowerCase();
            
            if (title.includes(searchTerm) || composer.includes(searchTerm)) {
                card.style.display = '';
                card.classList.remove('hidden');
            } else {
                card.style.display = 'none';
                card.classList.add('hidden');
            }
        });

        // Gérer l'affichage des sections vides
        document.querySelectorAll('.concert-section').forEach(section => {
            const visibleCards = section.querySelectorAll('.piece-card:not(.hidden)');
            if (visibleCards.length === 0 && searchTerm !== '') {
                section.style.opacity = '0.5';
            } else {
                section.style.opacity = '1';
            }
        });
    });
}

console.log('✨ Script principal chargé avec succès!');
