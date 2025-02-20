import {ChatOpenAI} from "@langchain/openai";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import {JSON_SCHEMA, videoTagAIInstructions} from "../utils/constants";
import {Result} from "../utils/types";
/**
* @param {Result} source - An object containing:
*   - `filename` (string): The name of the video file.
*   - `image_urls` (string[]): An array of Base64-encoded image URLs to be analyzed.
* @returns {Promise<Object>} A promise that resolves to the AI-generated metadata, including a description and a list of tags.
*
*/
async function analyzeImages(source: Result){

    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        maxTokens: 300,
    });

    const messages = [
        new SystemMessage(videoTagAIInstructions),
        new HumanMessage({
            content: [
                {
                    type: "text",
                    text: "Analyze this image from a video and provide: 1. A detailed description (2-3 sentences) 2. A list of relevant tags that describe the content",
                },
                ...source.image_urls.map((url) => {
                    return {
                        type: "image_url",
                        image_url: {url}
                    }
                })
            ]
        })
    ]

    const response = await model.invoke(messages, {response_format: JSON_SCHEMA})
    return response.content
}

export default analyzeImages;