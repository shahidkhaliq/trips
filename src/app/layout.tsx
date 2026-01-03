import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { Nav } from "@/components/nav";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

const dmSans = DM_Sans({
	variable: "--font-dm-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Trip Tracker",
	description: "Track green card holder trips and citizenship eligibility",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Trip Tracker",
	},
	icons: {
		icon: "/icons/icon.svg",
		apple: "/icons/icon.svg",
	},
	formatDetection: {
		telephone: false,
	},
};

export const viewport: Viewport = {
	themeColor: "#000000",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${dmSans.variable} font-sans antialiased`}>
				<ServiceWorkerRegister />
				<Nav />
				<main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
			</body>
		</html>
	);
}
