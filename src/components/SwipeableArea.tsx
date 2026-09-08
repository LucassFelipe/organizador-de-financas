import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { View } from "react-native"

type Props = {
  children: React.ReactNode
  onSwipe: (direcao: number) => void
}

export default function SwipeableArea({ children, onSwipe }: Props) {
  const translateX = useSharedValue(0)

  const estilo = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const gesto = Gesture.Pan()
    .activeOffsetX([-30, 30])
    .onUpdate((e) => {
      translateX.value = e.translationX * 0.3
    })
    .onEnd((e) => {
      if (e.translationX < -50) onSwipe(1)
      else if (e.translationX > 50) onSwipe(-1)
      translateX.value = withTiming(0, { duration: 200 })
    })

  return (
    <GestureDetector gesture={gesto}>
      <View className="flex-1">
        <Animated.View style={estilo} className="flex-1">
          {children}
        </Animated.View>
      </View>
    </GestureDetector>
  )
}
