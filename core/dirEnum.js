//Enumerate directories and files
import * as http from "node:http";
import * as https from "node:https";
import { getChosenWordlist } from "../utils/wordlistLoader.js";
import { setBatchSize } from "../utils/threadVelocitySetter.js";
import { createFoundDirectories } from "../utils/logger.js";

export async function dirEnum(urlData, wordlistPath, changedPort = -1) {
  let protocolInUse;
  let port;
  let contDir = 0;
  let batchsize = await setBatchSize();

  if (urlData.getProtocol == `http://`) {
    protocolInUse = http;
  } else if (urlData.getProtocol == `https://`) {
    protocolInUse = https;
  }
  let host = urlData.getTarget;
  if (changedPort != -1) {
    port = changedPort;
  } else {
    port = urlData.getPort;
  }
  const delay = (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  const wordlist = await getChosenWordlist(wordlistPath);

  let possibleDirectories = [];
  let interestingStatus = [200, 301, 303, 307, 401, 403, 405, 500, 503];
  for (let x = 0; x < wordlist.length; x += batchsize) {
    let wordlistBatched = wordlist.slice(x, x + batchsize);

    const batchPromises = wordlistBatched.map((word) => {
      return new Promise((endRequest) => {
        const options = {
          hostname: host,
          port: port,
          path: `/${word}`,
          method: `GET`,
        };

        const req = protocolInUse.request(options, (res) => {
          if (interestingStatus.includes(res.statusCode)) {
            console.log(
              `Status: ${res.statusCode} | ${urlData.getProtocol}${host}:${port}/${word}`,
            );
            possibleDirectories[contDir] = [
              {
                statusCode: res.statusCode,
                protocol: urlData.getProtocol,
                host: `${host}/${word}`,
                port: port,
              },
            ];
            contDir = contDir + 1;
          }
          res.resume();
          endRequest();
        });

        req.on(`error`, (e) => {
          console.error(`Status code: ${e}`);
          endRequest();
        });
        req.end();
      });
    });
    await Promise.all(batchPromises);
    await delay(200);
  }
  console.log("Done!!!!");
  createFoundDirectories(host, possibleDirectories);
}
