//logging on console/files
import { mkdir, writeFile } from "node:fs/promises";
import fs from "node:fs";


export async function createTargetDirectory(target) {
 
    if (!fs.existsSync(`../data/appData/${target}`)) {
        console.log("There is no appData directory for the target " + target); 
        console.log("Creating the directory...")
        const projectFolder = new URL(`../data/appData/${target}`, import.meta.url)
        const createDir = await mkdir(projectFolder, { recursive: true })
        console.log("Created " + createDir)
    } else {
        console.log(target + " appData directory already exists")
    }
    
    if (!fs.existsSync(`../data/${target}`)) {
        console.log("There is no directory for the target " + target); 
        console.log("Creating the directory...")
        const projectFolder = new URL(`../data/${target}`, import.meta.url)
        const createDir = await mkdir(projectFolder, { recursive: true })
        console.log("Created " + createDir)
    }  else {
        console.log(target + " directory already exists")
    }

}
export function createPortServicesFile(target, servicesList) {
    servicesList = JSON.stringify(servicesList);
        fs.writeFile(`./data/appData/${target}/DnsIPs.json`, servicesList, "utf8",(err)=> {
            if (err) console.error(err)
        })
}

export function createDnsIpsFile(target, dnsIPs) {
        dnsIPs = JSON.stringify(dnsIPs);
        fs.writeFile(`./data/appData/${target}/DnsIPs.json`, dnsIPs, "utf8",(err)=> {
            if (err) console.error(err)
        })
    
}

export async function createDnsResolveDirectory(target) {
    if (!fs.existsSync(`../data/appData/${target}/DnsInfo`)) {
        console.log("There is no DnsInfo directory for the target " + target); 
        console.log("Creating the directory...")
        const projectFolder = new URL(`../data/appData/${target}/DnsInfo`, import.meta.url)
        const createDir = await mkdir(projectFolder, { recursive: true })
        console.log("Created " + createDir)
    } else {
        console.log(target + " DnsInfo directory already exists")
    }
}

export function createDnsResolveFiles(target, fileName, data) {
        data = JSON.stringify(data);
        fs.writeFile(`./data/appData/${target}/DnsInfo/${fileName}.json`, data, "utf8",(err)=> {
            if (err) console.error(err)
        })
    
}