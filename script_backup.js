// Programme Musical 2026 - JavaScript Principal
// Version nettoyée - Site statique

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('Programme Musical 2026 - Chargement terminé!');
    
    // Initialiser toutes les fonctionnalités
    initTabs();
    initScrollAnimations();
    addTooltips();
    addBackToTopButton();
    addSearchFunctionality();
    initVideoModal();
    initPDFGeneration();
    updateSiteStatistics();
    
    console.log('✅ Site web complètement initialisé et prêt!');
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
        const activeButton = document.querySelector(`[data-tab="${targetId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
    
    // Gérer les clics sur les boutons d'onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
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

// Calculer la durée totale et les statistiques
function calculateTotalDurations() {
    const sections = document.querySelectorAll('.concert-section');
    let totalMinutes = 0;
    let totalSections = 0;
    let totalPieces = 0;
    
    sections.forEach(section => {
        const pieces = section.querySelectorAll('.piece-card');
        const realPieces = Array.from(pieces).filter(piece => {
            const title = piece.querySelector('h3');
            return title && !piece.textContent.includes('Section en cours de développement');
        });
        
        if (realPieces.length > 0) {
            totalSections++;
            totalPieces += realPieces.length;
        }
        
        realPieces.forEach(piece => {
            const durationText = piece.textContent.match(/Durée:\s*(\d+):(\d+)|Durée:\s*(\d+)\s*min/);
            if (durationText) {
                if (durationText[1] && durationText[2]) {
                    // Format MM:SS
                    totalMinutes += parseInt(durationText[1]) + (parseInt(durationText[2]) / 60);
                } else if (durationText[3]) {
                    // Format XXmin
                    totalMinutes += parseInt(durationText[3]);
                }
            }
        });
    });
    
    return {
        totalMinutes: Math.round(totalMinutes),
        totalHours: Math.floor(totalMinutes / 60),
        remainingMinutes: Math.round(totalMinutes % 60),
        totalSections,
        totalPieces
    };
}

// Mettre à jour les statistiques du site
function updateSiteStatistics() {
    const stats = calculateTotalDurations();
    
    // Mettre à jour le titre de la page avec les statistiques
    const timeDisplay = stats.totalHours > 0 ? 
        `${stats.totalHours}h ${stats.remainingMinutes}min` : 
        `${stats.totalMinutes}min`;
        
    document.title = `Programme Musical 2026 - ${stats.totalPieces} pièces, ${stats.totalSections} concerts`;
    
    console.log(`📊 Statistiques: ${stats.totalPieces} pièces, ${stats.totalSections} concerts, ${stats.totalMinutes} minutes au total`);
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
        const titleElement = section.querySelector('h2') || section.querySelector('.section-header h2');
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
            return title && !piece.textContent.includes('Section en cours de développement');
        });
        
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
            const sectionTitle = section.querySelector('h2')?.textContent.toLowerCase() || 
                               section.querySelector('.section-header h2')?.textContent.toLowerCase() || '';
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

console.log('✨ Site statique initialisé avec toutes les fonctionnalités actives!');
console.log('🎵 Système de modale vidéo YouTube activé!');
console.log('📄 Génération de PDF activée!');
console.log('🔍 Recherche intelligente activée!');
