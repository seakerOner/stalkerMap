# stalkerMap NodeJS prototype (stalkerMap with Rust coming :D) 
-DNS queries <br />
-Port Scanner <br />
-Directory enumerator <br />
-Organizes retrieved data on files <br />
-HTML Dashboard to visualize your gathered data <br />

# How to install the tool:
-Inside the <b>project directory</b> do <b>"chmod +x install-stalkermap.sh"</b> and run <b>"./install-stalkermap.sh"</b> in the terminal to make it executable anywhere on your pc!<br />

-Type <b>"stalkermap"</b> on the terminal to run the tool<br />
-Type <b>"stalkermapDashboard"</b> on the terminal to run the API server and get the dashboard! (ctrl + c to turn off the api server)<br />
-Have fun :D<br />

# Be aware!
(The HTML Dashboard still has some bugs :p) <br />
-This tool uses on occasion the command "dig" for dns querries, so please have it up to date to avoid errors. <br />
-If you don't want to install the tool and just execute it you can type on the terminal: "node ." or "node stalkermap.js" (node server.js to get the dashboard) inside the project directory to execute it. (Will only use 4 threads as its the default number of threads on NodeJS even if your pc has more than that!) <br />
-All info gathered by the tool will be stored on <b>"~Desktop/stalkermapOUTPUT/data/appData/{targetName}"</b>
<br /><br />

Thank you for trying out the tool! Im open to hearing new features you would like to be implemented on the final version. <br />
Bye! I use vim (btw)

