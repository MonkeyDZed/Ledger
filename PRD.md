
# **Product Requirements Document (PRD): LedgerSync Local**

**Version:** 1.0  
**Date:** 25 juillet 2024  
**Statut:** En développement

---

## 1. Introduction

### 1.1. Objectif du Produit
**LedgerSync Local** est une application web de bureau conçue pour les petites et moyennes entreprises (PME), les entrepreneurs et les travailleurs indépendants afin de simplifier et de centraliser la gestion de leurs relations financières avec les fournisseurs. L'objectif principal est d'offrir un outil intuitif pour suivre les factures, les bons de livraison (BL), les paiements et de maintenir une vision claire et à jour des créances fournisseurs.

### 1.2. Problème Ciblé
Les PME ont souvent du mal à suivre manuellement (via des tableurs ou des cahiers) leurs dettes envers de multiples fournisseurs. Ce manque de suivi centralisé entraîne des retards de paiement, des erreurs de calcul, une mauvaise visibilité de la trésorerie et une charge administrative importante.

### 1.3. Proposition de Valeur
LedgerSync Local résout ce problème en offrant une interface unique, simple et visuelle pour :
- Centraliser toutes les informations des fournisseurs.
- Enregistrer chaque transaction (facture, BL, versement).
- Calculer automatiquement et en temps réel les soldes et créances.
- Fournir des rapports clairs pour une prise de décision éclairée.
- Fonctionner localement pour garantir la confidentialité et la rapidité.

---

## 2. Personas Utilisateurs

### 2.1. Gérant de PME
- **Nom :** Karim
- **Besoin :** A besoin d'une vue d'ensemble rapide de ses dettes fournisseurs pour gérer sa trésorerie. Il n'a pas de formation en comptabilité et veut un outil simple, rapide et visuel.
- **Scénario :** Avant de passer une nouvelle commande, Karim consulte le tableau de bord pour voir les créances totales et vérifie la situation d'un fournisseur spécifique pour s'assurer que les paiements sont à jour.

### 2.2. Assistant Administratif / Comptable
- **Nom :** Amina
- **Besoin :** Est responsable de la saisie des factures et de la préparation des paiements. Elle a besoin d'un outil efficace pour enregistrer les pièces, les filtrer par date ou par type, et exporter des rapports pour les archives.
- **Scénario :** Chaque semaine, Amina saisit les nouvelles factures et les versements effectués. Elle utilise la page "Pièces" pour vérifier que toutes les transactions du mois ont bien été enregistrées avant de générer un rapport sur l'état des créances.

---

## 3. Fonctionnalités et Exigences

### 3.1. Tableau de Bord (Dashboard)
- **Objectif :** Fournir une vue d'ensemble instantanée de la santé financière de l'entreprise vis-à-vis de ses fournisseurs.
- **Exigences Fonctionnelles :**
    - **Statistiques Clés :** Afficher des cartes (Cards) pour :
        - Nombre total de fournisseurs.
        - Nombre total de pièces (Factures/BL).
        - Créances totales (calculées).
        - Statut de la synchronisation (statique, "À jour").
    - **Actions Rapides :** Boutons permettant d'ouvrir des boîtes de dialogue pour :
        - Ajouter un nouveau fournisseur.
        - Ajouter une nouvelle pièce (Facture/BL).
        - Enregistrer un nouveau versement.
    - **Fournisseurs Récents :** Afficher un tableau des 10 fournisseurs avec les transactions les plus récentes, incluant leur nom, wilaya, total facturé et créance.
    - **Vue Financière :**
        - Un graphique circulaire (Pie Chart) montrant la répartition entre le "Total Payé" et le "Reste à Payer".
        - Des barres de progression détaillant ces mêmes montants.
        - Des boutons pour l'export de rapports (PDF/CSV) - *fonctionnalité future*.

### 3.2. Gestion des Fournisseurs (CRUD)
- **Objectif :** Permettre une gestion complète du cycle de vie des fournisseurs.
- **Page Liste des Fournisseurs (`/suppliers`) :**
    - **Affichage :** Un tableau de données (`DataTable`) affichant tous les fournisseurs avec les colonnes : Nom, Solde Initial, Total Facturé, Total Payé, Créance Totale, Actions.
    - **Fonctionnalités du tableau :** Tri par colonne, filtrage par nom.
    - **Statistiques Globales :** Afficher des cartes récapitulatives pour le solde initial total, le total facturé, le total payé et la créance totale de tous les fournisseurs.
    - **En-tête Rétractable :** L'en-tête de la page et les cartes statistiques doivent être rétractables pour maximiser l'espace d'affichage du tableau.
    - **Actions :** Bouton pour "Ajouter un nouveau fournisseur".
