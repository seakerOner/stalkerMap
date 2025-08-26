import { Resolver } from "node:dns/promises";
import dns from "node:dns";
import { createDnsResolveFiles } from "../utils/logger.js";
import {
  getNsRecords,
  getSoaRecords,
  getResolveDnsIpsFiles,
  parseDigOutput,
} from "../utils/wordlistLoader.js";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import os from "os";

// If any records gets ENODATA (No data) or any error
// (Using Node)
// We retry using the NS records to resolve again the records
//      If there arent any NS records we use the first option of SOA record as the primary authoritative
//          If nothing works
//              (Using dig)
//          Dig the NS records and resolve again the records
//
const dnsPromises = dns.promises;
const execAsync = promisify(exec);

export async function forceRecords(target, failedRecords) {
  var hasNS = true;
  var hasSOA = true;

  for (let i = 0; i < failedRecords.length; i++) {
    if (failedRecords[i] == "NS") {
      hasNS = false;
    }
    if (failedRecords[i] == "SOA") {
      hasSOA = false;
    }
  }

  if (hasNS == true) {
    const nsRecords = await getNsRecords(target, false);

    const remainingFailedRecords = await retryResolveRecords(
      target,
      nsRecords,
      failedRecords,
    );
    //dig remaining records with ns
    if (Object.keys(remainingFailedRecords).length > 0) {
      console.log(
        "Remaining failed records after trying to get them with the NS records found:",
      );
      console.table(remainingFailedRecords);
      await digRecords(target, remainingFailedRecords);
    }
  } else if (hasNS == false) {
    if (hasSOA == true) {
      //get authoritative from SOA and resolve
      console.log(
        "No NS record found, getting authoritative server from SOA record...",
      );
      const soaRecords = await getSoaRecords(target);
      const nsRecord = soaRecords["nsname"];
      const remainingFailedRecords = await retryResolveRecords(
        target,
        nsRecord,
        failedRecords,
      );
      if (Object.keys(remainingFailedRecords).length > 0) {
        console.log(
          "Remaining failed records after trying to get them with the NS records found:",
        );
        console.table(remainingFailedRecords);
        await digRecords(target, remainingFailedRecords);
      }
    }
  }
  if (hasNS == false && hasSOA == false) {
    //DIG COMMAND OUTPUT NEEDS TO BE CLEARED TO NORMALIZED TO JSON BEFORE USING THIS
    //DIG target NS and resolve
    // await digNsRecord(target)
    // const nsRecord = await getNsRecords(target, true)
    // const remainingFailedRecords = await retryResolveRecords(target, nsRecord, failedRecords)
    // if (Object.keys(remainingFailedRecords).length > 0) {
    //     await digRecords(target, remainingFailedRecords)
    // }
  }
}

async function retryResolveRecords(target, nsRecords, failedRecords) {
  const resolver = new Resolver();
  let serverFailedRecords = {};
  const options = {
    ttl: true,
  };
  let serverQuantity = nsRecords.length;

  for (let z = 0; z < serverQuantity; z++) {
    let server = nsRecords[z];
    await dnsPromises
      .resolve4(server, options)
      .then(async (addressesV4) => {
        //could add IPv6 functionality later on
        console.log("We got some IPv4's from the NS records!!");
        console.table(addressesV4);

        await createDnsResolveFiles(
          target,
          `IPv4_addresses_${server}_`,
          addressesV4,
          true,
        );
        const ipFromNsRecords = await getResolveDnsIpsFiles(
          target,
          true,
          server,
        );

        for (let x = 0; x < ipFromNsRecords.length; x++) {
          resolver.setServers([ipFromNsRecords[x]["address"]]);
          serverFailedRecords[server] = await getRecords(
            target,
            server,
            failedRecords,
            true,
          );
        }
      })
      .catch((err) => {
        console.error(
          "something went wrong getting the IPv4 addresses of the NS records" +
            err,
        );
      });
  }

  return serverFailedRecords;
}

