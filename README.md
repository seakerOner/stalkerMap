<h1>stalkerMap NodeJS prototype (stalkerMap with Rust coming :D)</h1>

<h2>Features</h2>
<ul>
  <li>DNS queries</li>
  <li>Port Scanner</li>
  <li>Directory enumerator</li>
  <li>Organizes retrieved data into files</li>
  <li>HTML Dashboard to visualize gathered data</li>
</ul>

<h2>Prerequisites</h2>
<p>Make sure you have <b>Node.js</b> and <b>npm</b> installed.<br>
You also need to install <b>Express</b> globally or in the project directory:</p>

<pre><code>npm install express</code></pre>

<h2>How to install the tool</h2>
<p>Inside the <b>project directory</b>, make the install script executable:</p>

<pre><code>chmod +x install-stalkermap.sh</code></pre>

<p>Run the installer:</p>

<pre><code>./install-stalkermap.sh</code></pre>

<p>You can now run the tool anywhere by typing:</p>

<pre><code>stalkermap</code></pre>

<p>To run the API server and get the dashboard:</p>

<pre><code>stalkermapDashboard</code></pre>

<p>Use <b>Ctrl + C</b> to stop the API server.</p>

<p>Alternatively, without installing, you can run:</p>

<pre><code>node .           # Run the tool (default 4 threads)
node stalkermap.js
node server.js   # Run the dashboard API
</code></pre>

<h2>Output</h2>
<p>All info gathered by the tool will be stored in:</p>

<pre><code>~/Desktop/stalkermapOUTPUT/data/appData/{targetName}</code></pre>

<h2>Notes</h2>
<ul>
  <li>The HTML Dashboard may still have some bugs :p</li>
  <li>The tool occasionally uses the <code>dig</code> command for DNS queries, so make sure it is up to date.</li>
</ul>

<p>Thank you for trying out the tool!<br>
I’m open to hearing new features you would like implemented in the final version.<br>
Bye! I use <b>vim</b> (btw)</p>

