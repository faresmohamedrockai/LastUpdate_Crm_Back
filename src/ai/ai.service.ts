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

  
  const essentialData = userLeads.map(lead => ({
    id: lead.id,
    nameAr: lead.nameAr,
    nameEn: lead.nameEn,
    status: lead.status,
    createdAt: lead.createdAt,
    source: lead.source,
    budget: lead.budget,
    firstConnection: lead.firstConection, // تصحيح الإملاء إن أمكن
    interest: lead.interest,
    tier: lead.tier,
    gender: lead.gender,
    
    // إحصائيات مبسطة بدلاً من البيانات الكاملة
    callsCount: lead.calls?.length || 0,
    visitsCount: lead.visits?.length || 0,
    meetingsCount: lead.meetings?.length || 0,
    notesCount: lead.notes?.length || 0,
    transfersCount: lead.transfers?.length || 0,
    
    // آخر نشاط فقط
    lastCallOutcome: lead.calls?.length > 0 ? lead.calls[lead.calls.length - 1]?.outcome : null,
    lastMeetingStatus: lead.meetings?.length > 0 ? lead.meetings[lead.meetings.length - 1]?.status : null,
    
    // معلومات الاهتمام المبسطة
    hasInventoryInterest: !!lead.inventoryInterestId,
    hasProjectInterest: !!lead.projectInterestId,
    
    // معلومات المالك
    ownerId: lead.ownerId,
    ownerRole: lead.owner?.role
  }));

  const dataString = JSON.stringify(essentialData, this.jsonReplacer);

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

Analyze the leads data provided below for this user.
Focus on these key performance indicators:
- Lead conversion patterns by status
- Lead source effectiveness  
- Activity levels (calls, meetings, visits)
- Lead quality indicators (tier, budget, interest level)
- Follow-up consistency

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

--- ESSENTIAL LEADS DATA ---
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



// async getUserTip(userId: string, email: string, role: Role) {
//   const { leads: userLeads } = await this.leadsService.getLeads(userId, email, role);

//   if (!userLeads || userLeads.length === 0) return {
//     title: "No Leads Data",
//     advices: [
//       {
//         en_tip: "No leads data available to generate a tip.",
//         ar_tip: "لا توجد بيانات للعملاء المحتملين لإنشاء نصيحة."
//       }
//     ]
//   };

//   // إذا كان العدد كبير جداً، نحلل إحصائياً بدلاً من إرسال البيانات الخام
//   const MAX_LEADS_FOR_DETAILED_ANALYSIS = 100;
  
//   let analysisData: string;
  
//   if (userLeads.length > MAX_LEADS_FOR_DETAILED_ANALYSIS) {
//     // تحليل إحصائي للأعداد الكبيرة
//     analysisData = JSON.stringify(this.generateStatisticalSummary(userLeads), this.jsonReplacer);
//   } else {
//     // تحليل تفصيلي للأعداد الصغيرة
//     const essentialData = userLeads.map(lead => ({
//       id: lead.id,
//       status: lead.status,
//       createdAt: lead.createdAt,
//       source: lead.source,
//       budget: lead.budget,
//       interest: lead.interest,
//       tier: lead.tier,
//       callsCount: lead.calls?.length || 0,
//       visitsCount: lead.visits?.length || 0,
//       meetingsCount: lead.meetings?.length || 0,
//       lastCallOutcome: lead.calls?.length > 0 ? lead.calls[lead.calls.length - 1]?.outcome : null,
//       lastMeetingStatus: lead.meetings?.length > 0 ? lead.meetings[lead.meetings.length - 1]?.status : null,
//       hasInventoryInterest: !!lead.inventoryInterestId,
//       hasProjectInterest: !!lead.projectInterestId,
//     }));
    
//     analysisData = JSON.stringify(essentialData, this.jsonReplacer);
//   }

//   const prompt = this.buildPrompt(role, email, analysisData, userLeads.length > MAX_LEADS_FOR_DETAILED_ANALYSIS);

//   try {
//     const result = await this.model.generateContent(prompt);
//     const response = await result.response;
//     const text = await response.text();

