export const CV_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Professional Resume</title>
  <style>
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.75in;
      background: white;
    }
    
    /* Print optimization */
    @media print {
      body {
        padding: 0;
      }
      
      section, .section {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      @page {
        margin: 0.75in;
      }
    }
    
    /* Header */
    .header {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    
    .header h1 {
      font-size: 24px;
      margin-bottom: 0.5rem;
    }
    
    .contact-info {
      font-size: 14px;
      color: #666;
    }
    
    /* Section styles */
    section {
      margin-bottom: 1.25rem;
    }
    
    h2 {
      font-size: 18px;
      border-bottom: 2px solid #eee;
      padding-bottom: 0.25rem;
      margin-bottom: 0.75rem;
      color: #2c3e50;
    }
    
    /* Lists */
    ul {
      list-style-position: outside;
      padding-left: 1.5rem;
      margin-left: 0;
    }
    
    li {
      margin-bottom: 0.5rem;
      text-indent: -0.5rem;
      padding-left: 0.5rem;
    }
    
    /* Work experience and projects */
    .work-item, .project-item {
      margin-bottom: 1rem;
    }
    
    .work-item h3, .project-item h3 {
      font-size: 16px;
      margin-bottom: 0.25rem;
    }
    
    .work-meta, .project-meta {
      font-size: 14px;
      color: #666;
      margin-bottom: 0.5rem;
    }
    
    /* Skills section */
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .skill-item {
      background: #f8f9fa;
      padding: 0.25rem 0.75rem;
      border-radius: 3px;
      font-size: 14px;
    }
    
    /* Education */
    .education-item {
      margin-bottom: 1rem;
    }
    
    .education-item h3 {
      font-size: 16px;
      margin-bottom: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{fullName}}</h1>
    <div class="contact-info">
      {{email}} • {{phone}}{{#location}} • {{location}}{{/location}}
    </div>
    <div class="contact-info">
      {{#githubUrl}}GitHub: {{githubUrl}}{{/githubUrl}}
      {{#linkedinUrl}} • LinkedIn: {{linkedinUrl}}{{/linkedinUrl}}
      {{#portfolioUrl}} • Portfolio: {{portfolioUrl}}{{/portfolioUrl}}
    </div>
  </div>

  {{#professionalSummary}}
  <section class="summary-section">
    <h2>Professional Summary</h2>
    <ul>
      {{#summaryPoints}}
      <li>{{.}}</li>
      {{/summaryPoints}}
    </ul>
  </section>
  {{/professionalSummary}}

  {{#skills}}
  <section class="skills-section">
    <h2>Technical Skills</h2>
    <div class="skills-list">
      {{#skillsList}}
      <span class="skill-item">{{.}}</span>
      {{/skillsList}}
    </div>
  </section>
  {{/skills}}

  {{#experience}}
  <section class="experience-section">
    <h2>Professional Experience</h2>
    {{#experiences}}
    <div class="work-item">
      <h3>{{title}}</h3>
      <div class="work-meta">
        {{company}}{{#location}} • {{location}}{{/location}} • {{dateRange}}
      </div>
      <ul>
        {{#achievements}}
        <li>{{.}}</li>
        {{/achievements}}
      </ul>
    </div>
    {{/experiences}}
  </section>
  {{/experience}}

  {{#projects}}
  <section class="projects-section">
    <h2>Projects</h2>
    {{#projectsList}}
    <div class="project-item">
      <h3>{{name}}</h3>
      <div class="project-meta">
        {{#technologies}}Technologies: {{.}}{{/technologies}}
      </div>
      <ul>
        {{#highlights}}
        <li>{{.}}</li>
        {{/highlights}}
      </ul>
    </div>
    {{/projectsList}}
  </section>
  {{/projects}}

  {{#education}}
  <section class="education-section">
    <h2>Education</h2>
    <div class="education-item">
      <h3>{{university}}</h3>
      <div class="work-meta">
        {{major}}{{#graduationYear}} • Expected Graduation: {{graduationYear}}{{/graduationYear}}
      </div>
    </div>
  </section>
  {{/education}}

  {{#certifications}}
  <section class="certifications-section">
    <h2>Certifications</h2>
    {{#certificationsList}}
    <div class="work-item">
      <h3>{{name}}</h3>
      <div class="work-meta">
        {{issuer}}{{#dateReceived}} • {{dateReceived}}{{/dateReceived}}
      </div>
    </div>
    {{/certificationsList}}
  </section>
  {{/certifications}}
</body>
</html>
`; 