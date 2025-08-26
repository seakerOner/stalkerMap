//Read and parse wordlists   `./data/utils/${target}/DnsIPs.json`
import { readFile, readdir } from "node:fs/promises";
import fs from "node:fs";
import net from "node:net";
import { getOutputFolder } from "./createOutputDir.js";
import { createInterface } from "node:readline";

const desktopOutputFolder = getOutputFolder();

export async function getDnsIpsFile(target) {
  try {
    const filePath = new URL(
      `${desktopOutputFolder}/data/appData/${target}/DnsIPs.json`,
      import.meta.url,
    );
    const contents = await readFile(filePath, { encoding: "utf8" });
    const contentsParsed = JSON.parse(contents);
    // for (let i = 0; i < Object.keys(contentsParsed).length; i++) {
    //     if (contentsParsed[i].family == "4") {
    //         return contentsParsed[i].address
    //     }
    // }
    return contentsParsed;
  } catch (error) {
    console.error(error);
  }
}

export async function getResolveDnsIpsFiles(
  target,
  fromNsRecords = false,
  server = ``,
) {
  try {
    let filePathIpV4;
    let filePathIpV6;
    if (fromNsRecords == true) {
      filePathIpV4 = new URL(
        `${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv4_addresses_${server}_UsingNsRecord.json`,
        import.meta.url,
      );
      filePathIpV6 = new URL(
        `${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv6_addresses_${server}_UsingNsRecord.json`,
        import.meta.url,
      );

      if (
        await fs.existsSync(
          `${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv4_addresses_${server}_UsingNsRecord.json`,
        )
      ) {
        const contentsV4 = await readFile(filePathIpV4, { encoding: "utf8" });
        const contentsV4Parsed = JSON.parse(contentsV4);
        if (
          await fs.existsSync(
            `${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv6_addresses_${server}_UsingNsRecord.json`,
          )
        ) {
          const contentsV6 = await readFile(filePathIpV6, { encoding: "utf8" });
          const contentsV6Parsed = JSON.parse(contentsV6);
          const contentsV0 = contentsV4Parsed.concat(contentsV6Parsed);
          return contentsV0;
        }
        const contentsV0 = contentsV4Parsed;
        return contentsV0;
      }
    }
    if (fromNsRecords == false) {
      filePathIpV4 = new URL(
        `${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv4_addresses.json`,
        import.meta.url,
      );
      filePathIpV6 = new URL(
        `${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv6_addresses.json`,
        import.meta.url,
      );
      if (
        await fs.existsSync(
          `${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv4_addresses.json`,
        )
      ) {
        const contentsV4 = await readFile(filePathIpV4, { encoding: "utf8" });
        const contentsV4Parsed = JSON.parse(contentsV4);

        if (
          await fs.existsSync(
            `${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv6_addresses.json`,
          )
        ) {
          const contentsV6 = await readFile(filePathIpV6, { encoding: "utf8" });
          const contentsV6Parsed = JSON.parse(contentsV6);
          const contentsV0 = contentsV4Parsed.concat(contentsV6Parsed);
          return await setFamilyIP(contentsV0);
        }
        const contentsV0 = contentsV4Parsed;
        return await setFamilyIP(contentsV0);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function setFamilyIP(ipsList) {
  let cleanIPlist = [];
  for (let i = 0; i < ipsList.length; i++) {
    const isWhatIp = net.isIP(ipsList[i].address);
    if (isWhatIp == 4) {
      cleanIPlist.push({
        address: ipsList[i].address,
        family: 4,
      });
    }
    if (isWhatIp == 6) {
      cleanIPlist.push({
        address: ipsList[i].address,
        family: 6,
      });
    }
  }

  return cleanIPlist;
}
export async function getNsRecords(target, usingDig = false) {
  if (usingDig == true) {
    try {
      const filePath = new URL(
        `${desktopOutputFolder}/data/appData/${target}/DnsInfo/Ns_Records_WithDig.json`,
        import.meta.url,
      );
      const contents = await readFile(filePath, { encoding: "utf8" });
      const contentsParsed = JSON.parse(contents);
      return contentsParsed.ANSWER.map((record) => record.data);
    } catch (err) {
      console.error(err + "No NS records file using dig command found");
    }
  }
  if (usingDig == false) {
    try {
      const filePath = new URL(
        `${desktopOutputFolder}/data/appData/${target}/DnsInfo/Ns_Records.json`,
        import.meta.url,
      );
      const contents = await readFile(filePath, { encoding: "utf8" });
      const contentsParsed = JSON.parse(contents);
      return contentsParsed;
    } catch (error) {
      console.error(error + "No NS records file found");
    }
  }
}

export async function getReversedDns(target) {
  if (
    fs.existsSync(
      `${desktopOutputFolder}/data/appData/${target}/ReversedDnsFromIPs.json`,
    )
  ) {
    const filePath = new URL(
      `${desktopOutputFolder}/data/appData/${target}/ReversedDnsFromIPs.json`,
      import.meta.url,
    );
    const contents = await readFile(filePath, { encoding: "utf8" });
    const contentsParsed = JSON.parse(contents);
    return contentsParsed;
  } else {
    console.error("No Reversed DNS records from IP file found");
  }
}

export async function getSoaRecords(target) {
  if (
    fs.existsSync(
      `${desktopOutputFolder}/data/appData/${target}/DnsInfo/Soa_Records.json`,
    )
  ) {
    const filePath = new URL(
      `${desktopOutputFolder}/data/appData/${target}/DnsInfo/Soa_Records.json`,
      import.meta.url,
    );
    const contents = await readFile(filePath, { encoding: "utf8" });
    const contentsParsed = JSON.parse(contents);
    return contentsParsed;
  } else {
    console.error("No SOA records file found");
  }
}

export async function parseDigOutput(stdout) {
  const lines = stdout.trim().split("\n");

  const results = lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith(";"))
    .map((line) => {
      const parts = line.split(/\s+/);

      if (parts.length < 4) {
        return null;
      }

      const name = parts[0];
      const ttl = parseInt(parts[1], 10) || null;
      const cls = parts[2];
      const type = parts[3];

      if (type.toUpperCase() === "OPT") {
        return null;
      }

      const data = parts.splice(4).join(" ");
      return {
        name,
        ttl,
        class: cls,
        type,
        data,
      };
    })
    .filter((record) => record !== null);

  return results;
}

export async function checkTCPservices(serviceToAnalize) {
  return new Promise((resolve, reject) => {
    let resolved = false;
    try {
      const fileStream = fs.createReadStream(
        `${desktopOutputFolder}/data/appData/misc/tcp-services.txt`,
      );

      fileStream.on("error", reject);

      const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      rl.on("line", (line) => {
        try {
          const services = line
            .split(",")
            .map((s) => s.trim().replace(/^"|"$/g, ``));
          if (services.includes(serviceToAnalize)) {
            if (!resolved) {
              resolved = true;
              rl.close();
              resolve(true);
            }
          }
        } catch (error) {
          console.log(error);
        }
      });

      rl.on("close", () => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      });
    } catch (err) {
      console.error(err);
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    }
  });
}
export async function getWordlistDirPaths() {
  try {
    const files = await readdir(
      `${desktopOutputFolder}/data/appData/wordlists`,
    );
    return files;
  } catch (error) {
    console.error(error + " Error getting the wordlist folder :/");
  }
}
export async function getChosenWordlist(path) {
  if (fs.existsSync(`${desktopOutputFolder}/data/appData/wordlists/${path}`)) {
    const filePath = new URL(
      `${desktopOutputFolder}/data/appData/wordlists/${path}`,
      import.meta.url,
    );
    const contents = await readFile(filePath, { encoding: "utf8" });
    const contentsParsed = contents.split(/\r?\n/).filter(Boolean);
    return contentsParsed;
  } else {
    console.error(
      "No wordlist file found at: " +
        `${desktopOutputFolder}/data/appData/wordlists/${path}`,
    );
  }
}
