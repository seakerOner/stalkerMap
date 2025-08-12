//Port Scanning
import net from "node:net";
import dns from "node:dns";
import { createPortServicesFile, createTargetDirectory, createDnsIpsFile } from "../utils/logger.js";
import {getDnsIpsFile} from "../utils/wordlistLoader.js";
      
const dnsPromises = dns.promises;

export async function scanner(urlData, CTFmode) {

    if (urlData.getTargetType === `dns`) {

        await createTargetDirectory(urlData.getTarget)
        console.log("Checking DNS...");
        
        if (CTFmode == true) {
            if (urlData.getTargetType == "dns") {
                await dnsLookup(urlData);
                console.log("PORT SCAN: ")
                // let servicesList = getServices(urlData);
                // createPortServicesFile(urlData.getTarget, servicesList)
            }
        } else if (CTFmode == false){
            dnsResolver(urlData);
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
   
    await dnsPromises.resolve4(urlData.getTarget[{ttl: true}]).then((addressesV4)=>{
        console.log("We got some IPv4's!!")
        console.log(addressesV4)
    }).catch((err)=>{
        console.error(err + " (Something went wrong resolving the IPv4's of the given DNS)");
    })

    await dnsPromises.resolve6(urlData.getTarget[{ttl: true}]).then((addressesV6)=>{
        console.log("We got some IPv6's!!")
        console.log(addressesV6)
    }).catch((err)=>{
        console.error(err + " (Something went wrong resolving the IPv6's of the given DNS)");
    })

    await dnsPromises.resolveCaa(urlData.getTarget).then((recordsCaa)=>{
        console.log("We got some Caa records of the Hostname!!")
        console.log(recordsCaa)
    }).catch((err)=>{
        console.error(err + " (Something went wrong resolving the Caa records of the given DNS)");
    })

    await dnsPromises.resolveCname(urlData.getTarget).then((recordsCname)=>{
        console.log("We got some Cname records of the Hostname!!")
        console.log(recordsCname)
    }).catch((err)=>{
        console.error(err + " (Something went wrong resolving the Cname records of the given DNS)");
    })

    await dnsPromises.resolveMx(urlData.getTarget).then((recordsMx)=>{
        console.log("We got some Mx records for the Hostname!!")
        console.log(recordsMx)
    }).catch((err)=>{
        console.error(err + " (Something went wrong resolving the Mx records of the given DNS)");
    })

    await dnsPromises.resolveNaptr(urlData.getTarget).then((recordsNaptr)=>{
        console.log("We got some Naptr records of the Hostname!!")
        console.log(recordsNaptr)
    }).catch((err)=>{
        console.error(err + " (Something went wrong resolving the Naptr records of the given DNS)");
    })

    await dnsPromises.resolveNs(urlData.getTarget).then((recordsNs)=>{
        console.log("We got some Ns records of the Hostname!!")
        console.log(recordsNs)
    }).catch((err)=>{
        console.error(err + " (Something went wrong resolving the Ns records of the given DNS)");
    })

    await dnsPromises.resolvePtr(urlData.getTarget).then((recordsPtr)=>{
        console.log("We got some Ptr records of the Hostname!!")
        console.log(recordsPtr)
    }).catch((err)=>{
        console.error(err + " (Something went wrong resolving the Ptr records of the given DNS)");
    })

    await dnsPromises.resolveSoa(urlData.getTarget).then((recordsSoa)=>{
        console.log("We got some Soa records of the Hostname!!")
        console.log(recordsSoa)
    }).catch((err)=>{
        console.error(err + " (Something went wrong resolving the Soa records of the given DNS)");
    })

    await dnsPromises.resolveSrv(urlData.getTarget).then((recordsSrv)=>{
        console.log("We got some Srv records of the Hostname!!")
        console.log(recordsSrv)
    }).catch((err)=>{
        console.error(err + " (Something went wrong resolving the Srv records of the given DNS)");
    })

    await dnsPromises.resolveTxt(urlData.getTarget).then((recordsTxt)=>{
        console.log("We got some Txt records of the Hostname!!")
        console.log(recordsTxt)
    }).catch((err)=>{
        console.error(err + " (Something went wrong resolving the Txt records of the given DNS)");
    })
}

async function getDNSfromIP(urlData) {
    await dnsPromises.reverse(urlData.getTarget).then((reversedIPs)=>{
        console.log("We reversed some IP addresses from the DNS!!")
        console.log(reversedIPs)
        return reversedIPs;
    }).catch((err)=>{
        console.error(err + " (Something went wrong reversing to the IPs of the given DNS)");
    })
}

async function getServices(urlData) {
    var servicesList = {}
    if (urlData.getPort === '') {
        for (let i = 1; i <= 65536; i++) {
            await dnsPromises.lookupService(urlData.getTarget, i).then((result)=>{
            console.log(result.hostname + " " + result.service)
            let service = result.service
            servicesList.i = service
        }).catch((err)=>{
            throw err + " (Something went wrong getting the service of the port "+ i +")";
        })
        }
    } else {
        await dnsPromises.lookupService(urlData.getTarget, urlData.getPort).then((result)=>{
            console.log(result.hostname + " " + result.service)
            let service = result.service
            servicesList.urlData.getPort = service
        }).catch((err)=>{
            throw err + " (Something went wrong getting the service of the port "+ urlData.getPort +")";
        })
    }
    return servicesList
}