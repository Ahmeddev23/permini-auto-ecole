import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import SupportFloatingButton from './SupportFloatingButton';
import { dashboardService } from '../../services/dashboardService';

// Mock du service pour Storybook
jest.mock('../../services/dashboardService', () => ({
  dashboardService: {
    submitSupportRequest: jest.fn()
  }
}));

const meta: Meta<typeof SupportFloatingButton> = {
  title: 'Components/SupportFloatingButton',
  component: SupportFloatingButton,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Bouton Flottant de Support

Ce composant affiche un bouton flottant en bas à droite de l'écran qui permet aux auto-écoles 
d'envoyer des demandes de support directement depuis leur dashboard.

## Fonctionnalités

- **Bouton flottant** : Toujours visible et accessible
- **Modal responsive** : Interface adaptée mobile et desktop
- **Niveaux de priorité** : Faible, Moyenne, Élevée, Urgente
- **Validation** : Vérification des champs requis
- **Feedback** : Confirmation avec numéro de ticket
- **Animations** : Transitions fluides avec Framer Motion

## Utilisation

Le composant est automatiquement intégré dans le \`DashboardLayout\` et ne nécessite aucune configuration.
        `
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', position: 'relative', backgroundColor: '#f3f4f6' }}>
        <div style={{ padding: '2rem' }}>
          <h1>Dashboard Auto-École</h1>
          <p>Contenu du dashboard...</p>
        </div>
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof SupportFloatingButton>;

// Histoire par défaut
export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    // Simulation d'une interaction utilisateur
    action('Bouton de support affiché')();
  }
};

// Histoire avec succès de soumission
export const SuccessfulSubmission: Story = {
  args: {},
  beforeEach: () => {
    // Mock d'une réponse réussie
    (dashboardService.submitSupportRequest as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Demande envoyée avec succès',
      ticket_id: 'TICKET-12345'
    });
  },
  play: async ({ canvasElement }) => {
    action('Simulation de soumission réussie')();
  }
};

// Histoire avec erreur de soumission
export const SubmissionError: Story = {
  args: {},
  beforeEach: () => {
    // Mock d'une erreur
    (dashboardService.submitSupportRequest as jest.Mock).mockRejectedValue(
      new Error('Erreur de connexion au serveur')
    );
  },
  play: async ({ canvasElement }) => {
    action('Simulation d\'erreur de soumission')();
  }
};

// Histoire avec thème sombre
export const DarkTheme: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div 
        style={{ 
          height: '100vh', 
          position: 'relative', 
          backgroundColor: '#1f2937',
          color: 'white'
        }}
        className="dark"
      >
        <div style={{ padding: '2rem' }}>
          <h1>Dashboard Auto-École (Thème Sombre)</h1>
          <p>Contenu du dashboard en mode sombre...</p>
        </div>
        <Story />
      </div>
    )
  ]
};

// Histoire mobile
export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', position: 'relative', backgroundColor: '#f3f4f6' }}>
        <div style={{ padding: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem' }}>Dashboard Mobile</h1>
          <p>Interface mobile...</p>
        </div>
        <Story />
      </div>
    )
  ]
};

// Histoire avec position personnalisée
export const CustomPosition: Story = {
  args: {
    className: 'bottom-20 right-20'
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', position: 'relative', backgroundColor: '#f3f4f6' }}>
        <div style={{ padding: '2rem' }}>
          <h1>Position Personnalisée</h1>
          <p>Le bouton est positionné différemment...</p>
        </div>
        <Story />
      </div>
    )
  ]
};
