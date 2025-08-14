//Read and parse wordlists   `./data/utils/${target}/DnsIPs.json`
import { readFile } from "node:fs/promises"
import fs from "node:fs";  

export async function getDnsIpsFile(target) {
    try {
        const filePath = new URL(`../data/appData/${target}/DnsIPs.json`, import.meta.url)
        const contents = await readFile(filePath, { encoding: "utf8" })
        const contentsParsed = JSON.parse(contents)
        return contentsParsed
    } catch (error) {
        console.error(error)
    }
}

export async function getResolveDnsIpsFiles(target, fromNsRecords = false, server = ``) {
    try {
        var filePathIpV4 
        var filePathIpV6 
        if (fromNsRecords == true) {
            filePathIpV4 = new URL(`../data/appData/${target}/DnsInfo/IPv4_addresses_${server}_UsingNsRecord.json`, import.meta.url)
            filePathIpV6 = new URL(`../data/appData/${target}/DnsInfo/IPv6_addresses_${server}_UsingNsRecord.json`, import.meta.url)
            
            if (await fs.existsSync(`./data/appData/${target}/DnsInfo/IPv4_addresses_${server}_UsingNsRecord.json`)) {
                const contentsV4 = await readFile(filePathIpV4, { encoding: "utf8" })
                const contentsV4Parsed = JSON.parse(contentsV4)
                if (await fs.existsSync(`./data/appData/${target}/DnsInfo/IPv6_addresses_${server}_UsingNsRecord.json`)) {
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
            filePathIpV4 = new URL(`../data/appData/${target}/DnsInfo/IPv4_addresses_${server}.json`, import.meta.url)
            filePathIpV6 = new URL(`../data/appData/${target}/DnsInfo/IPv6_addresses_${server}.json`, import.meta.url)
            if (await fs.existsSync(`./data/appData/${target}/DnsInfo/IPv4_addresses_${server}.json`)) {
                const contentsV4 = await readFile(filePathIpV4, { encoding: "utf8" })
                const contentsV4Parsed = JSON.parse(contentsV4)
                if (await fs.existsSync(`./data/appData/${target}/DnsInfo/IPv6_addresses_${server}.json`)) {
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
            const filePath = new URL(`../data/appData/${target}/DnsInfo/Ns_Records_WithDig.json`, import.meta.url)
            const contents = await readFile(filePath, { encoding: "utf8" })
            const contentsParsed = JSON.parse(contents)
            return contentsParsed.ANSWER.map(record => record.data)
        } catch (err) {
            console.error("No NS records file using dig command found")
        }
        
        
    } 
     if (usingDig == false){
        try {
            const filePath = new URL(`../data/appData/${target}/DnsInfo/Ns_Records.json`, import.meta.url)
            const contents = await readFile(filePath, { encoding: "utf8" })
            const contentsParsed = JSON.parse(contents)
            return contentsParsed
        } catch (error) {
            console.error("No NS records file found")
        }
            
    }
}

export async function getSoaRecords(target) {
    if (fs.existsSync(`../data/appData/${target}/DnsInfo/Soa_Records.json`)) {
        const filePath = new URL(`../data/appData/${target}/DnsInfo/Soa_Records.json`, import.meta.url)
        const contents = await readFile(filePath, { encoding: "utf8" })
        const contentsParsed = JSON.parse(contents)
        return contentsParsed
    } else {
        console.error("No SOA records file found");
    }
}