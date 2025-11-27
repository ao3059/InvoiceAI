// Resend email integration for sending transactional emails
import { Resend } from 'resend';

let connectionSettings: any;

// Check if we're on Replit
const isReplit = !!(process.env.REPL_ID || process.env.REPLIT_CONNECTORS_HOSTNAME);

async function getReplitCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken || !hostname) {
    throw new Error('Replit credentials not available');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected via Replit');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

async function getDirectCredentials() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'InvoiceAI <noreply@invoiceai.com>';
  
  if (!apiKey) {
    return null;
  }
  
  return { apiKey, fromEmail };
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
export async function getResendClient(): Promise<{ client: Resend; fromEmail: string } | null> {
  // Try Replit connector first if on Replit
  if (isReplit) {
    try {
      const { apiKey, fromEmail } = await getReplitCredentials();
      return { client: new Resend(apiKey), fromEmail };
    } catch (e) {
      console.log('Replit connector not available, trying direct API key');
    }
  }
  
  // Fall back to direct API key
  const credentials = await getDirectCredentials();
  if (credentials) {
    return { client: new Resend(credentials.apiKey), fromEmail: credentials.fromEmail };
  }
  
  // No email service configured
  return null;
}

export interface InvoiceEmailData {
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  subtotal?: string | null;
  tax?: string | null;
  total: string;
  currency: string;
  dueDate?: string | null;
  issuedDate?: string | null;
  items: Array<{
    description: string;
    quantity: string;
    unitPrice: string;
    total: string;
  }>;
  company?: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
    taxNumber?: string | null;
    logoUrl?: string | null;
  } | null;
  notes?: string | null;
}

export async function sendInvoiceEmail(data: InvoiceEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resendClient = await getResendClient();
    
    if (!resendClient) {
      return { 
        success: false, 
        error: 'Email service not configured. Please set up Resend integration or add RESEND_API_KEY environment variable.' 
      };
    }
    
    const { client, fromEmail } = resendClient;
    
    const company = data.company;
    const companyName = company?.name || 'Your Company';
    const currencySymbol = data.currency === 'GBP' ? '£' : data.currency === 'EUR' ? '€' : data.currency === 'USD' ? '$' : data.currency;
    
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${currencySymbol}${item.unitPrice}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${currencySymbol}${item.total}</td>
      </tr>
    `).join('');

    const companyAddressParts = [
      company?.address,
      company?.city,
      company?.state,
      company?.postalCode,
      company?.country
    ].filter(Boolean);
    
    const companyDetailsHtml = company ? `
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        ${company.logoUrl ? `<img src="${company.logoUrl}" alt="${companyName}" style="max-height: 60px; max-width: 200px; margin-bottom: 15px;" />` : ''}
        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #1f2937;">${companyName}</h3>
        ${companyAddressParts.length > 0 ? `<p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">${companyAddressParts.join(', ')}</p>` : ''}
        ${company.email ? `<p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">Email: ${company.email}</p>` : ''}
        ${company.phone ? `<p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">Phone: ${company.phone}</p>` : ''}
        ${company.taxNumber ? `<p style="margin: 0; color: #6b7280; font-size: 14px;">Tax/VAT: ${company.taxNumber}</p>` : ''}
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Invoice ${data.invoiceNumber}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">From ${companyName}</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            ${companyDetailsHtml}
            
            <p style="margin: 0 0 20px 0;">Dear ${data.clientName},</p>
            <p style="margin: 0 0 20px 0;">Please find your invoice details below:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Description</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                ${data.subtotal && parseFloat(data.subtotal) !== parseFloat(data.total) ? `
                <tr>
                  <td colspan="3" style="padding: 8px 12px; text-align: right; color: #6b7280;">Subtotal:</td>
                  <td style="padding: 8px 12px; text-align: right; color: #6b7280;">${currencySymbol}${data.subtotal}</td>
                </tr>
                ` : ''}
                ${data.tax && parseFloat(data.tax) > 0 ? `
                <tr>
                  <td colspan="3" style="padding: 8px 12px; text-align: right; color: #6b7280;">Tax:</td>
                  <td style="padding: 8px 12px; text-align: right; color: #6b7280;">${currencySymbol}${data.tax}</td>
                </tr>
                ` : ''}
                <tr style="background: #f9fafb;">
                  <td colspan="3" style="padding: 12px; text-align: right; font-weight: 600;">Total:</td>
                  <td style="padding: 12px; text-align: right; font-weight: 600; font-size: 18px;">${currencySymbol}${data.total}</td>
                </tr>
              </tfoot>
            </table>
            
            ${data.dueDate ? `<p style="margin: 20px 0; padding: 15px; background: #fef3c7; border-radius: 8px; color: #92400e;"><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>` : ''}
            
            ${data.notes ? `<p style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;"><strong>Notes:</strong> ${data.notes}</p>` : ''}
            
            <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px;">Thank you for your business!</p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">This invoice was generated by InvoiceAI</p>
          </div>
        </body>
      </html>
    `;

    const result = await client.emails.send({
      from: fromEmail,
      to: data.clientEmail,
      subject: `Invoice ${data.invoiceNumber} from ${companyName}`,
      html
    });

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Error sending invoice email:', error);
    return { success: false, error: error.message };
  }
}
