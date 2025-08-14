//Port Scanning
import net from "node:net";
import dns from "node:dns";
import { createPortServicesFile, 
    createTargetDirectory, 
    createDnsIpsFile, 
    createDnsResolveFiles, 
    createDnsResolveDirectory } from "../utils/logger.js";
import {getDnsIpsFile, getResolveDnsIpsFiles} from "../utils/wordlistLoader.js";
import { forceRecords } from "./dnsRecordsAuthoritative.js";
const dnsPromises = dns.promises;

export async function scanner(urlData, CTFmode) {

    if (urlData.getTargetType === `dns`) {

        await createTargetDirectory(urlData.getTarget)
        console.log("Checking DNS...");
        
        if (CTFmode == true) {
            if (urlData.getTargetType == "dns") {
                await dnsLookup(urlData);
                //scanPorts(urlData, CTFmode)
            }
        } else if (CTFmode == false){
            if (urlData.getTargetType == "dns") {
                createDnsResolveDirectory(urlData.getTarget)
                dnsResolver(urlData);
            }
        }
    }
    //  const client = net.createConnection({ port:urlData.getPort })
}

async function dnsLookup(urlData) {
    const dnsOptions = {
        family: 0,
        hints: dns.ADDRCONFIG | dns.V4MAPPED,
        all: true,
        order: "ipv4first"
    }
    
    // @ts-ignore
    await dnsPromises.lookup(urlData.getTarget,dnsOptions).then((addresses)=>{
        console.log("Looked up some IPs!");
        console.log(addresses)
        createDnsIpsFile(urlData.getTarget, addresses)
    }).catch((err) => {
        console.error(err + " (Something went wrong looking up the DNS...)");
    })
}

