//Read and parse wordlists   `./data/utils/${target}/DnsIPs.json`
import { readFile } from "node:fs/promises"
import fs from "node:fs";  
import { getOutputFolder } from "./createOutputDir.js";

const desktopOutputFolder = getOutputFolder()

export async function getDnsIpsFile(target) {
    try {
        const filePath = new URL(`${desktopOutputFolder}/data/appData/${target}/DnsIPs.json`, import.meta.url)
        const contents = await readFile(filePath, { encoding: "utf8" })
        const contentsParsed = JSON.parse(contents)
        return contentsParsed[0].address
    } catch (error) {
        console.error(error)
    }
}

export async function getResolveDnsIpsFiles(target, fromNsRecords = false, server = ``) {
    try {
        var filePathIpV4 
        var filePathIpV6 
        if (fromNsRecords == true) {
            filePathIpV4 = new URL(`${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv4_addresses_${server}_UsingNsRecord.json`, import.meta.url)
            filePathIpV6 = new URL(`${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv6_addresses_${server}_UsingNsRecord.json`, import.meta.url)
            
            if (await fs.existsSync(`${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv4_addresses_${server}_UsingNsRecord.json`)) {
                const contentsV4 = await readFile(filePathIpV4, { encoding: "utf8" })
                const contentsV4Parsed = JSON.parse(contentsV4)
                if (await fs.existsSync(`${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv6_addresses_${server}_UsingNsRecord.json`)) {
                    const contentsV6 = await readFile(filePathIpV6, { encoding: "utf8" })
                    const contentsV6Parsed = JSON.parse(contentsV6)
                    const contentsV0 = contentsV4Parsed.concat(contentsV6Parsed)
                    return contentsV0
                }
                const contentsV0 = contentsV4Parsed
                return contentsV0
            }
        }
        if (fromNsRecords == false){
            filePathIpV4 = new URL(`${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv4_addresses.json`, import.meta.url)
            filePathIpV6 = new URL(`${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv6_addresses.json`, import.meta.url)
            if (await fs.existsSync(`${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv4_addresses.json`)) {
                const contentsV4 = await readFile(filePathIpV4, { encoding: "utf8" })
                const contentsV4Parsed = JSON.parse(contentsV4)
                if (await fs.existsSync(`${desktopOutputFolder}/data/appData/${target}/DnsInfo/IPv6_addresses.json`)) {
                    const contentsV6 = await readFile(filePathIpV6, { encoding: "utf8" })
                    const contentsV6Parsed = JSON.parse(contentsV6)
                    const contentsV0 = contentsV4Parsed.concat(contentsV6Parsed)
                    return contentsV0
                }
                const contentsV0 = contentsV4Parsed
                return contentsV0
        }
        
}
    } catch (error) {
            console.error(error)
        }    
}

export async function getNsRecords(target, usingDig = false) {
    if (usingDig == true) {
        try {
            const filePath = new URL(`${desktopOutputFolder}/data/appData/${target}/DnsInfo/Ns_Records_WithDig.json`, import.meta.url)
            const contents = await readFile(filePath, { encoding: "utf8" })
            const contentsParsed = JSON.parse(contents)
            return contentsParsed.ANSWER.map(record => record.data)
        } catch (err) {
            console.error("No NS records file using dig command found")
        }
        
        
    } 
     if (usingDig == false){
        try {
            const filePath = new URL(`${desktopOutputFolder}/data/appData/${target}/DnsInfo/Ns_Records.json`, import.meta.url)
            const contents = await readFile(filePath, { encoding: "utf8" })
            const contentsParsed = JSON.parse(contents)
            return contentsParsed
        } catch (error) {
            console.error("No NS records file found")
        }
            
    }
}

export async function getSoaRecords(target) {
    if (fs.existsSync(`${desktopOutputFolder}/data/appData/${target}/DnsInfo/Soa_Records.json`)) {
        const filePath = new URL(`../data/appData/${target}/DnsInfo/Soa_Records.json`, import.meta.url)
        const contents = await readFile(filePath, { encoding: "utf8" })
        const contentsParsed = JSON.parse(contents)
        return contentsParsed
    } else {
        console.error("No SOA records file found");
    }
}

export async function parseDigOutput(stdout) {
    const lines = stdout.trim().split("\n")

    const results = lines.map(line => 
        line.trim()).filter(line => line.length > 0 && !line.startsWith(";"))
        .map(line => {
            const parts = line.split(/\s+/)

            if (parts.length < 4) {
                return null
            }

            const name = parts[0]
            const ttl = parseInt(parts[1], 10) || null
            const cls = parts[2]
            const type = parts[3]

            if (type.toUpperCase() === "OPT") {
                return null
            }

            const data = parts.splice(4).join(" ")
            return {
                name,
                ttl,
                class: cls,
                type,
                data
            }
        })
        .filter(record => record !== null)
    
    return results
}

export async function getTCPservices() {
    if (fs.existsSync(`${desktopOutputFolder}/data/appData/misc/tcp-services.json`)) {
        const filePath = new URL(`../data/appData/misc/tcp-services.json`, import.meta.url)
        const contents = await readFile(filePath, { encoding: "utf8" })
        const contentsParsed = JSON.parse(contents)
        return contentsParsed
    } else {
        console.error("No TCP services Wordlist file found");
    }
}