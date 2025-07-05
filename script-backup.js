// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('Programme Musical 2026 - Chargement terminé!');
    
    // Initialiser toutes les fonctionnalités
    initTabs();
    initVideoModal();
    addSearchFunctionality();
});

// Initialisation des onglets
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Fonction pour afficher un onglet
    function showTab(targetId) {
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
        }
        
        // Activer le bouton correspondant
        const targetButton = document.querySelector(`[data-tab="${targetId}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }
    
    // Ajouter les écouteurs d'événements aux boutons d'onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            showTab(targetTab);
        });
    });
    
    // Afficher le premier onglet par défaut
    if (tabButtons.length > 0) {
        const firstTab = tabButtons[0].getAttribute('data-tab');
        showTab(firstTab);
    }
}

// Initialisation de la modale vidéo
function initVideoModal() {
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('youtube-player');
    const closeBtn = document.getElementById('close-modal-btn');
    const audioModeBtn = document.getElementById('audio-mode-btn');
    const audioPlayer = document.getElementById('audio-player');
    const audioTitle = document.getElementById('audio-title');
    const showVideoBtn = document.getElementById('show-video-btn');
    const stopAudioBtn = document.getElementById('stop-audio-btn');
    
    let currentVideoId = null;
    let currentTitle = null;
    
    // Fonction pour extraire l'ID vidéo YouTube
    function getYouTubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
    
    // Fonction pour ouvrir la modale
    function openModal(videoUrl, title) {
        const videoId = getYouTubeVideoId(videoUrl);
        if (!videoId) return;
        
        currentVideoId = videoId;
        currentTitle = title;
        
        player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // Fonction pour fermer la modale
    function closeModal() {
        player.src = '';
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentVideoId = null;
        currentTitle = null;
    }
    
    // Fonction pour passer en mode audio
    function switchToAudioMode() {
        if (!currentVideoId) return;
        
        audioTitle.textContent = currentTitle || 'Pièce musicale';
        player.src = `https://www.youtube.com/embed/${currentVideoId}?autoplay=1`;
        
        modal.style.display = 'none';
        audioPlayer.style.display = 'block';
        document.body.style.overflow = 'auto';
    }
    
    // Fonction pour revenir en mode vidéo
    function switchToVideoMode() {
        if (!currentVideoId) return;
        
        player.src = `https://www.youtube.com/embed/${currentVideoId}?autoplay=1`;
        modal.style.display = 'flex';
        audioPlayer.style.display = 'none';
        document.body.style.overflow = 'hidden';
    }
    
    // Fonction pour arrêter l'audio
    function stopAudio() {
        player.src = '';
        audioPlayer.style.display = 'none';
        currentVideoId = null;
        currentTitle = null;
    }
    
    // Écouteurs d'événements
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
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
    
    // Fermer la modale en cliquant à l'extérieur
    modal?.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Fermer avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Ajouter les écouteurs aux liens audio
    document.querySelectorAll('a[href*="youtube.com"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const videoUrl = this.href;
            const pieceCard = this.closest('.piece-card');
            const title = pieceCard ? pieceCard.querySelector('h3').textContent : 'Pièce musicale';
            openModal(videoUrl, title);
        });
    });
}

// Fonctionnalité de recherche
function addSearchFunctionality() {
    const searchInput = document.getElementById('search-input');
    const allCards = document.querySelectorAll('.piece-card');
    const allSections = document.querySelectorAll('.concert-section');
    
    if (!searchInput) return;
    
    function performSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (searchTerm === '') {
            // Afficher toutes les cartes et sections
            allCards.forEach(card => {
                card.style.display = 'block';
            });
            allSections.forEach(section => {
                section.style.display = 'block';
            });
            return;
        }
        
        allSections.forEach(section => {
            let hasVisibleCards = false;
            const cardsInSection = section.querySelectorAll('.piece-card');
            
            cardsInSection.forEach(card => {
                const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const composer = card.querySelector('p')?.textContent.toLowerCase() || '';
                const info = card.textContent.toLowerCase();
                
                if (title.includes(searchTerm) || composer.includes(searchTerm) || info.includes(searchTerm)) {
                    card.style.display = 'block';
                    hasVisibleCards = true;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Afficher ou masquer la section selon si elle contient des cartes visibles
            section.style.display = hasVisibleCards ? 'block' : 'none';
        });
    }
    
    // Recherche en temps réel
    searchInput.addEventListener('input', function() {
        performSearch(this.value);
    });
    
    // Recherche au clic sur Entrée
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(this.value);
        }
    });
}

