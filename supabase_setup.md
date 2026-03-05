# Supabase Setup Instructions

Awesome! Since you already created the **Maritime Work/Rest** project in Supabase, we just have two simple steps to get the app connected:

## Step 1: Connect the App
1. Inside your Supabase Dashboard, click on the **⚙️ Settings** icon on the bottom left sidebar.
2. Under "Configuration", click on **Database**.
3. Scroll down to the **Connection string** section and select **URI**.
4. Copy the long connecting string provided.
5. In your code editor, open `C:\Users\victo\.gemini\antigravity\brain\570bcd5b-2b3d-4a20-95a5-ae05d27bc7f9\Project-ILO-Tracker\maritime-qr-cloud\backend\.env`.
6. Replace the `DATABASE_URL=` line with the link you copied (remember to replace `[YOUR-PASSWORD]` with the DB password you set when creating the project).

## Step 2: Create the Tables
Supabase gives you a built-in SQL runner, which makes this super easy!
1. In the Supabase sidebar, click on the **SQL Editor** icon (`</>`).
2. Click **New query**.
3. Copy all the text from your local `schema.sql` file (`C:\Users\victo\.gemini\antigravity\brain\570bcd5b-2b3d-4a20-95a5-ae05d27bc7f9\Project-ILO-Tracker\maritime-qr-cloud\schema.sql`).
4. Paste it into the Supabase SQL editor on the website.
5. Hit the green **Run** button on the bottom right.

That's it! Your Cloud Database is now fully initialized. Go back to your frontend preview at **http://localhost:5173/** and type in `1234` to login!
