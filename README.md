# 🎓 StudyMate - AI-Powered Course Creation Platform

![StudyMate Logo](https://study-mate-odd9xoz9z-lakshyas-projects-619d1e13.vercel.app)

**StudyMate** is a revolutionary AI-powered educational platform that transforms any topic into comprehensive, interactive video courses in minutes. Built with cutting-edge AI technology and modern web frameworks.

## 🚀 Live Demo

**🌐 [Visit StudyMate Live](https://study-mate-odd9xoz9z-lakshyas-projects-619d1e13.vercel.app)**

## ✨ Features

### 🤖 **AI-Powered Course Generation**
- **Intelligent Content Creation**: Uses Google's Gemini AI to generate structured course layouts and content
- **Smart Chapter Organization**: Automatically organizes topics into logical chapters and sections
- **Comprehensive Coverage**: Creates detailed, educational content on any subject

### 🎬 **Professional Video Production**
- **Automatic Video Creation**: Transforms course content into professional video presentations
- **AI-Generated Narration**: High-quality text-to-speech using ElevenLabs' premium voice synthesis
- **Interactive Slides**: Dynamic HTML/CSS slides with reveal animations and effects
- **Real-time Captions**: Automatic caption generation using AssemblyAI

### 💡 **Modern Learning Experience**
- **Interactive Video Player**: Custom-built player with timeline controls and smooth transitions
- **Multi-slide Sequencing**: Seamlessly transitions between course sections
- **Responsive Design**: Perfect viewing experience on all devices
- **Progress Tracking**: Monitor learning progress through video completion

### 🔐 **User Management & Security**
- **Secure Authentication**: Powered by Clerk with social login options
- **Credit System**: Manage course generation with built-in credit system
- **Personal Profiles**: Customized user experience with profile management

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 16**: React framework with App Router and Turbopack
- **TypeScript**: Full type safety and developer experience
- **Tailwind CSS**: Modern, utility-first CSS framework
- **Remotion**: Professional video player and media handling

### **Backend & APIs**
- **Google Gemini AI**: Advanced language model for course content generation
- **ElevenLabs TTS**: Premium text-to-speech for natural-sounding narration
- **AssemblyAI**: Accurate speech-to-text for video captions
- **PostgreSQL**: Robust relational database with Drizzle ORM

### **Cloud Infrastructure**
- **Vercel**: Deployment and hosting platform
- **Neon Database**: Serverless PostgreSQL database
- **AWS S3**: Cloud storage for audio files and media assets
- **Clerk**: Authentication and user management service

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend APIs  │    │   AI Services   │
│   (Next.js)     │◄──►│   (Next.js API) │◄──►│   (Gemini AI)   │
│                 │    │                 │    │   (ElevenLabs)  │
│ • Video Player  │    │ • Course Gen    │    │   (AssemblyAI)  │
│ • User Auth     │    │ • Video Content │    │                 │
│ • Responsive UI │    │ • User Mgmt     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   File Storage  │    │   Authentication│
│   (PostgreSQL)  │    │   (AWS S3)      │    │   (Clerk)       │
│                 │    │                 │    │                 │
│ • User Data     │    │ • Audio Files   │    │ • User Sessions │
│ • Course Data   │    │ • Media Assets  │    │ • Social Login  │
│ • Slide Content │    │ • Backups       │    │ • Security      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- AWS S3 bucket for file storage

### Environment Variables
Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="your_postgresql_connection_string"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"

# AI Services
GEMINI_API_KEY="your_google_gemini_api_key"
ELEVENLABS_API_KEY="your_elevenlabs_api_key"
ASSEMBLYAI_API_KEY="your_assemblyai_api_key"

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_S3_BUCKET_NAME="your_s3_bucket_name"
AWS_REGION="your_aws_region"
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lakshyabhatnagar/StudyMate.git
   cd StudyMate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx drizzle-kit push:pg
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Database Schema

### Core Tables
- **users**: User profiles and credit management
- **courses**: Course metadata and layout information
- **chapters**: Individual chapter data and structure
- **chapter_content_slides**: Detailed slide content with media URLs

### Key Features
- **Relational Design**: Proper foreign key relationships
- **JSON Fields**: Flexible storage for dynamic content
- **Optimized Queries**: Efficient data retrieval patterns

## 🎯 Usage

### Creating a Course
1. **Sign up/Login** using your preferred method
2. **Enter your topic** - anything you want to learn about
3. **Choose course type** - comprehensive or focused learning
4. **Generate content** - AI creates your personalized course
5. **Watch & Learn** - Enjoy your interactive video course

### Features Available
- **Unlimited Topics**: Create courses on any subject
- **Professional Quality**: High-quality video and audio output
- **Interactive Learning**: Engaging slide presentations with animations
- **Progress Tracking**: Monitor your learning journey

## 🛡️ Security & Privacy

- **Data Encryption**: All sensitive data encrypted in transit and at rest
- **Secure Authentication**: Multi-factor authentication options available
- **Privacy First**: User data is never shared with third parties
- **GDPR Compliant**: Full data protection and user rights compliance

## 🤝 Contributing

We welcome contributions to StudyMate! Please read our contributing guidelines and code of conduct.

### Development Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Creator

**Lakshya Bhatnagar**
- Email: [lakshyabhatnagar1@gmail.com](mailto:lakshyabhatnagar1@gmail.com)
- Platform: [StudyMate](https://study-mate-q1sbtn7hr-lakshyas-projects-619d1e13.vercel.app/)

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful language model capabilities
- **ElevenLabs** for premium text-to-speech technology
- **AssemblyAI** for accurate speech recognition
- **Vercel** for seamless deployment and hosting
- **Clerk** for robust authentication services

## 📈 Performance & Analytics

- **Lightning Fast**: Sub-second page load times
- **Scalable Architecture**: Handles concurrent users efficiently  
- **Optimized Media**: Compressed assets for faster delivery
- **Global CDN**: Content delivered from edge locations worldwide

## 🔮 Future Roadmap

- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **Collaborative Learning**: Group courses and discussions
- [ ] **Advanced Analytics**: Detailed learning insights
- [ ] **API Access**: Developer API for integrations
- [ ] **Multilingual Support**: Courses in multiple languages

---

**⭐ If you find StudyMate helpful, please give it a star on GitHub!**

**🚀 Ready to revolutionize your learning? [Start creating courses now!](https://study-mate-q1sbtn7hr-lakshyas-projects-619d1e13.vercel.app/)**
