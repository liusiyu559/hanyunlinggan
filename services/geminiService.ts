
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserInput, GeneratedActivity, Mode, PPTSchema, PPTConfig, PPTOutlineItem, ExerciseConfig, ExerciseSchema, ImageBatchConfig, ImageGenerationItem } from "../types";

// Lazy initialization of the Gemini client
let genAIInstance: GoogleGenAI | null = null;

const getGenAI = (): GoogleGenAI => {
  if (!genAIInstance) {
    // @ts-ignore
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing. Please check your configuration.");
    }
    genAIInstance = new GoogleGenAI({ apiKey });
  }
  return genAIInstance;
};

// Schema for structured JSON output
const activitySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A creative, poetic Chinese title for the activity." },
    rationale: { type: Type.STRING, description: "Brief pedagogical rationale." },
    
    // New Fields
    teachingGoals: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "List of teaching objectives (教学目标)." 
    },
    keyPoints: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "Analysis of key and difficult points (重难点分析)." 
    },
    grammarAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          point: { type: Type.STRING, description: "Grammar point name (e.g. '把'字句)" },
          structure: { type: Type.STRING, description: "Structure/Format (e.g. S + 把 + O + V + result)" },
          usage: { type: Type.STRING, description: "Explanation of usage scenarios" },
          examples: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Example sentences" }
        },
        required: ["point", "structure", "usage", "examples"]
      },
      description: "Detailed analysis of grammar points relevant to the activity."
    },
    
    props: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of materials or props needed."
    },
    steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Step-by-step instructions for the teacher."
    },
    
    // Updated Simulation Fields
    simulationContext: { type: Type.STRING, description: "A content synopsis clarifying the purpose of the dialogue." },
    simulation: { type: Type.STRING, description: "A dialogue script or scenario simulation of the class." },
    
    imagePromptDescription: { type: Type.STRING, description: "A detailed visual description of the simulation scene for image generation." }
  },
  required: ["title", "rationale", "teachingGoals", "keyPoints", "grammarAnalysis", "props", "steps", "simulationContext", "simulation", "imagePromptDescription"],
};

export const generateActivityPlan = async (input: UserInput, mode: Mode): Promise<GeneratedActivity> => {
  const model = "gemini-2.5-flash";
  const ai = getGenAI();
  
  const baseContext = `
    You are an expert Senior Teaching Chinese as a Foreign Language (TCFL) specialist. 
    Your task is to design a high-quality, engaging teaching activity based on the following constraints.
    
    Target Audience: ${input.targetAudience}
    Proficiency Level: ${input.level}
    Native Language (L1): ${input.nativeLanguage}
    Theme: ${input.theme}
    Specific Requirements: ${input.requirements || "None"}
  `;

  let specificInstruction = "";
  if (mode === Mode.RECORD) {
    specificInstruction = `
      The user has a rough idea: "${input.activityIdea}".
      Expand this into a fully professional teaching activity plan.
    `;
  } else {
    specificInstruction = `
      Creatively generate a brand new, highly effective teaching activity idea suitable for this specific group.
    `;
  }

  const prompt = `
    ${baseContext}
    ${specificInstruction}
    
    REQUIREMENTS FOR OUTPUT:
    1. **Teaching Goals**: Clear, measurable objectives.
    2. **Key & Difficult Points**: Analysis of what students might find hard.
    3. **Grammar Analysis**: For EACH grammar point used:
       - Provide the specific Sentence Structure/Format (句型格式).
       - Categorize and explain usage situations (应用情况).
       - Provide concrete Example Sentences (句例).
    4. **Simulation**: 
       - First provide a Context/Synopsis (内容梗概) to clarify the dialogue's purpose.
       - Then provide the Dialogue script.
    5. **Steps & Props**: Detailed and practical.
    
    Ensure the tone is professional, encouraging, and culturally rich.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: activitySchema,
        systemInstruction: "You are a helpful, creative, and professional TCFL consultant. Output MUST be in valid JSON.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text response from Gemini.");
    
    return JSON.parse(text) as GeneratedActivity;

  } catch (error) {
    console.error("Error generating activity plan:", error);
    throw error;
  }
};

export const generateActivityImage = async (imageDescription: string): Promise<string | undefined> => {
  // Using gemini-2.5-flash-image for standard image generation
  const model = "gemini-2.5-flash-image";
  const ai = getGenAI();
  
  const enhancedPrompt = `
    A photorealistic, high-quality image of a Chinese language classroom setting or scenario.
    Style: Realistic, warm lighting, educational context.
    Scene description: ${imageDescription}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: enhancedPrompt,
      config: {
        // No specific config needed for base flash-image, defaults are usually fine.
        // We iterate parts to find the image.
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return undefined;
  } catch (error) {
    console.error("Error generating image:", error);
    // Return undefined so the UI can just show a placeholder or nothing without crashing
    return undefined;
  }
};

// Schema for PPT Outline
const pptOutlineSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    outline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Proposed title for the slide" },
          note: { type: Type.STRING, description: "Brief description of what this slide covers" }
        },
        required: ["title", "note"]
      }
    }
  },
  required: ["outline"]
};

