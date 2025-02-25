import fs from "node:fs/promises";
import {IMAGE_WIDTH, OUTPUT_FOLDER} from "../utils/constants";
import {MetaData, Result} from "../utils/types";
import ffmpeg from "fluent-ffmpeg";
import path from "node:path";
import sharp from "sharp";

class VideoProcessor{
    private readonly videoPath: string;
    private readonly minFrames = 3;
    private readonly maxFrames = 20; // max frames to 20

    constructor(videoPath: string) {
        this.videoPath = videoPath;
    }

    private async ensureOutputFolder(): Promise<void> {
        try {
            await fs.mkdir(OUTPUT_FOLDER, { recursive: true });
        } catch (error) {
            // Silently handle error
        }
    }

    private async getVideoMetadata(): Promise<MetaData> {
        return new Promise((resolve, reject) => {
            let duration = 0;

            ffmpeg(this.videoPath)
                .on("codecData", (data) => {
                    if (data?.duration) {
                        const [hours, minutes, seconds] = data.duration.split(":").map(parseFloat);
                        duration = hours * 3600 + minutes * 60 + seconds;
                    }
                })
                .on("error", (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
                .on("end", () => resolve({ filepath: this.videoPath, duration }))
                .outputOptions("-f null")
                .output("-")
                .run();
        });
    }

    private calculateFrameIntervals(duration: number): Array<{ label: string, time: number }> {
        const videoMinutes = duration / 60;

        let numberOfFrames = Math.ceil(Math.sqrt(videoMinutes) * 2);

        numberOfFrames = Math.max(numberOfFrames, this.minFrames);
        numberOfFrames = Math.min(numberOfFrames, this.maxFrames);

        const intervals = [];

        const endBuffer = Math.min(5, duration * 0.1);
        const effectiveDuration = duration - endBuffer;

        for (let i = 0; i < numberOfFrames; i++) {
            const percentage = i / (numberOfFrames - 1);
            const time = effectiveDuration * percentage;
            intervals.push({
                label: `frame_${i + 1}`,
                time
            });
        }

        return intervals;
    }

    private async extractSingleFrame(label: string, time: number, retryCount = 0): Promise<string> {
        const maxRetries = 3;
        const outputImagePath = path.join(OUTPUT_FOLDER, `${path.basename(this.videoPath, ".mp4")}_${label}.jpg`);

        try {
            await new Promise<void>((resolve, reject) => {
                ffmpeg(this.videoPath)
                    .seekInput(time)
                    .frames(1)
                    .outputOptions(["-vf", `scale=${IMAGE_WIDTH}:-1`])
                    .on("end", (_stdout: string | null, _stderr: string | null) => resolve())
                    .on("error", reject)
                    .save(outputImagePath);
            });


            const stats = await fs.stat(outputImagePath);
            if (stats.size === 0) {
                throw new Error("Generated file is empty");
            }

            return outputImagePath;
        } catch (error) {
            if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                return this.extractSingleFrame(label, time, retryCount + 1);
            }
            throw new Error(`Frame extraction failed for ${label} after ${maxRetries} attempts: ${(error as Error).message}`);
        }
    }


    private async mergeImagesIntoGrid(imagePaths: string[]): Promise<string> {
        if (imagePaths.length === 0) {
            throw new Error("No images to merge");
        }


        const imagesCount = imagePaths.length;
        const columns = Math.ceil(Math.sqrt(imagesCount));
        const rows = Math.ceil(imagesCount / columns);


        const outputMergedPath = path.join(
            OUTPUT_FOLDER,
            `${path.basename(this.videoPath, ".mp4")}_merged_frames.jpg`
        );

        const imageBuffers = await Promise.all(
            imagePaths.map(async (imagePath) => {
                const imageBuffer = await fs.readFile(imagePath);
                return {
                    path: imagePath,
                    buffer: imageBuffer,
                    metadata: await sharp(imageBuffer).metadata()
                };
            })
        );

        const frameWidth = IMAGE_WIDTH;
        const frameHeight = Math.round(
            imageBuffers.reduce((sum, img) =>
                sum + (img.metadata.height || 1) * frameWidth / (img.metadata.width || 1), 0
            ) / imageBuffers.length
        );


        const compositeArray = [];
        let currentX = 0;
        let currentY = 0;
        let rowHeight = 0;

        for (let i = 0; i < imageBuffers.length; i++) {

            const resizedImage = await sharp(imageBuffers[i].buffer)
                .resize(frameWidth, frameHeight, {
                    fit: "contain",
                    background: { r: 0, g: 0, b: 0, alpha: 1 }
                })
                .toBuffer();

            compositeArray.push({
                input: resizedImage,
                left: currentX,
                top: currentY,
            });


            currentX += frameWidth;
            rowHeight = frameHeight;


            if ((i + 1) % columns === 0) {
                currentX = 0;
                currentY += rowHeight;
            }
        }


        await sharp({
            create: {
                width: frameWidth * columns,
                height: frameHeight * rows,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 1 }
            }
        })
            .composite(compositeArray)
            .jpeg({ quality: 90 })
            .toFile(outputMergedPath);

        return outputMergedPath;
    }


    private async safeDeleteFiles(files: string[]): Promise<void> {
        const maxRetries = 3;
        const retryDelay = 500; // ms

        for (const file of files) {
            let deleted = false;
            let attempts = 0;

            while (!deleted && attempts < maxRetries) {
                try {
                    await fs.unlink(file);
                    deleted = true;
                } catch (error) {
                    attempts++;

                    if (attempts === maxRetries) {
                        console.error(`Failed to delete temporary file ${file} after ${maxRetries} attempts: ${error}`);
                    } else {
                        // Wait before retrying
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                    }
                }
            }
        }
    }

    public async extractVideoFrames(): Promise<Result> {
        await this.ensureOutputFolder();
        const { filepath, duration } = await this.getVideoMetadata();

        const frameIntervals = this.calculateFrameIntervals(duration);
        const successfulImages: string[] = [];

        for (const { label, time } of frameIntervals) {
            try {
                const imagePath = await this.extractSingleFrame(label, time);
                successfulImages.push(imagePath);
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                // Silently continue to next frame on error
            }
        }


        let resultImages: string[] = [];
        if (successfulImages.length > 1) {
            try {
                const mergedImagePath = await this.mergeImagesIntoGrid(successfulImages);
                resultImages = [mergedImagePath];


                await this.safeDeleteFiles(successfulImages);
            } catch (error) {
                console.error(`Failed to merge images: ${(error as Error).message}`);
                resultImages = successfulImages;
            }
        } else {
            resultImages = successfulImages;
        }

        return { filepath, image_urls: resultImages };
    }
}

export default VideoProcessor;