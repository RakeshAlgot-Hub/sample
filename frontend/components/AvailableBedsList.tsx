import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Animated, ActivityIndicator, FlatList } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import { Bed, CheckCircle, Circle, Home, Building2, Layers, Search, AlertCircle } from 'lucide-react-native';
import { getAvailableBeds, AvailableBedSummary } from '@/services/bedService';
import { Property, Building, Floor, Room } from '@/types/property';

interface AvailableBed {
  id: string;
  propertyName: string;
  floorLabel: string;
  roomId: string;
  roomNumber: string;
  bedNumber: number;
  dailyPrice?: number;
  monthlyPrice?: number;
}

interface BedSelectorProps {
  selectedBedId: string | null;
  onBedSelect: (bed: AvailableBed) => void;
}

export default function AvailableBedsList({ selectedBedId, onBedSelect }: BedSelectorProps) {
  const theme = useTheme();
  const propertiesStore = usePropertiesStore();
  const properties = propertiesStore.properties;
  const activePropertyId = propertiesStore.activePropertyId;

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Selector states
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Backend paginated available beds
  const [beds, setBeds] = useState<AvailableBed[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const bedFade = useRef(new Animated.Value(1)).current;

  // Get current hierarchy data (for selectors only)
  function isFullProperty(obj: any): obj is Property {
    return obj && Array.isArray(obj.buildings);
  }
  const currentPropertyRaw = properties.find(p => p.id === selectedPropertyId);
  const currentProperty = isFullProperty(currentPropertyRaw) ? currentPropertyRaw : undefined;
  const currentBuilding = currentProperty?.buildings.find((b: Building) => b.id === selectedBuildingId);
  const currentFloor = currentBuilding?.floors.find((f: Floor) => f.id === selectedFloorId);
  const currentRoom = currentFloor?.rooms.find((r: Room) => r.id === selectedRoomId);
  // Only show selector UI if currentProperty is a full Property (not PropertySummary)
  const showSelector = !!currentProperty;

  // Fetch beds from backend when room changes or page changes
  useEffect(() => {
    if (!selectedPropertyId || !selectedBuildingId || !selectedFloorId || !selectedRoomId) return;
    setIsLoading(true);
    getAvailableBeds({
      propertyId: selectedPropertyId,
      buildingId: selectedBuildingId,
      floorId: selectedFloorId,
      roomId: selectedRoomId,
      page,
      limit: 20,
    })
      .then((res) => {
        // Map AvailableBedSummary to AvailableBed
        const mappedBeds: AvailableBed[] = res.beds.map((bed: AvailableBedSummary) => ({
          id: bed.id,
          propertyName: bed.propertyName ?? '',
          floorLabel: bed.floorLabel ?? '',
          roomId: bed.roomId ?? '',
          roomNumber: bed.roomNumber ?? '',
          bedNumber: bed.bedNumber ?? 0,
          dailyPrice: bed.dailyPrice,
          monthlyPrice: bed.monthlyPrice,
        }));
        setBeds((prev) => page === 1 ? mappedBeds : [...prev, ...mappedBeds]);
        setHasMore(res.hasMore);
      })
      .finally(() => setIsLoading(false));
  }, [selectedPropertyId, selectedBuildingId, selectedFloorId, selectedRoomId, page]);

  // Reset beds when room changes
  useEffect(() => {
    setBeds([]);
    setPage(1);
    setHasMore(true);
  }, [selectedPropertyId, selectedBuildingId, selectedFloorId, selectedRoomId]);

  // Filter for search
  const displayBeds = showSearch && searchQuery.trim()
    ? beds.filter(bed => {
        const query = searchQuery.toLowerCase();
        return (
          (bed.id && bed.id.toLowerCase().includes(query)) ||
          (bed.roomId && bed.roomId.toLowerCase().includes(query))
        );
      })
    : beds;

  if (properties.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}> 
        <AlertCircle size={48} color={theme.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Properties</Text>
        <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>Create a property with buildings and floors first.</Text>
      </View>
    );
  }

  // Handler to load next page
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage((p) => p + 1);
    }
  };

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
        <FlatList
          data={displayBeds}
          keyExtractor={(bed) => bed.id}
          contentContainerStyle={styles.bedsList}
          renderItem={({ item: bed }) => {
            const isSelected = bed.id === selectedBedId;
            return (
              <TouchableOpacity
                key={bed.id}
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
                      <Text style={[styles.bedTitle, { color: theme.text }]}>Bed {bed.id}</Text>
                      <View style={styles.breadcrumb}>
                        <Text style={[styles.breadcrumbText, { color: theme.textSecondary }]}>Room {bed.roomId}</Text>
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
          }}
          ListEmptyComponent={isLoading && beds.length === 0 ? (
            <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 20 }} />
          ) : displayBeds.length === 0 ? (
            <View style={styles.emptyMessage}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No beds found</Text>
            </View>
          ) : null}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore && !isLoading ? (
              <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={handleLoadMore}>
                <Text style={{ color: theme.primary, fontWeight: '600' }}>Load more beds</Text>
              </TouchableOpacity>
            ) : isLoading && beds.length > 0 ? (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            ) : null
          }
        />
      ) : (
        showSelector ? (
          <FlatList
            data={displayBeds}
            keyExtractor={(bed) => bed.id}
            contentContainerStyle={styles.bedGrid}
            numColumns={3}
            renderItem={({ item: bed }) => {
              const isSelected = bed.id === selectedBedId;
              return (
                <TouchableOpacity
                  key={bed.id}
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
                  <Text style={[styles.bedOptionText, { color: isSelected ? '#fff' : theme.text }]}>Bed {bed.id}</Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={isLoading && beds.length === 0 ? (
              <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 20 }} />
            ) : displayBeds.length === 0 ? (
              <Animated.View style={[styles.emptyMessage, { backgroundColor: theme.card, opacity: bedFade }]}> 
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No available beds in this room</Text>
              </Animated.View>
            ) : null}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              hasMore && !isLoading ? (
                <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={handleLoadMore}>
                  <Text style={{ color: theme.primary, fontWeight: '600' }}>Load more beds</Text>
                </TouchableOpacity>
              ) : isLoading && beds.length > 0 ? (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={theme.primary} />
                </View>
              ) : null
            }
          />
        ) : null
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
