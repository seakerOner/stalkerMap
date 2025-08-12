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
    try {
        servicesList = JSON.stringify(servicesList, null, 2);
        writeFile(`../data/utils/${target}/portServices.json`, servicesList, `utf8`)
    } catch (error) {
        console.error(error + " (Something went wrong when saving the services list on a file)")
    }
}

export function createDnsIpsFile(target, dnsIPs) {
        dnsIPs = JSON.stringify(dnsIPs);
        fs.writeFile(`./data/appData/${target}/DnsIPs.json`, dnsIPs, "utf8",(err)=> {
            if (err) console.error(err)
        })
    
}