export const resumeTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Resume</title>
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
    
    /* Section styling */
    section {
      margin-bottom: 1.25rem;
    }
    
    h2 {
      font-size: 18px;
      border-bottom: 2px solid #666;
      margin-bottom: 0.75rem;
      padding-bottom: 0.25rem;
    }
    
    /* Lists */
    ul {
      list-style-type: disc;
      padding-left: 1.5em;
      margin-left: 0;
    }
    
    li {
      text-indent: -0.5em;
      padding-left: 0.5em;
      margin-bottom: 0.5em;
    }
    
    /* Work experience and projects */
    .work-item, .project-item {
      margin-bottom: 1rem;
    }
    
    .work-item h3, .project-item h3 {
      font-size: 16px;
      margin-bottom: 0.25rem;
    }
    
    .company-line {
      font-style: italic;
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
      background: #f5f5f5;
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      font-size: 14px;
    }
    
    /* Education section */
    .education-item {
      margin-bottom: 1rem;
    }
    
    .education-item h3 {
      font-size: 16px;
      margin-bottom: 0.25rem;
    }
    
    /* Certifications */
    .certification-item {
      margin-bottom: 0.75rem;
    }
  </style>
</head>
<body>
  <!-- Header Section -->
  <header class="header">
    <h1>{{fullName}}</h1>
    <div class="contact-info">
      {{email}} • {{phone}}{{#if location}} • {{location}}{{/if}}
      {{#if links}}
      <br>
      {{#each links}}
      {{#if this}}{{@key}}: {{this}}{{#unless @last}} • {{/unless}}{{/if}}
      {{/each}}
      {{/if}}
    </div>
  </header>

  <!-- Professional Summary -->
  <section id="summary">
    <h2>Professional Summary</h2>
    <ul>
      {{#each summary}}
      <li>{{this}}</li>
      {{/each}}
    </ul>
  </section>

  <!-- Skills -->
  <section id="skills">
    <h2>Technical Skills</h2>
    <div class="skills-list">
      {{#each skills}}
      <span class="skill-item">{{this}}</span>
      {{/each}}
    </div>
  </section>

  <!-- Work Experience -->
  <section id="experience">
    <h2>Professional Experience</h2>
    {{#each experiences}}
    <div class="work-item">
      <h3>{{title}}</h3>
      <div class="company-line">
        {{company}}{{#if location}} • {{location}}{{/if}} • {{dateRange}}
      </div>
      <ul>
        {{#each achievements}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
    {{/each}}
  </section>

  <!-- Projects -->
  {{#if projects}}
  <section id="projects">
    <h2>Projects</h2>
    {{#each projects}}
    <div class="project-item">
      <h3>{{name}}</h3>
      <div class="company-line">Technologies: {{technologies}}</div>
      <ul>
        {{#each achievements}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
    {{/each}}
  </section>
  {{/if}}

  <!-- Education -->
  <section id="education">
    <h2>Education</h2>
    <div class="education-item">
      <h3>{{education.university}}</h3>
      <div class="company-line">
        {{education.major}}{{#if education.graduationYear}} • Expected Graduation: {{education.graduationYear}}{{/if}}
      </div>
    </div>
  </section>

  <!-- Certifications -->
  {{#if certifications}}
  <section id="certifications">
    <h2>Certifications</h2>
    {{#each certifications}}
    <div class="certification-item">
      <h3>{{name}}</h3>
      <div class="company-line">{{issuer}}{{#if dateReceived}} • {{dateReceived}}{{/if}}</div>
    </div>
    {{/each}}
  </section>
  {{/if}}
</body>
</html>
`; 