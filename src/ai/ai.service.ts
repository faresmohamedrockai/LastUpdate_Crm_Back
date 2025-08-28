import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Role } from 'src/auth/roles.enum';
// import * as leadsData from '../data/leads.json';
import { LeadsService } from '../leads/leads.service'

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model;
  private insightsCache = new Map();
  private lastDataHash: string | null = null;
  private lastGeneratedTip = new Map();

  constructor(
    private config: ConfigService,
    private leadsService: LeadsService

  ) {
    this.genAI = new GoogleGenerativeAI(this.config.get<string>('GEMINI_API_KEY')!);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
  }

  // FIX: Added a replacer function to handle BigInt serialization.
  private jsonReplacer(key, value) {
    return typeof value === 'bigint' ? value.toString() : value;
  }

  async getOrGenerateGeneralTip(
    lang = 'en',
    id: string,
    email: string,
    role: string
  ) {
    const cacheKey = `general-tip-${lang}-${id}`;
    if (this.insightsCache.has(cacheKey) && Math.random() < 0.8) {
      this.logger.log(`CACHE HIT general tip: ${lang} for lead ${id}`);
      return this.insightsCache.get(cacheKey);
    }

    const languageInstruction =
      lang === 'ar'
        ? 'الأهم: ردك بالكامل باللهجة المصرية. رجّع الرد فقط بصيغة JSON بالشكل {"tip": "نص النصيحة"}'
        : 'IMPORTANT: Respond ONLY in valid JSON format like {"tip": "your tip here"}';

    const lead = await this.leadsService.getLeads(id, email, role);
    // FIX: Used the replacer function in JSON.stringify.
    const leadData = JSON.stringify(lead, this.jsonReplacer);

    const prompt = `
  You are a Sales Mentor.
  The following is lead information: ${JSON.stringify(leadData, null, 2)}
  Based on this specific lead ,
  give one personalized sales tip that helps the sales rep engage better.
  ${languageInstruction}
`;


    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      let generatedTip;

      try {
        generatedTip = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      } catch (parseErr) {
        this.logger.warn(
          `Invalid JSON from AI, falling back to plain text`,
          text,
        );
        generatedTip = { tip: text };
      }

      this.insightsCache.set(cacheKey, generatedTip);
      return generatedTip;
    } catch (err) {
      this.logger.error('Error generating general tip', err);
      return { error: 'Could not generate tip' };
    }
  }



  async getOrGenerateProactiveTip(lang = 'en', id: string, email: string, role: string) {
    const leads = await this.leadsService.getLeads(id, email, role);
    // FIX: Used the replacer function in JSON.stringify.
    const dataString = JSON.stringify(leads.leads, this.jsonReplacer);

    const languageInstruction =
      lang === 'ar'
        ? 'الأهم: ردك بالكامل باللهجة المصرية. رجّع الرد فقط بصيغة JSON بالشكل {"tip": "نص النصيحة"}'
        : 'IMPORTANT: Respond ONLY in valid JSON format like {"tip": "your tip here"}';

    const currentHash = crypto.createHash('sha256').update(dataString).digest('hex');

    if (currentHash === this.lastDataHash && this.lastGeneratedTip.has(lang)) {
      this.logger.log(`CACHE HIT proactive tip: ${lang}`);
      return this.lastGeneratedTip.get(lang);
    }

    const prompt = `
  You are an elite Sales Coach with deep expertise in real estate sales.
  Your goal is to help sales reps convert leads into clients by analyzing each lead's data 
  and giving **one powerful, personalized coaching tip** for how to best engage with them.

  Consider the following when creating your advice:
  - The lead's budget and financial capability.
  - Their communication style (from notes or history if available).
  - Their decision stage (new lead, follow-up, hot lead, lost, etc.).
  - Cultural and linguistic nuances (adapt tip tone accordingly).
  - Practical actions the sales rep can take immediately to build trust and move forward.

  Respond ONLY in strict JSON format, without extra text:
  {
    "tips": [
      { "name": "lead name", "tip": "personalized sales advice" }
    ]
  }

  Leads Data:
  ${dataString}

  ${languageInstruction}
`;



    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      let tip;

      try {
        tip = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      } catch (parseErr) {
        this.logger.warn(`Invalid JSON from AI, falling back to plain text`, text);
        tip = { tip: text }; // fallback
      }

      this.lastDataHash = currentHash;
      this.lastGeneratedTip.set(lang, tip);
      return tip;
    } catch (err) {
      this.logger.error('Error proactive tip', err);
      return { error: 'Could not generate proactive tip' };
    }
  }



  async getLeadTip(
    userId: string,
    id: string,
    email: string,
    role: string
  ) {
    const user = { id: userId, role: role as Role };
    const leadData = await this.leadsService.getLeadById(id, user);

    const {
      notes = [],
      calls = [],
      meetings = [],
      visists = [],
      ...core
    } = leadData ?? {};

    // FIX: Used the replacer function in all JSON.stringify calls.
    const dataString = JSON.stringify(core, this.jsonReplacer);
    const notesString = JSON.stringify(notes, this.jsonReplacer);
    const callsString = JSON.stringify(calls, this.jsonReplacer);
    const meetingsString = JSON.stringify(meetings, this.jsonReplacer);
    const visitsString = JSON.stringify(visists, this.jsonReplacer);

    // --- Strong Bilingual Prompt with Details ---
    const prompt = `
You are a world-class, bilingual real estate sales coach (English + Egyptian Arabic).
Your advice is sharp, motivational, direct, and specific. No fluff.

Your mission:
- Carefully analyze ALL the lead’s data: 
  * Core info (name, budget by EGP, unit type, location preference, etc.)
  * Notes from sales reps
  * Calls history (objections, interest level, tone)
  * Meetings (attendance, questions asked, buying signals)
  * Visits (projects seen, reactions, preferences)

- Then provide two killer, practical coaching tips:
   1. English ("en_tip") → crisp, confident, secret-weapon coaching
   2. Egyptian Arabic ("ar_tip") → باللهجة المصرية، حماسي، مباشر، وقوي

Guidelines for tips:
- Each tip MUST combine **at least 3 insights** from the data (budget, interests, timing, objections, etc.)
- Make it **action-oriented**: what should the sales rep do next, say, or push for.
- Focus on moving the deal closer to closing (urgency, trust, alignment with budget).
- In English: short but powerful (≤ 3 lines).
- In Arabic: باللهجة المصرية واضحة، فيها أسلوب إقناع وحماس، برضه ≤ 3 سطور.

--- FORMAT (critical) ---
Return a single valid JSON object only:
{
  "en_tip": "Your killer detailed advice in English here",
  "ar_tip": "نصيحتك القاتلة باللهجة المصرية هنا"
}

--- LEAD DATA ---
CORE:
${dataString}

NOTES:
${notesString}

CALLS:
${callsString}

MEETINGS:
${meetingsString}

VISITS:
${visitsString}
`;


    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Robust JSON parsing
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      let tips;

      if (!jsonMatch) {
        this.logger.warn('No JSON object found in AI response', text);
        return { en_tip: text, ar_tip: "Error: Could not parse Arabic tip." };
      }

      try {
        tips = JSON.parse(jsonMatch[0]);
      } catch (parseErr) {
        this.logger.warn('Invalid JSON from AI, falling back to plain text', text);
        return { en_tip: text, ar_tip: "Error: Could not parse Arabic tip." };
      }

      // Ensure both keys are present in the final response
      if (!tips.en_tip || !tips.ar_tip) {
        this.logger.warn('AI response was missing one or more language keys', tips);
        return {
          en_tip: tips.en_tip || "English tip was not generated.",
          ar_tip: tips.ar_tip || "لم يتم إنشاء النصيحة باللغة العربية."
        }
      }

      return tips;

    } catch (err) {
      this.logger.error('Error generating lead tip', err);
      return { error: 'Could not generate lead tip' };
    }
  }

 async getUserTip(userId: string, email: string, role: Role) {
    const { leads: userLeads } = await this.leadsService.getLeads(userId, email, role);

    if (!userLeads || userLeads.length === 0) return {
      title: "No Leads Data",
      advices: [
        {
          en_tip: "No leads data available to generate a tip.",
          ar_tip: "لا توجد بيانات للعملاء المحتملين لإنشاء نصيحة."
        }
      ]
    };

    // دمج كل بيانات الـ leads في JSON واحد
    const dataString = JSON.stringify(
      userLeads.map(lead => {
        const { notes, calls, meetings, visits, ...core } = lead;
        return core;
      }),
      this.jsonReplacer
    );

    const languageInstruction = `
IMPORTANT: Your response must be a single, valid JSON object.
Provide the analysis in BOTH professional English and Egyptian Arabic.
Do NOT wrap the JSON in markdown backticks (\`).
Address the user personally using their role where appropriate.
The JSON object must have a "title" key and an "advices" key containing an array of advice objects.
Each object in the "advices" array must have "ar_tip" and "en_tip" keys.
`;

    const prompt = `
You are a world-class Sales Director and Performance Coach. Your tone is professional, direct, and highly motivational.

User Role: ${role}
User Email: ${email}

Analyze all the leads data provided below for this user.
Based on your analysis, provide a concise, motivational title for the feedback and a list of 3 distinct, actionable performance improvement tips.
For each tip, tell the user clearly where they need to improve and what actionable steps they should take.

${languageInstruction}

--- RESPONSE FORMAT ---
Return a JSON object with EXACTLY the following structure:
{
  "title": "A concise, motivational title in English",
  "advices": [
    {
      "ar_tip": "النصيحة الأولى باللغة العربية",
      "en_tip": "The first tip in English"
    },
    {
      "ar_tip": "النصيحة الثانية باللغة العربية",
      "en_tip": "The second tip in English"
    },
    {
      "ar_tip": "النصيحة الثالثة باللغة العربية",
      "en_tip": "The third tip in English"
    }
  ]
}

--- FILTERED LEADS DATA ---
${dataString}
---
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          title: "Error",
          advices: [{
            en_tip: "Error: Could not parse tip from AI response.",
            ar_tip: "خطأ: لم يتمكن النظام من استخراج النصيحة من استجابة AI."
          }]
        };
      }

      try {
        const parsed = JSON.parse(jsonMatch[0]);
        // Ensure the response has the correct structure before returning
        if (parsed.title && Array.isArray(parsed.advices)) {
          return parsed;
        }
        throw new Error("Invalid JSON structure received from AI.");
      } catch {
        return {
          title: "Error",
          advices: [{
            en_tip: "Error parsing AI response.",
            ar_tip: "خطأ أثناء تحليل استجابة AI."
          }]
        };
      }
    } catch (err) {
      this.logger.error('Error generating user tip', err);
      return {
        title: "Error",
        advices: [{
          en_tip: "Error generating tip.",
          ar_tip: "خطأ أثناء إنشاء النصيحة."
        }]
      };
    }
  }

}