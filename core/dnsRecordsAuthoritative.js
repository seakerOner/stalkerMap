import { Resolver } from "node:dns/promises"
import dns from "node:dns"
import { createDnsResolveFiles } from "../utils/logger.js";
import { getNsRecords, getSoaRecords } from "../utils/wordlistLoader.js";
import { exec } from "node:child_process";
import { promisify } from "node:util";
// If any records gets ENODATA (No data) or any error 
// (Using Node)
// We retry using the NS records to resolve again the records
//      If there arent any NS records we use the first option of SOA record as the primary authoritative  
//          If nothing works
//              (Using dig)
//          Dig the NS records and resolve again the records
// 
const dnsPromises = dns.promises;
const execAsync = promisify(exec)

export async function forceRecords(target, failedRecords) {
    var hasNS = true
    var hasSOA = true

    for (let i = 0; i < failedRecords.length; i++) {
        if (failedRecords[i] == "NS") {
            hasNS = false
        } 
        if (failedRecords[i] == "SOA") {
            hasSOA = false
        }
    }

    if (hasNS == true) {
        const nsRecords = await getNsRecords(target)
        //resolve with ns records
        let remainingFailedRecords = await retryResolveRecords(target, nsRecords, failedRecords, hasNS)
        //dig remaining records with ns 
        if (remainingFailedRecords.length > 0) {
            await digRecords(target, nsRecords, remainingFailedRecords)
        }
    } else if (hasNS == false) {
        if (hasSOA == true) {
            //get authoritative from SOA and resolve 
            const soaRecords = await getSoaRecords(target)
            const nsRecord = soaRecords["nsname"]
            let remainingFailedRecords = await retryResolveRecords(target, nsRecord, failedRecords, true)
            if (remainingFailedRecords.length > 0) {
                await digRecords(target, nsRecord, remainingFailedRecords)
            }
        }
    }
    if (hasNS == false && hasSOA == false) {
        //DIG target NS and resolve
        await digNsRecord(target)
        const nsRecord = await getNsRecords(target, true)
        let remainingFailedRecords = await retryResolveRecords(target, nsRecord, failedRecords, true)
        if (remainingFailedRecords.length > 0) {
            await digRecords(target, nsRecord, remainingFailedRecords)
        }
    }
}

async function retryResolveRecords(target, nsRecords, failedRecords, isFromNsRecords) {
    const resolver = new Resolver()
    var cont = 0
    var serverFailedRecords = {}
    
    nsRecords.forEach(async server => {
        resolver.setServers(server)
        serverFailedRecords[cont] = await getRecords(target, failedRecords, isFromNsRecords)
        cont = cont + 1
    });
    return serverFailedRecords
}

async function digNsRecord(target) {
    const { stdout, stderr } = await execAsync(`dig ${target} NS A +json`) 
    if (stderr) {
        console.error("Dig command error: " + stderr)
    } else {
        const data = JSON.parse(stdout)
        const isUsingDig = true
        await createDnsResolveFiles(target, "Ns_Records", data, false, isUsingDig)
    }
}

async function digRecords(target, nsRecords,remainingFailedRecords) {

    for (let i = 0; i < nsRecords.length; i++) {
        for (let x = 0; x < remainingFailedRecords.length; x++) {
            var actualFailedRecord = remainingFailedRecords[i][x]
            
            const { stdout, stderr } = await execAsync(`dig @${nsRecords[i]} ${target} ${actualFailedRecord} +json`) 
            if (stderr) {
                console.error("Dig commmand error: " + stderr) 
            } else {
                const data = JSON.parse(stdout)
                const isUsingDig = true
                if (actualFailedRecord == "A") {
                    await createDnsResolveFiles(target, "IPv4_addresses", data, false, isUsingDig)
                }
                if (actualFailedRecord == "AAAA") {
                    await createDnsResolveFiles(target, "IPv6_addresses", data, false, isUsingDig)
                }
                if (actualFailedRecord == "CAA") {
                    await createDnsResolveFiles(target, "Caa_Records", data, false, isUsingDig)
                }
                if (actualFailedRecord == "CNAME") {
                    await createDnsResolveFiles(target, "Cname_Records", data, false, isUsingDig)
                }
                if (actualFailedRecord == "MX") {
                    await createDnsResolveFiles(target, "Mx_Records", data, false, isUsingDig)
                }
                if (actualFailedRecord == "NAPTR") {
                    await createDnsResolveFiles(target, "Naptr_Records", data, false, isUsingDig)
                }
                if (actualFailedRecord == "NS") {
                    await createDnsResolveFiles(target, "Ns_Records", data, false, isUsingDig)
                }
                if (actualFailedRecord == "PTR") {
                    await createDnsResolveFiles(target, "Ptr_Records", data, false, isUsingDig)
                }
                if (actualFailedRecord == "SOA") {
                    await createDnsResolveFiles(target, "Soa_Records", data, false, isUsingDig)
                }
                if (actualFailedRecord == "SVR") {
                    await createDnsResolveFiles(target, "Srv_Records", data, false, isUsingDig)
                }
                if (actualFailedRecord == "TXT") {
                    await createDnsResolveFiles(target, "Txt_Records", data, false, isUsingDig)
                }
            }
            
        }
    }
}

