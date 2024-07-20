import "tldraw/tldraw.css";
import { Tldraw, track, useEditor } from "tldraw";
import { useYjsStore } from "./useYjsStore";
import { SocialShapeUtil } from "./SocialShapeUtil";
import { SocialShapeTool } from "./SocialShapeTool";
import { CustomToolbar, overrides } from "./ui";
import { registerDefaultPropagators } from "./propagators/ScopedPropagators";
import { PromptShape } from "./PromptShape";
import { PromptShapeTool } from "./PromptTool";
import { CustomMainMenu } from "./CustomMainMenu";

const shapeUtils = [SocialShapeUtil, PromptShape];
const tools = [SocialShapeTool, PromptShapeTool];


const HOST_URL = import.meta.env.DEV
	? "ws://localhost:1234"
	: import.meta.env.VITE_PRODUCTION_URL.replace("https://", "ws://"); // remove protocol just in case

export default function Canvas() {
	const roomId =
		new URLSearchParams(window.location.search).get("room") || "2024";
	const store = useYjsStore({
		roomId: roomId,
		hostUrl: HOST_URL,
		shapeUtils: shapeUtils,
	});

	return (
		<div className="tldraw__editor">
			<Tldraw
				autoFocus
				store={store}
				shapeUtils={shapeUtils}
				tools={tools}
				overrides={overrides}
				onMount={(editor) => {
					//@ts-ignore
					editor.getStateDescendant('select.idle').handleDoubleClickOnCanvas = () => void null;

					registerDefaultPropagators(editor)

				}}
				components={{
					SharePanel: NameEditor,
					Toolbar: CustomToolbar,
					MainMenu: CustomMainMenu,
				}}
			/>
		</div>
	);
}

const NameEditor = track(() => {
	const editor = useEditor();
	const { color, name } = editor.user.getUserPreferences();

	function randomName(): string {
		const firstNames = ['Boba', 'Zap', 'Fizz', 'Glorp', 'Squish', 'Blip', 'Floof', 'Ziggy', 'Quark', 'Noodle', 'AI'];
		const lastNames = ['Bubbles', 'Zoomers', 'Wiggles', 'Snazzle', 'Boop', 'Fizzle', 'Wobble', 'Giggle', 'Squeak', 'Noodle', 'Palace'];
		return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
	}

	function randomHexColor(): string {
		return `#${Math.floor(Math.random() * 16777215).toString(16)}`
	}

	const userPrefs = editor.user.getUserPreferences()

	if (userPrefs.name === "New User") {
		editor.user.updateUserPreferences({
			name: randomName(),
			color: randomHexColor()
		})
	}

	return (
		<div
			style={{
				// TODO: style this properly and consistently with tldraw
				pointerEvents: "all",
				display: "flex",
				width: "160px",
				margin: "4px 8px",
				border: "none",
			}}
		>
			<input
				style={{
					borderRadius: "9px 0px 0px 9px",
					width: '30px',
					height: '30px',
					border: "none",
					backgroundColor: "white",
					boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
					appearance: "none",
					WebkitAppearance: "none",
					cursor: "pointer",
					overflow: "hidden",
				}}
				type="color"
				value={color}
				onChange={(e) => {
					editor.user.updateUserPreferences({
						color: e.currentTarget.value,
					});
				}}
			/>
			<input
				style={{
					width: "100%",
					borderRadius: "0px 9px 9px 0px",
					border: "none",
					backgroundColor: "white",
					boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
				}}
				value={name}
				onChange={(e) => {
					editor.user.updateUserPreferences({
						name: e.currentTarget.value,
					});
				}}
			/>
		</div>
	);
});
