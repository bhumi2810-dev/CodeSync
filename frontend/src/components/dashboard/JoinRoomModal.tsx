import { useState } from "react"
import Button from "../common/Button"
import Input from "../common/Input"

interface JoinRoomModalProps {
	isOpen: boolean
	onClose: () => void
	onJoinRoom: (roomCode: string) => void
}

const JoinRoomModal = ({ isOpen, onClose, onJoinRoom }: JoinRoomModalProps) => {
	const [roomCode, setRoomCode] = useState("")

	if (!isOpen) {
		return null
	}

	const handleJoin = () => {
		if (roomCode.trim() === "") {
			alert("Please enter a room code.")
			return
		}

		onJoinRoom(roomCode)

		setRoomCode("")

		onClose()
	}

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/60">
			<div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-6">
				<h2 className="text-2xl font-bold text-white">Join Room</h2>

				<p className="mt-2 text-slate-400">
					Enter the room code shared by your teammate.
				</p>

				<div className="mt-6">
					<Input
						label="Room Code"
						placeholder="Enter room code"
						value={roomCode}
						onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
					/>
				</div>

				<div className="mt-8 flex justify-end gap-3">
					<Button variant="glass" onClick={onClose}>
						Cancel
					</Button>

					<Button onClick={handleJoin}>Join Room</Button>
				</div>
			</div>
		</div>
	)
}

export default JoinRoomModal
