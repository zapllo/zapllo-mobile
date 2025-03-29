import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';

interface NavbarProps {

  image:any;
  profile:any;
}


const ProfileButton: React.FC<NavbarProps> = ({ image,profile}) => {
  const { isLoggedIn, token, userData } = useSelector((state: RootState) => state.auth);
  const firstName = userData?.user?.firstName || userData?.data?.firstName;
  const lastName = userData?.user?.lastName || userData?.data?.lastName;

  const getInitials = () => {
    if (!firstName && !lastName) return '';
    const firstInitial = firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = lastName?.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial;
  };
  return (
    <TouchableOpacity
      className="h-14 w-14 rounded-full "
      onPress={() => router.push('(routes)/profile' as any)}>
      <LinearGradient
        colors={['#815BF5', '#FC8929']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: '95%',
          height: '95%',
          borderRadius: 50, // Ensure the gradient has the same border radius
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        { profile ? (
          <Image
            className="h-12 w-12 rounded-full border-4 border-primary"
            source={{ uri: image ? image :profile}}
          />
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-full border-4 border-primary bg-[#8a75c8]">
            <Text className="text-lg font-bold text-[#6648c2]">
              {getInitials()}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
export default ProfileButton;