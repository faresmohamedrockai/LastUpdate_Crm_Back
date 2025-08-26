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

    // ✅ هنا نجيب بيانات الـ lead من السيرفس
    const lead = await this.leadsService.getLeads(id, email, role);
    const leadData = JSON.stringify(lead); // أو اختار أهم الداتا فقط

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

      // ✅ نحاول نلقط JSON لو موجود
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
    const dataString = JSON.stringify(leads.leads);
    //   console.log(dataString);
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

    const dataString = JSON.stringify(core);
    const notesString = JSON.stringify(notes);
    const callsString = JSON.stringify(calls);
    const meetingsString = JSON.stringify(meetings);
    const visitsString = JSON.stringify(visists);

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






}
