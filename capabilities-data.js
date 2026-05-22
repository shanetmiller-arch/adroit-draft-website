// ADROIT Draft Website — Capabilities Matrix Module
// Phase 2: core content — structured capability framework that adds depth
// beyond the Phase 1 scaffold without altering existing renderers.
//
// Design baselines applied:
//   - Input validation at the data boundary (validateCapability) — every
//     entry is checked against a closed schema before it can render.
//   - Output sanitization (sanitizeCapabilityData) — HTML-escapes text
//     fields so a tampered stub cannot inject script into the DOM.
//   - No PII, no secrets, no remote calls — purely static content.
//   - Progressive enhancement: if the host page exposes a designated
//     container, deeper content renders into it; otherwise this module
//     is inert and existing pages are unaffected.

const capabilityStubs = [
  {
    id: 'risk-assessment',
    domain: 'risk-management',
    title: 'Continuous Risk Assessment',
    summary: 'Quantitative and qualitative risk evaluation aligned to NIST RMF and CMMI L4 measurement.',
    detail: 'Captures program-level risks across cost, schedule, technical, and operational vectors. Risks are scored against likelihood and impact matrices, traced to mitigations, and rolled up into executive dashboards for evidence-driven decisions.',
    outcomes: [
      'Standardized scoring across portfolio',
      'Auditable mitigation lineage',
      'Roll-up reporting for executive review'
    ],
    phase: 'Phase 2',
    maturity: 'developing',
    product: 'rmfm',
    cmmiLevel: 'L4'
  },
  {
    id: 'audit-trail',
    domain: 'compliance',
    title: 'Tamper-Evident Audit Trail',
    summary: 'Append-only event log with chained hashes for compliance evidence.',
    detail: 'Every state change writes a signed entry with a cryptographic link to the prior record. Auditors can verify the chain end-to-end and confirm that historical evidence has not been altered after the fact.',
    outcomes: [
      'Chain-of-custody for compliance evidence',
      'Reduced audit-prep effort',
      'Independent verifiability'
    ],
    phase: 'Phase 2',
    maturity: 'developing',
    product: 'rmfm',
    cmmiLevel: 'L3'
  },
  {
    id: 'program-monitoring',
    domain: 'monitoring',
    title: 'Real-Time Program Telemetry',
    summary: 'Streaming visibility into program health across milestones, dependencies, and resource utilization.',
    detail: 'Aggregates inputs from program-of-record systems, normalizes them against the WBS, and surfaces leading indicators of slippage. Operates on a read-only consumer model — no source-system writes — so existing program tooling remains authoritative.',
    outcomes: [
      'Earlier slippage detection',
      'Reduced manual status reporting',
      'Cross-program comparability'
    ],
    phase: 'Phase 1',
    maturity: 'early',
    product: 'pmris',
    cmmiLevel: 'L3'
  },
  {
    id: 'compliance-reporting',
    domain: 'compliance',
    title: 'Automated Compliance Reporting',
    summary: 'Templated reports mapped to FISMA, FedRAMP, and CMMC control families.',
    detail: 'Generates auditor-ready artifacts from the underlying control evidence store. Templates are version-controlled and traceable to authoritative source documents so reviewers can confirm provenance without leaving the report.',
    outcomes: [
      'Hours-not-weeks report turnaround',
      'Single-source-of-truth evidence',
      'Traceability to authoritative controls'
    ],
    phase: 'Phase 2',
    maturity: 'developing',
    product: 'rmfm',
    cmmiLevel: 'L4'
  },
  {
    id: 'operational-insights',
    domain: 'methodology',
    title: 'Operational Insights Loop',
    summary: 'Feedback channel from production deployments back into product roadmap.',
    detail: 'Structured observations from ADEPT consulting engagements are codified into a backlog signal — turning real operational pain into prioritized product capability without losing context or attribution.',
    outcomes: [
      'Roadmap grounded in field evidence',
      'Faster recognition of recurring gaps',
      'Closed-loop validation post-deploy'
    ],
    phase: 'Phase 2',
    maturity: 'developing',
    product: 'rmfm',
    cmmiLevel: 'L5'
  },
  {
    id: 'secure-by-design',
    domain: 'security',
    title: 'Security Embedded From Inception',
    summary: 'Threat modeling, parameterized queries, and least-privilege defaults applied at build time.',
    detail: 'Security controls are not bolted on. Threat models live alongside the code, dependencies are scanned on every change, and data-access paths use parameterized queries by policy — eliminating the most common injection vectors before deploy.',
    outcomes: [
      'Reduced vulnerability surface',
      'Faster authorization-to-operate cycles',
      'Lower remediation cost'
    ],
    phase: 'Phase 1',
    maturity: 'developing',
    product: 'rmfm',
    cmmiLevel: 'L3'
  }
];

