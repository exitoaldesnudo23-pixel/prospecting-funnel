import { google } from 'googleapis';
import twilio from 'twilio';

// Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date, time, phone, timezone } = req.body;

  if (!date || !time || !phone) {
    return res.status(400).json({ error: 'Faltan datos requeridos.' });
  }

  try {
    // 1. Initialize Twilio (Requires env variables)
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    const admins = ['+18479429460', '+18479979255']; // Fani and Nay

    if (!twilioSid || !twilioToken || !twilioPhone) {
      console.error('Twilio credentials missing in environment variables.');
      // Proceed without failing if we are in local testing, or fail if in prod.
      // For now, let's just log it if they aren't set, so the app doesn't crash during development
    }

    // Helper to convert "5:00 PM" to "17:00"
    function convertTimeTo24Hour(time12h: string): string {
      const parts = time12h.split(' ');
      let time = parts[0];
      let modifier = parts[1] || 'PM'; // default to PM if missing
      
      let [hours, minutes] = time.split(':');
      if (!minutes) minutes = '00';
      if (hours === '12') hours = '00';
      if (modifier.toUpperCase() === 'PM') hours = (parseInt(hours, 10) + 12).toString();
      
      return `${hours.padStart(2, '0')}:${minutes}`;
    }

    // Combine date and time into ISO strings for Google Calendar
    // Assuming format: date 'YYYY-MM-DD', time 'HH:mm'
    const time24 = convertTimeTo24Hour(time);
    const startDateTime = new Date(`${date}T${time24}:00${timezone ? '' : 'Z'}`); // Simplification
    // Add 1 hour for end time
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    // 2. Initialize Google Calendar (Requires Service Account JSON via env)
    const googleCredentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
    let calendarEventUrl = '';

    if (googleCredentialsBase64) {
      try {
        const credentials = JSON.parse(Buffer.from(googleCredentialsBase64, 'base64').toString('utf-8'));
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/calendar.events'],
        });
        
        const calendar = google.calendar({ version: 'v3', auth });
        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

        const event = {
          summary: 'Llamada Estratégica - Embudo',
          description: `Cita agendada vía web.\nTeléfono del prospecto: ${phone}`,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: timezone || 'America/Mexico_City',
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: timezone || 'America/Mexico_City',
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 10 },
            ],
          },
        };

        const response = await calendar.events.insert({
          calendarId: calendarId,
          requestBody: event,
        });

        calendarEventUrl = response.data.htmlLink || '';
        console.log('Event created:', calendarEventUrl);
      } catch (calErr) {
        console.error('Error creating Google Calendar event:', calErr);
        // We might not want to block SMS if calendar fails, so we just log
      }
    } else {
      console.log('No Google credentials found. Skipping calendar insertion.');
    }

    // 3. Send SMS/WhatsApp via Twilio
    if (twilioSid && twilioToken && twilioPhone) {
      const client = twilio(twilioSid, twilioToken);
      const fromWhatsApp = twilioPhone.startsWith('whatsapp:') ? twilioPhone : `whatsapp:${twilioPhone}`;

      // WhatsApp to Prospect
      try {
        const toProspect = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone.startsWith('+') ? phone : '+' + phone}`;
        await client.messages.create({
          body: `¡Hola! Tu llamada estratégica está confirmada para el ${date} a las ${time}. Nos comunicaremos a este número. ¡Saludos!`,
          from: fromWhatsApp,
          to: toProspect,
        });
      } catch (smsErr) {
        console.error('Error sending WhatsApp to prospect:', smsErr);
      }

      // WhatsApp to Admins (Nay and Fani)
      for (const admin of admins) {
        try {
          const toAdmin = admin.startsWith('whatsapp:') ? admin : `whatsapp:${admin}`;
          await client.messages.create({
            body: `¡NUEVA CITA! Un prospecto ha agendado para el ${date} a las ${time}. Teléfono: ${phone}.`,
            from: fromWhatsApp,
            to: toAdmin,
          });
        } catch (adminSmsErr) {
          console.error(`Error sending WhatsApp to admin ${admin}:`, adminSmsErr);
        }
      }
    }

    return res.status(200).json({ success: true, message: 'Cita agendada correctamente', link: calendarEventUrl });
  } catch (error: any) {
    console.error('Error in schedule API:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
