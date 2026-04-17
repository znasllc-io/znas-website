export type Lang = "en" | "es";

export interface ProposalListStrings {
  title: string;
  subtitle: string;
  viewProposal: string;
  enterKey: string;
  access: string;
  cancel: string;
  verifying: string;
  noProposals: string;
  invalidKey: string;
  networkError: string;
  rateLimitMsg: (s: number) => string;
}

export interface ProposalViewerStrings {
  label: string;
  preparedFor: string;
  sections: { executiveSummary: string; roadmap: string; timeline: string; investment: string };
  download: {
    headline: string;
    subtitle: string;
    button: string;
    errorRefresh: string;
    errorFailed: string;
  };
  nav: { summary: string; roadmap: string; timeline: string; investment: string };
}

export interface ProposalGateStrings {
  enterKey: string;
  access: string;
  verifying: string;
  invalidKey: string;
  rateLimitMsg: (s: number) => string;
  unexpected: string;
  networkError: string;
}

export interface LangStrings {
  nav: {
    links: { label: string; href: string }[];
    proposals: string;
    back: string;
    partTime: string;
    availablePartTime: string;
    currentlyBooked: string;
    availabilityDesc: string;
    unavailabilityDesc: string;
    langButton: string;
    lightLabel: string;
    darkLabel: string;
  };
  hero: {
    tagline: string;
    subtitle: string;
    cta: string;
    scrollCta: string;
    cyclingTitles: string[];
  };
  about: {
    label: string;
    statement: string;
    bio: string;
    statLabels: [string, string, string, string, string, string];
  };
  expertise: {
    label: string;
    stackLayerLabels: string[];
    pillars: { title: string; description: string }[];
  };
  journey: {
    label: string;
    milestones: { role: string; description: string }[];
  };
  work: {
    label: string;
    challengeLabel: string;
    approachLabel: string;
    impactLabel: string;
    moreLabel: string;
    projects: { challenge: string; approach: string; impact: string }[];
  };
  testimonials: { label: string };
  contact: {
    label: string;
    headline: string[];
  };
  marquee: string;
  proposals: {
    list: ProposalListStrings;
    viewer: ProposalViewerStrings;
    gate: ProposalGateStrings;
    investment: { recommended: string };
    timeline: { status: { complete: string; "in-progress": string; upcoming: string } };
    modal: { privateProject: string; visitGitHub: string; cancel: string; close: string };
  };
}

