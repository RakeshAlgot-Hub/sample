import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { Plus, User, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { AddTenantModal } from '@/components/AddTenantModal';
import { usePropertyStore } from '@/store/property';
import { tenantService, TenantResponse } from '@/services/tenantService';

import { Colors } from '@/constants/Colors';
import { useUnitStore } from '@/store/units';
import { useRoomStore } from '@/store/rooms';


export default function MembersScreen() {
  const router = useRouter();
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [tenants, setTenants] = useState<TenantResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const { getSelectedProperty } = usePropertyStore();
  const property = getSelectedProperty();

  const { units = [], fetchUnits } = useUnitStore();
  const { rooms = [], fetchRooms } = useRoomStore();

  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounce(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAllData = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (!property) return;

    if (pageNum === 1) {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
    } else {
      setLoadingMore(true);
    }

    try {
      const [tenantData] = await Promise.all([
        tenantService.getTenantsByProperty(property.id, {
          page: pageNum,
          limit: 20,
          search: searchDebounce
        }),
        pageNum === 1 ? fetchUnits(property.id) : Promise.resolve(),
        pageNum === 1 ? fetchRooms(property.id) : Promise.resolve(),
      ]);

      if (pageNum === 1) {
        setTenants(Array.isArray(tenantData.data) ? tenantData.data : []);
      } else {
        setTenants(prev => Array.isArray(tenantData.data) ? [...prev, ...tenantData.data] : prev);
      }

      setHasMore(pageNum < (tenantData.totalPages || 1));
    } catch (error: any) {
      // Stop repeated requests on 403/429
      if (error && error.stopRetry) {
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        setTenants([]);
        return;
      }
      if (pageNum === 1) {
        setTenants([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [property, searchDebounce, fetchUnits, fetchRooms]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchAllData(1);
  }, [property, searchDebounce]);

  // Refresh tenant list when screen regains focus (after delete or edit)
  useFocusEffect(
    useCallback(() => {
      setPage(1);
      setHasMore(true);
      fetchAllData(1);
    }, [property, searchDebounce])
  );


  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAllData(nextPage);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    fetchAllData(1, true);
  };

  const handleSuccess = () => {
    setPage(1);
    setHasMore(true);
    setShowAddTenant(false);
    fetchAllData(1);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <User size={64} color={Colors.neutral[400]} strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyTitle}>No Tenants Yet</Text>
      <Text style={styles.emptyText}>
        Add your first tenant to start managing memberships and tracking payments
      </Text>
      {property && (
        <TouchableOpacity
          style={styles.emptyAddButton}
          onPress={() => setShowAddTenant(true)}>
          <Plus size={20} color={Colors.background.paper} />
          <Text style={styles.emptyAddButtonText}>Add First Tenant</Text>
        </TouchableOpacity>
      )}
      {!property && (
        <Text style={styles.noPropertyText}>
          Please select a property to manage tenants
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {property && (
        <>
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Tenants</Text>
              <Text style={styles.headerSubtitle}>
                {Array.isArray(tenants) ? tenants.length : 0} {Array.isArray(tenants) && tenants.length === 1 ? 'tenant' : 'tenants'}
              </Text>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or phone..."
              placeholderTextColor={Colors.text.hint}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </>
      )}

      <FlatList
        data={tenants}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading tenants...</Text>
          </View>
        ) : renderEmptyState()}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const unit = Array.isArray(units) ? units.find((u) => u.id === item.unitId) : undefined;
          const room = unit && Array.isArray(rooms) ? rooms.find((r) => r.id === unit.roomId) : undefined;
          const roomNumber = room?.roomNumber || '-';
          return (
            <TouchableOpacity
              style={styles.tenantCard}
              onPress={() => {
                router.push({
                  pathname: '/details/tenant-detail',
                  params: { tenant: JSON.stringify(item) }
                });
              }}
              activeOpacity={0.7}>
              <View style={styles.tenantRow}>
                <View style={styles.avatarContainer}>
                  {item.profilePictureUrl ? (
                    <Image
                      source={{ uri: item.profilePictureUrl }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {item.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </Text>
                  )}
                </View>
                <View style={styles.tenantInfo}>
                  <Text style={styles.tenantName} numberOfLines={1}>{item.fullName}</Text>
                  <View style={styles.tenantMeta}>
                    <Text style={styles.tenantMetaText}>Room {roomNumber}</Text>
                    <Text style={styles.tenantMetaDot}>•</Text>
                    <Text style={styles.tenantMetaText}>{item.phoneNumber}</Text>
                  </View>
                </View>
                <View style={styles.checkInBadge}>
                  <Text style={styles.checkInText}>{item.checkInDate ? item.checkInDate.split('T')[0].split('-').slice(1).join('/') : '-'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {property && Array.isArray(tenants) && tenants.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setShowAddTenant(true)}
          activeOpacity={0.8}>
          <Plus size={28} color={Colors.background.paper} strokeWidth={2.5} />
        </TouchableOpacity>
      )}

      {property && (
        <AddTenantModal
          visible={showAddTenant}
          onClose={() => setShowAddTenant(false)}
          propertyId={property.id}
          onSuccess={handleSuccess}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.paper,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 10,
    paddingBottom: 90,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 280,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  emptyAddButtonText: {
    color: Colors.background.paper,
    fontSize: 16,
    fontWeight: '600',
  },
  noPropertyText: {
    fontSize: 14,
    color: Colors.text.hint,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tenantCard: {
    backgroundColor: Colors.background.paper,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  tenantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.elevated,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.background.paper,
  },
  tenantInfo: {
    flex: 1,
    gap: 3,
  },
  tenantName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  tenantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tenantMetaText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  tenantMetaDot: {
    fontSize: 11,
    color: Colors.text.disabled,
  },
  checkInBadge: {
    backgroundColor: Colors.background.elevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  checkInText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
