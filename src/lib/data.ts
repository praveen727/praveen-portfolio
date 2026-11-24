/**
 * Single source of truth for every word on the site.
 * Everything here comes from the résumé (Praveen__Cv.pdf). Components only read from this file.
 *
 * Light typographic clean-up (capitalisation, "an tracker" -> "a tracker") is the only editing done.
 * Nothing that is not in the résumé is stated here. Missing on purpose: GitHub, LinkedIn, project
 * links, achievements/ranks, per-project tech stacks, graduation dates for the internship/course.
 */

export type LogoKey = string;

export const PROFILE = {
  name: "Praveen R",
  firstName: "Praveen",
  initials: "PR",
  /** The résumé names no job title; this is the degree, as written in its Objective. */
  role: "Data Analytics Graduate",
  roleLead: "Data Analytics",
  roleAccent: "Graduate.",
  email: "pr9089500@gmail.com",
  /** Résumé shows "91-79045 58028". */
  phone: "+91 79045 58028",
  phoneHref: "tel:+917904558028",
  /** Street address intentionally left out of a public page; only town + PIN code. */
  location: "Erode – 638459",
  /** Verbatim from the résumé's Objective. */
  resumeSummary:
    "I am a B.Sc. Computer Science (Data Analytics) graduate with a strong foundation in Python, SQL, and data analysis. Eager to contribute analytical thinking and problem-solving skills while delivering value in a dynamic organization.",
  extraLine: "I completed a 30-day Python internship at Internzland.",
  /** Paraphrase of the Objective (not an invented claim). */
  quote:
    "Eager to bring analytical thinking and problem-solving to a dynamic team.",
  department: "Computer Science (Data Analytics)",
  validTill: "2026",
  languages: "Tamil, English (fluent)",
  github: null as string | null,
  linkedin: null as string | null,
  resume: "/Praveen_R_Resume.pdf",
} as const;

export type NavItem = { id: string; label: string };

/** Achievements are not in the résumé, so that section (and its nav link) is not built. */
export const NAV: NavItem[] = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

/* ---------------------------------------------------------------- skills */

export type FamilyId = "programming" | "data" | "tools" | "soft" | "spoken";

export type SkillItem = {
  name: string;
  /** Periodic-table symbol (cosmetic). */
  symbol: string;
  /** Key into BRAND / CONCEPT in ui/TechLogo.tsx. */
  logo: LogoKey;
  /** One line, taken from the résumé. */
  detail: string;
  /** Résumé items where the skill shows up (only what the résumé actually says). */
  appears: string[];
};

export type SkillGroup = {
  id: FamilyId;
  label: string;
  /** Résumé heading the group comes from. */
  source: string;
  skills: SkillItem[];
};

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: "programming",
    label: "Programming",
    source: "Technical Skills",
    skills: [
      {
        name: "Python",
        symbol: "Py",
        logo: "python",
        detail: "Listed first under Technical Skills.",
        appears: [
          "Objective: strong foundation in Python, SQL and data analysis",
          "Internship: Internzland, Python course using Visual Studio (30 days)",
          "Course: Python full stack development, Pumo Technovation",
          "Certification: Python Basics, GeeksforGeeks",
        ],
      },
      {
        name: "C",
        symbol: "C",
        logo: "c",
        detail: "Listed under Technical Skills.",
        appears: [],
      },
    ],
  },
  {
    id: "data",
    label: "Data",
    source: "Technical Skills",
    skills: [
      {
        name: "SQL",
        symbol: "Sq",
        logo: "sql",
        detail: "Listed under Technical Skills.",
        appears: ["Objective: strong foundation in Python, SQL and data analysis"],
      },
      {
        name: "Power BI",
        symbol: "Pb",
        logo: "powerbi",
        detail: "Listed under Technical Skills.",
        appears: [],
      },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    source: "Technical Skills",
    skills: [
      {
        name: "Git / GitHub",
        symbol: "Gh",
        logo: "git",
        detail: "Version control.",
        appears: [],
      },
      {
        name: "Word",
        symbol: "Wd",
        logo: "word",
        detail: "Part of MS Office (Word, Excel, PowerPoint).",
        appears: [],
      },
      {
        name: "Excel",
        symbol: "Xl",
        logo: "excel",
        detail: "Part of MS Office (Word, Excel, PowerPoint).",
        appears: [],
      },
      {
        name: "PowerPoint",
        symbol: "Pp",
        logo: "powerpoint",
        detail: "Part of MS Office (Word, Excel, PowerPoint).",
        appears: [],
      },
    ],
  },
  {
    id: "soft",
    label: "Soft skills",
    source: "Soft Skills",
    skills: [
      { name: "Critical thinking", symbol: "Ct", logo: "critical", detail: "Listed under Soft Skills.", appears: [] },
      { name: "Adaptability", symbol: "Ad", logo: "adaptability", detail: "Listed under Soft Skills.", appears: [] },
      { name: "Attention to detail", symbol: "At", logo: "detail", detail: "Listed under Soft Skills.", appears: [] },
      { name: "Communication", symbol: "Cm", logo: "communication", detail: "Listed under Soft Skills.", appears: [] },
    ],
  },
  {
    id: "spoken",
    label: "Spoken",
    source: "Languages",
    skills: [
      { name: "Tamil", symbol: "Ta", logo: "language", detail: "Fluent.", appears: [] },
      { name: "English", symbol: "En", logo: "language", detail: "Fluent.", appears: [] },
    ],
  },
];

