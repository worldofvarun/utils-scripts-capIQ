# Utils Scripts for Capital IQ
This repository contains utility scripts for interacting with Capital IQ data.

## Folder Structure
```
├── .capiq/                 # Temporary directory for processed files
├── src/
│   ├── scripts/           # Core processing scripts
│   │   ├── AIAnalyzer.ts
│   │   ├── ImageProcessor.ts
│   │   ├── MediaAnalysisPipeline.ts
│   │   └── VideoProcessor.ts
│   ├── utils/             # Utility functions and helpers
│   │   ├── constants.ts
│   │   ├── fileHelper.ts
│   │   └── types.ts
│   └── index.ts          # Main entry point
├── .env                   # Environment variables
├── package.json          # Project dependencies and scripts
├── package-lock.json     # Locked versions of dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # Project documentation
```

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/worldofvarun/utils-scripts-capIQ.git
   cd utils-scripts-capIQ
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Compile TypeScript (optional):
   ```sh
   tsc
   ```
4.Create a `.env` file in the root directory and add your OpenAI API key:
```env
OPENAI_API_KEY=your_api_key_here
```

## Usage

### Running the Media Analysis Pipeline

Create a `index.ts` file to run the pipeline:

```typescript
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
```

### Expected Output Format

The AI analysis results are returned in the following format:
```json
{
    "video1.mp4": {
        "description": "A thrilling chase scene with explosions...",
        "tags": ["chase", "explosion", "thriller"]
    },
    "image1.jpg": {
        "description": "A beautiful sunset over the ocean with a sailboat...",
        "tags": ["sunset", "ocean", "sailboat"]
    }
}
```

## Reference

### `processMedia(inputPath: string | string[], mediaType?: "video" | "image" | "both"): Promise<Object>`
Processes the given folder or list of files.

**Parameters:**
- `inputPath` *(string | string[])*: The folder path or list of file paths.
- `mediaType` *("video" | "image" | "both")*: Type of media to process (only needed if using a folder).

**Returns:**
- A JSON object containing AI analysis results.

---

### `processVideo(videoPath: string): Promise<void>`
Extracts frames from a video and analyzes them together.

**Parameters:**
- `videoPath` *(string)*: The path to the video file.

---

### `processImage(imagePath: string): Promise<void>`
Processes an individual image and analyzes it separately.

**Parameters:**
- `imagePath` *(string)*: The path to the image file.

---

### `getMediaFilesFromFolder(folderPath: string, mediaType: "video" | "image" | "both"): Promise<string[]>`
Scans a folder and retrieves media files based on the selected media type.

**Parameters:**
- `folderPath` *(string)*: The folder to scan.
- `mediaType` *("video" | "image" | "both")*: Media type filter.

**Returns:**
- A list of matching media file paths.

## Cleanup

After processing, temporary `.capiq` images are deleted automatically to free up space.

## Running the Project

1. **Run the script:**
   ```sh
   tsc index.ts && node index.js
   ```




