"use client";

import { Pencil, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { updateUser } from "@/lib/actions/users";
import type { CitizenshipTrack, UserWithTrips } from "@/lib/types";

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

interface EditUserModalProps {
	user: UserWithTrips;
}

export function EditUserModal({ user }: EditUserModalProps) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState(user.name);
	const [avatar, setAvatar] = useState(user.avatar || "");
	const [greenCardDate, setGreenCardDate] = useState(user.greenCardDate);
	const [track, setTrack] = useState<CitizenshipTrack>(user.citizenshipTrack);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			alert("Please select an image file");
			return;
		}

		if (file.size > 2 * 1024 * 1024) {
			alert("Image must be less than 2MB");
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => {
			setAvatar(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleRemoveAvatar = () => {
		setAvatar("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (newOpen) {
			setName(user.name);
			setAvatar(user.avatar || "");
			setGreenCardDate(user.greenCardDate);
			setTrack(user.citizenshipTrack);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !greenCardDate) return;

		setLoading(true);
		const result = await updateUser(user.id, name, greenCardDate, track, avatar || null);
		setLoading(false);

		if (result.success) {
			setOpen(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-muted-foreground hover:text-foreground"
				>
					<Pencil className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
						<DialogDescription>Update the details for {user.name}.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="flex flex-col items-center gap-3">
							<div className="relative">
								<Avatar className="h-20 w-20">
									<AvatarImage src={avatar} alt={name || "Avatar preview"} />
									<AvatarFallback className="text-xl">
										{name ? getInitials(name) : "?"}
									</AvatarFallback>
								</Avatar>
								{avatar && (
									<Button
										type="button"
										variant="destructive"
										size="icon"
										className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
										onClick={handleRemoveAvatar}
									>
										<X className="h-3 w-3" />
									</Button>
								)}
							</div>
							<div className="flex items-center gap-2">
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleFileChange}
									className="hidden"
									id="avatar-edit-upload"
								/>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => fileInputRef.current?.click()}
								>
									<Upload className="mr-2 h-4 w-4" />
									{avatar ? "Change Photo" : "Upload Photo"}
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">Optional. Max 2MB, JPG/PNG/GIF</p>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-name">Name</Label>
							<Input
								id="edit-name"
								placeholder="John Smith"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-greenCardDate">Green Card Issue Date</Label>
							<Input
								id="edit-greenCardDate"
								type="date"
								value={greenCardDate}
								onChange={(e) => setGreenCardDate(e.target.value)}
								max={new Date().toISOString().split("T")[0]}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-track">Citizenship Track</Label>
							<Select value={track} onValueChange={(value) => setTrack(value as CitizenshipTrack)}>
								<SelectTrigger>
									<SelectValue placeholder="Select track" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="5-year">5-Year Track (Standard)</SelectItem>
									<SelectItem value="3-year">3-Year Track (Married to US Citizen)</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
