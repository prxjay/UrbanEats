# 🚀 Vercel Deployment Guide for UrbanEats

Deploying both the UrbanEats Customer App and the Admin Dashboard from a single repository is simple because they are entirely independent Vite projects. 

## 📋 1. Set Up Environment Variables

Since this project uses Supabase for the database, authentication, and image storage, you only need your two Supabase keys to deploy.

You can find these in your Supabase Dashboard under **Project Settings > API**:
- **Project URL** (`VITE_SUPABASE_URL`)
- **Project API Key / anon public** (`VITE_SUPABASE_ANON_KEY`)

## 🌐 2. Deploying the Customer App (UrbanEats)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... > Project**.
2. Import this GitHub repository.
3. Under the **Root Directory** setting, click **Edit** and select the **`UrbanEats`** folder.
4. Make sure the Framework Preset automatically switches to **Vite**.
5. Expand the **Environment Variables** section and add:
   - `VITE_SUPABASE_URL` 
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**.

## 🛡️ 3. Deploying the Admin Dashboard (adminpanel)

1. Go back to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... > Project**.
2. Import the *exact same* GitHub repository again.
3. Under the **Root Directory** setting, click **Edit** and select the **`adminpanel`** folder.
4. Ensure the Framework Preset is **Vite**.
5. Expand the **Environment Variables** section and add the exact same two Supabase keys:
   - `VITE_SUPABASE_URL` 
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**.

## 🗄️ 4. Supabase Database Setup

To make the application fully functional, ensure you have created the following in your Supabase project:
- `users` and `auth.users` setup for authentication.
- `food_items` table for storing your restaurant menu.
- `orders` table with Realtime enabled to receive live order updates.
- A **Public Storage Bucket** named `food-images` for uploading menu item photos.

## 🎉 Success!

You will now have two separate Vercel URLs for your project. One is for your customers to order food, and the other is a protected dashboard for you to manage the restaurant!
