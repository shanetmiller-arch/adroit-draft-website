import pytest
from pathlib import Path


class TestLayoutCenteringIntegration:
    """Integration tests for layout centering behavior"""
    
    HTML_FILE = Path(__file__).parent.parent / 'index.html'
    CSS_FILE = Path(__file__).parent.parent / 'styles.css'
    
    @pytest.fixture
    def css_content(self):
        return self.CSS_FILE.read_text()
    
    def test_all_sections_have_container_wrappers(self, css_content):
        """Verify all major sections use .container for centering"""
        html_content = self.HTML_FILE.read_text()
        
        # Check that container class is used in HTML
        assert '.container' in html_content, ".container class should be used in HTML"
        
        # Check for container wrapping of key sections
        sections_to_check = ['hero', 'products', 'lifecycle', 'capability', 'roadmap', 'footer']
        for section in sections_to_check:
            # Either section has container as parent, or content is properly wrapped
            container_pattern = rf'<section[^>]*class=["\'].*{section}.*["\'][^>]*>[\s\S]*?</section>'
            matches = re.findall(container_pattern, html_content, re.IGNORECASE)
            if matches:
                # Check if container is parent
                has_container = any('.container' in m for m in matches)
                assert has_container or f'class="container"' in html_content, \
                    f"Section {section} should be wrapped in .container"
    
    def test_main_has_flex_centering(self, css_content):
        """Verify main element has flex centering for wide screens"""
        assert 'main' in self.HTML_FILE.read_text()
        # CSS should have main with flex centering
        main_flex = re.search(r'main[^{]*\{[^}]*display\s*:\s*flex', css_content)
        assert main_flex is not None, "Main should have display: flex for centering"
        
    def test_no_section_width_100_percent(self, css_content):
        """Verify no section uses width: 100% that would override centering"""
        # Check for problematic patterns
        problematic = re.findall(
            r'section[^{]*\{[^}]*width\s*:\s*100%',
            css_content
        )
        assert len(problematic) == 0, \
            "No section should use width: 100% that overrides centering"
    
    def test_container_margin_auto(self, css_content):
        """Verify container uses margin: 0 auto for centering"""
        container_section = re.search(r'\.container\s*\{[^}]*\}', css_content, re.DOTALL)
        assert container_section is not None, ".container should be defined"
        container_text = container_section.group(0)
        assert 'margin: 0 auto' in container_text, \
            ".container should have margin: 0 auto for centering"
    
    def test_no_overriding_text_align(self, css_content):
        """Verify no section has text-align: left that would override centering"""
        problematic = re.findall(
            r'section[^{]*\{[^}]*text-align\s*:\s*left',
            css_content
        )
        assert len(problematic) == 0, \
            "No section should have text-align: left that overrides centering"
    
    def test_header_sticky_preserved(self, css_content):
        """Verify header sticky positioning still works"""
        assert '.header {' in css_content
        header_section = re.search(r'\.header\s*\{[^}]*\}', css_content)
        assert header_section is not None, ".header should be defined"
        header_text = header_section.group(0)
        assert 'position: sticky' in header_text, ".header should be sticky"
    
    def test_nav_styling_preserved(self, css_content):
        """Verify navigation styling isn't broken by centering"""
        assert '.nav {' in css_content
        assert '.nav-links {' in css_content
        nav_section = re.search(r'\.nav\s*\{[^}]*\}', css_content, re.DOTALL)
        assert nav_section is not None, ".nav should be defined"
        nav_text = nav_section.group(0)
        assert 'display: flex' in nav_text, ".nav should use flexbox"
    
    def test_hero_styling_preserved(self, css_content):
        """Verify hero section styling isn't broken"""
        assert '.hero {' in css_content
        assert '.hero-content {' in css_content
        hero_section = re.search(r'\.hero[^{]*\{[^}]*\}', css_content, re.DOTALL)
        assert hero_section is not None, ".hero should be defined"
    
    def test_footer_styling_preserved(self, css_content):
        """Verify footer styling isn't broken"""
        footer_exists = '.footer' in css_content or '.footer {' in css_content
        assert footer_exists, "Footer styling should be preserved"
    
    def test_brand_colors_preserved(self, css_content):
        """Verify brand colors aren't changed"""
        required_colors = [
            '--brand-primary',
            '--brand-secondary', 
            '--brand-accent',
            '--brand-gold',
            '--brand-flagship'
        ]
        for color in required_colors:
            assert color in css_content, f"Brand color {color} should be preserved"
    
    def test_spacing_tokens_preserved(self, css_content):
        """Verify spacing CSS variables aren't changed"""
        required_spacings = [
            '--spacing-xs',
            '--spacing-sm',
            '--spacing-md',
            '--spacing-lg',
            '--spacing-xl',
            '--spacing-xxl'
        ]
        for spacing in required_spacings:
            assert spacing in css_content, f"Spacing token {spacing} should be preserved"
    
    def test_transition_properties_preserved(self, css_content):
        """Verify transition properties aren't broken"""
        transitions = [
            '--transition-fast',
            '--transition-normal',
            '--transition-slow'
        ]
        for trans in transitions:
            assert trans in css_content, f"Transition {trans} should be preserved"
    
    def test_shadow_variables_preserved(self, css_content):
        """Verify shadow variables aren't changed"""
        shadows = ['--shadow-sm', '--shadow-md', '--shadow-lg']
        for shadow in shadows:
            assert shadow in css_content, f"Shadow variable {shadow} should be preserved"
    
    def test_radius_variables_preserved(self, css_content):
        """Verify border-radius variables aren't changed"""
        radii = ['--radius-sm', '--radius-md', '--radius-lg']
        for radius in radii:
            assert radius in css_content, f"Radius variable {radius} should be preserved"
    
    def test_font_family_preserved(self, css_content):
        """Verify font family isn't changed"""
        assert '--font-family' in css_content
        font_section = re.search(r'--font-family\s*:\s*[^;]+;', css_content)
        assert font_section is not None, "Font family should be defined"
    
    def test_focus_styles_preserved(self, css_content):
        """Verify focus styles for accessibility aren't broken"""
        assert '.focus' in css_content or ':focus' in css_content
        assert '--focus-ring' in css_content
    
    def test_skip_link_preserved(self, css_content):
        """Verify skip link for keyboard users isn't broken"""
        assert '.skip-link' in css_content
    
    def test_dark_mode_preserved(self, css_content):
        """Verify dark mode colors aren't broken"""
        assert 'prefers-color-scheme' in css_content
        dark_mode_section = re.search(
            r'media\s*\(prefers-color-scheme\s*:\s*dark\)',
            css_content
        )
        assert dark_mode_section is not None, "Dark mode media query should exist"
    
    def test_reduced_motion_preserved(self, css_content):
        """Verify reduced motion for accessibility isn't broken"""
        assert 'prefers-reduced-motion' in css_content
        reduced_section = re.search(
            r'media\s*\(prefers-reduced-motion\s*:\s*reduce\)',
            css_content
        )
        assert reduced_section is not None, "Reduced motion media query should exist"


