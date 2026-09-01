import { ROUTES } from './routes';
import { LucideIcon, Github, Send, Phone } from 'lucide-react';

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
    title: 'MrDeveloper',
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
          to: 'https://github.com/MrSgemaSeny',
          isExternal: true,
          icon: Github,
        },
        {
          label: 'Telegram',
          to: 'https://t.me/mrsgemaseny',
          isExternal: true,
          icon: Send,
        },
        {
          label: '+7 775 058 40 21',
          to: 'tel:+77750584021',
          isExternal: true,
          icon: Phone,
        },
      ],
    },
  ],
  legal: {
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: 'MrDeveloper',
    links: [
      { label: 'Конфиденциальность', to: ROUTES.PRIVACY },
      { label: 'Условия', to: ROUTES.TERMS },
    ],
  },
};
