
# netlify-plugin-critical-css

  

A Netlify Build plugin to inject inline [critical CSS](https://web.dev/extract-critical-css/), built on top of the [`critical` package](https://github.com/addyosmani/critical). It extracts the Critical CSS for all above-the-fold content and inlines this into the HTML document in order to initiate the web document render as fast as possible.

Critical CSS injects above-the-fold inline styles directly into the `<head>` of the HTML document which significately accelerate the initial render time of your web document, which is key for Webpage performance metrics, and is a key signal for SEO and Lighthouse rankings.

  

This plugin is heavily inspired by the original [netlify-plugin-inline-critical-css](https://github.com/Tom-Bonnike/netlify-plugin-inline-critical-css) but aims to improve on some key areas:

 - **Modern** - We aim to use modern ESM architecture and updated dependancies to provide a futureproof plugin that is actively maintained.
 - **High Performance** - This plugin uses a Promise Pool with built-in (and optionally configurable) concurrency and timeout management to improve how the critical CSS rendering jobs are managed.  This effectively runs the process many times faster.  For Netlify users of the Build Instance Upgrade, you can configure your concurrency levels to take full advantage of this.  Even on a standard/regular Build instance, we have managed to render inline Critical CSS for over 750 pages in under 4 minutes (3 pages per second).
 - **Status** - We also wanted to offer better user feedback while the rendering process is underway so you know the plugin is not frozen.  This is especially important on large sites that can take many minutes to complete.  The plugin provides stage notifications and a CLI-style progress bar, which can be optionally muted.


  

## Usage and inputs

  

To install the plugin in the Netlify UI, use this [direct in-app installation link](https://app.netlify.com/plugins/netlify-plugin-critical-css/install) or go to the [Plugins directory](https://app.netlify.com/plugins).

  

For file-based installation, add it to your `netlify.toml` file.

  

```toml

[[plugins]]

package = "netlify-plugin-critical-css"

  

# All inputs are optional, so you can omit this section.

# Defaults are shown below.

[plugins.inputs]

# Path from where build files will be extracted

base = "build"

  

# An array of globs. Only files and directories that match
at least one of the provided globs will be returned.

globs = ["**/*.html"]
  
# An array of objects containing `width` and `height` properties 
to deliver critical CSS for multiple screen resolutions.

dimensions = [
	{ width: 375, height: 1200 },
	{ width: 1024, height: 1400 },
	{ width: 1280, height: 1500 }
]

# An array of globs. Files and directories that match at least 
one of the provided globs will be pruned while searching.

ignore = ['node_modules', '_app', '_next']

# A JSON object or array of ignore CSS rules. See postcss-discard 
for usage examples. If you pass an array all rules will be applied 
to atrules, rules and declarations

ignoreCssRules = ['@font-face']

# The maximum number of tasks being processed in 
parallel. The default Netlify build concurrency is 3.  
In local dev, this value is ignored and 1 task will always be used.

concurrency = 3

# Configure a millisecond timeout in which a task must 
finish processing. A task that times out is marked as failed. 
A configured timeout is configured for each task, 
not for the whole pool

taskTimeout = 2000

# When Silent is false, output a progress bar when the plugin 
is rendering Critical CSS to all of the found pages

showProgressBar = true

# Surpress all console logging 

silent = false
```

  

To complete file-based installation, from your project’s base directory, use npm, yarn, or any other Node.js package manager to add the plugin to `devDependencies` in `package.json`.

  

```bash

npm install -D netlify-plugin-critical-css

```

  

Once installed and configured, the plugin will automatically run for all of your site’s deploys.

  

### Testing locally

  

To [test this plugin locally](https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#local-plugins), you can use the [Netlify CLI](https://docs.netlify.com/cli/get-started/#run-builds-locally):

  

```bash

# Install the Netlify CLI.

npm install netlify-cli -g

  

# In the project working directory, run the build as Netlify would with the build bot.

netlify build

```