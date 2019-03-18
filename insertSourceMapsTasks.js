"use strict"

const gulp          = require('gulp')
const glob          = require('glob')
const path          = require('path');
const fs            = require('fs');
const xml2js        = require('xml2js');
const gulpZip       = require('gulp-zip');
const packageConfig = require('./config/package-solution.json');

module.exports = async function() {
    try{
        let targetFile          = packageConfig.paths.zippedPackage;
        let packageName         = path.basename(targetFile)
        let packageFolder       = `sharepoint/${path.dirname(targetFile)}`;

        let appManifestXmlPath  = `${packageFolder}/debug/_rels/AppManifest.xml.rels`;
        let clientAssetsXmlPath = `${packageFolder}/debug/_rels/ClientSideAssets.xml.rels`;
        let contentTypeXmlPath  = `${packageFolder}/debug/[Content_Types].xml`;

        let sourceMapFiles      = await getSourceMapFiles();
        let fileNames           = await copyFiles(sourceMapFiles, `${packageFolder}/debug/ClientSideAssets`);
        let appManifestData     = await getFileData(appManifestXmlPath);
        let clientAssetsData    = await getFileData(clientAssetsXmlPath);
        let contentTypeData     = await getFileData(contentTypeXmlPath);
        let appManifesXml       = await pareseXmlString(appManifestData);
        let clientAssetsXml     = await pareseXmlString(clientAssetsData);
        let contentTypeXml      = await pareseXmlString(contentTypeData);
        let lastNumber          = getLastResourceNumber(appManifesXml);

        addFileRelations(fileNames, lastNumber, clientAssetsXml);
        addContentType(contentTypeXml, 'map', 'application/json');

        await saveXmlFile(clientAssetsXml, clientAssetsXmlPath);
        await saveXmlFile(contentTypeXml, contentTypeXmlPath);

        await packageSppkg(packageFolder, packageName);
    }catch(err){
        console.error(err.stack);
    }
}

/**
 * Finds and retrieves all the .map files in the dist/ folder
 * @returns {Promise<string[]>} Promise for an array of file paths
 */
function getSourceMapFiles(){
    return new Promise((resolve, reject)=>{
        glob(`dist/*.map`, (err, files)=>{
            if(err){ return reject(err); }

            resolve(files);
        })
    })
}

/**
 * Copies a ll files into the ClientSiteAssets folder
 * @param {string[]} files Array of paths for the files to copy
 * @param {string} destination Folder to copy the files into
 * @returns {Promise<string[]>} Promise of an array of file names
 */
function copyFiles(files, destination){
    /**@type {Promise<string>[]} */
    let promiseArray = [];
    
    for(let file of files){
        promiseArray.push(new Promise((resolve, reject)=>{
            let fileName = path.basename(file);

            fs.copyFile(file, `${destination}/${fileName}`, (err)=>{
                if(err){ return reject(err); }

                resolve(fileName);
            });
        }));
    }
    
    return Promise.all(promiseArray);
}

/**
 * Reads data from text files
 * @param {string} filePath
 * @returns {Promise<string>} Promise of a string
 */
function getFileData(filePath){
    return new Promise((resolve, reject)=>{
        fs.readFile(filePath, 'utf-8', (err, data)=>{
            if(err){ return reject(err); }

            resolve(data);
        });
    });
}

/**
 * Parses a xml string into a javascript object
 * @param {string} fileData The XML string
 * @returns {Promise<any>} A promise for a XML object
 */
function pareseXmlString(fileData){
    return new Promise((resolve, reject)=>{
        xml2js.parseString(fileData, (err, result) => {
            if(err){ return reject(err); }

            resolve(result);
        })
    });
}

/**
 * Writes a XML object into a file
 * @param {*} xmlObject 
 * @param {*} destination Path to the final file
 * @returns {Promise<void>} A promise for when the file has finished saving
 */
function saveXmlFile(xmlObject, destination){
    let xmlBuilder = new xml2js.Builder({renderOpts:{pretty: false}});
    let xml = xmlBuilder.buildObject(xmlObject);

    return new Promise((resolve, reject) => {
        fs.writeFile(destination, xml, (err) => {
            if(err){ return reject(err); }

            resolve();
        });
    });
}


/**
 * Reads a rels xml object and finds the id of the final Relationship element
 * @param {*} xmlObject 
 */
function getLastResourceNumber(xmlObject){
    let relationships = xmlObject.Relationships.Relationship;
    let relLength = relationships.length;

    /**@type {string} */
    let lastId = relationships[relLength - 1].$.Id;
    let idNumber = lastId.split('r')[1];

    return parseInt(idNumber);
}

/**
 * Adds new client asset Relationships to a rels xml object
 * @param {string[]} fileNames
 * @param {number} lastId
 * @param {any} xmlObject
 */
function addFileRelations(fileNames, lastId, xmlObject){
    let relationships = xmlObject.Relationships.Relationship;
    
    for(let fileName of fileNames){
        lastId++;
        relationships.push({
            '$':  { 
                Type: 'http://schemas.microsoft.com/sharepoint/2012/app/relationships/clientsideasset',
                Target: `/ClientSideAssets/${fileName}`,
                Id: `r${lastId}`
            }
        });
    }
}

/**
 * Adds new content type to a contentType xml object
 * @param {*} xmlObject 
 * @param {*} extension file extension for the content type
 * @param {*} contentType 
 */
function addContentType(xmlObject, extension, contentType){
    let contentTypes = xmlObject.Types.Default;

    contentTypes.push({
        '$': {
            Extension: extension,
            ContentType: contentType
        }
    })
}


/**
 * Repackage the .sppkg file with all modifications
 * @param {*} folderPath Path of the original sppkg file
 * @param {*} packageName Name of the original sppkg file
 */
function packageSppkg(folderPath, packageName){
    return new Promise((resolve, reject) => {
        try{
            gulp.src(`${folderPath}/debug/**/*`, { dot:true })
                .pipe(gulpZip(packageName))
                .pipe(gulp.dest(folderPath))
                .on('end', resolve);
        }catch(err){
            reject(err);
        }
    });
}