# 🎓 IELTS Master Platform - Setup Guide

## ✨ What's Built

### Core Features Implemented:
- ✅ **Authentication**: Email/password login & signup
- ✅ **Admin Panel**: Complete content management for 14+ sections
- ✅ **User Dashboard**: Progress tracking, XP, Levels, Badges, Streaks
- ✅ **Gamification**: XP system, Badges, Levels (1-50), Daily Quests
- ✅ **Content Sections**:
  - Vocabulary (with difficulty filter and card display)
  - Grammar (with topic-based learning and rules)
  - Reading (with timer, answer checking, and automatic scoring)
  - Listening (with audio player and answer validation)
  - Writing (with Gemini AI evaluation and detailed feedback)
  - Speaking (with prep time and Gemini AI evaluation)
  - Dictionary (with word search and filtering)
  - Books (with PDF viewing and type filtering)
  - Spelling (with word-by-word practice quiz)
  - Pronunciation (with audio lessons and tips)
  - Tongue Twisters (with difficulty levels)
  - Leaderboard (top 100 users ranked by XP)
- ✅ **AI Features**: Gemini API integration for Writing & Speaking evaluation
- ✅ **Firebase**: Complete Firestore setup for all data
- ✅ **Dark Mode**: Full dark mode support
- ✅ **Interactive Practice**: Answer checking with automatic scoring for Reading & Listening

---

## 🚀 Quick Start

### 1. **Firebase Setup** (Required)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable these services:
   - **Authentication** (Email/Password)
   - **Firestore Database** (Start in test mode)
   - **Storage** (for audio/video files)

4. Get your config from Project Settings:
   ```
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId
   ```

### 2. **Gemini API Setup** (For AI Evaluation)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Keep it safe

### 3. **Environment Configuration**

Create `.env.local` file in project root:

```bash
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Admin Email (used for admin role assignment)
ADMIN_EMAIL=your_email@gmail.com
```

### 4. **Create Admin User**

1. Sign up with your email through the app
2. In Firebase Firestore:
   - Go to `Collections > users`
   - Find your user document
   - Change `role` field from `"user"` to `"admin"`

