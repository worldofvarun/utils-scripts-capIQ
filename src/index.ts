import dotenv from 'dotenv';
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import {MediaAnalysisPipeline} from "./scripts/MediaAnalysisPipeline";



//CONFIG'S
dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath as string);
ffmpeg.setFfprobePath(ffmpegPath as string);



const FILES = ["C:/test/test/test/test.mp4", "C:/test/test/test/test.mp4"];
const FOLDER = "\"C:/test/test/test/"
const pipeline = new MediaAnalysisPipeline();
// path, mediaType: both | images | video
pipeline.processMedia(FOLDER, "both"); //
