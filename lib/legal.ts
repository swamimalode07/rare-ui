import { SITE_NAME, SITE_URL } from "@/lib/site";

export type LegalSection = {
  heading: string;
  body?: string[];
  list?: string[];
};

export const SUPPORT_EMAIL = "swamimalodeofficial@gmail.com";

export const BUSINESS_OWNER = "Swami Malode";

export const BUSINESS_COUNTRY = "India";

export const GOVERNING_LAW = `the laws of ${BUSINESS_COUNTRY}`;

export const JURISDICTION = `the courts of ${BUSINESS_COUNTRY}`;

export const DISPUTE_WINDOW = "30 days";

export const LEGAL_UPDATED = "November 22, 2026";

export const MERCHANT_NAME = "Polar";

export const MERCHANT_URL = "https://polar.sh";

export const MERCHANT_PRIVACY_URL = "https://polar.sh/legal/privacy";

export const SUPPORT_RESPONSE = "within 2 business days";

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      `${SITE_NAME} is a paid React component registry operated by ${BUSINESS_OWNER}, an independent developer based in ${BUSINESS_COUNTRY}. This policy covers ${SITE_URL}, the component registry served from it, and the Pro checkout linked from it.`,
    ],
  },
  {
    heading: "The short version",
    body: [
      "You do not need an account to browse the site. An account is only needed to buy and use Pro. We do not run ads, we do not use tracking cookies, and we do not sell or share your data with anyone for their own marketing.",
      "The only personal data we hold is your account details if you create one, and whatever you write to us directly.",
    ],
  },
  {
    heading: "What we collect",
    list: [
      "Anonymous usage analytics: page views, referrer, country, browser and device type, collected through Databuddy. The data is aggregated and is not used to identify you.",
      "Account details: your name and email address, plus a hashed password if you sign up with email, or your Google account ID if you sign in with Google. We never see your Google password.",
      "Pro license records: which order your license came from, whether it is active, and a hashed copy of your CLI token. The token itself is shown to you once and never stored.",
      "Billing details: name, billing address, email address and tax identifiers, collected and stored by our payment processor, not by us. We receive only your order and its status.",
      "Messages you send: anything you include when you email us or message us on X.",
    ],
  },
  {
    heading: "What we do not collect",
    body: [
      "We do not run advertising, cross-site tracking or fingerprinting, we do not build profiles, and we never see or store your card number.",
      "Installing a component with the shadcn CLI fetches a JSON file from the registry. For Pro components the CLI also sends your token so we can check your license. Nothing about your project, your code or your machine is sent to us.",
      "Your theme preference is kept in your browser's local storage on your own device. It is never sent to us.",
    ],
  },
  {
    heading: "Payments",
    body: [
      `Payments are processed by ${MERCHANT_NAME} (${MERCHANT_URL}), which acts as the merchant of record. ${MERCHANT_NAME} collects your payment details directly, calculates and remits tax, and issues your invoice. Their handling of your data is governed by their own privacy policy at ${MERCHANT_PRIVACY_URL}.`,
    ],
  },
  {
    heading: "Service providers",
    body: [
      "We rely on a small number of third parties to run the site. Each processes only the data needed for its function.",
    ],
    list: [
      `${MERCHANT_NAME}: payment processing and invoicing.`,
      "Google: sign in with Google, if you choose it.",
      "Neon: hosts the database that stores accounts and licenses.",
      "Databuddy: privacy-focused, aggregated website analytics.",
      "Our hosting provider: serves the site and keeps short-lived server logs, including IP addresses, for security and reliability.",
    ],
  },
  {
    heading: "How we use your information",
    body: [
      "We use account and billing details to deliver and support your Pro license, and to reply to you. We use aggregated analytics to understand which components people find useful and to decide what to build next. We do not use any of it for automated decision making or profiling.",
    ],
  },
  {
    heading: "Where your data is processed",
    body: [
      `We operate from ${BUSINESS_COUNTRY} and our providers process data in the United States and the European Union. Where personal data is transferred out of your country, it is covered by the safeguards those providers put in place, such as standard contractual clauses.`,
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "Account details are kept until you ask us to delete your account. Invoice and license records are kept for as long as tax and accounting law requires, currently up to eight years. Email correspondence is kept while it is useful for support, then deleted. Aggregated analytics holds no personal data and is retained indefinitely.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      `You can ask for a copy of the personal data we hold about you, ask us to correct it, ask us to delete it, or object to a particular use, subject to records we are legally required to keep. Email ${SUPPORT_EMAIL} and we will respond ${SUPPORT_RESPONSE}, and in any case within 30 days.`,
      `If your request concerns payment data held by ${MERCHANT_NAME}, we will pass it on to them. If you are in the EU or the UK and you are not satisfied with our response, you can complain to your local data protection authority.`,
    ],
  },
  {
    heading: "Security",
    body: [
      "The site is served over HTTPS. Passwords and CLI tokens are stored only as hashes. Payment data is handled entirely by our payment processor on PCI compliant infrastructure. No method of transmission over the internet is completely secure, so we cannot guarantee absolute security.",
    ],
  },
  {
    heading: "Children",
    body: [
      "The site is not directed at children under 16, and we do not knowingly collect their personal data. If you believe a child has given us personal data, email us and we will delete it.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      "We may update this policy as the site changes. The date at the top always reflects the current version. If a change materially affects a customer, we email them first.",
    ],
  },
  {
    heading: "Contact",
    body: [`Questions about this policy or your data: ${SUPPORT_EMAIL}.`],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "Agreement",
    body: [
      `These terms govern your use of ${SITE_NAME} at ${SITE_URL}, the components published in its registry, and anything you buy from us. The site is operated by ${BUSINESS_OWNER}, an independent developer based in ${BUSINESS_COUNTRY}. By using the site, installing a component, or making a purchase, you accept these terms.`,
      `In these terms, "Pro" means the paid components in the ${SITE_NAME} registry, available to license holders.`,
    ],
  },
  {
    heading: "The Pro license",
    body: [
      "Buying Pro gives you a personal license to use Pro components in your own personal and commercial projects, closed source included. You own the code you build with them.",
      "You may not sell, sublicense, share or redistribute Pro components themselves, whether alone, in a bundle, or as a version ported to another framework, and you may not repackage them as a competing component library. Do not share your CLI token.",
      "The license covers the component code. The name Rare UI, the logo and the site design are not: those stay ours, and the license does not grant you rights to them.",
    ],
  },
  {
    heading: "Pro",
    body: [
      "Pro shows its price and any product-specific terms at checkout before you pay. These terms apply to it in addition to those.",
    ],
  },
  {
    heading: "Pricing and billing",
    body: [
      `Pro is a one-time payment, charged at checkout. Payments are processed by ${MERCHANT_NAME}, the merchant of record for every purchase. Applicable sales tax, VAT or GST is calculated and added by ${MERCHANT_NAME} at checkout, and you receive an invoice by email.`,
      "We may change the price at any time. A change never affects a license you already bought.",
    ],
  },
  {
    heading: "Refunds",
    body: [
      `You can request a full refund within 14 days of purchase if Pro is faulty or not as described. Email ${SUPPORT_EMAIL}. Refunds are issued to the original payment method by ${MERCHANT_NAME} and usually appear within 5 to 10 business days.`,
      "A refund ends your Pro license, and your CLI token stops working.",
    ],
  },
  {
    heading: "Acceptable use",
    body: [
      "Do not attempt to disrupt the site, scrape it in a way that degrades service for others, or use it to distribute malware. We may block access that does.",
    ],
  },
  {
    heading: "No warranty",
    body: [
      `The site and every component are provided "as is", without warranty of any kind, express or implied, including merchantability, fitness for a particular purpose and non-infringement. Components are animated interface code, not safety critical software. You are responsible for reviewing and testing anything you install before shipping it.`,
    ],
  },
  {
    heading: "Limitation of liability",
    body: [
      "To the extent permitted by law, our total liability for any claim relating to the site, the registry or a purchase is limited to the amount you paid us in the 12 months before the claim, and is zero where you paid us nothing. We are not liable for indirect or consequential loss, including lost profits or lost data.",
    ],
  },
  {
    heading: "Changes to these terms",
    body: [
      "We may update these terms as the project changes. The date at the top reflects the current version. If a change materially affects a customer, we email them before it takes effect. Continuing to use the site after an update means you accept it.",
    ],
  },
  {
    heading: "Resolving a problem",
    body: [
      `Almost everything is fixable by email. If you are unhappy with a purchase, a charge or anything else, write to ${SUPPORT_EMAIL} with the details before taking any other step. We will work with you in good faith to sort it out, and in most cases the answer is simply a refund.`,
      `Both sides agree to try to resolve a dispute this way for at least ${DISPUTE_WINDOW} from the day it is raised in writing, before starting any formal proceedings. Nothing here stops either side from going to court sooner where the law gives you that right.`,
    ],
  },
  {
    heading: "Governing law",
    body: [
      `These terms are governed by ${GOVERNING_LAW}, and ${JURISDICTION} have exclusive jurisdiction over any dispute. If you are a consumer, this does not remove protections you have under the law of your own country.`,
    ],
  },
  {
    heading: "Contact",
    body: [
      `For support, billing questions or refunds, email ${SUPPORT_EMAIL}. We reply ${SUPPORT_RESPONSE}.`,
    ],
  },
];
