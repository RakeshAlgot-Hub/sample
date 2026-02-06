import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { Property, Building, Floor, Room, Bed } from '@/types/property';
import { Home, Building2, Layers, DoorOpen, Bed as BedIcon, AlertCircle } from 'lucide-react-native';

interface BedSelectorProps {
  selectedPropertyId: string | null;
  selectedBuildingId: string | null;
  selectedFloorId: string | null;
  selectedRoomId: string | null;
  selectedBedId: string | null;
  onPropertyChange: (propertyId: string) => void;
  onBuildingChange: (buildingId: string) => void;
  onFloorChange: (floorId: string) => void;
  onRoomChange: (roomId: string) => void;
  onBedChange: (bedId: string) => void;
  excludeMemberId?: string;
}

export default function BedSelector({
  selectedPropertyId,
  selectedBuildingId,
  selectedFloorId,
  selectedRoomId,
  selectedBedId,
  onPropertyChange,
  onBuildingChange,
  onFloorChange,
  onRoomChange,
  onBedChange,
  excludeMemberId,
}: BedSelectorProps) {
  const theme = useTheme();
  const { properties, activePropertyId } = usePropertiesStore();

  const propertyOptions = activePropertyId
    ? properties.filter((property) => property.id === activePropertyId)
    : properties;

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
  const selectedBuilding = selectedProperty?.buildings.find(
    (b) => b.id === selectedBuildingId
  );
  const selectedFloor = selectedBuilding?.floors.find(
    (f) => f.id === selectedFloorId
  );
  const selectedRoom = selectedFloor?.rooms.find((r) => r.id === selectedRoomId);

  useEffect(() => {
    if (selectedProperty && !selectedBuildingId && selectedProperty.buildings.length > 0) {
      onBuildingChange(selectedProperty.buildings[0].id);
    }
  }, [selectedProperty, selectedBuildingId]);

  useEffect(() => {
    if (selectedBuilding && !selectedFloorId && selectedBuilding.floors.length > 0) {
      onFloorChange(selectedBuilding.floors[0].id);
    }
  }, [selectedBuilding, selectedFloorId]);

  useEffect(() => {
    if (selectedFloor && !selectedRoomId && selectedFloor.rooms.length > 0) {
      onRoomChange(selectedFloor.rooms[0].id);
    }
  }, [selectedFloor, selectedRoomId]);

  if (propertyOptions.length === 0) {
    return (
      <View
        style={[
          styles.emptyCard,
          { backgroundColor: theme.warning + '15', borderColor: theme.warning },
        ]}
      >
        <AlertCircle size={20} color={theme.warning} strokeWidth={2} />
        <Text style={[styles.emptyText, { color: theme.warning }]}>
          No properties available. Create a property first.
        </Text>
      </View>
    );
  }

  const availableBeds = selectedRoom?.beds.filter((bed) => !bed.occupied) || [];

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Home size={18} color={theme.textSecondary} strokeWidth={2} />
          <Text style={[styles.label, { color: theme.text }]}>
            Property
            <Text style={[styles.required, { color: theme.accent }]}> *</Text>
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.optionsList}
        >
          {propertyOptions.map((property) => {
            const isSelected = property.id === selectedPropertyId;
            return (
              <TouchableOpacity
                key={property.id}
                style={[
                  styles.option,
                  {
                    backgroundColor: isSelected
                      ? theme.primary
                      : theme.inputBackground,
                    borderColor: isSelected ? theme.primary : theme.inputBorder,
                    opacity: activePropertyId ? 0.7 : 1,
                  },
                ]}
                onPress={() => onPropertyChange(property.id)}
                disabled={Boolean(activePropertyId)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: isSelected ? '#ffffff' : theme.text },
                  ]}
                >
                  {property.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {selectedProperty && selectedProperty.buildings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Building2 size={18} color={theme.textSecondary} strokeWidth={2} />
            <Text style={[styles.label, { color: theme.text }]}>
              Building
              <Text style={[styles.required, { color: theme.accent }]}> *</Text>
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsList}
          >
            {selectedProperty.buildings.map((building) => {
              const isSelected = building.id === selectedBuildingId;
              return (
                <TouchableOpacity
                  key={building.id}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.inputBackground,
                      borderColor: isSelected ? theme.primary : theme.inputBorder,
                    },
                  ]}
                  onPress={() => onBuildingChange(building.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: isSelected ? '#ffffff' : theme.text },
                    ]}
                  >
                    {building.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {selectedBuilding && selectedBuilding.floors.length > 0 && (
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Layers size={18} color={theme.textSecondary} strokeWidth={2} />
            <Text style={[styles.label, { color: theme.text }]}>
              Floor
              <Text style={[styles.required, { color: theme.accent }]}> *</Text>
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsList}
          >
            {selectedBuilding.floors.map((floor) => {
              const isSelected = floor.id === selectedFloorId;
              return (
                <TouchableOpacity
                  key={floor.id}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.inputBackground,
                      borderColor: isSelected ? theme.primary : theme.inputBorder,
                    },
                  ]}
                  onPress={() => onFloorChange(floor.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: isSelected ? '#ffffff' : theme.text },
                    ]}
                  >
                    Floor {floor.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {selectedFloor && selectedFloor.rooms.length > 0 && (
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <DoorOpen size={18} color={theme.textSecondary} strokeWidth={2} />
            <Text style={[styles.label, { color: theme.text }]}>
              Room
              <Text style={[styles.required, { color: theme.accent }]}> *</Text>
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsList}
          >
            {selectedFloor.rooms.map((room) => {
              const isSelected = room.id === selectedRoomId;
              const availableBedsCount = room.beds.filter((b) => !b.occupied).length;
              return (
                <TouchableOpacity
                  key={room.id}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.inputBackground,
                      borderColor: isSelected ? theme.primary : theme.inputBorder,
                    },
                  ]}
                  onPress={() => onRoomChange(room.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: isSelected ? '#ffffff' : theme.text },
                    ]}
                  >
                    {room.roomNumber}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: isSelected
                          ? '#ffffff'
                          : theme.success + '15',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: isSelected ? theme.primary : theme.success,
                        },
                      ]}
                    >
                      {availableBedsCount}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {selectedRoom && (
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <BedIcon size={18} color={theme.textSecondary} strokeWidth={2} />
            <Text style={[styles.label, { color: theme.text }]}>
              Bed
              <Text style={[styles.required, { color: theme.accent }]}> *</Text>
            </Text>
          </View>
          {availableBeds.length > 0 ? (
            <View style={styles.bedsGrid}>
              {selectedRoom.beds.map((bed) => {
                const isSelected = bed.id === selectedBedId;
                const isDisabled = bed.occupied;
                return (
                  <TouchableOpacity
                    key={bed.id}
                    style={[
                      styles.bedOption,
                      {
                        backgroundColor: isDisabled
                          ? theme.inputBackground
                          : isSelected
                            ? theme.primary
                            : theme.inputBackground,
                        borderColor: isDisabled
                          ? theme.border
                          : isSelected
                            ? theme.primary
                            : theme.inputBorder,
                        opacity: isDisabled ? 0.5 : 1,
                      },
                    ]}
                    onPress={() => !isDisabled && onBedChange(bed.id)}
                    activeOpacity={0.7}
                    disabled={isDisabled}
                  >
                    <BedIcon
                      size={20}
                      color={
                        isDisabled
                          ? theme.textSecondary
                          : isSelected
                            ? '#ffffff'
                            : theme.text
                      }
                      strokeWidth={2}
                    />
                    <Text
                      style={[
                        styles.bedText,
                        {
                          color: isDisabled
                            ? theme.textSecondary
                            : isSelected
                              ? '#ffffff'
                              : theme.text,
                        },
                      ]}
                    >
                      {bed.id}
                    </Text>
                    {isDisabled && (
                      <Text
                        style={[styles.occupiedText, { color: theme.error }]}
                      >
                        Occupied
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: theme.warning + '15', borderColor: theme.warning },
              ]}
            >
              <AlertCircle size={20} color={theme.warning} strokeWidth={2} />
              <Text style={[styles.emptyText, { color: theme.warning }]}>
                No available beds in this room
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  required: {
    fontSize: 16,
  },
  optionsList: {
    gap: 12,
    paddingVertical: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bedsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bedOption: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  bedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  occupiedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
