# Utils Scripts for Capital IQ
This repository contains utility scripts for interacting with Capital IQ data.

## Project Structure
```
├── src/
│   ├── index.ts
│   ├── scripts/
│   │   ├── analyzeImagesAi.ts
│   │   └── extractVideoFrames.ts
│   └── utils/
│       ├── constants.ts
│       └── types.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Dependencies

### Main Dependencies
- `@langchain/core`
- `@langchain/openai`
- `dotenv`
- `ffmpeg-static`
- `fluent-ffmpeg`

### Dev Dependencies
- `@types/fluent-ffmpeg`
- `ts-node`
- `typescript`

## Scripts
- `build`: Compiles TypeScript code using `tsc`
- `start`: Runs the application using `ts-node ./src/index.ts`

## Available Features
- Video frame extraction
- AI-powered image analysis

## Getting Started
1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add your OpenAI API key:
```env
OPENAI_API_KEY=your_api_key_here
```

3. Configure the video path:
Open `src/index.ts` and set the `video_path` variable to the path of your video file:
```typescript
const video_path: string = "path/to/your/video.mp4";
```

4. Start the application:
```bash
npm start
```


### Expected Output
The application will:
1. Extract frames from your specified video file
2. Process these frames using AI analysis
3. Output the analysis results to the console 
```json
{
  "description":"In the first image, a hand is reaching out to grasp a black coffee cup on a cluttered desk, which also features a camera and an electronic device. The soft lighting highlights the contrasting colors of the objects and suggests a cozy workspace setting. The overall atmosphere conveys a moment of relaxation or preparation for filming. \n\nIn the second image, a young man in sunglasses is smiling and speaking inside a car, indicating an upbeat mood during his drive. The sunlight filtering through the window adds a warm, casual vibe to the scene. \n\nThe third image shows a reflection of a parking garage, with red lighting visible on the walls. The text overlay hints at an upcoming scheduled event, creating a sense of anticipation. \n\nIn the fourth image, a man dressed in a vest is seated outside a café, engaged in conversation while holding a microphone. The colorful chairsand decorations in the background enhance the lively atmosphere of the setting. \n\nThe last image captures a bustling street scene at night, with vibrant stalls casting warm ligh ts. The individuals in the image appear engaged in conversation, suggesting a festive environment.",
  "tags":["coffee","workspace","camera","relaxation","driving","sunlight","anticipation","café","night market","festive","conversation","colorful"]
}

```

### Troubleshooting
If you encounter any issues:
1. Ensure all dependencies are installed correctly
2. Verify your OpenAI API key is valid and properly set in .env
3. Check if the video file path is correct and accessible
4. Make sure you have sufficient permissions to read the video file

