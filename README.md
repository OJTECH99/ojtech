# OJTech React Frontend

This is the React frontend for the OJTech platform, built with Vite, React, and TypeScript.

## Setup

1. Clone the repository
2. Navigate to the project directory:
   ```
   cd ojtech-vite
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env.local` file in the root directory with the following content:
   ```
   # API Base URL
   VITE_API_BASE_URL=http://localhost:8080/api

   # Gemini AI API Configuration
   VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta
   VITE_GEMINI_API_KEY=your-gemini-api-key-here
   ```

   > **Note:** You need to obtain a Gemini API key from Google AI Studio (https://makersuite.google.com/app/apikey) and replace `your-gemini-api-key-here` with your actual API key.

5. Start the development server:
   ```
   npm run dev
   ```

## Features

### Resume Generation
The application includes an AI-powered resume generator that creates ATS-optimized resumes based on your profile information. This feature:

- Uses Google's Gemini AI API directly from the frontend
- Generates professionally formatted resume content optimized for ATS systems
- Follows best practices from the Tech Interview Handbook
- Allows downloading as PDF

#### Resume Generation Flow
1. User completes their profile with education, experience, skills, etc.
2. User clicks "Generate Resume" button on the Resume Management page
3. Frontend calls Gemini API directly with optimized prompt
4. Resume JSON is saved to the backend database
5. Resume is displayed to the user in a clean, formatted layout
6. User can download as PDF or view the raw JSON

## Environment Variables

| Variable | Description |
|----------|-------------|
| VITE_API_BASE_URL | The base URL for the backend API (default: http://localhost:8080/api) |
| VITE_GEMINI_API_URL | The URL for the Gemini API (default: https://generativelanguage.googleapis.com/v1beta) |
| VITE_GEMINI_API_KEY | Your Gemini API key (required for resume generation) |

## Development Notes

- The project uses class components for all React components
- The frontend now handles the AI integration directly, communicating with Gemini API
- The backend only stores and retrieves the resume data

## Technology Stack

- **React**: Frontend library
- **Vite**: Build tool and development server
- **TypeScript**: Type safety for JavaScript
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **Spring Boot API**: Backend RESTful API

## Key Features

- User authentication and authorization
- Job opportunity discovery and application
- Resume upload and parsing
- Profile management for students and employers
- Job posting management for employers

## Architecture

The application follows a class component architecture, making use of React's context API for state management. Key patterns:

- **Class Components**: Most components are implemented as ES6 classes extending React.Component
- **Context API**: Used for global state like auth context
- **HOC Pattern**: Used for protected routes and authentication wrappers
- **API Service Layer**: Clean separation of API calls in dedicated service modules

## Pages Migrated from Next.js

The following pages have been migrated from the Next.js application:

1. **HomePage**: Landing page with feature overview
2. **OpportunitiesPage**: Job opportunities with swipe interface
3. **JobDetailPage**: Detailed job information
4. **JobApplicationPage**: Application form for jobs
5. **ProfilePage**: User profile management

## Spring Boot API Integration

The application integrates with a Spring Boot backend API. Key integration points:

- **Authentication**: JWT-based authentication
- **Job Matching**: AI-powered job matching algorithms
- **Profile Management**: Student and employer profile handling
- **Resume Parsing**: CV upload and parsing capabilities
- **Application Tracking**: Job application status tracking

## Development

To run the application in development mode:

```bash
npm install
npm run dev
```

## Build

To build the application for production:

```bash
npm run build
```

## Future Improvements

- Add real-time notifications
- Implement complete test coverage
- Add CI/CD pipeline
- Enhance mobile responsiveness
- Implement offline capabilities

## Migration Notes

This application was migrated from Next.js to React Vite with the following changes:

1. Converted functional components to class components
2. Changed from Next.js API routes to Spring Boot API endpoints
3. Replaced Next.js routing with React Router
4. Replaced server-side rendering with client-side rendering
5. Replaced Supabase integration with direct Spring Boot API integration

## License

MIT
