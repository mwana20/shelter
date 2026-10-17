import React from 'react';
import { useApp } from '../context/AppContext';
import { companySettings } from '../config/company';

export type PolicyKind = 'privacy' | 'terms' | 'marketplace-policy';

const policyContent: Record<PolicyKind, { title: string; intro: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    title: 'Privacy Policy',
    intro: 'Draft version 1.0 · English · Last updated October 16, 2026. This draft must be reviewed against applicable Ugandan and other relevant privacy laws before launch.',
    sections: [
      { heading: 'Information and purpose', body: 'A production service may collect account details, contact information, language preferences, listing content, inquiries, and technical data needed to operate the marketplace, protect accounts, respond to requests, and meet legal obligations. This preview does not provide backend account or contact processing.' },
      { heading: 'Public listings and private information', body: 'Property titles, descriptions, locations, prices, photographs, and seller contact details may be visible to visitors when a listing is published. Passwords, verification tokens, private identity documents, and account recovery information must never be displayed publicly. Do not submit sensitive documents to this preview.' },
      { heading: 'Media and third parties', body: 'A production marketplace may use managed storage, email, analytics, and payment providers. Their identities, purposes, locations, and safeguards must be disclosed before those integrations are enabled. No payment provider or transactional email service is currently configured in this project.' },
      { heading: 'Cookies, retention, and security', body: 'This preview stores some preferences and sample changes in browser local storage. That is not a secure account store. Production retention periods, cookie controls, backups, incident response, and access controls must be documented and implemented before collecting real user data.' },
      { heading: 'Access, correction, deletion, and international transfers', body: 'Users should be able to request access to or correction of their data and account deletion. Active listings, legal retention obligations, and deletion consequences need a documented workflow. International transfers require appropriate safeguards under applicable law.' },
      { heading: 'Contact and complaints', body: `Privacy contact details are not configured. The company headquarters are in ${companySettings.headquarters}; an official privacy contact must be provided before launch.` }
    ]
  },
  terms: {
    title: 'Terms of Service',
    intro: 'Draft version 1.0 · English · Last updated October 16, 2026. Obtain legal review for each country where the marketplace operates before acceptance is collected.',
    sections: [
      { heading: 'Eligibility and account security', body: 'Users must provide accurate information, meet applicable age and legal requirements, protect their credentials, and promptly report suspected account compromise. Production account creation, verification, recovery, and role permissions are not available until a secure backend is configured.' },
      { heading: 'Listings and user content', body: 'Sellers are responsible for their authority to advertise a property, the accuracy of descriptions, locations, prices, availability, photographs, and documents, and having permission to publish submitted content. Fraudulent, duplicate, misleading, unlawful, or unauthorized listings may be rejected or removed.' },
      { heading: 'Marketplace role and due diligence', body: 'The marketplace helps users discover and contact one another. A listing, profile, badge, or uploaded document is not a guarantee of ownership, legal title, condition, authority to sell, or transaction outcome. Buyers and tenants should inspect properties and obtain independent legal and professional advice.' },
      { heading: 'Fees, cancellations, and third parties', body: 'No listing fee, subscription, featured placement, refund, or property payment service is currently configured. A production service must disclose amounts, currencies, taxes, cancellation terms, and payment-provider terms before accepting payment.' },
      { heading: 'Moderation, availability, and termination', body: 'Listings may be reviewed, corrected, suspended, or removed under published rules. The production service must define complaint handling, disputes, account suspension, data retention, service availability, and appeal processes.' },
      { heading: 'Changes and governing law', body: 'Material changes should be versioned and presented for renewed acceptance where required. Governing law, dispute venue, and contact details remain for qualified counsel and the company to specify.' }
    ]
  },
  'marketplace-policy': {
    title: 'Property Marketplace Service Policy',
    intro: 'Draft version 1.0 · English · Last updated October 16, 2026. This draft describes intended marketplace rules; review and operationalize it before accepting real listings.',
    sections: [
      { heading: 'Submitting a property', body: 'A seller must have authority to advertise and provide accurate property category, transaction type, location, price, currency, availability, and material features. The production submission form should request relevant tenure, size, condition, and rental terms without treating document upload as proof of ownership.' },
      { heading: 'Photographs and video', body: 'The intended standard is five property photographs and one separate property video per listing. Media must depict the advertised property, be uploaded with permission, and meet server-side type, size, and integrity checks. The current preview does not provide secure media storage or enforce this standard.' },
      { heading: 'Review and publication', body: 'Submissions should remain pending until an authorized reviewer decides whether to approve, reject, or request corrections. Payment must not bypass review. Only an implemented, audited review process may publish a listing; the current browser-only admin workflow is not an operational approval system.' },
      { heading: 'Accuracy, duplicates, and listing status', body: 'Sellers should correct material changes promptly, avoid duplicate or unauthorized listings, and mark sold, rented, leased, or unavailable properties. Listings may expire under a configured schedule and may require renewed approval after significant changes.' },
      { heading: 'Verification and safety', body: 'Verification badges may only be used after a documented check by an authorized person. Users should independently confirm identity, authority, title, boundaries, permitted use, and property condition with relevant local authorities and qualified professionals.' },
      { heading: 'Promotions, reports, and platform role', body: 'Featured placement and advertising fees must be clearly labeled and disclosed before purchase. Users should be able to report suspicious content. The marketplace is an introduction service and does not itself guarantee ownership, availability, or transaction outcomes, subject to applicable law.' }
    ]
  }
};

const policyKinds: PolicyKind[] = ['privacy', 'terms', 'marketplace-policy'];

export const PolicyPage: React.FC<{ kind: PolicyKind }> = ({ kind }) => {
  const { setCurrentPage } = useApp();
  const selected = policyContent[kind];

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase text-emerald-800">{companySettings.name} · {companySettings.headquarters}</p>
        <h1 className="mt-3 text-3xl font-bold text-neutral-950">{selected.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">{selected.intro}</p>
        <nav aria-label="Policies" className="mt-8 flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
          {policyKinds.map((policy) => (
            <button
              key={policy}
              type="button"
              aria-current={policy === kind ? 'page' : undefined}
              onClick={() => setCurrentPage(policy)}
              className={`px-3 py-2 text-sm font-semibold ${policy === kind ? 'border-b-2 border-emerald-800 text-emerald-900' : 'text-neutral-600 hover:text-neutral-950'}`}
            >
              {policyContent[policy].title}
            </button>
          ))}
        </nav>
        <div className="divide-y divide-neutral-200">
          {selected.sections.map((section) => (
            <section key={section.heading} className="py-6">
              <h2 className="text-lg font-bold text-neutral-900">{section.heading}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{section.body}</p>
            </section>
          ))}
        </div>
        <p className="border-t border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          These policy drafts are not legal advice and must be reviewed by qualified counsel before production use.
        </p>
      </div>
    </main>
  );
};