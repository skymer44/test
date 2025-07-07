# 🔄 Noms Dynamiques des Sections

## Comment ça fonctionne

Le script `notion-content-injector.js` utilise maintenant **directement les noms des bases de données Notion** pour les titres des sections sur le site.

### ✅ Avant (titres statiques)
```javascript
const sectionTitle = this.sectionTitles[sectionId] || databaseName;
```
- Les titres étaient codés en dur dans le script
- Changer le nom dans Notion ne changeait rien sur le site

### ✅ Maintenant (noms dynamiques)
```javascript
const sectionTitle = databaseName; // Utiliser directement le nom de la base Notion
```
- Les titres viennent directement de Notion
- Changer le nom dans Notion met automatiquement à jour le site

## 📋 Ordre des sections

L'ordre est défini dans `sectionOrder[]` selon votre organisation Notion :

1. **Ma région virtuose**
2. **Concert du 11 d'avril avec Eric Aubier**
3. **Insertion dans les 60 ans du Conservatoire**
4. **Programme fête de la musique**
5. **Retour Karaoké**
6. **Loto**
7. **Pièces d'ajout sans direction**
8. **Pièces qui n'ont pas trouvé leur concert**

## 🎯 Sections vides

- Les sections vides **existent** dans la logique
- Elles ne s'affichent **pas** sur le site (`.filter(section => section && section.pieces.length > 0)`)
- Dès qu'elles ont du contenu, elles apparaissent automatiquement dans le bon ordre

## 🚀 Test du système

Pour tester les noms dynamiques :

1. Changez le nom d'une base de données dans Notion
2. Lancez `npm run deploy-simple`
3. Le nouveau nom apparaîtra automatiquement sur le site

**Aucune modification de code nécessaire !** 🎉
