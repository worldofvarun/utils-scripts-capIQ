import dotenv from 'dotenv';
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import analyzeImages from "./scripts/analyzeImagesAi";
import extractVideoFramesToBase64 from "./scripts/extractVideoFrames";


//CONFIG'S
dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath as string);

const video_path: string = ""

extractVideoFramesToBase64(video_path).then(result => {
    analyzeImages(result).then(r => console.log(r))
})