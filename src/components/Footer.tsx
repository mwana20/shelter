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
      className="relative isolate overflow-hidden border-t border-blue-300/20 bg-[#061936] text-white"
      style={{ backgroundImage: `url(${footerImage})`, backgroundPosition: 'center 40%', backgroundSize: 'cover' }}
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#04152c]/65 via-[#041a3b]/90 to-[#03132e] lg:bg-gradient-to-r lg:from-[#04152c]/95 lg:via-[#041a3b]/80 lg:to-[#04152c]/60" />
      <div className="w-full">
        <div className="mx-auto hidden max-w-7xl grid-cols-[2fr_0.85fr_0.9fr_0.85fr_1.4fr] gap-7 px-9 pb-16 pt-20 lg:grid">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-950/75 font-serif-display text-5xl font-bold text-white">
                S
              </div>
              <div>
                <div className="font-serif-display text-5xl font-bold leading-none">Sheltered</div>
                <div className="mt-2 text-xs font-semibold uppercase text-blue-100">Global Real Estate Marketplace</div>
              </div>
            </div>
            <p className="mt-7 max-w-sm text-lg leading-snug text-blue-50/90">
              Connecting property buyers, sellers and investors across international markets.
            </p>
            <div className="my-5 h-1 w-20 bg-sky-400" />
            <address className="space-y-3 text-base not-italic text-blue-50/90">
              <div className="flex items-center gap-3">
                <MapPin aria-hidden="true" className="h-5 w-5 shrink-0 fill-sky-400 text-sky-400" />
                <span>{SHELTERED_COMPANY_CONFIG.hqCity}, {SHELTERED_COMPANY_CONFIG.hqCountry}</span>
              </div>
              <a className="flex items-center gap-3 hover:text-sky-300" href={`tel:${SHELTERED_COMPANY_CONFIG.primaryPhone.replace(/\s/g, '')}`}>
                <Phone aria-hidden="true" className="h-5 w-5 shrink-0 fill-sky-400 text-sky-400" />
                {SHELTERED_COMPANY_CONFIG.primaryPhone}
              </a>
              <a className="flex items-center gap-3 hover:text-sky-300" href={`mailto:${SHELTERED_COMPANY_CONFIG.officialEmail}`}>
                <Mail aria-hidden="true" className="h-5 w-5 shrink-0 fill-sky-400 text-sky-400" />
                {SHELTERED_COMPANY_CONFIG.officialEmail}
              </a>
            </address>
          </div>

          {desktopSections.map((section) => (
            <nav key={section.title} aria-label={section.title} className="pt-1">
              <h2 className="text-xl font-bold text-white">{section.title}</h2>
              <div className="mt-3 h-1 w-12 bg-sky-400" />
              <ul className="mt-5 space-y-3">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.label}`}>
                    <button
                      type="button"
                      onClick={() => navigateTo(link.page)}
                      className="flex items-start gap-2 text-left text-base text-blue-50/85 transition hover:text-white"
                    >
                      <ChevronRight aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" />
                      <span>{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="pt-1">
            <h2 className="text-xl font-bold text-white">Follow Us</h2>
            <div className="mt-3 h-1 w-12 bg-sky-400" />
            <nav aria-label="Social media" className="mt-6 flex flex-wrap gap-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200/15 bg-blue-900/65 transition hover:-translate-y-0.5 hover:bg-blue-800/80"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-5 w-5 fill-current ${social.color}`}>
                    {social.icon}
                  </svg>
                </a>
              ))}
            </nav>
            <div className="mt-6 border-t border-blue-100/20 pt-5 text-center">
              <p className="text-lg italic leading-snug text-blue-50/90">
                Your trusted real estate partner worldwide.
              </p>
              <div className="mx-auto mt-5 h-5 w-4/5 rounded-[50%] border-t-4 border-sky-400 [transform:rotate(-8deg)]" />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-28 pt-8 sm:px-8 sm:pb-24 sm:pt-12 lg:hidden">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-300/70 bg-blue-950/75 font-serif-display text-4xl font-bold text-white shadow-lg sm:h-16 sm:w-16 sm:text-5xl">
            S
          </div>
          <div className="min-w-0 border-l-2 border-white/90 pl-3 sm:pl-5">
            <div className="font-serif-display text-3xl font-bold leading-none sm:text-4xl">Sheltered</div>
            <div className="mt-1 max-w-[210px] break-words text-[10px] font-bold uppercase leading-tight text-sky-400 sm:text-xs">
              Global Real Estate Marketplace
            </div>
          </div>
        </div>

        <p className="mt-5 max-w-xl text-base italic leading-snug text-white/90 sm:mt-6 sm:text-lg">
          Connecting property buyers, sellers and investors across international markets.
        </p>
        <div className="my-4 h-1 w-20 bg-sky-400" />

        <div className="space-y-2.5 text-sm sm:text-base">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <MapPin aria-hidden="true" className="h-6 w-6 shrink-0 fill-sky-400 text-sky-400" />
            <span>{SHELTERED_COMPANY_CONFIG.hqCity}, {SHELTERED_COMPANY_CONFIG.hqCountry}</span>
            <span aria-hidden="true" className="mx-1 hidden h-6 border-l border-blue-300/70 sm:block" />
            <Phone aria-hidden="true" className="h-6 w-6 shrink-0 fill-sky-400 text-sky-400" />
            <a className="hover:text-sky-300" href={`tel:${SHELTERED_COMPANY_CONFIG.primaryPhone.replace(/\s/g, '')}`}>
              {SHELTERED_COMPANY_CONFIG.primaryPhone}
            </a>
          </div>
          <a
            className="flex w-fit max-w-full items-center gap-3 break-all hover:text-sky-300 sm:break-normal"
            href={`mailto:${SHELTERED_COMPANY_CONFIG.officialEmail}`}
          >
            <Mail aria-hidden="true" className="h-6 w-6 shrink-0 fill-sky-400 text-sky-400" />
            {SHELTERED_COMPANY_CONFIG.officialEmail}
          </a>
        </div>

        <div className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
          {sections.map((section) => {
            const isOpen = openSection === section.title;
            return (
              <div key={section.title} className="overflow-hidden rounded-xl border border-blue-300/30 bg-blue-950/55 shadow-sm backdrop-blur-sm sm:rounded-2xl">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenSection(isOpen ? null : section.title)}
                  className="flex min-h-14 w-full items-center gap-3 px-4 text-left text-base font-bold hover:bg-blue-900/50 sm:min-h-16 sm:gap-4 sm:px-6 sm:text-lg"
                >
                  {section.icon}
                  <span className="flex-1">{section.title}</span>
                  <ChevronDown aria-hidden="true" className={`h-5 w-5 shrink-0 transition-transform sm:h-6 sm:w-6 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <ul className="grid gap-1 border-t border-blue-300/20 px-4 py-3 sm:grid-cols-2 sm:gap-2 sm:px-6 sm:py-4">
                    {section.links.map((link) => (
                      <li key={`${section.title}-${link.label}`}>
                        <button
                          type="button"
                          onClick={() => navigateTo(link.page)}
                          className="break-words py-1 text-left text-sm text-blue-100 hover:text-white hover:underline sm:text-base"
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

        <div className="mt-7 border-t border-blue-200/30 pt-5 sm:mt-9 sm:pt-6">
          <nav aria-label="Social media" className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                title={social.name}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-300/20 bg-blue-900/65 transition hover:-translate-y-1 hover:border-blue-200/60 hover:bg-blue-800/80 sm:h-14 sm:w-14"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-6 w-6 fill-current sm:h-7 sm:w-7 ${social.color}`}>
                  {social.icon}
                </svg>
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-6 border-t border-blue-200/25 pt-4 pr-12 text-center text-xs text-blue-50/90 sm:mt-8 sm:pr-0 sm:pt-5 sm:text-sm">
          <p>© {new Date().getFullYear()} {t('footer_rights')}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:mt-4 sm:gap-x-4">
            <button type="button" onClick={() => navigateTo('terms')} className="hover:text-sky-300">
              {t('terms_of_service')}
            </button>
            <span aria-hidden="true">|</span>
            <button type="button" onClick={() => navigateTo('privacy')} className="hover:text-sky-300">
              {t('privacy_policy')}
            </button>
            <span aria-hidden="true">|</span>
            <button type="button" onClick={() => navigateTo('contact')} className="hover:text-sky-300">
              {t('legal_compliance')}
            </button>
          </div>
        </div>
        </div>

        <div className="hidden border-t border-blue-100/25 lg:block">
          <div className="mx-auto flex min-h-24 max-w-7xl items-center justify-between gap-6 px-9 pr-36 text-sm text-blue-50/90">
            <p>© {new Date().getFullYear()} {t('footer_rights')}</p>
            <div className="flex items-center gap-5">
              <button type="button" onClick={() => navigateTo('terms')} className="hover:text-sky-300">
                {t('terms_of_service')}
              </button>
              <span aria-hidden="true" className="h-6 border-l border-blue-100/35" />
              <button type="button" onClick={() => navigateTo('privacy')} className="hover:text-sky-300">
                {t('privacy_policy')}
              </button>
              <span aria-hidden="true" className="h-6 border-l border-blue-100/35" />
              <button type="button" onClick={() => navigateTo('contact')} className="hover:text-sky-300">
                {t('legal_compliance')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};