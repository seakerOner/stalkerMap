//logging on console/files
import { mkdir } from "node:fs/promises";
import fs from "node:fs";
import { getOutputFolder } from "./createOutputDir.js";

const desktopOutputFolder = getOutputFolder();

export async function createTargetDirectory(target) {
  if (!fs.existsSync(`${desktopOutputFolder}/data/appData/${target}`)) {
    console.log("There is no appData directory for the target " + target);
    console.log("Creating the directory...");
    const projectFolder = new URL(
      `${desktopOutputFolder}/data/appData/${target}`,
      import.meta.url,
    );
    const createDir = await mkdir(projectFolder, { recursive: true });
    console.log("Created " + createDir);
  } else {
    console.log(target + " appData directory already exists");
  }

  if (!fs.existsSync(`${desktopOutputFolder}/data/${target}`)) {
    console.log("There is no directory for the target " + target);
    console.log("Creating the directory...");
    const projectFolder = new URL(
      `${desktopOutputFolder}/data/${target}`,
      import.meta.url,
    );
    const createDir = await mkdir(projectFolder, { recursive: true });
    console.log("Created " + createDir);
  } else {
    console.log(target + " directory already exists");
  }
}
export function createPortServicesFile(target, servicesList) {
  servicesList = JSON.stringify(servicesList);
  fs.writeFile(
    `${desktopOutputFolder}/data/appData/${target}/PortServices.json`,
    servicesList,
    "utf8",
    (err) => {
      if (err) console.error(err);
    },
  );
}

export function createDnsIpsFile(target, dnsIPs) {
  dnsIPs = JSON.stringify(dnsIPs);
  fs.writeFile(
    `${desktopOutputFolder}/data/appData/${target}/DnsIPs.json`,
    dnsIPs,
    "utf8",
    (err) => {
      if (err) console.error(err);
    },
  );
}

export function createDnsReversedFromIpFile(target, dnsFromIP) {
  dnsFromIP = JSON.stringify(dnsFromIP);
  fs.writeFile(
    `${desktopOutputFolder}/data/appData/${target}/ReversedDnsFromIPs.json`,
    dnsFromIP,
    "utf8",
    (err) => {
      if (err) console.error(err);
    },
  );
}

export async function createDnsResolveDirectory(target) {
  if (!fs.existsSync(`${desktopOutputFolder}/data/appData/${target}/DnsInfo`)) {
    console.log("There is no DnsInfo directory for the target " + target);
    console.log("Creating the directory...");
    const projectFolder = new URL(
      `${desktopOutputFolder}/data/appData/${target}/DnsInfo`,
      import.meta.url,
    );
    const createDir = await mkdir(projectFolder, { recursive: true });
    console.log("Created " + createDir);
  } else {
    console.log(target + " DnsInfo directory already exists");
  }
}

export async function createDnsResolveFiles(
  target,
  fileName,
  data,
  fromNS = false,
  fromDig = false,
) {
  let path = ``;
  if (fromNS == true) {
    path = `${desktopOutputFolder}/data/appData/${target}/DnsInfo/${fileName}UsingNsRecord.json`;
  } else if (fromNS == false) {
    path = `${desktopOutputFolder}/data/appData/${target}/DnsInfo/${fileName}.json`;
  }
  if (fromDig == true) {
    path = `${desktopOutputFolder}/data/appData/${target}/DnsInfo/${fileName}UsingNsRecord_WithDig.json`;
  }
  data = JSON.stringify(data);
  await fs.writeFile(path, data, "utf8", (err) => {
    if (err) console.error(err);
  });
}

export function createFoundDirectories(target, possibleDirectories) {
  possibleDirectories = JSON.stringify(possibleDirectories);
  fs.writeFile(
    `${desktopOutputFolder}/data/appData/${target}/EnumeratedDir.json`,
    possibleDirectories,
    "utf8",
    (err) => {
      if (err) console.error(err);
    },
  );
}
