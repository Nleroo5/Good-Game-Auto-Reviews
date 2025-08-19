const twilio = require('twilio');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { phone, action } = req.body;

        // Environment variables (set in Vercel dashboard)
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
        const googleReviewUrl = process.env.GOOGLE_REVIEW_URL;

        if (!accountSid || !authToken || !twilioNumber || !googleReviewUrl) {
            return res.status(500).json({ 
                error: 'Missing environment variables. Please configure Twilio credentials in Vercel dashboard.' 
            });
        }

        const message = `Hi! Thanks for choosing Good Game Baseball! If you had a great experience with us today, we'd love if you could leave us a quick Google review. It really helps other families find us! 🙏 ${googleReviewUrl}`;

        // Preview mode - just return the message
        if (action === 'preview') {
            return res.status(200).json({ message });
        }

        // Send mode - actually send the SMS
        if (action === 'send') {
            if (!phone) {
                return res.status(400).json({ error: 'Phone number is required' });
            }

            const client = twilio(accountSid, authToken);

            const result = await client.messages.create({
                body: message,
                from: twilioNumber,
                to: phone
            });

            return res.status(200).json({ 
                success: true, 
                messageSid: result.sid,
                message: 'SMS sent successfully'
            });
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error) {
        console.error('SMS Error:', error);
        return res.status(500).json({ 
            error: error.message || 'Failed to send SMS'
        });
    }
}
