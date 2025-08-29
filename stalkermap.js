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
  "(All info gathered is stored in ~Desktop/stalkermapOUTPUT/data/{IP/DNS})",
);
console.log(
  `Add your wordlist in the ~Desktop/stalkermapOUTPUT/data/appData/wordlists`,
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
  var cleanURLdata = await sanatizeURL(url);
  console.table(cleanURLdata);

  console.log(separator);
  const consent = await ask(`We are going to start the scans, you sure?(Y,N):`);
  console.log(separator);

  if (consent == `Y` || consent == `y`) {
    console.log("Let`s start...");
    if (CTFmode == `Y` || CTFmode == `y`) {
      await scanner(cleanURLdata, true);
    } else {
      await scanner(cleanURLdata, false);
    }

    console.log(separator);
    console.log("Let's start the directory enumeration!");
    console.log(separator);

    const directoryWordlistPaths = await getWordlistDirPaths();
    let countedWordlist = [];
    console.log(`All wordlist paths`);
    for (let i = 0; i < directoryWordlistPaths.length; i++) {
      countedWordlist[i] = [directoryWordlistPaths[i]];
    }
    console.log(separator);
    console.table(countedWordlist);
    const chosenWordlist = await ask(
      `Enter the id of the wordlist you want to use (${0}-${directoryWordlistPaths.length - 1}): `,
    );
    let changedPort = false;
    let chosenWordlistClean;
    let portToEnumerate;
    if (parseInt(chosenWordlist)) {
      chosenWordlistClean = parseInt(chosenWordlist);
      if (
        chosenWordlistClean <= countedWordlist.length - 1 &&
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
          portToEnumerate = await ask(`What port do you want to enumerate? `);
          changedPort = true;
        }
        if (changedPort == true) {
          await dirEnum(
            cleanURLdata,
            countedWordlist[chosenWordlistClean],
            portToEnumerate,
          );
          console.log(`Directory enumeration done!`);
        } else {
          await dirEnum(cleanURLdata, countedWordlist[chosenWordlistClean]);
          console.log(`Directory enumeration done!`);
        }
        console.log(separator);
        console.log("");
      } else {
        console.error(`Not a valid wordlist ID!`);
      }
    } else {
      console.error(`Not a number!`);
    }
  } else if (consent == `N` || consent == "n") {
    console.log("Stopping the program!");
    process.exit();
  }

  askTerminal.close();
})();
