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
        let filePaths: string[] = [];
        let analysisResults: { [key: string]: any } = {};

        if (typeof inputPath === "string") {
            filePaths = await this.getMediaFilesFromFolder(inputPath, mediaType!);
        } else {
            filePaths = inputPath;
        }

        for (const filePath of filePaths) {
            const fileName = path.basename(filePath);
            let result;

            if (isVideoFile(filePath)) {
                result = await this.processVideo(filePath);
            } else if (isImageFile(filePath)) {
                result = await this.processImage(filePath);
            }

            if (result) {
                try {
                    // Use full file path as key instead of just the filename
                    analysisResults[filePath] = typeof result === 'string' ? JSON.parse(result) : result;
                } catch (error) {
                    console.error(`Failed to parse analysis result for ${filePath}: ${error}`);
                    analysisResults[filePath] = result; // Keep original result if parsing fails
                }
            }
        }

        return analysisResults;
    }

    private async processVideo(videoPath: string): Promise<any> {
        const videoProcessor = new VideoProcessor(videoPath);
        const extractedFrames = await videoProcessor.extractVideoFrames();

        const base64Frames = await Promise.all(
            extractedFrames.image_urls.map((imgPath) => ImageProcessor.convertImageToBase64(imgPath))
        );

        const analysisResult = await this.aiAnalyzer.analyzeImages(base64Frames);

        await this.deleteCapiqFiles(extractedFrames.image_urls);

        return analysisResult;
    }

    private async processImage(imagePath: string): Promise<any> {
        const base64Image = await ImageProcessor.convertImageToBase64(imagePath);
        const analysisResult = await this.aiAnalyzer.analyzeImages([base64Image]);
        return analysisResult;
    }

    private async getMediaFilesFromFolder(folderPath: string, mediaType: "video" | "image" | "both"): Promise<string[]> {
        try {
            const files = await fs.readdir(folderPath);
            return files
                .map((file) => path.join(folderPath, file))
                .filter((filePath) =>
                    mediaType === "both"
                        ? isVideoFile(filePath) || isImageFile(filePath)
                        : mediaType === "video"
                            ? isVideoFile(filePath)
                            : isImageFile(filePath)
                );
        } catch (error) {
            return [];
        }
    }

    private async deleteCapiqFiles(files: string[]): Promise<void> {
        for (const file of files) {
            try {
                await fs.unlink(file);
            } catch (error) {
                // Silent fail
            }
        }
    }
}