- **Page Détail Fournisseur (`/suppliers/[id]`) :**
    - **Informations :** Afficher les détails du fournisseur (Wilaya, NIF, Tél, etc.).
    - **Statistiques :** Cartes de statistiques spécifiques au fournisseur (Solde initial, Total facturé, Total payé, Créance).
    - **Historique des Pièces :** Un tableau de données listant toutes les pièces (Factures, BL, Versements) associées à ce fournisseur, avec possibilité de tri.
    - **Actions sur les pièces :** Modifier ou supprimer une pièce via un menu contextuel.
    - **Actions sur la page :** Boutons pour "Ajouter une pièce", "Ajouter un versement", et "Modifier les informations du fournisseur".

### 3.3. Gestion des Pièces (Transactions)
- **Objectif :** Permettre l'enregistrement et le suivi de toutes les transactions financières.
- **Types de Pièces :**
    - **FACTURE / BL :** Augmente la dette. Champs : date, n° pièce, total, montant payé.
    - **VERSEMENT :** Diminue la dette. Champs : date, montant, moyen et motif du paiement.
- **Logique de Calcul :**
    - `Reste à Payer (par pièce)` = `Total Pièce` - `Montant Payé`.
    - `Créance Fournisseur` = `Solde Initial` + `Σ(Total Factures/BL)` - `Σ(Montant Payé sur Factures/BL)` - `Σ(Montants Versements)`.
- **Page Liste des Pièces (`/pieces`) :**
    - **Affichage :** Tableau de données centralisé de toutes les pièces de tous les fournisseurs.
    - **Filtres Avancés :** Filtrer par fournisseur, par type de pièce (Facture, BL, Versement), et par plage de dates.
    - **Statistiques Globales :** Afficher les totaux pour toutes les pièces affichées (Total facturé, payé, restant).
    - **En-tête Rétractable :** Comme pour la page fournisseurs.

### 3.4. Rapports
- **Objectif :** Offrir des outils d'analyse visuelle pour aider à la prise de décision.
- **Page Rapports (`/reports`) :**
    - **Navigation par Onglets :** Permettre de basculer entre différents types de rapports.
    - **Rapport "État des Créances" :**
        - Un graphique à barres montrant la créance par fournisseur.
        - Un tableau détaillé avec les totaux par fournisseur.
    - **Rapport "Évolution Financière" :**
        - Un graphique en aires montrant l'évolution des "entrées" (factures) vs les "sorties" (paiements) sur une période sélectionnable (1 mois, 3 mois, 6 mois, 1 an).
    - **Rapport "Analyse des Paiements" :**
        - Un graphique circulaire montrant la répartition des paiements par moyen (Espèce, Chèque, etc.).

### 3.5. Paramètres
- **Objectif :** Permettre à l'utilisateur d'effectuer des actions de maintenance sur l'application.
- **Fonctionnalités :**
    - **Zone de Danger :** Proposer une option pour "Supprimer toutes les données", protégée par une boîte de dialogue de confirmation, pour réinitialiser l'application.

---

## 4. Exigences Non Fonctionnelles

### 4.1. Interface Utilisateur (UI) et Expérience Utilisateur (UX)
- **Design :** Moderne, épuré et professionnel. Utilisation de coins arrondis, d'ombres subtiles et d'espaces blancs.
- **Palette de Couleurs :** Utiliser la palette définie dans `globals.css` (bleu pour le primaire, vert pour le secondaire, ambre et rouge pour les alertes).
- **Composants :** Utiliser la bibliothèque de composants ShadCN/UI pour une cohérence visuelle.
- **Réactivité (Responsiveness) :** L'application doit être entièrement fonctionnelle et agréable à utiliser sur les ordinateaux de bureau et les tablettes.
- **Internationalisation (i18n) :** L'interface doit être entièrement bilingue (Français/Arabe), avec un changement de langue dynamique qui préserve la page actuelle. Le sens d'écriture (LTR/RTL) doit s'adapter à la langue.

### 4.2. Technologies
- **Framework :** Next.js (App Router)
- **Langage :** TypeScript
- **Style :** Tailwind CSS
- **Composants UI :** ShadCN/UI
- **Base de Données :** SQLite (fonctionnement local via un fichier sur le système de l'utilisateur).
- **Graphiques :** Recharts.

### 4.3. Performance
- Les requêtes à la base de données doivent être optimisées.
- Le rendu côté serveur (SSR) doit être privilégié pour des chargements de page initiaux rapides.
- Les calculs complexes doivent être effectués côté serveur autant que possible.

---

## 5. Hors-Périmètre (Pour une Future Version)
- Authentification multi-utilisateurs.
- Synchronisation cloud.
- Application mobile native.
- Exportation de données avancée (états PDF personnalisés).
- Intégration de l'IA pour l'analyse prédictive ou la saisie automatique via OCR.
