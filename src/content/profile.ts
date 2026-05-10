export const profile = {
  name: 'Kunal Kaushik',
  headline: 'Electrical engineering & robotics',
  intro:
    "Hi there! I'm Kunal, an incoming freshman at UIUC studying Electrical Engineering and Computer Science. I'm passionate about robotics, computer vision, embedded systems, and computer architecture used in conjunction to build amazing products.",
  focus: ['Embedded', 'Controls', 'Sensing', 'Mechatronics'],
  education: {
    school: 'University of Illinois Urbana-Champaign',
    degree: 'B.S. Electrical Engineering',
    period: '2026 — 2030',
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
    resume: '/Kunal Kaushik - Resume.pdf',
  },
} as const

export type Profile = typeof profile
