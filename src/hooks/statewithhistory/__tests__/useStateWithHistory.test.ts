import { renderHook, act } from '@testing-library/react'
import { useStateWithHistory } from '../useStateWithHistory'

describe('useStateWithHistory', () => {
	beforeEach(() => {
		jest.useFakeTimers({ now: new Date('2024-01-01T00:00:00Z').getTime() })
	})

	afterEach(() => {
		jest.useRealTimers()
	})

	describe('initialization', () => {
		it('should initialize with the provided value', () => {
			const { result } = renderHook(() => useStateWithHistory('initial'))

			expect(result.current.state).toBe('initial')
		})

		it('should initialize with undefined', () => {
			const { result } = renderHook(() => useStateWithHistory(undefined))

			expect(result.current.state).toBeUndefined()
		})

		it('should initialize with null', () => {
			const { result } = renderHook(() => useStateWithHistory(null))

			expect(result.current.state).toBeNull()
		})

		it('should initialize with an object', () => {
			const initialValue = { name: 'test', count: 0 }
			const { result } = renderHook(() => useStateWithHistory(initialValue))

			expect(result.current.state).toEqual(initialValue)
		})

		it('should not have undo/redo available initially', () => {
			const { result } = renderHook(() => useStateWithHistory('initial'))

			expect(result.current.hasUndo).toBe(false)
			expect(result.current.hasRedo).toBe(false)
		})
	})

	describe('setState', () => {
		it('should update state with a new value', () => {
			const { result } = renderHook(() => useStateWithHistory('initial'))

			act(() => {
				result.current.setState('updated')
			})

			expect(result.current.state).toBe('updated')
		})

		it('should update state with a function', () => {
			const { result } = renderHook(() => useStateWithHistory(5))

			act(() => {
				result.current.setState((prev) => (prev || 0) + 10)
			})

			expect(result.current.state).toBe(15)
		})

		it('should work with complex objects', () => {
			const { result } = renderHook(() => useStateWithHistory({ name: 'John', age: 30 }))

			act(() => {
				result.current.setState({ name: 'Jane', age: 25 })
			})

			expect(result.current.state).toEqual({ name: 'Jane', age: 25 })
		})

		it('should enable undo after setState', () => {
			const { result } = renderHook(() => useStateWithHistory('initial'))

			act(() => {
				jest.advanceTimersByTime(400) // Wait > 300ms for separate history entry
				result.current.setState('updated')
			})

			expect(result.current.hasUndo).toBe(true)
		})

		it('should keep setState function reference stable', () => {
			const { result, rerender } = renderHook(() => useStateWithHistory('initial'))

			const firstSetState = result.current.setState

			act(() => {
				result.current.setState('updated')
			})

			rerender()

			const secondSetState = result.current.setState

			expect(firstSetState).toBe(secondSetState)
		})
	})

	describe('undo', () => {
		it('should undo the last change', () => {
			const { result } = renderHook(() => useStateWithHistory('initial'))

			act(() => {
				jest.advanceTimersByTime(400)
				result.current.setState('updated')
			})

			expect(result.current.state).toBe('updated')

			act(() => {
				result.current.undo()
			})

			expect(result.current.state).toBe('initial')
		})

		it('should undo multiple changes', () => {
			const { result } = renderHook(() => useStateWithHistory(0))

			act(() => {
				jest.advanceTimersByTime(400)
				result.current.setState(1)
				jest.advanceTimersByTime(400)
				result.current.setState(2)
				jest.advanceTimersByTime(400)
				result.current.setState(3)
			})

			expect(result.current.state).toBe(3)

			act(() => {
				result.current.undo()
			})
			expect(result.current.state).toBe(2)

			act(() => {
				result.current.undo()
			})
			expect(result.current.state).toBe(1)

			act(() => {
				result.current.undo()
			})
			expect(result.current.state).toBe(0)
		})

		it('should not undo beyond initial state', () => {
			const { result } = renderHook(() => useStateWithHistory('initial'))

			act(() => {
				jest.advanceTimersByTime(400)
				result.current.setState('updated')
			})

			act(() => {
				result.current.undo()
				result.current.undo() // Try to undo past the beginning
			})

			expect(result.current.state).toBe('initial')
			expect(result.current.hasUndo).toBe(false)
		})

		it('should enable redo after undo', () => {
			const { result } = renderHook(() => useStateWithHistory('initial'))

			act(() => {
				jest.advanceTimersByTime(400)
				result.current.setState('updated')
			})

			act(() => {
				result.current.undo()
			})

			expect(result.current.hasRedo).toBe(true)
		})
	})

	describe('redo', () => {
		it('should redo the last undone change', () => {
			const { result } = renderHook(() => useStateWithHistory('initial'))

			act(() => {
				jest.advanceTimersByTime(400)
				result.current.setState('updated')
			})

			act(() => {
				result.current.undo()
			})

			expect(result.current.state).toBe('initial')

			act(() => {
				result.current.redo()
			})

			expect(result.current.state).toBe('updated')
		})

		it('should redo multiple changes', () => {
			const { result } = renderHook(() => useStateWithHistory(0))

			act(() => {
				jest.advanceTimersByTime(400)
				result.current.setState(1)
				jest.advanceTimersByTime(400)
				result.current.setState(2)
				jest.advanceTimersByTime(400)
				result.current.setState(3)
			})

			act(() => {
				result.current.undo()
				result.current.undo()
			})

			expect(result.current.state).toBe(1)

			act(() => {
				result.current.redo()
			})
			expect(result.current.state).toBe(2)

			act(() => {
				result.current.redo()
			})
			expect(result.current.state).toBe(3)
		})

		it('should not redo beyond the latest state', () => {
			const { result } = renderHook(() => useStateWithHistory('initial'))

			act(() => {
				jest.advanceTimersByTime(400)
				result.current.setState('updated')
			})

			act(() => {
				result.current.undo()
				result.current.redo()
				result.current.redo() // Try to redo past the end
			})

			expect(result.current.state).toBe('updated')
			expect(result.current.hasRedo).toBe(false)
		})

		it('should clear redo history when setState is called', () => {
			const { result } = renderHook(() => useStateWithHistory('initial'))

			act(() => {
				jest.advanceTimersByTime(400)
				result.current.setState('updated')
				jest.advanceTimersByTime(400)
				result.current.setState('another')
			})

			act(() => {
				result.current.undo()
			})

			expect(result.current.hasRedo).toBe(true)

			act(() => {
				jest.advanceTimersByTime(400)
				result.current.setState('new branch')
			})

			expect(result.current.hasRedo).toBe(false)
		})
	})

	describe('reset', () => {
		it('should clear history and keep current state', () => {
			const { result } = renderHook(() => useStateWithHistory('initial'))

			act(() => {
				jest.advanceTimersByTime(400)
				result.current.setState('step1')
				jest.advanceTimersByTime(400)
				result.current.setState('step2')
				jest.advanceTimersByTime(400)
				result.current.setState('step3')
			})

			expect(result.current.hasUndo).toBe(true)

			act(() => {
				result.current.reset()
			})

			expect(result.current.state).toBe('step3')
			expect(result.current.hasUndo).toBe(false)
			expect(result.current.hasRedo).toBe(false)
		})

		it('should work after undo', () => {
			const { result } = renderHook(() => useStateWithHistory('initial'))

			act(() => {
				jest.advanceTimersByTime(400)
				result.current.setState('step1')
				jest.advanceTimersByTime(400)
				result.current.setState('step2')
			})

			act(() => {
				result.current.undo()
			})

			expect(result.current.state).toBe('step1')

			act(() => {
				result.current.reset()
			})

			expect(result.current.state).toBe('step1')
			expect(result.current.hasUndo).toBe(false)
			expect(result.current.hasRedo).toBe(false)
		})
	})

	describe('time-based history merging', () => {

		it('should merge changes within 300ms into a single history entry', () => {
			const { result } = renderHook(() => useStateWithHistory('initial'))

			act(() => {
				// First create a separate entry
				jest.advanceTimersByTime(400)
				result.current.setState('step1')
				// Then merge the next change into step1
				jest.advanceTimersByTime(100) // Less than 300ms
				result.current.setState('step2')
			})

			// Should only have one undo step since step2 merged into step1
			expect(result.current.hasUndo).toBe(true)

			act(() => {
				result.current.undo()
			})

			expect(result.current.state).toBe('initial')
			expect(result.current.hasUndo).toBe(false)
		})

		it('should create separate history entries for changes > 300ms apart', () => {
			const { result } = renderHook(() => useStateWithHistory('initial'))

			act(() => {
				jest.advanceTimersByTime(400)
				result.current.setState('step1')
				jest.advanceTimersByTime(400) // More than 300ms
				result.current.setState('step2')
			})

			// Should have two undo steps since changes were > 300ms apart
			expect(result.current.hasUndo).toBe(true)

			act(() => {
				result.current.undo()
			})
			expect(result.current.state).toBe('step1')

			act(() => {
				result.current.undo()
			})
			expect(result.current.state).toBe('initial')
		})
	})

	describe('edge cases', () => {
		it('should handle rapid setState calls', () => {
			const { result } = renderHook(() => useStateWithHistory(0))

			act(() => {
				jest.advanceTimersByTime(400)
				for (let i = 1; i <= 100; i++) {
					result.current.setState(i)
					jest.advanceTimersByTime(400) // Each change gets separate history entry
				}
			})

			expect(result.current.state).toBe(100)
			expect(result.current.hasUndo).toBe(true)
		})

		it('should handle setState with function using current state', () => {
			const { result } = renderHook(() => useStateWithHistory({ count: 0 }))

			act(() => {
				jest.advanceTimersByTime(400)
				result.current.setState((prev) => ({ count: (prev?.count || 0) + 1 }))
				jest.advanceTimersByTime(400)
				result.current.setState((prev) => ({ count: (prev?.count || 0) + 1 }))
				jest.advanceTimersByTime(400)
				result.current.setState((prev) => ({ count: (prev?.count || 0) + 1 }))
			})

			expect(result.current.state.count).toBe(3)
		})

		it('should maintain callback stability across state changes', () => {
			const { result, rerender } = renderHook(() => useStateWithHistory('initial'))

			const callbacks = {
				setState: result.current.setState,
				undo: result.current.undo,
				redo: result.current.redo,
				reset: result.current.reset,
			}

			act(() => {
				jest.advanceTimersByTime(400)
				result.current.setState('updated')
			})

			rerender()

			expect(result.current.setState).toBe(callbacks.setState)
			expect(result.current.undo).toBe(callbacks.undo)
			expect(result.current.redo).toBe(callbacks.redo)
			expect(result.current.reset).toBe(callbacks.reset)
		})
	})
})
