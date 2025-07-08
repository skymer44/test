# 🚀 GUIDE COMPLET - Comment Pusher sur GitHub sans Conflits

## ✅ **PROCÉDURE RECOMMANDÉE (à suivre à chaque fois)**

### **1. Avant de commencer à travailler**
```bash
# Toujours récupérer les dernières modifications
git pull --rebase origin main
```

### **2. Pendant votre travail**
```bash
# Vérifier régulièrement l'état
git status

# Faire des commits fréquents
git add .
git commit -m "Description de vos modifications"
```

### **3. Avant de pusher (ÉTAPE CRUCIALE)**
```bash
# Récupérer les dernières modifications GitHub Actions
git pull --rebase origin main
```

### **4. Si tout va bien (pas de conflit)**
```bash
git push origin main
```

---

## 🔧 **EN CAS DE CONFLIT (comme aujourd'hui)**

### **Étape 1 : Identifier le type de conflit**
```bash
git status
```

### **Étape 2 : Résoudre selon la nouvelle architecture**

**Pour les fichiers de CODE (HTML, CSS, JS) :**
```bash
# Garder VOS modifications
git checkout --ours index.html
git checkout --ours styles.css
git checkout --ours script.js
git checkout --ours scripts/programme-loader.js
```

**Pour les fichiers de DONNÉES (JSON) :**
```bash
# Prendre les NOUVELLES données Notion
git checkout --theirs data/pieces.json
git checkout --theirs data/events.json
git checkout --theirs data/concerts.json
```

### **Étape 3 : Finaliser la résolution**
```bash
# Marquer comme résolu
git add .

# Continuer le rebase
git rebase --continue

# Pusher
git push origin main
```

---

## 📋 **COMMANDES DE SECOURS**

### **Si vous voulez annuler un rebase en cours**
```bash
git rebase --abort
```

### **Si vous voulez voir la différence entre versions**
```bash
git diff HEAD~1 HEAD -- index.html
```

### **Forcer un push (À ÉVITER sauf urgence)**
```bash
git push --force-with-lease origin main
```

---

## 🛡️ **STRATÉGIE ANTI-CONFLIT**

### **✅ CE QUI NE CAUSERA JAMAIS DE CONFLIT**
- Modifier `index.html`, `styles.css`, `script.js`, `scripts/programme-loader.js`
- Ajouter de nouveaux fichiers dans `scripts/`
- Modifier la configuration Netlify
- Créer de nouveaux fichiers de documentation

### **⚠️ CE QUI PEUT CAUSER DES CONFLITS**
- Modifier `data/*.json` manuellement (laissez faire Notion sync)
- Modifier `.github/workflows/` en même temps qu'une GitHub Action

### **🎯 RÈGLE D'OR DE NOTRE NOUVELLE ARCHITECTURE**
- **Vous modifiez** : le code (HTML, CSS, JS)
- **GitHub Actions modifie** : uniquement les données JSON (dans `data/`)
- **Architecture complètement séparée** :
  - HTML statique + Chargement dynamique des données
  - Plus de modification HTML par les scripts Notion
  - `programme-loader.js` génère les sections côté client
- **Pas d'intersection** = Pas de conflit !

---

## 🔄 **ROUTINE QUOTIDIENNE RECOMMANDÉE**

### **Le matin (avant de travailler)**
```bash
cd /Users/remilecomte/Downloads/test
git pull --rebase origin main
```

### **Pendant le travail**
```bash
# Commits fréquents
git add .
git commit -m "Description claire"
```

### **Avant de partir (push final)**
```bash
git pull --rebase origin main  # Récupérer les sync auto
git push origin main           # Envoyer vos modifs
```

---

## 🆘 **AIDE-MÉMOIRE DES COMMANDES**

| **Situation** | **Commande** |
|---------------|-------------|
| Récupérer les dernières modifs | `git pull --rebase origin main` |
| Voir l'état | `git status` |
| Ajouter tout | `git add .` |
| Commit | `git commit -m "message"` |
| Push | `git push origin main` |
| Garder mes modifs (conflit) | `git checkout --ours fichier` |
| Prendre leurs modifs (conflit) | `git checkout --theirs fichier` |
| Continuer après conflit | `git rebase --continue` |
| Annuler un rebase | `git rebase --abort` |

---

## 🎵 **RÉSUMÉ POUR VOUS**

Avec la nouvelle architecture dynamique que nous avons mise en place :

✅ **La plupart du temps** : Aucun conflit, push direct  
✅ **En cas de conflit** : Procédure simple et rapide  
✅ **Vos modifications** : Toujours préservées  
✅ **Données Notion** : Toujours à jour automatiquement
✅ **Noms des bases** : Synchronisés automatiquement, pas besoin de mapping manuel

**Architecture robuste :**
- `index.html` : Structure statique avec conteneurs vides
- `scripts/programme-loader.js` : Génère le HTML à partir des données JSON
- `data/*.json` : Données provenant de Notion, mises à jour par GitHub Actions
- Tous les slugs et IDs générés automatiquement depuis les noms de bases Notion

**Votre workflow devient :**
1. `git pull --rebase origin main` 
2. *Travaillez sur votre code*
3. `git add . && git commit -m "description"`
4. `git pull --rebase origin main` (sécurité)
5. `git push origin main`

**Pour ajouter une nouvelle base Notion :**
1. Créez la base dans Notion
2. Les scripts font tout le reste automatiquement !

C'est tout ! 🚀
