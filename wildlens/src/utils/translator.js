import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const translateAnimalData = async (animalData) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
You are a highly accurate French-to-English database translator.

Input data (in French):
Name: ${animalData.name}
Species (if any): ${animalData.species || ""}
Habitat: ${animalData.habitat}
Location (if any): ${animalData.location || ""}
Diet: ${animalData.diet}
Estimated Population (if any): ${animalData.estimatedPopulation || ""}
Top Speed (if any): ${animalData.topSpeed || ""}
Characteristics (if any): ${animalData.characteristics ? animalData.characteristics.join(', ') : ""}
Description: ${animalData.description || "Aucune description fournie"}

Translate the French text into English and return ONLY a valid JSON object. 
Do NOT wrap it in markdown code blocks! Output strictly parseable JSON.

Structure required:
{
  "name": { "fr": "${animalData.name.replace(/"/g, '\\"')}", "en": "ENGLISH TRANSLATION" },
  "species": { "fr": "${(animalData.species || "").replace(/"/g, '\\"')}", "en": "ENGLISH TRANSLATION" },
  "habitat": { "fr": "${animalData.habitat.replace(/"/g, '\\"')}", "en": "ENGLISH TRANSLATION" },
  "location": { "fr": "${(animalData.location || "").replace(/"/g, '\\"')}", "en": "ENGLISH TRANSLATION" },
  "diet": { "fr": "${animalData.diet.replace(/"/g, '\\"')}", "en": "ENGLISH TRANSLATION" },
  "estimatedPopulation": { "fr": "${(animalData.estimatedPopulation || "").replace(/"/g, '\\"')}", "en": "ENGLISH TRANSLATION" },
  "topSpeed": { "fr": "${(animalData.topSpeed || "").replace(/"/g, '\\"')}", "en": "ENGLISH TRANSLATION" },
  "characteristics": { 
      "fr": ${JSON.stringify(animalData.characteristics || [])}, 
      "en": ["ENGLISH TL", "ENGLISH TL"] 
  },
  "description": { "fr": "${(animalData.description || "Aucune description fournie").replace(/"/g, '\\"')}", "en": "ENGLISH TRANSLATION" }
}
`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();

        // Fallback cleanup if model wraps output in markdown codeblocks anyway
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '');
        } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/```/g, '');
        }

        return JSON.parse(responseText.trim());
    } catch (error) {
        console.error("Gemini Translation Error for Animal Creation", error);
        // Fallback to storing just the original french strings
        return {
            name: { fr: animalData.name, en: animalData.name },
            species: { fr: animalData.species || "", en: animalData.species || "" },
            habitat: { fr: animalData.habitat, en: animalData.habitat },
            location: { fr: animalData.location || "", en: animalData.location || "" },
            diet: { fr: animalData.diet, en: animalData.diet },
            estimatedPopulation: { fr: animalData.estimatedPopulation || "", en: animalData.estimatedPopulation || "" },
            topSpeed: { fr: animalData.topSpeed || "", en: animalData.topSpeed || "" },
            characteristics: { fr: animalData.characteristics || [], en: animalData.characteristics || [] },
            description: { fr: animalData.description || "", en: animalData.description || "" }
        };
    }
};
