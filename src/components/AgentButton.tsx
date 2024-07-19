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
						isUnbound
						onColorChange={(color) => handleColorChange(agent.name, color)}
						onDelete={() => handleDelete(agent.name)}
						onBind={() => handleBind(agent.name)}
					/>
				))}
			</Dropdown>
		</div>
	)
}

function AgentItem({ agent, isUnbound, onColorChange, onDelete, onBind }: { agent: Agent, isUnbound?: boolean, onColorChange: (color: string) => void, onDelete: () => void, onBind: () => void }) {
	return <DropdownItem>
		<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				{!isUnbound && <ColorPicker color={agent.color} onChange={onColorChange} />}
				<span onClick={onBind} style={{ color: isUnbound ? 'grey' : 'black' }}>{agent.name}</span>
			</div>
			<DeleteButton onClick={onDelete} />
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
			onClick={onClick}
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
			onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
			onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
		>
			×
		</button>
	);
}