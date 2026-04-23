# Teatime App — Copy-Paste Setup Commands

If you prefer just copying commands, here's everything in order:

---

## ⚡ SUPER QUICK SETUP (5 minutes)

### 1. Open Command Prompt

**Windows:**
- Press `Win + R`
- Type `cmd`
- Press Enter

**Mac:**
- Press `Cmd + Space`
- Type `terminal`
- Press Enter

---

### 2. Go to your Desktop

```bash
cd Desktop
```

---

### 3. Clone the app (or extract the ZIP)

**If you have the GitHub URL:**
```bash
git clone <PASTE_THE_GITHUB_URL_HERE>
cd teatime-app
```

**If you downloaded as ZIP:**
```bash
cd teatime-app
```

---

### 4. Open in VS Code

```bash
code .
```

VS Code opens. **Wait 10 seconds** for it to fully load.

---

### 5. Open VS Code Terminal

Press **Ctrl + `` (backtick)** inside VS Code.

A terminal appears at the bottom.

---

### 6. Install dependencies

Copy-paste this into the terminal:

```bash
npm install
```

**Wait 1-2 minutes.** You'll see `added 350 packages`.

---

### 7. Create .env.local file

**In VS Code:**
1. Right-click on the root folder (left sidebar)
2. Click "New File"
3. Name it `.env.local`
4. Paste this:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

5. Press `Ctrl + S` to save

---

### 8. Get your Supabase credentials

1. Go to **https://supabase.com**
2. Sign up or login
3. Click **"New Project"**
4. Name it `teatime-dev`
5. Set a random password
6. Wait 1 minute for it to be created
7. Go to **Settings → API**
8. Copy the **Project URL** (looks like `https://xxx.supabase.co`)
9. Paste it into your `.env.local` replacing `https://your-project.supabase.co`
10. Copy the **anon public key** (long string of letters)
11. Paste it into your `.env.local` replacing `your-anon-key-here`
12. Press `Ctrl + S` to save

---

### 9. Run the SQL schema

**In Supabase:**
1. Click **SQL Editor**
2. Click **New Query**
3. **In VS Code:** Open `sql/schema.sql` (left sidebar → sql folder)
4. **Select all:** Ctrl + A
5. **Copy:** Ctrl + C
6. **In Supabase:** Click in the editor
7. **Paste:** Ctrl + V
8. Click the big blue **Run** button
9. Wait 20 seconds for it to complete

You should see a ✅ (green checkmark).

---

### 10. Start the app

**In VS Code terminal, type:**

```bash
npm run dev
```

You'll see:
```
✓ Ready in 2.3s

  ▲ Next.js 14.2.13

  - Local:        http://localhost:3000
```

---

### 11. Open the app

**Click the link** http://localhost:3000 or paste it in your browser.

You should see the landing page: **"A cup of tea, a walk away"**

---

## ✅ DONE! 

Click **"Start with an email"** and test it out.

---

## Commands Reference

```bash
# Start the app (run this after setup)
npm run dev

# Stop the app
Ctrl + C

# Build for production
npm run build

# Start production server
npm start

# Check for TypeScript errors
npx tsc --noEmit
```

---

## If Something Goes Wrong

| Problem | Solution |
|---------|----------|
| "git not found" | Reinstall Git from git-scm.com |
| "node not found" | Reinstall Node.js from nodejs.org |
| "npm not found" | Restart Command Prompt, then try again |
| "ENOENT: no such file" | Make sure you're in the right folder (`cd teatime-app`) |
| "Port 3000 in use" | Run `npm run dev -- -p 3001` instead |
| "Supabase URL undefined" | Check `.env.local` has the correct values (no spaces!) |
| "No offices in onboarding" | Make sure you ran the SQL schema (step 9) |

---

## That's It!

You now have Teatime running locally.

- Read **README.md** for features
- Read **DEPLOYMENT.md** when ready to launch
- Check **INDEX.md** if you want to understand the code structure

Happy building! ☕