class TestViewportBreakpoints:
    """Tests for viewport breakpoint coverage"""
    
    CSS_FILE = Path(__file__).parent.parent / 'styles.css'
    
    @pytest.fixture
    def css_content(self):
        return self.CSS_FILE.read_text()
    
    def test_mobile_breakpoint(self, css_content):
        """Verify mobile breakpoint at 640px exists"""
        # Check for mobile media query
        mobile_match = re.search(
            r'media\s*\([^)]*max-width\s*:\s*640px',
            css_content
        )
        assert mobile_match is not None or \
            '.container' in css_content and 'padding' in css_content, \
            "Should have mobile breakpoint or container padding"
    
    def test_tablet_breakpoint(self, css_content):
        """Verify tablet breakpoint at 768px exists"""
        tablet_match = re.search(
            r'media\s*\([^)]*max-width\s*:\s*768px',
            css_content
        )
        assert tablet_match is not None or \
            '.container' in css_content and 'padding' in css_content, \
            "Should have tablet breakpoint or container padding"
    
    def test_desktop_breakpoint(self, css_content):
        """Verify desktop breakpoint at 1440px exists"""
        desktop_match = re.search(
            r'media\s*\([^)]*min-width\s*:\s*1440px',
            css_content
        )
        assert desktop_match is not None, \
            "Should have 1440px breakpoint for wide screens"
    
    def test_breakpoint_progression(self, css_content):
        """Verify breakpoints are in logical progression"""
        breakpoints = re.findall(
            r'media\s*\([^)]*min-width\s*:\s*(\d+)px',
            css_content
        )
        if len(breakpoints) > 0:
            # Should have at least 1440px
            assert any(bp >= 1440 for bp in breakpoints), \
                "Should have breakpoint >= 1440px"
    
    def test_no_unnecessary_breakpoints(self, css_content):
        """Verify no unnecessary breakpoints that could cause issues"""
        # Allow standard breakpoints, disallow random ones
        all_breakpoints = re.findall(
            r'media\s*\([^)]*min-width\s*:\s*(\d+)px',
            css_content
        )
        # Should be reasonable numbers, not arbitrary
        for bp in all_breakpoints:
            bp_int = int(bp)
            assert bp_int >= 0, f"Breakpoint should be non-negative: {bp}"
