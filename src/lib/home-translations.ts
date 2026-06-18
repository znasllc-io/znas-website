import type { Lang } from "@/lib/translations";

/**
 * Main-site (FDE) copy in both languages. Lives next to translations.ts but
 * in its own module so the home namespace stays reviewable in isolation.
 * Components read it via the same useLanguage() context as the portfolio.
 */

export interface HomeStrings {
  nav: { portfolio: string; bookACall: string; engagements: string };
  hero: {
    label: string;
    h1a: string;
    h1b: string;
    subBrand: string;
    subIsA: string;
    subFirm: string;
    subLine2: string;
    subLine3: string;
    bookACall: string;
    seeHow: string;
  };
  problem: {
    label: string;
    statLead: string;
    statBold: string;
    statLine2: string;
    statLine3Pre: string;
    statLine3Em: string;
    source: string;
    headline: string;
    columns: { title: string; body: string }[];
  };
  engineer: {
    brandSub: string;
    h2The: string;
    h2Engineer: string;
    h2Who: string;
    h2Stays: string;
    h2UntilIt: string;
    h2Works: string;
    para: string;
    traits: { title: string; body: string }[];
    bannerTop: string;
    bannerBottom: string;
  };
  howItWorks: {
    label: string;
    headline: string;
    sub1: string;
    sub2: string;
    steps: { num: string; title: string; lead: string; body: string }[];
  };
  whyZnas: {
    label: string;
    headline: string;
    subPre: string;
    subEm: string;
    bigStats: { value: string; label: string }[];
    credentials: { value: string; label: string }[];
    cta: string;
  };
  caseStudies: {
    headline: string;
    sub: string;
    backLink: string;
    results: string;
  };
  createdBy: {
    headline: string;
    memqlLabel: string;
    copresentLabel: string;
    knowMore: string;
  };
  quotes: {
    h2a: string;
    h2b: string;
    h2c: string;
    h2d: string;
    items: { text: string; name: string; role: string }[];
  };
  scoping: {
    h2a: string;
    h2b: string;
    h2c: string;
    h2d: string;
    sub: string;
    formTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    blockingLabel: string;
    blockingPlaceholder: string;
    submit: string;
    note: string;
    mailSubject: (name: string, company: string) => string;
    mailBody: (name: string, company: string, message: string) => string;
  };
  faq: {
    items: { q: string; a: string }[];
    tableHeadCto: string;
    tableHeadFde: string;
    tableRows: [string, string, string][];
  };
  products: {
    memql: { label: string; h2a: string; h2b: string; body: string; byline: string; cta: string };
    copresent: { label: string; h2a: string; h2b: string; body: string; byline: string; cta: string };
  };
  footer: {
    aboutHeading: string;
    /** Short 1–2 sentence version shown in the footer. */
    aboutSummary: string;
    /** Full bio, broken into readable paragraphs for the About section. */
    aboutParagraphs: string[];
    tagline1: string;
    tagline2: string;
    navHeading: string;
    navLinks: { problem: string; howItWorks: string; whyJose: string; startProject: string };
    joseHeading: string;
    joseLinks: { about: string; portfolio: string; github: string; linkedin: string };
    contactHeading: string;
    contactStartProject: string;
    bottomBrand: string;
    bottomPortfolio: string;
    bottomBook: string;
  };
}

