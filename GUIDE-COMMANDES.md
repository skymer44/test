# 🎵 Guide des Commandes - Programme Musical 2026

## 📋 **Commandes Essentielles**

### 🚀 **Synchronisation Notion → Site (ULTRA-ROBUSTE)**
```bash
npm run auto-sync
```
**✅ Cette commande fait TOUT automatiquement :**
- Synchronise depuis Notion
- Met à jour le site web
- Commit avec timestamp
- Push sur GitHub (résout les conflits automatiquement)
- **PLUS JAMAIS de blocage dans l'éditeur Git !**

**🛡️ Version ultra-robuste qui évite :**
- Les blocages dans vim/nano lors des merges
- Les boucles infinies
- Les conflits Git non résolus

---

### 🌐 **Démarrer le serveur local**
```bash
npm start
```
**📍 Ouvre votre site sur :** http://localhost:8000

---

### 🔧 **Commandes avancées (si besoin)**

#### Synchronisation manuelle étape par étape :
```bash
# 1. Récupérer les données depuis Notion
npm run sync

# 2. Mettre à jour le site web
npm run update-site

# 3. Synchronisation complète (1+2)
npm run full-sync
```

#### Test et diagnostic :
```bash
# Tester la connexion Notion
npm test

# Guide de configuration
npm run guide
```

---

## 🎯 **Workflow typique d'utilisation**

### **Scénario 1 : Mise à jour quotidienne**
1. **Modifier vos données dans Notion** (ajouter pièces, concerts, etc.)
2. **Synchroniser automatiquement :**
   ```bash
   npm run auto-sync
   ```
3. **Vérifier le résultat :**
   ```bash
   npm start
   ```
   → Votre site est à jour sur http://localhost:8000

### **Scénario 2 : Développement/test**
1. **Démarrer le serveur local :**
   ```bash
   npm start
   ```
2. **Dans un autre terminal, synchroniser :**
   ```bash
   npm run auto-sync
   ```
3. **Rafraîchir la page** → Changements visibles instantanément

---

## 🔄 **Synchronisation Automatique**

### **GitHub Actions (automatique)**
- ✅ **Synchronisation toutes les 10 minutes**
- ✅ **Déclenchement manuel possible** via l'interface GitHub
- ✅ **Aucune intervention requise**

### **Forcer une synchronisation immédiate**
Si vous ne voulez pas attendre les 10 minutes :
```bash
npm run auto-sync
```

---

## 🗂️ **Structure du projet**

```
📁 test/
├── 📄 index.html              # Site web généré
├── 📄 styles.css              # Styles CSS
├── 📄 script.js               # Fonctionnalités JS
├── 📁 data/
│   ├── 📄 pieces.json         # Données des pièces musicales
│   ├── 📄 concerts.json       # Données des concerts
│   └── 📁 site-backups/       # Sauvegardes automatiques
├── 📁 scripts/
│   ├── 📄 notion-sync.js      # Synchronisation Notion
│   ├── 📄 intelligent-update-site.js  # Mise à jour intelligente
│   └── 📄 sync-and-push.sh    # Script automatique (MAGIC!)
└── 📁 .github/workflows/
    └── 📄 notion-sync.yml     # Automation GitHub Actions
```

---

## 🎵 **Organisation des données**

Vos bases Notion sont automatiquement organisées en sections :

| **Base Notion** | **Section Site** | **Nombre pièces** |
|----------------|------------------|-------------------|
| Ma région virtuose | Ma région virtuose | 6 pièces |
| Concert du 11 d'avril avec Eric Aubier | Concert Eric Aubier | 6 pièces |
| Programme fête de la musique | Programme fête musique | 2 pièces |
| Retour Karaoké | Retour Karaoké | 1 pièce |
| Pièces qui n'ont pas trouvé leur concert | Pièces orphelines | 2 pièces |

---

## 🛠️ **Résolution des problèmes courants**

### **❌ Erreur "git conflicts" ou "push failed"**
**Solution :** Utilisez la commande magique qui résout tout :
```bash
npm run auto-sync
```

### **❌ Site pas à jour après modification Notion**
**Solutions :**
1. **Synchronisation manuelle immédiate :**
   ```bash
   npm run auto-sync
   ```
2. **Attendre 10 minutes** (synchronisation automatique)

### **❌ Erreur de connexion Notion**
**Diagnostic :**
```bash
npm test
```
**Si problème :** Vérifier que les bases Notion sont bien partagées avec l'intégration.

### **❌ Site web ne démarre pas**
**Solutions :**
```bash
# Vérifier si le port 8000 est libre
lsof -i :8000

# Redémarrer le serveur
npm start
```

---

## 📊 **Surveillance et logs**

### **Voir les dernières synchronisations**
```bash
git log --oneline -10
```

### **Vérifier l'état du repository**
```bash
git status
```

### **Voir les sauvegardes automatiques**
```bash
ls -la data/site-backups/
ls -la data/backup-*
```

---

## 🎉 **Commandes favorites (à retenir)**

| **Action** | **Commande** | **Description** |
|------------|--------------|-----------------|
| 🚀 **Tout synchroniser** | `npm run auto-sync` | **COMMANDE MAGIQUE** - Fait tout sans bug |
| 🌐 **Démarrer le site** | `npm start` | Lance le serveur local |
| 🔍 **Tester Notion** | `npm test` | Vérifie la connexion |
| 📊 **État Git** | `git status` | Voir les changements |
| 📝 **Logs récents** | `git log --oneline -5` | Voir les derniers commits |

---

## 🌐 **URLs importantes**

- **🏠 Site local :** http://localhost:8000
- **📱 Site GitHub Pages :** https://skymer44.github.io/test
- **⚙️ Repository GitHub :** https://github.com/skymer44/test
- **🔄 GitHub Actions :** https://github.com/skymer44/test/actions

---

## 🎯 **En cas de doute**

**La commande universelle qui résout 99% des problèmes :**
```bash
npm run auto-sync
```

**Cette commande :**
- ✅ Synchronise depuis Notion
- ✅ Met à jour le site web
- ✅ Résout automatiquement les conflits Git
- ✅ Push sur GitHub sans erreur
- ✅ Affiche un rapport détaillé

**Plus besoin de vous prendre la tête avec Git ! 🎉**
