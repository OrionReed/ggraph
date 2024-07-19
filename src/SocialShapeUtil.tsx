import {
	BaseBoxShapeUtil,
	Geometry2d,
	HTMLContainer,
	Rectangle2d,
	TLBaseShape,
	TLOnResizeHandler,
	resizeBox,
	toDomPrecision,
} from 'tldraw'

export type ValueType = "scalar" | "boolean" | null

export type ISocialShape = TLBaseShape<
	"social",
	{
		w: number
		h: number
		text: string
		selector: string
		valueType: ValueType
	}
>

export class SocialShapeUtil extends BaseBoxShapeUtil<ISocialShape> {
	static override type = 'social' as const
	override canBind = () => false
	override canEdit = () => false
	override getDefaultProps(): ISocialShape['props'] {
		return { w: 160 * 2, h: 90 * 2, text: '', selector: '', valueType: null }
	}
	override onResize: TLOnResizeHandler<ISocialShape> = (shape, info) => {
		return resizeBox(shape, info)
	}
	override getGeometry(shape: ISocialShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}
	indicator(shape: ISocialShape) {
		const bounds = this.editor.getShapeGeometry(shape).bounds
		return (
			<rect
				width={toDomPrecision(bounds.width)}
				height={toDomPrecision(bounds.height)}
				rx={4}
			/>
		)
	}

	override component(machine: ISocialShape) {
		return (
			<HTMLContainer style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc', pointerEvents: 'all' }}>
				<textarea style={{ width: '100%', height: '100%', border: 'none', outline: 'none', resize: 'none' }} value={machine.props.text} onChange={(e) => this.updateProps(machine, { text: e.target.value })} />
			</HTMLContainer>
		)
	}



	private updateProps(shape: ISocialShape, props: Partial<ISocialShape['props']>) {
		this.editor.updateShape<ISocialShape>({
			id: shape.id,
			type: 'social',
			props: {
				...shape.props,
				...props
			},
		})
	}

	// static removeParticipantsNotInRoom(editor: Editor, shapeId: TLShapeId) {
	// 	const roomMembers = getRoomMembers(editor)
	// 	const _shape = editor.getShape(shapeId)
	// 	if (!_shape || _shape.type !== 'gmachine') return
	// 	const shape = _shape as IGMachineShape
	// 	const participants = new Map(shape.props.participants.map(p => [p.id, p]))
	// 	participants.forEach((participant: any) => {
	// 		if (!roomMembers.some(rm => rm.id === participant.id)) {
	// 			participants.delete(participant.id)
	// 		}
	// 	})
	// 	updateProps(editor, shape, { participants: Array.from(participants.values()) })
	// }
}
