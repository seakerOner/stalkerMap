import net from "node:net";

export function sanatizeURL(url) {
  url = url.trim();
  let scheme = url.substring(0, 8);
  let target = "";
  let port = "";
  let allURLdata = [];

  if (url == "") {
    throw new Error("Empty url");
  }

  if (scheme.substring(0, 4) !== "http" && scheme.substring(0.5) !== "https") {
    throw new Error(
      `Invalid protocol (Valid protocols => http or https) (${url})`,
    );
  }

  if (scheme.substring(0, 7) !== "http://" && scheme !== "https://") {
    throw new Error(
      `Invalid scheme (Valid schemes => http:// or https://) (${url})`,
    );
  }

  if (scheme.substring(0, 7) == "http://") {
    // @ts-ignore
    allURLdata = getPortAndtarget("http://", url, target, port);
  }

  if (scheme == "https://") {
    // @ts-ignore
    allURLdata = getPortAndtarget("https://", url, target, port);
  }
  console.log(target + ` ` + port);
  return allURLdata;
}

function getPortAndtarget(protocol, fullURL, target, port) {
  let urlArr = [...fullURL];
  let gottarget = false;
  let gotPort = false;
  let targetType = "";
  let i = 0;

  if (protocol == "http://") {
    i = 7;
  }
  if (protocol == "https://") {
    i = 8;
  }
  for (i; i <= urlArr.length; i++) {
    if (urlArr[i] === ":") {
      gottarget = true;
    }
    if (urlArr[i] === "/") {
      if (gottarget === false) {
        gottarget = true;
      }
      gotPort = true;
    }
    if (urlArr[i] !== ":") {
      if (gottarget === false) {
        if (urlArr.length !== i) {
          target = target + urlArr[i];
        }
      }
      if (gottarget === true && gotPort === false) {
        if (urlArr.length !== i) {
          port = port + urlArr[i];
        }
      }
    }
  }

  function sanatizeHostname(target) {
    return /^[a-zA-Z0-9.-]+$/.test(target);
  }

  let isIPv4 = net.isIPv4(target);
  let isIPv6 = net.isIPv6(target);
  let isCleanHostname = sanatizeHostname(target);
  if (isIPv4 === false) {
    if (isCleanHostname === true) {
      targetType = "dns";
      console.log(`Hostname recognized!`);
    } else {
      throw new Error(`The IP is not a valid IPv4! (${target})`);
    }

    if (isIPv6 === true) {
      targetType = "IPv6";
      console.log("IPv6 recognized!");
    }
  } else {
    targetType = "IPv4";
    console.log("IPv4 recognized!");
  }

  return {
    getFullURL: fullURL,
    getProtocol: protocol,
    getTargetType: targetType,
    getTarget: target,
    getPort: port,
  };
}
