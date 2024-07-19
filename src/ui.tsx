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