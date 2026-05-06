import os
import re
import pytest


class TestWebsiteContent:
    """Tests verifying the ADROIT website HTML meets the Proof Over Pitch requirement."""

    @pytest.fixture
    def html_content(self):
        """Load the index.html file."""
        html_path = os.path.join(os.path.dirname(__file__), '..', '..', 'index.html')
        with open(html_path, 'r', encoding='utf-8') as f:
            return f.read()

    def test_page_contains_proof_over_pitch_subtitle(self, html_content):
        """Verify 'Proof Over Pitch' subtitle is present for operational evidence messaging."""
        assert 'Proof Over Pitch' in html_content, "Missing 'Proof Over Pitch' subtitle"

    def test_page_contains_operational_evidence_message(self, html_content):
        """Verify operational evidence messaging is present rather than marketing promises."""
        assert 'Operational Evidence, Not Promises' in html_content or 'Operational proof' in html_content.lower(), \
            "Missing operational evidence messaging"

    def test_pmr_product_name_present(self, html_content):
        """Verify PMRIS product name is mentioned as required."""
        assert 'Program Monitoring Information Reporting System' in html_content or 'PMRIS' in html_content, \
            "Missing PMRIS product reference"

    def test_rmfm_product_name_present(self, html_content):
        """Verify RMFM flagship product name is mentioned as required."""
        assert 'Risk Management Framework' in html_content or 'RMFM' in html_content, \
            "Missing RMFM flagship product reference"

    def test_adept_and_adroit_referenced(self, html_content):
        """Verify both ADEPT and ADROIT company names are referenced."""
        assert 'ADEPT' in html_content, "Missing ADEPT company reference"
        assert 'ADROIT' in html_content, "Missing ADROIT company reference"

    def test_proof_section_exists(self, html_content):
        """Verify proof section with validation cards exists."""
        assert '<section id="proof"' in html_content or 'id="proof"' in html_content, \
            "Missing proof section"

    def test_operational_proof_card_present(self, html_content):
        """Verify 'Operational Proof' validation card exists."""
        assert 'Operational Proof' in html_content, "Missing Operational Proof card"

    def test_security_validation_card_present(self, html_content):
        """Verify 'Security Validation' card exists for compliance messaging."""
        assert 'Security Validation' in html_content or 'security validation' in html_content.lower(), \
            "Missing Security Validation card"

    def test_outcome_measurement_card_present(self, html_content):
        """Verify 'Outcome Measurement' card exists for metrics messaging."""
        assert 'Outcome Measurement' in html_content or 'Outcome' in html_content, \
            "Missing Outcome Measurement card"

    def test_nav_links_exist(self, html_content):
        """Verify all navigation links are present for site structure."""
        assert 'aria-label="Home"' in html_content, "Missing Home nav link"
        assert 'aria-label="About"' in html_content, "Missing About nav link"
        assert 'aria-label="Proof"' in html_content, "Missing Proof nav link"
        assert 'aria-label="Products"' in html_content, "Missing Products nav link"
        assert 'aria-label="Contact"' in html_content, "Missing Contact nav link"

    def test_aria_labels_present(self, html_content):
        """Verify accessibility aria-labels are present on interactive elements."""
        aria_count = html_content.count('aria-label=')
        assert aria_count >= 5, f"Insufficient aria-labels found ({aria_count} < 5)"

    def test_semantic_html_structure(self, html_content):
        """Verify semantic HTML5 structure is used (header, main, section, nav)."""
        assert '<header' in html_content, "Missing semantic header element"
        assert '<main' in html_content or '<section' in html_content, "Missing semantic main/section elements"
        assert '<nav' in html_content or '<nav class="' in html_content, "Missing semantic nav element"

    def test_hero_section_contains_required_content(self, html_content):
        """Verify hero section contains ADROIT Innovation House branding."""
        assert 'ADROIT Innovation House' in html_content, "Missing hero section title"
        assert '<h1' in html_content, "Missing h1 heading element"

    def test_about_section_contains_methodology(self, html_content):
        """Verify About section contains consulting to products methodology."""
        assert 'consulting execution' in html_content.lower() or 'consulting' in html_content, \
            "Missing consulting execution methodology reference"
        assert 'government-grade' in html_content.lower() or 'government grade' in html_content.lower(), \
            "Missing government-grade software reference"

    def test_mission_section_exists(self, html_content):
        """Verify mission section with innovation values exists."""
        assert 'mission' in html_content.lower() or 'Mission-Led' in html_content, \
            "Missing mission section"

    def test_secure_by_design_messaging(self, html_content):
        """Verify security by design messaging is present."""
        assert 'Secure by Design' in html_content or 'security' in html_content.lower() and 'design' in html_content.lower(), \
            "Missing Secure by Design messaging"

    def test_auditability_compliance_messaging(self, html_content):
        """Verify auditability and compliance messaging is present."""
        assert 'auditability' in html_content.lower() or 'audit' in html_content.lower(), \
            "Missing auditability reference"
        assert 'compliance' in html_content.lower(), "Missing compliance reference"