async function getRecords(target, failedRecords, isFromNsRecords) {
    
    let failedResolves = []
    
    for (let i = 0; i < failedRecords.length; i++) {
        if (failedRecords[i] == "A") {
            const options = {
            ttl: true,
            }   
            await dnsPromises.resolve4(target,options).then((addressesV4)=>{
                console.log("We got some IPv4's!!")
                console.log(addressesV4)
                if (isFromNsRecords == true) {
                    createDnsResolveFiles(target, "IPv4_addresses", addressesV4, isFromNsRecords)
                }
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
        } else if (failedRecords[i] == "AAAA") {
            const options = {
            ttl: true,
            } 
            await dnsPromises.resolve6(target, options).then((addressesV6)=>{
                console.log("We got some IPv6's!!")
                console.log(addressesV6)
                if (isFromNsRecords == true) {
                    createDnsResolveFiles(target, "IPv6_addresses", addressesV6, isFromNsRecords)
                }
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
        } else if (failedRecords[i] == "CAA") {
            await dnsPromises.resolveCaa(target).then((recordsCaa)=>{
                console.log("We got some Caa records of the Hostname!!")
                console.log(recordsCaa)
                if (isFromNsRecords == true) {
                    createDnsResolveFiles(target, "Caa_Records", recordsCaa, isFromNsRecords)
                }
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
        } else if (failedRecords[i] == "CNAME") {
            await dnsPromises.resolveCname(target).then((recordsCname)=>{
                console.log("We got some Cname records of the Hostname!!")
                console.log(recordsCname)
                if (isFromNsRecords == true) {
                    createDnsResolveFiles(target, "Cname_Records", recordsCname, isFromNsRecords)
                }
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
        } else if (failedRecords[i] == "MX") {
            await dnsPromises.resolveMx(target).then((recordsMx)=>{
            console.log("We got some Mx records for the Hostname!!")
                console.log(recordsMx)
                if (isFromNsRecords == true) {
                    createDnsResolveFiles(target, "Mx_Records", recordsMx, isFromNsRecords)
                }
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
        } else if (failedRecords[i] == "NAPTR") {
            await dnsPromises.resolveNaptr(target).then((recordsNaptr)=>{
                console.log("We got some Naptr records of the Hostname!!")
                console.log(recordsNaptr)
                if (isFromNsRecords == true) {
                    createDnsResolveFiles(target, "Naptr_Records", recordsNaptr, isFromNsRecords)
                }
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
        } else if (failedRecords == "NS") {
            await dnsPromises.resolveNs(target).then((recordsNs)=>{
                console.log("We got some Ns records of the Hostname!!")
                console.log(recordsNs)
                if (isFromNsRecords == true) {
                    createDnsResolveFiles(target, "Ns_Records", recordsNs, isFromNsRecords)
                }
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
        } else if (failedRecords[i] == "PTR") {
            await dnsPromises.resolvePtr(target).then((recordsPtr)=>{
                console.log("We got some Ptr records of the Hostname!!")
                console.log(recordsPtr)
                if (isFromNsRecords == true) {
                    createDnsResolveFiles(target, "Ptr_Records", recordsPtr, isFromNsRecords)
                }
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
        } else if (failedRecords[i] == "SOA") {
            await dnsPromises.resolveSoa(target).then((recordsSoa)=>{
                console.log("We got some Soa records of the Hostname!!")
                console.log(recordsSoa)
                if (isFromNsRecords == true) {
                    createDnsResolveFiles(target, "Soa_Records", recordsSoa, isFromNsRecords)
                }
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
        } else if (failedRecords[i] == "SRV") {
            await dnsPromises.resolveSrv(target).then((recordsSrv)=>{
                console.log("We got some Srv records of the Hostname!!")
                console.log(recordsSrv)
                if (isFromNsRecords == true) {
                    createDnsResolveFiles(target, "Srv_Records", recordsSrv, isFromNsRecords)
                }
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
        } else if (failedRecords[i] == "TXT") {
            await dnsPromises.resolveTxt(target).then((recordsTxt)=>{
                console.log("We got some Txt records of the Hostname!!")
                console.log(recordsTxt)
                if (isFromNsRecords == true) {
                    createDnsResolveFiles(target, "Txt_Records", recordsTxt, isFromNsRecords)
                } 
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
        }
    }
    
    return failedResolves
}