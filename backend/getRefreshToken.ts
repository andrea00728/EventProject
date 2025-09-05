import 'dotenv/config';
import { google } from 'googleapis';
import readline from 'readline';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const scopes = ['https://www.googleapis.com/auth/gmail.send'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

console.log('🔗 Ouvre ce lien dans ton navigateur et autorise l’application :');
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('✏️ Colle ici le code obtenu après autorisation : ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('✅ Voici ton refresh token :', tokens.refresh_token);
    console.log('💾 Copie-le dans ton .env à GOOGLE_REFRESH_TOKEN');
  } catch (err) {
    console.error('❌ Erreur lors de la récupération du refresh token', err);
  }
});
