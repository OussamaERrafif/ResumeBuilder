/**
 * @fileoverview Testing utilities and helper functions
 * Production-ready testing setup for React components
 */

// Mock data for testing
export const mockResumeData = {
  personalInfo: {
    name: "John Doe",
    title: "Software Engineer",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    summary: "Experienced software engineer with 5+ years of experience in full-stack development. Passionate about creating scalable web applications and leading technical teams.",
    linkedin: "https://linkedin.com/in/johndoe",
    website: "https://johndoe.dev"
  },
  experience: [
    {
      id: "1",
      jobTitle: "Senior Software Engineer",
      company: "Tech Corp",
      date: "2021 - Present",
      startDate: "2021-01",
      endDate: "",
      location: "San Francisco, CA",
      responsibilities: "Led development of microservices architecture serving 1M+ users. Built React-based admin dashboard with 40% improved performance. Mentored 3 junior developers and conducted technical interviews.",
      achievements: [
        "Reduced API response time by 60%",
        "Implemented CI/CD pipeline reducing deployment time by 80%",
        "Led migration to cloud infrastructure"
      ]
    }
  ],
  education: [
    {
      id: "1",
      degree: "Bachelor of Science in Computer Science",
      school: "University of California, Berkeley",
      date: "2015 - 2019",
      startDate: "2015-08",
      endDate: "2019-05",
      location: "Berkeley, CA",
      gpa: "3.8",
      honors: ["Summa Cum Laude", "Dean's List"],
      relevantCourses: ["Data Structures", "Algorithms", "Software Engineering", "Database Systems"]
    }
  ],
  skills: {
    technical: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "PostgreSQL", "Docker", "AWS"],
    languages: "JavaScript, TypeScript, Python, SQL",
    frameworks: "React, Next.js, Express.js, FastAPI",
    tools: "Git, Docker, AWS, PostgreSQL, MongoDB",
    other: "Agile, Scrum, Technical Leadership, Code Review",
    soft: ["Leadership", "Communication", "Problem Solving", "Team Collaboration"]
  },
  projects: [
    {
      id: "1",
      name: "Resume Builder Pro",
      description: "A comprehensive resume builder application with AI-powered content suggestions and multiple export formats.",
      technologies: "React, TypeScript, Next.js, TailwindCSS, Supabase",
      date: "2024",
      url: "https://resumebuilder.pro",
      github: "https://github.com/johndoe/resume-builder",
      highlights: [
        "Built with modern React patterns and TypeScript",
        "Integrated AI for content optimization",
        "Supports multiple professional templates"
      ]
    }
  ]
}
