import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePropertyStore } from '@/store/property';
import { ChevronLeft, Edit2, Trash2, X } from 'lucide-react-native';

export default function ManageBuildingsScreen() {
  const router = useRouter();
  const { getSelectedProperty } = usePropertyStore();
  const property = getSelectedProperty();
  const insets = useSafeAreaInsets();

  const [editingBuildingId, setEditingBuildingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!property) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Buildings</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Property not found</Text>
        </View>
      </View>
    );
  }

  const handleEditBuilding = (buildingId: string, currentName: string) => {
    setEditingBuildingId(buildingId);
    setEditingName(currentName);
  };

  const handleSaveEdit = () => {
    if (!editingBuildingId || !editingName.trim()) {
      Alert.alert('Error', 'Building name cannot be empty');
      return;
    }

    const updatedBuildings = property.buildings.map((b) =>
      b.id === editingBuildingId ? { ...b, name: editingName.trim() } : b
    );

    // updateBuildings removed
    setEditingBuildingId(null);
    setEditingName('');
  };

  const handleDeleteBuilding = (buildingId: string, buildingName: string) => {
    Alert.alert('Delete Building', `Delete "${buildingName}"?`, [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: () => {
          const updatedBuildings = property.buildings.filter((b) => b.id !== buildingId);
          // updateBuildings removed
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Buildings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {property.buildings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No buildings added yet</Text>
          </View>
        ) : (
          <View style={styles.buildingsList}>
            {property.buildings.map((building) => (
              <View key={building.id} style={styles.buildingCard}>
                <View style={styles.buildingInfo}>
                  <Text style={styles.buildingName}>{building.name}</Text>
                </View>
                  <View style={styles.buildingActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditBuilding(building.id, building.name)}>
                      <Edit2 size={18} color="#075E54" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteBuilding(building.id, building.name)}>
                      <Trash2 size={18} color="#dc3545" />
                    </TouchableOpacity>
                  </View>
                </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={editingBuildingId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingBuildingId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Building Name</Text>
              <TouchableOpacity onPress={() => setEditingBuildingId(null)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Building name"
              placeholderTextColor="#999"
              value={editingName}
              onChangeText={setEditingName}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditingBuildingId(null)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEdit}
                disabled={!editingName.trim()}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  buildingsList: {
    gap: 12,
  },
  buildingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buildingInfo: {
    flex: 1,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  roomCount: {
    fontSize: 13,
    color: '#666',
  },
  buildingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#075E54',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