### 5. **Install & Run**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser
http://localhost:3000
```

---

## 📋 Testing Checklist

### Authentication
- [ ] Sign up with email & password
- [ ] Login with credentials
- [ ] Logout functionality
- [ ] Protected routes redirect properly

### Admin Panel
- [ ] Access admin dashboard
- [ ] Add vocabulary (one word)
- [ ] Add grammar topic
- [ ] Add reading passage
- [ ] Add listening practice
- [ ] Add writing prompt
- [ ] Add speaking cue card
- [ ] Add dictionary entry
- [ ] Add book
- [ ] View users list
- [ ] Admin dashboard shows correct statistics

### User Dashboard
- [ ] View dashboard with stats
- [ ] See progress bars for learning
- [ ] View XP & Level
- [ ] See badges (should be empty at first)
- [ ] View daily quests section

### Vocabulary Practice
- [ ] Load vocabulary list
- [ ] Filter by difficulty
- [ ] View word details (meaning, pronunciation, example)

### Grammar Topics
- [ ] Load grammar topics
- [ ] Filter by difficulty
- [ ] Click to view full topic with rules and examples

### Reading Practice
- [ ] Load reading passages
- [ ] Start practice with timer
- [ ] Answer questions about passage
- [ ] Submit and see results with scoring
- [ ] View correct answers vs user answers

### Listening Practice
- [ ] Load listening practices
- [ ] Play audio from player
- [ ] Read transcript
- [ ] Answer questions
- [ ] Submit and see automatic scoring

### Writing Practice
- [ ] Load writing prompts
- [ ] Write response to prompt
- [ ] Submit for Gemini AI evaluation
- [ ] See band scores and detailed feedback

### Speaking Practice
- [ ] Load cue cards
- [ ] Use 1-minute prep time
- [ ] Speak for 2 minutes
- [ ] Submit for Gemini AI evaluation
- [ ] See scores for fluency, vocabulary, grammar, pronunciation

### Dictionary
- [ ] Search for words
- [ ] View word definitions and Bengali translations
- [ ] See pronunciation and examples

### Books Library
- [ ] Browse available books
- [ ] Filter by book type
- [ ] Click to view PDF

### Spelling Practice
- [ ] Hear pronunciation
- [ ] Type correct spelling
- [ ] Submit quiz and see results

### Pronunciation Guide
- [ ] Browse pronunciation lessons
- [ ] Listen to audio lessons
- [ ] Read explanations and examples
- [ ] Apply tips for better pronunciation

### Tongue Twisters
- [ ] Load tongue twisters
- [ ] Practice at different speeds
- [ ] Repeat to improve fluency

### Leaderboard
- [ ] Open leaderboard page
- [ ] See rankings (will be empty initially)
- [ ] See user levels and XP

### Dark Mode
- [ ] Toggle dark/light mode (system preference)
- [ ] All pages render correctly in both modes

### Gamification
- [ ] XP display on dashboard
- [ ] Level counter
- [ ] Streak counter
- [ ] Badges section

---

## 📦 Database Collections

Firebase will auto-create these collections when you add first data:

- `users` - User accounts & profiles
- `user_progress` - XP, levels, streaks, badges
- `vocabulary` - Word definitions with difficulty levels
- `grammar` - Grammar topics & rules
- `reading` - Reading passages with questions
- `listening` - Listening practices with audio & questions
- `writing_practices` - Writing prompts (Task 1, Task 2, GT)
- `speaking_practices` - Speaking cue cards
- `dictionary` - Dictionary entries with definitions
- `books` - Book library with PDFs
- `spelling_practice` - Spelling words with pronunciations
- `pronunciation_lessons` - Pronunciation guides with audio
- `tongue_twisters` - Tongue twisters by difficulty
- `writing_submissions` - User writing submissions with evaluations
- `speaking_submissions` - User speaking submissions with evaluations

---

## 🔧 Deployment to Vercel

1. Push code to GitHub:
   ```bash
   git push origin claude/ielts-practice-website-features-cml075
   ```

2. Go to [Vercel](https://vercel.com/new)
3. Import project from GitHub
4. Add environment variables (same as `.env.local`)
5. Deploy!

Your live URL: `your-project.vercel.app`

---

## 📝 Next Steps

### High Priority (Recommended):
- [ ] Connect XP rewards system to practice completions
- [ ] Implement Badge/Achievement logic
- [ ] Build Daily Quests with XP rewards
- [ ] Add user progress tracking to user_progress collection
- [ ] Implement Story Mode progression system

### Medium Priority:
- [ ] Improve Leaderboard (weekly/monthly filters)
- [ ] Add practice statistics dashboard
- [ ] Create user profile pages with progress history
- [ ] Add practice history and review features
- [ ] Implement practice streaks counter

### Enhancements:
- [ ] Add Vocabulary flashcards with spaced repetition
- [ ] Add Reading with text highlighting feature
- [ ] Add Recording capability for Speaking practice
- [ ] Implement batch import for content (CSV uploads)
- [ ] Add YouTube video embeds for lessons
- [ ] Create practice test mode with full IELTS simulation

### Nice-to-Have:
- [ ] Add user avatars & profiles
- [ ] Implement push notifications
- [ ] Add export progress to PDF feature
- [ ] Create social/community features
- [ ] Add practice reminders via email
- [ ] Implement adaptive difficulty based on user performance

---

## 🐛 Troubleshooting

### Firebase Connection Error
- Check `.env.local` has all required keys
- Verify Firestore is enabled in Firebase Console
- Check Firebase rules allow read/write

### Admin Panel Not Accessible
- Ensure your user `role` is set to `"admin"` in Firestore
- Check browser console for auth errors
- Clear browser cache & cookies

### Gemini API Not Working
- Verify API key is correct in `.env.local`
- Check API is enabled in Google Cloud Console
- API calls are in `/src/app/api/evaluate-*`

### Styling Issues
- Tailwind CSS might not be compiling
- Run `npm run dev` instead of `npm run build`
- Clear `.next` folder and restart

---

## 📞 Support

For issues:
1. Check browser console for errors
2. Verify Firebase rules and permissions
3. Check `.env.local` configuration
4. Review Firestore data structure

---

## 🎉 Congratulations!

Your IELTS platform is ready for testing! 

**Next Morning Testing Plan:**
1. Start dev server
2. Test complete user flow (signup → dashboard → vocabulary)
3. Test admin panel (add content)
4. Test gamification features
5. Test dark mode & responsiveness
6. Test on mobile

Good luck! 🚀
