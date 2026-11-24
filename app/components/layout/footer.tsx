import React from 'react';
import Link from 'next/link';
import { Phone } from 'lucide-react';

interface FooterLink {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerLinks: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { name: 'Courses', href: '/course' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Create Course', href: '/course/create' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Blog', href: '/blog' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Support', href: '/support' },
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  },
  {
    title: 'Contact',
    links: [
      {
        name: '+1 (555) 123-4567',
        href: 'tel:+15551234567',
        icon: <Phone className="w-3.5 h-3.5" aria-hidden />,
      },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-rule bg-paper-2">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.7fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-accent text-accent-ink font-display text-[13px] font-bold">MG</span>
              <span className="font-display text-lg font-bold tracking-[-0.03em]">MiniGuide AI</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A short-course platform for bite-size learning. Build skills at your own pace: mobile friendly, self-paced, and free to start.
            </p>
          </div>

          {/* Sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 font-sans text-xs font-medium text-muted-foreground">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      prefetch={link.href === "/course/create" ? false : undefined}
                      className="inline-flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-accent-deep"
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-rule pt-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear} MiniGuide AI
          </p>
          <nav className="flex flex-wrap gap-1">
            {[
              { name: 'Terms', href: '/terms' },
              { name: 'Privacy', href: '/privacy' },
              { name: 'Cookies', href: '/cookies' },
              { name: 'About', href: '/about' },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="inline-flex h-8 items-center justify-center rounded-[10px] px-3 text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
