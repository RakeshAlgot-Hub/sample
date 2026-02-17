import { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useMembersStore } from '@/store/useMembersStore';
import { usePropertiesStore } from '@/store/usePropertiesStore';
import MemberCard from '@/components/MemberCard';
import { Users, Plus } from 'lucide-react-native';

export default function MembersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { members, loadMembersByProperty, clearMembers, removeMember, page, hasMore, isLoading } = useMembersStore();
  const { activePropertyId, loadProperties, properties } = usePropertiesStore();

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (activePropertyId) {
      loadMembersByProperty(activePropertyId);
    } else {
      clearMembers();
    }
    // Clear members when unmounting or switching property
    return () => {
      clearMembers();
    };
  }, [activePropertyId]);

  const handleAddMember = () => {
    router.push('/beds/total');
  };

  const handleRemoveMember = async (id: string) => {
    await removeMember(id);
  };

  const visibleMembers = members;

  const activeProperty = useMemo(() => {
    return properties.find((property) => property.id === activePropertyId) ?? null;
  }, [properties, activePropertyId]);

  if (visibleMembers.length === 0 && !isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.emptyContent}>
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.primary + '15' },
              ]}
            >
              <Users size={48} color={theme.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Members Yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Assign your first member to a bed
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.accent }]}
              onPress={handleAddMember}
              activeOpacity={0.8}
            >
              <Plus size={20} color="#ffffff" strokeWidth={2} />
              <Text style={styles.createButtonText}>Assign Bed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Handler to load next page
  const handleLoadMore = () => {
    if (!isLoading && hasMore && activePropertyId) {
      loadMembersByProperty(activePropertyId, page + 1);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <FlatList
        data={visibleMembers}
        keyExtractor={(member) => member.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MemberCard
            member={item}
            onRemove={() => handleRemoveMember(item.id)}
          />
        )}
        ListEmptyComponent={isLoading ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : null}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore && !isLoading ? (
            <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={handleLoadMore}>
              <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 16 }}>Load more members</Text>
            </TouchableOpacity>
          ) : isLoading && visibleMembers.length > 0 ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          ) : null
        }
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.accent }]}
        onPress={handleAddMember}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCard: {
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 14,
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 6,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 14,
  },
  sectionHeader: {
    gap: 4,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30,
  },
});