export const generatePPTOutline = async (activity: GeneratedActivity, requirements: string = ""): Promise<PPTOutlineItem[]> => {
  const model = "gemini-2.5-flash";
  const ai = getGenAI();

  const prompt = `
    You are a professional instructional designer. 
    Create a PowerPoint outline (list of slides) for this activity:
    
    Title: ${activity.title}
    Theme: ${activity.theme}
    Level: ${activity.level}
    
    User Needs: ${requirements}
    
    The outline should be logical: Title Slide -> Introduction/Warmup -> Core Content -> Activity -> Summary.
    Keep it between 5-10 slides.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: pptOutlineSchema,
        systemInstruction: "Create a structured PPT outline.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text response for PPT Outline.");
    
    const res = JSON.parse(text) as { outline: PPTOutlineItem[] };
    return res.outline;
  } catch (error) {
    console.error("Error generating PPT outline:", error);
    throw error;
  }
};

// Schema for PPT Generation
const pptSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Slide headline/title" },
          bulletPoints: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Key content points for the slide"
          },
          speakerNotes: { type: Type.STRING, description: "Detailed notes for the teacher to say" }
        },
        required: ["title", "bulletPoints", "speakerNotes"]
      }
    }
  },
  required: ["slides"]
};

export const generatePPTSchema = async (activity: GeneratedActivity, pptConfig: PPTConfig): Promise<PPTSchema> => {
  const model = "gemini-2.5-flash";
  const ai = getGenAI();

  // Construct a description of the outline
  const outlineDesc = pptConfig.outline.map((item, idx) => `Slide ${idx+1}: ${item.title} (${item.note})`).join('\n');

  const prompt = `
    You are a professional instructional designer creating a PowerPoint presentation for a Chinese language class.
    
    Activity Details:
    Title: ${activity.title}
    Theme: ${activity.theme}
    Level: ${activity.level}
    Props: ${activity.props.join(', ')}
    Steps: ${activity.steps.join('; ')}
    Simulation: ${activity.simulation}

    Constraint: You MUST follow this specific outline structure provided by the user:
    ${outlineDesc}

    Generate the actual content (Bullet Points in Chinese/Target Language) and Speaker Notes for each slide defined in the outline.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: pptSchema,
        systemInstruction: "You are an expert PPT creator. Create clear, structured slides following the exact outline provided.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text response for PPT.");

    return JSON.parse(text) as PPTSchema;
  } catch (error) {
    console.error("Error generating PPT schema:", error);
    throw error;
  }
};

// --- EXERCISE GENERATION ---

const exerciseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the worksheet" },
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "One of MULTIPLE_CHOICE, FILL_IN_BLANK, MATCHING, TRANSLATION, OPEN_ENDED" },
          question: { type: Type.STRING, description: "The question text" },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Options for multiple choice (A, B, C, D)" },
          answer: { type: Type.STRING, description: "The correct answer" }
        },
        required: ["type", "question", "answer"]
      }
    }
  },
  required: ["title", "exercises"]
};

export const generateExercises = async (activity: GeneratedActivity, config: ExerciseConfig): Promise<ExerciseSchema> => {
  const model = "gemini-2.5-flash";
  const ai = getGenAI();

  const requestedTypes = config.types.join(", ");
  
  const prompt = `
    You are a professional Chinese language teacher.
    Based on the following activity plan, identifying the key vocabulary, grammar points, and cultural concepts covered.
    
    Activity Title: ${activity.title}
    Theme: ${activity.theme}
    Level: ${activity.level}
    Content context: ${activity.simulation} and steps: ${activity.steps.join(' ')}
    
    Task: Create a practice worksheet.
    
    Requirements:
    1. Generate ${config.count} questions PER selected type.
    2. The selected types are: ${requestedTypes}.
    3. Ensure the difficulty matches the level: ${activity.level}.
    4. For 'MULTIPLE_CHOICE', provide 3-4 options array.
    5. For 'MATCHING', provide pairs formatted clearly in the question or split them.
    6. Provide a correct answer for every question.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: exerciseSchema,
        systemInstruction: "You are an expert assessment creator. Generate high-quality, level-appropriate Chinese exercises.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text response for Exercises.");

    return JSON.parse(text) as ExerciseSchema;
  } catch (error) {
    console.error("Error generating exercises:", error);
    throw error;
  }
};

// --- BATCH IMAGE PROMPTS GENERATION ---

const batchPromptsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    scenarios: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Detailed visual description for image generation" },
          dialogue: { type: Type.STRING, description: "A short Q&A practice dialogue" }
        },
        required: ["description", "dialogue"]
      }
    }
  },
  required: ["scenarios"]
};

export const generateImageBatchPrompts = async (activity: GeneratedActivity, config: ImageBatchConfig): Promise<{ description: string, dialogue: string }[]> => {
  const model = "gemini-2.5-flash";
  const ai = getGenAI();

  const prompt = `
    You are a creative teaching material designer.
    
    Context:
    Teaching Theme: ${activity.theme}
    Proficiency Level: ${activity.level}
    
    Task:
    Create ${config.count} distinct scenarios to practice the following teaching focus:
    "${config.focusPoint}"
    
    For each scenario, provide:
    1. A detailed visual description (in English) suitable for generating a clear, photorealistic image.
    2. A short dialogue (in Chinese) that teachers and students would use with this image to practice the focus point.
    
    Example input: Focus point "Why/Because (为什么/因为)", Count 2
    Example output item 1: 
      Description: "A boy sitting on a bench holding his knee and crying, there is a fallen bicycle next to him." 
      Dialogue: "A: 他为什么哭？ B: 因为他从自行车上摔下来了。"
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: batchPromptsSchema,
        systemInstruction: "Generate distinct practice scenarios.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text response for Image Batch Prompts.");

    const res = JSON.parse(text) as { scenarios: { description: string, dialogue: string }[] };
    return res.scenarios;
  } catch (error) {
    console.error("Error generating image prompts:", error);
    throw error;
  }
};
