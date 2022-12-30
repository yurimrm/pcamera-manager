const express = require("express");
const PiCamera = require('pi-camera');

const fs = require("fs");

const myCamera = new PiCamera({
  mode: 'video',
  output: `./assets/live-cam.h264`,
  width: 1280,
  height: 780
});

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const range = req.headers.range;
    if (!range) {
      res.status(400).send("Seu navegador tem que ter suporte a receber dados multimídia");
    }
    else {

      myCamera.record()
      .then((result) => {
        // Your video was captured
        const videoPath = "./assets/live-cam.h264";
        const videoSize = fs.statSync("./assets/teste.mp4").size;
        const CHUNK_SIZE = 10 ** 6;
        const start = Number(range.replace(/\D+/g,""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;

        console.log(contentLength);

        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };

        res.writeHead(206, headers);
        const videoStream = fs.createReadStream(videoPath, { start, end });
        videoStream.pipe(res);
      })
      .catch((error) => {
        // Handle your error
      });
      
    }
});

module.exports = router;
