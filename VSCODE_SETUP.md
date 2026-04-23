# Teatime App — VS Code Setup Guide (Step-by-Step)

## Part 1: Install Prerequisites

Before you open VS Code, you need 3 things installed on your computer:

### Step 1A: Install Git

1. Go to **https://git-scm.com/download**
2. Click **Windows** (or your OS)
3. Run the installer
4. Click "Next" through all screens (defaults are fine)
5. Click "Install"

**Verify it worked:**
- Open Command Prompt (Win + R, type `cmd`, press Enter)
- Type: `git --version`
- You should see something like: `git version 2.40.0`

### Step 1B: Install Node.js

1. Go to **https://nodejs.org**
2. Click the **green "LTS" button** (not the latest version)
3. Run the installer
4. Click "Next" → "I Agree" → "Next" for all screens
5. Click "Install"
6. Click "Finish"

**Verify it worked:**
- Open Command Prompt
- Type: `node --version`
- You should see something like: `v18.17.0`

### Step 1C: Install VS Code

1. Go to **https://code.visualstudio.com**
2. Click the **blue "Download"** button for Windows
3. Run the installer
4. Click "I accept the agreement" → "Next"
5. Click "Install"
6. Check **"Add to PATH"** (important!)
7. Click "Finish"

**Verify it worked:**
- Click Start menu
- Type "Visual Studio Code"
- Open it

---

## Part 2: Get the Teatime App Code

You have 2 options:

### Option A: Clone from GitHub (Recommended)

**Step 2A-1: Open Command Prompt**
- Press **Win + R**
- Type `cmd` and press Enter
- A black terminal window opens

**Step 2A-2: Go to where you want the folder**
```bash
cd Desktop
```
(This puts the folder on your Desktop, but you can use any folder)

**Step 2A-3: Clone the code**
```bash
git clone https://github.com/YOUR_USERNAME/teatime-app.git
cd teatime-app
```