//     return this.parseResponse(text);
//   } catch (err) {
//     this.logger.error('Error generating user tip', err);
//     return this.getErrorResponse();
//   }
// }

// private generateStatisticalSummary(leads: any[]) {
//   const now = new Date();
//   const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

//   return {
//     totalLeads: leads.length,
    
//     // توزيع الحالات
//     statusDistribution: this.groupAndCount(leads, 'status'),
    
//     // توزيع المصادر
//     sourceDistribution: this.groupAndCount(leads, 'source'),
    
//     // توزيع مستويات الاهتمام
//     interestDistribution: this.groupAndCount(leads, 'interest'),
    
//     // توزيع المستويات
//     tierDistribution: this.groupAndCount(leads, 'tier'),
    
//     // إحصائيات النشاط
//     activityStats: {
//       totalCalls: leads.reduce((sum, lead) => sum + (lead.calls?.length || 0), 0),
//       totalMeetings: leads.reduce((sum, lead) => sum + (lead.meetings?.length || 0), 0),
//       totalVisits: leads.reduce((sum, lead) => sum + (lead.visits?.length || 0), 0),
      
//       avgCallsPerLead: this.calculateAverage(leads.map(lead => lead.calls?.length || 0)),
//       avgMeetingsPerLead: this.calculateAverage(leads.map(lead => lead.meetings?.length || 0)),
//       avgVisitsPerLead: this.calculateAverage(leads.map(lead => lead.visits?.length || 0)),
//     },
    
//     // إحصائيات الميزانية
//     budgetStats: {
//       totalBudget: leads.reduce((sum, lead) => sum + (parseInt(lead.budget) || 0), 0),
//       avgBudget: this.calculateAverage(leads.map(lead => parseInt(lead.budget) || 0)),
//       budgetRanges: this.getBudgetRanges(leads),
//     },
    
//     // إحصائيات زمنية
//     timeStats: {
//       leadsLast30Days: leads.filter(lead => 
//         new Date(lead.createdAt) >= thirtyDaysAgo
//       ).length,
      
//       conversionRate: this.calculateConversionRate(leads),
//       avgTimeToConversion: this.calculateAvgTimeToConversion(leads),
//     },
    
//     // أنماط الأداء
//     performancePatterns: {
//       mostSuccessfulSources: this.getMostSuccessfulSources(leads),
//       bestConvertingTiers: this.getBestConvertingTiers(leads),
//       commonFailurePoints: this.getCommonFailurePoints(leads),
//     }
//   };
// }

// private groupAndCount(array: any[], key: string) {
//   const grouped = array.reduce((acc, item) => {
//     const value = item[key] || 'unknown';
//     acc[value] = (acc[value] || 0) + 1;
//     return acc;
//   }, {});
  
//   return Object.entries(grouped)
//     .sort(([,a], [,b]) => (b as number) - (a as number))
//     .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
// }

// private calculateAverage(numbers: number[]): number {
//   if (numbers.length === 0) return 0;
//   return Math.round((numbers.reduce((sum, n) => sum + n, 0) / numbers.length) * 100) / 100;
// }

// private getBudgetRanges(leads: any[]) {
//   const ranges = {
//     'under_1M': 0,
//     '1M_10M': 0,
//     '10M_50M': 0,
//     '50M_100M': 0,
//     'over_100M': 0,
//     'unspecified': 0
//   };
  
//   leads.forEach(lead => {
//     const budget = parseInt(lead.budget) || 0;
//     if (budget === 0) ranges.unspecified++;
//     else if (budget < 1000000) ranges.under_1M++;
//     else if (budget < 10000000) ranges['1M_10M']++;
//     else if (budget < 50000000) ranges['10M_50M']++;
//     else if (budget < 100000000) ranges['50M_100M']++;
//     else ranges.over_100M++;
//   });
  
//   return ranges;
// }

// private calculateConversionRate(leads: any[]): number {
//   const totalLeads = leads.length;
//   const convertedLeads = leads.filter(lead => 
//     lead.status === 'closed_deal' || lead.status === 'reservation'
//   ).length;
  
//   return totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 10000) / 100 : 0;
// }

