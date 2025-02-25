import {ChatOpenAI} from "@langchain/openai";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import {JSON_SCHEMA, videoTagAIInstructions} from "../utils/constants";

class AIAnalyzer{
    private readonly model: ChatOpenAI;

    constructor() {
        this.model = new ChatOpenAI({
            model: "gpt-4o-mini",
            maxTokens: 300,
        });
    }

    public async analyzeImages(imageUrls: string[]): Promise<any> {
        const messages = [
            new SystemMessage(videoTagAIInstructions),
            new HumanMessage({
                content: [
                    {
                        type: "text",
                        text: "Analyze this image from a video and provide: 1. A detailed description (2-3 sentences) 2. A list of relevant tags that describe the content",
                    },
                    ...imageUrls.map((url) => {
                        return {
                            type: "image_url",
                            image_url: {url}
                        }
                    })
                ]
            })
        ]

        try {
            const response = await this.model.invoke(messages, {response_format: JSON_SCHEMA})
            return response.content
        }catch (error){
            console.error(`❌ AI analysis failed: ${(error as Error).message}`);
            return null;
        }
    }
}

export default AIAnalyzer;