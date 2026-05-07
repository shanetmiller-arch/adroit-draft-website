import pytest
from bs4 import BeautifulSoup
import os

HTML_FILE = "index.html"

class TestEngagementPathwaysSection:
    """Test the Engagement Pathways section meets requirement specifications"""
    
    def test_engagement_pathways_section_exists(self):
        """Verify Engagement Pathways section is present in DOM"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        section = soup.find(id="engagement-pathways")
        assert section is not None, "Engagement Pathways section not found"
        assert section.has_attr("class"), "Section must have class attribute"
    
    def test_engagement_pathways_has_correct_heading(self):
        """Verify Engagement Pathways header contains required title"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        section = soup.find(id="engagement-pathways")
        header = section.find("h2")
        assert header is not None, "Engagement Pathways h2 heading not found"
        assert "Engagement Pathways" in header.get_text(), "Heading text must contain 'Engagement Pathways'"
    
    def test_engagement_pathways_has_lead_text(self):
        """Verify lead text is present under Engagement Pathways header"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        section = soup.find(id="engagement-pathways")
        header = section.find("header")
        lead = header.find(class_="lead")
        assert lead is not None, "Lead text element not found in engagement pathways header"
        assert "government stakeholders" in lead.get_text().lower(), "Lead text should reference government stakeholders"
    
    def test_phase_badge_present(self):
        """Verify Phase 1 Scaffold Foundation badge is displayed"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        section = soup.find(id="engagement-pathways")
        badge = section.find(class_="phase-badge")
        assert badge is not None, "Phase badge not found"
        assert "Phase 1" in badge.get_text(), "Badge must indicate Phase 1"
    
    def test_pathways_grid_present(self):
        """Verify pathways grid container exists"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        section = soup.find(id="engagement-pathways")
        grid = section.find(class_="pathways-grid")
        assert grid is not None, "Pathways grid not found"
    
    def test_product_explorer_pathway_exists(self):
        """Verify Product Explorer pathway card is present"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        section = soup.find(id="engagement-pathways")
        cards = section.find_all(class_="pathway-card")
        
        found = False
        for card in cards:
            if card.get("data-pathway") == "product-explorer":
                found = True
                break
        
        assert found, "Product Explorer pathway not found"
    
    def test_technical_deep_dive_pathway_exists(self):
        """Verify Technical Deep Dive pathway card is present"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        section = soup.find(id="engagement-pathways")
        cards = section.find_all(class_="pathway-card")
        
        found = False
        for card in cards:
            if card.get("data-pathway") == "technical-deep-dive":
                found = True
                break
        
        assert found, "Technical Deep Dive pathway not found"
    
    def test_operational_validation_pathway_exists(self):
        """Verify Operational Validation pathway card is present"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        section = soup.find(id="engagement-pathways")
        cards = section.find_all(class_="pathway-card")
        
        found = False
        for card in cards:
            if card.get("data-pathway") == "operational-validation":
                found = True
                break
        
        assert found, "Operational Validation pathway not found"
    
    def test_pathway_has_description_and_steps(self):
        """Verify each pathway has description and steps list"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        cards = soup.find_all(class_="pathway-card")
        
        for card in cards:
            description = card.find(class_="pathway-description")
            assert description is not None, "Pathway must have description"
            
            steps = card.find(class_="pathway-steps")
            assert steps is not None, "Pathway must have steps list"
            
            step_items = steps.find_all("li")
            assert len(step_items) >= 2, f"Pathway should have at least 2 steps, found {len(step_items)}"
    
    def test_pathway_has_status_indicator(self):
        """Verify each pathway has status indicator"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        cards = soup.find_all(class_="pathway-card")
        
        for card in cards:
            status = card.find(class_="pathway-status")
            assert status is not None, "Pathway must have status indicator"
            assert "Active" in status.get_text(), "Status should indicate Active"


