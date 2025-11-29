import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini
// Note: The API key is read from environment variables for security
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "API Key not configured. Please add GEMINI_API_KEY to .env.local" },
                { status: 500 }
            );
        }

        const { text, image, images } = await req.json();

        const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

        // Support both single image (backward compatibility) and multiple images
        const imageList = images || (image ? [image] : []);

        let prompt = `
      你是一个专业的营养师。请分析用户提供的食物信息（文字描述或图片）。
      任务：
      1. 识别图片中的所有食物（如果有多张图片，请分别识别每张图片中的食物）。
      2. 为每个食物估算热量(kcal)、碳水化合物(g)、蛋白质(g)和脂肪(g)。
      3. 如果是无糖饮料、纯水、黑咖啡等，热量和宏量营养素应为0或接近0。
      4. 如果一张图片中有多个食物，请分别识别每个食物。
      
      请严格按照以下 JSON 格式返回结果数组，不要包含 markdown 格式标记：
      [
        {
          "name": "食物名称1",
          "calories": 0,
          "carbs": 0,
          "protein": 0,
          "fat": 0
        },
        {
          "name": "食物名称2",
          "calories": 0,
          "carbs": 0,
          "protein": 0,
          "fat": 0
        }
      ]
    `;

        if (text) {
            prompt += `\n用户文字描述: ${text}`;
        }

        const parts: any[] = [prompt];

        // Add all images to the parts array
        for (const img of imageList) {
            // Image is expected to be a base64 string (data:image/jpeg;base64,...)
            // We need to strip the prefix for Gemini
            const base64Data = img.split(",")[1];
            const mimeType = img.split(";")[0].split(":")[1];

            parts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                },
            });
        }

        const result = await model.generateContent(parts);
        const response = result.response;
        const textResponse = response.text();

        console.log("Gemini Raw Response:", textResponse);

        // Clean up markdown code blocks if present (Gemini sometimes returns ```json ... ```)
        const jsonStr = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();

        let data;
        try {
            data = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Response Text:", jsonStr);

            // Try to extract JSON array from the response
            const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                data = JSON.parse(jsonMatch[0]);
            } else {
                // Fallback: try to extract single object and wrap in array
                const singleMatch = jsonStr.match(/\{[\s\S]*\}/);
                if (singleMatch) {
                    data = [JSON.parse(singleMatch[0])];
                } else {
                    return NextResponse.json(
                        { error: "AI 返回的数据格式不正确，无法解析。请稍后重试。" },
                        { status: 500 }
                    );
                }
            }
        }

        // Ensure data is an array
        if (!Array.isArray(data)) {
            data = [data];
        }

        // Validate response structure
        const validData = data.filter((item: any) => 
            item.name && 
            typeof item.carbs === 'number' && 
            typeof item.protein === 'number' && 
            typeof item.fat === 'number' && 
            typeof item.calories === 'number'
        );

        if (validData.length === 0) {
            console.error("Invalid data structure:", data);
            return NextResponse.json(
                { error: "AI 返回的数据不完整，请重新尝试。" },
                { status: 500 }
            );
        }

        // Return array for multiple foods, or single object for backward compatibility
        return NextResponse.json(validData);
    } catch (error: any) {
        console.error("Gemini Analysis Error:", error);
        console.error("Error details:", error.message, error.stack);

        return NextResponse.json(
            { error: `识别失败: ${error.message || "未知错误，请检查 API Key 是否有效"}` },
            { status: 500 }
        );
    }
}
