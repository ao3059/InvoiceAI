import OpenAI from "openai";
import { aiInvoiceResponseSchema, type AIInvoiceResponse } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateInvoiceFromDescription(
  description: string,
  clientName?: string,
  clientEmail?: string,
): Promise<AIInvoiceResponse> {
  const systemPrompt = `You are an invoice-generation AI model. Extract structured invoice details from natural language descriptions. 
Output ONLY valid JSON matching this structure:
{
  "client": { "name": "string", "email": "string (optional)", "address": "string (optional)" },
  "items": [{ "description": "string", "quantity": number, "price": number }],
  "currency": "GBP",
  "notes": "string (optional)",
  "due_date": "YYYY-MM-DD (optional)"
}

Extract line items with descriptions, quantities, and prices. Calculate totals accurately. If currency is mentioned, use it; otherwise default to GBP.`;

  const userPrompt = `Generate an invoice from this description:

Description: ${description}${clientName ? `\nClient Name: ${clientName}` : ''}${clientEmail ? `\nClient Email: ${clientEmail}` : ''}

Output the invoice data as JSON.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(content);
  const validated = aiInvoiceResponseSchema.parse(parsed);
  
  return validated;
}
