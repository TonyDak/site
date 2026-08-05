import type { Locale, PortfolioContent } from "./types";

const sharedIdentity = {
  name: "duc.dev",
  ownerName: "Nguyễn Hữu Đức",
  email: "duckg2083@gmail.com",
  phone: "0946945409",
  social: { github: "https://github.com/TonyDak", linkedin: "https://www.linkedin.com/in/ducnguyendev/" },
};

export const portfolioContent = {
  en: {
    site: {
      ...sharedIdentity,
      role: "Web & Mobile Developer",
      description: "Web & Mobile Developer with 1+ year of experience building enterprise applications.",
      pages: {
        home: {
          eyebrow: "Web & Mobile Developer",
          heroTitle: "Building reliable web and mobile products end to end.",
          heroSubtitle: "Web & Mobile Developer with 1+ year of experience building enterprise applications with Next.js, React Native, NestJS, and ASP.NET Core, with a growing focus on backend engineering using Java and Spring Boot.",
          ctaHeading: "From architecture to production",
          ctaText: "I build reliable web and mobile products with clean architecture, thoughtful API design, and maintainable delivery practices.",
          primaryCtaLabel: "About my work",
          secondaryCtaLabel: "Get in touch",
          featuredSystemsLabel: "Systems featured",
          yearsExperienceLabel: "Years experience",
          capabilities: ["Web applications", "Mobile applications", "Backend integration"],
        },
        about: {
          eyebrow: "About me",
          title: "A web & mobile developer focused on dependable, scalable systems",
          subtitle: "At KAS Technology, I work across responsive web apps, cross-platform mobile apps, backend APIs, database design, integrations, and production support. Outside commercial work, I deepen my knowledge of distributed systems and backend architecture.",
          timelineHeading: "Experience",
          skillsHeading: "Core technology stack",
          skillsIntro: "A practical toolkit spanning web delivery, mobile development, backend services, databases, and modern system architecture.",
          projectsHeading: "Enterprise experience",
          projectsIntro: "Some product work is confidential under NDA. My contribution spans enterprise web and mobile delivery, backend API integration, production support, and performance improvements.",
          personalProjectHeading: "Personal project",
          personalProjectRoleLabel: "Role",
          personalProjectStackLabel: "Tech stack",
          personalProjectFocusLabel: "Learning focus",
        },
        contact: {
          eyebrow: "Contact",
          title: "Let’s discuss what you are building",
          subtitle: "Tell me about your product, timeline, or technical challenge. I will get back to you as soon as I can.",
        },
        notFound: {
          eyebrow: "404",
          title: "This page does not exist.",
          subtitle: "The page may have moved, been renamed, or is no longer available.",
          primaryLabel: "Go to home",
          secondaryLabel: "About me",
        },
      },
      location: "Ho Chi Minh, Vietnam",
    },
    about: {
      timeline: [
        { label: "Aug 2025 – Present", title: "Web & Mobile Developer · KAS Technology", detail: "Developing enterprise web and mobile products for hospitality, restaurant operations, and internal enterprise management." },
        { label: "Current focus", title: "Production web, mobile, and backend delivery", detail: "Building with Next.js, React Native, NestJS, and ASP.NET Core while designing databases, integrating APIs, and resolving production issues." },
        { label: "Continuous learning", title: "Distributed systems and backend architecture", detail: "Exploring microservices, event-driven architecture, Docker, Kafka, Redis, and scalable service-to-service communication through personal projects." },
      ],
      skillGroups: [
        { label: "Languages", items: ["TypeScript", "JavaScript", "C#", "Java", "C++", "SQL"] },
        { label: "Frontend", items: ["Next.js", "React.js", "React Native", "Expo", "HTML5", "CSS3", "Tailwind CSS"] },
        { label: "Backend", items: ["NestJS", "ASP.NET Core Web API", "Spring Boot", "RESTful API", "WebSocket", "JWT Authentication"] },
        { label: "Databases", items: ["PostgreSQL", "MongoDB", "MySQL"] },
        { label: "Messaging & Caching", items: ["Apache Kafka", "Redis"] },
        { label: "Tools & DevOps", items: ["Docker", "Docker Compose", "Git", "Postman", "Swagger", "Firebase", "Linux"] },
        { label: "Architecture", items: ["Clean Architecture", "Multi-tenant Systems", "Event-driven Architecture", "Microservices (learning)"] },
      ],
      personalProject: {
        title: "Microservice Social Platform",
        role: "Backend Developer · Learning Project",
        description: "A Spring Boot microservices project built to explore distributed systems and modern backend architecture.",
        stack: ["Spring Boot", "Spring Cloud", "Kafka", "Redis", "Keycloak", "Docker"],
        focus: ["API Gateway and service discovery with Spring Cloud", "JWT authentication and Keycloak", "Event-driven communication with Kafka", "Distributed cache with Redis", "Docker deployment and service-to-service communication"],
      },
    },
    navigation: { home: "Home", about: "About", contact: "Contact", languageLabel: "Switch to Vietnamese", cvLabel: "Download CV" },
    contactForm: { nameLabel: "Name", emailLabel: "Email", detailsLabel: "Project details", submitLabel: "Open Gmail draft", sendingLabel: "Opening Gmail...", successMessage: "A Gmail draft is ready. Review it, then send.", genericError: "Could not open Gmail. Please try again.", networkError: "Network issue. Please try again in a moment." },
  },
  vi: {
    site: {
      ...sharedIdentity,
      role: "Lập trình viên Web & Mobile",
      description: "Lập trình viên Web & Mobile với hơn một năm kinh nghiệm xây dựng ứng dụng doanh nghiệp.",
      pages: {
        home: {
          eyebrow: "Lập trình viên Web & Mobile",
          heroTitle: "Xây dựng sản phẩm web và mobile đáng tin cậy từ đầu đến cuối.",
          heroSubtitle: "Lập trình viên Web & Mobile với hơn một năm kinh nghiệm xây dựng ứng dụng doanh nghiệp bằng Next.js, React Native, NestJS và ASP.NET Core; đồng thời định hướng chuyên sâu backend với Java và Spring Boot.",
          ctaHeading: "Từ kiến trúc đến vận hành thực tế",
          ctaText: "Tôi xây dựng sản phẩm web và mobile đáng tin cậy với kiến trúc sạch, thiết kế API chỉn chu và quy trình phát triển dễ bảo trì.",
          primaryCtaLabel: "Công việc của tôi",
          secondaryCtaLabel: "Liên hệ",
          featuredSystemsLabel: "Hệ thống đã giới thiệu",
          yearsExperienceLabel: "Năm kinh nghiệm",
          capabilities: ["Ứng dụng web", "Ứng dụng mobile", "Tích hợp backend"],
        },
        about: {
          eyebrow: "Giới thiệu",
          title: "Lập trình viên Web & Mobile tập trung vào hệ thống ổn định, có khả năng mở rộng",
          subtitle: "Tại KAS Technology, tôi làm việc với ứng dụng web responsive, ứng dụng mobile đa nền tảng, backend API, thiết kế cơ sở dữ liệu, tích hợp hệ thống và hỗ trợ production. Ngoài công việc thương mại, tôi liên tục đào sâu về hệ thống phân tán và kiến trúc backend.",
          timelineHeading: "Kinh nghiệm",
          skillsHeading: "Công nghệ cốt lõi",
          skillsIntro: "Bộ công cụ thực tế cho web, mobile, dịch vụ backend, cơ sở dữ liệu và kiến trúc hệ thống hiện đại.",
          projectsHeading: "Kinh nghiệm sản phẩm doanh nghiệp",
          projectsIntro: "Một số sản phẩm thuộc phạm vi bảo mật theo NDA. Tôi đóng góp vào phát triển web và mobile doanh nghiệp, tích hợp backend API, hỗ trợ production và cải thiện hiệu năng.",
          personalProjectHeading: "Dự án cá nhân",
          personalProjectRoleLabel: "Vai trò",
          personalProjectStackLabel: "Công nghệ sử dụng",
          personalProjectFocusLabel: "Nội dung tìm hiểu",
        },
        contact: {
          eyebrow: "Liên hệ",
          title: "Hãy trao đổi về sản phẩm bạn đang xây dựng",
          subtitle: "Hãy chia sẻ về sản phẩm, thời gian triển khai hoặc thử thách kỹ thuật của bạn. Tôi sẽ phản hồi sớm nhất có thể.",
        },
        notFound: {
          eyebrow: "404",
          title: "Trang này không tồn tại.",
          subtitle: "Trang có thể đã được chuyển, đổi tên hoặc không còn khả dụng.",
          primaryLabel: "Về trang chủ",
          secondaryLabel: "Giới thiệu",
        },
      },
      location: "TP. Hồ Chí Minh, Việt Nam",
    },
    about: {
      timeline: [
        { label: "08/2025 – Hiện tại", title: "Lập trình viên Web & Mobile · KAS Technology", detail: "Phát triển sản phẩm web và mobile doanh nghiệp cho lĩnh vực hospitality, vận hành nhà hàng và quản lý nội bộ." },
        { label: "Trọng tâm hiện tại", title: "Phát triển web, mobile và backend cho production", detail: "Xây dựng với Next.js, React Native, NestJS và ASP.NET Core; đồng thời thiết kế cơ sở dữ liệu, tích hợp API và xử lý vấn đề production." },
        { label: "Học tập liên tục", title: "Hệ thống phân tán và kiến trúc backend", detail: "Tìm hiểu microservices, event-driven architecture, Docker, Kafka, Redis và giao tiếp giữa các dịch vụ qua dự án cá nhân." },
      ],
      skillGroups: [
        { label: "Ngôn ngữ", items: ["TypeScript", "JavaScript", "C#", "Java", "C++", "SQL"] },
        { label: "Frontend", items: ["Next.js", "React.js", "React Native", "Expo", "HTML5", "CSS3", "Tailwind CSS"] },
        { label: "Backend", items: ["NestJS", "ASP.NET Core Web API", "Spring Boot", "RESTful API", "WebSocket", "JWT Authentication"] },
        { label: "Cơ sở dữ liệu", items: ["PostgreSQL", "MongoDB", "MySQL"] },
        { label: "Messaging & Caching", items: ["Apache Kafka", "Redis"] },
        { label: "Công cụ & DevOps", items: ["Docker", "Docker Compose", "Git", "Postman", "Swagger", "Firebase", "Linux"] },
        { label: "Kiến trúc", items: ["Clean Architecture", "Multi-tenant Systems", "Event-driven Architecture", "Microservices (đang học)"] },
      ],
      personalProject: {
        title: "Nền tảng Mạng xã hội Microservice",
        role: "Backend Developer · Dự án học tập",
        description: "Dự án microservices với Spring Boot nhằm tìm hiểu hệ thống phân tán và kiến trúc backend hiện đại.",
        stack: ["Spring Boot", "Spring Cloud", "Kafka", "Redis", "Keycloak", "Docker"],
        focus: ["API Gateway và service discovery với Spring Cloud", "JWT authentication và Keycloak", "Giao tiếp event-driven với Kafka", "Distributed cache với Redis", "Triển khai Docker và giao tiếp giữa các service"],
      },
    },
    navigation: { home: "Trang chủ", about: "Giới thiệu", contact: "Liên hệ", languageLabel: "Chuyển sang tiếng Anh", cvLabel: "Tải CV" },
    contactForm: { nameLabel: "Họ và tên", emailLabel: "Email", detailsLabel: "Thông tin dự án", submitLabel: "Mở bản nháp Gmail", sendingLabel: "Đang mở Gmail...", successMessage: "Bản nháp Gmail đã sẵn sàng. Hãy kiểm tra rồi gửi.", genericError: "Không thể mở Gmail. Vui lòng thử lại.", networkError: "Lỗi kết nối. Vui lòng thử lại sau ít phút." },
  },
} satisfies Record<Locale, PortfolioContent>;

export const siteConfig = portfolioContent.en.site;
export const aboutContent = portfolioContent.en.about;