/* ----------------------------------------------------------------- work */

/** One screenshot. The first entry of a project's `shots` is the large primary image. */
export type Shot = {
  /** File in /public/projects/<project>/ (overwrite the file, or change this path). */
  src: string;
  alt: string;
  /** Short caption shown under the image and in the enlarged view. */
  label: string;
  /** Natural size, only used to reserve space while loading (images are never cropped). */
  width: number;
  height: number;
};

export type Project = {
  id: string;
  index: string;
  title: string;
  /** Short label for tight spaces (project switcher, ID card). */
  short: string;
  kicker: string;
  overview: string;
  /** One paragraph per entry. */
  problem: string[];
  tech: { name: string; desc: string }[];
  features: { title: string; desc: string }[];
  work: string;
  learnings: string[];
  architecture: string;
  shots: Shot[];
  /** Links are intentionally empty for now; the buttons only render when these are set. */
  github: string | null;
  demo: string | null;
};

export const PROJECTS_INTRO = "A collection of projects I've independently developed, explored and learned from.";

export const PROJECTS: Project[] = [
  {
    id: "t20-world-cup",
    index: "01",
    title: "T20 World Cup – Tournament Information Website",
    short: "T20 World Cup",
    kicker: "Frontend · Multi-page website",
    overview:
      "A multi-page T20 World Cup website developed to bring tournament information, cricket history and memorable moments together in one place.",
    problem: [
      "Developed a centralized website to provide cricket enthusiasts with an organized platform to explore upcoming T20 World Cup information, participating teams, match details, major cricket stadiums and iconic moments from previous editions.",
      "The purpose was to make tournament-related information and cricket memories accessible through an engaging and easy-to-navigate website.",
    ],
    tech: [
      { name: "HTML5", desc: "Created the website structure and individual pages using semantic HTML." },
      { name: "CSS3", desc: "Designed custom layouts, responsive styling, animations and fixed navigation." },
      { name: "Bootstrap 5.3.2", desc: "Used responsive navigation bars, carousels and reusable interface components." },
      {
        name: "JavaScript",
        desc: "Implemented DOM manipulation, interactive sliders, carousel functionality, page animations and country flag interactions.",
      },
    ],
    features: [
      {
        title: "Tournament Homepage",
        desc: "Interactive image carousel featuring tournament highlights and upcoming tournament information.",
      },
      { title: "Teams & Profiles", desc: "Dedicated country pages displaying team information and country flags." },
      {
        title: "Matches & Records",
        desc: "Organized presentation of tournament match information and cricket records.",
      },
      {
        title: "Memories & Iconic Moments",
        desc: "Collection of memorable performances and historic moments from previous T20 World Cups.",
      },
      { title: "Stadiums & Venues", desc: "Information and images of major cricket stadiums." },
      { title: "Gallery", desc: "Visual collection of tournament photographs and cricket highlights." },
    ],
    work:
      "Independently designed and developed the complete frontend, including multiple webpages, navigation, page layouts, interactive components, image carousels and tournament content organization.",
    learnings: [
      "Gained practical experience in developing and managing a complete multi-page website.",
      "Improved understanding of responsive web design and CSS animations.",
      "Learned to implement interactive functionality using JavaScript and DOM manipulation.",
      "Gained hands-on experience integrating Bootstrap components with custom CSS.",
      "Improved skills in website structure, asset management and maintaining consistent user interface design.",
    ],
    architecture: "A static frontend website that runs in a web browser without backend or database integration.",
    shots: [
      {
        src: "/projects/t20-world-cup/01-gallery.webp",
        alt: "T20 World Cup website, Gallery page: a grid of cards with photographs and titles of iconic moments.",
        label: "Gallery",
        width: 1776,
        height: 927,
      },
      {
        src: "/projects/t20-world-cup/02-home-records.webp",
        alt: "T20 World Cup website, home page section titled Latest Records and Highlights, with five cards.",
        label: "Home · Records & highlights",
        width: 1886,
        height: 860,
      },
      {
        src: "/projects/t20-world-cup/03-venues.webp",
        alt: "T20 World Cup website, Tournament Venues page listing stadiums with photographs.",
        label: "Venues",
        width: 1882,
        height: 902,
      },
    ],
    github: null,
    demo: null,
  },
  {
    id: "water-supply",
    index: "02",
    title: "Adaptive Water Supply for Urban Regions using Machine Learning",
    short: "Water Supply ML",
    kicker: "Machine learning · Flask dashboard",
    overview:
      "A machine learning-based water demand forecasting application that predicts the quantity of water required in litres for future periods using historical water consumption data and an LSTM deep learning model.",
    problem: [
      "Urban regions require effective planning of water resources to meet changing consumption demands.",
      "This project was developed to analyze historical water consumption patterns and forecast future water requirements using machine learning.",
      "The purpose is to help understand expected water demand and support better water resource planning through data-driven predictions.",
    ],
    tech: [
      { name: "Python", desc: "Used for data processing, model development and application logic." },
      {
        name: "LSTM (Long Short-Term Memory)",
        desc: "Deep learning architecture used for time-series water demand forecasting.",
      },
      { name: "TensorFlow/Keras", desc: "Used for developing and training the LSTM model." },
      { name: "Flask", desc: "Used to integrate the trained machine learning model with the web application." },
      { name: "Scikit-learn", desc: "Used for data scaling and preprocessing with MinMaxScaler." },
      { name: "Chart.js", desc: "Used to create interactive data visualizations." },
      { name: "HTML & CSS", desc: "Used to develop the forecasting dashboard interface." },
      { name: "CSV Dataset", desc: "Used to store and process historical water consumption data." },
    ],
    features: [
      {
        title: "Water Demand Forecasting",
        desc: "Predicts future water requirements in litres using the trained LSTM model.",
      },
      {
        title: "Custom Forecast Period",
        desc: "Allows users to select the number of days for future demand predictions.",
      },
      {
        title: "Historical Data Analysis",
        desc: "Displays historical daily and monthly water consumption patterns.",
      },
      {
        title: "Demand Visualization",
        desc: "Presents historical consumption and predicted demand through interactive charts.",
      },
      {
        title: "Model Performance",
        desc: "Displays model architecture, configuration and evaluation metrics.",
      },
      {
        title: "Usage Distribution",
        desc: "Provides an estimated breakdown of water consumption across different usage categories.",
      },
    ],
    work:
      "Independently developed the machine learning forecasting application, including historical data preprocessing, LSTM model training and integration, Flask application development, prediction functionality and interactive dashboard visualizations.",
    learnings: [
      "Gained practical experience in time-series forecasting using LSTM networks.",
      "Learned to preprocess historical consumption data for machine learning.",
      "Improved understanding of deep learning model training and prediction.",
      "Gained hands-on experience integrating trained machine learning models with Flask.",
      "Developed skills in presenting predictive results through interactive charts and dashboards.",
      "Improved understanding of how machine learning can support real-world resource planning.",
    ],
    architecture:
      "A Flask-based web application integrating a trained LSTM forecasting model with a frontend dashboard for historical data analysis and future water demand prediction.",
    shots: [
      {
        src: "/projects/water-supply/01-prediction-lab.webp",
        alt: "Water demand dashboard, Prediction Lab: a 14-day forecast chart with historical data and the LSTM prediction.",
        label: "Prediction Lab · 14-day forecast",
        width: 1600,
        height: 863,
      },
      {
        src: "/projects/water-supply/02-forecast.webp",
        alt: "Prediction Lab forecast panel with a forecast horizon in days, a Generate Forecast button and the total projected demand in litres.",
        label: "Forecast horizon & projected demand",
        width: 1540,
        height: 590,
      },
      {
        src: "/projects/water-supply/03-model-performance.webp",
        alt: "Model Performance and Metrics panel showing the LSTM model architecture and the accuracy formula.",
        label: "Model performance & metrics",
        width: 1503,
        height: 407,
      },
      {
        src: "/projects/water-supply/04-month-analysis.webp",
        alt: "Specific Month Analysis: a line chart of daily water demand for one selected month.",
        label: "Specific month analysis",
        width: 1482,
        height: 536,
      },
      {
        src: "/projects/water-supply/05-data-visualization.webp",
        alt: "Data Visualization page: monthly consumption bar chart and an estimated usage distribution doughnut chart.",
        label: "Monthly trends & usage distribution",
        width: 1574,
        height: 780,
      },
    ],
    github: null,
    demo: null,
  },
];