export const translations: Record<Lang, LangStrings> = {
  en: {
    nav: {
      links: [
        { label: "About", href: "#about" },
        { label: "Expertise", href: "#expertise" },
        { label: "Journey", href: "#journey" },
        { label: "Work", href: "#work" },
        { label: "Testimonials", href: "#testimonials" },
        { label: "Contact", href: "#contact" },
      ],
      proposals: "Proposals",
      back: "Back",
      partTime: "Part-Time",
      availablePartTime: "Available Part-Time",
      currentlyBooked: "Currently Booked",
      availabilityDesc:
        "Jose is available 25 hours/week for consulting and architecture engagements. 2 clients currently in queue.",
      unavailabilityDesc:
        "Jose is currently focused on existing projects. Check back soon.",
      langButton: "ES",
      lightLabel: "Light",
      darkLabel: "Dark",
    },
    hero: {
      tagline: "Jose Sanz | Arizona, USA",
      subtitle:
        "17 years engineering systems at scale and helping small to large businesses with their technology goals.",
      cta: "Start a project →",
      scrollCta: "Scroll to explore",
      cyclingTitles: [
        "Software Architect",
        "AI Engineer",
        "Systems Engineer",
        "Mobile Developer",
        "Application Developer",
        "Tech Consultant",
      ],
    },
    about: {
      label: "About",
      statement: "I build the systems that organizations depend on to operate.",
      bio: "I'm Jose Sanz, founder of Znas LLC and co-founder of Visionarys. For over 17 years I've engineered and architected production software across healthcare, airlines, finance, and telecommunications.",
      statLabels: [
        "Years Engineering",
        "Industries",
        "Companies Founded",
        "AI Certified",
        "Bilingual",
        "Arizona, USA",
      ],
    },
    expertise: {
      label: "Expertise",
      stackLayerLabels: ["Systems", "Engineering", "Infrastructure", "AI & Strategy"],
      pillars: [
        {
          title: "System Architecture",
          description:
            "Designing distributed systems, microservices, and public APIs that handle real production load. From whiteboard to deployment across healthcare, airlines, finance, and telecom.",
        },
        {
          title: "Full-Stack Engineering",
          description:
            "End-to-end development across mobile, web, IoT, and blockchain. 17 years of shipping production software across multiple stacks and industries.",
        },
        {
          title: "AI & Emerging Tech",
          description:
            "MIT-certified in AI Business Strategy. Building AI-powered applications, intelligent agents, and developer tooling. Passionate about bridging the gap between cutting-edge AI research and real-world product engineering.",
        },
        {
          title: "Startup Leadership",
          description:
            "Founder of Znas LLC (2017) and Co-Founder of Visionarys (2025). Experienced in architecting teams, delegating technical work, and bridging engineering with business strategy.",
        },
      ],
    },
    journey: {
      label: "Journey",
      milestones: [
        {
          role: "Software Engineer",
          description:
            "Started my career building user-friendly applications for call center workflows. Engineered OOP-based software frameworks, conducted research on emerging technologies, and developed proofs of concept for new systems.",
        },
        {
          role: "Applications Developer",
          description:
            "Built enterprise applications within the global airline distribution and passenger data ecosystem at a leading GDS provider. Worked across high-compliance environments supporting both commercial aviation and regulated government data requirements, delivering production systems on distributed .NET platforms.",
        },
        {
          role: "Software Developer → Architect",
          description:
            "A 12-year career progression from Software Developer through Senior Developer, Lead Developer, and ultimately Junior Software Architect. Drove innovation across language platform infrastructure, distributed systems, and mobile.",
        },
        {
          role: "Founder & CEO",
          description:
            "Founded Znas LLC to bring deep software engineering expertise directly to organizations. Building scalable applications across healthcare, finance, airlines, and telecom. Open-source contributor and developer tooling author.",
        },
        {
          role: "Co-Founder & CEO",
          description:
            "Co-founded Visionarys to pursue the next chapter in AI-driven software and startup ventures. Combining 17 years of engineering depth with strategic product leadership.",
        },
      ],
    },
    work: {
      label: "Work",
      challengeLabel: "Challenge",
      approachLabel: "Approach",
      impactLabel: "Impact",
      moreLabel: "And many more →",
      projects: [
        {
          challenge:
            "Team communication tools lack contextual awareness, forcing manual coordination across fragmented workflows.",
          approach:
            "An AI-powered workplace agent and communication platform that brings context-aware automation into team collaboration.",
          impact:
            "Startup product shipping at Visionarys, bridging AI agents with real-time team workflows.",
        },
        {
          challenge:
            "Modern systems lack a purpose-built store for immutable, time-ordered graph data with full auditability.",
          approach:
            "An immutable time-series graph database built for systems that demand auditability, speed, and relational depth.",
          impact:
            "Open-source database engine enabling tamper-proof audit trails and fast temporal queries over connected data.",
        },
        {
          challenge:
            "Distributed systems teams waste weeks hand-writing async messaging boilerplate for every new service.",
          approach:
            "Go code generator that reads AsyncAPI specs and produces production-ready client and server code automatically.",
          impact:
            "Open-source tool eliminating manual boilerplate. Ships messaging infrastructure 10x faster.",
        },
        {
          challenge:
            "Hierarchical folder structures break down as projects and contexts multiply across a developer's filesystem.",
          approach:
            "Tag-based CLI that replaces rigid folders with composable, searchable metadata. Think tags, not trees.",
          impact:
            "Open-source. Enables cross-cutting organization without duplicating or moving files.",
        },
      ],
    },
    testimonials: { label: "Testimonials" },
    contact: {
      label: "Contact",
      headline: ["Let's build", "something real."],
    },
    marquee:
      "Software Architecture  /  Distributed Systems  /  Full-Stack Engineering  /  AI Strategy  /  Open Source  /  ",
    proposals: {
      list: {
        title: "Proposals",
        subtitle: "Select your organization to access your proposal.",
        viewProposal: "View Proposal →",
        enterKey: "Enter your proposal key",
        access: "Access",
        cancel: "Cancel",
        verifying: "Verifying...",
        noProposals: "No active proposals at this time.",
        invalidKey: "Invalid proposal key. Please try again.",
        networkError: "Network error. Please check your connection.",
        rateLimitMsg: (s) => `Too many attempts. Please wait ${s} seconds.`,
      },
      viewer: {
        label: "Proposal",
        preparedFor: "Prepared for",
        sections: {
          executiveSummary: "Executive Summary",
          roadmap: "Roadmap",
          timeline: "Timeline",
          investment: "Investment",
        },
        download: {
          headline: "Ready to move forward?",
          subtitle: "Download the full proposal document for your records.",
          button: "Download Full Proposal",
          errorRefresh: "Unable to download. Please refresh and try again.",
          errorFailed: "Download failed. Please try again.",
        },
        nav: {
          summary: "Summary",
          roadmap: "Roadmap",
          timeline: "Timeline",
          investment: "Investment",
        },
      },
      gate: {
        enterKey: "Enter your proposal key",
        access: "Access Proposal",
        verifying: "Verifying...",
        invalidKey: "Invalid proposal key. Please try again.",
        rateLimitMsg: (s) => `Too many attempts. Please wait ${s} seconds.`,
        unexpected: "Something went wrong. Please try again.",
        networkError: "Network error. Please check your connection.",
      },
      investment: { recommended: "Recommended" },
      timeline: {
        status: {
          complete: "complete",
          "in-progress": "in-progress",
          upcoming: "upcoming",
        },
      },
      modal: {
        privateProject: "Private project — no public repository",
        visitGitHub: "Visit on GitHub",
        cancel: "Cancel",
        close: "Close",
      },
    },
  },

  es: {
    nav: {
      links: [
        { label: "Acerca", href: "#about" },
        { label: "Experiencia", href: "#expertise" },
        { label: "Trayectoria", href: "#journey" },
        { label: "Proyectos", href: "#work" },
        { label: "Testimonios", href: "#testimonials" },
        { label: "Contacto", href: "#contact" },
      ],
      proposals: "Propuestas",
      back: "Volver",
      partTime: "Medio Tiempo",
      availablePartTime: "Disponible Medio Tiempo",
      currentlyBooked: "Actualmente Reservado",
      availabilityDesc:
        "José está disponible 25 horas/semana para consultorías y proyectos de arquitectura. 2 clientes actualmente en lista.",
      unavailabilityDesc:
        "José está enfocado en proyectos existentes. Vuelve pronto.",
      langButton: "EN",
      lightLabel: "Claro",
      darkLabel: "Oscuro",
    },
    hero: {
      tagline: "José Sanz | Arizona, EE.UU.",
      subtitle:
        "17 años diseñando sistemas a escala y ayudando a empresas de todos los tamaños con sus objetivos tecnológicos.",
      cta: "Iniciar un proyecto →",
      scrollCta: "Desplaza para explorar",
      cyclingTitles: [
        "Arquitecto de Software",
        "Ingeniero de IA",
        "Ingeniero de Sistemas",
        "Desarrollador Móvil",
        "Desarrollador de Aplicaciones",
        "Consultor Tecnológico",
      ],
    },
    about: {
      label: "Acerca",
      statement: "Construyo los sistemas que las organizaciones necesitan para operar.",
      bio: "Soy José Sanz, fundador de Znas LLC y cofundador de Visionarys. Durante más de 17 años he diseñado y arquitectado software de producción en salud, aerolíneas, finanzas y telecomunicaciones.",
      statLabels: [
        "Años de Experiencia",
        "Industrias",
        "Empresas Fundadas",
        "Certificado en IA",
        "Bilingüe",
        "Arizona, EE.UU.",
      ],
    },
    expertise: {
      label: "Experiencia",
      stackLayerLabels: ["Sistemas", "Ingeniería", "Infraestructura", "IA y Estrategia"],
      pillars: [
        {
          title: "Arquitectura de Sistemas",
          description:
            "Diseño de sistemas distribuidos, microservicios y APIs públicas que manejan carga real en producción. Del whiteboard al despliegue en salud, aerolíneas, finanzas y telecomunicaciones.",
        },
        {
          title: "Ingeniería Full-Stack",
          description:
            "Desarrollo integral en móvil, web, IoT y blockchain. 17 años enviando software de producción en múltiples stacks e industrias.",
        },
        {
          title: "IA y Tecnología Emergente",
          description:
            "Certificado por MIT en Estrategia de Negocios con IA. Construyendo aplicaciones impulsadas por IA, agentes inteligentes y herramientas para desarrolladores. Apasionado por cerrar la brecha entre la investigación de IA de vanguardia y la ingeniería de productos real.",
        },
        {
          title: "Liderazgo de Startups",
          description:
            "Fundador de Znas LLC (2017) y Cofundador de Visionarys (2025). Experiencia en arquitectar equipos, delegar trabajo técnico y conectar ingeniería con estrategia de negocio.",
        },
      ],
    },
    journey: {
      label: "Trayectoria",
      milestones: [
        {
          role: "Ingeniero de Software",
          description:
            "Comencé mi carrera desarrollando aplicaciones para flujos de trabajo de centros de llamadas. Diseñé frameworks de software basados en POO, realicé investigación sobre tecnologías emergentes y desarrollé pruebas de concepto para nuevos sistemas.",
        },
        {
          role: "Desarrollador de Aplicaciones",
          description:
            "Construí aplicaciones empresariales dentro del ecosistema global de distribución aérea y datos de pasajeros en un proveedor GDS líder. Trabajé en entornos de alto cumplimiento que soportaban aviación comercial y requerimientos regulatorios gubernamentales, entregando sistemas en producción sobre plataformas .NET distribuidas.",
        },
        {
          role: "Desarrollador de Software → Arquitecto",
          description:
            "Una progresión de 12 años desde Desarrollador de Software hasta Desarrollador Senior, Líder de Desarrollo y finalmente Arquitecto de Software Junior. Impulsé la innovación en infraestructura de plataforma de idiomas, sistemas distribuidos y móvil.",
        },
        {
          role: "Fundador y CEO",
          description:
            "Fundé Znas LLC para llevar experiencia profunda en ingeniería de software directamente a organizaciones. Construyendo aplicaciones escalables en salud, finanzas, aerolíneas y telecomunicaciones. Contribuidor de código abierto y autor de herramientas para desarrolladores.",
        },
        {
          role: "Cofundador y CEO",
          description:
            "Cofundé Visionarys para perseguir el próximo capítulo en software impulsado por IA y emprendimientos de startups. Combinando 17 años de profundidad en ingeniería con liderazgo estratégico de producto.",
        },
      ],
    },
    work: {
      label: "Proyectos",
      challengeLabel: "Desafío",
      approachLabel: "Enfoque",
      impactLabel: "Impacto",
      moreLabel: "Y muchos más →",
      projects: [
        {
          challenge:
            "Las herramientas de comunicación en equipo carecen de conciencia contextual, forzando coordinación manual en flujos de trabajo fragmentados.",
          approach:
            "Un agente de trabajo impulsado por IA y plataforma de comunicación que lleva automatización consciente del contexto a la colaboración en equipo.",
          impact:
            "Producto de startup en producción en Visionarys, conectando agentes de IA con flujos de trabajo en tiempo real.",
        },
        {
          challenge:
            "Los sistemas modernos carecen de un almacén diseñado para datos de grafo inmutables y ordenados en el tiempo con plena auditabilidad.",
          approach:
            "Una base de datos de grafo de series temporales inmutable construida para sistemas que demandan auditabilidad, velocidad y profundidad relacional.",
          impact:
            "Motor de base de datos de código abierto que permite registros de auditoría a prueba de manipulación y consultas temporales rápidas sobre datos conectados.",
        },
        {
          challenge:
            "Los equipos de sistemas distribuidos pierden semanas escribiendo manualmente el boilerplate de mensajería asíncrona para cada nuevo servicio.",
          approach:
            "Generador de código en Go que lee especificaciones AsyncAPI y produce automáticamente código de cliente y servidor listo para producción.",
          impact:
            "Herramienta de código abierto que elimina el boilerplate manual. Entrega infraestructura de mensajería 10x más rápido.",
        },
        {
          challenge:
            "Las estructuras jerárquicas de carpetas fallan cuando los proyectos y contextos se multiplican en el sistema de archivos de un desarrollador.",
          approach:
            "CLI basado en etiquetas que reemplaza carpetas rígidas con metadatos componibles y buscables. Etiquetas, no árboles.",
          impact:
            "Código abierto. Permite organización transversal sin duplicar ni mover archivos.",
        },
      ],
    },
    testimonials: { label: "Testimonios" },
    contact: {
      label: "Contacto",
      headline: ["Construyamos", "algo real."],
    },
    marquee:
      "Arquitectura de Software  /  Sistemas Distribuidos  /  Ingeniería Full-Stack  /  Estrategia de IA  /  Código Abierto  /  ",
    proposals: {
      list: {
        title: "Propuestas",
        subtitle: "Selecciona tu organización para acceder a tu propuesta.",
        viewProposal: "Ver Propuesta →",
        enterKey: "Ingresa tu clave de propuesta",
        access: "Acceder",
        cancel: "Cancelar",
        verifying: "Verificando...",
        noProposals: "No hay propuestas activas en este momento.",
        invalidKey: "Clave de propuesta inválida. Por favor intenta de nuevo.",
        networkError: "Error de red. Por favor verifica tu conexión.",
        rateLimitMsg: (s) => `Demasiados intentos. Por favor espera ${s} segundos.`,
      },
      viewer: {
        label: "Propuesta",
        preparedFor: "Preparado para",
        sections: {
          executiveSummary: "Resumen Ejecutivo",
          roadmap: "Hoja de Ruta",
          timeline: "Cronograma",
          investment: "Inversión",
        },
        download: {
          headline: "¿Listo para avanzar?",
          subtitle: "Descarga el documento completo de la propuesta para tus registros.",
          button: "Descargar Propuesta Completa",
          errorRefresh: "No se pudo descargar. Por favor recarga e intenta de nuevo.",
          errorFailed: "La descarga falló. Por favor intenta de nuevo.",
        },
        nav: {
          summary: "Resumen",
          roadmap: "Hoja de Ruta",
          timeline: "Cronograma",
          investment: "Inversión",
        },
      },
      gate: {
        enterKey: "Ingresa tu clave de propuesta",
        access: "Acceder a Propuesta",
        verifying: "Verificando...",
        invalidKey: "Clave de propuesta inválida. Por favor intenta de nuevo.",
        rateLimitMsg: (s) => `Demasiados intentos. Por favor espera ${s} segundos.`,
        unexpected: "Algo salió mal. Por favor intenta de nuevo.",
        networkError: "Error de red. Por favor verifica tu conexión.",
      },
      investment: { recommended: "Recomendado" },
      timeline: {
        status: {
          complete: "Completado",
          "in-progress": "En progreso",
          upcoming: "Próximo",
        },
      },
      modal: {
        privateProject: "Proyecto privado — sin repositorio público",
        visitGitHub: "Ver en GitHub",
        cancel: "Cancelar",
        close: "Cerrar",
      },
    },
  },
};
