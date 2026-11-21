import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import certificationsData from "../data/certifications.json";
import socialData from "../data/social.json";
import hobbiesData from "../data/hobbies.json";
import contactData from "../data/contact.json";
import { resolveAssetUrl } from "../lib/utils";
import { SectionHeader } from "./SectionHeader";
import { SpotlightCard } from "./SpotlightCard";

interface CertItem {
  name: string;
  issuer: string;
  issue_date: string;
  image?: string;
}

export function SignalsHub() {
  const [selectedCert, setSelectedCert] = useState<CertItem | null>(null);

  const certificates = certificationsData as CertItem[];
  const socialEntries = Object.entries(socialData as Record<string, string>);
  const hobbies = hobbiesData as string[];
  const contactEntries = contactData as Array<{
    method: string;
    link: string;
    cta: string;
  }>;

  useEffect(() => {
    if (!selectedCert) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCert(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedCert]);

  return (
    <section
      id="signals"
      className="relative border-b border-border py-20 md:py-24"
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-10">
        <SectionHeader
          eyebrow="credentials · networks · contact channels"
          title="Signals"
          index="05"
        />

        {/* Certifications Gallery */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-xs text-cyan tracking-[0.16em] uppercase">
              Certifications
            </div>
            <div className="font-mono text-[11px] text-text-dim">
              click to inspect full badge
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {certificates.map((cert) => {
              const imgUrl = cert.image ? resolveAssetUrl(cert.image) : null;
              return (
                <SpotlightCard
                  key={cert.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCert(cert)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedCert(cert);
                    }
                  }}
                  className="p-4 flex flex-col group"
                >
                  {imgUrl && (
                    <div className="w-full h-36 rounded-[3px] border border-border bg-bg/90 p-3 mb-4 flex items-center justify-center overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={cert.name}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="text-sm font-medium text-text-hi leading-snug mb-2 group-hover:text-cyan transition-colors">
                    {cert.name}
                  </div>
                  <div className="mt-auto pt-2 border-t border-border/60 flex items-center justify-between font-mono text-[11px] text-text-dim">
                    <span>{cert.issuer}</span>
                    <span>{cert.issue_date}</span>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>

        {/* Networks + Hobbies + Contact Modes Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <SpotlightCard corners className="lg:col-span-7 p-6 space-y-6">
            <div>
              <div className="font-mono text-xs text-cyan tracking-[0.16em] uppercase mb-3.5">
                Networks
              </div>
              <div className="flex flex-wrap gap-2">
                {socialEntries.map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-text-hi border border-border-hi bg-bg/70 px-3.5 py-2 rounded-[3px] tracking-wider transition-all duration-200 hover:border-cyan hover:text-cyan inline-flex items-center gap-1.5"
                  >
                    <span>{name}</span>
                    <span className="text-cyan/70 text-[10px]">↗</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-border/80">
              <div className="font-mono text-xs text-cyan tracking-[0.16em] uppercase mb-3.5">
                Off-grid Interests
              </div>
              <div className="flex flex-wrap gap-2">
                {hobbies.map((hobby) => (
                  <span
                    key={hobby}
                    className="font-mono text-xs text-text border border-border bg-bg/60 px-3 py-1.5 rounded-[3px] tracking-wide"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard corners className="lg:col-span-5 p-6 flex flex-col">
            <div className="font-mono text-xs text-cyan tracking-[0.16em] uppercase mb-4">
              Direct Channels
            </div>
            <div className="space-y-3 my-auto">
              {contactEntries.map((entry) => (
                <a
                  key={entry.method}
                  href={entry.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 border border-border-hi bg-bg/70 hover:border-cyan hover:bg-cyan/5 p-4 rounded-[4px] transition-all duration-200 group"
                >
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">
                      {entry.method}
                    </div>
                    <div className="text-sm font-medium text-text-hi group-hover:text-cyan transition-colors mt-0.5">
                      {entry.cta}
                    </div>
                  </div>
                  <span className="font-mono text-sm text-text-dim group-hover:text-cyan group-hover:translate-x-0.5 transition-all">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* Certificate Lightbox Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCert(null)}
            className="fixed inset-0 z-[920] bg-bg/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[720px] hud-panel rounded-[6px] p-5 md:p-6 border border-cyan/40"
            >
              <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-border">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">
                    {selectedCert.issuer} · {selectedCert.issue_date}
                  </div>
                  <div className="text-base md:text-lg font-semibold text-text-hi mt-1">
                    {selectedCert.name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="font-mono text-xs text-text-dim hover:text-cyan border border-border-hi px-2.5 py-1 rounded-[3px]"
                >
                  ESC ✕
                </button>
              </div>
              {selectedCert.image && (
                <div className="bg-bg rounded-[4px] border border-border p-4 flex items-center justify-center max-h-[68vh] overflow-hidden">
                  <img
                    src={resolveAssetUrl(selectedCert.image)}
                    alt={selectedCert.name}
                    className="max-h-[60vh] max-w-full object-contain"
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
