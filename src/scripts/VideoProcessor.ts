import fs from "node:fs/promises";
import {FRAME_INTERVALS, IMAGE_WIDTH, OUTPUT_FOLDER} from "../utils/constants";
import {MetaData, Result} from "../utils/types";
import ffmpeg from "fluent-ffmpeg";
import path from "node:path";

class VideoProcessor{
    private readonly videoPath: string;
    constructor(videoPath: string) {
        this.videoPath = videoPath;
    }

    private async ensureOutputFolder(): Promise<void> {
        try {
            await fs.mkdir(OUTPUT_FOLDER, { recursive: true });
        } catch (error) {
            console.error(`❌ Error creating output folder: ${(error as Error).message}`);
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
                .on("end", () => resolve({ filename: path.basename(this.videoPath), duration }))
                .outputOptions("-f null")
                .output("-")
                .run();
        });
    }

    public async extractVideoFrames(): Promise<Result> {
        await this.ensureOutputFolder();
        const { filename, duration } = await this.getVideoMetadata();

        const framePromises = FRAME_INTERVALS.map(({ label, percentage }) => {
            const outputImagePath = path.join(OUTPUT_FOLDER, `${path.basename(this.videoPath, ".mp4")}_${label}.jpg`);
            const time = duration * percentage;

            return new Promise<string>((resolve, reject) => {
                ffmpeg(this.videoPath)
                    .seekInput(time)
                    .frames(1)
                    .outputOptions(["-vf", `scale=${IMAGE_WIDTH}:-1`])
                    .save(outputImagePath)
                    .on("end", () => resolve(outputImagePath))
                    .on("error", (err) => reject(new Error(`❌ Frame extraction failed for ${label}: ${err.message}`)));
            });
        });

        const results = await Promise.allSettled(framePromises);
        const successfulImages = results
            .filter((result): result is PromiseFulfilledResult<string> => result.status === "fulfilled")
            .map((result) => result.value);

        return { filename, image_urls: successfulImages };
    }
}

export default VideoProcessor;