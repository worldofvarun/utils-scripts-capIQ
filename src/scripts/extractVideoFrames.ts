import ffmpeg from "fluent-ffmpeg";
import {FRAME_INTERVALS, IMAGE_WIDTH} from "../utils/constants";
import {MetaData, Result} from "../utils/types";


/**
 * @param {string} source - The path of the video file to process.
 * @returns {Promise<Result>} A promise that resolves to an object containing:
 * - `filename` (string): The name of the video file.
 * - `image_urls` (string[]): An array of Base64-encoded image URLs representing the extracted frames.
 * */
async function extractVideoFramesToBase64(source: string): Promise<Result> {

    const {filename, duration}: MetaData = await new Promise((resolve, reject) => {
        let duration = 0;
        let filename = source;

        const command = ffmpeg(source)
            .on('codecData', (data) => {
                if (data && data.duration) {
                    const [hours, minutes, seconds] = data.duration.split(':').map(parseFloat);
                    duration = hours * 3600 + minutes * 60 + seconds;
                }
            })
            .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
            .on('end', () => {
                resolve({ filename, duration });
            });

        command.outputOptions('-f null').output('-'); // Dummy output to prevent the error
        command.run();
    });

    const tasks = FRAME_INTERVALS.map(({label, percentage}) => {
        const time = duration * percentage;
        return new Promise((resolve, reject) => {
            let base64 = "";
            ffmpeg(source)
                .seekInput(time)
                .frames(1)
                .outputOptions(['-vf', `scale=${IMAGE_WIDTH}:-1`])
                .format('image2pipe')
                .on('end', () => resolve(`data:image/jpeg;base64,${base64}`))
                .on('error', (err) => {
                    reject(new Error(`Frame extraction failed for ${label}: ${err.message}`));
                }).pipe()
                .on('data', (chuck) => {
                    base64 += chuck.toString('base64');
                });
        });
    });

    const frames = await Promise.all(tasks);
    const result: Result = {filename: filename, image_urls: frames.map((base64) => (base64 as string))}
    return result
}

export default extractVideoFramesToBase64;