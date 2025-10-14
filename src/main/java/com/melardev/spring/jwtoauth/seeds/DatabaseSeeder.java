package com.melardev.spring.jwtoauth.seeds;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

import com.melardev.spring.jwtoauth.entities.ApplicationStatus;
import com.melardev.spring.jwtoauth.entities.CV;
import com.melardev.spring.jwtoauth.entities.Company;
import com.melardev.spring.jwtoauth.entities.ERole;
import com.melardev.spring.jwtoauth.entities.EmployerProfile;
import com.melardev.spring.jwtoauth.entities.Job;
import com.melardev.spring.jwtoauth.entities.JobApplication;
import com.melardev.spring.jwtoauth.entities.JobMatch;
import com.melardev.spring.jwtoauth.entities.Role;
import com.melardev.spring.jwtoauth.entities.StudentProfile;
import com.melardev.spring.jwtoauth.entities.User;
import com.melardev.spring.jwtoauth.repositories.CVRepository;
import com.melardev.spring.jwtoauth.repositories.CompanyRepository;
import com.melardev.spring.jwtoauth.repositories.EmployerProfileRepository;
import com.melardev.spring.jwtoauth.repositories.JobApplicationRepository;
import com.melardev.spring.jwtoauth.repositories.JobRepository;
import com.melardev.spring.jwtoauth.repositories.RoleRepository;
import com.melardev.spring.jwtoauth.repositories.StudentProfileRepository;
import com.melardev.spring.jwtoauth.repositories.UserRepository;

