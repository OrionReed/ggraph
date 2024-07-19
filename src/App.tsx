import "tldraw/tldraw.css";
import { Tldraw } from "tldraw";
import { useYjsStore } from "./useYjsStore";
import { AgentButton } from "./components/AgentButton";
import { SocialShapeUtil } from "./SocialShapeUtil";
import { SocialShapeTool } from "./SocialShapeTool";
import { CustomToolbar, overrides } from "./ui";
// import { getDocumentMeta, getUserId, getUsersInRoom, setDocumentMeta } from "./storeUtils";
import { registerDefaultPropagators } from "./propagators/ScopedPropagators";
import { PromptShape } from "./PromptShape";
import { PromptShapeTool } from "./PromptTool";

const shapeUtils = [SocialShapeUtil, PromptShape];
const tools = [SocialShapeTool, PromptShapeTool];


const HOST_URL = import.meta.env.DEV
	? "ws://localhost:1234"
	: import.meta.env.VITE_PRODUCTION_URL.replace("https://", "ws://"); // remove protocol just in case

export default function Canvas() {
	const roomId =
		new URLSearchParams(window.location.search).get("room") || "43";
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

					// const userId = getUserId(editor)
					// setDocumentMeta(editor, {
					// 	[userId]: 123
					// })
					// // console.log(getDocumentMeta(editor))
					// // removeDocumentMeta(editor, 'test')
					// setTimeout(() => {
					// 	console.log(getDocumentMeta(editor))
					// 	console.log(getUsersInRoom(editor))
					// }, 2000);

				}}
				components={{
					SharePanel: AgentButton,
					Toolbar: CustomToolbar,
				}}
			/>
		</div>
	);
}

// const NameEditor = track(() => {
// 	const editor = useEditor();


// 	const { color, name } = editor.user.getUserPreferences();

// 	return (
// 		<div
// 			style={{
// 				// TODO: style this properly and consistently with tldraw
// 				pointerEvents: "all",
// 				display: "flex",
// 				width: "148px",
// 				margin: "4px 8px",
// 				border: "none",
// 			}}
// 		>
// 			<input
// 				style={{
// 					borderRadius: "9px 0px 0px 9px",
// 					border: "none",
// 					backgroundColor: "white",
// 					boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
// 				}}
// 				type="color"
// 				value={color}
// 				onChange={(e) => {
// 					editor.user.updateUserPreferences({
// 						color: e.currentTarget.value,
// 					});
// 				}}
// 			/>
// 			<input
// 				style={{
// 					width: "100%",
// 					borderRadius: "0px 9px 9px 0px",
// 					border: "none",
// 					backgroundColor: "white",
// 					boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
// 				}}
// 				value={name}
// 				onChange={(e) => {
// 					editor.user.updateUserPreferences({
// 						name: e.currentTarget.value,
// 					});
// 				}}
// 			/>
// 		</div>
// 	);
// });
