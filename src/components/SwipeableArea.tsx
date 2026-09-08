import { useRef } from "react"
import { Animated, View } from "react-native"

type Props = {
  children: React.ReactNode
  onSwipe: (direcao: number) => void
}

export default function SwipeableArea({ children, onSwipe }: Props) {
  const tx = useRef(new Animated.Value(0)).current
  const startX = useRef(0)

  return (
    <View
      className="flex-1"
      onStartShouldSetResponder={() => true}
      onResponderGrant={(e) => { startX.current = e.nativeEvent.pageX }}
      onResponderMove={(e) => {
        const diff = e.nativeEvent.pageX - startX.current
        tx.setValue(diff * 0.4)
      }}
      onResponderRelease={(e) => {
        const diff = e.nativeEvent.pageX - startX.current
        if (diff < -60) onSwipe(1)
        else if (diff > 60) onSwipe(-1)
        Animated.spring(tx, { toValue: 0, useNativeDriver: true }).start()
      }}
    >
      <Animated.View style={{ transform: [{ translateX: tx }] }} className="flex-1">
        {children}
      </Animated.View>
    </View>
  )
}
