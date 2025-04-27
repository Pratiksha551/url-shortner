import { loadLinks, saveLinks } from "../utils/storage.js";

export default async function getLinksHandler(req, res) {
    const links = await loadLinks();
    console.log("Loaded links:", links); // Log the loaded links

    const shortCode = req.url.slice(1);
    if (!shortCode || shortCode === "links") {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(links));
    }

    const link = links[shortCode];
    if (link) {
        const now = new Date().toISOString();
        if (link.expiresAt && now > link.expiresAt) {
            delete links[shortCode];
            await saveLinks(links);
            res.writeHead(410, { "Content-Type": "text/plain" });
            return res.end("Link expired.");
        }

        link.clicks += 1;
        await saveLinks(links);

        res.writeHead(302, { Location: link.url });
        return res.end();
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Short URL not found");
}
