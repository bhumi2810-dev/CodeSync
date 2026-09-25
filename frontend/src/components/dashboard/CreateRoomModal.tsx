import { useState } from "react"
import Button from "../common/Button"
import Input from "../common/Input"

interface CreateRoomModalProps {
	isOpen: boolean
	onClose: () => void
	onCreateRoom: (roomName: string, isPrivate: boolean) => void
}

const CreateRoomModal = ({
	isOpen,
	onClose,
	onCreateRoom,
}: CreateRoomModalProps) => {
	const [roomName, setRoomName] = useState("")
	const [isPrivate, setIsPrivate] = useState(true)

	// Don't render the modal if it is closed
	if (!isOpen) {
		return null
	}

	const handleCreate = () => {
		if (roomName.trim() === "") {
			alert("Please enter a room name.")
			return
		}

		onCreateRoom(roomName, isPrivate)

		setRoomName("")
		setIsPrivate(true)

		onClose()
	}

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/60">
			<div className="w-full max-w-md rounded-2xl bg-slate-800 p-6 border border-slate-700">
				<h2 className="text-2xl font-bold text-white">Create New Room</h2>

				<p className="mt-2 text-slate-400">
					Create a workspace and invite your teammates.
				</p>

				<div className="mt-6">
					<Input
						label="Room Name"
						placeholder="Enter room name"
						value={roomName}
						onChange={(e) => setRoomName(e.target.value)}
					/>
				</div>

				<div className="mt-6">
					<label className="block text-white font-medium mb-3">
						Visibility
					</label>

					<div className="space-y-3">
						<label className="flex items-center gap-2 text-slate-300">
							<input
								type="radio"
								checked={isPrivate}
								onChange={() => setIsPrivate(true)}
							/>
							Private
						</label>

						<label className="flex items-center gap-2 text-slate-300">
							<input
								type="radio"
								checked={!isPrivate}
								onChange={() => setIsPrivate(false)}
							/>
							Public
						</label>
					</div>
				</div>

				<div className="mt-8 flex justify-end gap-3">
					<Button variant="glass" onClick={onClose}>
						Cancel
					</Button>

					<Button onClick={handleCreate}>Create Room</Button>
				</div>
			</div>
		</div>
	)
}

export default CreateRoomModal
