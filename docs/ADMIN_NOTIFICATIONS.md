# Système de Notifications Admin - Auto École Premium

## Vue d'ensemble

Le système de notifications admin utilise WebSocket pour notifier les administrateurs en temps réel des événements importants du système. Les notifications incluent maintenant les demandes de support en plus des inscriptions et paiements.

## Types de Notifications

### 1. 🏢 Inscription Auto-École (`driving_school_registration`)
- **Déclencheur** : Nouvelle inscription d'auto-école
- **Priorité** : Moyenne
- **Icône** : BuildingOfficeIcon
- **Couleur** : Bleu

### 2. 💳 Paiement Reçu (`payment_received`)
- **Déclencheur** : Nouveau paiement ou upgrade de plan
- **Priorité** : Moyenne
- **Icône** : CreditCardIcon
- **Couleur** : Bleu

### 3. 📧 Demande de Support (`contact_form`)
- **Déclencheur** : Nouvelle demande de support via le bouton flottant
- **Priorité** : Variable selon la demande (Faible → Urgente)
- **Icône** : EnvelopeIcon
- **Couleur** : Variable selon la priorité

### 4. ⬆️ Demande de Mise à Niveau (`upgrade_request`)
- **Déclencheur** : Demande d'upgrade de plan
- **Priorité** : Moyenne
- **Icône** : ArrowUpIcon
- **Couleur** : Bleu

### 5. ⚠️ Alerte Système (`system_alert`)
- **Déclencheur** : Problèmes système critiques
- **Priorité** : Élevée/Urgente
- **Icône** : ExclamationTriangleIcon
- **Couleur** : Rouge/Orange

## Priorités et Couleurs

| Priorité | Couleur | Classe CSS | Usage |
|----------|---------|------------|-------|
| **Faible** | Gris | `text-gray-500` | Demandes non urgentes |
| **Moyenne** | Bleu | `text-blue-500` | Événements normaux |
| **Élevée** | Orange | `text-orange-500` | Demandes importantes |
| **Urgente** | Rouge | `text-red-500` | Problèmes critiques |

## Architecture Technique

### Backend (Django Channels)

#### Modèle AdminNotification
```python
class AdminNotification(models.Model):
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_LEVELS)
    is_read = models.BooleanField(default=False)
    is_dismissed = models.BooleanField(default=False)
    related_driving_school_id = models.IntegerField(null=True, blank=True)
    related_payment_id = models.UUIDField(null=True, blank=True)
    related_user_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### Fonction d'Envoi
```python
def send_admin_notification(notification_type, title, message, priority='medium', **kwargs):
    # Créer en base de données
    notification = AdminNotification.objects.create(...)
    
    # Envoyer via WebSocket
    channel_layer.group_send("admin_notifications", {
        'type': 'admin_notification',
        'notification': {...}
    })
```

### Frontend (React + WebSocket)

#### Service WebSocket
```typescript
class AdminWebSocketService {
    connect() {
        this.ws = new WebSocket('ws://127.0.0.1:8000/ws/admin-notifications/');
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'admin_notification') {
                this.emit('notification', data.notification);
            }
        };
    }
}
```

#### Contexte React
```typescript
const AdminNotificationContext = createContext<{
    notifications: AdminNotification[];
    unreadCount: number;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
    dismissNotification: (id: number) => void;
}>();
```

## Notifications de Support

### Déclenchement
Les notifications de support sont déclenchées automatiquement quand :
1. Une auto-école soumet une demande via le bouton flottant
2. La demande est sauvegardée en base de données
3. Une notification admin est créée avec la priorité correspondante

### Mapping des Priorités
```python
# Priorité de la demande → Priorité de la notification
priority_mapping = {
    'low': 'low',        # Faible → Faible
    'medium': 'medium',  # Moyenne → Moyenne  
    'high': 'high',      # Élevée → Élevée
    'urgent': 'urgent'   # Urgente → Urgente
}
```

### Format du Message
```
Titre: "Nouvelle demande de support - [Nom Auto-École]"
Message: "Demande de support de priorité [priorité] reçue de '[Nom Auto-École]'. Sujet: [sujet]"
```

### Données Liées
- `related_driving_school_id`: ID de l'auto-école
- `related_user_id`: ID de l'utilisateur qui a fait la demande
- `notification_type`: 'contact_form'

## Interface Utilisateur Admin

### Indicateur de Notifications
- **Badge rouge** : Nombre de notifications non lues
- **Animation** : Pulse pour les nouvelles notifications
- **Son** : Notification sonore (optionnel)

### Liste des Notifications
- **Tri** : Par date (plus récentes en premier)
- **Filtrage** : Par type, priorité, statut de lecture
- **Actions** : Marquer comme lu, ignorer, voir détails

### Affichage d'une Notification
```
[Icône] [Titre]                    [Temps]
        [Message]                  [Actions]
        [Priorité Badge]
```

## Gestion des États

### États des Notifications
- **Non lue** (`is_read: false`) : Nouvelle notification
- **Lue** (`is_read: true`) : Notification consultée
- **Ignorée** (`is_dismissed: true`) : Notification masquée

### Actions Disponibles
- **Marquer comme lue** : Change `is_read` à `true`
- **Marquer toutes comme lues** : Batch update de toutes les notifications
- **Ignorer** : Change `is_dismissed` à `true`
- **Voir détails** : Navigation vers l'objet lié

## Temps Réel

### WebSocket
- **Groupe** : `admin_notifications`
- **Événement** : `admin_notification`
- **Reconnexion** : Automatique avec backoff
- **Authentification** : Via session admin

### Synchronisation
- **Notifications manquées** : Récupérées au reconnect
- **État cohérent** : Synchronisation base ↔ interface
- **Offline** : Queue des actions en attente

## Métriques et Monitoring

### Indicateurs Suivis
- Nombre de notifications par type
- Temps de réponse aux notifications urgentes
- Taux de lecture des notifications
- Performance du système WebSocket

### Logs
```
📨 Notification admin envoyée: [titre]
✅ WebSocket admin connecté
❌ Erreur lors de l'envoi de la notification admin: [erreur]
```

## Configuration

### Variables d'Environnement
```
WEBSOCKET_URL=ws://127.0.0.1:8000/ws/admin-notifications/
NOTIFICATION_SOUND_ENABLED=true
NOTIFICATION_AUTO_DISMISS_DELAY=5000
```

### Personnalisation
- Sons de notification configurables
- Couleurs et icônes personnalisables
- Délais d'auto-dismiss ajustables
- Filtres de notification par rôle admin

## Sécurité

### Authentification
- Session admin requise pour WebSocket
- Validation des permissions côté serveur
- Chiffrement des données sensibles

### Autorisation
- Seuls les admins reçoivent les notifications
- Filtrage selon les rôles admin
- Audit trail des actions sur notifications

## Évolutions Futures

### Court Terme
- Notifications push navigateur
- Groupement des notifications similaires
- Réponse rapide depuis les notifications

### Long Terme
- IA pour priorisation automatique
- Intégration email/SMS pour urgences
- Dashboard analytics des notifications
