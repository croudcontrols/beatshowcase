# BeatShowcase Pro

A SaaS platform for type beat producers to automate the creation of professional YouTube showcase videos.

## Features

- **User Authentication**: Secure account creation and management
- **Beat Library Management**: Upload, organize, and manage your beat collection
- **Automated Showcase Video Generator**: Create professional showcase videos without video editing skills
- **YouTube Integration**: Direct upload to YouTube from the platform
- **Template System**: Choose from multiple visual templates for your showcases
- **Subscription Tiers**: Free, Producer, and Studio plans with different feature sets

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Video Processing**: FFmpeg.wasm for client-side video generation
- **APIs**: YouTube Data API, Web Audio API

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/beatshowcase-pro.git
   cd beatshowcase-pro
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_YOUTUBE_API_KEY=your_youtube_api_key
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Create an account or log in
2. Upload your beats to the library
3. Go to the Showcase Creator to select beats and a template
4. Customize your showcase settings
5. Generate and preview your showcase
6. Publish directly to YouTube

## Subscription Plans

- **Free Tier**: Limited storage and basic templates
- **Producer Tier ($9.99/mo)**: 50 beats storage, 10 showcases per month, 5 templates
- **Studio Tier ($24.99/mo)**: Unlimited storage, unlimited showcases, all templates, custom branding

## License

This project is licensed under the MIT License - see the LICENSE file for details. # beatshowcase
# beatshowcase
