const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const filesize = require('filesize');
const { log } = require('console');
const verifyApiToken = require('../verify/verifyApiToken');

dotenv.config();

let uploads_directory = `${__dirname}/../${process.env.MEDIA_DIR_DEV}`;

if (process.env.ENVIRONMENT !== "development") {
   uploads_directory = `${process.env.MEDIA_DIR_PROD}/public/uploads`;
} 

const file_newname = (path, filename) =>{

  let pos = filename.split('.');
  let name = pos[0];
  let ext = pos[1];

  let newpath = path+'/'+filename;
  let newname = filename;
  let counter = 1;

  while (fs.existsSync(newpath)) {
      newname = name +'_'+ counter +'.'+ ext;
      newpath = path +'/'+ newname;
      counter++;
  }

  return newpath;

}


//upload Files in spesific foldre
router.post('/uploads/:folder?',verifyApiToken, async (req, res) =>{

 //try {

    let dir = uploads_directory;

    if(req.params.folder)
      dir = `${uploads_directory}/${req.params.folder}`;
    if(req.params.folder)
      if (!fs.existsSync(dir))
          fs.mkdirSync(dir);

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    let uploadedFiles = req.files.file;

    let savedFiles = [];

    if( !Array.isArray(uploadedFiles) ){

        let fileUploaded = uploadedFiles;

        let filename = fileUploaded.name.toLowerCase().replace(/[/\\?%*:|"<>]/g, '-');

        let filePath = file_newname(dir , filename);

        fileUploaded.mv(filePath, function(err) {

            if (err)

              return res.status(500).send(err);
   

            let fileShortPath = `uploads/${filename}`;

            if (req.params.folder)

              fileShortPath = `uploads/${req.params.folder}/${filename}`;

              savedFiles.push(fileShortPath);

              return res.status(200).send(fileShortPath);

        });

    }else{

      const promiseFilesArray = uploadedFiles.map( (fileItem) => {
        return new Promise(function (resolve, reject) {
    
            let fileUploaded = fileItem;
            let filename = fileUploaded.name.toLowerCase().replace(/[/\\?%*:|"<>]/g, '-');
            let filePath = file_newname(dir , filename);

            fileUploaded.mv(filePath, function(err) {
                if (err)
                  return reject(err);
                  //return res.status(500).send(err);

                let fileShortPath = `uploads/${filename}`;

                if (req.params.folder)

                  fileShortPath = `uploads/${req.params.folder}/${filename}`;

                  savedFiles.push(fileShortPath);

                  return resolve(savedFiles);
                  //return res.status(200).send(fileShortPath);

            });

        });

      });

        Promise.all(promiseFilesArray).then(function() {

          return res.status(200).send(savedFiles);

        })

    }

    // } catch (err) {

    //   res.status(500).json({message: err});

    // }


});



//Get All Files Exept Trash
router.get('/files',verifyApiToken, async (req, res) => {
  
  try {

    glob(uploads_directory + '/**/*', (err, files) => {

      if (err) {

        return res.status(500).send(err);

      } else {

        let filelist = {};

        filelist.dir = [];

        filelist.files = [];

        files.forEach(function(file) {

          if (fs.statSync(file).isDirectory()) {

            filelist.dir.push(file);

          }

          else {

            let stats = fs.statSync(file);

            let extension = file.split('.').pop();

            let fileName = file.split('/').pop();

            let filesObj = {};

            if(extension !== 'html'){

              let splittPath = file.split('public/');

              filesObj.path = splittPath[1];

              filesObj.fileName = fileName;

              filesObj.size = filesize(stats.size);

              filesObj.create_date = stats.birthtime;

              filesObj.extension = extension;

              filelist.files.push(filesObj);

            }

          }

        });


        filelist.files = filelist.files.slice().sort((a, b) => b.create_date - a.create_date);

        return res.status(200).send(filelist);

      }

    });


  } catch (error) {

    return res.status(500).send(error);

  }

});


//move Files to trash
router.patch('/',verifyApiToken, async (req, res) => {

  try {

    let filePath = req.body.path.replace('uploads', '');

    let globalPath = uploads_directory + filePath;

    let trashPath = uploads_directory +'/trash'+ filePath;


    fs.rename(globalPath, trashPath, (err) => {

      if (err) throw err;

      return res.status(200).send('file archived');

    });  

  } catch(err) {

    return res.status(500).send(err);

  }


});



//restore Files from trash
router.patch('/restore',verifyApiToken, async (req, res) => {

  try {

    let filePath = req.body.path.replace('uploads/trash', '');
    let globalPath = uploads_directory +'/trash'+ filePath;
    let restorePath = uploads_directory + filePath;

    fs.rename(globalPath, restorePath, (err) => {

      if (err) throw err;

      return res.status(200).send('file archived');

    });  


  } catch(err) {

    return res.status(500).send(err);

  }

});


//Delete Files
router.delete('/',verifyApiToken, async (req, res) => {

  try {

    let filePath = req.body.path.replace('uploads/trash', '');

    let globalPath = uploads_directory +'/trash'+ filePath;

    fs.unlinkSync(globalPath);

    return res.status(200).send('file deleted');

  } catch(err) {

    return res.status(500).send(err);

  }


});


//Move multi Files to trash
router.patch('/multi',verifyApiToken, async (req, res) => {

  try {

    files = req.body.selection.files;

    files.map(function(file, index) {

      let filePath = file.path.replace('uploads', '');

      let globalPath = uploads_directory + filePath;

      let trashPath = uploads_directory +'/trash'+ filePath;

      fs.rename(globalPath, trashPath, (err) => {

        if (err) throw err;

      });  

    });

    return res.status(200).send('file archived');

  } catch(err) {

    return res.status(500).send(err);

  }

});


module.exports = router;