async function dnsResolver(urlData) {
    //maybe use ttl (time to live) as a timer so we know when we can re-resolve again
    var failedResolves = []
    const options = {
        ttl: true,
    }

    await dnsPromises.resolve4(urlData.getTarget,options).then((addressesV4)=>{
        console.log("We got some IPv4's!!")
        console.log(addressesV4)
        createDnsResolveFiles(urlData.getTarget, "IPv4_addresses", addressesV4)
    }).catch((err)=>{
        if (err.code === "ENODATA") {
            failedResolves.push("A")
        } else if (err.code === "ENOTFOUND"){
            failedResolves.push("A")
        } else {
            failedResolves.push("A")
            console.error(err + " (Something went wrong resolving the IPv4's of the given DNS)");
        }
    })

    await dnsPromises.resolve6(urlData.getTarget, options).then((addressesV6)=>{
        console.log("We got some IPv6's!!")
        console.log(addressesV6)
        createDnsResolveFiles(urlData.getTarget, "IPv6_addresses", addressesV6)
    }).catch((err)=>{
        if (err.code === "ENODATA") {
            failedResolves.push("AAAA")
        } else if (err.code === "ENOTFOUND"){
            failedResolves.push("AAAA")
        } else {
            failedResolves.push("AAAA")
            console.error(err + " (Something went wrong resolving the IPv6's of the given DNS)");
        }
    })

    await dnsPromises.resolveCaa(urlData.getTarget).then((recordsCaa)=>{
        console.log("We got some Caa records of the Hostname!!")
        console.log(recordsCaa)
        createDnsResolveFiles(urlData.getTarget, "Caa_Records", recordsCaa)
    }).catch((err)=>{
        if (err.code === "ENODATA") {
            failedResolves.push("CAA")
        } else if (err.code === "ENOTFOUND"){
            failedResolves.push("CAA")
        } else {
            failedResolves.push("CAA")
            console.error(err + " (Something went wrong resolving the Caa records of the given DNS)");
        }
    })

    await dnsPromises.resolveCname(urlData.getTarget).then((recordsCname)=>{
        console.log("We got some Cname records of the Hostname!!")
        console.log(recordsCname)
        createDnsResolveFiles(urlData.getTarget, "Cname_Records", recordsCname)
    }).catch((err)=>{
        if (err.code === "ENODATA") {
            failedResolves.push("CNAME")
        } else if (err.code === "ENOTFOUND"){
            failedResolves.push("CNAME")
        } else {
            failedResolves.push("CNAME")
            console.error(err + " (Something went wrong resolving the Cname records of the given DNS)");
        }
    })

    await dnsPromises.resolveMx(urlData.getTarget).then((recordsMx)=>{
        console.log("We got some Mx records for the Hostname!!")
        console.log(recordsMx)
        createDnsResolveFiles(urlData.getTarget, "Mx_Records", recordsMx)
    }).catch((err)=>{
        if (err.code === "ENODATA") {
            failedResolves.push("MX")
        } else if (err.code === "ENOTFOUND"){
            failedResolves.push("MX")
        } else {
            failedResolves.push("MX")
            console.error(err + " (Something went wrong resolving the Mx records of the given DNS)");
        }
    })

    await dnsPromises.resolveNaptr(urlData.getTarget).then((recordsNaptr)=>{
        console.log("We got some Naptr records of the Hostname!!")
        console.log(recordsNaptr)
        createDnsResolveFiles(urlData.getTarget, "Naptr_Records", recordsNaptr)
    }).catch((err)=>{
        if (err.code === "ENODATA") {
            failedResolves.push("NAPTR")
        } else if (err.code === "ENOTFOUND"){
            failedResolves.push("NAPTR")
        } else {
            failedResolves.push("NAPTR")
            console.error(err + " (Something went wrong resolving the Naptr records of the given DNS)");
        }
    })

    await dnsPromises.resolveNs(urlData.getTarget).then((recordsNs)=>{
        console.log("We got some Ns records of the Hostname!!")
        console.log(recordsNs)
        createDnsResolveFiles(urlData.getTarget, "Ns_Records", recordsNs)
    }).catch((err)=>{
        if (err.code === "ENODATA") {
            failedResolves.push("NS")
        } else if (err.code === "ENOTFOUND"){
            failedResolves.push("NS")
        } else {
            failedResolves.push("NS")
            console.error(err + " (Something went wrong resolving the Ns records of the given DNS)");
        }
    })

    await dnsPromises.resolvePtr(urlData.getTarget).then((recordsPtr)=>{
        console.log("We got some Ptr records of the Hostname!!")
        console.log(recordsPtr)
        createDnsResolveFiles(urlData.getTarget, "Ptr_Records", recordsPtr)
    }).catch((err)=>{
        if (err.code === "ENODATA") {
            failedResolves.push("PTR")
        } else if (err.code === "ENOTFOUND"){
            failedResolves.push("PTR")
        } else {
            failedResolves.push("PTR")
            console.error(err + " (Something went wrong resolving the Ptr records of the given DNS)");
        }
    })

    await dnsPromises.resolveSoa(urlData.getTarget).then((recordsSoa)=>{
        console.log("We got some Soa records of the Hostname!!")
        console.log(recordsSoa)
        createDnsResolveFiles(urlData.getTarget, "Soa_Records", recordsSoa)
    }).catch((err)=>{
        if (err.code === "ENODATA") {
            failedResolves.push("SOA")
        } else if (err.code === "ENOTFOUND"){
            failedResolves.push("SOA")
        } else {
            failedResolves.push("SOA")
            console.error(err + " (Something went wrong resolving the Soa records of the given DNS)");
        }
    })

    await dnsPromises.resolveSrv(urlData.getTarget).then((recordsSrv)=>{
        console.log("We got some Srv records of the Hostname!!")
        console.log(recordsSrv)
        createDnsResolveFiles(urlData.getTarget, "Srv_Records", recordsSrv)
    }).catch((err)=>{
        if (err.code === "ENODATA") {
            failedResolves.push("SRV")
        } else if (err.code === "ENOTFOUND"){
            failedResolves.push("SRV")
        } else {
            failedResolves.push("SRV")
            console.error(err + " (Something went wrong resolving the Srv records of the given DNS)");
        }
    })

    await dnsPromises.resolveTxt(urlData.getTarget).then((recordsTxt)=>{
        console.log("We got some Txt records of the Hostname!!")
        console.log(recordsTxt)
        createDnsResolveFiles(urlData.getTarget, "Txt_Records", recordsTxt)
    }).catch((err)=>{
        if (err.code === "ENODATA") {
            failedResolves.push("TXT")
        } else if (err.code === "ENOTFOUND"){
            failedResolves.push("TXT")
        } else {
            failedResolves.push("TXT")
            console.error(err + " (Something went wrong resolving the Txt records of the given DNS)");
        }
    })

    if (failedResolves.length > 0) {
        console.log(`Some records failed.. lets "dig" deeper then :P`)
        forceRecords(urlData.getTarget, failedResolves)
    }
}

async function getDNSfromIP(urlData) {
    await dnsPromises.reverse(urlData.getTarget).then((reversedIPs)=>{
        console.log("We reversed some IP addresses from the DNS!!")
        console.log(reversedIPs)
        return reversedIPs;
    }).catch((err)=>{
        if (err.code === "ENODATA") {
            
        } else if (err.code === "ENOTFOUND"){

        } else {
            console.error(err + " (Something went wrong reversing to the IPs of the given DNS)");
        }
    })
}

async function scanPorts(urlData , CTFmode) {
    if (CTFmode == true) {
        const ipList = await getDnsIpsFile(urlData.getTarget)
    } else if (CTFmode == false) {
        const ipList = getResolveDnsIpsFiles(urlData.getTarget)
    }
    let servicesList = await getServices(urlData.getTarget, urlData.getPort);
    createPortServicesFile(urlData.getTarget, servicesList)
}

async function getServices(target, port) {
    var servicesList = {}
    if (port === '') {
        for (let i = 1; i <= 65536; i++) {
            await dnsPromises.lookupService(target, i).then((result)=>{
            console.log("Scanning")
            let service = result.service
            servicesList.i = service
        }).catch((err)=>{
            throw err + " (Something went wrong getting the service of the port "+ i +")";
        })
        }
    } else {
        await dnsPromises.lookupService(target, port).then((result)=>{
            console.log(result.hostname + " " + result.service)
            let service = result.service
            servicesList.urlData.getPort = service
        }).catch((err)=>{
            throw err + " (Something went wrong getting the service of the port "+ port +")";
        })
    }
    return servicesList
}