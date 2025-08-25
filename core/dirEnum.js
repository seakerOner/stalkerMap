//Enumerate directories and files
import * as http from "node:http";
import * as https from "node:https";
import { getChosenWordlist } from "../utils/wordlistLoader.js";
import { setBatchSize } from "../utils/threadVelocitySetter.js";
import { createFoundDirectories } from "../utils/logger.js";

export async function dirEnum(urlData, wordlistPath, changedPort = -1) {
  let protocolInUse;
  let port;
  let possibleDirectories = {};

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
  const wordlist = await getChosenWordlist(wordlistPath);
  for (let x = 0; x < wordlist.length; x = +batchsize) {
    let wordlistBatched = wordlist.splice(x, x + batchsize);
    wordlistBatched.forEach((word) => {
      const options = {
        hostname: host,
        port: port,
        path: word,
        method: `GET`,
      };

      const req = protocolInUse.request(options, (res) => {
        switch (res.statusCode) {
          case 200:
            console.log(
              `Status: ${res.statusCode} | ${protocolInUse}${host}:${port}`,
            );
            possibleDirectories.push({
              statusCode: res.statusCode,
              protocol: protocolInUse,
              host: host,
              port: port,
            });

            break;
          case 301:
            console.log(
              `Status: ${res.statusCode} | ${protocolInUse}${host}:${port}`,
            );
            possibleDirectories.push({
              statusCode: res.statusCode,
              protocol: protocolInUse,
              host: host,
              port: port,
            });
            break;
          case 302:
            console.log(
              `Status: ${res.statusCode} | ${protocolInUse}${host}:${port}`,
            );
            possibleDirectories.push({
              statusCode: res.statusCode,
              protocol: protocolInUse,
              host: host,
              port: port,
            });
            break;
          case 303:
            console.log(
              `Status: ${res.statusCode} | ${protocolInUse}${host}:${port}`,
            );
            possibleDirectories.push({
              statusCode: res.statusCode,
              protocol: protocolInUse,
              host: host,
              port: port,
            });
            break;
          case 307:
            console.log(
              `Status: ${res.statusCode} | ${protocolInUse}${host}:${port}`,
            );
            possibleDirectories.push({
              statusCode: res.statusCode,
              protocol: protocolInUse,
              host: host,
              port: port,
            });
            break;
          case 308:
            console.log(
              `Status: ${res.statusCode} | ${protocolInUse}${host}:${port}`,
            );
            possibleDirectories.push({
              statusCode: res.statusCode,
              protocol: protocolInUse,
              host: host,
              port: port,
            });
            break;
          case 401:
            console.log(
              `Status: ${res.statusCode} | ${protocolInUse}${host}:${port}`,
            );
            possibleDirectories.push({
              statusCode: res.statusCode,
              protocol: protocolInUse,
              host: host,
              port: port,
            });
            break;
          case 403:
            console.log(
              `Status: ${res.statusCode} | ${protocolInUse}${host}:${port}`,
            );
            possibleDirectories.push({
              statusCode: res.statusCode,
              protocol: protocolInUse,
              host: host,
              port: port,
            });
            break;
          case 405:
            console.log(
              `Status: ${res.statusCode} | ${protocolInUse}${host}:${port}`,
            );
            possibleDirectories.push({
              statusCode: res.statusCode,
              protocol: protocolInUse,
              host: host,
              port: port,
            });
            break;
          case 500:
            console.log(
              `Status: ${res.statusCode} | ${protocolInUse}${host}:${port}`,
            );
            possibleDirectories.push({
              statusCode: res.statusCode,
              protocol: protocolInUse,
              host: host,
              port: port,
            });
            break;
          case 503:
            console.log(
              `Status: ${res.statusCode} | ${protocolInUse}${host}:${port}`,
            );
            possibleDirectories.push({
              statusCode: res.statusCode,
              protocol: protocolInUse,
              host: host,
              port: port,
            });
            break;
          default:
            break;
        }
        console.log(res.statusCode);
      });

      req.on(`error`, (e) => {
        console.error(e);
      });
      req.end();
    });
  }
  createFoundDirectories(host, possibleDirectories);
  return possibleDirectories;
}
