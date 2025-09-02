import fs from "node:fs";
import { getOutputFolder } from "./utils/createOutputDir.js";
import express from "express";
import path from "node:path";
import open from "open";
const desktopOutputFolder = getOutputFolder();
let domainsPath = `${desktopOutputFolder}/data/appData`;
let domainNames = fs.readdirSync(domainsPath);
let filesToIgnore = ["misc", "wordlists"];
const app = express();
const PORT = 4200;

app.use(express.static(path.join(process.cwd(), "public")));

app.get("/getDomainNames", (req, res) => {
  let htmlToAdd = ``;
  domainNames.forEach((domain) => {
    if (!filesToIgnore.includes(domain)) {
      htmlToAdd += `<li><button class="root-tree-button domain"><img src="./folder.png" alt="Directory File" />${domain}</button></li>`;
    }
  });
  res.send(htmlToAdd);
});

app.get("/clickedTreeButton/:clickedNode", async (req, res) => {
  let target = req.params.clickedNode;
  const node = await searchCLickedNode(domainsPath, target);
  console.log(`Node:`);
  console.log(node);
  res.json(node);
});

const server = app.listen(PORT, "127.0.0.1", async () => {
  console.log(`Server running at: http://localhost:${PORT}`);

  await open(`http://localhost:${PORT}/stalkermap.html`);
});

process.on("SIGINT", () => {
  server.close(() => {
    console.log("Server turned off!");
    process.exit(0);
  });
});

function searchCLickedNode(domainsPath, target) {
  let htmlToSend = `<ul class="ul-mode">`;
  const files = fs.readdirSync(domainsPath);
  for (const file of files) {
    const isDIR = fs.statSync(`${domainsPath}/${file}`).isDirectory();
    if (isDIR == true) {
      let newPath = `${domainsPath}/${file}`;
      if (file == target) {
        const subFiles = fs.readdirSync(newPath);
        subFiles.forEach((subFile) => {
          const whatTypeOfFile = checkWhatType(newPath, subFile);
          if (whatTypeOfFile == `dir`)
            htmlToSend += `<li><button class="root-tree-button node"><img src="./folder.png" alt="Directory File" />${subFile}</button></li>`;
          if (whatTypeOfFile == `file`)
            htmlToSend += `<li><button class="root-tree-button node"><img src="./json-file.png" alt="Json File" />${subFile}</button></li>`;
        });
        htmlToSend += `</ul>`;
        return [false, htmlToSend];
      } else {
        const result = searchCLickedNode(newPath, target);
        if (result) return result;
      }
    } else {
      if (file == target) {
        let fileData = fs.readFileSync(`${domainsPath}/${file}`, {
          encoding: "utf8",
        });
        let fileDataParsed = JSON.parse(fileData);
        if (fileDataParsed) return [true, fileDataParsed, file];
      }
    }
  }
}

function checkWhatType(newPath, subFile) {
  if (fs.statSync(`${newPath}/${subFile}`).isDirectory() == true) return "dir";
  if (fs.statSync(`${newPath}/${subFile}`).isFile() == true) return `file`;
}
