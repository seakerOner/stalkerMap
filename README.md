# stalkerMap WIP
-Port Scanner <br />
-Directory enumerator <br />
-Organizes retrieved data on files <br />

# How to install the tool:
-Inside the <b>project directory</b> do <b>"chmod +x install-stalkermap.sh"</b> and run <b>"./install-stalkermap.sh"</b> in the terminal to make it executable anywhere on your pc!<br />
-Type "stalkermap" on the terminal to run the tool<br />
-Have fun :D<br />

# Be aware!
(Only DNS related functionality and partial port scanning features are working atm) <br />
-This tool uses on occasion the command "dig" for dns querries, so please have it up to date to avoid errors. <br />
-If you don't want to install the tool and just execute it you can type on the terminal: "node ." or "node stalkermap.js" inside the project directory to execute it. (Will only use 4 threads as its the default number of threads on NodeJS even if your pc has more than that!) <br />
-All info gathered by the tool will be stored on <b>"~Desktop/stalkermapOUTPUT/data/{targetName}"</b> <br />
(WIP - to see the stored data take a look on <b>"~Desktop/stalkermapOUTPUT/data/appData/{targetName}")<b>