/**
 * Resume HTML Generator
 * 
 * This module provides functions to generate a clean, professional HTML resume
 * from structured JSON data. It handles all the formatting and layout concerns,
 * making sure the resume looks great both on screen and when printed.
 */

/**
 * Generates a complete HTML resume from JSON data
 * @param {Object} resumeData - The JSON resume data
 * @returns {string} - Complete HTML document as a string
 */
export function generateResumeHtml(resumeData) {
  try {
    // Extract the jsonContent if it exists in the wrapper structure
    const data = resumeData.jsonContent ? resumeData.jsonContent : resumeData;
    
    // Generate the HTML content
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume - ${data.contactInfo?.name || 'Professional Resume'}</title>
  <style>
    /* Reset and Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    }
    
    body {
      background-color: #fff;
      color: #333;
      line-height: 1.6;
      font-size: 10pt;
      padding: 0;
      margin: 0;
    }
    
    /* Print Optimization */
    @media print {
      body {
        width: 100%;
        margin: 0;
        padding: 0;
        background-color: #fff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .resume-container {
        box-shadow: none;
        border: none;
      }
    }
    
    /* Layout */
    .resume-container {
      max-width: 8.5in;
      margin: 0 auto;
      background-color: #fff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    /* Header Section */
    .header {
      background-color: #2a2a2a;
      color: white;
      padding: 30px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 24pt;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .header h2 {
      font-size: 14pt;
      font-weight: normal;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    /* Main Content Layout */
    .content {
      display: flex;
    }
    
    .left-column {
      width: 30%;
      padding: 20px;
      background-color: #f8f8f8;
      border-right: 1px solid #eee;
    }
    
    .right-column {
      width: 70%;
      padding: 20px;
    }
    
    /* Section Styling */
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 12pt;
      text-transform: uppercase;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
      margin-bottom: 12px;
      font-weight: bold;
      color: #333;
    }
    
    /* Contact Section */
    .social-item {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      font-size: 9pt;
    }
    
    .social-icon {
      color: #2a2a2a;
      margin-right: 8px;
      min-width: 16px;
    }
    
    /* Lists */
    ul {
      list-style-type: disc;
      padding-left: 18px;
      margin-bottom: 10px;
    }
    
    li {
      margin-bottom: 6px;
      font-size: 9pt;
    }
    
    /* Experience Items */
    .exp-item, .project-item, .edu-item, .cert-item {
      margin-bottom: 15px;
    }
    
    .exp-item h4, .project-item h4 {
      font-size: 11pt;
      margin-bottom: 3px;
    }
    
    .exp-meta, .project-meta {
      font-size: 9pt;
      color: #666;
      margin-bottom: 6px;
      font-style: italic;
    }
    
    /* Professional Summary */
    .summary-list li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <!-- Header -->
    <header class="header">
      <h1>${data.contactInfo?.name || 'Your Name'}</h1>
      <h2>${getTitle(data)}</h2>
    </header>
    
    <!-- Content Area -->
    <div class="content">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Contact Information -->
        <div class="section">
          <h3 class="section-title">Contact</h3>
          <div>
            ${renderContactItem('email', data.contactInfo?.email || '', 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z')}
            ${renderContactItem('phone', data.contactInfo?.phone || '', 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z')}
            ${renderContactItem('location', data.contactInfo?.location || '', 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z')}
            ${renderContactItem('linkedin', data.contactInfo?.linkedin || '', 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z')}
            ${renderContactItem('github', data.contactInfo?.github || '', 'M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.725-1.335-1.725-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209.96-.262 1.98-.392 3-.398 1.02.006 2.04.136 3 .398 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.495 24 12.292 24 5.78 18.627.5 12 .5z')}
            ${renderContactItem('portfolio', data.contactInfo?.portfolio || '', 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z')}
          </div>
        </div>
        
        <!-- Skills -->
        <div class="section">
          <h3 class="section-title">Skills</h3>
          ${renderSkills(data.skills)}
        </div>
        
        <!-- Education -->
        <div class="section">
          <h3 class="section-title">Education</h3>
          ${renderEducation(data.education)}
        </div>

        <!-- Certifications -->
        ${renderCertifications(data.certifications)}
      </div>
      
      <!-- Right Column -->
      <div class="right-column">
        <!-- Professional Summary -->
        ${renderProfessionalSummary(data.professionalSummary)}
        
        <!-- Experience -->
        <div class="section">
          <h3 class="section-title">Experience</h3>
          ${renderExperience(data.experience)}
        </div>
        
        <!-- Projects -->
        ${renderProjects(data.projects)}
      </div>
    </div>
  </div>
</body>
</html>
    `;
  } catch (error) {
    console.error('Error generating resume HTML:', error);
    return createErrorHtml(error);
  }
}

/**
 * Get the professional title from experience data
 */
function getTitle(data) {
  if (data.experience && data.experience.experiences && data.experience.experiences.length > 0) {
    return data.experience.experiences[0].title || 'Professional';
  }
  return 'Professional';
}

/**
 * Render contact information item with icon
 */
function renderContactItem(type, value, svgPath) {
  if (!value) return '';
  return `
    <p class="social-item">
      <svg class="social-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="${svgPath}"/>
      </svg>
      ${value}
    </p>
  `;
}

/**
 * Render skills section
 */
function renderSkills(skills) {
  if (!skills || (!skills.skillsList && !Array.isArray(skills))) {
    return '<p>No skills listed</p>';
  }
  
  const skillsList = skills.skillsList || skills;
  
  if (!Array.isArray(skillsList) || skillsList.length === 0) {
    return '<p>No skills listed</p>';
  }
  
  return `
    <ul>
      ${skillsList.map(skill => `<li>${skill}</li>`).join('')}
    </ul>
  `;
}

/**
 * Render education section
 */
function renderEducation(education) {
  if (!education) {
    return '<p>No education listed</p>';
  }
  
  if (Array.isArray(education)) {
    return education.map(edu => `
      <div class="edu-item">
        <h4>${edu.institution || 'University'}</h4>
        <p>${edu.degree || 'Degree'}</p>
        <p>${edu.year || ''}</p>
        ${edu.location ? `<p>${edu.location}</p>` : ''}
      </div>
    `).join('');
  }
  
  return `
    <div class="edu-item">
      <h4>${education.university || 'University'}</h4>
      <p>${education.major || 'Degree'}</p>
      <p>${education.graduationYear || ''}</p>
      ${education.location ? `<p>${education.location}</p>` : ''}
    </div>
  `;
}

/**
 * Render certifications section
 */
function renderCertifications(certifications) {
  if (!certifications || 
      (!certifications.certificationsList && !Array.isArray(certifications)) || 
      (certifications.certificationsList && certifications.certificationsList.length === 0) ||
      (Array.isArray(certifications) && certifications.length === 0)) {
    return '';
  }
  
  const certList = certifications.certificationsList || certifications;
  
  return `
    <div class="section">
      <h3 class="section-title">Certifications</h3>
      ${certList.map(cert => `
        <div class="cert-item">
          <h4>${cert.name || ''}</h4>
          <p>${cert.issuer || ''}${cert.dateReceived ? ` (${cert.dateReceived})` : ''}</p>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render professional summary section
 */
function renderProfessionalSummary(summary) {
  if (!summary || !summary.summaryPoints || !Array.isArray(summary.summaryPoints) || summary.summaryPoints.length === 0) {
    return '';
  }
  
  return `
    <div class="section">
      <h3 class="section-title">Professional Summary</h3>
      <ul class="summary-list">
        ${summary.summaryPoints.map(point => `<li>${point}</li>`).join('')}
      </ul>
    </div>
  `;
}

/**
 * Render experience section
 */
function renderExperience(experience) {
  if (!experience || 
      (!experience.experiences && !Array.isArray(experience)) || 
      (experience.experiences && experience.experiences.length === 0) ||
      (Array.isArray(experience) && experience.length === 0)) {
    return '<p>No experience listed</p>';
  }
  
  const expList = experience.experiences || experience;
  
  return expList.map(exp => `
    <div class="exp-item">
      <h4>${exp.title || ''} at ${exp.company || ''}</h4>
      <p class="exp-meta">
        ${exp.dateRange || ''}
        ${exp.location ? ` | ${exp.location}` : ''}
      </p>
      ${renderAchievements(exp.achievements || exp.description)}
    </div>
  `).join('');
}

/**
 * Render projects section
 */
function renderProjects(projects) {
  if (!projects || 
      (!projects.projectsList && !Array.isArray(projects)) || 
      (projects.projectsList && projects.projectsList.length === 0) ||
      (Array.isArray(projects) && projects.length === 0)) {
    return '';
  }
  
  const projectList = projects.projectsList || projects;
  
  return `
    <div class="section">
      <h3 class="section-title">Projects</h3>
      ${projectList.map(project => `
        <div class="project-item">
          <h4>${project.name || ''}</h4>
          ${project.technologies ? `<p class="project-meta"><strong>Technologies:</strong> ${project.technologies}</p>` : ''}
          ${renderAchievements(project.highlights || project.description)}
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render achievements/descriptions as bullet points
 */
function renderAchievements(achievements) {
  if (!achievements) {
    return '';
  }
  
  if (Array.isArray(achievements)) {
    return `
      <ul>
        ${achievements.map(item => `<li>${item}</li>`).join('')}
      </ul>
    `;
  }
  
  if (typeof achievements === 'string') {
    return `<p>${achievements}</p>`;
  }
  
  return '';
}

/**
 * Create error HTML when resume generation fails
 */
function createErrorHtml(error) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Resume Error</title>
      <style>
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          padding: 20px; 
          line-height: 1.6;
          color: #333;
        }
        .error { 
          color: #e53e3e; 
          margin-bottom: 1rem;
          padding: 1rem;
          border-left: 4px solid #e53e3e;
          background-color: #fff5f5;
        }
        h1 { color: #2d3748; }
      </style>
    </head>
    <body>
      <h1>Resume Generation Error</h1>
      <p class="error">There was an error generating your resume. Please try again or contact support.</p>
      <p>Error details: ${error instanceof Error ? error.message : String(error)}</p>
    </body>
    </html>
  `;
}

/**
 * Public API
 */
export default {
  generateResumeHtml
}; 