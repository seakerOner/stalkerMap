//Port Scanning
import dns from "node:dns";
import {
  createPortServicesFile,
  createTargetDirectory,
  createDnsIpsFile,
  createDnsReversedFromIpFile,
  createDnsResolveFiles,
  createDnsResolveDirectory,
} from "../utils/logger.js";
import {
  getDnsIpsFile,
  getResolveDnsIpsFiles,
  getReversedDns,
} from "../utils/wordlistLoader.js";
import { forceRecords } from "./dnsRecordsAuthoritative.js";
import { scanServices } from "./servicesScanner.js";
const dnsPromises = dns.promises;

export async function scanner(urlData, CTFmode) {
  await createTargetDirectory(urlData.getTarget);

  if (urlData.getTargetType == "IPv4") {
    const gotDNSfromIP = await getDNSfromIP(urlData.getTarget);
    console.log(`Trying to reverse the IP to get some DNS records...`);
    if (gotDNSfromIP == true) {
      const reversedDns = await getReversedDns(urlData.getTarget);
      if (CTFmode == true) {
        await dnsLookup(reversedDns);
      } else if (CTFmode == false) {
        createDnsResolveDirectory(reversedDns);
        await dnsResolver(reversedDns);
      }
    }
  }
  if (urlData.getTargetType === `dns`) {
    console.log("Checking DNS...");

    if (CTFmode == true) {
      await dnsLookup(urlData.getTarget);
    } else if (CTFmode == false) {
      createDnsResolveDirectory(urlData.getTarget);
      await dnsResolver(urlData.getTarget);
    }
  }

  console.log("-------------------------------------");
  console.log("Let's start the port scan");
  console.log("-------------------------------------");
  await scanPorts(urlData, CTFmode);
}

async function dnsLookup(target) {
  const dnsOptions = {
    family: 0,
    hints: dns.ADDRCONFIG | dns.V4MAPPED,
    all: true,
  };

  // @ts-ignore
  await dnsPromises
    .lookup(target, dnsOptions)
    .then((addresses) => {
      console.log("Looked up some IPs!");
      console.table(addresses);
      createDnsIpsFile(target, addresses);
    })
    .catch((err) => {
      console.error(err + " (Something went wrong looking up the DNS...)");
    });
}

