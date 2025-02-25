import fs from "node:fs/promises";
import {IMAGE_WIDTH, OUTPUT_FOLDER} from "../utils/constants";
import {MetaData, Result} from "../utils/types";
import ffmpeg from "fluent-ffmpeg";
import path from "node:path";

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
        // Dynamic frame calculation based on video duration
        let numberOfFrames = Math.ceil(Math.sqrt(videoMinutes) * 2); // Square root scaling for more balanced distribution
        
        // Ensure frames stay within bounds
        numberOfFrames = Math.max(numberOfFrames, this.minFrames);
        numberOfFrames = Math.min(numberOfFrames, this.maxFrames);

        const intervals = [];
        // Adjust the time range to end a few seconds before the video ends
        const endBuffer = Math.min(5, duration * 0.1); // 5 seconds or 10% of video duration, whichever is smaller
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

            // Verify file exists and has size greater than 0
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

    public async extractVideoFrames(): Promise<Result> {
        await this.ensureOutputFolder();
        const { filepath, duration } = await this.getVideoMetadata();

        const frameIntervals = this.calculateFrameIntervals(duration);
        const successfulImages: string[] = [];

        for (const { label, time } of frameIntervals) {
            try {
                const imagePath = await this.extractSingleFrame(label, time);
                successfulImages.push(imagePath);
                // Add a small delay between extractions
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                // Silently continue to next frame on error
            }
        }

        return { filepath, image_urls: successfulImages };
    }
}

export default VideoProcessor;