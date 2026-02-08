import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useWizardStore } from '@/store/useWizardStore';
import WizardHeader from '@/components/WizardHeader';
import WizardTopHeader from '@/components/WizardTopHeader';
import WizardFooter from '@/components/WizardFooter';
import ConfirmModal from '@/components/ConfirmModal';
import { Building } from '@/types/property';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';

export default function BuildingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    buildings,
    addBuilding,
    updateBuilding,
    removeBuilding,
    nextStep,
    previousStep,
    resetWizard,
    editingPropertyId,
  } = useWizardStore();

  const [newBuildingName, setNewBuildingName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    resetWizard();
    if (editingPropertyId) {
      router.replace({
        pathname: '/settings/property-details/[id]',
        params: { id: editingPropertyId },
      });
      return;
    }
    router.replace('/(tabs)');
  }, [resetWizard, router, editingPropertyId]);

  const handleBack = useCallback(() => {
    previousStep();
    router.back();
  }, [previousStep, router]);

  const handleAddBuilding = () => {
    if (newBuildingName.trim()) {
      const building: Building = {
        id: Date.now().toString() + Math.random(),
        name: newBuildingName.trim(),
        floors: [],
      };
      addBuilding(building);
      setNewBuildingName('');
    }
  };

  const handleStartEdit = (building: Building) => {
    setEditingId(building.id);
    setEditingName(building.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      updateBuilding(editingId, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleRemoveBuilding = (id: string) => {
    setPendingDeleteId(id);
  };

  const handleNext = () => {
    nextStep();
    router.push('/wizard/floors');
  };

  const canProceed = buildings.length > 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <WizardTopHeader
        onBack={handleBack}
        title="Buildings"
        rightAction="close"
        onClose={handleClose}
      />
      <WizardHeader
        currentStep={2}
        totalSteps={6}
        title="Buildings"
        onClose={handleClose}
        showClose={false}
        showSteps
        showTitle={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Building2 size={16} color={theme.textSecondary} strokeWidth={2} />
            <Text style={[styles.label, { color: theme.text }]}>
              Add Buildings
            </Text>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
              placeholder="Building name"
              placeholderTextColor={theme.textSecondary}
              value={newBuildingName}
              onChangeText={setNewBuildingName}
              autoCapitalize="words"
              onSubmitEditing={handleAddBuilding}
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: newBuildingName.trim()
                    ? theme.primary
                    : theme.inputBorder,
                },
              ]}
              onPress={handleAddBuilding}
              disabled={!newBuildingName.trim()}
              activeOpacity={0.7}
            >
              <Plus size={18} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {buildings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Buildings ({buildings.length})
            </Text>
            <View style={styles.buildingsList}>
              {buildings.map((building) => (
                <Animated.View
                  key={building.id}
                  entering={FadeIn}
                  exiting={FadeOut}
                  layout={Layout.springify()}
                  style={[
                    styles.buildingCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  {editingId === building.id ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={[
                          styles.editInput,
                          {
                            backgroundColor: theme.inputBackground,
                            borderColor: theme.inputBorder,
                            color: theme.text,
                          },
                        ]}
                        value={editingName}
                        onChangeText={setEditingName}
                        autoFocus
                        onSubmitEditing={handleSaveEdit}
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity
                          onPress={handleSaveEdit}
                          style={[
                            styles.editButton,
                            { backgroundColor: theme.primary },
                          ]}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.editButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleCancelEdit}
                          style={[
                            styles.editButton,
                            { backgroundColor: theme.inputBackground },
                          ]}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.cancelText, { color: theme.text }]}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.buildingInfo}>
                        <View
                          style={[
                            styles.buildingIcon,
                            { backgroundColor: theme.primary + '15' },
                          ]}
                        >
                          <Building2
                            size={20}
                            color={theme.primary}
                            strokeWidth={2}
                          />
                        </View>
                        <Text style={[styles.buildingName, { color: theme.text }]}>
                          {building.name}
                        </Text>
                      </View>
                      <View style={styles.buildingActions}>
                        <TouchableOpacity
                          onPress={() => handleStartEdit(building)}
                          style={[
                            styles.actionButton,
                            { backgroundColor: theme.inputBackground },
                          ]}
                          activeOpacity={0.7}
                        >
                          <Pencil
                            size={16}
                            color={theme.text}
                            strokeWidth={2}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRemoveBuilding(building.id)}
                          style={[
                            styles.actionButton,
                            { backgroundColor: theme.error + '15' },
                          ]}
                          activeOpacity={0.7}
                        >
                          <Trash2
                            size={16}
                            color={theme.error}
                            strokeWidth={2}
                          />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </Animated.View>
              ))}
            </View>
          </View>
        )}

        {buildings.length === 0 && (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No buildings added yet
            </Text>
          </View>
        )}
      </ScrollView>

      <WizardFooter
        onBack={handleBack}
        onNext={handleNext}
        nextLabel="Next"
        nextDisabled={!canProceed}
        showBack={false}
      />
      <ConfirmModal
        visible={pendingDeleteId !== null}
        title="Delete Building"
        message="Delete this building and all its floors, rooms, and beds?"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) {
            removeBuilding(pendingDeleteId);
          }
          setPendingDeleteId(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 14,
  },
  section: {
    gap: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  buildingsList: {
    gap: 8,
  },
  buildingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  buildingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buildingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildingName: {
    fontSize: 14,
    fontWeight: '600',
  },
  buildingActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editContainer: {
    flex: 1,
    gap: 10,
  },
  editInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
