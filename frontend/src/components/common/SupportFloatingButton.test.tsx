import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import SupportFloatingButton from './SupportFloatingButton';
import { dashboardService } from '../../services/dashboardService';

// Mock des dépendances
jest.mock('../../services/dashboardService');
jest.mock('react-hot-toast');

const mockDashboardService = dashboardService as jest.Mocked<typeof dashboardService>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('SupportFloatingButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders floating button', () => {
    render(<SupportFloatingButton />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('fixed', 'bottom-6', 'right-6');
  });

  test('opens modal when button is clicked', async () => {
    render(<SupportFloatingButton />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Support Technique')).toBeInTheDocument();
      expect(screen.getByText('Décrivez votre problème ou question')).toBeInTheDocument();
    });
  });

  test('submits support request successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'Demande envoyée',
      ticket_id: 'TICKET-123'
    };
    
    mockDashboardService.submitSupportRequest.mockResolvedValue(mockResponse);
    
    render(<SupportFloatingButton />);
    
    // Ouvrir le modal
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Support Technique')).toBeInTheDocument();
    });
    
    // Remplir le formulaire
    const subjectInput = screen.getByPlaceholderText(/Résumez votre problème/);
    const messageTextarea = screen.getByPlaceholderText(/Décrivez votre problème en détail/);
    
    fireEvent.change(subjectInput, { target: { value: 'Problème de connexion' } });
    fireEvent.change(messageTextarea, { target: { value: 'Je n\'arrive pas à me connecter' } });
    
    // Soumettre
    const submitButton = screen.getByText('Envoyer');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockDashboardService.submitSupportRequest).toHaveBeenCalledWith({
        subject: 'Problème de connexion',
        message: 'Je n\'arrive pas à me connecter',
        priority: 'medium'
      });
      expect(mockToast.success).toHaveBeenCalledWith('Votre demande de support a été envoyée avec succès !');
    });
  });

  test('handles submission error', async () => {
    const mockError = new Error('Erreur réseau');
    mockDashboardService.submitSupportRequest.mockRejectedValue(mockError);
    
    render(<SupportFloatingButton />);
    
    // Ouvrir le modal
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Support Technique')).toBeInTheDocument();
    });
    
    // Remplir le formulaire
    const subjectInput = screen.getByPlaceholderText(/Résumez votre problème/);
    const messageTextarea = screen.getByPlaceholderText(/Décrivez votre problème en détail/);
    
    fireEvent.change(subjectInput, { target: { value: 'Test' } });
    fireEvent.change(messageTextarea, { target: { value: 'Test message' } });
    
    // Soumettre
    const submitButton = screen.getByText('Envoyer');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Erreur réseau');
    });
  });

  test('validates required fields', async () => {
    render(<SupportFloatingButton />);
    
    // Ouvrir le modal
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Support Technique')).toBeInTheDocument();
    });
    
    // Essayer de soumettre sans remplir les champs
    const submitButton = screen.getByText('Envoyer');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Veuillez remplir tous les champs requis');
    });
  });

  test('changes priority level', async () => {
    render(<SupportFloatingButton />);
    
    // Ouvrir le modal
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Support Technique')).toBeInTheDocument();
    });
    
    // Changer la priorité
    const prioritySelect = screen.getByDisplayValue('Moyenne');
    fireEvent.change(prioritySelect, { target: { value: 'urgent' } });
    
    expect(prioritySelect).toHaveValue('urgent');
  });

  test('closes modal when cancel is clicked', async () => {
    render(<SupportFloatingButton />);
    
    // Ouvrir le modal
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Support Technique')).toBeInTheDocument();
    });
    
    // Fermer le modal
    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Support Technique')).not.toBeInTheDocument();
    });
  });
});
