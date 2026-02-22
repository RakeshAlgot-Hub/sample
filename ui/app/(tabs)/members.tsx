import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { Plus, Edit2, Trash2, User, Search } from 'lucide-react-native';
import { AddTenantModal } from '@/components/AddTenantModal';
import { EditTenantModal } from '@/components/EditTenantModal';
import { usePropertyStore } from '@/store/property';
import { tenantService, TenantResponse } from '@/services/tenantService';

import { Colors } from '@/constants/Colors';
import { useUnitStore } from '@/store/units';
import { useRoomStore } from '@/store/rooms';


export default function MembersScreen() {
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [showEditTenant, setShowEditTenant] = useState(false);
  const [editTenant, setEditTenant] = useState<TenantResponse | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<TenantResponse | null>(null);
  const [tenants, setTenants] = useState<TenantResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return;
    setDeleting(true);
    try {
      await tenantService.deleteTenant(tenantToDelete.id);
      setPage(1);
      setHasMore(true);
      await fetchAllData(1);
      setDeleteModalVisible(false);
      setTenantToDelete(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to delete tenant');
    } finally {
      setDeleting(false);
    }
  };

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
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddTenant(true)}>
              <Plus size={20} color={Colors.background.paper} />
              <Text style={styles.addButtonText}>Add Tenant</Text>
            </TouchableOpacity>
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
            <View style={styles.tenantCard}>
              <View style={styles.tenantHeader}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {item.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tenantName}>{item.fullName}</Text>
                  <Text style={styles.tenantPhone}>{item.phoneNumber}</Text>
                  <Text style={styles.bedInfo}>
                    Room No: <Text style={styles.bedInfoValue}>{roomNumber}</Text>
                  </Text>
                </View>
                <View style={styles.iconActions}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                      setEditTenant(item);
                      setShowEditTenant(true);
                    }}>
                    <Edit2 size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                      setTenantToDelete(item);
                      setDeleteModalVisible(true);
                    }}>
                    <Trash2 size={18} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.tenantDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Check-in</Text>
                  <Text style={styles.detailValue}>{item.checkInDate ? item.checkInDate.split('T')[0] : '-'}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      {property && (
        <AddTenantModal
          visible={showAddTenant}
          onClose={() => setShowAddTenant(false)}
          propertyId={property.id}
          onSuccess={handleSuccess}
        />
      )}
      {property && editTenant && (
        <EditTenantModal
          visible={showEditTenant}
          onClose={() => setShowEditTenant(false)}
          propertyId={property.id}
          tenant={editTenant}
          onSuccess={() => {
            setShowEditTenant(false);
            handleSuccess();
          }}
        />
      )}

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !deleting && setDeleteModalVisible(false)}>
          <Pressable style={styles.deleteModal} onPress={(e) => e.stopPropagation()}>
            <View style={styles.deleteModalIcon}>
              <Trash2 size={32} color={Colors.danger} />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Tenant</Text>
            <Text style={styles.deleteModalText}>
              Are you sure you want to delete{' '}
              <Text style={styles.deleteModalBold}>{tenantToDelete?.fullName}</Text>?
              This action cannot be undone.
            </Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDeleteModalVisible(false)}
                disabled={deleting}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={handleDeleteConfirm}
                disabled={deleting}>
                {deleting ? (
                  <ActivityIndicator size="small" color={Colors.background.paper} />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingVertical: 16,
    backgroundColor: Colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: Colors.background.paper,
    fontWeight: '600',
    fontSize: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.paper,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
    padding: 16,
    paddingBottom: 24,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tenantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background.paper,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  tenantPhone: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginBottom: 12,
  },
  tenantDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  deleteModal: {
    backgroundColor: Colors.background.paper,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  deleteModalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  deleteModalText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  deleteModalBold: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.background.paper,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background.paper,
  },
  bedInfo: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
    marginBottom: 2,
  },
  bedInfoValue: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  iconButton: {
    padding: 6,
    borderRadius: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
