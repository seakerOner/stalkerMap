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
      const pathToOpen = button.innerHTML;
      try {
        const response = await fetch(`/clickedTreeButton/${pathToOpen}`);
        htmlToAdd = await response.text();
        console.log(htmlToAdd);
        button.parentElement.insertAdjacentHTML("afterend", htmlToAdd);

        let refreshedTreeButtons =
          document.querySelectorAll(".root-tree-button");
        refreshedTreeButtons.forEach((refreshedButton) => {
          refreshedButton.addEventListener("click", async () => {
            const refreshedPathToOpen = refreshedButton.innerHTML;
            try {
              const refreshedResponse = await fetch(
                `/clickedTreeButton/${refreshedPathToOpen}`,
              );
              htmlToAdd = ` `;
              htmlToAdd = await refreshedResponse.text();
              refreshedButton.parentElement.insertAdjacentHTML(
                "afterend",
                htmlToAdd,
              );
            } catch (err) {
              console.error(`Error getting the hostnames' files..  ${err}`);
            }
          });
        });
      } catch (error) {
        console.error(`Error getting the hostnames' files..  ${error}`);
      }
    });
  });
};
