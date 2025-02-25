import fs from "node:fs/promises";
import path from "node:path";

class ImageProcessor {

    public static async convertImageToBase64(imagePath: string): Promise<string> {
        try {
            const data = await fs.readFile(imagePath);
            const mimeType = `image/${path.extname(imagePath).substring(1)}`;
            return `data:${mimeType};base64,${data.toString("base64")}`;
        } catch (error) {
            console.error(`❌ Error converting image to Base64: ${imagePath}`, (error as Error).message);
            throw new Error(`Failed to convert image to Base64: ${imagePath}`);
        }
    }
}

export default ImageProcessor;