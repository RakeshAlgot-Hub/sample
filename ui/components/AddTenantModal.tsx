import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { AppHeader } from './AppHeader';
import { Step1SelectBed } from './AddTenantStep1SelectBed';
import { Step2TenantDetails, TenantForm } from './AddTenantStep2TenantDetails';
import { Step3ReviewConfirm } from './AddTenantStep3ReviewConfirm';
import { unitService, UnitResponse } from '@/services/unitService';
import { tenantService } from '@/services/tenantService';
import { Colors } from '@/constants/Colors';

interface AddTenantModalProps {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
  onSuccess: () => void;
}

export function AddTenantModal({ visible, onClose, propertyId, onSuccess }: AddTenantModalProps) {
  const [step, setStep] = useState(1);
  const [availableUnits, setAvailableUnits] = useState<UnitResponse[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<UnitResponse | null>(null);
  const [tenant, setTenant] = useState<TenantForm>({
    fullName: '',
    phoneNumber: '',
    address: '',
    documentUrl: '',
    profilePictureUrl: '',
    checkInDate: '',
    depositAmount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setStep(1);
      setSelectedUnitId(null);
      setTenant({
        fullName: '',
        phoneNumber: '',
        address: '',
        documentUrl: '',
        profilePictureUrl: '',
        checkInDate: '',
        depositAmount: ''
      });
      setLoading(true);
      unitService.getUnits(propertyId)
        .then(units => setAvailableUnits(units.filter(u => u.status === 'available')))
        .catch(() => setError('Failed to load beds'))
        .finally(() => setLoading(false));
    }
  }, [visible, propertyId]);

  useEffect(() => {
    setSelectedUnit(availableUnits.find(u => u.id === selectedUnitId) || null);
  }, [selectedUnitId, availableUnits]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleConfirm = async () => {
    if (!selectedUnit) return;
    setLoading(true);
    try {
      // 1. Create tenant in backend
      const tenantRes = await tenantService.createTenant({
        propertyId,
        unitId: selectedUnit.id,
        fullName: tenant.fullName,
        documentId: tenant.documentUrl, // using documentUrl as documentId
        phoneNumber: tenant.phoneNumber,
        checkInDate: tenant.checkInDate,
        depositAmount: tenant.depositAmount,
        status: 'paid',
      });
      // 2. Update unit with tenantId and status
      await unitService.updateUnit(selectedUnit.id, { status: 'occupied', currentTenantId: tenantRes.id });
      setLoading(false);
      onSuccess();
      onClose();
    } catch (e) {
      setLoading(false);
      setError('Failed to add tenant');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="formSheet">
      <View style={styles.modalContent}>
        <AppHeader
          title={step === 1 ? 'Select Bed' : step === 2 ? 'Tenant Details' : 'Review & Confirm'}
          showBack={true}
          onBack={step === 1 ? onClose : handleBack}
        />
        {step === 1 && (
          <Step1SelectBed
            availableUnits={availableUnits}
            selectedUnitId={selectedUnitId}
            onSelect={setSelectedUnitId}
            onNext={selectedUnitId ? handleNext : () => {}}
            loading={loading}
          />
        )}
        {step === 2 && (
          <Step2TenantDetails
            tenant={tenant}
            setTenant={setTenant}
            onNext={handleNext}
            onBack={handleBack}
            selectedUnit={selectedUnit}
            loading={loading}
          />
        )}
        {step === 3 && (
          <Step3ReviewConfirm
            selectedUnit={selectedUnit}
            tenant={tenant}
            onBack={handleBack}
            onConfirm={handleConfirm}
            loading={loading}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: { flex: 1, backgroundColor: Colors.background.paper },
});
