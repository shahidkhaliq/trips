"use client";

import { FileJson, Upload, UserPlus, X } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createUser, importUserWithTrips } from "@/lib/actions/users";
import type { CitizenshipTrack, UserExport } from "@/lib/types";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function NewUserModal() {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [mode, setMode] = useState<"manual" | "import">("manual");
	const [name, setName] = useState("");
	const [avatar, setAvatar] = useState("");
	const [greenCardDate, setGreenCardDate] = useState("");
	const [track, setTrack] = useState<CitizenshipTrack>("5-year");
	const [importData, setImportData] = useState<UserExport | null>(null);
	const [importError, setImportError] = useState("");
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const jsonInputRef = useRef<HTMLInputElement>(null);

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

	const parseJsonFile = (file: File) => {
		setImportError("");

		const reader = new FileReader();
		reader.onloadend = () => {
			try {
				const data = JSON.parse(reader.result as string) as UserExport;
				if (!data.name || !data.greenCardDate || !data.citizenshipTrack) {
					setImportError(
						"Invalid JSON: missing required fields (name, greenCardDate, citizenshipTrack)"
					);
					setImportData(null);
					return;
				}
				if (!["5-year", "3-year"].includes(data.citizenshipTrack)) {
					setImportError("Invalid citizenship track. Must be '5-year' or '3-year'");
					setImportData(null);
					return;
				}
				setImportData(data);
			} catch {
				setImportError("Invalid JSON file");
				setImportData(null);
			}
		};
		reader.readAsText(file);
	};

	const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		parseJsonFile(file);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const file = e.dataTransfer.files?.[0];
		if (!file) return;

		if (!file.type.includes("json") && !file.name.endsWith(".json")) {
			setImportError("Please drop a JSON file");
			return;
		}

		parseJsonFile(file);
	};

	const resetForm = () => {
		setName("");
		setAvatar("");
		setGreenCardDate("");
		setTrack("5-year");
		setImportData(null);
		setImportError("");
		setMode("manual");
		setIsDragging(false);
		if (fileInputRef.current) fileInputRef.current.value = "";
		if (jsonInputRef.current) jsonInputRef.current.value = "";
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (mode === "import") {
			if (!importData) return;
			setLoading(true);
			const result = await importUserWithTrips(importData);
			setLoading(false);
			if (result.success) {
				setOpen(false);
				resetForm();
			}
		} else {
			if (!name || !greenCardDate) return;
			setLoading(true);
			const result = await createUser(name, greenCardDate, track, avatar || undefined);
			setLoading(false);
			if (result.success) {
				setOpen(false);
				resetForm();
			}
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				setOpen(isOpen);
				if (!isOpen) resetForm();
			}}
		>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<UserPlus className="h-4 w-4" />
					New User
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Add New Green Card Holder</DialogTitle>
						<DialogDescription>
							Enter details manually or import from a JSON file.
						</DialogDescription>
					</DialogHeader>

					<Tabs
						value={mode}
						onValueChange={(v) => setMode(v as "manual" | "import")}
						className="mt-4"
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="manual" className="gap-2">
								<UserPlus className="h-4 w-4" />
								Manual
							</TabsTrigger>
							<TabsTrigger value="import" className="gap-2">
								<FileJson className="h-4 w-4" />
								Import
							</TabsTrigger>
						</TabsList>

						<TabsContent value="manual" className="mt-4">
							<div className="grid gap-4">
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
											id="avatar-upload"
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => fileInputRef.current?.click()}
										>
											<Upload className="mr-2 h-4 w-4" />
											Upload Photo
										</Button>
									</div>
									<p className="text-xs text-muted-foreground">Optional. Max 2MB, JPG/PNG/GIF</p>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										placeholder="John Smith"
										value={name}
										onChange={(e) => setName(e.target.value)}
										required={mode === "manual"}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="greenCardDate">Green Card Issue Date</Label>
									<Input
										id="greenCardDate"
										type="date"
										value={greenCardDate}
										onChange={(e) => setGreenCardDate(e.target.value)}
										max={new Date().toISOString().split("T")[0]}
										required={mode === "manual"}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="track">Citizenship Track</Label>
									<Select
										value={track}
										onValueChange={(value) => setTrack(value as CitizenshipTrack)}
									>
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
						</TabsContent>

						<TabsContent value="import" className="mt-4">
							<div className="grid gap-4">
								<input
									ref={jsonInputRef}
									type="file"
									accept=".json,application/json"
									onChange={handleJsonChange}
									className="hidden"
									id="json-import"
								/>

								<button
									type="button"
									onClick={() => jsonInputRef.current?.click()}
									onDragOver={handleDragOver}
									onDragLeave={handleDragLeave}
									onDrop={handleDrop}
									className={cn(
										"flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors",
										isDragging
											? "border-primary bg-primary/5"
											: "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50"
									)}
								>
									<div
										className={cn(
											"rounded-full p-3 transition-colors",
											isDragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
										)}
									>
										<FileJson className="h-6 w-6" />
									</div>
									<div className="text-center">
										<p className="font-medium">
											{isDragging ? "Drop JSON file here" : "Drop JSON file or click to browse"}
										</p>
										<p className="mt-1 text-xs text-muted-foreground">
											Exported user data with trips
										</p>
									</div>
								</button>

								{importError && <p className="text-sm text-destructive">{importError}</p>}

								{importData && (
									<div className="rounded-lg border bg-muted/30 p-4">
										<h4 className="mb-2 font-medium">Preview</h4>
										<dl className="space-y-1 text-sm">
											<div className="flex justify-between">
												<dt className="text-muted-foreground">Name:</dt>
												<dd>{importData.name}</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-muted-foreground">Green Card Date:</dt>
												<dd>{importData.greenCardDate}</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-muted-foreground">Track:</dt>
												<dd>{importData.citizenshipTrack}</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-muted-foreground">Trips:</dt>
												<dd>{importData.trips?.length || 0}</dd>
											</div>
										</dl>
									</div>
								)}
							</div>
						</TabsContent>
					</Tabs>

					<DialogFooter className="mt-6">
						<Button type="button" variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading || (mode === "import" && !importData)}>
							{loading ? "Adding..." : mode === "import" ? "Import User" : "Add User"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
