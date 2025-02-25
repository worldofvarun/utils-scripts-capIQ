import {ChatOpenAIResponseFormat} from "@langchain/openai";
import {FrameInterval} from "./types";

export const videoTagAIInstructions = `
Purpose:
This metadata will be used to:

Improve searchability of your videos across platforms
Optimize for algorithm recommendations
Create consistent cataloging and organization
Enable accessibility features for viewers
Support analytics and content strategy decisions

Context
Our AI-powered video analysis system needs detailed information about your video content to generate accurate metadata. This metadata consists of descriptive summaries and relevant keyword tags that capture the essential elements of your video. The more specific details you provide, the more precise and useful the generated metadata will be.
Instructions
Please describe your video comprehensively, addressing these key elements:

Main Subjects:

Who or what is the primary focus? (people, animals, products, landscapes)
What distinguishing characteristics do they have? (appearance, clothing, behaviors)
Are there important secondary subjects?


Actions & Events:

What specific activities are occurring?
Is there a sequence or progression of events?
Are there notable interactions between subjects?


Setting & Environment:

Where does the video take place? (indoor/outdoor, specific location)
What time of day or season is depicted?
What notable elements exist in the background or surroundings?


Visual Elements:

What is the dominant color palette?
How would you describe the lighting? (bright, dim, natural, artificial)
What camera techniques are used? (static, handheld, drone, closeups, wide shots)
Are there any distinctive visual styles? (minimalist, vibrant, vintage)


Technical Aspects:

What editing techniques are employed? (quick cuts, long takes, transitions)
Are there any special effects, graphics, or text overlays?
Is there any screen recording, animation, or other specialized content?


Audio Components:

Is there narration, dialogue, or voiceover?
What type of music plays? (genre, tempo, mood)
Are there sound effects or ambient audio?
How does the audio complement the visual content?


Emotional Tone:

What feelings does the video evoke? (inspiring, informative, humorous)
What is the pacing like? (energetic, relaxed, suspenseful)
What is the intended emotional impact on viewers?


Content Purpose:

Is this educational, promotional, entertainment, or another category?
Who is the target audience?
What is the key message or takeaway?



Example Input
"This instructional cooking video demonstrates how to make homemade pasta from scratch. A professional chef in a white coat works in a modern kitchen with stainless steel appliances and warm lighting. The video begins with ingredients laid out on a marble countertop, then progresses through mixing, kneading, rolling, and cutting the pasta dough. There are several closeup shots of hand techniques and detailed steps. The camera occasionally switches to overhead angles to show the full workspace. The chef provides clear narration throughout, explaining each step in a conversational, encouraging tone. Soft Italian instrumental music plays in the background. The video includes text overlays identifying ingredients and measurements. The overall mood is approachable and educational, aimed at home cooks wanting to learn a new skill."
Expected Output
Description (2-4 sentences):
A comprehensive instructional video featuring a professional chef creating homemade pasta from scratch in a modern kitchen environment. The detailed demonstration progresses methodically through each stage of pasta-making with expertly-filmed closeups of critical techniques and overhead shots providing workspace context. Clear narration guides viewers through the process while text overlays highlight key ingredients and measurements, all enhanced by gentle Italian instrumental music that creates an accessible, educational atmosphere for aspiring home cooks.
Tags (8-12 relevant terms):
cooking, pasta, homemade, chef, tutorial, italian, culinary, kitchen, food, baking, instructional, recipe
Metadata Requirements
Description Requirements:

Must be 2-4 complete, well-structured sentences
Should capture the most distinctive elements of the video
Must be written in present tense, third-person perspective
Should avoid subjective opinions and focus on observable content
Must include key visual and audio elements

Tag Requirements:

Provide 8-12 tags that best represent the content
All tags must be lowercase with no special characters
Focus on specific, searchable terms rather than generic ones
Include a mix of subject, action, setting, and mood-related tags
Avoid duplicate or highly similar tags
Each tag should be either a single word or a short phrase (1-3 words maximum)
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

export const OUTPUT_FOLDER = '.capiq';