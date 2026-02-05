import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useMembersStore } from '@/store/useMembersStore';
import MemberAssignmentForm from '@/components/MemberAssignmentForm';
import { CheckCircle, ChevronLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function AddMemberScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { addMember } = useMembersStore();
  const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (
      name: string,
      phone: string,
      houseFlatNo: string,
      streetArea: string,
      city: string,
      state: string,
      pincode: string,
      country: string,
    proofId: string,
    profilePic: string | null,
    propertyId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
    bedId: string
  ) => {
    const newMember = {
      id: Date.now().toString(),
      name,
      phone,
      houseFlatNo,
      streetArea,
      city,
      state,
      pincode,
      country,
      proofId,
      profilePic,
      propertyId,
      buildingId,
      floorId,
      roomId,
      bedId,
      createdAt: new Date().toISOString(),
    };

    await addMember(newMember);

    setShowSuccess(true);
    setTimeout(() => {
      router.back();
    }, 800);
  };

  const handleCancel = () => {
    console.log('Attempting to go back');
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={handleCancel}
          style={[styles.backButton, { backgroundColor: theme.inputBackground }]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={theme.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Assign Bed
        </Text>
        <View style={styles.placeholder} />
      </View>

      <MemberAssignmentForm onSubmit={handleSubmit} submitLabel="Assign Bed" />

      {showSuccess && (
        <View
          style={[
            styles.successOverlay,
            { backgroundColor: theme.background + 'E6' },
          ]}
        >
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={[
              styles.successCard,
              {
                backgroundColor: theme.success + '15',
                borderColor: theme.success,
              },
            ]}
          >
            <CheckCircle size={48} color={theme.success} strokeWidth={2} />
            <Text style={[styles.successText, { color: theme.success }]}>
              Bed Assigned Successfully!
            </Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 44,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 40,
  },
  successText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
