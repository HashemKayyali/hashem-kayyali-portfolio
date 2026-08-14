export interface SocialLinks {
  linkedin: string;
  instagram: string;
  whatsapp: string;
  email: string;
}

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  whatsapp: string;
  freelanceStatus: string;
  social: SocialLinks;
  aboutParagraph: string;
  professionalSummary: string;
  targetRoles: string[];
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface ExperienceRole {
  title: string;
  period: string;
}

export interface ExperienceItem {
  /** Employer or venture. Was previously folded into `title`/`location`. */
  company: string;
  /** Role held at the end of the engagement. */
  title: string;
  period: string;
  location: string;
  /** Work mode where it is part of the record: Hybrid, Part-time, On-site. */
  mode?: string;
  /** Marks the active role so the journey can feature it. */
  current?: boolean;
  details: string[];
  image: string;
  imageAlt: string;
  /** Role progression inside one company, oldest first. */
  roles?: ExperienceRole[];
}

export interface ProjectVersion {
  title: string;
  details: string[];
}

export interface Project {
  slug: string;
  title: string;
  category: string;
  status: string;
  description: string;
  longDescription: string;
  stakeholderValue: string;
  role: string;
  tech: string[];
  image: string;
  gallery: string[];
  liveUrl?: string;
  privateSource?: boolean;
  features: string[];
  challenges: string[];
  versions?: ProjectVersion[];
}

export interface Service {
  title: string;
  description: string;
  icon: string;
}
