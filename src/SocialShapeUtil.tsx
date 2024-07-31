import {
	BaseBoxShapeUtil,
	Editor,
	Geometry2d,
	HTMLContainer,
	Rectangle2d,
	TLBaseShape,
	TLOnResizeHandler,
	TLShape,
	TLShapeId,
	resizeBox,
} from 'tldraw'
import { getUserId } from './storeUtils'
import { getEdge } from './propagators/tlgraph'

export type ValueType = "SCALAR" | "BOOLEAN" | "STRING" | "RANK" | "NONE"

export type ISocialShape = TLBaseShape<
	"social",
	{
		w: number
		h: number
		text: string
		selector: string
		valueType: ValueType
		values: Record<string, any>
		value: any
		syntaxError: boolean
	}
>

export class SocialShapeUtil extends BaseBoxShapeUtil<ISocialShape> {
	static override type = 'social' as const
	override canBind = () => true
	override canEdit = () => false
	override getDefaultProps(): ISocialShape['props'] {
		return { w: 160 * 2, h: 90 * 2, text: '', selector: '', valueType: "NONE", values: {}, value: null, syntaxError: false }
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
		return (
			<rect
				width={shape.props.w}
				height={shape.props.h}
				rx={4}
			/>
		)
	}

	override component(shape: ISocialShape) {
		const currentUser = getUserId(this.editor)

		const defaultValues = {
			BOOLEAN: false,
			SCALAR: 0,
			DEFAULT: null
		}

		const handleOnChange = (newValue: boolean | number) => {
			this.updateProps(shape, { values: { ...shape.props.values, [currentUser]: newValue } })
			this.updateValue(shape.id)
		}

		const handleTextChange = (text: string) => {
			let valueType: ValueType = "NONE"
			const selector = text.match(/@([a-zA-Z]+)/)?.[1] || ''

			if (text.includes('SCALAR')) {
				valueType = 'SCALAR'
			} else if (text.includes('BOOLEAN')) {
				valueType = 'BOOLEAN'
			} else if (text.includes('STRING')) {
				valueType = 'STRING'
			} else if (text.includes('RANK')) {
				valueType = 'RANK'
			}

			if (valueType !== shape.props.valueType) {
				this.updateProps(shape, { text, valueType, selector, values: {} })
			} else {
				this.updateProps(shape, { text, selector })
			}
			this.updateValue(shape.id)
		}

		return (
			<HTMLContainer style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc', outline: shape.props.syntaxError ? '2px solid orange' : 'none' }} onPointerDown={(e) => e.stopPropagation()}>
				<textarea style={{ width: '100%', height: '60%', border: '1px solid lightgrey', resize: 'none', pointerEvents: 'all' }} value={shape.props.text} onChange={(e) => handleTextChange(e.target.value)} />
				<ValueInterface
					type={shape.props.valueType ?? null}
					value={shape.props.values[currentUser] ?? defaultValues[shape.props.valueType as keyof typeof defaultValues]}
					values={shape.props.values}
					onChange={handleOnChange} />
			</HTMLContainer>
		)
	}