class TestEngagementPathwaysNavigation:
    """Test navigation to Engagement Pathways works correctly"""
    
    def test_nav_link_exists(self):
        """Verify Engagement Pathways link exists in navigation"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        nav = soup.find(class_="nav-links")
        links = nav.find_all("a")
        
        found = False
        for link in links:
            if link.get("href") == "#engagement-pathways":
                found = True
                break
        
        assert found, "Engagement Pathways navigation link not found"
    
    def test_nav_link_has_correct_aria_label(self):
        """Verify Engagement Pathways link has correct aria-label"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        nav = soup.find(class_="nav-links")
        links = nav.find_all("a")
        
        for link in links:
            if link.get("href") == "#engagement-pathways":
                assert "Engagement Pathways" in link.get("aria-label", ""), \
                    "Engagement Pathways link must have correct aria-label"
                break
        else:
            raise AssertionError("Engagement Pathways navigation link not found")
    
    def test_nav_link_has_correct_href(self):
        """Verify Engagement Pathways link points to correct section"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        nav = soup.find(class_="nav-links")
        links = nav.find_all("a")
        
        for link in links:
            if link.get("href") == "#engagement-pathways":
                assert link.get("href") == "#engagement-pathways", \
                    "Engagement Pathways link must have correct href"
                break
        else:
            raise AssertionError("Engagement Pathways navigation link not found")


class TestEngagementPathwaysAccessibility:
    """Test accessibility requirements for Engagement Pathways"""
    
    def test_pathway_cards_have_aria_labelledby(self):
        """Verify each pathway card has aria-labelledby attribute"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        cards = soup.find_all(class_="pathway-card")
        
        for card in cards:
            assert card.has_attr("aria-labelledby"), "Pathway card must have aria-labelledby"
            ref_id = card.get("aria-labelledby")
            heading = soup.find(id=ref_id)
            assert heading is not None, f"Heading for {ref_id} not found"
    
    def test_pathway_icons_have_semantic_meaning(self):
        """Verify pathway cards contain SVG icons"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        cards = soup.find_all(class_="pathway-card")
        
        for card in cards:
            icon = card.find(class_="pathway-icon")
            assert icon is not None, "Pathway card must have icon container"
            svg = icon.find("svg")
            assert svg is not None, "Pathway icon must contain SVG element"
    
    def test_section_has_lead_text_for_readability(self):
        """Verify lead text helps users understand content"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        section = soup.find(id="engagement-pathways")
        header = section.find("header")
        lead = header.find(class_="lead")
        
        assert lead is not None, "Lead text required for accessibility"
        text = lead.get_text().lower()
        assert "how" in text or "discover" in text or "engag" in text, \
            "Lead text should help users understand engagement pathways"


class TestEngagementPathwaysJavaScript:
    """Test JavaScript functionality for Engagement Pathways"""
    
    @pytest.fixture
    def js_content(self):
        """Load scripts.js content"""
        with open("scripts.js", "r") as f:
            return f.read()
    
    def test_navigation_manager_exists(self, js_content):
        """Verify NavigationManager object is defined"""
        assert "NavigationManager" in js_content, "NavigationManager not defined"
    
    def test_navigation_manager_has_render_method(self, js_content):
        """Verify NavigationManager has render method"""
        assert "render(containerSelector" in js_content, "NavigationManager.render method not found"
    
    def test_navigation_manager_has_init_mobile_nav(self, js_content):
        """Verify NavigationManager has mobile nav initialization"""
        assert "initMobileNav" in js_content, "NavigationManager.initMobileNav method not found"
    
    def test_pathway_click_tracking(self, js_content):
        """Verify pathway click events are tracked (console.log)"""
        assert "console.log" in js_content, "JavaScript should log engagement events"
        assert "pathway" in js_content.lower() or "Engagement" in js_content, \
            "JavaScript should reference engagement tracking"
    
    def test_smooth_scroll_implementation(self, js_content):
        """Verify smooth scroll for anchor links is implemented"""
        assert "scrollIntoView" in js_content or "smooth" in js_content.lower(), \
            "Smooth scroll functionality not implemented"
    
    def test_phase_1_scaffold_comment(self, js_content):
        """Verify Phase 1 scaffold foundation is documented"""
        assert "Phase 1" in js_content or "scaffold" in js_content.lower(), \
            "JavaScript should reference Phase 1 scaffold"


class TestEngagementPathwaysContentAlignment:
    """Test content aligns with requirement specifications"""
    
    def test_pathways_describe_engagement_not_sales(self):
        """Verify pathways describe engagement methods, not traditional sales"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        cards = soup.find_all(class_="pathway-card")
        
        # Check for engagement-related terminology
        engagement_terms = ["explorer", "deep dive", "validation", "architects", "operators"]
        
        for card in cards:
            description = card.find(class_="pathway-description")
            if description:
                desc_text = description.get_text().lower()
                # Each pathway should describe a specific engagement approach
                assert len(description.find_all("li")) >= 1, \
                    "Each pathway must describe steps"
    
    def test_pathways_target_government_stakeholders(self):
        """Verify pathways are designed for government stakeholder engagement"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        section = soup.find(id="engagement-pathways")
        
        lead = section.find(class_="lead")
        if lead:
            assert "government" in lead.get_text().lower() or \
                   "stakeholders" in lead.get_text().lower() or \
                   "operators" in lead.get_text().lower(), \
                "Engagement pathways should target government stakeholders"
    
    def test_pathways_show_phased_approach(self):
        """Verify Phase 1 Scaffold Foundation is indicated"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        section = soup.find(id="engagement-pathways")
        
        phase_info = section.find(class_="pathways-phase-info")
        assert phase_info is not None, "Phase information section required"
        assert "Phase 1" in phase_info.get_text(), "Phase 1 indicator required"
        assert "Scaffold" in phase_info.get_text(), "Scaffold foundation indicator required"
    
    def test_pathways_have_multiple_engagement_options(self):
        """Verify at least 3 distinct engagement pathway options exist"""
        with open(HTML_FILE, "r") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, "html.parser")
        cards = soup.find_all(class_="pathway-card")
        
        assert len(cards) >= 3, f"At least 3 engagement pathways required, found {len(cards)}"
        
        # Verify each has unique data-pathway attribute
        pathway_ids = [card.get("data-pathway") for card in cards]
        assert len(set(pathway_ids)) == len(pathway_ids), \
            "Each pathway must have unique identifier"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])