/** Personalized portfolio content. All editable copy and links live here. */
export const UNRESOLVED = '--'

export const site = {
  name: 'Muhammad Rizky Pratama',
  role: 'Full Stack Developer',
  tagline: 'Web applications, from interface to database.',
  location: 'Cileungsi, Bogor, Indonesia',
  email: 'muhammadrizkyprtm2308@gmail.com',
  availability: 'Available for full-time roles',
  social: {
    github: 'https://github.com/Rizky-Pratama',
    linkedin: 'https://www.linkedin.com/in/rizkyprtm/',
    instagram: 'https://www.instagram.com/rizkyprtm___/',
    threads: 'https://www.threads.com/@rizkyprtm___',
    x: '',
    dribbble: '',
  },
  cta: {
    label: 'Start a conversation',
    href: 'mailto:muhammadrizkyprtm2308@gmail.com',
  },
  nav: [
    {
      label: 'Work',
      href: '#work',
    },
    {
      label: 'Skills',
      href: '#skills',
    },
    {
      label: 'Experience',
      href: '#experience',
    },
    {
      label: 'About',
      href: '#about',
    },
    {
      label: 'Contact',
      href: '#contact',
    },
  ],
  sections: {
    hero: {
      eyebrow: 'Muhammad Rizky Pratama / Full Stack Developer',
      heading: 'Web applications, from interface to database.',
      subheading:
        'I build Laravel and Vue applications, with experience maintaining production software, developing REST APIs, and testing web features.',
      portrait: {
        src: '/images/my-foto.webp',
        srcset: '',
        alt: 'Muhammad Rizky Pratama',
      },
      secondary: {
        label: 'See selected work',
        href: '#work',
      },
    },
    skills: {
      heading: 'What I work with',
      groups: [
        {
          id: 'frontend',
          title: 'Frontend',
          blurb:
            'Responsive interfaces with Vue, Nuxt.js, React, Next.js, and Laravel Livewire.',
          stack: [
            {
              name: 'JavaScript',
              icon: 'simple-icons:javascript',
            },
            {
              name: 'Vue',
              icon: 'simple-icons:vuedotjs',
            },
            {
              name: 'React',
              icon: 'simple-icons:react',
            },
            {
              name: 'Tailwind CSS',
              icon: 'simple-icons:tailwindcss',
            },
            {
              name: 'Livewire',
              icon: 'simple-icons:livewire',
            },
            {
              name: 'Next.js',
              icon: 'simple-icons:nextdotjs',
            },
            {
              name: 'Nuxt.js',
              icon: 'simple-icons:nuxt',
            },
          ],
        },
        {
          id: 'backend',
          title: 'Backend',
          blurb:
            'Laravel and Express.js APIs, Eloquent data access, authentication, and role-based authorization.',
          stack: [
            {
              name: 'PHP',
              icon: 'simple-icons:php',
            },
            {
              name: 'Laravel',
              icon: 'simple-icons:laravel',
            },
            {
              name: 'MySQL',
              icon: 'simple-icons:mysql',
            },
            {
              name: 'Express.js',
              icon: 'simple-icons:express',
            },
          ],
        },
        {
          id: 'data-ml',
          title: 'Data & ML',
          blurb:
            'Python data preparation and machine-learning services connected to web applications.',
          stack: [
            {
              name: 'Python',
              icon: 'simple-icons:python',
            },
            {
              name: 'FastAPI',
              icon: 'simple-icons:fastapi',
            },
            {
              name: 'pandas',
              icon: 'simple-icons:pandas',
            },
            {
              name: 'scikit-learn',
              icon: 'simple-icons:scikitlearn',
            },
          ],
        },
        {
          id: 'delivery',
          title: 'Delivery & Quality',
          blurb:
            'PHPUnit testing, version control, and GitHub Actions deployment over SSH.',
          stack: [
            {
              name: 'Git',
              icon: 'simple-icons:git',
            },
            {
              name: 'GitHub Actions',
              icon: 'simple-icons:githubactions',
            },
            {
              name: 'PHPUnit',
              icon: 'file-icons:phpunit',
            },
            {
              name: 'Vite',
              icon: 'simple-icons:vite',
            },
          ],
        },
        {
          id: 'design-media',
          title: 'Design & Media',
          blurb: 'Interface mockups, community event graphics, and video editing.',
          stack: [
            {
              name: 'Figma',
              icon: 'simple-icons:figma',
            },
            {
              name: 'Canva',
              icon: 'simple-icons:canva',
            },
            {
              name: 'CapCut',
              icon: 'hugeicons:capcut',
            },
          ],
        },
      ],
      eyebrow: '$ stack',
    },
    projects: [
      {
        id: 'lms-fik-unissula',
        title: 'LMS FIK UNISSULA',
        role: 'Paid freelance maintenance',
        stack: ['Laravel', 'Blade', 'Tailwind CSS', 'Alpine.js', 'MySQL', 'PHPUnit'],
        summary:
          'Maintaining and improving an existing learning management system for the Faculty of Nursing at UNISSULA.',
        outcome:
          'Fixed production controller and file-persistence bugs, strengthened route authorization, refactored business logic, and added unit and feature tests.',
        imageSeed: 'ledgerline-pipeline',
        image: '/images/lms.webp',
        imageWidth: 1470,
        imageHeight: 867,
        imageAlt: 'UNISSULA learning management system interface',
        imageLabel: 'View LMS FIK UNISSULA image',
      },
      {
        id: 'iuran',
        title: 'Iuran',
        role: 'Personal application in use',
        stack: ['Laravel', 'Vue 3', 'Pinia', 'Tailwind CSS', 'MySQL'],
        summary:
          'A Laravel REST API and Vue interface for neighborhood dues, household records, payments, and reports.',
        outcome:
          'Used by two operators to manage records for 74 households, giving the neighborhood head direct access to centralized dues and payment information.',
        imageSeed: 'atlas-auth-flow',
        image: '/images/iuran.webp',
        imageWidth: 1147,
        imageHeight: 696,
        imageAlt: 'Iuran neighborhood dues administration interface',
        imageLabel: 'View Iuran image',
      },
      {
        id: 'tj-rent-car',
        title: 'TJ Rent Car',
        role: 'KKP / internship project',
        stack: ['Laravel', 'Livewire', 'React', 'MySQL', 'GitHub Actions'],
        summary:
          'Independently developed a rental administration system and customer landing page for a car-rental business.',
        outcome:
          'Deployed the React landing page and resolved deployment workflow issues. The administration system uses test data and has not been adopted for daily operations.',
        imageSeed: 'fjord-dashboard',
        links: [
          {
            label: 'Laravel source',
            href: 'https://github.com/Rizky-Pratama/tj-rent-car-laravel12',
          },
          {
            label: 'React source',
            href: 'https://github.com/Rizky-Pratama/tj-rent-car-react',
          },
        ],
        image: '/images/tj-rent-car.webp',
        imageWidth: 1856,
        imageHeight: 915,
        imageAlt: 'TJ Rent Car customer website interface',
        imageLabel: 'View TJ Rent Car image',
      },
      {
        id: 'diabpredict',
        title: 'DiabPredict',
        role: 'Undergraduate thesis',
        stack: ['Laravel', 'Livewire', 'FastAPI', 'Python', 'scikit-learn', 'MySQL'],
        summary:
          'A diabetes-risk prediction web application connected to a logistic-regression inference service.',
        outcome:
          'Integrated Laravel with a Python/FastAPI REST service for prediction inputs, results, and history as an academic early-detection support project.',
        imageSeed: 'undertow-field',
        links: [
          {
            label: 'Web application source',
            href: 'https://github.com/Rizky-Pratama/diabpredict',
          },
          {
            label: 'Prediction API source',
            href: 'https://github.com/Rizky-Pratama/diabetes-api',
          },
        ],
        image: '/images/diapredic.webp',
        imageWidth: 1036,
        imageHeight: 522,
        imageAlt: 'DiabPredict login page for the diabetes-risk prediction application',
        imageLabel: 'View DiabPredict image',
      },
    ],
    experience: [
      {
        period: '2024 - Present',
        title: 'Freelance Web Developer',
        org: 'Independent / project-based',
        body: 'Build websites for paying clients on a project basis, primarily developing web applications for academic and learning needs. Selected client engagements include:',
        engagements: [
          {
            period: 'July 2026 - Present',
            title: 'Freelance Full Stack Developer',
            org: 'Faculty of Nursing, UNISSULA',
            body: 'Paid remote work maintaining an existing Laravel LMS. Released bug fixes and refactoring to production, improved authorization and responsive layouts, and developed PHPUnit tests. Continue supporting maintenance and ongoing development.',
          },
          {
            period: 'February 2025 - April 2025',
            title: 'Web Developer',
            org: 'CareBuddies',
            body: 'Independently developed a Laravel and Livewire learning website for a group of final-year nursing students, focused on Swanson Caring Theory. Delivered the website to the client, who used it for nursing education.',
          },
        ],
      },
      {
        period: 'October 2025 - January 2026',
        title: 'Full Stack Developer / KKP',
        org: 'TJ Rent Car',
        body: 'Independently built the Laravel administration system, React customer landing page, database, and deployment workflow as a KKP project. The landing page is deployed; administration workflows were evaluated with test data.',
      },
      {
        period: 'September 2022 - August 2026',
        title: 'Bachelor of Informatics (S.Kom.)',
        org: 'Universitas Indraprasta PGRI',
        body: 'Graduated with a GPA of 3.43/4.00. Completed a thesis integrating a Laravel application with a logistic-regression prediction service built with Python and FastAPI.',
      },
    ],
    about: {
      heading: 'Practical software, built around everyday needs.',
      body: 'I am an Informatics graduate focused on full-stack web development. My work includes maintaining a paid client LMS, building a neighborhood dues application, and connecting web interfaces to APIs and machine-learning services. I enjoy tracing bugs through application logic and data, then making the code easier to maintain. Outside development, I have helped organize community events, coordinate volunteers, and digitize registrations.',
      nowHeading: 'Now',
      now: [
        'Maintaining and improving the UNISSULA LMS',
        'Operating Iuran for neighborhood dues administration',
        'Seeking a full-time software or web development role',
      ],
      portrait: {
        src: '/images/about-three-quarter.webp',
        srcset: '',
        alt: 'Muhammad Rizky Pratama in a three-quarter portrait',
      },
      readouts: [
        {
          value: '74',
          label: 'Households managed in Iuran',
        },
        {
          value: '2',
          label: 'Iuran application operators',
        },
      ],
    },
    work: {
      heading: 'Selected work',
      intro:
        'Paid maintenance, a personal application in use, and two academic projects.',
      viewer: {
        close: 'Close',
        zoom: 'Zoom in',
        fit: 'Fit image',
        pan: 'Project image. Scroll to explore when zoomed.',
        error: 'This image could not be loaded.',
        original: 'Open original image',
      },
    },
    contact: {
      heading: 'Let’s discuss your next developer opening.',
      body: 'I am available for full-time developer roles and open to freelance projects. Get in touch to discuss your team or application.',
      secondary: {
        label: 'Download CV',
        href: '',
      },
      links: [
        {
          label: 'muhammadrizkyprtm2308@gmail.com',
          href: 'mailto:muhammadrizkyprtm2308@gmail.com',
          icon: 'ph:envelope-simple',
        },
        {
          label: 'GitHub',
          href: 'https://github.com/Rizky-Pratama',
          icon: 'ph:github-logo',
        },
        {
          label: 'LinkedIn',
          href: 'https://www.linkedin.com/in/rizkyprtm/',
          icon: 'ph:linkedin-logo',
        },
        {
          label: 'Instagram',
          href: 'https://www.instagram.com/rizkyprtm___/',
          icon: 'ph:instagram-logo',
        },
        {
          label: 'Threads',
          href: 'https://www.threads.com/@rizkyprtm___',
          icon: 'simple-icons:threads',
        },
      ],
      note: 'No contact form. This goes straight to my inbox.',
    },
    footer: {
      colophon:
        'Built with Vue 3, Tailwind, and GSAP. Typeset in Space Grotesk, IBM Plex Sans, and JetBrains Mono.',
      legal: '(c) 2026',
      copyright: '(c) 2026 Muhammad Rizky Pratama',
    },
    experienceHeading: 'Experience & Education',
  },
  seo: {
    title: 'Muhammad Rizky Pratama | Full Stack Developer',
    description:
      'Full Stack Developer working with Laravel, Vue, MySQL, REST APIs, and PHPUnit. Explore paid maintenance work and practical web projects.',
    image: '/og-banner.png',
    imageAlt:
      'Muhammad Rizky Pratama, Full Stack Developer. Web applications, from interface to database.',
  },
  icons: {
    menu: 'ph:list',
    arrowDown: 'ph:arrow-down',
    arrowUp: 'ph:arrow-up',
    download: 'ph:download-simple',
    email: 'ph:envelope-simple',
    github: 'ph:github-logo',
    linkedin: 'ph:linkedin-logo',
    favicon: 'ph:code',
    instagram: 'ph:instagram-logo',
    threads: 'simple-icons:threads',
  },
}

export default site
