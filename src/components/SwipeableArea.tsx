import { useRef } from "react"
import { View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"

type Props = {
  children: React.ReactNode
  onSwipe: (direcao: number) => void
}

export default function SwipeableArea({ children, onSwipe }: Props) {
  const startX = useRef(0)

  return (
    <View
      className="flex-1"
      onStartShouldSetResponder={() => true}
      onResponderGrant={(e) => { startX.current = e.nativeEvent.pageX }}
      onResponderRelease={(e) => {
        const diff = e.nativeEvent.pageX - startX.current
        if (diff < -60) onSwipe(1)
        else if (diff > 60) onSwipe(-1)
      }}
    >
      {children}
    </View>
  )
}