async function digNsRecord(target) {
  const { stdout, stderr } = await execAsync(
    `dig +nocmd ${target} NS +noall +answer`,
  );
  if (stderr) {
    console.error("Dig command error: " + stderr);
  } else {
    // const data = JSON.parse(stdout)
    const data = stdout;
    const isUsingDig = true;
    await createDnsResolveFiles(target, "Ns_Records", data, false, isUsingDig);
  }
}

async function digRecords(target, remainingFailedRecords) {
  let servers = Object.keys(remainingFailedRecords);

  for (let i = 0; i < servers.length; i++) {
    let server = servers[i];
    let records = remainingFailedRecords[server];
    for (let x = 0; x < records.length; x++) {
      let record = records[x];

      const { stdout, stderr } = await execAsync(
        `dig +nocmd @${server} ${target} ${record} +noall +answer`,
        { cwd: os.tmpdir() },
      );
      if (stderr) {
        console.error("Dig commmand error: " + stderr);
      } else {
        // const data = JSON.parse(stdout)
        let parsedData = await parseDigOutput(stdout);
        if (stdout.length < 1) {
          console.log(
            "Success getting the record " +
              record +
              " for the server " +
              server +
              " but there is no data inside it",
          );
        } else {
          console.log(
            `We got some data from the ${record} record using the dig command with the server: ${server}`,
          );
          console.log(stdout);
        }

        const isUsingDig = true;
        if (record == "A") {
          if (parsedData.length > 0 && parsedData !== undefined) {
            await createDnsResolveFiles(
              target,
              `IPv4_addresses_${server}_`,
              parsedData,
              false,
              isUsingDig,
            );
          }
        }
        if (record == "AAAA") {
          if (parsedData.length > 0 && parsedData !== undefined) {
            await createDnsResolveFiles(
              target,
              `IPv6_addresses_${server}_`,
              parsedData,
              false,
              isUsingDig,
            );
          }
        }
        if (record == "CAA") {
          if (parsedData.length > 0 && parsedData !== undefined) {
            await createDnsResolveFiles(
              target,
              `Caa_Records_${server}_`,
              parsedData,
              false,
              isUsingDig,
            );
          }
        }
        if (record == "CNAME") {
          if (parsedData.length > 0 && parsedData !== undefined) {
            await createDnsResolveFiles(
              target,
              `Cname_Records_${server}_`,
              parsedData,
              false,
              isUsingDig,
            );
          }
        }
        if (record == "MX") {
          if (parsedData.length > 0 && parsedData !== undefined) {
            await createDnsResolveFiles(
              target,
              `Mx_Records_${server}_`,
              parsedData,
              false,
              isUsingDig,
            );
          }
        }
        if (record == "NAPTR") {
          if (parsedData.length > 0 && parsedData !== undefined) {
            await createDnsResolveFiles(
              target,
              `Naptr_Records_${server}_`,
              parsedData,
              false,
              isUsingDig,
            );
          }
        }
        if (record == "NS") {
          if (parsedData.length > 0 && parsedData !== undefined) {
            await createDnsResolveFiles(
              target,
              `Ns_Records_${server}_`,
              parsedData,
              false,
              isUsingDig,
            );
          }
        }
        if (record == "PTR") {
          if (parsedData.length > 0 && parsedData !== undefined) {
            await createDnsResolveFiles(
              target,
              `Ptr_Records_${server}_`,
              parsedData,
              false,
              isUsingDig,
            );
          }
        }
        if (record == "SOA") {
          if (parsedData.length > 0 && parsedData !== undefined) {
            await createDnsResolveFiles(
              target,
              `Soa_Records_${server}_`,
              parsedData,
              false,
              isUsingDig,
            );
          }
        }
        if (record == "SVR") {
          if (parsedData.length > 0 && parsedData !== undefined) {
            await createDnsResolveFiles(
              target,
              `Srv_Records_${server}_`,
              parsedData,
              false,
              isUsingDig,
            );
          }
        }
        if (record == "TXT") {
          if (parsedData.length > 0 && parsedData !== undefined) {
            await createDnsResolveFiles(
              target,
              `Txt_Records_${server}_`,
              parsedData,
              false,
              isUsingDig,
            );
          }
        }
      }
    }
  }
}

