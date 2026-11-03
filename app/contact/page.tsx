'use client';

import { useState } from 'react';
import {
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  Twitter,
  Youtube,
} from 'lucide-react';
import Link from 'next/link';

const inputClasses =
  'h-[52px] w-full rounded-[10px] border border-muted-foreground bg-muted px-3.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitStatus({
        success: true,
        message: "Your message has been sent. We'll get back to you soon.",
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch {
      setSubmitStatus({
        success: false,
        message: 'Something went wrong. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-rule">
        <div className="window-light" aria-hidden>
          <span />
          <span />
        </div>
        <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 py-14 lg:py-20">
          <h1 className="max-w-[14ch] text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[1.02] text-foreground">
            Tell us what you need.
          </h1>
          <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-ink-2">
            Questions, feedback, or a course idea. We would like to hear it.
          </p>
        </div>
      </section>

      {/* Contact content */}
      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Form on a sunken plastic tray */}
          <div className="lg:col-span-7">
            <div className="plastic plastic--thu rounded-[14px] p-2">
              <div className="rounded-[10px] bg-card p-6 sm:p-8">
                <h2 className="text-2xl text-foreground">Send a message</h2>

                {submitStatus && (
                  <div
                    className={`mt-5 flex items-start gap-3 rounded-[10px] border p-4 text-sm ${
                      submitStatus.success
                        ? 'border-accent bg-accent-soft text-ink'
                        : 'border-ink-2 bg-paper-2 text-ink'
                    }`}
                    role="status"
                  >
                    {submitStatus.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink-2">
                        Your name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink-2">
                        Email address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="mb-2 block text-sm font-medium text-ink-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-medium text-ink-2">
                      Your message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full resize-y rounded-[10px] border border-muted-foreground bg-muted px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="btn btn-primary w-full gap-2 disabled:opacity-60 md:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          Sending
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" aria-hidden />
                          Send message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Contact information as pharmacy labels */}
          <div className="space-y-4 lg:col-span-5">
            <div>
              <h2 className="text-2xl text-foreground">Other ways to reach us</h2>
              <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
                Pick the channel that suits you. We answer on weekdays.
              </p>
            </div>

            <div className="dose-label p-5 pb-5">
              <div className="flex items-start gap-3 border-b border-rule pb-4">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-deep" aria-hidden />
                <div>
                  <h3 className="font-sans text-sm font-medium text-foreground">Email</h3>
                  <p className="mt-1 text-[12px] text-ink-2">support@minicourse.com</p>
                  <p className="text-[12px] text-ink-2">info@minicourse.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-b border-rule py-4">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-deep" aria-hidden />
                <div>
                  <h3 className="font-sans text-sm font-medium text-foreground">Phone</h3>
                  <p className="mt-1 text-[12px] text-ink-2">+1 (555) 123-4567</p>
                  <p className="text-[12px] text-ink-2">Mon-Fri, 9:00-18:00 EST</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-4">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-deep" aria-hidden />
                <div>
                  <h3 className="font-sans text-sm font-medium text-foreground">Visit</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-2">
                    123 Learning Street
                    <br />
                    San Francisco, CA 94107
                    <br />
                    United States
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground">Follow us</h3>
              <div className="flex gap-2">
                {[
                  { name: 'Twitter', icon: Twitter },
                  { name: 'LinkedIn', icon: Linkedin },
                  { name: 'Facebook', icon: Facebook },
                  { name: 'Instagram', icon: Instagram },
                  { name: 'YouTube', icon: Youtube },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={`#${social.name.toLowerCase()}`}
                    className="grid h-10 w-10 place-items-center rounded-full border border-rule bg-card text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                    aria-label={social.name}
                  >
                    <social.icon className="h-4 w-4" aria-hidden />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="mx-auto max-w-[1240px] px-5 pb-16 sm:px-8">
        <div className="rounded-[14px] border border-rule bg-card p-2">
          <div className="flex aspect-[16/7] items-center justify-center rounded-[10px] bg-paper-2">
            <div className="text-center text-muted-foreground">
              <MapPin className="mx-auto mb-3 h-8 w-8" aria-hidden />
              <p className="text-xs">123 Learning Street, San Francisco</p>
              <p className="mt-1 text-xs">Map integration comes with production</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-rule bg-paper-2/60">
        <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-[clamp(1.7rem,3vw,2.4rem)] text-foreground">Have more questions?</h2>
              <p className="mt-2 max-w-[42ch] text-sm text-muted-foreground">
                Learn more about the platform and how it works.
              </p>
            </div>
            <Link href="/about" className="btn btn-primary">
              Visit about page
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
