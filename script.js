// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('Programme Musical 2026 - Site chargé avec succès!');
    
    // Ajouter des animations au scroll
    initScrollAnimations();
    
    // Calculer et afficher les durées totales
    calculateTotalDurations();
    
    // Ajouter des tooltips informatifs
    addTooltips();
    
    // Navigation smooth scrolling
    initSmoothScrolling();
});

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
                background: linear-gradient(135deg, #e3f2fd, #bbdefb);
                padding: 1rem;
                border-radius: 8px;
                margin-top: 2rem;
                text-align: center;
                border-left: 4px solid #2196f3;
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

// Navigation smooth scrolling
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Ajouter une classe active temporairement
                this.classList.add('active');
                setTimeout(() => {
                    this.classList.remove('active');
                }, 2000);
            }
        });
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
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(backToTopButton);
    
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
    const searchContainer = document.createElement('div');
    searchContainer.innerHTML = `
        <div style="text-align: center; margin: 2rem 0;">
            <input type="text" id="searchInput" placeholder="Rechercher une pièce, un compositeur..." 
                   style="padding: 1rem; width: 300px; border: 2px solid #667eea; border-radius: 25px; font-size: 1rem;">
        </div>
    `;
    
    const main = document.querySelector('main');
    main.insertBefore(searchContainer, main.firstChild);
    
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const pieces = document.querySelectorAll('.piece-card');
        
        pieces.forEach(piece => {
            const text = piece.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                piece.style.display = 'block';
                piece.style.opacity = '1';
            } else {
                piece.style.display = searchTerm ? 'none' : 'block';
            }
        });
    });
}

// Initialiser la recherche
addSearchFunctionality();

console.log('✨ Toutes les fonctionnalités JavaScript ont été initialisées!');
