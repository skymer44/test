#!/usr/bin/env node

/**
 * 🔄 Serveur Proxy Notion - Contournement CORS
 * 
 * Ce serveur Node.js fait le pont entre votre site web et l'API Notion
 * pour éviter les problèmes CORS en développement local.
 */

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3001;
const NOTION_API_BASE = 'https://api.notion.com/v1';

// Serveur proxy
const server = http.createServer((req, res) => {
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Notion-Version');

    // Répondre aux requêtes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Parse l'URL
    const parsedUrl = url.parse(req.url, true);
    
    // Route pour l'API Notion
    if (parsedUrl.pathname.startsWith('/notion/')) {
        proxyToNotion(req, res, parsedUrl);
    }
    // Route pour servir les fichiers statiques
    else {
        serveStaticFile(req, res, parsedUrl);
    }
});

/**
 * Proxy vers l'API Notion
 */
function proxyToNotion(req, res, parsedUrl) {
    // Construire l'URL Notion
    const notionPath = parsedUrl.pathname.replace('/notion', '');
    const notionUrl = NOTION_API_BASE + notionPath;
    
    console.log(`🔄 Proxy vers Notion: ${req.method} ${notionUrl}`);

    // Récupérer le body de la requête
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        // Options pour la requête HTTPS
        const options = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
                'Authorization': req.headers.authorization || '',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        // Faire la requête vers Notion
        const notionReq = https.request(notionUrl, options, (notionRes) => {
            // Copier les headers
            res.writeHead(notionRes.statusCode, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });

            // Pipe la réponse
            notionRes.pipe(res);
        });

        notionReq.on('error', (error) => {
            console.error('❌ Erreur proxy Notion:', error);
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                error: 'Erreur du serveur proxy',
                details: error.message
            }));
        });

        // Envoyer le body
        if (body) {
            notionReq.write(body);
        }
        notionReq.end();
    });
}

/**
 * Servir les fichiers statiques
 */
function serveStaticFile(req, res, parsedUrl) {
    let filePath = path.join(__dirname, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
    
    // Sécurité : empêcher l'accès aux fichiers en dehors du dossier
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Accès interdit');
        return;
    }

    // Vérifier si le fichier existe
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404);
            res.end('Fichier non trouvé');
            return;
        }

        // Déterminer le type MIME
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.ico': 'image/x-icon'
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Servir le fichier
        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        });

        fs.createReadStream(filePath).pipe(res);
    });
}

// Démarrer le serveur
server.listen(PORT, () => {
    console.log('🚀 Serveur proxy démarré !');
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔄 Proxy Notion: http://localhost:${PORT}/notion/...`);
    console.log('');
    console.log('💡 Pour utiliser votre site :');
    console.log(`   1. Ouvrez: http://localhost:${PORT}`);
    console.log('   2. Cliquez sur "🔄 Sync Notion"');
    console.log('');
    console.log('⏹️  Pour arrêter: Ctrl+C');
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
    console.log('\n👋 Arrêt du serveur proxy...');
    server.close(() => {
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
    });
});
