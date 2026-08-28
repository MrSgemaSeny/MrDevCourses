import { ROUTES } from './routes';
import { LucideIcon, Github, Send } from 'lucide-react';

export interface FooterLink {
  label: string;
  to: string;
  isExternal?: boolean;
  icon?: LucideIcon;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterConfig {
  brand: {
    title: string;
    description: string;
  };
  sections: FooterSection[];
  legal: {
    copyrightYear: number;
    copyrightHolder: string;
    links: FooterLink[];
  };
}

export const FOOTER_CONFIG: FooterConfig = {
  brand: {
    title: 'MrDev',
    description:
      'Образовательная платформа для разработчиков от Mr Developer. Практические курсы по промышленному стеку, архитектуре и AI-инструментам.',
  },
  sections: [
    {
      title: 'Платформа',
      links: [
        { label: 'Каталог курсов', to: ROUTES.COURSES },
        { label: 'Моё обучение', to: ROUTES.DASHBOARD },
        { label: 'Проверка сертификата', to: ROUTES.CERTIFICATES_VERIFY },
      ],
    },
    {
      title: 'Контакты',
      links: [
        {
          label: 'GitHub',
          to: 'https://github.com/MrSgemaSeny/MrDev',
          isExternal: true,
          icon: Github,
        },
        {
          label: 'Telegram',
          to: 'https://t.me/mrdeveloper',
          isExternal: true,
          icon: Send,
        },
      ],
    },
  ],
  legal: {
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: 'MrDev',
    links: [
      { label: 'Конфиденциальность', to: '#' },
      { label: 'Условия', to: '#' },
    ],
  },
};
