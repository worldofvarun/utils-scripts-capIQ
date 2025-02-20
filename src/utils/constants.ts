import {ChatOpenAIResponseFormat} from "@langchain/openai";
import {FrameInterval} from "./types";

export const videoTagAIInstructions = `
Video Metadata Generation Prompt

Provide the details of your video to generate accurate metadata (description and tags). Follow the guidelines below to ensure the best results:

Instructions:
Describe your video content, including as much detail as possible about the following:

1. Subjects: People, animals, objects, or notable elements visible.
2. Actions: What’s happening in the video (movements, interactions, transitions).
3. Visual Composition: Colors, lighting, framing, or any notable aesthetic elements.
4. Setting: Environment or location where the video takes place.
5. Technical Elements: Shot types, transitions, special effects, etc.
6. Emotional Tone: The overall mood or energy conveyed.

Example Input:
"A person is walking through a forest trail with vibrant green trees, dappled sunlight breaking through the canopy. The camera follows in a wide-angle shot, capturing the peaceful ambiance of nature."

Expected Output:
- Description: A 2-4 sentence summary of the content, highlighting key subjects, actions, and visuals.
- Tags: 8-12 single words or short phrases (1-2 words) that reflect subjects, actions, settings, and moods. All tags must be lowercase with no special characters.

Ready to analyze your video? Describe your content below:
`;

export const IMAGE_WIDTH = 512;

export const FRAME_INTERVALS: FrameInterval[] = [
    { label: "start", percentage: 0.05 },
    { label: "quarter", percentage: 0.25 },
    { label: "middle", percentage: 0.5 },
    { label: "three_quarters", percentage: 0.75 },
    { label: "end", percentage: 0.95 },
];



export const JSON_SCHEMA = {
    type: "json_schema",
    json_schema: {
        name: "response_schema",
        schema: {
            type: "object",
            properties: {
                description: {
                    type: "string",
                    description: "A detailed description of a specific scene or moment from the video. Prompt: 'Describe the scene in the video frame in 2-3 sentences, focusing on key actions, objects, and the setting. For example: A close-up of a hand holding a coffee cup with a camera and electronic device in the background, suggesting the start of a morning routine for the vlogger.'",
                },
                tags: {
                    type: "array",
                    description: "Tags representing key elements or themes of the video scene.",
                    items: {
                        type: "string"
                    }
                }
            }
        }
    }
} as ChatOpenAIResponseFormat;