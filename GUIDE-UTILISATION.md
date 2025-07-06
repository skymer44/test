# 🎯 Guide d'Utilisation - Nouvelle Architecture

## ✅ Félicitations ! Votre problème est résolu

Votre site fonctionne maintenant avec une **architecture séparée** qui protège votre code de développement.

## 🚀 Utilisation Quotidienne

### Pour Développer le Site

**1. Modifier l'apparence/style :**
```bash
# Éditer les styles (protégé de Notion)
nano src/styles.css

# Construire et tester
npm run build
npm run start  # Site accessible sur http://localhost:8000
```

**2. Modifier la structure HTML :**
```bash
# Éditer le template (protégé de Notion)
nano src/template.html

# Construire et déployer
npm run build
npm run deploy
```

**3. Ajouter du JavaScript :**
```bash
# Éditer le script (protégé de Notion)  
nano src/script.js

# Construire
npm run build
```

### Pour la Synchronisation Notion

**Synchronisation complète (recommandée) :**
```bash
npm run new-sync
```
*Cela fait : sync données + build site + deploy*

**Ou étape par étape :**
```bash
npm run sync    # Récupérer les nouvelles données de Notion
npm run build   # Construire le site avec les nouvelles données  
npm run deploy  # Déployer le site mis à jour
```

## 🛡️ Ce Qui Est Protégé

**Ces fichiers ne seront JAMAIS touchés par Notion :**
- ✅ `src/template.html` - Structure de votre site
- ✅ `src/styles.css` - Tous vos styles CSS
- ✅ `src/script.js` - Toutes vos fonctionnalités JavaScript

**Notion ne modifie que :**
- `data/pieces.json` - Les données musicales
- `data/concerts.json` - Les informations de concerts

## 🔄 Workflow Automatique GitHub

**Ancien système** (à désactiver) :
- ❌ Toutes les 10 minutes (144x/jour)
- ❌ Écrase votre code de développement
- ❌ Conflits Git constants

**Nouveau système** (déjà configuré) :
- ✅ 2 fois par jour (8h et 18h)
- ✅ Protège votre code dans `/src/`
- ✅ Déploie intelligemment seulement s'il y a des changements

## 📊 Commandes Disponibles

```bash
# 🔄 Synchronisation et build
npm run sync        # Sync Notion → /data/
npm run build       # Build /src/ + /data/ → /build/
npm run deploy      # Deploy /build/ → site public
npm run new-sync    # Tout en une fois

# 🧪 Développement  
npm run start       # Serveur local (port 8000)
npm run dev         # Build + serveur local

# 🔍 Debug et tests
npm run test        # Tester la config Notion
npm run guide       # Guide de configuration Notion
```

## 🎯 Exemples Concrets

### Exemple 1: Changer la couleur du site
```bash
# 1. Modifier le CSS (protégé)
nano src/styles.css
# → Changer les couleurs à votre goût

# 2. Construire et tester
npm run build
npm run start
# → Vérifier sur http://localhost:8000

# 3. Déployer
npm run deploy
# → Votre site est mis à jour !
```

### Exemple 2: Ajouter une nouvelle fonctionnalité
```bash  
# 1. Modifier le JavaScript (protégé)
nano src/script.js
# → Ajouter votre nouvelle fonctionnalité

# 2. Modifier le template si nécessaire (protégé)
nano src/template.html
# → Ajouter de nouveaux éléments HTML

# 3. Construire et déployer
npm run build
npm run deploy
```

### Exemple 3: Notion a été mis à jour
```bash
# 1. Synchronisation automatique (2x/jour)
# → Ou manuellement :
npm run new-sync

# → Vos développements dans /src/ sont préservés
# → Seules les données musicales sont mises à jour
```

## 🌐 Accès au Site

- **Local** : http://localhost:8000 (après `npm run start`)
- **Build** : http://localhost:8001 (test du site généré)  
- **Production** : https://skymer44.github.io/test

## ⚠️ Transition - Désactiver l'Ancien Système

Pour éviter les conflits, vous devriez désactiver l'ancien workflow :

```bash
# Renommer l'ancien workflow pour le désactiver
mv .github/workflows/notion-sync.yml .github/workflows/notion-sync-OLD.yml.disabled

# Commit le changement
git add .
git commit -m "🔧 Désactivation ancien workflow - Migration vers architecture séparée"
git push
```

## 🎉 Résultat Final

✅ **Votre code est maintenant protégé**  
✅ **Notion ne peut plus écraser vos développements**  
✅ **Synchronisation optimisée et intelligente**  
✅ **Développement serein et sécurisé**  
✅ **Maintenabilité parfaite**  

**Vous pouvez développer en toute tranquillité !** 🚀
