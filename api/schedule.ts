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

    // Combine date and time into ISO strings for Google Calendar
    // Assuming format: date 'YYYY-MM-DD', time 'HH:mm'
    const startDateTime = new Date(`${date}T${time}:00${timezone ? '' : 'Z'}`); // Simplification
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

    // 3. Send SMS via Twilio
    if (twilioSid && twilioToken && twilioPhone) {
      const client = twilio(twilioSid, twilioToken);

      // SMS to Prospect
      try {
        await client.messages.create({
          body: `¡Hola! Tu llamada estratégica está confirmada para el ${date} a las ${time}. Nos comunicaremos a este número. ¡Saludos!`,
          from: twilioPhone,
          to: phone,
        });
      } catch (smsErr) {
        console.error('Error sending SMS to prospect:', smsErr);
      }

      // SMS to Admins (Nay and Fani)
      for (const admin of admins) {
        try {
          await client.messages.create({
            body: `¡NUEVA CITA! Un prospecto ha agendado para el ${date} a las ${time}. Teléfono: ${phone}.`,
            from: twilioPhone,
            to: admin,
          });
        } catch (adminSmsErr) {
          console.error(`Error sending SMS to admin ${admin}:`, adminSmsErr);
        }
      }
    }

    return res.status(200).json({ success: true, message: 'Cita agendada correctamente', link: calendarEventUrl });
  } catch (error: any) {
    console.error('Error in schedule API:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
