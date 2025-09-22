import { Ionicons } from '@expo/vector-icons';
import { TextInput, View } from 'react-native'

interface SearchBoxProps {
  value: string;
  onChangeText: (text: string) => void;
}

const SearchBox = ({
  value,
  onChangeText,
}: SearchBoxProps) => {
  return (
    <View className='w-full flex-row items-center bg-white rounded-3xl px-3 py-2 shadow'>
      <Ionicons name="search" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
      
      <TextInput
        placeholder='Search...'
        value={value}
        onChangeText={onChangeText}
        className='flex-1 py-1 text-gray-800'
        placeholderTextColor="#9CA3AF"
        style={{ fontSize: 16 }}
      />
    </View>
  )
}

export default SearchBox