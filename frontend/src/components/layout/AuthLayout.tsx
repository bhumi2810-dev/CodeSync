import React from "react"
import Card from "../common/Card"
import Logo from "../common/Logo"

interface AuthLayoutProps {
	children: React.ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
	return (
		<div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
			<Card className="w-full max-w-md">
				<div className="mb-8 flex justify-center">
					<Logo size="md" />
				</div>

				{children}
			</Card>
		</div>
	)
}

export default AuthLayout