	private updateValue(shapeId: TLShapeId) {
		const shape = this.editor.getShape(shapeId) as ISocialShape
		const valueType = shape.props.valueType
		const vals = Array.from(Object.values(shape.props.values))

		const functionBody = `return ${shape.props.text.replace(valueType, 'VALUES')};`

		const sum = (vals: number[] | boolean[]) => {
			if (valueType === 'SCALAR') {
				return (vals as number[]).reduce((acc, val) => acc + val, 0)
			}
			if (valueType === 'BOOLEAN') {
				//@ts-ignore
				return vals.filter(Boolean).length;
			}
		}
		const average = (vals: number[] | boolean[]) => {
			if (valueType === 'SCALAR') {
				return (vals as number[]).reduce((acc, val) => acc + val, 0) / vals.length
			}
			if (valueType === 'BOOLEAN') {
				//@ts-ignore
				return vals.filter(Boolean).length;
			}
		}

		const inputMap = getInputMap(this.editor, shape)

		try {
			const paramNames = ['sum', 'average', 'VALUES', ...Object.keys(inputMap)]
			const paramValues = [sum, average, vals, ...Object.values(inputMap).map(s => s.value)]
			const func = new Function(...paramNames, functionBody)
			const result = func(...paramValues)

			if (typeof result === 'function') {
				this.updateProps({ ...shape, props: { ...shape.props, value: null } }, { syntaxError: true })
				return
			}
			console.log("VALUE", result)
			this.updateProps(shape, { value: result, syntaxError: false })
		} catch (e) {
			console.log("ERROR", e)
			this.updateProps(shape, { syntaxError: true })
		}
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

function ValueInterface({ type, value, values, onChange }: { type: ValueType; value: boolean | number | string; values: Record<string, any>; onChange: (value: any) => void }) {
	switch (type) {
		case 'BOOLEAN':
			return <>
				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
					<input style={{ pointerEvents: 'all', width: '20px', height: '20px', margin: 0 }} type="checkbox" checked={value as boolean} onChange={(e) => onChange(e.target.checked)} />
					<div style={{ width: '1px', height: '20px', backgroundColor: 'grey' }} />
					{Object.values(values).map((bool, i) => (
						<div key={`boolean-${i}`} style={{ backgroundColor: bool ? 'blue' : 'white', width: '20px', height: '20px', border: '1px solid lightgrey', borderRadius: 2 }} />
					))}
				</div>
			</>
		case 'STRING':
			return (
				<div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '4px' }}>
					<textarea
						style={{
							pointerEvents: 'all',
							width: '100%',
							minHeight: '60px',
							resize: 'vertical',
							padding: '4px',
							boxSizing: 'border-box',
						}}
						value={value as string}
						onChange={(e) => onChange(e.target.value)}
					/>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<div style={{ display: 'flex', gap: '2px' }}>
							{Object.values(values).filter(value => value !== '').map((_, i) => (
								<div
									key={`string-${i}`}
									style={{
										width: '8px',
										height: '8px',
										backgroundColor: 'blue',
										borderRadius: '50%',
									}}
								/>
							))}
						</div>
					</div>
				</div>
			);
		case 'SCALAR':
			return (
				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={value as number ?? 0}
						onChange={(e) => onChange(parseFloat(e.target.value))}
						style={{ width: '100px', pointerEvents: 'all' }}
					/>
					<span style={{ fontFamily: 'monospace' }}>{(value as number ?? 0).toFixed(2)}</span>
					<div style={{ width: '1px', height: '20px', backgroundColor: 'grey' }} />
					{Object.values(values).map((val, i) => (
						<div
							key={`scalar-${i}`}
							style={{
								backgroundColor: `rgba(0, 0, 255, ${val ?? 0})`,
								width: '20px',
								height: '20px',
								border: '1px solid lightgrey',
								borderRadius: 2
							}}
						/>
					))}
				</div>
			);
		default:
			return <div style={{ marginTop: 10, textAlign: 'center' }}>No Interface...</div>
	}
}

function getInputMap(editor: Editor, shape: TLShape) {
	const arrowBindings = editor.getBindingsInvolvingShape(
		shape.id,
		"arrow",
	)
	const arrows = arrowBindings
		.map((binding) => editor.getShape(binding.fromId))

	return arrows.reduce((acc, arrow) => {
		const edge = getEdge(arrow, editor);
		if (edge && edge.to === shape.id) {
			const sourceShape = editor.getShape(edge.from);
			if (sourceShape && edge.text) {
				acc[edge.text] = { value: sourceShape.props.value || sourceShape.props.text || null, shapeId: sourceShape.id }
			}
		}
		return acc;
	}, {} as Record<string, { value: any, shapeId: TLShapeId }>);
}

function listenToShape(editor: Editor, shapeId: TLShapeId, callback: (prev: TLShape, next: TLShape) => void) {
	return editor.sideEffects.registerAfterChangeHandler<'shape'>('shape', (prev, next) => {
		if (next.id === shapeId) {
			callback(prev, next)
		}
	})
}