(Replace `YOUR_USERNAME` with your actual GitHub username, or use the repo URL if it's shared with you)

**You should see:**
```
Cloning into 'teatime-app'...
remote: Counting objects: 100% (33/33)
...
```

---

### Option B: Download as ZIP (If no GitHub)

**Step 2B-1: Download ZIP**
- Go to the GitHub repo or download link
- Click **"Code" → "Download ZIP"**
- Save it to your Desktop

**Step 2B-2: Extract the ZIP**
- Right-click the downloaded ZIP file
- Click **"Extract All..."**
- Click **"Extract"**

**Step 2B-3: Open Command Prompt**
```bash
cd Desktop
cd teatime-app
```

---

## Part 3: Open in VS Code

**Step 3-1: Open the folder in VS Code**

From the Command Prompt (where you ran `cd teatime-app`), type:
```bash
code .
```

This opens the entire `teatime-app` folder in VS Code.

**Wait 10 seconds** for VS Code to fully load.

---

**OR manually open VS Code:**
1. Click **File → Open Folder**
2. Navigate to Desktop → `teatime-app`
3. Click **"Select Folder"**

---

## Part 4: Install Dependencies

**Step 4-1: Open Terminal in VS Code**
- Press **Ctrl + `` (backtick)** or go to **Terminal → New Terminal**
- A terminal appears at the bottom of VS Code

**Step 4-2: Install npm packages**
```bash
npm install
```

**This takes 1-2 minutes.** You'll see:
```
npm notice
npm notice New minor version of npm available: 9.8.1 -> 10.2.3
npm notice To update run: npm install -g npm@10.2.3
npm notice
added 350 packages in 45s
```

That's normal! ✅

---

## Part 5: Create Environment File

**Step 5-1: Create .env.local**

In VS Code:
- Right-click on the root folder (where package.json is)
- Click **"New File"**
- Name it `.env.local`

**Step 5-2: Add your Supabase credentials**

Paste this into `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace the values:**
1. Go to **supabase.com** → sign up (free)
2. Create a new project called `teatime-dev`
3. Wait 1-2 minutes for it to spin up
4. Go to **Settings → API**
5. Copy the **Project URL** → replace `https://your-project.supabase.co`
6. Copy the **anon public key** → replace `your-anon-key-here`

Save the file: **Ctrl + S**

---

## Part 6: Run the SQL Schema

**⚠️ Important: Do this before running the app**

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. In VS Code, open `sql/schema.sql` (left sidebar)
4. **Select all** (Ctrl + A)
5. **Copy** (Ctrl + C)
6. Go back to Supabase SQL Editor
7. **Paste** (Ctrl + V)
8. Click **"Run"** button (big blue button)

**Wait 20-30 seconds** for it to complete.

You should see: ✅ (green checkmark) if successful.

---

## Part 7: Start the App

**Step 7-1: Run the dev server**

In the VS Code terminal, type:
```bash
npm run dev
```

**You'll see:**
```
  ▲ Next.js 14.2.13
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.3s
```

**Step 7-2: Open the app**

Click the **http://localhost:3000** link (Ctrl + Click), or:
1. Open your browser
2. Go to **http://localhost:3000**

You should see the **Teatime landing page** with the headline "A cup of tea, a walk away."

---

## Part 8: Test the App

**Step 8-1: Create an account**
1. Click **"Start with an email"**
2. Enter any email (e.g., `test@example.com`)
3. Check your email for the magic link
4. Click the link
5. **Allow location access** when browser asks
6. Pick an office or add your own
7. Enter your name
8. Click **"Let's go →"**

**Boom!** You're on the home page with the map. ✅

---

## Part 9: Test Realtime (Optional)

To see notifications work:

**Open 2 browser tabs:**
- **Tab 1**: http://localhost:3000 → login as `user1@test.com`
- **Tab 2**: http://localhost:3000 → login as `user2@test.com`

**In Tab 1:**
- Click the orange **`+` button**
- Pick "Tea"
- Click "Post request"

**Watch Tab 2:**
- A notification popup appears at the top in <1 second
- It says "someone nearby wants to get tea"
- Click "Join"

**That's realtime working!** ✅

---

## Part 10: Useful VS Code Shortcuts

| Action | Shortcut |
|--------|----------|
| Open terminal | `Ctrl + `` (backtick) |
| Open file | `Ctrl + P` |
| Save file | `Ctrl + S` |
| Find in file | `Ctrl + F` |
| Replace in file | `Ctrl + H` |
| Go to line | `Ctrl + G` |
| Comment line | `Ctrl + /` |
| Format code | `Shift + Alt + F` |

---

## Troubleshooting

### "Command not found: git"
- Git not installed properly
- **Fix**: Restart Command Prompt after installing Git

### "Command not found: node"
- Node.js not installed
- **Fix**: Download from nodejs.org and reinstall

### "Cannot find module 'next'"
- Dependencies not installed
- **Fix**: Run `npm install` again

### "Port 3000 already in use"
- Another app is using port 3000
- **Fix**: Run on a different port:
  ```bash
  npm run dev -- -p 3001
  ```

### "Supabase URL not defined"
- `.env.local` file missing or wrong
- **Fix**: Create `.env.local` and add the correct credentials

### "Location not working"
- Browser blocked location
- **Fix**: Go to browser settings → Privacy → Location → Allow for localhost:3000

### "No offices showing in onboarding"
- Supabase SQL not run
- **Fix**: Go back to Part 6 and run `sql/schema.sql`

---

## File Structure in VS Code

When you open the folder, you should see this on the left:

```
📁 teatime-app
  📁 src/
    📁 app/
      📄 page.tsx (landing page)
      📄 layout.tsx
      📄 globals.css
      📁 auth/
      📁 home/
      📁 onboarding/
      ... more pages
    📁 components/
    📁 hooks/
    📁 lib/
    📁 types/
  📁 sql/
    📄 schema.sql
  📁 public/
  📄 package.json
  📄 tsconfig.json
  📄 next.config.js
  📄 tailwind.config.js
  📄 .env.local (⭐ you created this)
  📄 README.md
  ... more files
```

---

## Next Steps

1. ✅ You've cloned, installed, and run the app
2. Read **README.md** (in VS Code → right-click → Open Preview)
3. Read **QUICKSTART.md** for feature walkthrough
4. Create Supabase project for production
5. Deploy to Vercel (see **DEPLOYMENT.md**)

---

## When You're Done

**To stop the app:**
- Press `Ctrl + C` in the VS Code terminal

**To start again:**
- Open the terminal again (Ctrl + `` )
- Type `npm run dev`

---

## Quick Reference

| What you want | Command |
|---|---|
| Start the app | `npm run dev` |
| Stop the app | `Ctrl + C` |
| Build for production | `npm run build` |
| Check for errors | `npm run lint` |
| Install a new package | `npm install package-name` |

---

**You're all set!** 🎉

If you get stuck, check the **Troubleshooting** section above, or read the full **README.md** in the project folder.

Happy building! ☕
