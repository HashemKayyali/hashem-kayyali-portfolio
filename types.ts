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
  title: string;
  period: string;
  location: string;
  details: string[];
  image: string;
  imageAlt: string;
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
