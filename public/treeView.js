let domainSelected = ``;

window.onload = async () => {
  let rootTreeWebsite = document.getElementById("root-tree");
  let htmlToAdd;

  if (!rootTreeWebsite) console.error(`AppData file not found!`);
  try {
    const response = await fetch("/getDomainNames");
    htmlToAdd = await response.text();
    rootTreeWebsite.innerHTML = htmlToAdd;
  } catch (err) {
    console.error(`Error getting the hostnames' files..  ${err}`);
  }

  const copyDatabtn = document.getElementById(`copyData`);
  copyDatabtn.addEventListener("click", () => {
    let copyData = document.getElementById(`console`).innerText;
    if (copyData.length == 0) {
      showMessage(`No text to copy!`, `error`);
    } else {
      navigator.clipboard.writeText(copyData);
      showMessage(`Text copied to clipboard!`, `success`);
    }
  });

  const downloadDataBtn = document.getElementById(`downloadData`);
  downloadDataBtn.addEventListener("click", () => {
    let dataToDownload = document.getElementById(`console`).innerText;
    if (dataToDownload.length == 0) {
      console.log(`No file selected to download!`);
      showMessage(`No file selected to download!`, `error`);
    } else {
      const blob = new Blob([dataToDownload], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = document
        .getElementById(`selected-file`)
        .innerText.slice(1, -1);
      a.click();
      URL.revokeObjectURL(a.href);
    }
  });

  const treeButtons = document.querySelectorAll(".root-tree-button");
  treeButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const pathChoosen = button.textContent.trim();
      try {
        let allDomains = document.querySelectorAll(".domain");
        if (domainSelected == ``) {
          domainSelected = pathChoosen;
          console.log(`Domain Open: `);
          console.log(domainSelected);
          for (const domain of allDomains) {
            if (domain.textContent.trim() == pathChoosen) {
              let isToggled = await CheckTableAndToggle(domain);
              if (isToggled == false) {
                const response = await fetch(
                  `/clickedTreeButton/${pathChoosen}/${pathChoosen}`,
                );
                htmlToAdd = await response.json();
                if (htmlToAdd[0] == false) {
                  button.parentElement.insertAdjacentHTML(
                    "afterend",
                    htmlToAdd[1],
                  );

                  await refreshButtons();
                } else if (htmlToAdd[0] == true) {
                  let consoleToOutput = document.getElementById(`console`);
                  let currentFileOutput =
                    document.getElementById(`selected-file`);
                  consoleToOutput.textContent = JSON.stringify(
                    htmlToAdd[1],
                    null,
                    2,
                  );
                  currentFileOutput.innerHTML = JSON.stringify(htmlToAdd[2]);
                }
              }
            }
          }
        } else if (domainSelected != ``) {
          if (domainSelected == pathChoosen) {
            //se clickar no domain que tenho aberto simplesmente dar collapse
            for (const domain of allDomains) {
              if (pathChoosen == domain.textContent.trim()) {
                let isToggled = await CheckTableAndToggle(domain);
                if (isToggled == true) {
                  domainSelected = ``;
                }
              }
            }
          } else if (domainSelected != pathChoosen) {
            //se clickar num diferente do que tenho aberto mando fechar o domain anteriormente aberto e abro/mando API do host escolhido
            let isDomain;
            for (const domain of allDomains) {
              if (domain.textContent.trim() == pathChoosen) isDomain = true;
            }
            if (isDomain == true) {
              for (const domain of allDomains) {
                if (domainSelected == domain.textContent.trim()) {
                  await CheckTableAndToggle(domain);
                }
              }
              for (const domain of allDomains) {
                if (pathChoosen == domain.textContent.trim()) {
                  let isToggledNewMenu = await CheckTableAndToggle(domain);
                  domainSelected = pathChoosen;

                  if (isToggledNewMenu == false) {
                    const response = await fetch(
                      `/clickedTreeButton/${pathChoosen}/${domainSelected}`,
                    );
                    htmlToAdd = await response.json();

                    if (htmlToAdd[0] == false) {
                      button.parentElement.insertAdjacentHTML(
                        "afterend",
                        htmlToAdd[1],
                      );
                      await refreshButtons();
                    } else if (htmlToAdd[0] == true) {
                      let consoleToOutput = document.getElementById(`console`);
                      let currentFileOutput =
                        document.getElementById(`selected-file`);
                      consoleToOutput.textContent = JSON.stringify(
                        htmlToAdd[1],
                        null,
                        2,
                      );
                      currentFileOutput.innerHTML = JSON.stringify(
                        htmlToAdd[2],
                      );
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error getting the hostnames' files..  ${error}`);
      }
    });
  });
};

async function refreshButtons() {
  let htmlToAdd;
  let refreshedTreeButtons = document.querySelectorAll(".node");
  refreshedTreeButtons.forEach((refreshedButton) => {
    // @ts-ignore
    if (refreshedButton.dataset.listener === "true") return;

    // @ts-ignore
    refreshedButton.dataset.listener = "true";
    refreshedButton.addEventListener("click", async (e) => {
      const refreshedPathToOpen = refreshedButton.textContent.trim();
      const parent = refreshedButton.parentElement;
      const ul = parent.nextElementSibling;

      if (ul && ul.tagName === "UL") {
        e.preventDefault();
        console.log(ul);
        ul.classList.toggle("hide");
      } else {
        const refreshedResponse = await fetch(
          `/clickedTreeButton/${refreshedPathToOpen}/${domainSelected}`,
        );
        htmlToAdd = await refreshedResponse.json();
        if (htmlToAdd[0] == false) {
          refreshedButton.parentElement.insertAdjacentHTML(
            "afterend",
            htmlToAdd[1],
          );
          await refreshButtons();
        } else if (htmlToAdd[0] == true) {
          let consoleToOutput = document.getElementById(`console`);
          let currentFileOutput = document.getElementById(`selected-file`);

          consoleToOutput.textContent = JSON.stringify(htmlToAdd[1], null, 2);
          currentFileOutput.innerHTML = JSON.stringify(htmlToAdd[2]);
          await refreshButtons();
        }
      }
    });
  });
}

async function CheckTableAndToggle(domain) {
  let btnParent = domain.parentElement;
  let btnPrtNextSibling = btnParent.nextElementSibling;

  if (btnPrtNextSibling && btnPrtNextSibling.tagName.toLowerCase() == "ul") {
    // @ts-ignore
    if (btnPrtNextSibling.style.display == `none`) {
      // @ts-ignore
      btnPrtNextSibling.style.display = `block`;
      return true;
    } else {
      // @ts-ignore
      btnPrtNextSibling.style.display = `none`;
      return true;
    }
  } else return false;
}

function showMessage(text, type = "success", duration = 2000) {
  const box = document.getElementById("messageBox");
  box.textContent = text;
  box.className = `message-box ${type}`;
  box.style.display = "block";
  box.offsetHeight;
  box.style.opacity = "1";
  box.style.transform = "translate(-50%, -50%) scale(1)";

  setTimeout(() => {
    box.style.opacity = "0";
    box.style.transform = "translate(-50%, -50%) scale(0.8)";

    box.addEventListener("transitionend", function handler() {
      box.style.display = "none";
      box.removeEventListener("transitionend", handler);
    });
  }, duration);
}
