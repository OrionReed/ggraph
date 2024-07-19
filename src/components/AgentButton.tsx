import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Dropdown, DropdownItem } from './Dropdown'
import { useState } from 'react'


type Agent = {
	name: string,
	boundClientIds: string[],
	color: string,
}


export function AgentButton() {
	const [agents, setAgents] = useState<Agent[]>([
		{ name: 'Floof der Vanderbelt', boundClientIds: ['312342'], color: '#eb4034' },
		{ name: 'Bark', boundClientIds: ['312342', '312343'], color: '#32d96c' },
		{ name: 'Meow', boundClientIds: [], color: '#3db9eb' },
	])
	const [boundToAgent, setBoundToAgent] = useState<string | null>('Bark')

	const sansYou = agents.filter((agent: Agent) => agent.name !== boundToAgent)
	const boundAgents = sansYou.filter((agent: Agent) => agent.boundClientIds.length > 0)
	const unboundAgents = sansYou.filter((agent: Agent) => agent.boundClientIds.length === 0)
	const you = agents.find((agent: Agent) => agent.name === boundToAgent)

	const handleColorChange = (name: string, color: string) => {
		setAgents(agents.map(agent =>
			agent.name === name ? { ...agent, color } : agent
		))
	}

	const handleDelete = (name: string) => {
		setAgents(agents.filter(agent => agent.name !== name))
		if (boundToAgent === name) {
			setBoundToAgent(null)
		}
	}

	const handleBind = (name: string) => {
		setBoundToAgent(name)
	}

	const handleAdd = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation()
		const name = randomName()
		const color = randomHexColor()
		setAgents([...agents, { name, boundClientIds: [], color }])
	}

	const handleRename = (name: string, newName: string) => {
		setBoundToAgent(newName)
		setAgents(agents.map(agent => agent.name === name ? { ...agent, name: newName } : agent))
	}

	return (
		<div>
			<Dropdown
				trigger={
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						{boundToAgent ? (
							<>
								<span>{boundToAgent}</span>
								<div style={{ width: '16px', height: '16px', backgroundColor: you?.color, borderRadius: '50%' }} />
							</>
						) : 'Join'}
					</div>
				}
			>
				{you && <AgentItem
					agent={you}
					canRename
					onRename={(newName) => handleRename(you.name, newName)}
					onColorChange={(color) => handleColorChange(you.name, color)}
					onDelete={() => handleDelete(you.name)}
					onBind={() => handleBind(you.name)}
				/>}
				<Separator />
				{boundAgents.map((agent: Agent) => (
					<AgentItem
						key={agent.name}
						agent={agent}
						onColorChange={(color) => handleColorChange(agent.name, color)}
						onDelete={() => handleDelete(agent.name)}
						onBind={() => handleBind(agent.name)}
					/>
				))}
				<Separator />
				{unboundAgents.map((agent: Agent) => (
					<AgentItem
						key={agent.name}
						agent={agent}
						isReadonly
						onColorChange={(color) => handleColorChange(agent.name, color)}
						onDelete={() => handleDelete(agent.name)}
						onBind={() => handleBind(agent.name)}
					/>
				))}
				<Separator />
				<AddAgentButton onAdd={(e) => handleAdd(e)} />
			</Dropdown>
		</div>
	)
}

function AgentItem({ agent, isReadonly, canRename, onColorChange, onRename, onDelete, onBind }: { agent: Agent, isReadonly?: boolean, canRename?: boolean, onColorChange: (color: string) => void, onRename?: (name: string) => void, onDelete: () => void, onBind: () => void }) {
	return <DropdownItem>
		<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				{!isReadonly && <ColorPicker color={agent.color} onChange={onColorChange} />}
				{canRename ? (
					<input
						type="text"
						value={agent.name}
						onClick={(e) => e.stopPropagation()}
						onChange={(e) => {
							e.preventDefault()
							e.stopPropagation()
							onRename?.(e.target.value)
						}}
						// onKeyDown={(e) => {
						// 	// e.preventDefault()
						// 	e.stopPropagation()
						// }}
						style={{ color: isReadonly ? 'grey' : 'black' }}
					/>
				) : (
					<span onClick={onBind} style={{ color: isReadonly ? 'grey' : 'black' }}>{agent.name}</span>
				)}
			</div>
			<DeleteButton onClick={onDelete} />
		</div>
	</DropdownItem>
}
function AddAgentButton({ onAdd }: { onAdd: (e: React.MouseEvent<HTMLDivElement>) => void }) {
	return <DropdownItem>
		<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
			<div onClick={onAdd} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
				<span>Add Name</span>
				<span style={{
					marginLeft: 'auto', fontSize: '20px',
				}}>+</span>
			</div>
		</div>
	</DropdownItem>
}

function Separator() {
	return <DropdownMenu.Separator
		style={{
			height: '1px',
			width: 'calc(100% - 10px)',
			backgroundColor: 'lightgray',
			margin: '5px',
		}}
	/>
}

function ColorPicker({ color, onChange }: { color: string, onChange: (color: string) => void }) {
	return (
		<div
			style={{
				width: '20px',
				height: '20px',
				borderRadius: '50%',
				backgroundColor: color,
				cursor: 'pointer',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			<input
				type="color"
				value={color}
				onClick={(e) => e.stopPropagation()}
				onChange={(e) => onChange(e.target.value)}
				style={{
					position: 'absolute',
					opacity: 0,
					width: '100%',
					height: '100%',
					cursor: 'pointer',
				}}
			/>
		</div>
	);
}

function DeleteButton({ onClick }: { onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={(e) => {
				e.stopPropagation()
				onClick()
			}}
			style={{
				background: 'none',
				border: 'none',
				color: '#999',
				fontSize: '20px',
				cursor: 'pointer',
				padding: 0,
				paddingLeft: 4,
				borderRadius: '50%',
				transition: 'background-color 0.2s',
			}}
			onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3e3e3'}
			onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
		>
			×
		</button>
	);
}

function randomName(): string {
	const firstNames = ['Boba', 'Zap', 'Fizz', 'Glorp', 'Squish', 'Blip', 'Floof', 'Ziggy', 'Quark', 'Noodle', 'AI'];
	const lastNames = ['Bubbles', 'Zoomers', 'Wiggles', 'Snazzle', 'Boop', 'Fizzle', 'Wobble', 'Giggle', 'Squeak', 'Noodle', 'Palace'];
	return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
}

function randomHexColor(): string {
	return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}