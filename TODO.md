# Online Deployment Plan

## User ke Kaam (Manual Steps):
1. **Vercel Account Setup:**
   - Go to https://vercel.com/
   - Sign up/login with GitHub
   - Connect your GitHub repo: https://github.com/paritoshsen01/Transport

2. **Deploy on Vercel:**
   - Import the GitHub repo
   - Vercel automatically detect Node.js project
   - Deploy karo
   - Deployed URL mil jayega, e.g., https://transport-xyz.vercel.app

3. **Firebase Ensure Karo:**
   - serviceAccountKey.json file Vercel pe upload karo (Environment Variables me)
   - Firebase project ready hai

4. **URLs Update Karo:**
   - Saare files me 'https://your-vercel-app.vercel.app' ko actual deployed URL se replace karo

## Code Changes (Main ne kiye):
- [x] vercel.json ready hai
- [x] server.js Firebase use kar raha hai
- [x] Frontend URLs ko placeholder se update kiya

## Testing:
1. Deploy ke baad test karo sab features
2. Bus registration, login, admin panel check karo
3. File uploads Firebase pe ho rahe hain ya nahi
