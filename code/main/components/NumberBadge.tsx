import { Text, View } from 'react-native';

export default function NumberBadge({ n }: { n: number }) {
  return (
    <View className="w-10 h-10 rounded-full bg-white items-center justify-center border border-pink-500 shadow-md">
      <Text className="text-black font-bold">{n}</Text>
    </View>
  );
}
