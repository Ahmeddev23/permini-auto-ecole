# Système de Support - Auto École Premium

## Vue d'ensemble

Le système de support permet aux auto-écoles d'envoyer des demandes d'aide directement depuis leur dashboard. Ces demandes sont automatiquement transmises vers l'admin dashboard dans la section "Formulaires de Contact".

## Fonctionnalités

### Pour les Auto-Écoles

1. **Bouton Flottant** : Un bouton d'aide flottant est disponible en permanence dans le dashboard
2. **Formulaire Simple** : Interface intuitive pour décrire le problème
3. **Niveaux de Priorité** : Faible, Moyenne, Élevée, Urgente
4. **Confirmation** : Numéro de ticket fourni après envoi
5. **Validation** : Vérification des champs requis

### Pour les Administrateurs

1. **Réception Centralisée** : Toutes les demandes arrivent dans "Formulaires de Contact"
2. **Informations Contextuelles** : Nom de l'auto-école, utilisateur, coordonnées
3. **Gestion des Statuts** : Nouveau, En cours, Résolu, Fermé
4. **Réponses** : Possibilité de répondre directement depuis l'interface admin
5. **Historique** : Suivi complet des demandes et réponses

## Architecture Technique

### Backend

```
POST /api/admin/support/submit/
```

**Authentification** : Token requis (auto-école uniquement)

**Payload** :
```json
{
  "subject": "Problème de connexion",
  "message": "Description détaillée du problème",
  "priority": "medium"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Demande envoyée avec succès",
  "ticket_id": "uuid-du-ticket"
}
```

### Frontend

**Composant** : `SupportFloatingButton`
**Service** : `dashboardService.submitSupportRequest()`
**Emplacement** : Intégré dans `DashboardLayout`

## Utilisation

### Côté Auto-École

1. Cliquer sur le bouton d'aide (icône ?) en bas à droite
2. Sélectionner le niveau de priorité
3. Saisir un sujet concis
4. Décrire le problème en détail
5. Cliquer sur "Envoyer"
6. Noter le numéro de ticket pour le suivi

### Côté Admin

1. Aller dans "Formulaires de Contact"
2. Les demandes de support sont préfixées par "[SUPPORT AUTO-ÉCOLE]"
3. Cliquer sur une demande pour voir les détails
4. Répondre directement depuis l'interface
5. Changer le statut selon l'avancement

## Données Collectées

Pour chaque demande de support :

- **Informations Auto-École** : Nom, email, téléphone
- **Utilisateur** : Nom complet, email
- **Demande** : Sujet, message, priorité
- **Technique** : IP, User-Agent, timestamp
- **Suivi** : Statut, réponses, historique

## Niveaux de Priorité

- **Faible** : Questions générales, demandes d'amélioration
- **Moyenne** : Problèmes non bloquants, questions techniques
- **Élevée** : Problèmes impactant l'utilisation normale
- **Urgente** : Problèmes bloquants, perte de données

## Notifications

Les administrateurs reçoivent des notifications pour :
- Nouvelles demandes de support
- Demandes urgentes (priorité élevée/urgente)
- Demandes non traitées après 24h

## Bonnes Pratiques

### Pour les Auto-Écoles

1. **Soyez précis** : Décrivez clairement le problème
2. **Contexte** : Mentionnez quand le problème survient
3. **Étapes** : Listez ce que vous avez essayé
4. **Captures** : Décrivez ce que vous voyez à l'écran
5. **Priorité** : Choisissez le bon niveau d'urgence

### Pour les Admins

1. **Réactivité** : Répondre dans les 24h pour les demandes normales
2. **Urgence** : Traiter les demandes urgentes en priorité
3. **Clarté** : Donner des instructions étape par étape
4. **Suivi** : Vérifier que le problème est résolu
5. **Documentation** : Mettre à jour la FAQ si nécessaire

## Métriques

Le système permet de suivre :
- Nombre de demandes par période
- Temps de réponse moyen
- Taux de résolution
- Satisfaction client
- Types de problèmes les plus fréquents

## Sécurité

- **Authentification** : Seules les auto-écoles connectées peuvent envoyer des demandes
- **Validation** : Vérification des données côté serveur
- **Logs** : Traçabilité complète des actions
- **Confidentialité** : Données chiffrées en transit et au repos

## Évolutions Futures

- Système de chat en temps réel
- Base de connaissances intégrée
- Notifications push
- API pour intégrations tierces
- Analyse automatique des sentiments
