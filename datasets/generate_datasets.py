import os
import json
import numpy as np
import pandas as pd

np.random.seed(42)

def generate_employability_dataset(n_samples: int = 2000) -> pd.DataFrame:
    """
    Generates documented employability dataset based on tech hiring rubrics.
    Calibrated for realistic class balance (~60% employable / 40% needs prep).
    """
    exp_years = np.clip(np.random.exponential(scale=3.0, size=n_samples), 0.0, 16.0)
    prog_skills = np.random.randint(1, 12, size=n_samples)
    ml_skills = np.random.randint(0, 6, size=n_samples)
    sql_prof = np.random.randint(1, 11, size=n_samples)
    cloud_skills = np.random.randint(0, 5, size=n_samples)
    projects = np.random.randint(0, 6, size=n_samples)
    certs = np.random.randint(0, 5, size=n_samples)
    edu_tier = np.random.choice([1, 2, 3, 4], size=n_samples, p=[0.12, 0.60, 0.23, 0.05])
    
    ats_score = np.clip(
        35.0 + (prog_skills * 2.2) + (projects * 2.5) + (exp_years * 1.5) + np.random.normal(0, 6, size=n_samples),
        25.0, 99.0
    )
    
    resume_match = np.clip(
        30.0 + (prog_skills * 2.5) + (cloud_skills * 3.5) + (exp_years * 1.8) + np.random.normal(0, 7, size=n_samples),
        20.0, 98.0
    )

    # Standardize continuous variables before computing ground truth score
    ats_norm = (ats_score - 65.0) / 15.0
    match_norm = (resume_match - 60.0) / 16.0
    exp_norm = (exp_years - 3.0) / 3.0
    skills_norm = (prog_skills - 6.0) / 3.0
    proj_norm = (projects - 2.5) / 1.5

    # Calibrated latent score centered near 0
    score = (
        0.35 * exp_norm
        + 0.30 * skills_norm
        + 0.25 * proj_norm
        + 0.20 * (cloud_skills - 1.5)
        + 0.15 * (sql_prof - 5.0) / 3.0
        + 0.15 * (edu_tier - 2.0)
        + 0.40 * ats_norm
        + 0.45 * match_norm
        + np.random.normal(0, 0.4, size=n_samples)
    )

    prob = 1.0 / (1.0 + np.exp(-1.5 * score))
    is_employable = (prob >= 0.50).astype(int)

    df = pd.DataFrame({
        "programming_skills_count": prog_skills,
        "ml_skills_count": ml_skills,
        "sql_proficiency": sql_prof,
        "cloud_skills_count": cloud_skills,
        "projects_count": projects,
        "certifications_count": certs,
        "experience_years": np.round(exp_years, 1),
        "education_tier": edu_tier,
        "ats_score": np.round(ats_score, 1),
        "resume_match_score": np.round(resume_match, 1),
        "is_employable": is_employable
    })
    return df

def generate_salary_dataset(n_samples: int = 2500) -> pd.DataFrame:
    """
    Generates documented tech industry salary compensation dataset.
    """
    roles = [
        "Software Engineer", "Frontend Engineer", "Backend Engineer",
        "Full Stack Engineer", "Data Scientist", "Machine Learning Engineer",
        "DevOps Engineer", "Cloud Architect"
    ]
    role_base_multipliers = {
        "Software Engineer": 1.0,
        "Frontend Engineer": 0.95,
        "Backend Engineer": 1.05,
        "Full Stack Engineer": 1.05,
        "Data Scientist": 1.12,
        "Machine Learning Engineer": 1.20,
        "DevOps Engineer": 1.10,
        "Cloud Architect": 1.25
    }

    selected_roles = np.random.choice(roles, size=n_samples)
    exp_years = np.clip(np.random.exponential(scale=4.0, size=n_samples), 0.0, 20.0)
    edu_tier = np.random.choice([1, 2, 3, 4], size=n_samples, p=[0.08, 0.62, 0.25, 0.05])
    skills_count = np.random.randint(4, 25, size=n_samples)
    location_tier = np.random.choice([1, 2, 3], size=n_samples, p=[0.40, 0.35, 0.25])
    certs = np.random.randint(0, 6, size=n_samples)
    projects = np.random.randint(0, 8, size=n_samples)
    
    tech_expertise = np.clip(
        3.0 + (exp_years * 0.25) + (skills_count * 0.12) + (certs * 0.3) + np.random.normal(0, 0.6, size=n_samples),
        1.0, 10.0
    )

    base_salaries = []
    for i in range(n_samples):
        role = selected_roles[i]
        role_mult = role_base_multipliers[role]
        loc_mult = 1.25 if location_tier[i] == 1 else (1.08 if location_tier[i] == 2 else 0.92)
        edu_bonus = (edu_tier[i] - 1) * 6500.0
        
        comp = (
            72000.0
            + (exp_years[i] ** 0.88) * 8500.0
            + (tech_expertise[i] * 3200.0)
            + (certs[i] * 2500.0)
            + (projects[i] * 1200.0)
            + edu_bonus
        ) * role_mult * loc_mult
        
        comp += np.random.normal(0, 4500.0)
        base_salaries.append(max(55000.0, round(comp, -2)))

    df = pd.DataFrame({
        "experience_years": np.round(exp_years, 1),
        "education_tier": edu_tier,
        "skills_count": skills_count,
        "job_role": selected_roles,
        "location_tier": location_tier,
        "certifications_count": certs,
        "projects_count": projects,
        "technical_expertise_score": np.round(tech_expertise, 1),
        "salary": base_salaries
    })
    return df

