/**
 * Gestionnaire de documents pour le programme musical 2026
 * Permet de comparer les versions et identifier les changements automatiquement
 */

class DocumentManager {
    constructor() {
        this.storageKey = 'programme-musical-documents';
        this.currentVersion = null;
        this.previousVersion = null;
    }

    /**
     * Stocke un nouveau document et garde l'ancien comme référence
     */
    saveNewDocument(documentData, metadata = {}) {
        const storage = this.getStoredData();
        
        // L'ancien document courant devient la version précédente
        if (storage.current) {
            storage.previous = storage.current;
            this.previousVersion = storage.previous;
        }

        // Le nouveau document devient le courant
        storage.current = {
            data: documentData,
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString(),
                version: (storage.current?.metadata?.version || 0) + 1
            }
        };
        this.currentVersion = storage.current;

        // Sauvegarde dans localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(storage));
        
        return {
            changes: this.compareDocuments(),
            version: storage.current.metadata.version
        };
    }

    /**
     * Récupère les données stockées
     */
    getStoredData() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : { current: null, previous: null };
    }

    /**
     * Charge les documents depuis le stockage
     */
    loadDocuments() {
        const storage = this.getStoredData();
        this.currentVersion = storage.current;
        this.previousVersion = storage.previous;
        return {
            current: this.currentVersion,
            previous: this.previousVersion
        };
    }

    /**
     * Compare les documents et identifie les changements
     */
    compareDocuments() {
        if (!this.previousVersion || !this.currentVersion) {
            return {
                hasChanges: !!this.currentVersion,
                changes: [],
                summary: this.currentVersion ? 'Premier document chargé' : 'Aucun document'
            };
        }

        const changes = [];
        const prevData = this.previousVersion.data;
        const currData = this.currentVersion.data;

        // Comparaison des programmes musicaux
        changes.push(...this.compareProgrammes(prevData.programmes || [], currData.programmes || []));
        
        // Comparaison du financement
        changes.push(...this.compareFinancement(prevData.financement || {}, currData.financement || {}));

        return {
            hasChanges: changes.length > 0,
            changes: changes,
            summary: this.generateChangeSummary(changes)
        };
    }

    /**
     * Compare les programmes musicaux
     */
    compareProgrammes(oldProgrammes, newProgrammes) {
        const changes = [];
        
        // Créer des maps pour faciliter la comparaison
        const oldMap = new Map(oldProgrammes.map(p => [p.id || p.title, p]));
        const newMap = new Map(newProgrammes.map(p => [p.id || p.title, p]));

        // Détecter les nouveaux programmes
        for (const [id, programme] of newMap) {
            if (!oldMap.has(id)) {
                changes.push({
                    type: 'programme_added',
                    section: programme.section || 'unknown',
                    title: programme.title,
                    data: programme,
                    description: `Nouveau programme ajouté: ${programme.title}`
                });
            }
        }

        // Détecter les programmes supprimés
        for (const [id, programme] of oldMap) {
            if (!newMap.has(id)) {
                changes.push({
                    type: 'programme_removed',
                    section: programme.section || 'unknown',
                    title: programme.title,
                    data: programme,
                    description: `Programme supprimé: ${programme.title}`
                });
            }
        }

        // Détecter les modifications
        for (const [id, newProgramme] of newMap) {
            const oldProgramme = oldMap.get(id);
            if (oldProgramme) {
                const programmeChanges = this.compareProgrammeDetails(oldProgramme, newProgramme);
                changes.push(...programmeChanges);
            }
        }

        return changes;
    }

    /**
     * Compare les détails d'un programme spécifique
     */
    compareProgrammeDetails(oldProg, newProg) {
        const changes = [];
        const fields = ['compositeur', 'duree', 'info', 'links'];

        for (const field of fields) {
            if (JSON.stringify(oldProg[field]) !== JSON.stringify(newProg[field])) {
                changes.push({
                    type: 'programme_modified',
                    section: newProg.section || 'unknown',
                    title: newProg.title,
                    field: field,
                    oldValue: oldProg[field],
                    newValue: newProg[field],
                    description: `${newProg.title}: ${field} modifié`
                });
            }
        }

        return changes;
    }

    /**
     * Compare les informations de financement
     */
    compareFinancement(oldFinancement, newFinancement) {
        const changes = [];
        
        // Compare chaque dispositif de financement
        const oldDevices = oldFinancement.dispositifs || [];
        const newDevices = newFinancement.dispositifs || [];
        
        // Logique similaire pour les dispositifs de financement
        // (à implémenter selon la structure des données)
        
        return changes;
    }

    /**
     * Génère un résumé des changements
     */
    generateChangeSummary(changes) {
        if (changes.length === 0) return 'Aucun changement détecté';

        const summary = [];
        const byType = {};

        changes.forEach(change => {
            byType[change.type] = (byType[change.type] || 0) + 1;
        });

        if (byType.programme_added) {
            summary.push(`${byType.programme_added} programme(s) ajouté(s)`);
        }
        if (byType.programme_removed) {
            summary.push(`${byType.programme_removed} programme(s) supprimé(s)`);
        }
        if (byType.programme_modified) {
            summary.push(`${byType.programme_modified} modification(s) de programme`);
        }

        return summary.join(', ');
    }

    /**
     * Applique automatiquement les changements au site
     */
    async applyChangesToSite(changes) {
        const appliedChanges = [];

        for (const change of changes) {
            try {
                switch (change.type) {
                    case 'programme_added':
                        await this.addProgrammeToSite(change);
                        appliedChanges.push(change);
                        break;
                    case 'programme_removed':
                        await this.removeProgrammeFromSite(change);
                        appliedChanges.push(change);
                        break;
                    case 'programme_modified':
                        await this.modifyProgrammeInSite(change);
                        appliedChanges.push(change);
                        break;
                }
            } catch (error) {
                console.error(`Erreur lors de l'application du changement:`, error);
                change.error = error.message;
            }
        }

        return appliedChanges;
    }

    /**
     * Ajoute un programme au site HTML
     */
    async addProgrammeToSite(change) {
        // Cette méthode sera appelée par l'interface pour appliquer les changements
        console.log('Ajout du programme:', change.title);
    }

    /**
     * Supprime un programme du site HTML
     */
    async removeProgrammeFromSite(change) {
        console.log('Suppression du programme:', change.title);
    }

    /**
     * Modifie un programme existant
     */
    async modifyProgrammeInSite(change) {
        console.log('Modification du programme:', change.title, change.field);
    }

    /**
     * Exporte l'historique des documents
     */
    exportHistory() {
        const storage = this.getStoredData();
        return {
            current: storage.current,
            previous: storage.previous,
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Importe des documents depuis un export
     */
    importHistory(exportedData) {
        localStorage.setItem(this.storageKey, JSON.stringify({
            current: exportedData.current,
            previous: exportedData.previous
        }));
        this.loadDocuments();
    }

    /**
     * Efface l'historique
     */
    clearHistory() {
        localStorage.removeItem(this.storageKey);
        this.currentVersion = null;
        this.previousVersion = null;
    }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentManager;
} else {
    window.DocumentManager = DocumentManager;
}
