/* https://github.com/gorhom/react-native-bottom-sheet/blob/master/src/components/bottomSheetBackdrop/BottomSheetBackdrop.tsx */

import Animated, {
	Extrapolate,
	interpolate,
	runOnJS,
	useAnimatedGestureHandler,
	useAnimatedReaction,
	useAnimatedStyle
} from 'react-native-reanimated'
import {
	DEFAULT_APPEARS_ON_INDEX,
	DEFAULT_DISAPPEARS_ON_INDEX,
	DEFAULT_ENABLE_TOUCH_THROUGH,
	DEFAULT_OPACITY,
	DEFAULT_PRESS_BEHAVIOR
} from './constants'
import React, { memo, useCallback, useMemo, useRef } from 'react'
import {
	TapGestureHandler,
	TapGestureHandlerGestureEvent
} from 'react-native-gesture-handler'

import type { BottomSheetDefaultBackdropProps } from './types'
import { styles } from './styles'
import { useBottomSheet } from '@gorhom/bottom-sheet'

const BottomSheetBackdropComponent = ({
	animatedIndex,
	opacity = DEFAULT_OPACITY,
	appearsOnIndex = DEFAULT_APPEARS_ON_INDEX,
	disappearsOnIndex = DEFAULT_DISAPPEARS_ON_INDEX,
	enableTouchThrough = DEFAULT_ENABLE_TOUCH_THROUGH,
	pressBehavior = DEFAULT_PRESS_BEHAVIOR,
	style,
	children
}: BottomSheetDefaultBackdropProps) => {
	// #region hooks
	const { snapToIndex, close } = useBottomSheet()
	// #endregion

	// #region variables
	const containerRef = useRef<Animated.View>(null)
	const pointerEvents = enableTouchThrough ? 'none' : 'auto'
	// #endregion

	// #region callbacks
	const handleOnPress = useCallback(() => {
		if (pressBehavior === 'close')
			close()
		else if (pressBehavior === 'collapse')
			snapToIndex(disappearsOnIndex as number)
		else if (typeof pressBehavior === 'number')
			snapToIndex(pressBehavior)
	}, [snapToIndex, close, disappearsOnIndex, pressBehavior])
	const handleContainerTouchability = useCallback(
		(shouldDisableTouchability: boolean) => {
			if (!containerRef.current)
				return

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			containerRef.current.setNativeProps({
				pointerEvents: shouldDisableTouchability ? 'none' : 'auto'
			})
		},
		[]
	)
	// #endregion

	// #region tap gesture
	const gestureHandler = useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
		onFinish: () => {
			runOnJS(handleOnPress)()
		}
	}, [handleOnPress])
	// #endregion

	// #region styles
	const containerAnimatedStyle = useAnimatedStyle(() => ({
		opacity: interpolate(
			animatedIndex.value,
			[-1, disappearsOnIndex, appearsOnIndex],
			[0, 0, opacity],
			Extrapolate.CLAMP
		),
		flex: 1
	}))
	const containerStyle = useMemo(
		() => [styles.container, style, containerAnimatedStyle],
		[style, containerAnimatedStyle]
	)
	// #endregion

	// #region effects
	useAnimatedReaction(
		// keifufu: Hotfix for https://github.com/gorhom/react-native-bottom-sheet/issues/807
		() => animatedIndex.value <= (disappearsOnIndex + 0.5),
		(shouldDisableTouchability, previous) => {
			if (shouldDisableTouchability === previous)
				return

			runOnJS(handleContainerTouchability)(shouldDisableTouchability)
		},
		[disappearsOnIndex]
	)
	// #endregion

	// eslint-disable-next-line no-negated-condition
	return pressBehavior !== 'none' ? (
		<TapGestureHandler onGestureEvent={gestureHandler}>
			<Animated.View
				ref={containerRef}
				style={containerStyle}
				accessible={true}
				accessibilityRole='button'
				accessibilityLabel='Bottom Sheet backdrop'
				accessibilityHint={`Tap to ${
					typeof pressBehavior === 'string' ? pressBehavior : 'move'
				} the Bottom Sheet`}
			>
				{children}
			</Animated.View>
		</TapGestureHandler>
	) : (
		<Animated.View
			ref={containerRef}
			pointerEvents={pointerEvents}
			style={containerStyle}
		>
			{children}
		</Animated.View>
	)
}

const BottomSheetBackdrop = memo(BottomSheetBackdropComponent)
BottomSheetBackdrop.displayName = 'BottomSheetBackdrop'

export default BottomSheetBackdrop