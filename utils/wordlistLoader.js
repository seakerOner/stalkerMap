//Read and parse wordlists   `./data/utils/${target}/DnsIPs.json`
import { readFile } from "node:fs/promises"

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

export async function getResolveDnsIpsFiles(target) {
    try {
        const filePathIpV4 = new URL(`../data/appData/${target}/DnsInfo/IPv4_addresses.json`, import.meta.url)
        const filePathIpV6 = new URL(`../data/appData/${target}/DnsInfo/IPv6_addresses.json`, import.meta.url)
        const contentsV4 = await readFile(filePathIpV4, { encoding: "utf8" })
        const contentsV6 = await readFile(filePathIpV6, { encoding: "utf8" })
        const contentsV4Parsed = JSON.parse(contentsV4)
        const contentsV6Parsed = JSON.parse(contentsV6)
        const contentsV0 = contentsV4Parsed.concat(contentsV6Parsed)
        return contentsV0
    } catch (error) {
            console.error(error)
        }    
}

