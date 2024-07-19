import {
	BaseBoxShapeUtil,
	Geometry2d,
	HTMLContainer,
	Rectangle2d,
	TLBaseShape,
	TLOnResizeHandler,
	TLShapeId,
	resizeBox,
} from 'tldraw'
import { getUserId } from './storeUtils'

export type ValueType = "SCALAR" | "BOOLEAN" | "NONE"

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
				<textarea style={{ width: '100%', height: '50%', border: 'none', outline: 'none', resize: 'none', pointerEvents: 'all' }} value={shape.props.text} onChange={(e) => handleTextChange(e.target.value)} />
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
		console.log("SHAPE", shape)
		const vals = Array.from(Object.values(shape.props.values))
		console.log("VALS", vals)
		// const functionBody = `return (${shape.props.text.replace(valueType, vals)})`
		const functionBody = `return ${shape.props.text.replace(valueType, 'VALUES')};`

		console.log("FUNCTION BODY", functionBody)
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

		try {
			const func = new Function('sum', 'average', 'VALUES', functionBody)
			const result = func(sum, average, vals)
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