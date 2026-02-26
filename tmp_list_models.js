import { GoogleGenAI } from "@google/genai";

const API_KEY = "AIzaSyCzYnX6ui-kBjEHryX3-Tdogr-wOBUW_pU";
const genAI = new GoogleGenAI(API_KEY);

async function listModels() {
    try {
        const result = await genAI.listModels();
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error details:", error);
    }
}

listModels();
