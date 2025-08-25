import readline from "node:readline";
import { sanatizeURL } from "./utils/sanatizeURL.js";
import { scanner } from "./core/scanner.js";
import { createDesktopOutputFolder } from "./utils/createOutputDir.js";
import { getWordlistDirPaths } from "./utils/wordlistLoader.js";
import { dirEnum } from "./core/dirEnum.js";

const askTerminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function ask(question) {
  return new Promise((resolve) => {
    askTerminal.question(question, resolve);
  });
}

console.log(
  "-Port Scanner, Dir search recursively (All info gathered is stored in ~Desktop/stalkermapOUTPUT/data/{IP/DNS})",
);
console.log(
  "------------------------------------------------------------------------------------",
);
console.log(
  "███████ ████████  █████  ██      ██   ██ ███████ ██████  ███    ███  █████  ██████  ",
);
console.log(
  "██         ██    ██   ██ ██      ██  ██  ██      ██   ██ ████  ████ ██   ██ ██   ██ ",
);
console.log(
  "███████    ██    ███████ ██      █████   █████   ██████  ██ ████ ██ ███████ ██████  ",
);
console.log(
  "     ██    ██    ██   ██ ██      ██  ██  ██      ██   ██ ██  ██  ██ ██   ██ ██      ",
);
console.log(
  "███████    ██    ██   ██ ███████ ██   ██ ███████ ██   ██ ██      ██ ██   ██ ██      ",
);
console.log(
  "                         CREATED BY:            SEAK                                ",
);
console.log(
  "                            VERSION:            1.0.0                               ",
);
console.log(
  "------------------------------------------------------------------------------------",
);
console.log(
  "ALERT! => If you are doing a CTF challenge and need to use the /etc/hosts file choose YES to the CTFmode",
);
console.log(
  "Don't use CTFmode for better performance at scale and get more detailed information <3",
);
var separator =
  "------------------------------------------------------------------------------------";

(async () => {
  createDesktopOutputFolder();
  const CTFmode = await ask(`Enable CTF mode? (Y/N): `);
  if (
    CTFmode !== "Y" &&
    CTFmode !== "N" &&
    CTFmode !== "y" &&
    CTFmode !== "n"
  ) {
    throw new Error("Invalid input. (Use `Y` or `N`)");
  }
  console.log(separator);

  const url = await ask(`Input the url: `);
  console.log(separator);
  var cleanURLdata = sanatizeURL(url);
  console.log(cleanURLdata);

  console.log(separator);
  const consent = await ask(`We are going to start the scans, you sure?(Y,N):`);
  console.log(separator);

  if (consent == `Y` || consent == `y`) {
    console.log("Let`s start...");
    if (CTFmode == `Y` || CTFmode == `y`) {
      scanner(cleanURLdata, true);
    } else {
      scanner(cleanURLdata, false);
    }
  } else if (consent == `N` || consent == "n") {
    console.log("Stopping the program!");
    process.exit();
  }

  console.log(separator);
  console.log("Let's start the directory enumeration!");
  console.log(separator);

  const directoryWordlistPaths = await getWordlistDirPaths();
  let countedWordlist = [];
  for (let i = 0; 0 < directoryWordlistPaths.length; ++i) {
    console.log(`${i} - ${directoryWordlistPaths}`);
    countedWordlist[i] = directoryWordlistPaths[i];
  }

  const chosenWordlist = await ask(
    `Enter the id of the wordlist you want to use (${0}-${directoryWordlistPaths.length}):`,
  );
  let changedPort = false;
  let chosenWordlistClean;
  let portToEnumerate;
  if (parseInt(chosenWordlist)) {
    chosenWordlistClean = parseInt(chosenWordlist);
    if (
      chosenWordlistClean <= countedWordlist.length &&
      chosenWordlistClean >= 0
    ) {
      if (
        // @ts-ignore
        cleanURLdata.getPort == "" ||
        // @ts-ignore
        parseInt(cleanURLdata.getPort) != 80 ||
        // @ts-ignore
        parseInt(cleanURLdata.getPort) != 443 ||
        // @ts-ignore
        parseInt(cleanURLdata.getPort) != 8080
      ) {
        portToEnumerate = await ask(`What port do you want to enumerate?`);
        changedPort = true;
      }
      if (changedPort == true) {
        await dirEnum(
          cleanURLdata,
          countedWordlist[chosenWordlistClean],
          portToEnumerate,
        );
      } else {
        await dirEnum(cleanURLdata, countedWordlist[chosenWordlistClean]);
      }
    } else {
      console.error(`Not a valid wordlist ID!`);
    }
  } else {
    console.error(`Not a number!`);
  }
  console.log(`Directory enumeration done!`);
  askTerminal.close();
})();