@Component
@Profile("!test") // Don't run this seeder in test profile
public class DatabaseSeeder implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private EmployerProfileRepository employerProfileRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CVRepository cvRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;
    
    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private PlatformTransactionManager transactionManager;

    @Override
    public void run(String... args) throws Exception {
        try {
            TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
            
            // Start with roles and users which are essential
            seedRoles();
            seedUsers();
            
            // Use separate transactions for the rest to isolate failures
            transactionTemplate.execute(new TransactionCallbackWithoutResult() {
                @Override
                protected void doInTransactionWithoutResult(TransactionStatus status) {
                    try {
                        seedProfiles();
                    } catch (Exception e) {
                        logger.error("Error seeding profiles: {}", e.getMessage());
                        status.setRollbackOnly();
                    }
                }
            });
            
            transactionTemplate.execute(new TransactionCallbackWithoutResult() {
                @Override
                protected void doInTransactionWithoutResult(TransactionStatus status) {
                    try {
                        seedCompanies();
                    } catch (Exception e) {
                        logger.error("Error seeding companies: {}", e.getMessage());
                        status.setRollbackOnly();
                    }
                }
            });
            
            transactionTemplate.execute(new TransactionCallbackWithoutResult() {
                @Override
                protected void doInTransactionWithoutResult(TransactionStatus status) {
                    try {
                        seedJobs();
                    } catch (Exception e) {
                        logger.error("Error seeding jobs: {}", e.getMessage());
                        status.setRollbackOnly();
                    }
                }
            });
            
            transactionTemplate.execute(new TransactionCallbackWithoutResult() {
                @Override
                protected void doInTransactionWithoutResult(TransactionStatus status) {
                    try {
                        seedApplications();
                    } catch (Exception e) {
                        logger.error("Error seeding applications: {}", e.getMessage());
                        status.setRollbackOnly();
                    }
                }
            });
            
            transactionTemplate.execute(new TransactionCallbackWithoutResult() {
                @Override
                protected void doInTransactionWithoutResult(TransactionStatus status) {
                    try {
                        seedJobMatches();
                    } catch (Exception e) {
                        logger.error("Error seeding job matches: {}", e.getMessage());
                        status.setRollbackOnly();
                    }
                }
            });
            
            logger.info("Database seeding completed successfully");
        } catch (Exception e) {
            logger.error("Error during database seeding: {}", e.getMessage());
            // Don't rethrow the exception to allow the application to start
        }
    }

    private void seedRoles() {
        try {
            if (roleRepository.count() == 0) {
                logger.info("Seeding roles");
                Role studentRole = new Role(ERole.ROLE_STUDENT);
                Role nloRole = new Role(ERole.ROLE_NLO);
                Role adminRole = new Role(ERole.ROLE_ADMIN);

                roleRepository.saveAll(Arrays.asList(studentRole, nloRole, adminRole));
            }
        } catch (DataAccessException e) {
            logger.warn("Could not seed roles: {}", e.getMessage());
        }
    }

    private void seedUsers() {
        try {
            if (userRepository.count() == 0) {
                logger.info("Seeding users");
                // Create admin user
                User adminUser = new User("admin", "admin@ojtech.com", passwordEncoder.encode("password"));
                Role adminRole = getOrCreateRole(ERole.ROLE_ADMIN);
                adminUser.getRoles().add(adminRole);
                adminUser.setEmailVerified(true);
                adminUser.setRequiresPasswordReset(true); // Force password reset on first login
                userRepository.save(adminUser);

                // Create student users
                Role studentRole = getOrCreateRole(ERole.ROLE_STUDENT);
                
                User student1 = new User("student", "student@ojtech.com", passwordEncoder.encode("password"));
                student1.setEmailVerified(true);
                student1.getRoles().add(studentRole);
                userRepository.save(student1);
                
                User student2 = new User("jane.doe", "jane.doe@ojtech.com", passwordEncoder.encode("password"));
                student2.setEmailVerified(true);
                student2.getRoles().add(studentRole);
                userRepository.save(student2);
                
                User student3 = new User("michael.smith", "michael.smith@ojtech.com", passwordEncoder.encode("password"));
                student3.setEmailVerified(true);
                student3.getRoles().add(studentRole);
                userRepository.save(student3);
                
                User student4 = new User("sarah.johnson", "sarah.johnson@ojtech.com", passwordEncoder.encode("password"));
                student4.setEmailVerified(true);
                student4.getRoles().add(studentRole);
                userRepository.save(student4);

                // Create NLO Staff user (using ROLE_NLO for NLO Staff functionality)
                User nloUser = new User("nlo_staff", "nlo@ojtech.com", passwordEncoder.encode("password"));
                nloUser.setEmailVerified(true);
                nloUser.setRequiresPasswordReset(false); // NLO staff don't need onboarding
                Role nloRole = getOrCreateRole(ERole.ROLE_NLO);
                nloUser.getRoles().add(nloRole);
                userRepository.save(nloUser);
            }
        } catch (DataAccessException e) {
            logger.warn("Could not seed users: {}", e.getMessage());
        }
    }

    private Role getOrCreateRole(ERole roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role(roleName);
                    return roleRepository.save(newRole);
                });
    }

    private void seedProfiles() {
        try {
            // Check if tables exist before attempting to seed
            try {
                studentProfileRepository.count();
                employerProfileRepository.count();
            } catch (DataAccessException e) {
                logger.warn("Student or employer profiles tables do not exist yet. Skipping profile seeding.");
                return;
            }
            
            if (studentProfileRepository.count() == 0 && employerProfileRepository.count() == 0) {
                logger.info("Seeding profiles");
                
                // Create student profiles
                createStudentProfile(
                    "student",
                    "John", "Doe",
                    "Example University",
                    "Computer Science",
                    2024,
                    "123-456-7890",
                    "A passionate student looking for opportunities in software development",
                    "Java,Spring Boot,React",
                    "https://github.com/johndoe",
                    "https://linkedin.com/in/johndoe",
                    "https://johndoe.com"
                );
                
                createStudentProfile(
                    "jane.doe",
                    "Jane", "Doe",
                    "Tech University",
                    "Data Science",
                    2023,
                    "123-456-7891",
                    "Data scientist with experience in machine learning and data visualization",
                    "Python,R,TensorFlow,SQL,Tableau",
                    "https://github.com/janedoe",
                    "https://linkedin.com/in/janedoe",
                    "https://janedoe.com"
                );
                
                createStudentProfile(
                    "michael.smith",
                    "Michael", "Smith",
                    "State University",
                    "Information Technology",
                    2025,
                    "123-456-7892",
                    "IT specialist with focus on cybersecurity and network administration",
                    "Network Security,Linux,AWS,Docker,Kubernetes",
                    "https://github.com/michaelsmith",
                    "https://linkedin.com/in/michaelsmith",
                    "https://michaelsmith.com"
                );
                
                createStudentProfile(
                    "sarah.johnson",
                    "Sarah", "Johnson",
                    "National University",
                    "Software Engineering",
                    2024,
                    "123-456-7893",
                    "Frontend developer with passion for creating beautiful user experiences",
                    "HTML,CSS,JavaScript,React,Vue.js,UI/UX Design",
                    "https://github.com/sarahjohnson",
                    "https://linkedin.com/in/sarahjohnson",
                    "https://sarahjohnson.com"
                );

                // Create NLO Staff profile
                User nloUser = userRepository.findByUsername("nlo_staff")
                        .orElseThrow(() -> new RuntimeException("NLO user not found"));
                
                EmployerProfile nloProfile = new EmployerProfile();
                nloProfile.setUser(nloUser);
                nloProfile.setFullName("NLO Staff");
                nloProfile.setCompanyName("Networking and Linkages Office");
                nloProfile.setCompanySize("10-50");
                nloProfile.setIndustry("Education");
                nloProfile.setLocation("University Campus");
                nloProfile.setCompanyDescription("Manages partner companies and job opportunities for students");
                nloProfile.setWebsiteUrl("https://university.edu/nlo");
                nloProfile.setLogoUrl("https://example.com/nlo-logo.png");
                nloProfile.setHasCompletedOnboarding(true);
                
                // Add contact person information
                nloProfile.setContactPersonName("NLO Administrator");
                nloProfile.setContactPersonPosition("Linkages Officer");
                nloProfile.setContactPersonEmail("moronaldrin3@gmail.com");
                nloProfile.setContactPersonPhone("555-123-4567");
                
                employerProfileRepository.save(nloProfile);
            }
        } catch (DataAccessException e) {
            logger.warn("Could not seed profiles: {}", e.getMessage());
        }
    }
    
    private StudentProfile createStudentProfile(String username, String firstName, String lastName, 
                                             String university, String major, int graduationYear,
                                             String phoneNumber, String bio, String skills,
                                             String githubUrl, String linkedinUrl, String portfolioUrl) {
    try {
        User studentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        StudentProfile studentProfile = new StudentProfile();
        studentProfile.setUser(studentUser);
        studentProfile.setFullName(firstName + " " + lastName);
        studentProfile.setFirstName(firstName);
        studentProfile.setLastName(lastName);
        studentProfile.setEmail(studentUser.getEmail()); // Set email from user
        studentProfile.setUniversity(university);
        studentProfile.setMajor(major);
        studentProfile.setGraduationYear(graduationYear);
        studentProfile.setPhoneNumber(phoneNumber);
        studentProfile.setBio(bio);
        studentProfile.setGithubUrl(githubUrl);
        studentProfile.setLinkedinUrl(linkedinUrl);
        studentProfile.setPortfolioUrl(portfolioUrl);
        studentProfile.setSkills(skills);
        studentProfile.setAvatarUrl("https://example.com/avatar-" + username + ".jpg");
        studentProfile.setHasCompletedOnboarding(true);
        studentProfileRepository.save(studentProfile);
        
        // Create CV for student
        try {
            CV cv = new CV();
            cv.setStudent(studentProfile);
            cv.setActive(true);
            cv.setGenerated(true);
            cv.setLastUpdated(LocalDateTime.now());
            cv.setParsedResume("{\"seedData\": true, \"name\": \"" + firstName + " " + lastName + 
                              "\", \"skills\": \"" + skills + "\", \"education\": \"" + university + 
                              "\", \"major\": \"" + major + "\", \"graduationYear\": " + graduationYear + "}");
            
            CV savedCV = cvRepository.save(cv);
            
            if (savedCV != null && savedCV.getId() != null) {
                studentProfile.setActiveCvId(savedCV.getId());
                studentProfileRepository.save(studentProfile);
                logger.info("Successfully created CV for {}", username);
            }
        } catch (Exception e) {
            logger.warn("Could not create CV for {}: {}", username, e.getMessage());
        }
        
        return studentProfile;
    } catch (Exception e) {
        logger.warn("Could not create student profile for {}: {}", username, e.getMessage());
        return null;
    }
}
    
    private void seedCompanies() {
        try {
            // Check if company table exists before attempting to seed
            try {
                companyRepository.count();
            } catch (DataAccessException e) {
                logger.warn("Companies table does not exist yet. Skipping company seeding.");
                return;
            }
            
            if (companyRepository.count() == 0) {
                logger.info("Seeding companies");
                
                // Get NLO profile
                User nloUser = userRepository.findByUsername("nlo_staff")
                        .orElseThrow(() -> new RuntimeException("NLO user not found"));
                EmployerProfile nloProfile = employerProfileRepository.findByUserId(nloUser.getId())
                        .orElseThrow(() -> new RuntimeException("NLO profile not found"));
                
                // Create sample companies
                Company company1 = new Company();
                company1.setName("Alliance Software Inc.");
                company1.setWebsite("https://alliancesoftware.com");
                company1.setDescription("Leading software development company specializing in enterprise solutions");
                company1.setLocation("Cebu City, Philippines");
                company1.setEmail("hr@alliancesoftware.com");
                company1.setPhone("+63-32-123-4567");
                company1.setIndustry("Information Technology");
                company1.setCompanySize("100-500");
                company1.setLogoUrl("https://example.com/alliance-logo.png");
                company1.setCreatedByNLO(nloProfile);
                company1.setActive(true);
                companyRepository.save(company1);
                
                Company company2 = new Company();
                company2.setName("TechVenture Solutions");
                company2.setWebsite("https://techventure.com");
                company2.setDescription("Innovative startup focused on AI and machine learning solutions");
                company2.setLocation("Manila, Philippines");
                company2.setEmail("careers@techventure.com");
                company2.setPhone("+63-2-987-6543");
                company2.setIndustry("Artificial Intelligence");
                company2.setCompanySize("50-100");
                company2.setLogoUrl("https://example.com/techventure-logo.png");
                company2.setCreatedByNLO(nloProfile);
                company2.setActive(true);
                companyRepository.save(company2);
                
                Company company3 = new Company();
                company3.setName("Digital Marketing Pro");
                company3.setWebsite("https://digitalmarketingpro.com");
                company3.setDescription("Full-service digital marketing agency helping businesses grow online");
                company3.setLocation("Davao City, Philippines");
                company3.setEmail("jobs@digitalmarketingpro.com");
                company3.setPhone("+63-82-456-7890");
                company3.setIndustry("Marketing & Advertising");
                company3.setCompanySize("20-50");
                company3.setLogoUrl("https://example.com/dmp-logo.png");
                company3.setCreatedByNLO(nloProfile);
                company3.setActive(true);
                companyRepository.save(company3);
                
                logger.info("Successfully seeded {} companies", 3);
            }
        } catch (DataAccessException e) {
            logger.warn("Could not seed companies: {}", e.getMessage());
        }
    }

    private void seedJobs() {
        try {
            // Check if job table exists before attempting to seed
            try {
                jobRepository.count();
            } catch (DataAccessException e) {
                logger.warn("Jobs table does not exist yet. Skipping job seeding.");
                return;
            }
            
            if (jobRepository.count() == 0) {
                logger.info("Seeding jobs");
                List<EmployerProfile> employers = employerProfileRepository.findAll();
                if (employers.isEmpty()) {
                    return; // Skip if no employers exist
                }
                
                EmployerProfile employer = employers.get(0);

                Job job1 = new Job();
                job1.setEmployer(employer);
                job1.setTitle("Software Engineer");
                job1.setDescription("We are looking for a skilled software engineer to join our team. " +
                                   "The ideal candidate will have experience with Java, Spring Boot, and React. " +
                                   "Responsibilities include developing new features, maintaining existing code, " +
                                   "and collaborating with the product team.");
                job1.setLocation("San Francisco, CA");
                job1.setRequiredSkills("Java,Spring Boot,React");
                job1.setEmploymentType("Full-time");
                job1.setMinSalary(80000.0);
                job1.setMaxSalary(120000.0);
                job1.setCurrency("USD");
                job1.setPostedAt(LocalDateTime.now());
                job1.setActive(true);
                jobRepository.save(job1);

                Job job2 = new Job();
                job2.setEmployer(employer);
                job2.setTitle("Frontend Developer");
                job2.setDescription("Join our team as a frontend developer working with React. " +
                                   "You will be responsible for implementing visual elements and user interactions " +
                                   "that users see and interact with in a web application.");
                job2.setLocation("Remote");
                job2.setRequiredSkills("HTML,CSS,JavaScript,React");
                job2.setEmploymentType("Full-time");
                job2.setMinSalary(70000.0);
                job2.setMaxSalary(100000.0);
                job2.setCurrency("USD");
                job2.setPostedAt(LocalDateTime.now().minusDays(5));
                job2.setActive(true);
                jobRepository.save(job2);
                
                Job job3 = new Job();
                job3.setEmployer(employer);
                job3.setTitle("Data Scientist");
                job3.setDescription("We're seeking a data scientist to help us make data-driven decisions. " +
                                   "You'll work with large datasets, build machine learning models, and " +
                                   "communicate insights to stakeholders.");
                job3.setLocation("New York, NY");
                job3.setRequiredSkills("Python,R,SQL,Machine Learning,Statistics");
                job3.setEmploymentType("Full-time");
                job3.setMinSalary(90000.0);
                job3.setMaxSalary(130000.0);
                job3.setCurrency("USD");
                job3.setPostedAt(LocalDateTime.now().minusDays(3));
                job3.setActive(true);
                jobRepository.save(job3);
                
                Job job4 = new Job();
                job4.setEmployer(employer);
                job4.setTitle("DevOps Engineer");
                job4.setDescription("Looking for a DevOps engineer to help us build and maintain our " +
                                   "cloud infrastructure. Experience with AWS, Docker, and Kubernetes required.");
                job4.setLocation("Remote");
                job4.setRequiredSkills("AWS,Docker,Kubernetes,CI/CD,Linux");
                job4.setEmploymentType("Full-time");
                job4.setMinSalary(85000.0);
                job4.setMaxSalary(125000.0);
                job4.setCurrency("USD");
                job4.setPostedAt(LocalDateTime.now().minusDays(7));
                job4.setActive(true);
                jobRepository.save(job4);
            }
        } catch (DataAccessException e) {
            logger.warn("Could not seed jobs: {}", e.getMessage());
        }
    }

    private void seedApplications() {
        try {
            // Check if job application and CV tables exist before attempting to seed
            try {
                jobApplicationRepository.count();
                cvRepository.count();
            } catch (DataAccessException e) {
                logger.warn("Job applications or CV table does not exist yet. Skipping applications seeding.");
                return;
            }
            
            if (jobApplicationRepository.count() == 0) {
                logger.info("Seeding job applications");
                List<StudentProfile> students = studentProfileRepository.findAll();
                List<Job> jobs = jobRepository.findAll();
                
                if (students.isEmpty() || jobs.isEmpty()) {
                    logger.warn("No students or jobs found, skipping application seeding.");
                    return; // Skip if no students or jobs exist
                }
                
                // Create applications for each student
                if (students.size() >= 1 && jobs.size() >= 1) {
                    createJobApplication(students.get(0), jobs.get(0), ApplicationStatus.PENDING,
                        "I am very interested in this Software Engineer position and believe my skills in Java and Spring Boot make me a great match. " +
                        "I have completed several projects using these technologies during my time at Example University.");
                }
                
                if (students.size() >= 2 && jobs.size() >= 2) {
                    createJobApplication(students.get(1), jobs.get(2), ApplicationStatus.PENDING,
                        "As a Data Science major with experience in Python and machine learning, I am excited about the opportunity to join your team. " +
                        "My research projects at Tech University have prepared me well for this role.");
                }
                
                if (students.size() >= 3 && jobs.size() >= 3) {
                    createJobApplication(students.get(2), jobs.get(3), ApplicationStatus.INTERVIEW,
                        "I am applying for the DevOps Engineer position. With my background in IT and focus on cloud technologies, " +
                        "I believe I can contribute significantly to your infrastructure needs. I have hands-on experience with AWS and Docker.");
                }
                
                if (students.size() >= 4 && jobs.size() >= 1) {
                    createJobApplication(students.get(3), jobs.get(1), ApplicationStatus.PENDING,
                        "I'm excited to apply for the Frontend Developer position. My portfolio showcases my skills in creating " +
                        "responsive and user-friendly interfaces using React and other modern frontend technologies.");
                }
                
                // Cross applications - students applying to multiple jobs
                if (students.size() >= 1 && jobs.size() >= 2) {
                    createJobApplication(students.get(0), jobs.get(1), ApplicationStatus.REJECTED,
                        "I would like to apply for the Frontend Developer position. While my primary experience is in backend development, " +
                        "I have been working on improving my frontend skills with React and would welcome the opportunity to grow in this area.");
                }
                
                if (students.size() >= 2 && jobs.size() >= 1) {
                    createJobApplication(students.get(1), jobs.get(0), ApplicationStatus.INTERVIEW,
                        "I am interested in the Software Engineer position at your company. Although my background is in Data Science, " +
                        "I have strong programming skills in Java and have completed several full-stack projects.");
                }
            }
        } catch (DataAccessException e) {
            logger.warn("Could not seed applications: {}", e.getMessage());
        }
    }
    
    private void createJobApplication(StudentProfile student, Job job, ApplicationStatus status, String coverLetter) {
        try {
            // Find CV by student's activeCvId
            CV cv = null;
            if (student.getActiveCvId() != null) {
                try {
                    cv = cvRepository.findById(student.getActiveCvId()).orElse(null);
                } catch (Exception e) {
                    logger.warn("Could not find CV by ID for {}: {}", student.getFullName(), e.getMessage());
                }
            }
            
            // If CV not found, create a new one
            if (cv == null) {
                try {
                    cv = new CV();
                    cv.setStudent(student);
                    cv.setActive(true);
                    cv.setGenerated(true);
                    cv.setLastUpdated(LocalDateTime.now());
                    cv.setParsedResume("{\"seedData\": true, \"name\": \"" + student.getFullName() + 
                                      "\", \"skills\": \"" + student.getSkills() + 
                                      "\", \"education\": \"" + student.getUniversity() + 
                                      "\", \"major\": \"" + student.getMajor() + 
                                      "\", \"graduationYear\": " + student.getGraduationYear() + "}");
                    cv = cvRepository.save(cv);
                    
                    student.setActiveCvId(cv.getId());
                    studentProfileRepository.save(student);
                } catch (Exception e) {
                    logger.warn("Could not create CV for application: {}", e.getMessage());
                    return;
                }
            }
            
            // Create the job application
            JobApplication application = new JobApplication();
            application.setStudent(student);
            application.setJob(job);
            application.setCv(cv);
            application.setCoverLetter(coverLetter);
            application.setStatus(status);
            
            // Set different dates based on status
            LocalDateTime now = LocalDateTime.now();
            application.setAppliedAt(now.minusDays(7));
            
            if (status == ApplicationStatus.INTERVIEW) {
                application.setLastUpdatedAt(now.minusDays(2));
            } else if (status == ApplicationStatus.REJECTED) {
                application.setLastUpdatedAt(now.minusDays(1));
            } else {
                application.setLastUpdatedAt(now.minusDays(7));
            }
            
            jobApplicationRepository.save(application);
            logger.info("Created job application for {} to {}", student.getFullName(), job.getTitle());
        } catch (Exception e) {
            logger.warn("Could not create job application: {}", e.getMessage());
        }
    }

    private void seedJobMatches() {
        try {
            List<StudentProfile> students = studentProfileRepository.findAll();
            List<Job> jobs = jobRepository.findAll();
            
            if (students.isEmpty() || jobs.isEmpty()) {
                logger.warn("No students or jobs found, skipping job match seeding.");
                return;
            }
            
            // Create job matches for existing applications
            List<JobApplication> applications = jobApplicationRepository.findAll();
            for (JobApplication application : applications) {
                // Calculate match score based on skills
                double matchScore = calculateMatchScore(application.getStudent(), application.getJob());
                
                // Create job match
                JobMatch jobMatch = new JobMatch();
                jobMatch.setStudent(application.getStudent());
                jobMatch.setJob(application.getJob());
                jobMatch.setMatchScore(matchScore);
                jobMatch.setMatchedAt(LocalDateTime.now().minusDays(8)); // Before applications
                jobMatch.setMatchDetails("AI-generated match based on skills analysis");
                jobMatch.setDetailedAnalysis(generateDetailedAnalysis(application.getStudent(), application.getJob(), matchScore));
                
                // Save the job match
                application.getStudent().addJobMatch(jobMatch);
                application.getJob().addJobMatch(jobMatch);
                
                // No need to explicitly save the job match as it will be saved through the cascade
                studentProfileRepository.save(application.getStudent());
                
                logger.info("Created job match for {} with job {}: Score {}", 
                    application.getStudent().getFullName(), 
                    application.getJob().getTitle(), 
                    String.format("%.1f", matchScore));
            }
        } catch (Exception e) {
            logger.warn("Could not seed job matches: {}", e.getMessage());
        }
    }
    
    private double calculateMatchScore(StudentProfile student, Job job) {
        if (student == null || job == null) {
            return 0.0;
        }
        
        String studentSkills = student.getSkills();
        String jobSkills = job.getRequiredSkills();
        
        if (studentSkills == null || jobSkills == null) {
            return 0.0;
        }
        
        // Simple skill matching algorithm
        String[] studentSkillsArray = studentSkills.split(",");
        String[] jobSkillsArray = jobSkills.split(",");
        
        int matchCount = 0;
        for (String studentSkill : studentSkillsArray) {
            for (String jobSkill : jobSkillsArray) {
                if (studentSkill.trim().equalsIgnoreCase(jobSkill.trim())) {
                    matchCount++;
                    break;
                }
            }
        }
        
        // Calculate score as percentage of matched skills out of required skills
        double matchPercentage = jobSkillsArray.length > 0 ? 
            (double) matchCount / jobSkillsArray.length * 100.0 : 0.0;
            
        // Add some randomness to make it more realistic (±10%)
        double randomFactor = 0.9 + Math.random() * 0.2; // Between 0.9 and 1.1
        matchPercentage *= randomFactor;
        
        // Cap at 100%
        return Math.min(matchPercentage, 100.0);
    }
    
    private String generateDetailedAnalysis(StudentProfile student, Job job, double matchScore) {
        StringBuilder analysis = new StringBuilder();
        analysis.append("Match Analysis for ").append(student.getFullName()).append(" and ").append(job.getTitle()).append(":\n\n");
        
        // Skills comparison
        analysis.append("Skills Analysis:\n");
        if (student.getSkills() != null && job.getRequiredSkills() != null) {
            String[] studentSkills = student.getSkills().split(",");
            String[] jobSkills = job.getRequiredSkills().split(",");
            
            analysis.append("- Student skills: ").append(student.getSkills()).append("\n");
            analysis.append("- Required job skills: ").append(job.getRequiredSkills()).append("\n\n");
            
            analysis.append("Matched Skills:\n");
            for (String studentSkill : studentSkills) {
                String trimmedStudentSkill = studentSkill.trim();
                boolean matched = false;
                for (String jobSkill : jobSkills) {
                    if (trimmedStudentSkill.equalsIgnoreCase(jobSkill.trim())) {
                        analysis.append("- ").append(trimmedStudentSkill).append(" ✓\n");
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    analysis.append("- ").append(trimmedStudentSkill).append(" (additional skill)\n");
                }
            }
            
            analysis.append("\nMissing Skills:\n");
            for (String jobSkill : jobSkills) {
                String trimmedJobSkill = jobSkill.trim();
                boolean found = false;
                for (String studentSkill : studentSkills) {
                    if (trimmedJobSkill.equalsIgnoreCase(studentSkill.trim())) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    analysis.append("- ").append(trimmedJobSkill).append(" ✗\n");
                }
            }
        }
        
        // Education analysis
        analysis.append("\nEducation Analysis:\n");
        analysis.append("- University: ").append(student.getUniversity()).append("\n");
        analysis.append("- Major: ").append(student.getMajor()).append("\n");
        analysis.append("- Graduation Year: ").append(student.getGraduationYear()).append("\n");
        
        // Overall match score
        analysis.append("\nOverall Match Score: ").append(String.format("%.1f", matchScore)).append("%\n");
        analysis.append("Recommendation: ");
        if (matchScore >= 80) {
            analysis.append("Strong match! Consider for immediate interview.");
        } else if (matchScore >= 60) {
            analysis.append("Good match. Worth considering for an interview.");
        } else if (matchScore >= 40) {
            analysis.append("Moderate match. May need additional skills or experience.");
        } else {
            analysis.append("Low match. Candidate may not meet the core requirements for this position.");
        }
        
        return analysis.toString();
    }
} 