/* --------------------------------------------------------- certification */

export type Certification = {
  id: string;
  title: string;
  issuer: string;
  href: string | null;
};

export const CERTIFICATIONS: Certification[] = [
  { id: "hackerrank", title: "Problem Solving (Basic and Intermediate)", issuer: "HackerRank", href: null },
  { id: "gfg", title: "Python Basics", issuer: "GeeksforGeeks", href: null },
];

/* ---------------------------------------------- education + experience */

export type PathKind = "Education" | "Internship" | "Course";

export type PathStop = {
  id: string;
  kind: PathKind;
  /** Year or duration, shown in the left rail. */
  when: string;
  title: string;
  place: string;
  detail: string;
};

export const EDUCATION: PathStop[] = [
  {
    id: "sslc",
    kind: "Education",
    when: "2021",
    title: "SSLC",
    place: "S.R.C Memorial Matric. Hr. Sec. School",
    detail: "All Pass",
  },
  {
    id: "hsc",
    kind: "Education",
    when: "2023",
    title: "HSC",
    place: "Sri Sowdeswari Vidyalaya Model Matric. Hr. Sec. School",
    detail: "63%",
  },
  {
    id: "bsc",
    kind: "Education",
    when: "2023 – 2026",
    title: "B.Sc. Computer Science with Data Analytics",
    place: "Dr. N.G.P Arts and Science College",
    detail: "6.20 CGPA",
  },
];

/** The résumé gives no dates for these two, so they follow the education stops in résumé order. */
export const EXPERIENCE: PathStop[] = [
  {
    id: "internzland",
    kind: "Internship",
    when: "30 days",
    title: "Python Internship",
    place: "Internzland",
    detail: "Completed an internship in a Python course using Visual Studio.",
  },
  {
    id: "pumo",
    kind: "Course",
    when: "Course",
    title: "Python Full Stack Development",
    place: "Pumo Technovation",
    detail: "Completed the Python full stack development course.",
  },
];

/* ---------------------------------------------------------- achievements */

export type Achievement = {
  id: string;
  label: string;
  caption: string;
  detail: string;
  value: number;
  logo: LogoKey | null;
};

/** The résumé states no ranks, ratings or counts, so there are no achievements to show. */
export const ACHIEVEMENTS: Achievement[] = [];
