import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { saveFile, loadLinks, saveLinks } from "./utils/storage.js"; // ✅ add this
import getLinksHandler from "./routes/getLinks.js";
import shortenLinkHandler from "./routes/shortenLink.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/") {
        return saveFile(res, path.join(__dirname, "public", "index.html"), "text/html");
    } else if (req.method === "GET" && req.url === "/style.css") {
        return saveFile(res, path.join(__dirname, "public", "style.css"), "text/css");
    } else if (req.method === "GET" && req.url === "/links") {
        return getLinksHandler(req, res);
    } else if (req.method === "POST" && req.url === "/shorten") {
        return shortenLinkHandler(req, res);
    }
    else if (req.method === "DELETE" && req.url.startsWith("/delete/")) {
        const code = req.url.split("/delete/")[1];
        const links = await loadLinks();
        if (links[code]) {
            delete links[code];
            await saveLinks(links);
            res.writeHead(200);
            res.end("Deleted");
        } else {
            res.writeHead(404);
            res.end("Not found");
        }
    }
    else if (req.method === "PUT" && req.url === "/edit") {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", async () => {
            const { code, newUrl } = JSON.parse(body);
            const links = await loadLinks();
            if (links[code]) {
                links[code].url = newUrl;
                await saveLinks(links);
                res.writeHead(200);
                return res.end("Updated");
            }
            res.writeHead(404);
            res.end("Not found");
        });
    }
    
    else {
        return getLinksHandler(req, res); // Handles short link redirection
    }
});


server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
