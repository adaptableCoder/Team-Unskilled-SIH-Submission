import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AnimatedTransport({ type = 'train' }: { type?: 'train' | 'air' | 'car' | 'luggage' }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [anim]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 20] });

  const iconName = type === 'train' ? 'train' : type === 'air' ? 'airplane' : type === 'car' ? 'car' : 'briefcase';

  return (
    <Animated.View style={{ transform: [{ translateX }] }}>
      <MaterialCommunityIcons name={iconName as any} size={24} color="#1f2937" />
    </Animated.View>
  );
}
