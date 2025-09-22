import React, { memo } from 'react'
import { View, TextInput, Text } from 'react-native'

type Props = {
  index: number
  name: string
  userId: string
  onChange: (index: number, field: 'name' | 'userId', value: string) => void
  nameError?: string | null
  userIdError?: string | null
}

/**
 * AddMember
 * - Small memoized component that renders two pill-like inputs (name + userId)
 * - Shows small inline error text below each input when passed
 */
const AddMember = memo(function AddMember({
  index,
  name,
  userId,
  onChange,
  nameError,
  userIdError
}: Props) {
  return (
    <View className='w-[95%] mx-auto mt-3 flex-row flex-wrap justify-between items-center'>
      <View style={{ width: '50%' }}>
        <View className='bg-[#ECECEC] rounded-lg px-2 py-4'>
          <TextInput
            placeholder={`Member ${index + 2} Name`}
            value={name}
            onChangeText={(t) => onChange(index, 'name', t)}
            style={{
              fontSize: 14,
              padding: 0,
            }}
            placeholderTextColor={'#6B7280'}
          />
        </View>
        {nameError ? <Text style={{ color: '#DC2626', marginTop: 6, fontSize: 12 }}>{nameError}</Text> : null}
      </View>

      <View style={{ width: '47%' }}>
        <View className='bg-[#ECECEC] rounded-lg px-2 py-4'>
          <TextInput
            placeholder='User ID'
            value={userId}
            onChangeText={(t) => onChange(index, 'userId', t)}
            style={{
              fontSize: 16,
              padding: 0,
            }}
            autoCapitalize='none'
            placeholderTextColor={'#6B7280'}
          />
        </View>
        {userIdError ? <Text style={{ color: '#DC2626', marginTop: 6, fontSize: 12 }}>{userIdError}</Text> : null}
      </View>
    </View>
  )
}, (prev, next) =>
  prev.name === next.name &&
  prev.userId === next.userId &&
  prev.nameError === next.nameError &&
  prev.userIdError === next.userIdError
)

export default AddMember
