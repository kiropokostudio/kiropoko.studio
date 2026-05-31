"use client";

import { trackEvent } from "@/lib/analytics";

type ObfuscatedEmailLinkProps = {
  label: string;
};

const emailUserParts = ["kiropoko", "studio"];
const emailDomainParts = ["g", "mail"];
const emailTld = "com";

function getEmailAddress() {
  return `${emailUserParts.join("")}@${emailDomainParts.join("")}.${emailTld}`;
}

export function ObfuscatedEmailLink({ label }: ObfuscatedEmailLinkProps) {
  return (
    <button
      type="button"
      className="footer-contact"
      aria-label={label}
      onClick={() => {
        trackEvent("contact_click", {
          location: "footer",
        });
        window.location.href = `mailto:${getEmailAddress()}`;
      }}
    >
      <span>{label}</span>
      <span aria-hidden="true">
        kiropokostudio <span className="footer-contact__mark">[at]</span> gmail{" "}
        <span className="footer-contact__mark">[dot]</span> com
      </span>
    </button>
  );
}
