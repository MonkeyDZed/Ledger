# Instructions de Build et Déploiement - LedgerSync V1.4.0

## 📦 Build Réalisé

### Résumé
- **Date**: 17 décembre 2024
- **Version**: 1.4.0
- **Plateforme**: Windows x64 & Linux x64
- **Taille**: ~1.3GB par plateforme
- **Outil**: Electron + electron-builder

### Fichiers Générés

```
dist/
├── win-unpacked/           # Package Windows (prêt à utiliser)
│   ├── LedgerSync.exe      # Exécutable principal (202MB)
│   ├── resources/
│   │   ├── app.asar        # Application packagée (679MB)
│   │   └── app.asar.unpacked/
│   │       └── node_modules/
│   │           ├── sqlite3/        # Module SQLite natif
│   │           └── better-sqlite3/ # Alternative SQLite
│   └── [fichiers Electron...]
│
└── linux-unpacked/         # Package Linux (pour développement)
    └── [structure similaire]
```

## 🚀 Déploiement Windows

### Option 1: Distribution Simple (Actuelle)
1. Compresser le dossier `dist/win-unpacked/` en ZIP
2. Distribuer le fichier ZIP aux utilisateurs
3. Instructions pour l'utilisateur:
   - Extraire le ZIP dans un dossier
   - Double-cliquer sur `LedgerSync.exe`
   - L'application démarre et crée automatiquement la base de données

### Option 2: Installateur NSIS (Recommandé pour Production)
Pour créer un installateur professionnel, il faut:
1. Installer Wine sur WSL: `sudo apt install wine64`
2. Exécuter: `npm run electron:build:win`
3. Résultat: `dist/LedgerSync-1.4.0-Setup.exe` (installateur auto-extractible)

## 🔧 Configuration Appliquée

### Next.js (`next.config.ts`)
```typescript
{
  output: 'standalone',        // ✅ Serveur autonome pour Electron
  images: { unoptimized: true }, // ✅ Pas d'optimisation d'images (local)
  compress: true,                // ✅ Compression gzip
  reactStrictMode: true,         // ✅ Mode strict React
  poweredByHeader: false         // ✅ Sécurité (masquer Next.js)
}
```

### Electron Builder (`package.json`)
```json
{
  "build": {
    "files": [
      "electron/**/*",
      ".next/**/*",
      "public/**/*",
      "migrations/**/*",
      "node_modules/**/*"
    ],
    "asarUnpack": [
      "node_modules/sqlite3/**/*",
      "node_modules/better-sqlite3/**/*"
    ],
    "npmRebuild": false,            // ✅ Pas de rebuild natif (problème ABI)
    "buildDependenciesFromSource": false
  }
}
```

## 📊 Caractéristiques Techniques

### Architecture
- **Frontend**: Next.js 15.3.8 (App Router)
- **Backend**: Next.js API Routes + SQLite
- **Desktop**: Electron 39.2.7
- **Base de données**: SQLite3 (mode WAL activé)

### Fonctionnalités
- ✅ Application desktop standalone
- ✅ Base de données locale (stockée dans AppData)
- ✅ Pas besoin d'internet pour fonctionner
- ✅ Support multi-langue (FR/AR)
- ✅ Mode sombre/clair
- ✅ Migrations automatiques de base de données

### Localisation des Données Utilisateur
- **Windows**: `C:\Users\[USERNAME]\AppData\Roaming\LedgerSync\database.db`
- **Linux**: `~/.config/LedgerSync/database.db`
- **macOS**: `~/Library/Application Support/LedgerSync/database.db`

## 🐛 Problèmes Résolus

### 1. Compilation Native SQLite
**Problème**: `Could not detect abi for version 39.2.7 and runtime electron`
**Solution**: Désactivé `npmRebuild` et `buildDependenciesFromSource` + extraction des modules natifs via `asarUnpack`

### 2. Taille du Package
**Actuel**: 1.3GB (tous node_modules inclus)
**Optimisation future possible**:
- Utiliser `prune: true` pour supprimer devDependencies
- Configurer `files` plus strictement pour exclure fichiers inutiles
- Compresser avec UPX (Universal Packer for eXecutables)

### 3. Build sur WSL
**Limitation**: Impossible de créer installateur NSIS sans Wine
**Solution**: Build unpacked fonctionnel créé avec `npm run pack`

## 📝 Scripts Disponibles

```bash
# Développement
npm run dev                    # Next.js dev server (port 9002)
npm run electron:dev           # Electron + Next.js dev mode

# Production
npm run build                  # Build Next.js uniquement
npm run pack                   # Build Electron (unpacked) ✅ UTILISÉ
npm run electron:build:win     # Build + Installateur Windows (nécessite Wine)
npm run electron:build         # Build toutes plateformes
```

## ✅ Validation

### Tests à Effectuer
1. **Lancement**: Double-clic sur `LedgerSync.exe` → Application démarre
2. **Base de données**: Vérifier création automatique dans AppData
3. **Fonctionnalités**:
   - Ajout de fournisseurs
   - Création de pièces comptables
   - Navigation entre pages
   - Changement de langue
   - Mode sombre/clair
4. **Performance**: Vérification du temps de démarrage et réactivité

### Checklist de Déploiement
- [x] Build Next.js standalone réussi
- [x] Package Electron créé (win-unpacked)
- [x] Modules SQLite extraits correctement
- [x] Configuration optimisée (next.config.ts)
- [ ] Tests sur machine Windows cible
- [ ] Création installateur NSIS (optionnel)
- [ ] Documentation utilisateur finale

## 🔄 Prochaines Étapes

### Phase de Test (Actuelle)
1. Transférer `dist/win-unpacked/` sur une machine Windows
2. Tester toutes les fonctionnalités
3. Vérifier les logs et erreurs éventuelles
4. Optimiser si nécessaire

### Phase de Distribution
1. Créer un installateur NSIS professionnel
2. Signer l'exécutable (certificat code signing)
3. Mettre en place système de mise à jour automatique
4. Créer documentation utilisateur

### Optimisations Futures
1. Réduire taille du package:
   - Analyser et exclure fichiers inutiles
   - Implémenter tree-shaking plus agressif
   - Utiliser compression UPX
2. Améliorer performance:
   - Lazy loading des modules
   - Optimiser bundle Next.js
   - Configurer cache plus agressif
3. Sécurité:
   - Code signing
   - Auto-update sécurisé
   - Sandboxing Electron renforcé

## 📞 Support

Pour tout problème de build ou déploiement:
1. Vérifier les logs dans la console
2. Vérifier que toutes les dépendances sont installées
3. S'assurer que Node.js 20+ est installé
4. Consulter la documentation Electron Builder: https://www.electron.build/

---

**Construit avec**: Next.js 15 + Electron 39 + TypeScript + Tailwind CSS + SQLite
**Mainteneur**: MonkeyDZed
**Version**: 1.4.0
**Date**: Décembre 2024
