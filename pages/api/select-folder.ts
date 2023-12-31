import path from "node:path";
import process from "node:process";
import os from "os";

import { getImages } from "@server/getImages";
import { execa } from "execa";
import type { NextApiRequest, NextApiResponse } from "next";

async function selectDirectoryWindows() {
	try {
		const pathToPythonScript = path.join(process.cwd(), "scripts/folderPicker.py");
		const { stdout } = await execa("python", [pathToPythonScript]);
		return stdout.trim();
	} catch (error) {
		console.error(error);
		return null;
	}
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
	if (request.method === "GET") {
		try {
			switch (os.platform()) {
				case "win32":
				case "linux":
				case "darwin":
					try {
						const directory = await selectDirectoryWindows();
						const images = directory ? await getImages(directory) : [];
						response.status(200).json({ path: directory, images });
					} catch (error) {
						response.status(500).json({ error: "Failed to get directory path." });
					}

					break;

				default:
					response.status(500).json({ error: "Operating system not supported." });
			}
		} catch (error) {
			response.status(500).json({ error: "Failed to get directory path." });
		}
	} else {
		response.status(405).end(); // Method not allowed
	}
}