// private calculateAvgTimeToConversion(leads: any[]): number {
//   const convertedLeads = leads.filter(lead => 
//     lead.status === 'closed_deal' || lead.status === 'reservation'
//   );
  
//   if (convertedLeads.length === 0) return 0;
  
//   const times = convertedLeads.map(lead => {
//     const created = new Date(lead.createdAt);
//     const firstConnection = new Date(lead.firstConection);
//     return Math.abs(created.getTime() - firstConnection.getTime()) / (1000 * 60 * 60 * 24);
//   });
  
//   return this.calculateAverage(times);
// }

// private getMostSuccessfulSources(leads: any[]) {
//   const sourceSuccess = {};
  
//   leads.forEach(lead => {
//     const source = lead.source || 'unknown';
//     if (!sourceSuccess[source]) {
//       sourceSuccess[source] = { total: 0, converted: 0 };
//     }
//     sourceSuccess[source].total++;
//     if (lead.status === 'closed_deal' || lead.status === 'reservation') {
//       sourceSuccess[source].converted++;
//     }
//   });
  
//   return Object.entries(sourceSuccess)
//     .map(([source, stats]: [string, any]) => ({
//       source,
//       conversionRate: stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0,
//       total: stats.total
//     }))
//     .sort((a, b) => b.conversionRate - a.conversionRate)
//     .slice(0, 5);
// }

// private getBestConvertingTiers(leads: any[]) {
//   return this.getMostSuccessfulSources(leads.map(lead => ({ ...lead, source: lead.tier })));
// }

// private getCommonFailurePoints(leads: any[]) {
//   const failedLeads = leads.filter(lead => 
//     lead.status === 'not_interested_now' || lead.status === 'lost'
//   );
  
//   return {
//     totalFailed: failedLeads.length,
//     failureRate: leads.length > 0 ? Math.round((failedLeads.length / leads.length) * 100) : 0,
//     commonReasons: this.groupAndCount(failedLeads, 'status'),
//     failedSources: this.groupAndCount(failedLeads, 'source')
//   };
// }

// private buildPrompt(role: string, email: string, analysisData: string, isStatistical: boolean): string {
//   const analysisType = isStatistical ? 'statistical summary' : 'detailed lead data';
//   const analysisInstruction = isStatistical 
//     ? 'Focus on patterns, trends, and statistical insights from the summary data.'
//     : 'Analyze individual lead patterns and behaviors.';

//   return `
// You are a world-class Sales Director and Performance Coach. Your tone is professional, direct, and highly motivational.

// User Role: ${role}
// User Email: ${email}

// You are analyzing ${analysisType} for this user.
// ${analysisInstruction}

// Based on your analysis, provide a concise, motivational title and 3 actionable performance improvement tips.

// IMPORTANT: Your response must be a single, valid JSON object in BOTH English and Arabic.

// --- RESPONSE FORMAT ---
// {
//   "title": "A concise, motivational title in English",
//   "advices": [
//     {
//       "ar_tip": "النصيحة الأولى باللغة العربية",
//       "en_tip": "The first tip in English"
//     },
//     {
//       "ar_tip": "النصيحة الثانية باللغة العربية", 
//       "en_tip": "The second tip in English"
//     },
//     {
//       "ar_tip": "النصيحة الثالثة باللغة العربية",
//       "en_tip": "The third tip in English"
//     }
//   ]
// }

// --- ANALYSIS DATA ---
// ${analysisData}
// ---
// `;
// }

// private parseResponse(text: string) {
//   const jsonMatch = text.match(/\{[\s\S]*\}/);
//   if (!jsonMatch) {
//     return this.getErrorResponse();
//   }

//   try {
//     const parsed = JSON.parse(jsonMatch[0]);
//     if (parsed.title && Array.isArray(parsed.advices)) {
//       return parsed;
//     }
//     throw new Error("Invalid JSON structure received from AI.");
//   } catch {
//     return this.getErrorResponse();
//   }
// }

// private getErrorResponse() {
//   return {
//     title: "Error",
//     advices: [{
//       en_tip: "Error generating tip.",
//       ar_tip: "خطأ أثناء إنشاء النصيحة."
//     }]
//   };
// }




}