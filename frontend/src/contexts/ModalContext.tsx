import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  isStudentModalOpen: boolean;
  isVehicleModalOpen: boolean;
  isExamModalOpen: boolean;
  openStudentModal: () => void;
  closeStudentModal: () => void;
  openVehicleModal: () => void;
  closeVehicleModal: () => void;
  openExamModal: () => void;
  closeExamModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  const openStudentModal = () => setIsStudentModalOpen(true);
  const closeStudentModal = () => setIsStudentModalOpen(false);
  
  const openVehicleModal = () => setIsVehicleModalOpen(true);
  const closeVehicleModal = () => setIsVehicleModalOpen(false);
  
  const openExamModal = () => setIsExamModalOpen(true);
  const closeExamModal = () => setIsExamModalOpen(false);

  return (
    <ModalContext.Provider
      value={{
        isStudentModalOpen,
        isVehicleModalOpen,
        isExamModalOpen,
        openStudentModal,
        closeStudentModal,
        openVehicleModal,
        closeVehicleModal,
        openExamModal,
        closeExamModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
