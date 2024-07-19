import {
	TLUiOverrides,
	useTools,
	useIsToolSelected,
	DefaultToolbar,
	TldrawUiMenuItem,
	DefaultToolbarContent,
	DefaultToolbarProps,
} from "tldraw"

export const overrides: TLUiOverrides = {
	tools(editor, tools) {
		return {
			...tools,
			social: {
				id: "social",
				name: "Social",
				icon: "color",
				kbd: "s",
				label: "Social",
				onSelect: () => {
					editor.setCurrentTool("social")
				},
			},
			prompt: {
				id: "prompt",
				name: "Prompt",
				icon: "code",
				kbd: "p",
				label: "Prompt",
				onSelect: () => {
					editor.setCurrentTool("prompt")
				},
			},
		}
	},
}

export const CustomToolbar = (props: DefaultToolbarProps) => {
	const tools = useTools()
	const isSocialSelected = useIsToolSelected(tools.social)
	return (
		<DefaultToolbar {...props}>
			<TldrawUiMenuItem {...tools.social} isSelected={isSocialSelected} />
			<DefaultToolbarContent />
		</DefaultToolbar>
	)
}