// Closed schema — anything outside these allowed values is rejected at the
// boundary. Adding a new domain or maturity tier is an intentional change,
// not something a tampered stub can sneak in.
const CAPABILITY_SCHEMA = {
  required: ['id', 'domain', 'title', 'summary', 'detail', 'outcomes', 'phase', 'maturity', 'product', 'cmmiLevel'],
  allowedDomains: ['risk-management', 'compliance', 'monitoring', 'methodology', 'security', 'operations'],
  allowedMaturity: ['early', 'developing', 'stable', 'production'],
  allowedPhases: ['Phase 1', 'Phase 2', 'Phase 3'],
  allowedCmmiLevels: ['L2', 'L3', 'L4', 'L5'],
  maxOutcomes: 6,
  minOutcomes: 1,
  maxSummaryLen: 240,
  maxDetailLen: 1200,
  maxTitleLen: 120,
  idPattern: /^[a-z][-a-z0-9]{1,48}$/
};

function _isNonEmptyString(value, maxLen) {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLen;
}

function validateCapability(capability) {
  if (!capability || typeof capability !== 'object') return false;

  for (const field of CAPABILITY_SCHEMA.required) {
    if (capability[field] === undefined || capability[field] === null) return false;
  }

  if (!CAPABILITY_SCHEMA.idPattern.test(capability.id)) return false;
  if (!CAPABILITY_SCHEMA.allowedDomains.includes(capability.domain)) return false;
  if (!CAPABILITY_SCHEMA.allowedMaturity.includes(capability.maturity)) return false;
  if (!CAPABILITY_SCHEMA.allowedPhases.includes(capability.phase)) return false;
  if (!CAPABILITY_SCHEMA.allowedCmmiLevels.includes(capability.cmmiLevel)) return false;

  if (!_isNonEmptyString(capability.title, CAPABILITY_SCHEMA.maxTitleLen)) return false;
  if (!_isNonEmptyString(capability.summary, CAPABILITY_SCHEMA.maxSummaryLen)) return false;
  if (!_isNonEmptyString(capability.detail, CAPABILITY_SCHEMA.maxDetailLen)) return false;

  if (!Array.isArray(capability.outcomes)) return false;
  if (capability.outcomes.length < CAPABILITY_SCHEMA.minOutcomes) return false;
  if (capability.outcomes.length > CAPABILITY_SCHEMA.maxOutcomes) return false;
  if (!capability.outcomes.every(o => typeof o === 'string' && o.length > 0 && o.length <= 160)) return false;

  if (typeof capability.product !== 'string' || !/^[a-z][-a-z0-9]{1,32}$/.test(capability.product)) return false;

  return true;
}

// HTML-escape map used by sanitization. Output is safe to drop into
// element.innerHTML without enabling XSS via crafted stub content.
const _ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
};

