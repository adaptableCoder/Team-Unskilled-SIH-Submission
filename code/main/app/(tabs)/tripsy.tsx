import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Animated, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import LanguageSelector from '@/components/tripsy/LanguageSelector'

interface Message {
  type: 'user' | 'ai'
  text: string
  id: number
}

interface TranslationResult {
  hindi: string
  pronunciation: string
}

const Tripsy = () => {
  const router = useRouter()
  const [input, setInput] = useState<string>('')
  const [focused, setFocused] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTranslateMode, setIsTranslateMode] = useState<boolean>(false)
  const [translationInput, setTranslationInput] = useState<string>('')
  const [translationResult, setTranslationResult] = useState<TranslationResult>({ hindi: '', pronunciation: '' })
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const placeholderMessages = [
    'Translate: "Where is the nearest pharmacy?"',
    'Try: "What are North Goa special Food Items?"',
    'Ask Tripsy to summarize your travel plan',
    'Snap a photo to translate signs instantly'
  ]

  const indexRef = useRef<number>(0)
  const [messageIndex, setMessageIndex] = useState<number>(0)
  const opacity = useRef(new Animated.Value(1)).current
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0)
  const scrollViewRef = useRef<ScrollView>(null)

  // Typing indicator component
  const TypingIndicator = () => {
    const dot1 = useRef(new Animated.Value(0)).current
    const dot2 = useRef(new Animated.Value(0)).current
    const dot3 = useRef(new Animated.Value(0)).current

    useEffect(() => {
      const animateDots = () => {
        const createDotAnimation = (dot: Animated.Value, delay: number) => {
          return Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(dot, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(dot, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ])
          )
        }

        Animated.parallel([
          createDotAnimation(dot1, 0),
          createDotAnimation(dot2, 200),
          createDotAnimation(dot3, 400),
        ]).start()
      }

      animateDots()
    }, [dot1, dot2, dot3])

    return (
      <View className="flex-row justify-start mb-4">
        <View className="bg-white rounded-2xl rounded-bl-md shadow-sm p-4">
          <View className="flex-row items-center gap-1">
            <Animated.View
              style={{
                opacity: dot1,
                transform: [{ scale: dot1 }],
              }}
              className="w-2 h-2 bg-gray-400 rounded-full"
            />
            <Animated.View
              style={{
                opacity: dot2,
                transform: [{ scale: dot2 }],
              }}
              className="w-2 h-2 bg-gray-400 rounded-full"
            />
            <Animated.View
              style={{
                opacity: dot3,
                transform: [{ scale: dot3 }],
              }}
              className="w-2 h-2 bg-gray-400 rounded-full"
            />
          </View>
        </View>
      </View>
    )
  }

  // Hardcoded AI responses
  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    
    if (message.includes('goa') && message.includes('food')) {
      return "Here are some special North Goa food items you must try:\n\n🍤 Prawn Curry Rice\n🐟 Fish Curry\n🥘 Vindaloo\n🍖 Chorizo Pao\n🥥 Bebinca (dessert)\n🍻 Feni (local drink)\n\nWould you like restaurant recommendations for these dishes?"
    }
    
    if (message.includes('pharmacy') || message.includes('medicine')) {
      return "To find the nearest pharmacy:\n\n📍 Look for signs with 'Medical Store' or 'Chemist'\n🗣️ Ask locals: 'Paas mein medical store kahan hai?'\n📱 Use Google Maps and search 'pharmacy near me'\n🏥 Most are open 24/7 in tourist areas\n\nNeed help with any specific medication?"
    }
    
    if (message.includes('travel plan') || message.includes('itinerary')) {
      return "I'd be happy to help with your travel plan! Here's what I can assist with:\n\n📅 Day-wise itinerary planning\n🏖️ Beach recommendations\n🏛️ Historical sites to visit\n🍴 Restaurant suggestions\n🚗 Transportation options\n💰 Budget planning\n\nWhat specific aspect would you like help with?"
    }
    
    if (message.includes('hello') || message.includes('hi')) {
      return "Hello! 👋 Welcome to Tripsy, your travel AI assistant!\n\nI can help you with:\n• Language translation\n• Local food recommendations\n• Travel planning\n• Finding places nearby\n• Cultural tips\n\nWhat would you like to explore today?"
    }
    
    if (message.includes('thank')) {
      return "You're welcome! 😊 Happy to help make your trip amazing! Feel free to ask me anything else about your travels."
    }
    
    return "That's interesting! I'm here to help with your travel needs. Try asking me about:\n\n• Local food and restaurants\n• Places to visit\n• Language translation\n• Travel tips\n• Emergency services locations\n\nWhat would you like to know more about?"
  }

  // Hardcoded translations
  const getTranslation = (text: string): TranslationResult => {
    const translations: Record<string, TranslationResult> = {
      'hello': { hindi: 'नमस्ते', pronunciation: 'namaste' },
      'how are you': { hindi: 'आप कैसे हैं?', pronunciation: 'aap kaise hain?' },
      'thank you': { hindi: 'धन्यवाद', pronunciation: 'dhanyawad' },
      'where is the bathroom': { hindi: 'बाथरूम कहाँ है?', pronunciation: 'bathroom kahan hai?' },
      'how much does this cost': { hindi: 'इसकी कीमत क्या है?', pronunciation: 'iski keemat kya hai?' },
      'i need help': { hindi: 'मुझे मदद चाहिए', pronunciation: 'mujhe madad chahiye' },
      'where is the nearest pharmacy': { hindi: 'सबसे नजदीकी फार्मेसी कहाँ है?', pronunciation: 'sabse najdeeki pharmacy kahan hai?' },
      'can you help me': { hindi: 'क्या आप मेरी मदद कर सकते हैं?', pronunciation: 'kya aap meri madad kar sakte hain?' }
    }
    
    const lowerText = text.toLowerCase()
    return translations[lowerText] || { hindi: 'अनुवाद उपलब्ध नहीं', pronunciation: 'anuvad uplabdh nahi' }
  }

  const handleSendMessage = (): void => {
    if (input.trim()) {
      const userMessage: Message = { type: 'user', text: input, id: Date.now() }
      
      setMessages(prev => [...prev, userMessage])
      setInput('')
      setIsLoading(true)
      
      // Scroll to bottom after user message is added
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
      
      // Simulate AI response delay
      setTimeout(() => {
        const aiResponse: Message = { type: 'ai', text: getAIResponse(userMessage.text), id: Date.now() + 1 }
        setMessages(prev => [...prev, aiResponse])
        setIsLoading(false)
        
        // Scroll to bottom after AI response
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }, 100)
      }, 1500) // 1.5 second delay
    }
  }

  const handleTranslate = (): void => {
    if (translationInput.trim()) {
      const result = getTranslation(translationInput)
      setTranslationResult(result)
    }
  }

  useEffect(() => {
    const cycle = () => {
      Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
        indexRef.current = (indexRef.current + 1) % placeholderMessages.length
        setMessageIndex(indexRef.current)
        Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }).start()
      })
    }

    const interval = setInterval(() => {
      // only cycle when input is empty and not focused
      if (!focused && input.length === 0 && !isTranslateMode) cycle()
    }, 3500)

    const showOnKeyboard = Keyboard.addListener('keyboardDidShow', (e) => {
      setFocused(true)
      setKeyboardHeight(e.endCoordinates?.height || 0)
    })
    const hideOnKeyboard = Keyboard.addListener('keyboardDidHide', () => {
      setFocused(false)
      setKeyboardHeight(0)
    })

    return () => {
      clearInterval(interval)
      showOnKeyboard.remove()
      hideOnKeyboard.remove()
    }
  }, [opacity, focused, input, placeholderMessages.length, isTranslateMode])

  if (isTranslateMode) {
    return (
      <View className="bg-[#FFF1EF] flex-1 h-[100dvh]">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, flexGrow: 1 }}>
          <View className="mt-6 flex-row justify-between items-center">
            <View className="flex-row gap-2">
              <Image source={require('../../assets/images/tripsy-icon-black.png')} style={{ width: 38, height: 30 }} />
              <View className="flex-col">
                <Text className="text-3xl font-extrabold">Tripsy Translate</Text>
                <Text className="text-[#3f3f3f]">Instant language translation</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => setIsTranslateMode(false)}
              className="p-3 rounded-full bg-pink-500 shadow-lg"
            >
              <View className="flex-row items-center">
                <Ionicons name="chatbubbles" size={20} color="#fff" />
                <Text className="text-white font-semibold ml-2">AI Bot</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Language selection bar */}
          <View className="mt-6">
            <LanguageSelector />
          </View>

          {/* Translation cards */}
          <View className="mt-6 gap-4">
            <View className="rounded-xl p-4 bg-white shadow-2xl">
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-center pb-2">
                  <Text className="text-[#525252] text-2xl">English</Text>
                  <Ionicons name="volume-high" size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
                </View>
                <TouchableOpacity onPress={() => setTranslationInput('')}>
                  <Ionicons name="close" size={18} color="#F87171" />
                </TouchableOpacity>
              </View>
              <View className="border border-white/5 w-full"></View>

              <View className="mt-2">
                <TextInput
                  value={translationInput}
                  onChangeText={setTranslationInput}
                  placeholder="Type text to translate..."
                  className="text-lg min-h-[60px]"
                  multiline
                />
              </View>

              <View className="mt-4 flex-row items-center justify-between">
                <TouchableOpacity className="flex-row items-center">
                  <Ionicons name="mic" size={20} color="#FF6EC7" />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleTranslate}
                  className="rounded-full bg-pink-500 px-4 py-2"
                >
                  <Text className="text-white font-semibold">Translate</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="items-center">
              <Ionicons name="swap-vertical" size={28} color="#C4B5FD" />
            </View>

            <View className="rounded-xl p-4 bg-white shadow-2xl">
              <View className="flex-row justify-between items-start pb-2">
                <View className="flex-row items-center">
                  <Text className="text-[#525252] text-2xl">हिन्दी</Text>
                  <Ionicons name="volume-high" size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
                </View>
              </View>
              <View className="border border-white/5 w-full"></View>

              <View className="mt-2 min-h-[60px] justify-center">
                <Text className="text-lg">
                  {translationResult?.hindi || "Translation will appear here..."}
                </Text>
              </View>
              {translationResult?.pronunciation && (
                <Text className="text-gray-400 mt-2 text-sm italic">
                  {translationResult.pronunciation}
                </Text>
              )}

              <View className="mt-4 flex-row items-center justify-end gap-4">
                <TouchableOpacity>
                  <Ionicons name="copy-outline" size={20} color="#C4B5FD" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="share-social-outline" size={20} color="#C4B5FD" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="star-outline" size={20} color="#C4B5FD" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }

  return (
    <View className="bg-[#FFF1EF] flex-1 h-[100dvh]">
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1" 
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
      >
        <View className="mt-6 flex-row justify-between items-center">
          <View className="flex-row gap-2">
            <Image source={require('../../assets/images/tripsy-icon-black.png')} style={{ width: 38, height: 30 }} />
            <View className="flex-col">
              <Text className="text-3xl font-extrabold">Tripsy</Text>
              <Text className="text-[#3f3f3f] mr-2">Your very own handy Vacation AI {'\n'} assistant</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => setIsTranslateMode(true)}
            className="p-3 rounded-full bg-pink-500 shadow-lg"
          >
            <View className="flex-row items-center">
              <Ionicons name="language" size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">Translate</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Chat Messages */}
        <View className="mt-6 flex-1">
          {messages.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500 text-center text-lg mb-4">
                Welcome! Ask me anything about your travels 🌍
              </Text>
              <View className="gap-2">
                <TouchableOpacity 
                  onPress={() => setInput("What are North Goa special Food Items?")}
                  className="bg-white rounded-full px-6 py-3 shadow-sm border border-pink-100"
                >
                  <Text className="text-center text-gray-700 font-medium">🍤 North Goa Food Items</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setInput("Where is the nearest pharmacy?")}
                  className="bg-white rounded-full px-6 py-3 shadow-sm border border-pink-100"
                >
                  <Text className="text-center text-gray-700 font-medium">💊 Find Pharmacy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setInput("Help me plan my travel itinerary")}
                  className="bg-white rounded-full px-6 py-3 shadow-sm border border-pink-100"
                >
                  <Text className="text-center text-gray-700 font-medium">📅 Travel Planning</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="gap-4 pb-24">
              {messages.map((message) => (
                <View
                  key={message.id}
                  className={`flex-row ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <View
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-pink-500 rounded-br-md'
                        : 'bg-white rounded-bl-md shadow-sm'
                    }`}
                  >
                    <Text
                      className={`${
                        message.type === 'user' ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {message.text}
                    </Text>
                  </View>
                </View>
              ))}
              {isLoading && <TypingIndicator />}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 12, right: 12, bottom: keyboardHeight > 0 ? keyboardHeight : 20 }}>
        <View className="flex-row items-center bg-white rounded-full px-3 py-2 shadow-2xl">
          <View className="flex-1">
            <TextInput
              value={input}
              onChangeText={setInput}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="px-5 py-5 text-base"
              placeholderTextColor="#9CA3AF"
              cursorColor="#9CA3AF"
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
            />

            {input.length === 0 && !focused ? (
              <Animated.View style={{ position: 'absolute', left: 12, right: 0, top: 8, opacity }} pointerEvents="none">
                <Text className="text-black/50 px-2">{placeholderMessages[messageIndex]}</Text>
              </Animated.View>
            ) : null}
          </View>

          <TouchableOpacity onPress={() => router.push('/camera')} className="p-2 rounded-full bg-[#F3F4F6] items-center justify-center shadow-lg">
            <Ionicons name="camera" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity className="p-2 rounded-full bg-[#F3F4F6] ml-2">
            <Ionicons name="mic" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSendMessage} className="p-2 rounded-full bg-pink-500 ml-2 items-center justify-center">
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Tripsy