import { useCallback, useRef, useState } from 'react'

type InitialValueType<T> = T | ((prev?: T) => T)

type ReturnValueType<T> = {
	state: T
	setState: (value: InitialValueType<T>) => void
	undo: () => void
	redo: () => void
	hasUndo: boolean
	hasRedo: boolean
	reset: () => void
}

type HistoryPair<T> = {
	value: InitialValueType<T>
	timestamp: number
}

/**
 * This hook works like useState, but also holds a history of the values.
 * It allows you to undo and redo the changes.
 * Function 'reset' is able to clear the history.
 */
export const useStateWithHistory: <T>(
	initialValue: InitialValueType<T>
) => ReturnValueType<T> = <T>(initialValue: InitialValueType<T>) => {
	const [state, _setState] = useState<T>(initialValue)
	const [history, setHistory] = useState<HistoryPair<T>[]>(
		initialValue !== undefined && initialValue !== null
			? [
					{
						value: initialValue,
						timestamp: Date.now(),
					},
			  ]
			: []
	)
	const [pointer, setPointer] = useState<number>(
		initialValue !== undefined && initialValue !== null ? 0 : -1
	)

	// Use refs to track current values without including them in dependencies
	const stateRef = useRef(state)
	const historyRef = useRef(history)
	const pointerRef = useRef(pointer)

	stateRef.current = state
	historyRef.current = history
	pointerRef.current = pointer

	/**
	 * This function is used to set the state.
	 */
	const setState: (value: InitialValueType<T>) => void = useCallback(
		(value: InitialValueType<T>) => {
			let valueToAdd = value
			if (typeof value === 'function') {
				valueToAdd = (value as (prev?: T) => T)(stateRef.current)
			}

			// Check if previous value is time distance is less than 300ms
			// If so, remove the last value from history
			const TIME_DISTANCE = 300
			const removePrevValue =
				historyRef.current[pointerRef.current] &&
				Date.now() - historyRef.current[pointerRef.current].timestamp <
					TIME_DISTANCE

			const newItem = {
				value: valueToAdd,
				timestamp: Date.now(),
			}

			const newHistory = [
				...historyRef.current.slice(0, pointerRef.current + (removePrevValue ? 0 : 1)),
				newItem,
			]
			const newPointer = pointerRef.current + (removePrevValue ? 0 : 1)

			setHistory(newHistory)
			setPointer(newPointer)
			_setState(value)

			// Synchronous updates for immediate use
			historyRef.current = newHistory
			pointerRef.current = newPointer
		},
		[]
	)

	/**
	 * This function is used to undo the last change
	 */
	const undo: () => void = useCallback(() => {
		if (pointerRef.current <= 0) return
		const newPointer = pointerRef.current - 1
		_setState(historyRef.current[newPointer].value)
		setPointer(newPointer)
		pointerRef.current = newPointer // Synchronous update for immediate use
	}, [_setState])

	/**
	 * This function is used to redo the last change
	 *
	 */
	const redo: () => void = useCallback(() => {
		if (pointerRef.current + 1 >= historyRef.current.length) return
		const newPointer = pointerRef.current + 1
		_setState(historyRef.current[newPointer].value)
		setPointer(newPointer)
		pointerRef.current = newPointer // Synchronous update for immediate use
	}, [_setState])

	/**
	 * This function clear the history and set last value as current
	 */
	const reset = useCallback(() => {
		setHistory((prev) => [prev.at(-1)!])
		setPointer(0)
	}, [])

	return {
		state,
		setState,
		undo,
		redo,
		hasUndo: pointer > 0,
		hasRedo: pointer + 1 < history.length,
		reset,
	}
}
