import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Home,
  Mail,
  MapPin,
  Phone,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SHELTERED_COMPANY_CONFIG } from '../config/company';
import footerImage from '../assets/images/hero_global_realestate_1792690930558.jpg';

type FooterLink = {
  label: string;
  page: string;
};

type SocialLink = {
  name: string;
  href: string;
  color: string;
  icon: React.ReactNode;
};

const socialLinks: SocialLink[] = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com',
    color: 'text-[#1877F2]',
    icon: <path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8h3.4Z" />
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com',
    color: 'text-[#FF0033]',
    icon: <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com',
    color: 'text-[#0A66C2]',
    icon: <path d="M20.4 3H3.6A.6.6 0 0 0 3 3.6v16.8c0 .3.3.6.6.6h16.8a.6.6 0 0 0 .6-.6V3.6a.6.6 0 0 0-.6-.6ZM8.3 18H5.4V9.4h2.9V18ZM6.9 8.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4ZM18 18h-2.9v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2V18H9.2V9.4h2.8v1.2h.1c.4-.7 1.3-1.5 2.7-1.5 2.9 0 3.4 1.9 3.4 4.3V18Z" />
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com',
    color: 'text-[#E4405F]',
    icon: <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2.2A2.8 2.8 0 0 0 4.2 7v10A2.8 2.8 0 0 0 7 19.8h10a2.8 2.8 0 0 0 2.8-2.8V7A2.8 2.8 0 0 0 17 4.2H7Zm5 2.2a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2Zm0 2.2a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Zm5.8-3.1a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z" />
  },
  {
    name: 'X',
    href: 'https://x.com',
    color: 'text-white',
    icon: <path d="M18.9 2h3.3l-7.2 8.3 8.5 11.2h-6.7l-5.2-6.8-6 6.8H2.3L10 12.7 1.3 2h6.9l4.7 6.2L18.9 2Zm-1.2 17.5h1.8L7.1 4.1H5.1l12.6 15.4Z" />
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com',
    color: 'text-[#25F4EE] [filter:drop-shadow(1px_1px_0_#FE2C55)]',
    icon: <path d="M19.6 6.2a5.3 5.3 0 0 1-3.2-1.1 5.4 5.4 0 0 1-1.9-3.3V1h-3.8v14.3a3.2 3.2 0 1 1-2.2-3V8.4a7 7 0 1 0 6 6.9V8a9.1 9.1 0 0 0 5.3 1.7V5.9c-.1.1-.2.1-.2.1Z" />
  }
];

