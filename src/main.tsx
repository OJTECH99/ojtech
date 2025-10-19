import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { AuthProvider } from './providers/AuthProvider'
import { 
  BrowserRouter 
} from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { init as initEmailJS } from '@emailjs/browser';

// Google OAuth client ID from environment variable
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;


// EmailJS initialization
const emailJSPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
initEmailJS(emailJSPublicKey);





// Use BrowserRouter for now since it's simpler to integrate with the current setup
// The v7 warnings are not critical at this point
createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