async function dnsResolver(target) {
  //maybe use ttl (time to live) as a timer so we know when we can re-resolve again
  var failedResolves = [];
  const options = {
    ttl: true,
  };

  await dnsPromises
    .resolve4(target, options)
    .then((addressesV4) => {
      console.log("We got some IPv4's!!");
      console.table(addressesV4);
      createDnsResolveFiles(target, "IPv4_addresses", addressesV4);
    })
    .catch((err) => {
      if (err.code === "ENODATA") {
        failedResolves.push("A");
      } else if (err.code === "ENOTFOUND") {
        failedResolves.push("A");
      } else {
        failedResolves.push("A");
        console.error(
          err + " (Something went wrong resolving the IPv4's of the given DNS)",
        );
      }
    });

  await dnsPromises
    .resolve6(target, options)
    .then((addressesV6) => {
      console.log("We got some IPv6's!!");
      console.table(addressesV6);
      createDnsResolveFiles(target, "IPv6_addresses", addressesV6);
    })
    .catch((err) => {
      if (err.code === "ENODATA") {
        failedResolves.push("AAAA");
      } else if (err.code === "ENOTFOUND") {
        failedResolves.push("AAAA");
      } else {
        failedResolves.push("AAAA");
        console.error(
          err + " (Something went wrong resolving the IPv6's of the given DNS)",
        );
      }
    });

  await dnsPromises
    .resolveCaa(target)
    .then((recordsCaa) => {
      console.log("We got some Caa records of the Hostname!!");
      console.table(recordsCaa);
      createDnsResolveFiles(target, "Caa_Records", recordsCaa);
    })
    .catch((err) => {
      if (err.code === "ENODATA") {
        failedResolves.push("CAA");
      } else if (err.code === "ENOTFOUND") {
        failedResolves.push("CAA");
      } else {
        failedResolves.push("CAA");
        console.error(
          err +
            " (Something went wrong resolving the Caa records of the given DNS)",
        );
      }
    });

  await dnsPromises
    .resolveCname(target)
    .then((recordsCname) => {
      console.log("We got some Cname records of the Hostname!!");
      console.table(recordsCname);
      createDnsResolveFiles(target, "Cname_Records", recordsCname);
    })
    .catch((err) => {
      if (err.code === "ENODATA") {
        failedResolves.push("CNAME");
      } else if (err.code === "ENOTFOUND") {
        failedResolves.push("CNAME");
      } else {
        failedResolves.push("CNAME");
        console.error(
          err +
            " (Something went wrong resolving the Cname records of the given DNS)",
        );
      }
    });

  await dnsPromises
    .resolveMx(target)
    .then((recordsMx) => {
      console.log("We got some Mx records for the Hostname!!");
      console.table(recordsMx);
      createDnsResolveFiles(target, "Mx_Records", recordsMx);
    })
    .catch((err) => {
      if (err.code === "ENODATA") {
        failedResolves.push("MX");
      } else if (err.code === "ENOTFOUND") {
        failedResolves.push("MX");
      } else {
        failedResolves.push("MX");
        console.error(
          err +
            " (Something went wrong resolving the Mx records of the given DNS)",
        );
      }
    });

  await dnsPromises
    .resolveNaptr(target)
    .then((recordsNaptr) => {
      console.log("We got some Naptr records of the Hostname!!");
      console.table(recordsNaptr);
      createDnsResolveFiles(target, "Naptr_Records", recordsNaptr);
    })
    .catch((err) => {
      if (err.code === "ENODATA") {
        failedResolves.push("NAPTR");
      } else if (err.code === "ENOTFOUND") {
        failedResolves.push("NAPTR");
      } else {
        failedResolves.push("NAPTR");
        console.error(
          err +
            " (Something went wrong resolving the Naptr records of the given DNS)",
        );
      }
    });

  await dnsPromises
    .resolveNs(target)
    .then((recordsNs) => {
      console.log("We got some Ns records of the Hostname!!");
      console.table(recordsNs);
      createDnsResolveFiles(target, "Ns_Records", recordsNs);
    })
    .catch((err) => {
      if (err.code === "ENODATA") {
        failedResolves.push("NS");
      } else if (err.code === "ENOTFOUND") {
        failedResolves.push("NS");
      } else {
        failedResolves.push("NS");
        console.error(
          err +
            " (Something went wrong resolving the Ns records of the given DNS)",
        );
      }
    });

  await dnsPromises
    .resolvePtr(target)
    .then((recordsPtr) => {
      console.log("We got some Ptr records of the Hostname!!");
      console.table(recordsPtr);
      createDnsResolveFiles(target, "Ptr_Records", recordsPtr);
    })
    .catch((err) => {
      if (err.code === "ENODATA") {
        failedResolves.push("PTR");
      } else if (err.code === "ENOTFOUND") {
        failedResolves.push("PTR");
      } else {
        failedResolves.push("PTR");
        console.error(
          err +
            " (Something went wrong resolving the Ptr records of the given DNS)",
        );
      }
    });

  await dnsPromises
    .resolveSoa(target)
    .then((recordsSoa) => {
      console.log("We got some Soa records of the Hostname!!");
      console.table(recordsSoa);
      createDnsResolveFiles(target, "Soa_Records", recordsSoa);
    })
    .catch((err) => {
      if (err.code === "ENODATA") {
        failedResolves.push("SOA");
      } else if (err.code === "ENOTFOUND") {
        failedResolves.push("SOA");
      } else {
        failedResolves.push("SOA");
        console.error(
          err +
            " (Something went wrong resolving the Soa records of the given DNS)",
        );
      }
    });

  await dnsPromises
    .resolveSrv(target)
    .then((recordsSrv) => {
      console.log("We got some Srv records of the Hostname!!");
      console.table(recordsSrv);
      createDnsResolveFiles(target, "Srv_Records", recordsSrv);
    })
    .catch((err) => {
      if (err.code === "ENODATA") {
        failedResolves.push("SRV");
      } else if (err.code === "ENOTFOUND") {
        failedResolves.push("SRV");
      } else {
        failedResolves.push("SRV");
        console.error(
          err +
            " (Something went wrong resolving the Srv records of the given DNS)",
        );
      }
    });

  await dnsPromises
    .resolveTxt(target)
    .then((recordsTxt) => {
      console.log("We got some Txt records of the Hostname!!");
      console.table(recordsTxt);
      createDnsResolveFiles(target, "Txt_Records", recordsTxt);
    })
    .catch((err) => {
      if (err.code === "ENODATA") {
        failedResolves.push("TXT");
      } else if (err.code === "ENOTFOUND") {
        failedResolves.push("TXT");
      } else {
        failedResolves.push("TXT");
        console.error(
          err +
            " (Something went wrong resolving the Txt records of the given DNS)",
        );
      }
    });

  if (failedResolves.length > 0) {
    console.log(`Some records failed.. lets "dig" deeper then :P`);
    await forceRecords(target, failedResolves);
  }
}

async function getDNSfromIP(target) {
  return await dnsPromises
    .reverse(target)
    .then((reversedIPs) => {
      console.log("We reversed some IP addresses and found a DNS!!");
      console.table(reversedIPs);
      createDnsReversedFromIpFile(target, reversedIPs);
      return true;
    })
    .catch((err) => {
      console.error(
        err + " (Something went wrong reversing the IPs to get a DNS record)",
      );
      return false;
    });
}

async function scanPorts(urlData, CTFmode) {
  let ipList;
  if (CTFmode == true && urlData.getTargetType == `dns`) {
    ipList = await getDnsIpsFile(urlData.getTarget);
  } else if (CTFmode == false && urlData.getTargetType == `dns`) {
    //test this
    ipList = await getResolveDnsIpsFiles(urlData.getTarget);
    console.table(ipList);
  } else if (urlData.getTargetType == `IPv4`) {
    ipList = urlData.getTarget;
  }
  let servicesList = await getServices(
    ipList,
    urlData.getPort,
    urlData.getTargetType,
  );
  await createPortServicesFile(urlData.getTarget, servicesList);

  return;
}

async function getServices(targetIPs, inputPort, targetType) {
  let foundServices = await scanServices(targetIPs, inputPort, targetType);
  return foundServices;
}
