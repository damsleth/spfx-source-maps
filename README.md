# Include source maps in your SharePoint Framework package

A sample project for including source map files in the final package file and deploy them to production environments for easy debugging.

## Building the code

```bash
npm i
npm i -g gulp
gulp dist --ship
```

## insertSourceMapTasks.js

The hero of this repo, this is where the code that magically imports any `.map` files into the final package lives.
If you want to know what's behind the magic, check [this article](https://dev-logs/include-source-maps-in-your-sharepoint-framework-package) for a step-by-step analysis of the process involved.

## gulpfile.js

Where all the tasks are combined into a single `dist` task. Also where the source map files are forced to be created by changing the webpack configurations.
You can read more about these changes from [this article](
https://blog.mastykarz.nl/debug-production-version-sharepoint-framework-solution/).