export const homeTranslations: Record<Lang, HomeStrings> = {
  en: {
    nav: { portfolio: "Portfolio", bookACall: "Book a Call", engagements: "Engagements" },
    hero: {
      label: "Forward Deployed Engineering",
      h1a: "I Build AI Systems",
      h1b: "That Run in Production",
      subBrand: "ZNAS",
      subIsA: " is a ",
      subFirm: "Forward Deployed AI Engineering firm.",
      subLine2: "I embed with your team, build the AI system in your actual operation,",
      subLine3: "and own the outcome until it runs.",
      bookACall: "Book a Call",
      seeHow: "See How It Works",
    },
    problem: {
      label: "The Problem",
      statLead: "of enterprise AI pilots ",
      statBold: "never generate measurable business impact.",
      statLine2: "And it's because of deployment. The demo works.",
      statLine3Pre: "Then it hits your real infrastructure and ",
      statLine3Em: "stops",
      source: "MIT NANDA Report, 2025 · Forward Deployed Engineering is the answer.",
      headline: "Most AI Projects Never Leave the Pilot Phase",
      columns: [
        {
          title: "You Have the Tools but Your Workflows Didn't Change",
          body: "You're paying for AI licenses. Your team used them. But your operation runs exactly the same. That's not an AI problem, that's an integration problem.",
        },
        {
          title: "This Skill Set Is Rare",
          body: "Most engineers build demos. Few know how to take AI into a real business environment. That gap is exactly what I solve.",
        },
        {
          title: "Your Pilot Worked. Your Production Didn't.",
          body: "The demo ran great. But now you have a prototype nobody maintains and an operation that still runs manually. I stay until the system runs in production.",
        },
      ],
    },
    engineer: {
      brandSub: "Forward Deployed Engineering",
      h2The: "The",
      h2Engineer: "Engineer",
      h2Who: "Who",
      h2Stays: "Stays",
      h2UntilIt: "Until It",
      h2Works: "Works",
      para: "Forward Deployed is military language for being at the front line. Most engineers build things. An FDE ships them inside your environment, with your data, on your constraints, and owns the outcome until it's live.",
      traits: [
        {
          title: "Embeds With Your Team",
          body: "Lives inside your systems, until he understands the real problem.",
        },
        {
          title: "Writes Production Code",
          body: "The same person who scopes the problem builds the system and deploys it.",
        },
        {
          title: "Owns the Outcome",
          body: "Stays until it's in production, stable, and your team can run it. That's the difference.",
        },
      ],
      bannerTop: "A consultant delivers a document",
      bannerBottom: "A Forward Deployed Engineer delivers a working system",
    },
    howItWorks: {
      label: "How It Works",
      headline: "From Stuck Pilot to Running System",
      sub1: "Every engagement follows the same structure.",
      sub2: "You bring the problem. I map it, build it, and ship it.",
      steps: [
        {
          num: "01",
          title: "Scoping",
          lead: "Find the real problem",
          body: "In a discovery meeting I find the actual bottleneck, and define a technical plan.",
        },
        {
          num: "02",
          title: "Prototyping",
          lead: "I prove it works fast",
          body: "I create something that actually works in your environment.",
        },
        {
          num: "03",
          title: "Deployment",
          lead: "I ship to production",
          body: "I connect every integration point and ship a system your team can actually operate.",
        },
        {
          num: "04",
          title: "Handoff",
          lead: "Your team can run it",
          body: "I train your team, document the system, and stay until they can operate it without me.",
        },
      ],
    },
    whyZnas: {
      label: "Why ZNAS",
      headline: "I've Been Building Production Systems for 17 Years",
      subPre: "Not advising on them. ",
      subEm: "Building them.",
      bigStats: [
        { value: "17+", label: "Years in Production" },
        { value: "07", label: "Industries" },
        { value: "02", label: "Companies Founded" },
      ],
      credentials: [
        { value: "MIT", label: "IA Certificates" },
        { value: "EN/ES", label: "Bilingual" },
        { value: "USA", label: "Based · Remote-Ready" },
      ],
      cta: "View Full Portfolio",
    },
    caseStudies: {
      headline: "Projects & Case Studies",
      sub: "Real environments, real constraints, running in production",
      backLink: "← All Projects",
      results: "Results",
    },
    createdBy: {
      headline: "Created by ZNAS",
      memqlLabel: "Open Source · AI Harness",
      copresentLabel: "Multi-Agent Workspace",
      knowMore: "Know More",
    },
    quotes: {
      h2a: "What People Say About",
      h2b: "Working",
      h2c: "With",
      h2d: "ZNAS",
      items: [
        {
          text: "José is an extremely competent AI developer. In a very short time, he put together architectural documentation, determined which components each team member could take on and quickly delegated work. After development was complete, he also jumped into presenting to a community of software developers and technologists as part of an AI-focused workshop series.",
          name: "Aaron Eden",
          role: "AI Process Automation · Intuit",
        },
        {
          text: "I can't say enough good things about Jose. He did not disappoint. His technical skills are top notch, but more than that, he has a firm grasp of the soft skills necessary to help a team work better together. If you need a software developer to lead your team who also has a firm grasp of the business side, Jose is your guy.",
          name: "Allen Trevethan",
          role: "Technologist & Entrepreneur",
        },
        {
          text: "Jose is an excellent software engineer, professional, and co-worker. I witnessed Jose drive innovation and excel as a software developer at CyraCom. Jose is a great mentor and has excellent leadership abilities. Any company would benefit from having Jose as a Lead Software Engineer or Architect on their team.",
          name: "Stephen Miller",
          role: "Senior Software Engineer, University of North Dakota",
        },
      ],
    },
    scoping: {
      h2a: "If Your AI",
      h2b: "Implementation",
      h2c: "Is Stuck, ",
      h2d: "Let's Talk.",
      sub: "A scoping call takes 30 minutes. You leave with a clear diagnosis of what's blocking it.",
      formTitle: "Book a Scoping Call",
      nameLabel: "Your Name",
      namePlaceholder: "Jane Smith",
      companyLabel: "Company",
      companyPlaceholder: "Acme Corp",
      blockingLabel: "What's Blocking Your AI Project?",
      blockingPlaceholder: "Describe where it's stuck — even if it's vague. I'll figure out the rest.",
      submit: "Book a Scoping Call →",
      note: "I personally review every message. You'll hear back within 24 hours.",
      mailSubject: (name, company) => `Scoping call — ${name}${company ? ` (${company})` : ""}`,
      mailBody: (name, company, message) =>
        `Name: ${name}\nCompany: ${company}\n\nWhat's blocking the AI project:\n${message}`,
    },
    faq: {
      items: [
        {
          q: "What is exactly a Forward Deployed Engineer?",
          a: "A Forward Deployed Engineer is an engineer who embeds directly with your team. He works with your real data, your real infrastructure, your real constraints and owns the outcome until the system is running in production. Not a consultant who delivers recommendations. The same person who scopes the problem builds and ships the solution.",
        },
        {
          q: "What is the difference between a Forward Deployed Engineer and a Fractional CTO?",
          a: "",
        },
        {
          q: "Do I need a technical team to work with ZNAS?",
          a: "No. I work directly with founders and operators. If you have a technical team, I integrate with them. If you don't, I build the system in a way your team can operate without depending on constant outside support.",
        },
        {
          q: "What kind of AI projects does ZNAS build?",
          a: "AI agents that automate internal processes, LLM integrations with existing systems (CRMs, ERPs, databases), retrieval pipelines, and AI systems that connect with the real operation of the business.",
        },
        {
          q: "I already paid for AI licenses and I'm not seeing results. Can you help?",
          a: "That's exactly the most common profile I work with. ChatGPT, Claude, or Gemini licenses give you access to the model. They don't give you the system. The difference between having access to AI and having AI integrated into your operation is exactly what I build.",
        },
      ],
      tableHeadCto: "Fractional CTO",
      tableHeadFde: "Forward Deployed Engineer",
      tableRows: [
        ["Primary focus", "Technical leadership and strategy", "Building and deploying in production"],
        ["Deliverable", "Roadmap, architecture decisions, team direction", "Working system running in production"],
        ["Writes code", "Rarely", "Yes — always"],
        ["Owns the outcome", "Partially", "Total — stays until it runs"],
        [
          "Ideal when",
          "You need senior technical direction at the executive level",
          "Your AI project is stuck or not reaching production",
        ],
        ["Works from", "Meetings, documents, decisions", "Inside your stack, your data, your team"],
      ],
    },
    products: {
      memql: {
        label: "Open Source · AI Harness",
        h2a: "Distributed AI-native memory graph built",
        h2b: "for production agent systems",
        body: "Open-source memory layer for AI agents, built as a declarative language, not a library. You describe behavior (concepts, queries, automations, memory) and the engine runs it on PostgreSQL + TimescaleDB. Memory that behaves like a mind: episodic observations consolidate into semantic knowledge, and recall() blends recency × relevance in a single query. Event-driven, multi-tenant, distributed — and in production today.",
        byline: "Designed and built end-to-end by one founder",
        cta: "Visit memql.io",
      },
      copresent: {
        label: "Multi-Agent Workspace",
        h2a: "Real-time multi-agent",
        h2b: "collaboration workspace",
        body: "The place where all your business data sources connect in a single space and become actionable intelligence. The AI monitors, analyzes, and presents you with the complete context. No navigating files. No reports. No wasting time on manual work the AI can do. So that you, and your team, can focus on what only humans do: think, analyze, and decide.",
        byline: "CoPresent is built by Visionarys, the AI company founded by José Sanz to ship production AI systems.",
        cta: "Join the Guest List",
      },
    },
    footer: {
      aboutHeading: "About José Sanz — Forward Deployed AI Engineer",
      aboutSummary:
        "José Sanz is a Forward Deployed AI Engineer and founder of ZNAS LLC — he embeds with client teams to take stalled AI initiatives from pilot to running production, and owns the outcome until it runs.",
      aboutParagraphs: [
        "José Sanz is a Forward Deployed AI Engineer and the founder of ZNAS LLC, a Forward Deployed AI Engineering firm based in Arizona serving businesses across the United States. With 17 years of experience building production systems across healthcare, airlines, finance, and telecommunications, and AI Strategy certification from MIT Sloan, José specializes in taking AI initiatives from stuck pilot to running production system.",
        "He embeds directly with client teams to scope the real problem, build production-grade AI systems — including retrieval pipelines, agent infrastructure, and LLM integrations into existing codebases — and owns the outcome until the team can operate the system independently.",
        "ZNAS LLC engagements serve CEOs and founders of companies with 20 to 200 employees whose AI implementations have stalled after a first vendor or consultant attempt. José is also co-founder of Visionarys and the creator of open-source engineering tools including asyncapi-codegen and MemQL.",
      ],
      tagline1: "Forward Deployed AI Engineering",
      tagline2: "United States · Remote-Ready",
      navHeading: "Navigation",
      navLinks: {
        problem: "The Problem",
        howItWorks: "How It Works",
        whyJose: "Why José",
        startProject: "Start a Project",
      },
      joseHeading: "José Sanz",
      joseLinks: {
        about: "About",
        portfolio: "Technical Portfolio",
        github: "GitHub",
        linkedin: "LinkedIn",
      },
      contactHeading: "Contact",
      contactStartProject: "Start a project",
      bottomBrand: "ZNAS LLC — Forward Deployed Engineering",
      bottomPortfolio: "Portfolio",
      bottomBook: "Book a Call",
    },
  },

  es: {
    nav: { portfolio: "Portafolio", bookACall: "Agenda una llamada", engagements: "Compromisos" },
    hero: {
      label: "Ingeniería Forward Deployed",
      h1a: "Construyo sistemas de IA",
      h1b: "que corren en producción",
      subBrand: "ZNAS",
      subIsA: " es una ",
      subFirm: "firma de ingeniería de IA Forward Deployed.",
      subLine2: "Me integro con tu equipo, construyo el sistema de IA en tu operación real,",
      subLine3: "y me hago cargo del resultado hasta que funciona.",
      bookACall: "Agenda una llamada",
      seeHow: "Mira cómo funciona",
    },
    problem: {
      label: "El problema",
      statLead: "de los pilotos de IA empresariales ",
      statBold: "nunca generan impacto de negocio medible.",
      statLine2: "Y la causa es el despliegue. El demo funciona.",
      statLine3Pre: "Luego llega a tu infraestructura real y ",
      statLine3Em: "se detiene",
      source: "Informe MIT NANDA, 2025 · La ingeniería Forward Deployed es la respuesta.",
      headline: "La mayoría de los proyectos de IA nunca salen del piloto",
      columns: [
        {
          title: "Tienes las herramientas pero tus flujos no cambiaron",
          body: "Pagas licencias de IA. Tu equipo las usó. Pero tu operación funciona exactamente igual. Eso no es un problema de IA, es un problema de integración.",
        },
        {
          title: "Este perfil es escaso",
          body: "La mayoría de los ingenieros construyen demos. Pocos saben llevar la IA a un entorno de negocio real. Esa brecha es exactamente lo que yo resuelvo.",
        },
        {
          title: "Tu piloto funcionó. Tu producción no.",
          body: "El demo corrió de maravilla. Pero ahora tienes un prototipo que nadie mantiene y una operación que sigue siendo manual. Yo me quedo hasta que el sistema corre en producción.",
        },
      ],
    },
    engineer: {
      brandSub: "Ingeniería Forward Deployed",
      h2The: "El",
      h2Engineer: "ingeniero",
      h2Who: "que se",
      h2Stays: "queda",
      h2UntilIt: "hasta que",
      h2Works: "funciona",
      para: "Forward Deployed es lenguaje militar para estar en la primera línea. La mayoría de los ingenieros construyen cosas. Un FDE las entrega dentro de tu entorno, con tus datos, con tus restricciones, y se hace cargo del resultado hasta que está en vivo.",
      traits: [
        {
          title: "Se integra con tu equipo",
          body: "Vive dentro de tus sistemas, hasta entender el problema real.",
        },
        {
          title: "Escribe código de producción",
          body: "La misma persona que define el problema construye el sistema y lo despliega.",
        },
        {
          title: "Se hace cargo del resultado",
          body: "Se queda hasta que está en producción, estable, y tu equipo puede operarlo. Esa es la diferencia.",
        },
      ],
      bannerTop: "Un consultor entrega un documento",
      bannerBottom: "Un ingeniero Forward Deployed entrega un sistema funcionando",
    },
    howItWorks: {
      label: "Cómo funciona",
      headline: "De piloto estancado a sistema en producción",
      sub1: "Cada proyecto sigue la misma estructura.",
      sub2: "Tú traes el problema. Yo lo mapeo, lo construyo y lo entrego.",
      steps: [
        {
          num: "01",
          title: "Alcance",
          lead: "Encontrar el problema real",
          body: "En una reunión de descubrimiento encuentro el cuello de botella real y defino un plan técnico.",
        },
        {
          num: "02",
          title: "Prototipo",
          lead: "Pruebo que funciona, rápido",
          body: "Creo algo que funciona de verdad en tu entorno.",
        },
        {
          num: "03",
          title: "Despliegue",
          lead: "Lo llevo a producción",
          body: "Conecto cada punto de integración y entrego un sistema que tu equipo puede operar de verdad.",
        },
        {
          num: "04",
          title: "Entrega",
          lead: "Tu equipo puede operarlo",
          body: "Capacito a tu equipo, documento el sistema y me quedo hasta que puedan operarlo sin mí.",
        },
      ],
    },
    whyZnas: {
      label: "Por qué ZNAS",
      headline: "Llevo 17 años construyendo sistemas de producción",
      subPre: "No asesorando sobre ellos. ",
      subEm: "Construyéndolos.",
      bigStats: [
        { value: "17+", label: "Años en producción" },
        { value: "07", label: "Industrias" },
        { value: "02", label: "Empresas fundadas" },
      ],
      credentials: [
        { value: "MIT", label: "Certificados de IA" },
        { value: "EN/ES", label: "Bilingüe" },
        { value: "USA", label: "Base · Listo para remoto" },
      ],
      cta: "Ver portafolio completo",
    },
    caseStudies: {
      headline: "Proyectos y casos de estudio",
      sub: "Entornos reales, restricciones reales, corriendo en producción",
      backLink: "← Todos los proyectos",
      results: "Resultados",
    },
    createdBy: {
      headline: "Creado por ZNAS",
      memqlLabel: "Open Source · AI Harness",
      copresentLabel: "Espacio de trabajo multiagente",
      knowMore: "Saber más",
    },
    quotes: {
      h2a: "Lo que dicen de",
      h2b: "trabajar",
      h2c: "con",
      h2d: "ZNAS",
      items: [
        {
          text: "José es un desarrollador de IA extremadamente competente. En muy poco tiempo armó la documentación de arquitectura, determinó qué componentes podía tomar cada miembro del equipo y delegó el trabajo con rapidez. Al terminar el desarrollo, también se lanzó a presentar ante una comunidad de desarrolladores y tecnólogos como parte de una serie de talleres enfocados en IA.",
          name: "Aaron Eden",
          role: "AI Process Automation · Intuit",
        },
        {
          text: "No tengo suficientes palabras buenas sobre José. No decepcionó. Sus habilidades técnicas son de primer nivel, pero más que eso, domina las habilidades blandas necesarias para que un equipo trabaje mejor junto. Si necesitas un desarrollador que lidere tu equipo y que además entienda el lado del negocio, José es tu persona.",
          name: "Allen Trevethan",
          role: "Tecnólogo y emprendedor",
        },
        {
          text: "José es un excelente ingeniero de software, profesional y compañero. Fui testigo de cómo impulsó la innovación y destacó como desarrollador en CyraCom. Es un gran mentor con excelentes habilidades de liderazgo. Cualquier empresa se beneficiaría de tener a José como Ingeniero Líder o Arquitecto en su equipo.",
          name: "Stephen Miller",
          role: "Ingeniero de Software Senior, University of North Dakota",
        },
      ],
    },
    scoping: {
      h2a: "Si tu implementación",
      h2b: "de IA está",
      h2c: "estancada, ",
      h2d: "hablemos.",
      sub: "Una llamada de alcance toma 30 minutos. Sales con un diagnóstico claro de qué la está bloqueando.",
      formTitle: "Agenda una llamada de alcance",
      nameLabel: "Tu nombre",
      namePlaceholder: "Juana Pérez",
      companyLabel: "Empresa",
      companyPlaceholder: "Acme Corp",
      blockingLabel: "¿Qué está bloqueando tu proyecto de IA?",
      blockingPlaceholder: "Describe dónde está atorado — aunque sea vago. Yo resuelvo el resto.",
      submit: "Agendar llamada de alcance →",
      note: "Reviso personalmente cada mensaje. Tendrás respuesta en menos de 24 horas.",
      mailSubject: (name, company) => `Llamada de alcance — ${name}${company ? ` (${company})` : ""}`,
      mailBody: (name, company, message) =>
        `Nombre: ${name}\nEmpresa: ${company}\n\nQué está bloqueando el proyecto de IA:\n${message}`,
    },
    faq: {
      items: [
        {
          q: "¿Qué es exactamente un Forward Deployed Engineer?",
          a: "Un Forward Deployed Engineer es un ingeniero que se integra directamente con tu equipo. Trabaja con tus datos reales, tu infraestructura real, tus restricciones reales, y se hace cargo del resultado hasta que el sistema corre en producción. No es un consultor que entrega recomendaciones. La misma persona que define el problema construye y entrega la solución.",
        },
        {
          q: "¿Cuál es la diferencia entre un Forward Deployed Engineer y un CTO fraccional?",
          a: "",
        },
        {
          q: "¿Necesito un equipo técnico para trabajar con ZNAS?",
          a: "No. Trabajo directamente con fundadores y operadores. Si tienes un equipo técnico, me integro con ellos. Si no, construyo el sistema de forma que tu equipo pueda operarlo sin depender de soporte externo constante.",
        },
        {
          q: "¿Qué tipo de proyectos de IA construye ZNAS?",
          a: "Agentes de IA que automatizan procesos internos, integraciones de LLM con sistemas existentes (CRMs, ERPs, bases de datos), pipelines de recuperación, y sistemas de IA que se conectan con la operación real del negocio.",
        },
        {
          q: "Ya pagué licencias de IA y no veo resultados. ¿Puedes ayudar?",
          a: "Ese es exactamente el perfil más común con el que trabajo. Las licencias de ChatGPT, Claude o Gemini te dan acceso al modelo. No te dan el sistema. La diferencia entre tener acceso a la IA y tener la IA integrada en tu operación es exactamente lo que yo construyo.",
        },
      ],
      tableHeadCto: "CTO fraccional",
      tableHeadFde: "Forward Deployed Engineer",
      tableRows: [
        ["Enfoque principal", "Liderazgo técnico y estrategia", "Construir y desplegar en producción"],
        ["Entregable", "Roadmap, decisiones de arquitectura, dirección del equipo", "Sistema funcionando en producción"],
        ["Escribe código", "Rara vez", "Sí — siempre"],
        ["Se hace cargo del resultado", "Parcialmente", "Total — se queda hasta que funciona"],
        [
          "Ideal cuando",
          "Necesitas dirección técnica senior a nivel ejecutivo",
          "Tu proyecto de IA está estancado o no llega a producción",
        ],
        ["Trabaja desde", "Reuniones, documentos, decisiones", "Dentro de tu stack, tus datos, tu equipo"],
      ],
    },
    products: {
      memql: {
        label: "Open Source · AI Harness",
        h2a: "Grafo de memoria distribuido y nativo de IA,",
        h2b: "construido para sistemas de agentes en producción",
        body: "Capa de memoria open source para agentes de IA, construida como un lenguaje declarativo, no como una librería. Describes el comportamiento (conceptos, consultas, automatizaciones, memoria) y el motor lo ejecuta sobre PostgreSQL + TimescaleDB. Memoria que se comporta como una mente: las observaciones episódicas se consolidan en conocimiento semántico, y recall() combina recencia × relevancia en una sola consulta. Orientado a eventos, multi-tenant, distribuido — y hoy en producción.",
        byline: "Diseñado y construido de principio a fin por un solo fundador",
        cta: "Visitar memql.io",
      },
      copresent: {
        label: "Espacio de trabajo multiagente",
        h2a: "Espacio de colaboración",
        h2b: "multiagente en tiempo real",
        body: "El lugar donde todas las fuentes de datos de tu negocio se conectan en un solo espacio y se convierten en inteligencia accionable. La IA monitorea, analiza y te presenta el contexto completo. Sin navegar archivos. Sin reportes. Sin perder tiempo en trabajo manual que la IA puede hacer. Para que tú y tu equipo se concentren en lo que solo los humanos hacen: pensar, analizar y decidir.",
        byline: "CoPresent es construido por Visionarys, la empresa de IA fundada por José Sanz para entregar sistemas de IA en producción.",
        cta: "Únete a la lista de espera",
      },
    },
    footer: {
      aboutHeading: "Sobre José Sanz — Ingeniero de IA Forward Deployed",
      aboutSummary:
        "José Sanz es ingeniero de IA Forward Deployed y fundador de ZNAS LLC — se integra con los equipos del cliente para llevar iniciativas de IA estancadas de piloto a producción, y se hace cargo del resultado hasta que funciona.",
      aboutParagraphs: [
        "José Sanz es un ingeniero de IA Forward Deployed y fundador de ZNAS LLC, una firma de ingeniería de IA Forward Deployed con base en Arizona que atiende a empresas en todo Estados Unidos. Con 17 años de experiencia construyendo sistemas de producción en salud, aerolíneas, finanzas y telecomunicaciones, y certificación en Estrategia de IA por MIT Sloan, José se especializa en llevar iniciativas de IA de piloto estancado a sistema corriendo en producción.",
        "Se integra directamente con los equipos del cliente para definir el problema real, construir sistemas de IA de grado productivo —incluyendo pipelines de recuperación, infraestructura de agentes e integraciones de LLM en bases de código existentes— y se hace cargo del resultado hasta que el equipo puede operar el sistema de forma independiente.",
        "Los proyectos de ZNAS LLC sirven a CEOs y fundadores de empresas de 20 a 200 empleados cuyas implementaciones de IA se estancaron tras un primer intento con un proveedor o consultor. José también es cofundador de Visionarys y creador de herramientas de ingeniería open source como asyncapi-codegen y MemQL.",
      ],
      tagline1: "Ingeniería de IA Forward Deployed",
      tagline2: "Estados Unidos · Listo para remoto",
      navHeading: "Navegación",
      navLinks: {
        problem: "El problema",
        howItWorks: "Cómo funciona",
        whyJose: "Por qué José",
        startProject: "Inicia un proyecto",
      },
      joseHeading: "José Sanz",
      joseLinks: {
        about: "Sobre mí",
        portfolio: "Portafolio técnico",
        github: "GitHub",
        linkedin: "LinkedIn",
      },
      contactHeading: "Contacto",
      contactStartProject: "Inicia un proyecto",
      bottomBrand: "ZNAS LLC — Ingeniería Forward Deployed",
      bottomPortfolio: "Portafolio",
      bottomBook: "Agenda una llamada",
    },
  },
};
