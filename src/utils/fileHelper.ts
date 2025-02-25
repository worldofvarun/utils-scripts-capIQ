import path from "path";

const VIDEO_EXTENSIONS = [".mp4", ".avi", ".mov", ".mkv"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".bmp", ".gif"];

export function isVideoFile(filePath: string): boolean {
    return VIDEO_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}

export function isImageFile(filePath: string): boolean {
    return IMAGE_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}
