import OpenAI from "openai";
import prisma from '../utils/prismaClient';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generationConfig = {
    temperature: 0, // Lower temperature for more deterministic output
    max_tokens: 16383,
    top_p: 1,
    frequency_penalty: 2,
    presence_penalty: 2,
};

export async function extractJobData(html: string) {
    try {
        const prompt = `
    Extract the following information from the job listing as a JSON object. Only output the JSON object with the extracted information and nothing else. If an item is not available, return an empty string for that item:
    {
      "Job Title": "",
      "Company Name": "",
      "Location": "",
      "Job Type": "",
      "Salary Range": "",
      "Job Description": "",
      "Responsibilities": "",
      "Requirements": "",
      "How to Apply": "",
      "Any other relevant information": ""
    }

    Here is the job listing content:
    ${html}
    `;

        const response:any = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: generationConfig.temperature,
            max_tokens: generationConfig.max_tokens,
            top_p: generationConfig.top_p,
            frequency_penalty: generationConfig.frequency_penalty,
            presence_penalty: generationConfig.presence_penalty,
            response_format: {
                "type": "json_object"
            },
        });

        if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
            throw new Error('No valid response from the API');
        }

        const data = response?.choices[0]?.message?.content.trim();
        console.log({ data });

        const extractedData = JSON.parse(data);
        console.log({ extractedData });

        await prisma.job.create({
            data: {
                title: extractedData["Job Title"] || "",
                companyName: extractedData["Company Name"] || "",
                location: extractedData["Location"] || "",
                type: extractedData["Job Type"] || "",
                salaryRange: extractedData["Salary Range"] || "",
                description: extractedData["Job Description"] || "",
                responsibilities: extractedData["Responsibilities"] || "",
                requirements: extractedData["Requirements"] || "",
                applicationLink: extractedData["How to Apply"] || "",
                // Include other relevant fields
            },
        });

        return extractedData;
    } catch (error) {
        console.error('Error extracting data:', error);
        return null;
    }
}
