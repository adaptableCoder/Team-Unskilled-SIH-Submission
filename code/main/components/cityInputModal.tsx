// LocationPickerModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  KeyboardAvoidingView,
} from "react-native";

type StateItem = {
  id: string;
  name: string;
  type: "state";
  stateCode: string;
};

type CityItem = {
  id: number | string;
  name: string;
  type: "city";
  state?: string;
  stateCode?: string;
};

export type LocationItem = StateItem | CityItem;

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: LocationItem) => void;
  locations: LocationItem[] | null | undefined;
  loading?: boolean;
  placeholder?: string;
  title?: string;
  initialQuery?: string;
  maxResults?: number;
};

export default function LocationPickerModal({
  visible,
  onClose,
  onSelect,
  locations,
  loading = false,
  placeholder = "Search states or cities...",
  title = "Select location",
  initialQuery = "",
  maxResults = 200,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!visible) {
      setQuery("");
      setDebouncedQuery("");
    } else {
      setQuery(initialQuery);
      setDebouncedQuery(initialQuery);
    }
  }, [visible, initialQuery]);

  const filtered = useMemo(() => {
    if (!locations) return [];

    if (!debouncedQuery) {
      return locations.slice(0, maxResults);
    }

    const q = debouncedQuery.toLowerCase();

    return locations
      .filter((loc) => {
        const nameMatch = loc.name.toLowerCase().includes(q);
        const stateMatch =
          "state" in loc && loc.state ? loc.state.toLowerCase().includes(q) : false;
        const stateCodeMatch =
          "stateCode" in loc && loc.stateCode ? loc.stateCode.toLowerCase().includes(q) : false;
        return nameMatch || stateMatch || stateCodeMatch;
      })
      .slice(0, maxResults);
  }, [locations, debouncedQuery, maxResults]);

  const renderItem = ({ item }: { item: LocationItem }) => {
    return (
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          onSelect(item);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Select ${item.name}`}
        style={({ pressed }) => [
          { backgroundColor: pressed ? "rgba(239,246,255,1)" : "transparent" },
        ]}
        className="py-3 px-3 border-b border-gray-100"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-base font-medium">{item.name}</Text>
            <Text className="text-sm text-gray-500 mt-1">
              {item.type === "state" ? "State / UT" : `City${item.state ? ` • ${item.state}` : ""}`}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-center px-4">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-full"
        >
          <View className="bg-white rounded-xl max-h-[85%] overflow-hidden">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">{title}</Text>
              <TouchableOpacity onPress={onClose} accessibilityRole="button">
                <Text className="text-blue-500 text-sm">Close</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="p-3 border-b border-gray-100">
              <TextInput
                placeholder={placeholder}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                accessibilityLabel="Search locations"
                className="bg-gray-100 rounded-md px-3 py-2 h-10 text-base"
                clearButtonMode="while-editing"
              />
            </View>

            {/* Content */}
            <View className="px-2 pb-3 max-h-[520px]">
              {loading ? (
                <View className="py-6 items-center">
                  <ActivityIndicator />
                  <Text className="mt-2 text-gray-500">Loading locations…</Text>
                </View>
              ) : filtered.length === 0 ? (
                <View className="py-6 items-center">
                  <Text className="text-gray-500">No results</Text>
                </View>
              ) : (
                <FlatList
                  data={filtered}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={renderItem}
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={20}
                  maxToRenderPerBatch={20}
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