// Génération de PDF
function generatePDF(sectionId = null) {
    if (typeof window.jsPDF === 'undefined') {
        console.error('jsPDF n\'est pas chargé');
        return;
    }
    
    const { jsPDF } = window.jsPDF;
    const doc = new jsPDF();
    
    // Configuration
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    let yPosition = margin;
    
    // Titre principal
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Programme Musical 2026', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Sélectionner les sections à inclure
    let sectionsToInclude;
    if (sectionId) {
        sectionsToInclude = document.querySelectorAll(`#${sectionId}`);
    } else {
        sectionsToInclude = document.querySelectorAll('.concert-section:not(.empty-section)');
    }
    
    sectionsToInclude.forEach((section, sectionIndex) => {
        // Nouvelle page pour chaque section (sauf la première)
        if (sectionIndex > 0) {
            doc.addPage();
            yPosition = margin;
        }
        
        // Titre de la section
        const sectionTitle = section.querySelector('h2')?.textContent || 'Section';
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(sectionTitle, margin, yPosition);
        yPosition += 15;
        
        // Ligne de séparation
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
        
        // Pièces de la section
        const pieces = section.querySelectorAll('.piece-card');
        pieces.forEach((piece, index) => {
            // Vérifier si on a assez de place (environ 40px par pièce)
            if (yPosition > pageHeight - 60) {
                doc.addPage();
                yPosition = margin;
            }
            
            const title = piece.querySelector('h3')?.textContent || 'Titre inconnu';
            const details = Array.from(piece.querySelectorAll('p'))
                .map(p => p.textContent)
                .join(' | ');
            
            // Titre de la pièce
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`${index + 1}. ${title}`, margin, yPosition);
            yPosition += 8;
            
            // Détails de la pièce
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            const splitDetails = doc.splitTextToSize(details, maxWidth);
            doc.text(splitDetails, margin + 10, yPosition);
            yPosition += splitDetails.length * 5 + 8;
        });
        
        yPosition += 10;
    });
    
    // Pied de page avec date
    const now = new Date();
    const dateString = now.toLocaleDateString('fr-FR');
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Généré le ${dateString}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Nom du fichier
    const filename = sectionId ? 
        `programme-${sectionId}-${dateString.replace(/\//g, '-')}.pdf` : 
        `programme-musical-2026-${dateString.replace(/\//g, '-')}.pdf`;
    
    // Télécharger le PDF
    doc.save(filename);
}

// Ajouter les écouteurs pour les boutons PDF
document.addEventListener('DOMContentLoaded', function() {
    // Boutons PDF pour chaque section
    document.querySelectorAll('.pdf-download-btn').forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            generatePDF(sectionId);
        });
    });
});

// Afficher un message de statut
function showMessage(message, type = 'info') {
    // Créer ou réutiliser un élément de message
    let messageEl = document.getElementById('status-message');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'status-message';
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(messageEl);
    }
    
    // Définir le style selon le type
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    
    messageEl.style.backgroundColor = colors[type] || colors.info;
    messageEl.textContent = message;
    
    // Afficher le message
    setTimeout(() => {
        messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // Masquer après 3 secondes
    setTimeout(() => {
        messageEl.style.transform = 'translateX(100%)';
    }, 3000);
}
