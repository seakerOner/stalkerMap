let nodesOpen = [];
let domainSelected = ``;
let isDomain = false;

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
  const treeButtons = document.querySelectorAll(".root-tree-button");
  treeButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const pathChoosen = button.innerHTML;
      try {
        nodesOpen.push(pathChoosen);
        let allDomains = document.querySelectorAll(".domain");
        if (domainSelected == ``) {
          allDomains.forEach(async (domain) => {
            if (domain.innerHTML == pathChoosen) {
              let isToggled = await CheckTableAndToggle(domain);
              if (isToggled == false) {
                const response = await fetch(
                  `/clickedTreeButton/${pathChoosen}`,
                );
                htmlToAdd = await response.text();
                button.parentElement.insertAdjacentHTML("afterend", htmlToAdd);
                refreshButtons();
              }
              domainSelected = pathChoosen;
            }
          });
        } else if (domainSelected != ``) {
          if (domainSelected == pathChoosen) {
            //se clickar no domain que tenho aberto simplesmente dar collapse
            allDomains.forEach(async (domain) => {
              if (pathChoosen == domain.innerHTML) {
                let isToggled = await CheckTableAndToggle(domain);
                if (isToggled == true) domainSelected = ``;
              }
            });
          } else if (domainSelected != pathChoosen) {
            //se clickar num diferente do que tenho aberto mando fechar o domain anteriormente aberto e abro/mando API do host escolhido
            allDomains.forEach((domain) => {
              if (domain.innerHTML == pathChoosen) isDomain = true;
            });
            if (isDomain == true) {
              allDomains.forEach(async (domain) => {
                if (domainSelected == domain.innerHTML) {
                  let isToggled = await CheckTableAndToggle(domain);
                }
              });
              allDomains.forEach(async (domain) => {
                if (pathChoosen == domain.innerHTML) {
                  let isToggledNewMenu = await CheckTableAndToggle(domain);
                  if (isToggledNewMenu == false) {
                    const response = await fetch(
                      `/clickedTreeButton/${pathChoosen}`,
                    );
                    htmlToAdd = await response.text();
                    button.parentElement.insertAdjacentHTML(
                      "afterend",
                      htmlToAdd,
                    );
                    refreshButtons();
                  }
                  domainSelected = pathChoosen;
                }
              });
            }
          }
        }

        if (nodesOpen.length > 0)
          if (nodesOpen.includes(pathChoosen)) {
            // make button collapse the list
            return;
          }
        //const response = await fetch(`/clickedTreeButton/${pathChoosen}`);
        //htmlToAdd = await response.text();
        //button.parentElement.insertAdjacentHTML("afterend", htmlToAdd);
        //refreshButtons();
      } catch (error) {
        console.error(`Error getting the hostnames' files..  ${error}`);
      }
    });
  });
};

function refreshButtons(secondWave = false) {
  let htmlToAdd;
  let refreshedTreeButtons = document.querySelectorAll(".root-tree-button");
  refreshedTreeButtons.forEach((refreshedButton) => {
    refreshedButton.addEventListener("click", async () => {
      const refreshedPathToOpen = refreshedButton.innerHTML;
      if (nodesOpen.length > 0)
        if (nodesOpen.includes(refreshedPathToOpen)) {
          // make button collapse the list
          return;
        }
      try {
        nodesOpen.push(refreshedPathToOpen);
        const refreshedResponse = await fetch(
          `/clickedTreeButton/${refreshedPathToOpen}`,
        );
        htmlToAdd = ` `;
        htmlToAdd = await refreshedResponse.text();
        refreshedButton.parentElement.insertAdjacentHTML("afterend", htmlToAdd);
        if (secondWave == false) {
          refreshButtons(true);
        }
      } catch (err) {
        console.error(`Error getting the hostnames' files..  ${err}`);
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
