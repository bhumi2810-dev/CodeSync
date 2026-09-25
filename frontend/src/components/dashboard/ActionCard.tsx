import type { ReactNode } from "react";

interface ActionCardProps {
	icon: ReactNode
	title: string
	description: string
	onClick: () => void
}

const ActionCard = ({ icon, title, description, onClick }: ActionCardProps) => {
	return (
		<button
			onClick={onClick}
			className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:bg-slate-700 hover:shadow-xl"
		>
			{/* Icon */}
			<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-2xl text-white">
				{icon}
			</div>

			{/* Title */}
			<h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>

			{/* Description */}
			<p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
		</button>
	)
}

export default ActionCard
