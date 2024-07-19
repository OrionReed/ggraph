import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
// import { CheckIcon } from '@radix-ui/react-icons'

export function Dropdown({
	trigger,
	children,
}: {
	trigger: React.ReactNode
	children: React.ReactNode
}) {
	return (
		<DropdownMenu.Root modal={false}>
			<DropdownMenu.Trigger asChild>
				<button
					type="button"
					style={{ cursor: 'pointer', marginTop: 8, marginRight: 2, zIndex: 100000, pointerEvents: 'all', backgroundColor: 'transparent', border: 'none', outline: 'none' }}
				>
					<div
						style={{
							borderRadius: 'var(--radius-2)',
							boxShadow: 'var(--shadow-1)',
							color: 'var(--color-text)',
							fontWeight: 'bold',
							padding: '8px 16px',
							backgroundColor: 'var(--color-panel)',
						}}
					>
						{trigger}
					</div>
				</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					align="end"
					style={{
						maxHeight: '80vh',
						overflow: 'auto',
						marginTop: 5,
						marginRight: 8,
						boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
						backgroundColor: 'white',
						borderRadius: '9px',
						border: '1px solid #e5e7eb',
					}}
				>
					<div
						style={{
							pointerEvents: 'all',
							background: '#fdfdfd',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-start',
							fontSize: '12px',
							width: '100%',
							padding: '4px',
						}}
					>
						{children}
					</div>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}

export function DropdownItem({
	// action,
	children,
}: {
	// action?: () => void
	children: React.ReactNode
}) {
	return (
		<DropdownMenu.Item asChild>
			<div
				// className="showHover"
				// type="button"
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'flex-start',
					alignItems: 'center',
					height: '36px',
					// padding: '0 8px',
					textAlign: 'left',
					width: '100%',
					borderRadius: '6px',
					boxSizing: 'border-box',
					textShadow: '1px 1px #fff',
					gap: '6px',
					paddingLeft: '8px',
					paddingRight: '8px',
					cursor: 'pointer',
					backgroundColor: 'transparent',
					border: 'none',
					outline: 'none',
				}}
				onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
				onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
			// onClick={(e) => {
			// 	e.preventDefault()
			// 	action?.()
			// }}
			>
				{children}
			</div>
		</DropdownMenu.Item>
	)
}