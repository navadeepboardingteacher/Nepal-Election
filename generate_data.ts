import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function generateRealData() {
  const prompt = `Generate a comprehensive JSON list of all 7 provinces of Nepal, their 77 districts, and for each district, provide 2 realistic candidates for the 2082 BS elections. 
  Include:
  - Province Name
  - District Name
  - Candidate Name (Realistic Nepali names)
  - Party (NC, UML, Maoist Center, RSP, RPP, JSP, LSP, etc.)
  - Votes (Realistic numbers between 5000 and 45000)
  - Image URL (Use https://picsum.photos/seed/{name}/200/200)
  - is_leading (boolean)
  
  Format as:
  {
    "provinces": [
      {
        "name": "...",
        "districts": [
          {
            "name": "...",
            "candidates": [
              { "name": "...", "party": "...", "votes": 123, "image_url": "...", "is_leading": true },
              ...
            ]
          },
          ...
        ]
      },
      ...
    ]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    if (response.text) {
      fs.writeFileSync("nepal_election_data.json", response.text);
      console.log("Data generated successfully.");
    }
  } catch (error) {
    console.error("Error generating data:", error);
  }
}

generateRealData();
