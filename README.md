# Include source maps in your SharePoint Framework package (.sppkg). SPFx 1.15.2 supported ✅

A sample project for including source map files in the final package file and deploy them to production environments for easy debugging.

## Building the code

```bash
npm i
npm i -g gulp
gulp dist --ship
```

## insertSourceMapTasks.js

The hero of this repo, this is where the code that magically imports any `.map` files into the final package lives.  
**Note: The original blog post by [Diogo Martins](https://github.com/d-martins) is gone**

## gulpfile.js

Where all the tasks are combined into a single `dist` task. Also where the source map files are forced to be created by changing the webpack configurations.
You can read more about these changes from [this article](
https://blog.mastykarz.nl/debug-production-version-sharepoint-framework-solution/).

# How to implement in your existing SPFx ~1.15 project

* install gulp-zip and xml2js  
`npm i gulp-zip xml2js --save-dev` 
* Replace the `gulpfile.js` in your repo with this one (or integrate it, if you're not using the default MS build rig one)
* Add `insertSourcemapsTasks.js` to the root of your project, adjacent to your gulpfile
* Build your project:
```
  gulp clean; 
  gulp bundle;
  gulp package-solution --ship;
  gulp insertSourceMaps;
```

Congrats, your .sppkg now has source maps 🥳
