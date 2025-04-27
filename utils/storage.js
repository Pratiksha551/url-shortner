import { readFile, writeFile } from "fs/promises";
import path from "path";

const DATA_FILE = path.join("data", "links.json");

export const saveFile = async (res, filePath, contentType) => {
    try {
        const data = await readFile(filePath);
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    } catch {
        res.writeHead(404);
        res.end("404 Not Found");
    }
};

export const loadLinks = async () => {
    try {
        const data = await readFile(DATA_FILE, "utf-8");
        const links = JSON.parse(data);
        console.log("Loaded links:", links); // Debugging
        return links;
    } catch (err) {
        if (err.code === "ENOENT") {
            await writeFile(DATA_FILE, JSON.stringify({}));
            return {};
        }
        throw err;
    }
};

export const saveLinks = async (data) => {
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
};
