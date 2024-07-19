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
import { getUserId } from './storeUtils'

export type ValueType = "scalar" | "boolean" | null

export type ISocialShape = TLBaseShape<
	"social",
	{
		w: number
		h: number
		text: string
		selector: string
		valueType: ValueType
		values: Record<string, any>
	}
>

export class SocialShapeUtil extends BaseBoxShapeUtil<ISocialShape> {
	static override type = 'social' as const
	override canBind = () => false
	override canEdit = () => false
	override getDefaultProps(): ISocialShape['props'] {
		return { w: 160 * 2, h: 90 * 2, text: '', selector: '', valueType: null, values: {} }
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

	override component(shape: ISocialShape) {
		const currentUser = getUserId(this.editor)

		const handleOnChange = (newValue: any) => {
			this.updateProps(shape, { values: { ...shape.props.values, [currentUser]: newValue } })
			console.log(shape.props.values)
		}

		return (
			<HTMLContainer style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc' }} onPointerDown={(e) => e.stopPropagation()}>
				<textarea style={{ width: '100%', height: '50%', border: 'none', outline: 'none', resize: 'none', pointerEvents: 'all' }} value={shape.props.text} onChange={(e) => this.updateProps(shape, { text: e.target.value })} />
				<ValueInterface type='boolean' value={shape.props.values[currentUser] ?? false} values={shape.props.values} onChange={handleOnChange} />
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
}

function ValueInterface({ type, value, values, onChange }: { type: ValueType; value: any; values: Record<string, any>; onChange: (value: any) => void }) {
	switch (type) {
		case 'boolean':
			return <>
				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
					<input style={{ pointerEvents: 'all', width: '20px', height: '20px', margin: 0 }} type="checkbox" value={value} onChange={(e) => onChange(e.target.checked)} />
					<div style={{ width: '1px', height: '20px', backgroundColor: 'grey' }} />
					{Object.values(values).map((bool, i) => (
						<div key={`boolean-${i}`} style={{ backgroundColor: bool ? 'blue' : 'white', width: '20px', height: '20px', border: '1px solid grey', borderRadius: 2 }} />
					))}
				</div>
			</>
		case 'scalar':
			return <div>Slider</div>
		default:
			return <div>No Interface...</div>
	}
}