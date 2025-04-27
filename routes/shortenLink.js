import crypto from "crypto";
import { loadLinks, saveLinks } from "../utils/storage.js";

export default async function shortenLinkHandler(req, res) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
        const { url, shortCode, expiresAt } = JSON.parse(body);
        const links = await loadLinks();

        const code = shortCode || crypto.randomBytes(3).toString("hex");

        if (links[code]) {
            res.writeHead(409, { "Content-Type": "text/plain" });
            return res.end("Short code already in use");
        }

        links[code] = {
            url,
            createdAt: new Date().toISOString(),
            expiresAt: expiresAt || null,
            clicks: 0,
        };

        await saveLinks(links);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ shortCode: code }));
    });
}
