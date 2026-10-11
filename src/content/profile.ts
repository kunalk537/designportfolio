export const profile = {
  name: 'Kunal Kaushik',
  // Portrait framing is controlled in index.css.
  portrait: '/portrait.jpg' as string,
  // Add a sentence about hobbies or life outside engineering here.
  personalNote: '' as string,
  age: 18,
  book: {
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
  },
  song: {
    title: 'Memory Box',
    artist: 'Peter Cat Recording Co.',
    href: 'https://open.spotify.com/track/6C5xm2roWdAIda9WJmu1jG',
  } as { title: string; artist: string; href: string },
  headline: 'Electrical engineering & robotics',
  intro:
    "I'm Kunal, an electrical engineering student at the University of Illinois Urbana-Champaign. I build robots, embedded systems, and computer vision tools.",
  focus: ['Embedded', 'Controls', 'Sensing', 'Mechatronics'],
  education: {
    school: 'University of Illinois Urbana-Champaign',
    degree: 'B.S. Electrical Engineering, Minor in Computer Science',
    period: '2026 — 2029',
    detail: 'Focus: chip design, robotics, and embedded systems',
  },
  availability: {
    status: 'Quick to reply',
    detail:
      "I usually respond to emails the same day, and I'm always looking for new things to learn — happy to chat about embedded, controls, computer vision, or anything robotics-adjacent.",
  },
  /*
  currentExperience: {
    role: 'Wilcox High School',
    org: 'Senior',
    period: 'Sep 2025 — Present',
    summary:
      'Closed-loop joint control, sensor calibration, and bring-up tooling for an autonomous platform demoed monthly.',
    tags: ['Embedded', 'Controls', 'Bring-up'],
  },
  */
  links: {
    email: 'kunalkaushik537@gmail.com',
    emailHref:
      'mailto:kunalkaushik537@gmail.com?subject=Hello%20from%20your%20portfolio',
    github: 'https://github.com/kunalk537',
    linkedin: 'https://www.linkedin.com/in/kunalkaushik537',
    resume: '/Kunal-Kaushik-Electrical-Engineering-Resume.pdf',
  },
} as const

export type Profile = typeof profile


