export const storyBookComponents: StoryBookItem[] = []

type ComponentFuncType = () => JSX.Element
export type StoryBookItem = {
	component: ComponentFuncType
	name: string
}

/**
 * `type` is normally the component itself, whose name titles the story. Pass a
 * string instead for a component that has no name to read: `memo()` and
 * `forwardRef()` hand back an object rather than a function, so `.name` is
 * undefined and the story sat in the gallery untitled.
 */
export const createStory = (
	type: Function | string,
	storyComponent: ComponentFuncType
) => {
	const data: StoryBookItem = {
		component: storyComponent,
		name: typeof type === 'string' ? type : type.name,
	}
	if (!data) return
	storyBookComponents.push(data)
}
