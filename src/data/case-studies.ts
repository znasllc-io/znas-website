import type { Lang } from "@/lib/translations";

export interface CaseStudyContent {
  slug: string;
  industry: string;
  title: string;
  subtitle: string;
  body: string;
  image: string;
  imageAlt: string;
  results: string[];
  facts: { heading: string; items: string[] }[];
}

/** Case-study content keyed by language, per the FDE design doc (page 2). */
export const caseStudies: Record<Lang, CaseStudyContent[]> = {
  en: [
    {
      slug: "manufacturing",
      industry: "Manufacturing",
      title: "Safety & Productivity",
      subtitle:
        "Vision AI that enforces compliance and surfaces lost productivity without adding headcount",
      body: "Manual monitoring couldn't keep up with safety compliance on an active production floor, PPE violations went unnoticed, idle equipment quietly eroded productivity. I built a GPU-accelerated computer vision system wired into their existing camera infrastructure. It detects safety violations in real time, flags idle equipment, and turns hours of footage into searchable intelligence, without adding a single person to the monitoring team.",
      image: "/images/home/manufacturing-vision-ai.webp",
      imageAlt: "Security camera monitoring a production floor",
      results: [
        "Real-time PPE compliance detection across warehouse and corporate office",
        "Automatic alerts when equipment sits idle, surfacing lost productivity before it compounds",
        "Hours of video footage searchable in seconds via natural language",
        "Continuous anomaly detection running 24/7 without manual oversight",
      ],
      facts: [
        {
          heading: "My Role",
          items: [
            "Solution architect & lead engineer, system design, model/pipeline selection, GPU infrastructure, integration with on-site cameras, deployment.",
          ],
        },
        {
          heading: "Core Tech",
          items: ["NVIDIA VSS Blueprint", "VILA", "NVIDIA NIM", "H100 GPU", "Computer Vision Pipelines"],
        },
        {
          heading: "Footprint",
          items: ["Corporate office + warehouse / production floor"],
        },
      ],
    },
    {
      slug: "automotive-retail",
      industry: "Automotive Retail",
      title: "Customer Engagement & Premises Security",
      subtitle:
        "One AI system handling inquiries, lead capture, and security monitoring around the clock",
      body: "A technology-first automaker scaling aggressively in Mexico needed a dealership experience that matched the brand, modern customer engagement and always-on premises security, delivered as one integrated system. I built a bilingual AI avatar and voice agent that handles inquiries and captures leads directly into the sales pipeline. In parallel, I connected existing security cameras to AI for intelligent monitoring and automated weekly reporting.",
      image: "/images/home/case-automotive.webp",
      imageAlt: "AI assistant workstation with security camera dashboard",
      results: [
        "Bilingual customer service running 24/7, Spanish and English",
        "Automated lead capture and routing into the sales pipeline from every conversation",
        "AI-powered security monitoring across dealership premises",
        "Automated weekly suspicious-activity reports",
      ],
      facts: [
        {
          heading: "My Role",
          items: [
            "Founder, solution architect & lead engineer, agent framework, platform architecture, security-vision pipeline, cloud deployment, AI provider integration.",
          ],
        },
        {
          heading: "Core Tech",
          items: ["AURA Agent", "Agentic Platform", "memQL", "Go", "Python", "OpenAI / Anthropic / NVIDIA", "Koyeb"],
        },
        {
          heading: "Deliverables",
          items: [
            "Customer-service avatar & voice agent",
            "Lead capture/routing",
            "AI security monitoring",
            "Automated weekly suspicious-activity reports",
          ],
        },
      ],
    },
  ],

  es: [
    {
      slug: "manufacturing",
      industry: "Manufactura",
      title: "Seguridad y productividad",
      subtitle:
        "IA de visión que hace cumplir las normas y revela productividad perdida sin sumar personal",
      body: "El monitoreo manual no daba abasto con el cumplimiento de seguridad en una planta de producción activa: las violaciones de EPP pasaban desapercibidas y los equipos inactivos erosionaban la productividad en silencio. Construí un sistema de visión computacional acelerado por GPU, conectado a su infraestructura de cámaras existente. Detecta violaciones de seguridad en tiempo real, señala equipos inactivos y convierte horas de video en inteligencia consultable, sin sumar una sola persona al equipo de monitoreo.",
      image: "/images/home/manufacturing-vision-ai.webp",
      imageAlt: "Cámara de seguridad monitoreando una planta de producción",
      results: [
        "Detección de cumplimiento de EPP en tiempo real en almacén y oficinas corporativas",
        "Alertas automáticas cuando un equipo queda inactivo, revelando productividad perdida antes de que se acumule",
        "Horas de video consultables en segundos mediante lenguaje natural",
        "Detección continua de anomalías 24/7 sin supervisión manual",
      ],
      facts: [
        {
          heading: "Mi rol",
          items: [
            "Arquitecto de solución e ingeniero líder: diseño del sistema, selección de modelos/pipelines, infraestructura GPU, integración con cámaras en sitio, despliegue.",
          ],
        },
        {
          heading: "Tecnología",
          items: ["NVIDIA VSS Blueprint", "VILA", "NVIDIA NIM", "GPU H100", "Pipelines de visión computacional"],
        },
        {
          heading: "Alcance",
          items: ["Oficinas corporativas + almacén / planta de producción"],
        },
      ],
    },
    {
      slug: "automotive-retail",
      industry: "Retail automotriz",
      title: "Atención al cliente y seguridad del recinto",
      subtitle:
        "Un solo sistema de IA atendiendo consultas, capturando leads y monitoreando la seguridad todo el día",
      body: "Una automotriz technology-first en plena expansión en México necesitaba una experiencia de agencia a la altura de la marca: atención al cliente moderna y seguridad permanente del recinto, entregadas como un solo sistema integrado. Construí un avatar de IA bilingüe y un agente de voz que atiende consultas y captura leads directamente en el pipeline de ventas. En paralelo, conecté las cámaras de seguridad existentes a la IA para monitoreo inteligente y reportes semanales automáticos.",
      image: "/images/home/case-automotive.webp",
      imageAlt: "Estación de trabajo con asistente de IA y panel de cámaras de seguridad",
      results: [
        "Atención al cliente bilingüe 24/7, en español e inglés",
        "Captura y enrutamiento automático de leads al pipeline de ventas desde cada conversación",
        "Monitoreo de seguridad con IA en todo el recinto de la agencia",
        "Reportes semanales automáticos de actividad sospechosa",
      ],
      facts: [
        {
          heading: "Mi rol",
          items: [
            "Fundador, arquitecto de solución e ingeniero líder: framework de agentes, arquitectura de plataforma, pipeline de visión de seguridad, despliegue en la nube, integración de proveedores de IA.",
          ],
        },
        {
          heading: "Tecnología",
          items: ["AURA Agent", "Plataforma agéntica", "memQL", "Go", "Python", "OpenAI / Anthropic / NVIDIA", "Koyeb"],
        },
        {
          heading: "Entregables",
          items: [
            "Avatar de atención al cliente y agente de voz",
            "Captura/enrutamiento de leads",
            "Monitoreo de seguridad con IA",
            "Reportes semanales automáticos de actividad sospechosa",
          ],
        },
      ],
    },
  ],
};
