# BeatShowcase Pro - Technical Context

## Technology Stack

### Frontend
- **React**: Core UI library
- **TypeScript**: Type safety and development experience
- **React Router**: Navigation and routing
- **Tailwind CSS**: Utility-first styling
- **FFmpeg.wasm**: Client-side video processing
- **Web Audio API**: Audio visualization and processing

### Backend Services
- **Firebase Authentication**: User management
- **Firestore**: Database for storing user data, beats, and showcases
- **Firebase Storage**: Media file storage
- **Firebase Hosting**: Application hosting
- **Firebase Functions**: (Optional) For any server-side operations

### APIs
- **YouTube Data API v3**: For direct video uploads and metadata management
- **Stripe API**: Payment processing for subscriptions
- **Web Audio API**: Audio analysis and visualization

### Build Tools
- **Vite**: Modern build tool for faster development
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks

## Development Environment

### Local Setup
```bash
# Clone repository
git clone https://github.com/yourusername/beatshowcase-pro.git

# Install dependencies
cd beatshowcase-pro
npm install

# Start development server
npm run dev

# Run Firebase emulators
firebase emulators:start
```

### Environment Variables
- `.env.development`: Development environment variables
- `.env.production`: Production environment variables
- Keys needed:
  - `VITE_FIREBASE_CONFIG`: Firebase configuration
  - `VITE_YOUTUBE_API_KEY`: YouTube API key
  - `VITE_STRIPE_PUBLIC_KEY`: Stripe public key

## Dependencies

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.16.0",
  "firebase": "^10.4.0",
  "@ffmpeg/ffmpeg": "^0.11.0",
  "@ffmpeg/core": "^0.11.0",
  "tailwindcss": "^3.3.3"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.2.2",
  "vite": "^4.4.9",
  "@vitejs/plugin-react": "^4.1.0",
  "eslint": "^8.49.0",
  "prettier": "^3.0.3"
}
```

## Firebase Configuration

### Firebase Project Setup
- Project Name: beatshowcase-pro
- Multiple environments:
  - beatshowcase-pro-dev (Development)
  - beatshowcase-pro-prod (Production)

### Authentication Methods
- Email/Password
- Google OAuth
- (Future) Apple Sign-in

### Firestore Collections
- `users`: User information and preferences
- `beats`: Beat metadata and storage references
- `showcases`: Showcase configurations
- `templates`: Visualizer templates
- `subscriptions`: User subscription information

### Storage Structure
- `/users/{userId}/beats/`: User uploaded beats
- `/users/{userId}/showcases/`: Generated showcases
- `/templates/`: System visualizer templates

## Deployment Process

### Development to Production Workflow
1. Develop on local environment with emulators
2. Push to `dev` branch for staging deployment
3. Test on staging environment
4. Create PR from `dev` to `main`
5. Review and merge for production deployment

### Deployment Commands
```bash
# Deploy to development
npm run build:dev
firebase use development
firebase deploy

# Deploy to production
npm run build
firebase use production
firebase deploy
```

## Technical Constraints

### Browser Compatibility
- Modern browsers only (Chrome, Firefox, Safari, Edge)
- No IE11 support required
- Progressive enhancement for older browsers

### Performance Targets
- Initial load under 2 seconds
- Time to interactive under 3 seconds
- Smooth 60fps animations
- Video processing feedback within 100ms

### Storage Limitations
- Free tier: 500MB storage limit per user
- Producer tier: 2GB storage limit
- Studio tier: 5GB storage limit

### API Limits
- YouTube API quotas (10,000 units per day)
- Firebase free tier limitations

## External Resources
- YouTube API Documentation: https://developers.google.com/youtube/v3/docs
- Firebase Documentation: https://firebase.google.com/docs
- FFmpeg.wasm Documentation: https://github.com/ffmpegwasm/ffmpeg.wasm
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API