export const Footer: React.FC = () => {
  const { setCurrentPage, t } = useApp();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sections: { title: string; icon: React.ReactNode; links: FooterLink[] }[] = [
    {
      title: 'Explore',
      icon: <Home aria-hidden="true" className="h-7 w-7 fill-current" />,
      links: [
        { label: t('nav_buy'), page: 'buy' },
        { label: t('nav_rent'), page: 'rent' },
        { label: t('footer_destinations'), page: 'areas' },
        { label: t('nav_saved'), page: 'saved' }
      ]
    },
    {
      title: 'Services',
      icon: <Settings aria-hidden="true" className="h-7 w-7 fill-current" />,
      links: [
        { label: t('nav_list_property'), page: 'sign-in' },
        { label: t('brokers_title'), page: 'agents' },
        { label: t('footer_contact_hq'), page: 'contact' },
        { label: t('nav_dashboard'), page: 'sign-in' }
      ]
    },
    {
      title: 'Company',
      icon: <Building2 aria-hidden="true" className="h-7 w-7" />,
      links: [
        { label: t('nav_about'), page: 'about' },
        { label: t('terms_of_service'), page: 'terms' },
        { label: t('privacy_policy'), page: 'privacy' },
        { label: t('legal_compliance'), page: 'contact' }
      ]
    }
  ];

  const desktopSections: { title: string; links: FooterLink[] }[] = [
    {
      title: 'Explore',
      links: [
        { label: `${t('nav_buy')} Property`, page: 'buy' },
        { label: `${t('nav_rent')} Property`, page: 'rent' },
        { label: t('nav_commercial'), page: 'search' },
        { label: 'Land & Farms', page: 'search' }
      ]
    },
    {
      title: 'Services',
      links: [
        { label: 'List Property', page: 'sign-in' },
        { label: 'Find a Broker', page: 'agents' },
        { label: t('nav_saved'), page: 'saved' },
        { label: 'Property Advisory', page: 'contact' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', page: 'about' },
        { label: 'Contact', page: 'contact' },
        { label: t('privacy_policy'), page: 'privacy' },
        { label: t('terms_of_service'), page: 'terms' }
      ]
    }
  ];

  return (
    <footer
      className="relative isolate overflow-hidden border-t border-white/10 bg-black text-white"
      style={{ backgroundImage: `url(${footerImage})`, backgroundPosition: 'center 40%', backgroundSize: 'cover' }}
    >
      <div className="absolute inset-0 -z-10 bg-black/40" />
      <div className="w-full">
        <div className="mx-auto hidden max-w-7xl grid-cols-[2fr_0.85fr_0.9fr_0.85fr_1.4fr] gap-4 px-6 pb-8 pt-10 lg:grid">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-black/50 font-serif-display text-3xl font-bold text-white">
                S
              </div>
              <div>
                <div className="font-serif-display text-3xl font-bold leading-none">Sheltered</div>
                <div className="mt-1 text-[10px] font-semibold uppercase text-white/60">Global Real Estate Marketplace</div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-base leading-snug text-white/80">
              Connecting property buyers, sellers and investors across international markets.
            </p>
            <div className="my-3 h-1 w-16 bg-white/20" />
            <address className="space-y-2 text-sm not-italic text-white/80">
              <div className="flex items-center gap-2">
                <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 fill-white/60 text-white/60" />
                <span>{SHELTERED_COMPANY_CONFIG.hqCity}, {SHELTERED_COMPANY_CONFIG.hqCountry}</span>
              </div>
              <a className="flex items-center gap-2 transition-colors hover:text-emerald-300" href={`tel:${SHELTERED_COMPANY_CONFIG.primaryPhone.replace(/\s/g, '')}`}>
                <Phone aria-hidden="true" className="h-4 w-4 shrink-0 fill-white/60 text-white/60" />
                {SHELTERED_COMPANY_CONFIG.primaryPhone}
              </a>
              <a className="flex items-center gap-2 transition-colors hover:text-emerald-300" href={`mailto:${SHELTERED_COMPANY_CONFIG.officialEmail}`}>
                <Mail aria-hidden="true" className="h-4 w-4 shrink-0 fill-white/60 text-white/60" />
                {SHELTERED_COMPANY_CONFIG.officialEmail}
              </a>
            </address>
          </div>

          {desktopSections.map((section) => (
            <nav key={section.title} aria-label={section.title} className="pt-1">
              <h2 className="text-lg font-bold text-white">{section.title}</h2>
              <div className="mt-2 h-1 w-10 bg-white/20" />
              <ul className="mt-3 space-y-2">
                {section.links.slice(0, 3).map((link) => (
                  <li key={`${section.title}-${link.label}`}>
                    <button
                      type="button"
                      onClick={() => navigateTo(link.page)}
                      className="flex items-start gap-1.5 text-left text-sm text-white/70 transition-colors hover:text-emerald-300"
                    >
                      <ChevronRight aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/50" />
                      <span>{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="pt-1">
            <h2 className="text-lg font-bold text-white">Follow Us</h2>
            <div className="mt-2 h-1 w-10 bg-white/20" />
            <nav aria-label="Social media" className="mt-4 flex flex-wrap gap-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black/50 transition hover:-translate-y-0.5 hover:bg-black/70"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-5 w-5 fill-current ${social.color}`}>
                    {social.icon}
                  </svg>
                </a>
              ))}
            </nav>
            <div className="mt-6 border-t border-white/15 pt-4 text-center">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
                <p className="text-white/70">© {new Date().getFullYear()} {t('footer_rights')}</p>
                <button type="button" onClick={() => navigateTo('terms')} className="transition-colors hover:text-emerald-300">
                  {t('terms_of_service')}
                </button>
                <span aria-hidden="true" className="text-white/30">|</span>
                <button type="button" onClick={() => navigateTo('privacy')} className="transition-colors hover:text-emerald-300">
                  {t('privacy_policy')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-8 sm:pb-10 sm:pt-8 lg:hidden">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-black/50 font-serif-display text-3xl font-bold text-white shadow-lg sm:h-14 sm:w-14 sm:text-4xl">
            S
          </div>
          <div className="min-w-0 border-l-2 border-white/90 pl-3 sm:pl-4">
            <div className="font-serif-display text-2xl font-bold leading-none sm:text-3xl">Sheltered</div>
            <div className="mt-1 max-w-[210px] break-words text-[10px] font-bold uppercase leading-tight text-white/60 sm:text-xs">
              Global Real Estate Marketplace
            </div>
          </div>
        </div>

        <p className="mt-3 max-w-xl text-sm italic leading-snug text-white/90 sm:mt-4 sm:text-base">
          Connecting property buyers, sellers and investors across international markets.
        </p>
        <div className="my-3 h-1 w-16 bg-white/20" />

        <div className="space-y-2 text-sm sm:text-base">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <MapPin aria-hidden="true" className="h-5 w-5 shrink-0 fill-white/60 text-white/60" />
            <span>{SHELTERED_COMPANY_CONFIG.hqCity}, {SHELTERED_COMPANY_CONFIG.hqCountry}</span>
            <span aria-hidden="true" className="mx-1 hidden h-5 border-l border-white/30 sm:block" />
            <Phone aria-hidden="true" className="h-5 w-5 shrink-0 fill-white/60 text-white/60" />
            <a className="transition-colors hover:text-emerald-300" href={`tel:${SHELTERED_COMPANY_CONFIG.primaryPhone.replace(/\s/g, '')}`}>
              {SHELTERED_COMPANY_CONFIG.primaryPhone}
            </a>
          </div>
          <a
            className="flex w-fit max-w-full items-center gap-2 break-all transition-colors hover:text-emerald-300 sm:break-normal"
            href={`mailto:${SHELTERED_COMPANY_CONFIG.officialEmail}`}
          >
            <Mail aria-hidden="true" className="h-5 w-5 shrink-0 fill-white/60 text-white/60" />
            {SHELTERED_COMPANY_CONFIG.officialEmail}
          </a>
        </div>

        <div className="mt-4 space-y-2 sm:mt-6 sm:space-y-2">
          {sections.map((section) => {
            const isOpen = openSection === section.title;
            return (
              <div key={section.title} className="overflow-hidden rounded-lg border border-white/20 bg-black/50 shadow-sm backdrop-blur-sm sm:rounded-xl">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenSection(isOpen ? null : section.title)}
                  className="flex min-h-12 w-full items-center gap-3 px-3 text-left text-sm font-bold hover:bg-black/70 sm:min-h-14 sm:gap-3 sm:px-4 sm:text-base"
                >
                  {section.icon}
                  <span className="flex-1">{section.title}</span>
                  <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 transition-transform sm:h-5 sm:w-5 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <ul className="grid gap-1 border-t border-white/15 px-3 py-2 sm:grid-cols-2 sm:gap-2 sm:px-4 sm:py-3">
                    {section.links.slice(0, 3).map((link) => (
                      <li key={`${section.title}-${link.label}`}>
                        <button
                          type="button"
                          onClick={() => navigateTo(link.page)}
                          className="break-words py-1 text-left text-sm text-white/70 transition-colors hover:text-emerald-300 hover:underline sm:text-base"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t border-white/20 pt-4 sm:mt-6 sm:pt-4">
          <nav aria-label="Social media" className="flex flex-wrap justify-center gap-2 sm:gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                title={social.name}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-black/50 transition hover:-translate-y-1 hover:border-white/30 hover:bg-black/70 sm:h-11 sm:w-11"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-5 w-5 fill-current sm:h-6 sm:w-6 ${social.color}`}>
                  {social.icon}
                </svg>
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-4 border-t border-white/15 pt-3 pr-8 text-center text-xs text-white/70 sm:mt-5 sm:pr-0 sm:pt-4 sm:text-sm">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:mt-3 sm:gap-x-3">
            <p>© {new Date().getFullYear()} {t('footer_rights')}</p>
            <button type="button" onClick={() => navigateTo('terms')} className="transition-colors hover:text-emerald-300">
              {t('terms_of_service')}
            </button>
            <span aria-hidden="true" className="text-white/30">|</span>
            <button type="button" onClick={() => navigateTo('privacy')} className="transition-colors hover:text-emerald-300">
              {t('privacy_policy')}
            </button>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
};