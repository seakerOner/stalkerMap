import net from "node:net";
import dns from "node:dns";
import { checkTCPservices } from "../utils/wordlistLoader.js";
import { setBatchSize } from "../utils/threadVelocitySetter.js";

const dnsPromises = dns.promises;

export async function scanServices(targetIPs, inputPort, targetType) {
  var foundServices = {};
  const delay = (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  if (targetType == `dns`) {
    for (let i = 0; i < Object.keys(targetIPs).length; i++) {
      if (targetIPs[i].family == "4") {
        if (inputPort === "") {
          let threads = parseInt(process.env.UV_THREADPOOL_SIZE) || 4;
          //Below is the "speed" of port scanner, be careful increasing this number!
          let maxBatchSize = 150;
          let batchsize = Math.min(threads * 10, maxBatchSize);
          const allPorts = Array.from({ length: 65536 }, (_, i) => i);
          const irrelevantPorts = new Set([
            "echo",
            "discard",
            "daytime",
            "chargen",
            "who",
            "rje",
            "comsat",
            "printer",
            "talk",
            "ntalk",
            "rcpbind",
            "nfs",
            "mountd",
            "ident",
            "syslog",
            "bootpc",
            "bootps",
            "tftp",
            "rip",
            "un",
            "unknown",
          ]);

          for (let x = 0; x < allPorts.length; x += batchsize) {
            let portsBatched = allPorts.slice(x, x + batchsize);

            await Promise.all(
              portsBatched.map(async (port) => {
                if (!Number.isInteger(port) || port === 0) return;

                let isPortOpenn = await isPortOpen(targetIPs[i].address, port);
                if (isPortOpenn.isOpen == true) {
                  await dnsPromises
                    .lookupService(targetIPs[i].address, port)
                    .then(async (result) => {
                      if (irrelevantPorts.has(result.service)) return;

                      let isRelevantService = await checkTCPservices(
                        result.service,
                      );
                      if (isRelevantService === true) {
                        console.log(
                          "Target         IP          PORT    Service version",
                        );
                        console.log(
                          "          " +
                            result.hostname +
                            " " +
                            targetIPs[i].address +
                            ":" +
                            port +
                            " " +
                            result.service +
                            " " +
                            isPortOpenn.serviceVersion.version,
                        );
                        if (!foundServices[result.hostname]) {
                          foundServices[result.hostname] = [];
                        }

                        foundServices[result.hostname].push({
                          ip_target: targetIPs[i].address,
                          port: port,
                          isOpen: true,
                          service: result.service,
                          version: isPortOpenn.serviceVersion.version,
                        });
                      }
                    })
                    .catch((err) => {
                      console.error(
                        err +
                          " (Something went wrong getting the service of the port " +
                          x +
                          ")",
                      );
                    });
                }
              }),
            );
            process.stdout.write(`\r[${x}/${allPorts.length}]`);
            await delay(50);
          }
        } else {
          let isPortOpenn = await isPortOpen(targetIPs[i].address, inputPort);
          if (isPortOpenn.isOpen) {
            await dnsPromises
              .lookupService(targetIPs[i].address, parseInt(inputPort))
              .then((result) => {
                console.log(
                  result.hostname +
                    " " +
                    targetIPs[i].address +
                    " " +
                    result.service,
                );

                if (!foundServices[result.hostname]) {
                  foundServices[result.hostname] = [];
                }
                if (isPortOpenn.isOpen == true) {
                  foundServices[result.hostname].push({
                    ip_target: targetIPs[i].address,
                    port: inputPort,
                    isOpen: true,
                    service: result.service,
                    version: isPortOpenn.serviceVersion.version,
                  });
                } else {
                  foundServices[result.hostname].push({
                    ip_target: targetIPs[i].address,
                    port: inputPort,
                    isOpen: false,
                    service: result.service,
                    version: isPortOpenn.serviceVersion.version,
                  });
                }
              })
              .catch((err) => {
                console.error(
                  err +
                    " (Something went wrong getting the service of the port " +
                    inputPort +
                    ")",
                );
              });
          }
        }
      }
    }
  }

  if (targetType == `IPv4`) {
    if (inputPort === "") {
      let batchsize = await setBatchSize();
      const allPorts = Array.from({ length: 65536 }, (_, i) => i);
      const irrelevantPorts = new Set([
        "echo",
        "discard",
        "daytime",
        "chargen",
        "who",
        "rje",
        "comsat",
        "printer",
        "talk",
        "ntalk",
        "rcpbind",
        "nfs",
        "mountd",
        "ident",
        "syslog",
        "bootpc",
        "bootps",
        "tftp",
        "rip",
        "un",
        "unknown",
      ]);

      for (let x = 0; x < allPorts.length; x += batchsize) {
        let portsBatched = allPorts.slice(x, x + batchsize);

        await Promise.all(
          portsBatched.map(async (port) => {
            if (!Number.isInteger(port) || port === 0) return;

            let isPortOpenn = await isPortOpen(targetIPs, port);
            if (isPortOpenn.isOpen == true) {
              await dnsPromises
                .lookupService(targetIPs, port)
                .then(async (result) => {
                  if (irrelevantPorts.has(result.service)) return;

                  let isRelevantService = await checkTCPservices(
                    result.service,
                  );
                  if (isRelevantService === true) {
                    console.log(
                      "Target         IP          PORT    Service version",
                    );
                    console.log(
                      "          " +
                        result.hostname +
                        " " +
                        targetIPs +
                        ":" +
                        port +
                        " " +
                        result.service +
                        " " +
                        isPortOpenn.serviceVersion.version,
                    );
                    if (!foundServices[result.hostname]) {
                      foundServices[result.hostname] = [];
                    }

                    foundServices[result.hostname].push({
                      ip_target: targetIPs,
                      port: port,
                      isOpen: true,
                      service: result.service,
                      version: isPortOpenn.serviceVersion.version,
                    });
                  }
                })
                .catch((err) => {
                  console.error(
                    err +
                      " (Something went wrong getting the service of the port " +
                      x +
                      ")",
                  );
                });
            }
          }),
        );
        process.stdout.write(`\r[${x}/${allPorts.length}]`);
        await delay(50);
      }
    } else {
      let isPortOpenn = await isPortOpen(targetIPs, inputPort);
      if (isPortOpenn.isOpen) {
        await dnsPromises
          .lookupService(targetIPs, parseInt(inputPort))
          .then((result) => {
            console.log(
              result.hostname + " " + targetIPs + " " + result.service,
            );

            if (!foundServices[result.hostname]) {
              foundServices[result.hostname] = [];
            }
            if (isPortOpenn.isOpen == true) {
              foundServices[result.hostname].push({
                ip_target: targetIPs,
                port: inputPort,
                isOpen: true,
                service: result.service,
                version: isPortOpenn.serviceVersion.version,
              });
            } else {
              foundServices[result.hostname].push({
                ip_target: targetIPs,
                port: inputPort,
                isOpen: false,
                service: result.service,
                version: isPortOpenn.serviceVersion.version,
              });
            }
          })
          .catch((err) => {
            console.error(
              err +
                " (Something went wrong getting the service of the port " +
                inputPort +
                ")",
            );
          });
      }
    }
  }
  console.log(foundServices);
  console.log("\nScan done!");
  return foundServices;
}

function isPortOpen(hostIP, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: hostIP, port: port });
    socket.setTimeout(250);
    let resolved = false;
    let isOpen = false;
    let bannerData = "";
    let serviceVersion = {
      service: "-",
      version: "-",
    };

    const finalize = () => {
      if (!resolved) {
        resolved = true;
        resolve({ isOpen: isOpen, serviceVersion });
      }
    };

    socket.on("connect", () => {
      isOpen = true;

      setTimeout(() => {
        if (!resolved) {
          socket.end();
        }
      }, 200);
    });

    socket.on("data", (data) => {
      bannerData += data;
    });

    socket.on("end", () => {
      const banner = bannerData.toString().split("\n")[0];

      if (banner.startsWith("SSH-")) {
        serviceVersion = {
          service: "ssh",
          version: banner,
        };
      } else if (banner.startsWith("220")) {
        serviceVersion = {
          service: "ftp",
          version: banner,
        };
      } else if (banner.startsWith("HTTP/")) {
        serviceVersion = {
          service: "http",
          version: banner,
        };
      }
    });

    socket.on("timeout", () => {
      isOpen = false;
      socket.destroy();
    });
    socket.on("error", () => {
      isOpen = false;
      socket.destroy();
    });
    socket.on("close", () => {
      finalize();
    });
  });
}
