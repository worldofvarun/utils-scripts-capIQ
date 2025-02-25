import { isImageFile, isVideoFile } from "../utils/fileHelper";
import path from "node:path";
import fs from "node:fs/promises";
import ImageProcessor from "./ImageProcessor";
import VideoProcessor from "./VideoProcessor";
import AIAnalyzer from "./AIAnalyzer";

export class MediaAnalysisPipeline {
    private readonly aiAnalyzer: AIAnalyzer;

    constructor() {
        this.aiAnalyzer = new AIAnalyzer();
    }


    public async processMedia(inputPath: string | string[], mediaType?: "video" | "image" | "both"): Promise<{ [key: string]: any }> {
        console.log("🚀 Starting media processing...");

        let filePaths: string[] = [];
        let analysisResults: { [key: string]: any } = {};

        if (typeof inputPath === "string") {
            console.log(`📂 Processing folder: ${inputPath}`);
            filePaths = await this.getMediaFilesFromFolder(inputPath, mediaType!);
        } else {
            console.log(`📁 Processing file list:`, inputPath);
            filePaths = inputPath;
        }

        console.log(`🔍 Found ${filePaths.length} media files`);

        for (const filePath of filePaths) {
            const fileName = path.basename(filePath);

            if (isVideoFile(filePath)) {
                console.log(`🎥 Processing video: ${fileName}`);
                analysisResults[fileName] = await this.processVideo(filePath);
            } else if (isImageFile(filePath)) {
                console.log(`🖼️ Processing image: ${fileName}`);
                analysisResults[fileName] = await this.processImage(filePath);
            }
        }

        console.log("✅ Media processing completed!");


        console.log("🎯 Final JSON Output:", JSON.stringify(analysisResults, null, 2));

        return analysisResults;
    }


    private async processVideo(videoPath: string): Promise<any> {
        console.log(`⏳ Extracting frames from: ${videoPath}`);
        const videoProcessor = new VideoProcessor(videoPath);
        const extractedFrames = await videoProcessor.extractVideoFrames();

        console.log(`✅ Extracted ${extractedFrames.image_urls.length} frames from ${path.basename(videoPath)}`);

        const base64Frames = await Promise.all(
            extractedFrames.image_urls.map((imgPath) => ImageProcessor.convertImageToBase64(imgPath))
        );

        console.log("📡 Sending frames for AI analysis...");
        const analysisResult = await this.aiAnalyzer.analyzeImages(base64Frames);

        console.log(`📊 AI Analysis for ${path.basename(videoPath)} done.`);

        await this.deleteCapiqFiles(extractedFrames.image_urls);

        return analysisResult;
    }


    private async processImage(imagePath: string): Promise<any> {
        console.log(`⏳ Converting image to Base64: ${imagePath}`);
        const base64Image = await ImageProcessor.convertImageToBase64(imagePath);

        console.log("📡 Sending image for AI analysis...");

        const analysisResult = await this.aiAnalyzer.analyzeImages([base64Image]);

        console.log(`📊 AI Analysis for ${path.basename(imagePath)} done.`);
        return analysisResult;
    }


    private async getMediaFilesFromFolder(folderPath: string, mediaType: "video" | "image" | "both"): Promise<string[]> {
        try {
            console.log(`📂 Scanning folder: ${folderPath}`);
            const files = await fs.readdir(folderPath);
            const filteredFiles = files
                .map((file) => path.join(folderPath, file))
                .filter((filePath) =>
                    mediaType === "both"
                        ? isVideoFile(filePath) || isImageFile(filePath)
                        : mediaType === "video"
                            ? isVideoFile(filePath)
                            : isImageFile(filePath)
                );

            console.log(`🔍 Found ${filteredFiles.length} matching ${mediaType} files`);
            return filteredFiles;
        } catch (error) {
            console.error(`❌ Error reading folder ${folderPath}:`, (error as Error).message);
            return [];
        }
    }

    private async deleteCapiqFiles(files: string[]): Promise<void> {
        for (const file of files) {
                try {
                    await fs.unlink(file);
                    console.log(`🗑️ Deleted: ${file}`);
                } catch (error) {
                    console.error(`❌ Failed to delete ${file}:`, (error as Error).message);
                }
        }
    }
}
