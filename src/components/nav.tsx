"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Nav() {
	const pathname = usePathname();

	return (
		<header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
			<div className="container mx-auto flex h-14 items-center justify-between px-6">
				<Link href="/" className="group flex items-center gap-2">
					<span className="text-lg font-semibold tracking-tight">trips</span>
					<span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 hidden sm:inline">
						tracker
					</span>
				</Link>

				<nav className="flex items-center">
					<Link
						href="/"
						className={cn(
							"relative px-4 py-1.5 text-sm transition-colors",
							pathname === "/"
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						Dashboard
						{pathname === "/" && (
							<span className="absolute inset-x-4 -bottom-0.5 h-px bg-foreground" />
						)}
					</Link>
					<Link
						href="/history"
						className={cn(
							"relative px-4 py-1.5 text-sm transition-colors",
							pathname === "/history"
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						History
						{pathname === "/history" && (
							<span className="absolute inset-x-4 -bottom-0.5 h-px bg-foreground" />
						)}
					</Link>
				</nav>
			</div>
		</header>
	);
}
