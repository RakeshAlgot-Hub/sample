import { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Animated } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { Bed, CheckCircle, Circle, Home, Building2, Layers, Search, AlertCircle } from 'lucide-react-native';

interface AvailableBed {
  propertyId: string;
  propertyName: string;
  buildingId: string;
  buildingName: string;
  floorId: string;
  floorLabel: string;
  roomId: string;
  roomNumber: string;
  bedId: string;
  bedNumber: number;
  bedCount: number;
  dailyPrice?: number;
  monthlyPrice?: number;
}

interface BedSelectorProps {
  selectedBedId: string | null;
  onBedSelect: (bed: AvailableBed) => void;
}

export default function AvailableBedsList({ selectedBedId, onBedSelect }: BedSelectorProps) {
  const theme = useTheme();
  const { properties, activePropertyId } = usePropertiesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Selector states
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const bedFade = useRef(new Animated.Value(1)).current;

  // Collect all available beds (memoized to prevent recalculation on every render)
  const allAvailableBeds = useMemo(() => {
    const beds: AvailableBed[] = [];

    properties
      .filter((property) => !activePropertyId || property.id === activePropertyId)
      .forEach((property) => {
        property.buildings.forEach((building) => {
          building.floors.forEach((floor) => {
            floor.rooms.forEach((room) => {
              room.beds.forEach((bed, bedIndex) => {
                if (!bed.occupied) {
                  const bedCount = room.bedCount ?? room.beds.length;
                  const pricing = property.bedPricing?.find(
                    (entry) => entry.bedCount === bedCount
                  );
                  beds.push({
                    propertyId: property.id,
                    propertyName: property.name,
                    buildingId: building.id,
                    buildingName: building.name,
                    floorId: floor.id,
                    floorLabel: floor.label,
                    roomId: room.id,
                    roomNumber: room.roomNumber,
                    bedId: bed.id,
                    bedNumber: bedIndex + 1,
                    bedCount,
                    dailyPrice: pricing?.dailyPrice,
                    monthlyPrice: pricing?.monthlyPrice,
                  });
                }
              });
            });
          });
        });
      });

    return beds;
  }, [properties]);

  // Get current hierarchy data
  const currentProperty = useMemo(() => properties.find(p => p.id === selectedPropertyId), [selectedPropertyId, properties]);
  const currentBuilding = useMemo(() => currentProperty?.buildings.find(b => b.id === selectedBuildingId), [currentProperty, selectedBuildingId]);
  const currentFloor = useMemo(() => currentBuilding?.floors.find(f => f.id === selectedFloorId), [currentBuilding, selectedFloorId]);
  const currentRoom = useMemo(() => currentFloor?.rooms.find(r => r.id === selectedRoomId), [currentFloor, selectedRoomId]);

  useEffect(() => {
    if (showSearch) {
      return;
    }

    bedFade.setValue(0.85);
    Animated.timing(bedFade, {
      toValue: 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [selectedPropertyId, selectedBuildingId, selectedFloorId, selectedRoomId, showSearch, bedFade]);

  // Auto-select first property if not selected
  useEffect(() => {
    if (activePropertyId) {
      setSelectedPropertyId(activePropertyId);
      return;
    }

    if (!selectedPropertyId && properties.length > 0) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, activePropertyId]);

  // Auto-select first building when property changes
  useEffect(() => {
    if (selectedPropertyId && currentProperty && currentProperty.buildings.length > 0) {
      setSelectedBuildingId(currentProperty.buildings[0].id);
    }
  }, [selectedPropertyId, currentProperty]);

  // Auto-select first floor when building changes
  useEffect(() => {
    if (selectedBuildingId && currentBuilding && currentBuilding.floors.length > 0) {
      setSelectedFloorId(currentBuilding.floors[0].id);
    }
  }, [selectedBuildingId, currentBuilding]);

  // Auto-select first room when floor changes
  useEffect(() => {
    if (selectedFloorId && currentFloor && currentFloor.rooms.length > 0) {
      setSelectedRoomId(currentFloor.rooms[0].id);
    }
  }, [selectedFloorId, currentFloor]);

  // Filter beds based on search or selector (memoized)
  const displayBeds = useMemo(() => {
    if (showSearch && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return allAvailableBeds.filter(bed =>
        bed.propertyName.toLowerCase().includes(query) ||
        bed.buildingName.toLowerCase().includes(query) ||
        bed.floorLabel.toLowerCase().includes(query) ||
        bed.roomNumber.toLowerCase().includes(query) ||
        bed.bedNumber.toString().includes(query)
      );
    } else if (!showSearch && currentRoom) {
      return allAvailableBeds.filter(bed => bed.roomId === selectedRoomId);
    }
    return [];
  }, [showSearch, searchQuery, currentRoom, selectedRoomId, allAvailableBeds]);

  if (properties.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <AlertCircle size={48} color={theme.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Properties</Text>
        <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
          Create a property with buildings and floors first.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Search size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search beds, rooms, floors..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setShowSearch(true)}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => { setSearchQuery(''); setShowSearch(false); }}>
            <Text style={[styles.clearButton, { color: theme.primary }]}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {showSearch && searchQuery.trim() ? (
        // Search Results
        <ScrollView showsVerticalScrollIndicator={false} style={styles.bedsList}>
          {displayBeds.length === 0 ? (
            <View style={styles.emptyMessage}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No beds found</Text>
            </View>
          ) : (
            displayBeds.map((bed) => {
              const isSelected = bed.bedId === selectedBedId;
              return (
                <TouchableOpacity
                  key={bed.bedId}
                  style={[
                    styles.bedCard,
                    {
                      backgroundColor: isSelected ? theme.primary + '15' : theme.card,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => {
                    onBedSelect(bed);
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.bedCardContent}>
                    <View style={styles.bedCardLeft}>
                      <View style={[styles.bedIconContainer, { backgroundColor: isSelected ? theme.primary : theme.background }]}>
                        <Bed size={18} color={isSelected ? '#fff' : theme.primary} />
                      </View>
                      <View style={styles.bedInfo}>
                        <Text style={[styles.bedTitle, { color: theme.text }]}>
                          Bed {bed.bedNumber} • Room {bed.roomNumber}
                        </Text>
                        {(bed.dailyPrice !== undefined || bed.monthlyPrice !== undefined) && (
                          <Text style={[styles.bedPrice, { color: theme.textSecondary }]}>
                            {bed.dailyPrice !== undefined ? `Day Rs ${bed.dailyPrice}` : 'Day -'}
                            {'  •  '}
                            {bed.monthlyPrice !== undefined
                              ? `Month Rs ${bed.monthlyPrice}`
                              : 'Month -'}
                          </Text>
                        )}
                        <View style={styles.breadcrumb}>
                          <Text style={[styles.breadcrumbText, { color: theme.textSecondary }]}>
                            {bed.propertyName} → {bed.buildingName} → {bed.floorLabel}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.checkIcon, { borderColor: isSelected ? theme.primary : theme.border }]}>
                      {isSelected ? (
                        <CheckCircle size={20} color={theme.primary} fill={theme.primary} />
                      ) : (
                        <Circle size={20} color={theme.border} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      ) : (
        // Selector View
        <ScrollView showsVerticalScrollIndicator={false} style={styles.selectorView}>
          {/* Property Selector */}
          <View style={styles.selectorSection}>
            <Text style={[styles.selectorLabel, { color: theme.text }]}>
              <Home size={14} color={theme.textSecondary} /> Property
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsList}>
              {properties.map((property) => {
                const isSelected = property.id === selectedPropertyId;
                return (
                  <TouchableOpacity
                    key={property.id}
                    style={[
                      styles.option,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.card,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => {
                      const nextBuilding = property.buildings[0];
                      const nextFloor = nextBuilding?.floors[0];
                      const nextRoom = nextFloor?.rooms[0];

                      setSelectedPropertyId(property.id);
                      setSelectedBuildingId(nextBuilding?.id ?? null);
                      setSelectedFloorId(nextFloor?.id ?? null);
                      setSelectedRoomId(nextRoom?.id ?? null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionText, { color: isSelected ? '#fff' : theme.text }]}>
                      {property.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Building Selector */}
          {currentProperty && currentProperty.buildings.length > 0 && (
            <View style={styles.selectorSection}>
              <Text style={[styles.selectorLabel, { color: theme.text }]}>
                <Building2 size={14} color={theme.textSecondary} /> Building
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsList}>
                {currentProperty.buildings.map((building) => {
                  const isSelected = building.id === selectedBuildingId;
                  return (
                    <TouchableOpacity
                      key={building.id}
                      style={[
                        styles.option,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.card,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => {
                        const nextFloor = building.floors[0];
                        const nextRoom = nextFloor?.rooms[0];

                        setSelectedBuildingId(building.id);
                        setSelectedFloorId(nextFloor?.id ?? null);
                        setSelectedRoomId(nextRoom?.id ?? null);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, { color: isSelected ? '#fff' : theme.text }]}>
                        {building.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Floor Selector */}
          {currentBuilding && currentBuilding.floors.length > 0 && (
            <View style={styles.selectorSection}>
              <Text style={[styles.selectorLabel, { color: theme.text }]}>
                <Layers size={14} color={theme.textSecondary} /> Floor
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsList}>
                {currentBuilding.floors.map((floor) => {
                  const isSelected = floor.id === selectedFloorId;
                  return (
                    <TouchableOpacity
                      key={floor.id}
                      style={[
                        styles.option,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.card,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => {
                        const nextRoom = floor.rooms[0];

                        setSelectedFloorId(floor.id);
                        setSelectedRoomId(nextRoom?.id ?? null);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, { color: isSelected ? '#fff' : theme.text }]}>
                        {floor.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Room Selector */}
          {currentFloor && currentFloor.rooms.length > 0 && (
            <View style={styles.selectorSection}>
              <Text style={[styles.selectorLabel, { color: theme.text }]}>
                <Bed size={14} color={theme.textSecondary} /> Room
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsList}>
                {currentFloor.rooms.map((room) => {
                  const isSelected = room.id === selectedRoomId;
                  return (
                    <TouchableOpacity
                      key={room.id}
                      style={[
                        styles.option,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.card,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setSelectedRoomId(room.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, { color: isSelected ? '#fff' : theme.text }]}>
                        Room {room.roomNumber}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Bed Selector */}
          {currentRoom && currentFloor && currentFloor.rooms.length > 0 && (
            <View style={styles.selectorSection}>
              <Text style={[styles.selectorLabel, { color: theme.text }]}>
                <Bed size={14} color={theme.textSecondary} /> Select Bed
              </Text>
              {displayBeds.length === 0 ? (
                <Animated.View style={[styles.emptyMessage, { backgroundColor: theme.card, opacity: bedFade }]}>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    No available beds in this room
                  </Text>
                </Animated.View>
              ) : (
                <Animated.View style={[styles.bedGrid, { opacity: bedFade }]}>
                  {displayBeds.map((bed) => {
                    const isSelected = bed.bedId === selectedBedId;
                    return (
                      <TouchableOpacity
                        key={bed.bedId}
                        style={[
                          styles.bedOption,
                          {
                            backgroundColor: isSelected ? theme.primary : theme.card,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                        onPress={() => onBedSelect(bed)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.bedOptionText, { color: isSelected ? '#fff' : theme.text }]}>
                          Bed {bed.bedNumber}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </Animated.View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  clearButton: {
    fontSize: 13,
    fontWeight: '600',
  },
  selectorView: {
    flex: 1,
  },
  bedsList: {
    flex: 1,
  },
  selectorSection: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionsList: {
    gap: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  bedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bedOption: {
    width: '30%',
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bedOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bedCard: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  bedCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bedCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  bedIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bedInfo: {
    flex: 1,
    gap: 3,
  },
  bedPrice: {
    fontSize: 12,
    fontWeight: '600',
  },
  bedTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  breadcrumb: {
    gap: 4,
  },
  breadcrumbText: {
    fontSize: 11,
  },
  checkIcon: {
    marginLeft: 8,
  },
  emptyMessage: {
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDescription: {
    fontSize: 13,
    textAlign: 'center',
  },
});
