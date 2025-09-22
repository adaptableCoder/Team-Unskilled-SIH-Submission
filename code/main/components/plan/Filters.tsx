"use client"
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { FlatList, Modal, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'

type FilterKey = 'date' | 'activity' | 'budget' | 'distance'

export default function Filters() {
  const [filterDate, setFilterDate] = useState<string>('Any')
  const [filterActivity, setFilterActivity] = useState<string>('Any')
  const [filterBudget, setFilterBudget] = useState<string>('Any')
  const [filterDistance, setFilterDistance] = useState<string>('Any')
  const [showFilterModal, setShowFilterModal] = useState<null | FilterKey>(null)

  const FILTER_OPTIONS: Record<FilterKey, string[]> = {
    date: ['Any', 'Weekend', 'Next Week', 'Next Month'],
    activity: ['Any', 'Sightseeing', 'Adventure', 'Relaxation', 'Cultural'],
    budget: ['Any', 'Budget', 'Midrange', 'Luxury'],
    distance: ['Any', '<50 km', '50-200 km', '>200 km']
  }

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12, gap: 8 }} className="mt-3">
        <View style={{ minWidth: 120 }} className="mr-2">
          <Text className="text-xs text-gray-400 mb-1">Date</Text>
          <TouchableOpacity className="rounded-full border border-white/5 bg-white p-3 flex-row items-center justify-between" onPress={() => setShowFilterModal('date')}>
            <View>
              <Text className="text-sm">{filterDate === 'Any' ? 'Any' : filterDate}</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={{ minWidth: 140 }} className="mx-1">
          <Text className="text-xs text-gray-400 mb-1">Activity</Text>
          <TouchableOpacity className="rounded-full border border-white/5 bg-white p-3 flex-row items-center justify-between" onPress={() => setShowFilterModal('activity')}>
            <View>
              <Text className="text-sm">{filterActivity === 'Any' ? 'Any' : filterActivity}</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={{ minWidth: 120 }} className="mx-1">
          <Text className="text-xs text-gray-400 mb-1">Budget</Text>
          <TouchableOpacity className="rounded-full border border-white/5 bg-white p-3 flex-row items-center justify-between" onPress={() => setShowFilterModal('budget')}>
            <View>
              <Text className="text-sm">{filterBudget === 'Any' ? 'Any' : filterBudget}</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={{ minWidth: 140 }} className="ml-2">
          <Text className="text-xs text-gray-400 mb-1">Distance</Text>
          <TouchableOpacity className="rounded-full border border-white/5 bg-white p-3 flex-row items-center justify-between" onPress={() => setShowFilterModal('distance')}>
            <View>
              <Text className="text-sm">{filterDistance === 'Any' ? 'Any' : filterDistance}</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Filter Modal (date/activity/budget/distance) */}
      <Modal visible={showFilterModal !== null} transparent animationType="slide" onRequestClose={() => setShowFilterModal(null)}>
        <TouchableWithoutFeedback onPress={() => setShowFilterModal(null)}>
          <View className="flex-1 bg-black/40 justify-end">
            <View className="bg-white p-4 rounded-t-xl max-h-3/5">
              <Text className="text-lg font-semibold mb-2">{showFilterModal ? showFilterModal.toUpperCase() : ''}</Text>
              <FlatList
                data={showFilterModal ? FILTER_OPTIONS[showFilterModal] : []}
                keyExtractor={(item) => item}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity className="py-3" onPress={() => {
                    if (!showFilterModal) return
                    if (showFilterModal === 'date') setFilterDate(item)
                    if (showFilterModal === 'activity') setFilterActivity(item)
                    if (showFilterModal === 'budget') setFilterBudget(item)
                    if (showFilterModal === 'distance') setFilterDistance(item)
                    setShowFilterModal(null)
                  }}>
                    <Text>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  )
}