def generate_courses_dataset() -> pd.DataFrame:
    courses = [
        # =========================================================================
        # 1. FRONTEND ENGINEER
        # =========================================================================
        # Free
        {
            "id": "fe_free_1",
            "title": "Responsive Web Design & Modern CSS Architecture",
            "provider": "freeCodeCamp",
            "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
            "rating": 4.9,
            "duration_hours": 40,
            "level": "Beginner",
            "category": "Frontend & Web",
            "target_role": "Frontend Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "HTML5, CSS3, Flexbox, CSS Grid, Responsive Design, Web Accessibility"
        },
        {
            "id": "fe_free_2",
            "title": "Tailwind CSS: From Zero to Production Layouts",
            "provider": "Frontend Masters",
            "url": "https://frontendmasters.com/courses/tailwind-css/",
            "rating": 4.8,
            "duration_hours": 10,
            "level": "Beginner",
            "category": "Frontend & Web",
            "target_role": "Frontend Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "TailwindCSS, CSS, Modern UI, Responsive Design, Utility Classes"
        },
        {
            "id": "fe_free_3",
            "title": "Web Performance Fundamentals & Core Web Vitals",
            "provider": "web.dev / Google",
            "url": "https://web.dev/learn/performance/",
            "rating": 4.9,
            "duration_hours": 15,
            "level": "Intermediate",
            "category": "Frontend & Web",
            "target_role": "Frontend Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "Web Performance, Core Web Vitals, LCP, CLS, Lazy Loading, Asset Optimization"
        },
        {
            "id": "fe_free_4",
            "title": "CS50's Web Programming with Python and JavaScript",
            "provider": "Harvard Online / edX",
            "url": "https://www.edx.org/course/cs50s-web-programming-with-python-and-javascript",
            "rating": 4.9,
            "duration_hours": 60,
            "level": "Intermediate",
            "category": "Frontend & Web",
            "target_role": "Frontend Engineer",
            "is_free": True,
            "price_display": "Free (Audit)",
            "skills": "JavaScript, React, Python, Django, SQL, Git, Front-End Testing"
        },
        # Paid
        {
            "id": "fe_paid_1",
            "title": "The Complete React 19 & Redux Toolkit Masterclass",
            "provider": "Udemy (Academind)",
            "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
            "rating": 4.8,
            "duration_hours": 48,
            "level": "Intermediate",
            "category": "Frontend & Web",
            "target_role": "Frontend Engineer",
            "is_free": False,
            "price_display": "$15.99",
            "skills": "React, React 19, Redux, React Router, Hooks, Context API, Next.js"
        },
        {
            "id": "fe_paid_2",
            "title": "Next.js 15 & React - The Complete Server Components Guide",
            "provider": "Udemy (Academind)",
            "url": "https://www.udemy.com/course/nextjs-react-the-complete-guide/",
            "rating": 4.9,
            "duration_hours": 36,
            "level": "Intermediate",
            "category": "Frontend & Web",
            "target_role": "Frontend Engineer",
            "is_free": False,
            "price_display": "$16.99",
            "skills": "Next.js, React, Server Components, SSR, TailwindCSS, TypeScript, Vercel"
        },
        {
            "id": "fe_paid_3",
            "title": "Understanding TypeScript: 2026 Developer Edition",
            "provider": "Udemy (Maximilian Schwarzmüller)",
            "url": "https://www.udemy.com/course/understanding-typescript/",
            "rating": 4.8,
            "duration_hours": 16,
            "level": "Beginner",
            "category": "Frontend & Web",
            "target_role": "Frontend Engineer",
            "is_free": False,
            "price_display": "$12.99",
            "skills": "TypeScript, JavaScript, Generics, OOP, Type Narrowing, Decorators"
        },
        {
            "id": "fe_paid_4",
            "title": "Vue.js 3 - The Complete Guide (Pinia & Composition API)",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/vuejs-2-the-complete-guide/",
            "rating": 4.8,
            "duration_hours": 32,
            "level": "Intermediate",
            "category": "Frontend & Web",
            "target_role": "Frontend Engineer",
            "is_free": False,
            "price_display": "$14.99",
            "skills": "Vue, Vue 3, Pinia, Composition API, TypeScript, SPA, Vite"
        },
        {
            "id": "fe_paid_5",
            "title": "Angular 18+ Signals & Microfrontends Complete Guide",
            "provider": "Udemy (Academind)",
            "url": "https://www.udemy.com/course/the-complete-guide-to-angular-2/",
            "rating": 4.7,
            "duration_hours": 42,
            "level": "Intermediate",
            "category": "Frontend & Web",
            "target_role": "Frontend Engineer",
            "is_free": False,
            "price_display": "$16.99",
            "skills": "Angular, TypeScript, Signals, RxJS, Dependency Injection, Microfrontends"
        },

        # =========================================================================
        # 2. BACKEND ENGINEER
        # =========================================================================
        # Free
        {
            "id": "be_free_1",
            "title": "Golang Backend Web Development Bootcamp",
            "provider": "freeCodeCamp",
            "url": "https://www.freecodecamp.org/news/learn-go-programming-by-building-projects/",
            "rating": 4.8,
            "duration_hours": 20,
            "level": "Beginner",
            "category": "Backend & APIs",
            "target_role": "Backend Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "Go, Golang, Concurrency, REST API, Goroutines, Postgres, SQL"
        },
        {
            "id": "be_free_2",
            "title": "Redis University: In-Memory Caching & Real-Time Data",
            "provider": "Redis University",
            "url": "https://university.redis.com/",
            "rating": 4.9,
            "duration_hours": 12,
            "level": "Intermediate",
            "category": "Backend & APIs",
            "target_role": "Backend Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "Redis, Caching, In-Memory Data, PubSub, Rate Limiting, High Availability"
        },
        {
            "id": "be_free_3",
            "title": "Node.js, Express & MongoDB Backend Mastery",
            "provider": "freeCodeCamp",
            "url": "https://www.freecodecamp.org/learn/back-end-development-and-apis/",
            "rating": 4.8,
            "duration_hours": 30,
            "level": "Beginner",
            "category": "Backend & APIs",
            "target_role": "Backend Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "Node.js, Express, REST API, MongoDB, Mongoose, JWT, Auth"
        },
        {
            "id": "be_free_4",
            "title": "Distributed Systems Architecture & Protocols",
            "provider": "MIT OpenCourseWare",
            "url": "https://ocw.mit.edu/courses/6-824-distributed-computer-systems-engineering-spring-2018/",
            "rating": 4.9,
            "duration_hours": 45,
            "level": "Advanced",
            "category": "Backend & APIs",
            "target_role": "Backend Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "Distributed Systems, Raft, Consensus, RPC, Scalability, Fault Tolerance"
        },
        # Paid
        {
            "id": "be_paid_1",
            "title": "FastAPI: Modern Python Async Web APIs & Microservices",
            "provider": "Udemy (Eric Roby)",
            "url": "https://www.udemy.com/course/fastapi-the-complete-course/",
            "rating": 4.8,
            "duration_hours": 22,
            "level": "Intermediate",
            "category": "Backend & APIs",
            "target_role": "Backend Engineer",
            "is_free": False,
            "price_display": "$14.99",
            "skills": "FastAPI, Python, REST API, Pydantic, Async, JWT, Swagger, Docker"
        },
        {
            "id": "be_paid_2",
            "title": "Complete Node.js Developer in 2026: Zero to Mastery",
            "provider": "Zero To Mastery",
            "url": "https://zerotomastery.io/courses/learn-node-js/",
            "rating": 4.8,
            "duration_hours": 42,
            "level": "Intermediate",
            "category": "Backend & APIs",
            "target_role": "Backend Engineer",
            "is_free": False,
            "price_display": "$39/mo",
            "skills": "Node.js, Express, Microservices, WebSockets, PostgreSQL, GraphQL, Docker"
        },
        {
            "id": "be_paid_3",
            "title": "Go: The Complete Developer Guide (Golang)",
            "provider": "Udemy (Stephen Grider)",
            "url": "https://www.udemy.com/course/go-the-complete-developers-guide/",
            "rating": 4.8,
            "duration_hours": 24,
            "level": "Intermediate",
            "category": "Backend & APIs",
            "target_role": "Backend Engineer",
            "is_free": False,
            "price_display": "$15.99",
            "skills": "Go, Golang, Concurrency, Channels, Structs, Interfaces, Unit Testing"
        },
        {
            "id": "be_paid_4",
            "title": "High Performance Microservices in Go (gRPC & Protobuf)",
            "provider": "Udemy (Packt)",
            "url": "https://www.udemy.com/course/grpc-golang-microservices/",
            "rating": 4.8,
            "duration_hours": 18,
            "level": "Advanced",
            "category": "Backend & APIs",
            "target_role": "Backend Engineer",
            "is_free": False,
            "price_display": "$14.99",
            "skills": "Go, gRPC, Protobuf, Microservices, HTTP2, Streaming RPC, Service Discovery"
        },
        {
            "id": "be_paid_5",
            "title": "Apache Kafka Series: Event-Driven Real-Time Architecture",
            "provider": "Udemy (Stephane Maarek)",
            "url": "https://www.udemy.com/course/apache-kafka/",
            "rating": 4.8,
            "duration_hours": 16,
            "level": "Intermediate",
            "category": "Backend & APIs",
            "target_role": "Backend Engineer",
            "is_free": False,
            "price_display": "$14.99",
            "skills": "Kafka, Event Streaming, Distributed Systems, PubSub, Kafka Connect"
        },
        {
            "id": "be_paid_6",
            "title": "Spring Boot 3 & Spring Cloud Microservices Masterclass",
            "provider": "Udemy (In28Minutes)",
            "url": "https://www.udemy.com/course/microservices-with-spring-boot-and-spring-cloud/",
            "rating": 4.7,
            "duration_hours": 36,
            "level": "Intermediate",
            "category": "Backend & APIs",
            "target_role": "Backend Engineer",
            "is_free": False,
            "price_display": "$16.99",
            "skills": "Spring Boot, Java, Microservices, Spring Cloud, Docker, Eureka, OpenFeign"
        },
        {
            "id": "be_paid_7",
            "title": "Rust Programming: High-Performance Safe Systems",
            "provider": "Udemy (Trevor Sullivan)",
            "url": "https://www.udemy.com/course/rust-programming-for-beginners/",
            "rating": 4.8,
            "duration_hours": 28,
            "level": "Intermediate",
            "category": "Backend & APIs",
            "target_role": "Backend Engineer",
            "is_free": False,
            "price_display": "$15.99",
            "skills": "Rust, Systems Programming, Memory Safety, Concurrency, Cargo, WebAssembly"
        },

        # =========================================================================
        # 3. FULL STACK ENGINEER
        # =========================================================================
        # Free
        {
            "id": "fs_free_1",
            "title": "Full Stack Open 2026: Deep Dive into Modern Web Dev",
            "provider": "University of Helsinki",
            "url": "https://fullstackopen.com/en/",
            "rating": 4.9,
            "duration_hours": 80,
            "level": "Intermediate",
            "category": "Full Stack Development",
            "target_role": "Full Stack Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "React, Redux, Node.js, Express, MongoDB, GraphQL, TypeScript, CI/CD"
        },
        {
            "id": "fs_free_2",
            "title": "The Odin Project: Full Stack JavaScript Curriculum",
            "provider": "The Odin Project",
            "url": "https://www.theodinproject.com/paths/full-stack-javascript",
            "rating": 4.9,
            "duration_hours": 100,
            "level": "Beginner",
            "category": "Full Stack Development",
            "target_role": "Full Stack Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "HTML, CSS, JavaScript, React, Node.js, Express, PostgreSQL, Git"
        },
        {
            "id": "fs_free_3",
            "title": "CS50 Introduction to Computer Science",
            "provider": "Harvard Online / edX",
            "url": "https://www.edx.org/cs50",
            "rating": 4.9,
            "duration_hours": 70,
            "level": "Beginner",
            "category": "Full Stack Development",
            "target_role": "Full Stack Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "C, Python, SQL, Algorithms, Data Structures, Web Fundamentals"
        },
        # Paid
        {
            "id": "fs_paid_1",
            "title": "The Complete 2026 Web Development Bootcamp",
            "provider": "Udemy (Dr. Angela Yu)",
            "url": "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
            "rating": 4.8,
            "duration_hours": 65,
            "level": "Beginner",
            "category": "Full Stack Development",
            "target_role": "Full Stack Engineer",
            "is_free": False,
            "price_display": "$17.99",
            "skills": "React, Node.js, Express, PostgreSQL, Web3, Git, Authentication, REST"
        },
        {
            "id": "fs_paid_2",
            "title": "Full Stack Modern Web Development (React & Node)",
            "provider": "Frontend Masters",
            "url": "https://frontendmasters.com/courses/full-stack-v3/",
            "rating": 4.9,
            "duration_hours": 38,
            "level": "Advanced",
            "category": "Full Stack Development",
            "target_role": "Full Stack Engineer",
            "is_free": False,
            "price_display": "$39/mo",
            "skills": "React, Node.js, GraphQL, REST API, TypeScript, Vite, Monorepos"
        },
        {
            "id": "fs_paid_3",
            "title": "GraphQL with Node.js & React: The Complete Guide",
            "provider": "Udemy (Stephen Grider)",
            "url": "https://www.udemy.com/course/graphql-with-react-course/",
            "rating": 4.7,
            "duration_hours": 16,
            "level": "Intermediate",
            "category": "Full Stack Development",
            "target_role": "Full Stack Engineer",
            "is_free": False,
            "price_display": "$13.99",
            "skills": "GraphQL, Apollo, React, Node.js, Schemas, Resolvers, Mutations"
        },
        {
            "id": "fs_paid_4",
            "title": "Master the Coding Interview: Data Structures & Algorithms",
            "provider": "Zero To Mastery",
            "url": "https://zerotomastery.io/courses/master-the-coding-interview-data-structures-algorithms/",
            "rating": 4.8,
            "duration_hours": 35,
            "level": "Intermediate",
            "category": "Full Stack Development",
            "target_role": "Full Stack Engineer",
            "is_free": False,
            "price_display": "$39/mo",
            "skills": "Data Structures, Algorithms, Big O, Dynamic Programming, LeetCode, Graphs"
        },

        # =========================================================================
        # 4. AI & MACHINE LEARNING ENGINEER
        # =========================================================================
        # Free
        {
            "id": "ai_free_1",
            "title": "Machine Learning Specialization",
            "provider": "Coursera (Stanford & DeepLearning.AI)",
            "url": "https://www.coursera.org/specializations/machine-learning-introduction",
            "rating": 4.9,
            "duration_hours": 50,
            "level": "Beginner",
            "category": "AI & Machine Learning",
            "target_role": "AI & Machine Learning Engineer",
            "is_free": True,
            "price_display": "Free (Audit)",
            "skills": "Machine Learning, Scikit-Learn, Supervised Learning, Logistic Regression, Python"
        },
        {
            "id": "ai_free_2",
            "title": "Generative AI with Large Language Models (LLMs)",
            "provider": "Coursera (AWS & DeepLearning.AI)",
            "url": "https://www.coursera.org/learn/generative-ai-with-llms",
            "rating": 4.9,
            "duration_hours": 32,
            "level": "Intermediate",
            "category": "AI & Machine Learning",
            "target_role": "AI & Machine Learning Engineer",
            "is_free": True,
            "price_display": "Free (Audit)",
            "skills": "Generative AI, LLM, Fine-Tuning, PEFT, LoRA, RLHF, Transformers, LangChain"
        },
        {
            "id": "ai_free_3",
            "title": "LangChain & Vector Databases for Production RAG",
            "provider": "DeepLearning.AI",
            "url": "https://www.deeplearning.ai/short-courses/",
            "rating": 4.8,
            "duration_hours": 12,
            "level": "Intermediate",
            "category": "AI & Machine Learning",
            "target_role": "AI & Machine Learning Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "RAG, LangChain, Vector Databases, Pinecone, ChromaDB, Embeddings, LLM"
        },
        {
            "id": "ai_free_4",
            "title": "AI Agents & Autonomous Multi-Agent Workflows",
            "provider": "DeepLearning.AI",
            "url": "https://www.deeplearning.ai/short-courses/multi-ai-agent-systems-with-crewai/",
            "rating": 4.9,
            "duration_hours": 14,
            "level": "Advanced",
            "category": "AI & Machine Learning",
            "target_role": "AI & Machine Learning Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "AI Agents, CrewAI, AutoGen, Function Calling, Prompt Engineering, Python"
        },
        {
            "id": "ai_free_5",
            "title": "Practical Deep Learning for Coders (fast.ai)",
            "provider": "fast.ai",
            "url": "https://course.fast.ai/",
            "rating": 4.9,
            "duration_hours": 45,
            "level": "Intermediate",
            "category": "AI & Machine Learning",
            "target_role": "AI & Machine Learning Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "PyTorch, Deep Learning, Computer Vision, NLP, Model Deployment, Ensembling"
        },
        {
            "id": "ai_free_6",
            "title": "Hugging Face Transformers & Open Source NLP Course",
            "provider": "Hugging Face",
            "url": "https://huggingface.co/learn/nlp-course/",
            "rating": 4.9,
            "duration_hours": 30,
            "level": "Intermediate",
            "category": "AI & Machine Learning",
            "target_role": "AI & Machine Learning Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "Transformers, BERT, HuggingFace, Tokenizers, Fine-Tuning, Model Hub"
        },
        {
            "id": "ai_free_7",
            "title": "Prompt Engineering for Generative AI",
            "provider": "Coursera (Vanderbilt)",
            "url": "https://www.coursera.org/learn/prompt-engineering",
            "rating": 4.7,
            "duration_hours": 18,
            "level": "Beginner",
            "category": "AI & Machine Learning",
            "target_role": "AI & Machine Learning Engineer",
            "is_free": True,
            "price_display": "Free (Audit)",
            "skills": "Prompt Engineering, ChatGPT, LLM, Few-Shot Prompting, Chain of Thought"
        },
        # Paid
        {
            "id": "ai_paid_1",
            "title": "Deep Learning Specialization (Neural Networks & CNNs)",
            "provider": "Coursera (DeepLearning.AI)",
            "url": "https://www.coursera.org/specializations/deep-learning",
            "rating": 4.9,
            "duration_hours": 60,
            "level": "Intermediate",
            "category": "AI & Machine Learning",
            "target_role": "AI & Machine Learning Engineer",
            "is_free": False,
            "price_display": "$49/mo",
            "skills": "Deep Learning, PyTorch, TensorFlow, Neural Networks, Computer Vision, Optimization"
        },
        {
            "id": "ai_paid_2",
            "title": "Natural Language Processing Specialization",
            "provider": "Coursera (DeepLearning.AI)",
            "url": "https://www.coursera.org/specializations/natural-language-processing",
            "rating": 4.8,
            "duration_hours": 45,
            "level": "Advanced",
            "category": "AI & Machine Learning",
            "target_role": "AI & Machine Learning Engineer",
            "is_free": False,
            "price_display": "$49/mo",
            "skills": "NLP, Transformers, BERT, HuggingFace, Attention Mechanisms, SBERT"
        },
        {
            "id": "ai_paid_3",
            "title": "PyTorch for Deep Learning Bootcamp 2026",
            "provider": "Zero To Mastery",
            "url": "https://zerotomastery.io/courses/learn-pytorch/",
            "rating": 4.8,
            "duration_hours": 44,
            "level": "Intermediate",
            "category": "AI & Machine Learning",
            "target_role": "AI & Machine Learning Engineer",
            "is_free": False,
            "price_display": "$39/mo",
            "skills": "PyTorch, Deep Learning, Computer Vision, Transformers, Model Deployment"
        },
        {
            "id": "ai_paid_4",
            "title": "AI Engineering & MLOps with Kubeflow and MLflow",
            "provider": "Coursera (DeepLearning.AI)",
            "url": "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops",
            "rating": 4.8,
            "duration_hours": 38,
            "level": "Advanced",
            "category": "AI & Machine Learning",
            "target_role": "AI & Machine Learning Engineer",
            "is_free": False,
            "price_display": "$49/mo",
            "skills": "MLOps, Kubeflow, MLflow, Model Monitoring, CI/CD for ML, Docker, Kubernetes"
        },
        {
            "id": "ai_paid_5",
            "title": "Generative AI & LLM App Development with Python",
            "provider": "Udemy (Frank Kane)",
            "url": "https://www.udemy.com/course/generative-ai-bootcamp/",
            "rating": 4.8,
            "duration_hours": 24,
            "level": "Intermediate",
            "category": "AI & Machine Learning",
            "target_role": "AI & Machine Learning Engineer",
            "is_free": False,
            "price_display": "$14.99",
            "skills": "Generative AI, OpenAI, LangChain, LlamaIndex, Streamlit, Vector Search"
        },
        {
            "id": "ai_paid_6",
            "title": "Complete A.I. & Machine Learning Bootcamp 2026",
            "provider": "Zero To Mastery",
            "url": "https://zerotomastery.io/courses/complete-machine-learning-and-data-science-bootcamp/",
            "rating": 4.8,
            "duration_hours": 44,
            "level": "Beginner",
            "category": "AI & Machine Learning",
            "target_role": "AI & Machine Learning Engineer",
            "is_free": False,
            "price_display": "$39/mo",
            "skills": "Machine Learning, Python, Scikit-Learn, Pandas, NumPy, Deep Learning"
        },

        # =========================================================================
        # 5. CLOUD & DEVOPS ARCHITECT
        # =========================================================================
        # Free
        {
            "id": "devops_free_1",
            "title": "Linux Command Line and Bash Automation Fundamentals",
            "provider": "Coursera (The Linux Foundation)",
            "url": "https://www.coursera.org/learn/linux-fundamentals",
            "rating": 4.8,
            "duration_hours": 20,
            "level": "Beginner",
            "category": "Cloud & DevOps",
            "target_role": "Cloud & DevOps Architect",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "Linux, Bash, Shell Scripting, CLI, Cron, Permissions, System Administration"
        },
        {
            "id": "devops_free_2",
            "title": "Docker for Beginners: From Containers to Production",
            "provider": "freeCodeCamp",
            "url": "https://www.freecodecamp.org/news/what-is-docker-learn-how-to-use-containers-with-docker-step-by-step/",
            "rating": 4.8,
            "duration_hours": 10,
            "level": "Beginner",
            "category": "Cloud & DevOps",
            "target_role": "Cloud & DevOps Architect",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "Docker, Containers, Dockerfile, Docker Compose, Volumes, Networking"
        },
        {
            "id": "devops_free_3",
            "title": "Kubernetes 101: Pods, Deployments & Service Ingress",
            "provider": "CNCF / edX",
            "url": "https://www.edx.org/course/introduction-to-kubernetes",
            "rating": 4.8,
            "duration_hours": 16,
            "level": "Intermediate",
            "category": "Cloud & DevOps",
            "target_role": "Cloud & DevOps Architect",
            "is_free": True,
            "price_display": "Free (Audit)",
            "skills": "Kubernetes, Pods, Deployments, Services, ConfigMaps, Ingress, kubectl"
        },
        {
            "id": "devops_free_4",
            "title": "AWS Cloud Practitioner Essentials",
            "provider": "AWS Skill Builder",
            "url": "https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials",
            "rating": 4.8,
            "duration_hours": 12,
            "level": "Beginner",
            "category": "Cloud & DevOps",
            "target_role": "Cloud & DevOps Architect",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "AWS, Cloud Computing, EC2, S3, IAM, Cloud Security, Billing"
        },
        # Paid
        {
            "id": "devops_paid_1",
            "title": "Docker and Kubernetes: The Complete Developer Guide",
            "provider": "Udemy (Stephen Grider)",
            "url": "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/",
            "rating": 4.8,
            "duration_hours": 26,
            "level": "Intermediate",
            "category": "Cloud & DevOps",
            "target_role": "Cloud & DevOps Architect",
            "is_free": False,
            "price_display": "$15.99",
            "skills": "Docker, Kubernetes, CI/CD, Containerization, Microservices, Helm, Ingress"
        },
        {
            "id": "devops_paid_2",
            "title": "Certified Kubernetes Administrator (CKA) with Practice Tests",
            "provider": "KodeKloud / Udemy (Mumshad Mannambeth)",
            "url": "https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/",
            "rating": 4.9,
            "duration_hours": 32,
            "level": "Advanced",
            "category": "Cloud & DevOps",
            "target_role": "Cloud & DevOps Architect",
            "is_free": False,
            "price_display": "$19.99",
            "skills": "Kubernetes, CKA, Pods, Services, Storage, Cluster Networking, Troubleshooting"
        },
        {
            "id": "devops_paid_3",
            "title": "AWS Certified Solutions Architect Associate (SAA-C03)",
            "provider": "Udemy (Stephane Maarek)",
            "url": "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/",
            "rating": 4.8,
            "duration_hours": 30,
            "level": "Intermediate",
            "category": "Cloud & DevOps",
            "target_role": "Cloud & DevOps Architect",
            "is_free": False,
            "price_display": "$17.99",
            "skills": "AWS, Cloud Architecture, EC2, S3, RDS, Serverless, IAM, VPC"
        },
        {
            "id": "devops_paid_4",
            "title": "Google Cloud Professional Cloud Architect Certification",
            "provider": "Coursera (Google Cloud)",
            "url": "https://www.coursera.org/professional-certificates/gcp-cloud-architect",
            "rating": 4.8,
            "duration_hours": 40,
            "level": "Advanced",
            "category": "Cloud & DevOps",
            "target_role": "Cloud & DevOps Architect",
            "is_free": False,
            "price_display": "$49/mo",
            "skills": "GCP, Google Cloud, BigQuery, GKE, Kubernetes, Cloud IAM, Cloud Security"
        },
        {
            "id": "devops_paid_5",
            "title": "Terraform for AWS, Azure & Google Cloud (IaC Masterclass)",
            "provider": "Udemy (Zeal Vora)",
            "url": "https://www.udemy.com/course/terraform-beginner-to-advanced/",
            "rating": 4.7,
            "duration_hours": 18,
            "level": "Intermediate",
            "category": "Cloud & DevOps",
            "target_role": "Cloud & DevOps Architect",
            "is_free": False,
            "price_display": "$13.99",
            "skills": "Terraform, Infrastructure as Code, AWS, Cloud Automation, HCL, Modules"
        },
        {
            "id": "devops_paid_6",
            "title": "CI/CD with GitHub Actions & ArgoCD GitOps",
            "provider": "KodeKloud",
            "url": "https://kodekloud.com/courses/github-actions/",
            "rating": 4.8,
            "duration_hours": 15,
            "level": "Intermediate",
            "category": "Cloud & DevOps",
            "target_role": "Cloud & DevOps Architect",
            "is_free": False,
            "price_display": "$24/mo",
            "skills": "CI/CD, GitHub Actions, GitOps, ArgoCD, Automated Testing, Pipelines"
        },
        {
            "id": "devops_paid_7",
            "title": "Full Stack Serverless on AWS (Lambda, DynamoDB & CDK)",
            "provider": "A Cloud Guru / Pluralsight",
            "url": "https://www.pluralsight.com/courses/aws-serverless-deep-dive",
            "rating": 4.8,
            "duration_hours": 22,
            "level": "Intermediate",
            "category": "Cloud & DevOps",
            "target_role": "Cloud & DevOps Architect",
            "is_free": False,
            "price_display": "$29/mo",
            "skills": "AWS, Serverless, Lambda, DynamoDB, API Gateway, CloudFormation, CDK"
        },

        # =========================================================================
        # 6. DATA ENGINEER
        # =========================================================================
        # Free
        {
            "id": "de_free_1",
            "title": "dbt Fundamentals & Modern Analytics Engineering",
            "provider": "dbt Labs",
            "url": "https://courses.getdbt.com/courses/dbt-fundamentals",
            "rating": 4.9,
            "duration_hours": 10,
            "level": "Intermediate",
            "category": "Database & Big Data",
            "target_role": "Data Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "dbt, Data Modeling, SQL, BigQuery, Snowflake, Data Warehousing, ELT"
        },
        {
            "id": "de_free_2",
            "title": "Data Engineering Zoomcamp (Free Batch & Streaming Course)",
            "provider": "DataTalksClub",
            "url": "https://github.com/DataTalksClub/data-engineering-zoomcamp",
            "rating": 4.9,
            "duration_hours": 40,
            "level": "Intermediate",
            "category": "Database & Big Data",
            "target_role": "Data Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "Data Engineering, Docker, Terraform, GCP, Spark, Kafka, Airflow, dbt"
        },
        {
            "id": "de_free_3",
            "title": "SQL for Data Science & Analytics",
            "provider": "Coursera (UC Davis)",
            "url": "https://www.coursera.org/learn/sql-for-data-science",
            "rating": 4.7,
            "duration_hours": 20,
            "level": "Beginner",
            "category": "Database & Big Data",
            "target_role": "Data Engineer",
            "is_free": True,
            "price_display": "Free (Audit)",
            "skills": "SQL, SQLite, Filtering, Data Aggregation, Joins, Data Wrangling"
        },
        # Paid
        {
            "id": "de_paid_1",
            "title": "Data Engineering on Google Cloud Platform Specialization",
            "provider": "Coursera (Google Cloud)",
            "url": "https://www.coursera.org/professional-certificates/gcp-data-engineering",
            "rating": 4.8,
            "duration_hours": 48,
            "level": "Advanced",
            "category": "Database & Big Data",
            "target_role": "Data Engineer",
            "is_free": False,
            "price_display": "$49/mo",
            "skills": "Data Engineering, BigQuery, Dataflow, Apache Beam, Dataproc, Spark, GCS"
        },
        {
            "id": "de_paid_2",
            "title": "Apache Spark 3 & Python for Big Data (PySpark)",
            "provider": "Udemy (Jose Portilla)",
            "url": "https://www.udemy.com/course/spark-and-python-for-big-data-with-pyspark/",
            "rating": 4.7,
            "duration_hours": 24,
            "level": "Intermediate",
            "category": "Database & Big Data",
            "target_role": "Data Engineer",
            "is_free": False,
            "price_display": "$15.99",
            "skills": "Spark, PySpark, Big Data, Hadoop, Data Engineering, Streaming, MLlib"
        },
        {
            "id": "de_paid_3",
            "title": "Snowflake Masterclass for Cloud Data Engineers",
            "provider": "Udemy (Hamid Mahmood)",
            "url": "https://www.udemy.com/course/ultimate-snowpro-core-certification-course/",
            "rating": 4.8,
            "duration_hours": 20,
            "level": "Intermediate",
            "category": "Database & Big Data",
            "target_role": "Data Engineer",
            "is_free": False,
            "price_display": "$16.99",
            "skills": "Snowflake, Cloud Data Warehouse, SQL, Zero-Copy Clone, Time Travel, Snowpipe"
        },
        {
            "id": "de_paid_4",
            "title": "PostgreSQL Bootcamp: Performance Tuning & Indexing",
            "provider": "Udemy (Jose Portilla)",
            "url": "https://www.udemy.com/course/the-complete-python-postgresql-developer-course/",
            "rating": 4.8,
            "duration_hours": 26,
            "level": "Intermediate",
            "category": "Database & Big Data",
            "target_role": "Data Engineer",
            "is_free": False,
            "price_display": "$14.99",
            "skills": "PostgreSQL, SQL, Database Indexing, Query Optimization, ACID, Transactions"
        },
        {
            "id": "de_paid_5",
            "title": "Complete SQL Bootcamp: Go from Zero to Hero",
            "provider": "Udemy (Jose Portilla)",
            "url": "https://www.udemy.com/course/the-complete-sql-bootcamp/",
            "rating": 4.8,
            "duration_hours": 15,
            "level": "Beginner",
            "category": "Database & Big Data",
            "target_role": "Data Engineer",
            "is_free": False,
            "price_display": "$13.99",
            "skills": "SQL, PostgreSQL, Database Design, Joins, Group By, Window Functions"
        },
        {
            "id": "de_paid_6",
            "title": "MongoDB: The Complete Developer Guide (NoSQL & Aggregations)",
            "provider": "Udemy (Maximilian Schwarzmüller)",
            "url": "https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/",
            "rating": 4.7,
            "duration_hours": 18,
            "level": "Beginner",
            "category": "Database & Big Data",
            "target_role": "Data Engineer",
            "is_free": False,
            "price_display": "$14.99",
            "skills": "MongoDB, NoSQL, Aggregation Pipeline, Mongoose, Atlas, Document Storage"
        },

        # =========================================================================
        # 7. CYBERSECURITY SPECIALIST
        # =========================================================================
        # Free
        {
            "id": "sec_free_1",
            "title": "Web Security & Penetration Testing (OWASP Top 10)",
            "provider": "Coursera (Infosec Institute)",
            "url": "https://www.coursera.org/learn/web-application-security",
            "rating": 4.7,
            "duration_hours": 20,
            "level": "Intermediate",
            "category": "Cybersecurity",
            "target_role": "Cybersecurity Specialist",
            "is_free": True,
            "price_display": "Free (Audit)",
            "skills": "Security, OWASP, Penetration Testing, SQL Injection, XSS, Vulnerabilities"
        },
        {
            "id": "sec_free_2",
            "title": "Introduction to Cybersecurity & Threat Defense",
            "provider": "Cisco / SkillsForAll",
            "url": "https://skillsforall.com/course/introduction-to-cybersecurity",
            "rating": 4.8,
            "duration_hours": 15,
            "level": "Beginner",
            "category": "Cybersecurity",
            "target_role": "Cybersecurity Specialist",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "Cybersecurity, Network Security, Malware, Phishing, Firewalls, Encryption"
        },
        {
            "id": "sec_free_3",
            "title": "Ethical Hacking & Network Defense Complete Course",
            "provider": "freeCodeCamp",
            "url": "https://www.freecodecamp.org/news/free-ethical-hacking-course-for-beginners/",
            "rating": 4.8,
            "duration_hours": 25,
            "level": "Intermediate",
            "category": "Cybersecurity",
            "target_role": "Cybersecurity Specialist",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "Ethical Hacking, Kali Linux, Nmap, Metasploit, Wireshark, Port Scanning"
        },
        # Paid
        {
            "id": "sec_paid_1",
            "title": "CompTIA Security+ (SY0-701) Complete Training Bootcamp",
            "provider": "Udemy (Jason Dion)",
            "url": "https://www.udemy.com/course/securityplus/",
            "rating": 4.8,
            "duration_hours": 28,
            "level": "Intermediate",
            "category": "Cybersecurity",
            "target_role": "Cybersecurity Specialist",
            "is_free": False,
            "price_display": "$17.99",
            "skills": "Cybersecurity, Network Security, Cryptography, Identity Access, Threat Modeling"
        },
        {
            "id": "sec_paid_2",
            "title": "Practical Ethical Hacking - The Complete Course",
            "provider": "TCM Security Academy",
            "url": "https://academy.tcm-sec.com/p/practical-ethical-hacking-the-complete-course",
            "rating": 4.9,
            "duration_hours": 25,
            "level": "Intermediate",
            "category": "Cybersecurity",
            "target_role": "Cybersecurity Specialist",
            "is_free": False,
            "price_display": "$29.99",
            "skills": "Ethical Hacking, Penetration Testing, Active Directory, Exploitation, OSINT"
        },
        {
            "id": "sec_paid_3",
            "title": "AWS Certified Security Specialty Masterclass",
            "provider": "Udemy (Stephane Maarek)",
            "url": "https://www.udemy.com/course/aws-certified-security-specialty/",
            "rating": 4.8,
            "duration_hours": 20,
            "level": "Advanced",
            "category": "Cybersecurity",
            "target_role": "Cybersecurity Specialist",
            "is_free": False,
            "price_display": "$18.99",
            "skills": "AWS Security, IAM, KMS, GuardDuty, Security Hub, WAF, CloudTrail"
        },

        # =========================================================================
        # 8. SYSTEM DESIGN & ARCHITECTURE
        # =========================================================================
        # Free
        {
            "id": "sd_free_1",
            "title": "System Design Primer & Scalability Blueprints",
            "provider": "GitHub (Donne Martin) / Open Source",
            "url": "https://github.com/donnemartin/system-design-primer",
            "rating": 4.9,
            "duration_hours": 30,
            "level": "Intermediate",
            "category": "System Design & Architecture",
            "target_role": "System Architect",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "System Design, Scalability, Load Balancing, Caching, CDN, Sharding, CAP"
        },
        {
            "id": "sd_free_2",
            "title": "Software Architecture Fundamentals & Clean Architecture",
            "provider": "freeCodeCamp",
            "url": "https://www.freecodecamp.org/news/software-architecture-design-patterns-course/",
            "rating": 4.8,
            "duration_hours": 12,
            "level": "Intermediate",
            "category": "System Design & Architecture",
            "target_role": "System Architect",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "Clean Architecture, Design Patterns, SOLID, Domain Driven Design, Microservices"
        },
        # Paid
        {
            "id": "sd_paid_1",
            "title": "Grokking Modern System Design Interview for Software Engineers",
            "provider": "Educative",
            "url": "https://www.educative.io/courses/grokking-the-system-design-interview",
            "rating": 4.9,
            "duration_hours": 25,
            "level": "Advanced",
            "category": "System Design & Architecture",
            "target_role": "System Architect",
            "is_free": False,
            "price_display": "$29/mo",
            "skills": "System Design, Scalability, Load Balancing, Caching, Database Sharding, Microservices"
        },
        {
            "id": "sd_paid_2",
            "title": "Pragmatic System Design & Microservices Patterns in Production",
            "provider": "Zero To Mastery",
            "url": "https://zerotomastery.io/courses/system-design-interview-bootcamp/",
            "rating": 4.8,
            "duration_hours": 22,
            "level": "Advanced",
            "category": "System Design & Architecture",
            "target_role": "System Architect",
            "is_free": False,
            "price_display": "$39/mo",
            "skills": "System Design, Event Driven Architecture, Message Queues, Resiliency, SLA"
        },

        # =========================================================================
        # 9. MOBILE APP ENGINEER
        # =========================================================================
        # Free
        {
            "id": "mob_free_1",
            "title": "Android Development with Kotlin & Jetpack Compose",
            "provider": "Google / Android Developers",
            "url": "https://developer.android.com/courses/android-basics-compose/course",
            "rating": 4.9,
            "duration_hours": 35,
            "level": "Intermediate",
            "category": "Mobile Engineering",
            "target_role": "Mobile App Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "Kotlin, Android, Jetpack Compose, Coroutines, MVVM, Material Design, Room"
        },
        {
            "id": "mob_free_2",
            "title": "React Native & Expo Crash Course for Beginners",
            "provider": "freeCodeCamp",
            "url": "https://www.freecodecamp.org/news/learn-react-native-by-building-apps/",
            "rating": 4.8,
            "duration_hours": 15,
            "level": "Beginner",
            "category": "Mobile Engineering",
            "target_role": "Mobile App Engineer",
            "is_free": True,
            "price_display": "100% Free",
            "skills": "React Native, Expo, Mobile UI, Navigation, Cross-Platform, JavaScript"
        },
        # Paid
        {
            "id": "mob_paid_1",
            "title": "Flutter & Dart - The Complete Guide (2026 Edition)",
            "provider": "Udemy (Academind)",
            "url": "https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/",
            "rating": 4.8,
            "duration_hours": 40,
            "level": "Intermediate",
            "category": "Mobile Engineering",
            "target_role": "Mobile App Engineer",
            "is_free": False,
            "price_display": "$16.99",
            "skills": "Flutter, Dart, Mobile Apps, iOS, Android, State Management, Provider, BLoC"
        },
        {
            "id": "mob_paid_2",
            "title": "iOS 18 & Swift 6 - The Complete App Development Bootcamp",
            "provider": "Udemy (Angela Yu)",
            "url": "https://www.udemy.com/course/ios-13-app-development-bootcamp/",
            "rating": 4.8,
            "duration_hours": 55,
            "level": "Intermediate",
            "category": "Mobile Engineering",
            "target_role": "Mobile App Engineer",
            "is_free": False,
            "price_display": "$19.99",
            "skills": "Swift, iOS, SwiftUI, CoreData, Xcode, Mobile UI, Apple Developer"
        }
    ]
    return pd.DataFrame(courses)

if __name__ == "__main__":
    os.makedirs("datasets", exist_ok=True)
    
    emp_df = generate_employability_dataset(2000)
    emp_path = "datasets/employability_dataset.csv"
    emp_df.to_csv(emp_path, index=False)
    print(f"Generated Employability Dataset: {emp_df.shape}, distribution: {emp_df['is_employable'].value_counts().to_dict()} -> {emp_path}")

    sal_df = generate_salary_dataset(2500)
    sal_path = "datasets/salary_dataset.csv"
    sal_df.to_csv(sal_path, index=False)
    print(f"Generated Salary Dataset: {sal_df.shape} -> {sal_path}")

    courses_df = generate_courses_dataset()
    courses_path = "datasets/courses_dataset.csv"
    courses_df.to_csv(courses_path, index=False)
    print(f"Generated Courses Dataset: {courses_df.shape} -> {courses_path}")