function _escapeHtml(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[&<>"'/]/g, ch => _ESCAPE_MAP[ch] || ch);
}

function sanitizeCapabilityData(capability) {
  if (!validateCapability(capability)) return null;
  return {
    id: capability.id,
    domain: capability.domain,
    phase: capability.phase,
    maturity: capability.maturity,
    product: capability.product,
    cmmiLevel: capability.cmmiLevel,
    title: _escapeHtml(capability.title),
    summary: _escapeHtml(capability.summary),
    detail: _escapeHtml(capability.detail),
    outcomes: capability.outcomes.map(_escapeHtml)
  };
}

const CapabilityManager = {
  getCapabilities() {
    // Defensive copy — callers cannot mutate the canonical stubs.
    return capabilityStubs.map(c => ({ ...c, outcomes: [...c.outcomes] }));
  },

  getCapability(id) {
    if (typeof id !== 'string') return undefined;
    const found = capabilityStubs.find(c => c.id === id);
    return found ? { ...found, outcomes: [...found.outcomes] } : undefined;
  },

  getByDomain(domain) {
    if (!CAPABILITY_SCHEMA.allowedDomains.includes(domain)) return [];
    return capabilityStubs.filter(c => c.domain === domain).map(c => ({ ...c, outcomes: [...c.outcomes] }));
  },

  getByProduct(productId) {
    if (typeof productId !== 'string') return [];
    return capabilityStubs.filter(c => c.product === productId).map(c => ({ ...c, outcomes: [...c.outcomes] }));
  },

  // Progressive enhancement: render into a container if one exists.
  // Accepts either a CSS selector string or an Element. No-op when the
  // target is missing, so loading this module never breaks existing pages.
  renderCapabilities(target) {
    let container = null;
    if (typeof target === 'string') {
      if (typeof document === 'undefined') return;
      container = document.querySelector(target);
    } else if (target && typeof target === 'object' && 'innerHTML' in target) {
      container = target;
    }
    if (!container) return;

    const rendered = capabilityStubs
      .map(sanitizeCapabilityData)
      .filter(Boolean);

    if (rendered.length === 0) {
      container.innerHTML = '<p class="no-capabilities">No capabilities available.</p>';
      return;
    }

    const cards = rendered.map(cap => {
      const outcomeItems = cap.outcomes.map(o => `<li>${o}</li>`).join('');
      return `
        <article class="capability-card" data-domain="${cap.domain}" data-phase="${cap.phase}" data-product="${cap.product}" data-cmmi="${cap.cmmiLevel}">
          <header class="capability-card__header">
            <span class="capability-domain-badge">${cap.domain}</span>
            <span class="capability-phase-badge">${cap.phase}</span>
            <span class="capability-cmmi-badge" aria-label="CMMI ${cap.cmmiLevel}">CMMI ${cap.cmmiLevel}</span>
          </header>
          <h3 class="capability-title">${cap.title}</h3>
          <p class="capability-summary">${cap.summary}</p>
          <details class="capability-detail">
            <summary>More detail</summary>
            <p>${cap.detail}</p>
            <h4 class="capability-outcomes-heading">Outcomes</h4>
            <ul class="capability-outcomes">${outcomeItems}</ul>
          </details>
        </article>
      `;
    }).join('');

    container.innerHTML = `<div class="capabilities-grid" role="list">${cards}</div>`;
  },

  // Auto-mount on DOM ready when a known container is present. The
  // container id is documented so future edits to index.html / a new
  // page can opt in to capability rendering without changing this module.
  autoMount() {
    if (typeof document === 'undefined') return;
    const wire = () => this.renderCapabilities('#capabilities-grid');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', wire, { once: true });
    } else {
      wire();
    }
  }
};

// Expose globally for static-page consumption.
if (typeof window !== 'undefined') {
  window.CapabilityManager = CapabilityManager;
  window.capabilityStubs = capabilityStubs;
  CapabilityManager.autoMount();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    capabilityStubs,
    CAPABILITY_SCHEMA,
    validateCapability,
    sanitizeCapabilityData,
    CapabilityManager
  };
}
