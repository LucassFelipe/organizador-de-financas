import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { useRef } from "react"
import { Animated, View } from "react-native"

type Props = {
  children: React.ReactNode
  onSwipe: (direcao: number) => void
}

export default function SwipeableArea({ children, onSwipe }: Props) {
  const tx = useRef(new Animated.Value(0)).current

  const g = Gesture.Pan()
    .onUpdate((e) => {
      tx.setValue(e.translationX * 0.4)
    })
    .onEnd((e) => {
      if (e.translationX < -60) onSwipe(1)
      else if (e.translationX > 60) onSwipe(-1)
      Animated.timing(tx, { toValue: 0, duration: 150, useNativeDriver: true }).start()
    })

  return (
    <GestureDetector gesture={g}>
      <View className="flex-1">
        <Animated.View style={{ transform: [{ translateX: tx }] }} className="flex-1">
          {children}
        </Animated.View>
      </View>
    </GestureDetector>
  )
}
