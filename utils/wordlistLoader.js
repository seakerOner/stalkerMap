//Read and parse wordlists   `./data/utils/${target}/DnsIPs.json`
import { readFile } from "node:fs/promises"

export async function getDnsIpsFile(target) {
    try {
        const filePath = new URL(`../data/utils/${target}/DnsIPs.json`, import.meta.url)
        const contents = await readFile(filePath, { encoding: "utf8" })
    } catch (error) {
        console.error(error)
    }
}