async function getRecords(target, server, failedRecords, isFromNsRecords) {
  let failedResolves = [];

  for (let i = 0; i < failedRecords.length; i++) {
    if (failedRecords[i] == "A") {
      const options = {
        ttl: true,
      };
      await dnsPromises
        .resolve4(target, options)
        .then((addressesV4) => {
          console.log("We got some IPv4's!!");
          console.table(addressesV4);
          if (isFromNsRecords == true) {
            createDnsResolveFiles(
              target,
              `IPv4_addresses_${server}_`,
              addressesV4,
              isFromNsRecords,
            );
          }
        })
        .catch((err) => {
          if (err) {
            failedResolves.push("A");
            console.error(
              err +
                " " +
                server +
                " (Something went wrong resolving the IPv4's of the given DNS)",
            );
          }
        });
    } else if (failedRecords[i] == "AAAA") {
      const options = {
        ttl: true,
      };
      await dnsPromises
        .resolve6(target, options)
        .then((addressesV6) => {
          console.log("We got some IPv6's!!");
          console.table(addressesV6);
          if (isFromNsRecords == true) {
            createDnsResolveFiles(
              target,
              `IPv6_addresses_${server}_`,
              addressesV6,
              isFromNsRecords,
            );
          }
        })
        .catch((err) => {
          if (err) {
            failedResolves.push("AAAA");
            console.error(
              err +
                " " +
                server +
                " (Something went wrong resolving the IPv6's of the given DNS)",
            );
          }
        });
    } else if (failedRecords[i] == "CAA") {
      await dnsPromises
        .resolveCaa(target)
        .then((recordsCaa) => {
          console.log("We got some Caa records of the Hostname!!");
          console.table(recordsCaa);
          if (isFromNsRecords == true) {
            createDnsResolveFiles(
              target,
              `Caa_Records_${server}_`,
              recordsCaa,
              isFromNsRecords,
            );
          }
        })
        .catch((err) => {
          if (err) {
            failedResolves.push("CAA");
            console.error(
              err +
                " " +
                server +
                " (Something went wrong resolving the Caa records of the given DNS)",
            );
          }
        });
    } else if (failedRecords[i] == "CNAME") {
      await dnsPromises
        .resolveCname(target)
        .then((recordsCname) => {
          console.log("We got some Cname records of the Hostname!!");
          console.table(recordsCname);
          if (isFromNsRecords == true) {
            createDnsResolveFiles(
              target,
              `Cname_Records_${server}_`,
              recordsCname,
              isFromNsRecords,
            );
          }
        })
        .catch((err) => {
          if (err) {
            failedResolves.push("CNAME");
            console.error(
              err +
                " " +
                server +
                " (Something went wrong resolving the Cname records of the given DNS)",
            );
          }
        });
    } else if (failedRecords[i] == "MX") {
      await dnsPromises
        .resolveMx(target)
        .then((recordsMx) => {
          console.log("We got some Mx records for the Hostname!!");
          console.table(recordsMx);
          if (isFromNsRecords == true) {
            createDnsResolveFiles(
              target,
              `Mx_Records_${server}_`,
              recordsMx,
              isFromNsRecords,
            );
          }
        })
        .catch((err) => {
          if (err) {
            failedResolves.push("MX");
            console.error(
              err +
                " " +
                server +
                " (Something went wrong resolving the Mx records of the given DNS)",
            );
          }
        });
    } else if (failedRecords[i] == "NAPTR") {
      await dnsPromises
        .resolveNaptr(target)
        .then((recordsNaptr) => {
          console.log("We got some Naptr records of the Hostname!!");
          console.table(recordsNaptr);
          if (isFromNsRecords == true) {
            createDnsResolveFiles(
              target,
              `Naptr_Records_${server}_`,
              recordsNaptr,
              isFromNsRecords,
            );
          }
        })
        .catch((err) => {
          if (err) {
            failedResolves.push("NAPTR");
            console.error(
              err +
                " " +
                server +
                " (Something went wrong resolving the Naptr records of the given DNS)",
            );
          }
        });
    } else if (failedRecords == "NS") {
      await dnsPromises
        .resolveNs(target)
        .then((recordsNs) => {
          console.log("We got some Ns records of the Hostname!!");
          console.table(recordsNs);
          if (isFromNsRecords == true) {
            createDnsResolveFiles(
              target,
              `Ns_Records_${server}_`,
              recordsNs,
              isFromNsRecords,
            );
          }
        })
        .catch((err) => {
          if (err) {
            failedResolves.push("NS");
            console.error(
              err +
                " " +
                server +
                " (Something went wrong resolving the Ns records of the given DNS)",
            );
          }
        });
    } else if (failedRecords[i] == "PTR") {
      await dnsPromises
        .resolvePtr(target)
        .then((recordsPtr) => {
          console.log("We got some Ptr records of the Hostname!!");
          console.table(recordsPtr);
          if (isFromNsRecords == true) {
            createDnsResolveFiles(
              target,
              `Ptr_Records_${server}_`,
              recordsPtr,
              isFromNsRecords,
            );
          }
        })
        .catch((err) => {
          if (err) {
            failedResolves.push("PTR");
            console.error(
              err +
                " " +
                server +
                " (Something went wrong resolving the Ptr records of the given DNS)",
            );
          }
        });
    } else if (failedRecords[i] == "SOA") {
      await dnsPromises
        .resolveSoa(target)
        .then((recordsSoa) => {
          console.log("We got some Soa records of the Hostname!!");
          console.table(recordsSoa);
          if (isFromNsRecords == true) {
            createDnsResolveFiles(
              target,
              `Soa_Records_${server}_`,
              recordsSoa,
              isFromNsRecords,
            );
          }
        })
        .catch((err) => {
          if (err) {
            failedResolves.push("SOA");
            console.error(
              err +
                " " +
                server +
                " (Something went wrong resolving the Soa records of the given DNS)",
            );
          }
        });
    } else if (failedRecords[i] == "SRV") {
      await dnsPromises
        .resolveSrv(target)
        .then((recordsSrv) => {
          console.log("We got some Srv records of the Hostname!!");
          console.table(recordsSrv);
          if (isFromNsRecords == true) {
            createDnsResolveFiles(
              target,
              `Srv_Records_${server}_`,
              recordsSrv,
              isFromNsRecords,
            );
          }
        })
        .catch((err) => {
          if (err) {
            failedResolves.push("SRV");
            console.error(
              err +
                " " +
                server +
                " (Something went wrong resolving the Srv records of the given DNS)",
            );
          }
        });
    } else if (failedRecords[i] == "TXT") {
      await dnsPromises
        .resolveTxt(target)
        .then((recordsTxt) => {
          console.log("We got some Txt records of the Hostname!!");
          console.table(recordsTxt);
          if (isFromNsRecords == true) {
            createDnsResolveFiles(
              target,
              `Txt_Records_${server}_`,
              recordsTxt,
              isFromNsRecords,
            );
          }
        })
        .catch((err) => {
          if (err) {
            failedResolves.push("TXT");
            console.error(
              err +
                " " +
                server +
                " (Something went wrong resolving the Txt records of the given DNS)",
            );
          }
        });
    }
  }

  return failedResolves;
}
