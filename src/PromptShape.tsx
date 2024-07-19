import {
	BaseBoxShapeUtil,
	HTMLContainer,
	// TLArrowShape,
	TLBaseShape,
	TLGeoShape,
	TLOnResizeHandler,
	TLShape,
} from "tldraw"
import { getEdge } from "./propagators/tlgraph"
import { llm } from "./llm"
import { isShapeOfType } from "./propagators/utils"
import { ISocialShape } from "./SocialShapeUtil"
// import TextInput from "react-autocomplete-input"
// import "react-autocomplete-input/dist/bundle.css"

type IPrompt = TLBaseShape<
	"prompt",
	{
		w: number
		h: number
		prompt: string
		output: string
		agentBinding: string | null
	}
>

export class PromptShape extends BaseBoxShapeUtil<IPrompt> {
	static override type = "prompt" as const

	FIXED_HEIGHT = 50 as const
	MIN_WIDTH = 150 as const
	PADDING = 4 as const

	getDefaultProps(): IPrompt["props"] {
		return {
			w: 300,
			h: 50,
			prompt: "",
			output: "",
			agentBinding: null,
		}
	}

	override onResize: TLOnResizeHandler<IPrompt> = (
		shape,
		{ scaleX, initialShape },
	) => {
		const { x, y } = shape
		const w = initialShape.props.w * scaleX
		return {
			x,
			y,
			props: {
				...shape.props,
				w: Math.max(Math.abs(w), this.MIN_WIDTH),
				h: this.FIXED_HEIGHT,
			},
		}
	}

	component(shape: IPrompt) {
		const arrowBindings = this.editor.getBindingsInvolvingShape(
			shape.id,
			"arrow",
		)
		const arrows = arrowBindings
			.map((binding) => this.editor.getShape(binding.fromId))

		const inputMap = arrows.reduce((acc, arrow) => {
			const edge = getEdge(arrow, this.editor);
			if (edge) {
				const sourceShape = this.editor.getShape(edge.from);
				if (sourceShape && edge.text) {
					acc[edge.text] = sourceShape;
				}
			}
			return acc;
		}, {} as Record<string, TLShape>);

		const generateText = async (prompt: string) => {
			await llm('', prompt, (partial: string, done: boolean) => {
				console.log("DONE??", done)
				this.editor.updateShape<IPrompt>({
					id: shape.id,
					type: "prompt",
					props: { output: partial, agentBinding: done ? null : 'someone' },
				})
			})
		}

		const handlePrompt = () => {
			let processedPrompt = shape.props.prompt;
			for (const [key, sourceShape] of Object.entries(inputMap)) {
				const pattern = `{${key}}`;
				if (processedPrompt.includes(pattern)) {
					if (isShapeOfType<TLGeoShape>(sourceShape, 'geo')) {
						processedPrompt = processedPrompt.replace(pattern, sourceShape.props.text);
					} else if (isShapeOfType<ISocialShape>(sourceShape, 'social')) {
						processedPrompt = processedPrompt.replace(pattern, sourceShape.props.value.toString());
					}
				}
			}
			console.log(processedPrompt);
			generateText(processedPrompt)
		};

		return (
			<HTMLContainer
				style={{
					borderRadius: 6,
					border: "1px solid lightgrey",
					padding: this.PADDING,
					height: this.FIXED_HEIGHT,
					width: shape.props.w,
					pointerEvents: "all",
					backgroundColor: "#efefef",
					overflow: "visible",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					outline: shape.props.agentBinding ? "2px solid orange" : "none",
				}}
			>
				<input
					style={{
						width: "100%",
						height: "100%",
						overflow: "visible",
						backgroundColor: "rgba(0, 0, 0, 0.05)",
						border: "1px solid rgba(0, 0, 0, 0.05)",
						borderRadius: 6 - this.PADDING,
						fontSize: 16,
					}}
					type="text"
					placeholder="Enter prompt..."
					value={shape.props.prompt}
					onChange={(text) => {
						this.editor.updateShape<IPrompt>({
							id: shape.id,
							type: "prompt",
							props: { prompt: text.target.value },
						})
					}}
				/>
				<button
					style={{
						width: 100,
						height: "100%",
						marginLeft: 5,
						pointerEvents: "all",
					}}
					onPointerDown={(e) => {
						e.stopPropagation()
					}}
					type="button"
					onClick={handlePrompt}
				>
					Prompt
				</button>
			</HTMLContainer>
		)
	}

	// [5]
	indicator(shape: IPrompt) {
		return <rect width={shape.props.w} height={shape.props.h} rx={5} />
	}
}
