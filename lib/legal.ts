import { SITE_NAME, SITE_REPO, SITE_URL } from "@/lib/site";
import { TIERS } from "@/lib/sponsors";

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

export const LEGAL_UPDATED = "August 26, 2026";

export const MERCHANT_NAME = "Creem";

export const MERCHANT_URL = "https://www.creem.io";

export const MERCHANT_PRIVACY_URL = "https://www.creem.io/privacy";

export const SUPPORT_RESPONSE = "within 2 business days";

const tierLine = TIERS.map(
  (tier) => `${tier.name} at $${tier.price} per month`,
).join(", ");

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      `${SITE_NAME} is a free, open-source React component registry operated by ${BUSINESS_OWNER}, an independent developer based in ${BUSINESS_COUNTRY}. This policy covers ${SITE_URL}, the component registry served from it, and the sponsorship checkout linked from it.`,
    ],
  },
  {
    heading: "The short version",
    body: [
      "You do not need an account to browse the site or to install a component. We do not run ads, we do not use tracking cookies, and we do not sell or share your data with anyone for their own marketing.",
      "The only personal data we hold is what a sponsor gives us in order to be listed, and whatever you write to us directly.",
    ],
  },
  {
    heading: "What we collect",
    list: [
      "Anonymous usage analytics: page views, referrer, country, browser and device type, collected through Databuddy. The data is aggregated and is not used to identify you.",
      "Sponsorship billing details: name, company, billing address, email address and tax identifiers, collected and stored by our payment processor, not by us. We receive only your name or company name, email address, tier and subscription status.",
      "Sponsor brand assets: the logo, company name and destination link you send us so we can publish your placement.",
      "Messages you send: anything you include when you email us or message us on X.",
      "Public repository activity: if you open an issue or a pull request, that is handled by GitHub under their terms and is public by design. We do not import it into any other system.",
    ],
  },
  {
    heading: "What we do not collect",
    body: [
      "We do not run advertising, cross-site tracking or fingerprinting, we do not build profiles, and we never see or store your card number.",
      "Installing a component with the shadcn CLI fetches a static JSON file from the registry. Nothing about your project, your code or your machine is sent to us.",
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
      `${MERCHANT_NAME}: payment processing, subscription billing and invoicing.`,
      "Databuddy: privacy-focused, aggregated website analytics.",
      "GitHub: hosts the open-source repository, serves the registry files, and provides the public star count shown on the site.",
      "Our hosting provider: serves the site and keeps short-lived server logs, including IP addresses, for security and reliability.",
    ],
  },
  {
    heading: "How we use your information",
    body: [
      "We use billing and contact details to deliver and support a sponsorship, to send receipts and renewal notices, and to reply to you. We use aggregated analytics to understand which components people find useful and to decide what to build next. We do not use any of it for automated decision making or profiling.",
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
      "Invoice and sponsorship records are kept for as long as tax and accounting law requires, currently up to eight years. Email correspondence is kept while it is useful for support, then deleted. Aggregated analytics holds no personal data and is retained indefinitely.",
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
      "The site is served over HTTPS. Payment data is handled entirely by our payment processor on PCI compliant infrastructure. No method of transmission over the internet is completely secure, so we cannot guarantee absolute security.",
    ],
  },
  {
    heading: "Children",
    body: [
      "The site is not directed at children under 16, and we do not knowingly collect their personal data. If you believe a child has given us personal data, email us and we will delete it.",
    ],
  },
  {
    heading: "If we add paid products or accounts",
    body: [
      `${SITE_NAME} is free today, and sponsorship is the only thing we sell. If we later add paid components, licenses, downloads or anything that needs an account, that will introduce new categories of data, such as login credentials, license keys and purchase history.`,
      "We will update this policy, and the date on it, before we start collecting anything new, and we will describe what is collected and why. We will not quietly apply this version of the policy to data it never covered.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      "We may update this policy as the site changes. The date at the top always reflects the current version. If a change materially affects an active sponsor or customer, we email them first.",
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
      `In these terms, "the registry" means the free open-source components published at ${SITE_REPO}, and "paid offerings" means anything we sell. Sponsorship is currently the only paid offering.`,
    ],
  },
  {
    heading: "The registry is free and open source",
    body: [
      "Every component in the registry is free, published under the MIT License, and installable with the shadcn CLI. You may use, modify and ship the components in personal and commercial projects, closed source included, with no attribution required beyond what the MIT License states. You own the code once it is in your project.",
      "What you may not do is repackage the registry as a competing component library or resell it as your own product. Individual components in your own applications are exactly what they are for.",
      "The components are covered by the MIT License. The name Rare UI, the logo and the site design are not: those stay ours, and the license does not grant you rights to them.",
    ],
  },
  {
    heading: "Contributions",
    body: [
      "If you contribute code to the public repository, you confirm you have the right to do so, and you license your contribution under the same MIT License as the rest of the registry. You keep the copyright to what you wrote. We may edit, refactor or remove a contribution after it is merged.",
    ],
  },
  {
    heading: "If we add paid offerings later",
    body: [
      "The registry is free today and we intend to keep the components that are already published free. We may add paid offerings in the future, for example premium components, templates, licenses or hosted services.",
      "Anything published under the MIT License stays under it. Releasing a paid product later does not retroactively change the license of a component you already installed, and does not give us a claim over a project you built with it.",
      "Any paid offering will show its price and any additional product-specific terms at the point of purchase before you pay. These terms apply to it in addition to those.",
    ],
  },
  {
    heading: "What sponsorship is",
    body: [
      `Sponsorship is a monthly advertising placement. Your logo and link are shown on the ${SITE_NAME} site and in the README according to the tier you pick, and it funds continued development of the free registry.`,
      "Sponsorship does not buy priority support, custom component development, influence over the roadmap, or any right to the code beyond the MIT License everyone already has.",
    ],
  },
  {
    heading: "Pricing and billing",
    body: [
      `Sponsorship tiers are ${tierLine}. Every tier and what it includes is listed on the sponsors page. All prices are in US dollars and are recurring monthly subscriptions.`,
      `Your first payment is charged at checkout and the subscription renews automatically on the same date each month until you cancel. Payments are processed by ${MERCHANT_NAME}, the merchant of record for every purchase. Applicable sales tax, VAT or GST is calculated and added by ${MERCHANT_NAME} at checkout, and you receive an invoice by email for each payment.`,
      "We may change pricing at any time. An active sponsor keeps their current price for as long as the subscription runs without interruption, and we give at least 30 days' notice by email before any change takes effect on renewal.",
    ],
  },
  {
    heading: "Delivery",
    body: [
      "After your first payment, send us your logo in SVG or PNG, with a light and a dark version if you have both, and the URL it should link to. We publish your placement within 3 business days of receiving those assets. It stays live for as long as the subscription is active.",
    ],
  },
  {
    heading: "Cancellation and refunds",
    body: [
      `You can cancel at any time from the billing portal link in your receipt, or by emailing ${SUPPORT_EMAIL}. Cancelling stops future charges. Your placement stays live until the end of the period you have already paid for, and is then removed.`,
      "If you cancel within 14 days of your first payment, email us and we refund that payment in full. After 14 days, and for renewal payments, charges are not refundable, because the placement has already been delivered for that month.",
      "If we remove your placement early through no fault of yours, or take the site down, we refund the unused part of the month.",
      `For any future paid offering that is a one-time digital purchase, you can request a full refund within 14 days of purchase if the product is faulty or not as described. Refunds are issued to the original payment method by ${MERCHANT_NAME} and usually appear within 5 to 10 business days.`,
    ],
  },
  {
    heading: "Sponsor content",
    body: [
      "You confirm you have the right to license us the logo and marks you send, and you grant us permission to display them for the duration of the sponsorship. If someone brings a claim against us over marks you told us we could use, you cover the cost of dealing with it.",
      "We may decline or remove a sponsorship, with a pro rata refund of the current month, if the brand or destination site involves illegal activity, adult content, gambling, hate speech, malware, or anything that would misrepresent an association with this project. A placement is advertising, not an endorsement.",
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
      "We may update these terms as the project changes. The date at the top reflects the current version. If a change materially affects an active sponsor or customer, we email them before it takes effect on their next renewal. Continuing to use the site after an update means you accept it.",
    ],
  },
  {
    heading: "Resolving a problem",
    body: [
      `Almost everything is fixable by email. If you are unhappy with a placement, a charge or anything else, write to ${SUPPORT_EMAIL} with the details before taking any other step. We will work with you in good faith to sort it out, and in most cases the answer is simply a refund.`,
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
      `For support, billing questions, cancellations or refunds, email ${SUPPORT_EMAIL}. We reply ${SUPPORT_RESPONSE}.`,
    ],
  },
];
