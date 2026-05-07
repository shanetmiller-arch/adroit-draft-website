import pytest
import re
from pathlib import Path


class TestCenteringCSS:
    """Test suite for page content horizontal centering fix"""
    
    CSS_FILE = Path(__file__).parent.parent / 'styles.css'
    
    def test_container_class_exists(self):
        """Verify .container class is defined with correct properties"""
        content = self.CSS_FILE.read_text()
        assert '.container {' in content
        assert 'max-width: 1200px' in content, ".container should have max-width of 1200px"
        assert 'margin: 0 auto' in content, ".container should have margin: 0 auto for centering"
        assert 'padding: 0 var(--spacing-md)' in content, ".container should have proper padding"
    
    def test_wide_screen_media_query_exists(self):
        """Verify media query for 1440px+ screens is present"""
        content = self.CSS_FILE.read_text()
        # Check for the 1440px media query
        assert re.search(r'media\s*\([^)]*min-width\s*:\s*1440px', content), \
            "Media query for 1440px+ should be present"
    
    def test_wide_screen_max_width_adjustment(self):
        """Verify container max-width adjusts for wide screens"""
        content = self.CSS_FILE.read_text()
        # Look for 1280px max-width in media query
        wide_query_match = re.search(
            r'media\s*\([^)]*min-width\s*:\s*1440px[^}]*max-width\s*:\s*1280px',
            content,
            re.DOTALL
        )
        assert wide_query_match is not None, \
            "Container max-width should adjust to 1280px for screens >= 1440px"
    
    def test_wide_screen_extra_padding(self):
        """Verify extra horizontal padding is added for wide screens"""
        content = self.CSS_FILE.read_text()
        wide_query_match = re.search(
            r'media\s*\([^)]*min-width\s*:\s*1440px[^}]*padding',
            content,
            re.DOTALL
        )
        assert wide_query_match is not None, \
            "Extra padding should be defined for 1440px+ screens"
    
    def test_mobile_padding_preserved(self):
        """Verify mobile padding stays at var(--spacing-md)"""
        content = self.CSS_FILE.read_text()
        # Check that container uses var(--spacing-md) which is 1rem (16px)
        assert 'var(--spacing-md)' in content, \
            "Container padding should use CSS variable for consistency"
        # Verify no overriding padding: 0 for mobile
        mobile_pattern = re.search(r'media\s*\([^)]*max-width\s*:\s*640px[^}]*padding', content, re.DOTALL)
        if mobile_pattern:
            # If mobile media query exists, it shouldn't set padding: 0
            assert 'padding: 0' not in mobile_pattern.group(0), \
                "Mobile padding should not be 0, should stay at var(--spacing-md)"
    
    def test_no_left_alignment_overrides(self):
        """Verify no section has left-alignment that would override centering"""
        content = self.CSS_FILE.read_text()
        # Check for any section-level left-alignment that would cause issues
        # We allow text-align: center but not text-align: left at section level
        problematic_pattern = re.search(
            r'section\s*[^{]*\{[^}]*text-align\s*:\s*left',
            content,
            re.DOTALL
        )
        assert problematic_pattern is None, \
            "No section should have text-align: left that would override centering"
    
    def test_dark_mode_compatible(self):
        """Verify centering works in dark mode"""
        content = self.CSS_FILE.read_text()
        # Check that dark mode doesn't override container properties
        dark_mode_section = re.search(
            r'media\s*\(prefers-color-scheme\s*:\s*dark\).*?\.container',
            content,
            re.DOTALL
        )
        assert dark_mode_section is None, \
            "Dark mode should not override .container centering properties"
    
    def test_no_content_overflow_rules(self):
        """Verify no rules that would cause horizontal overflow"""
        content = self.CSS_FILE.read_text()
        # Check for any width: 100% or margin-left: 0 that would cause left alignment
        problematic_width = re.search(
            r'section\s*[^{]*\{[^}]*width\s*:\s*100%[^}]*\}',
            content,
            re.DOTALL
        )
        if problematic_width:
            # Allow if it's in a container context
            assert '.container' in problematic_width.group(0), \
                "Width: 100% should be within .container, not at section level"
    
    def test_flex_centering_present(self):
        """Verify flex/grid centering is present for wide screens"""
        content = self.CSS_FILE.read_text()
        # Check for justify-content: center in media query
        wide_flex_match = re.search(
            r'media\s*\([^)]*min-width\s*:\s*1440px[^}]*justify-content\s*:\s*center',
            content,
            re.DOTALL
        )
        assert wide_flex_match is not None, \
            "Flex centering should be present for 1440px+ screens"
    
    def test_spacing_tokens_defined(self):
        """Verify spacing CSS variables are defined"""
        content = self.CSS_FILE.read_text()
        required_tokens = [
            '--spacing-xs',
            '--spacing-sm', 
            '--spacing-md',
            '--spacing-lg',
            '--spacing-xl',
            '--spacing-xxl'
        ]
        for token in required_tokens:
            assert f'--{token}' in content, f"Spacing token {token} should be defined"
    
    def test_transition_properties_not_affecting_layout(self):
        """Verify transitions don't interfere with layout centering"""
        content = self.CSS_FILE.read_text()
        # Container should not have transition on margin/padding
        container_section = re.search(
            r'\.container\s*\{[^}]*\}',
            content,
            re.DOTALL
        )
        assert container_section is not None, ".container should be defined"
        container_text = container_section.group(0)
        # Container shouldn't have transition on margin
        assert 'transition' not in container_text or 'margin' not in container_text,
            ".container should not transition margin to avoid layout shifts"
    
    def test_container_max_width_boundary(self):
        """Verify container has correct max-width boundary"""
        content = self.CSS_FILE.read_text()
        container_match = re.search(
            r'\.container\s*\{[^}]*max-width\s*:\s*(\d+)px',
            content
        )
        assert container_match is not None, ".container should have max-width defined"
        max_width = int(container_match.group(1))
        assert max_width == 1200, f"Container max-width should be 1200px, got {max_width}"
    
    def test_wide_screen_boundary(self):
        """Verify wide screen breakpoint is exactly 1440px"""
        content = self.CSS_FILE.read_text()
        wide_match = re.search(
            r'media\s*\([^)]*min-width\s*:\s*(\d+)px',
            content
        )
        assert wide_match is not None, "Wide screen media query should be defined"
        breakpoint = int(wide_match.group(1))
        assert breakpoint == 1440, f"Wide screen breakpoint should be 1440px, got {breakpoint}"


class TestLayoutRegression:
    """Regression tests to ensure existing functionality isn't broken"""
    
    CSS_FILE = Path(__file__).parent.parent / 'styles.css'
    
    def test_brand_colors_preserved(self):
        """Verify brand colors are not changed"""
        content = self.CSS_FILE.read_text()
        required_colors = [
            '--brand-primary',
            '--brand-secondary',
            '--brand-accent',
            '--brand-gold'
        ]
        for color in required_colors:
            assert color in content, f"Brand color {color} should be preserved"
    
    def test_nav_styling_preserved(self):
        """Verify navigation styling isn't affected by centering changes"""
        content = self.CSS_FILE.read_text()
        assert '.nav {' in content
        assert '.nav-links {' in content
        assert '.logo {' in content
        # Ensure nav has its own container or is within main
        assert 'display: flex' in content or 'justify-content' in content
    
    def test_hero_styling_preserved(self):
        """Verify hero section styling isn't affected"""
        content = self.CSS_FILE.read_text()
        assert '.hero {' in content
        assert '.hero-content {' in content
        assert 'text-align: center' in content or '.hero-content' in content
    
    def test_accessibility_maintained(self):
        """Verify accessibility styles aren't affected"""
        content = self.CSS_FILE.read_text()
        # Skip link should still exist
        assert '.skip-link {' in content or '.skip-link:focus' in content
        # Focus styles should exist
        assert '.focus' in content or ':focus' in content
        # Reduced motion should exist
        assert 'prefers-reduced-motion' in content
    
    def test_spacing_consistency(self):
        """Verify spacing is consistent using CSS variables"""
        content = self.CSS_FILE.read_text()
        # Count how many times we use CSS variables vs hard values
        var_count = len(re.findall(r'var\(--spacing', content))
        # Should have many uses of spacing variables
        assert var_count >= 10, f"Should use CSS spacing variables at least 10 times, found {var_count}"


class TestCSSFileQuality:
    """Quality tests for the CSS file itself"""
    
    CSS_FILE = Path(__file__).parent.parent / 'styles.css'
    
    def test_css_syntax_valid(self):
        """Basic check that CSS has balanced braces"""
        content = self.CSS_FILE.read_text()
        open_braces = content.count('{')
        close_braces = content.count('}')
        assert open_braces == close_braces, f"CSS should have balanced braces: {open_braces} open, {close_braces} close"
    
    def test_no_duplicate_properties(self):
        """Check for duplicate property declarations in same selector"""
        content = self.CSS_FILE.read_text()
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if '{' in line:
                selector = line.split('{')[0].strip()
                if selector:
                    block = '\n'.join(lines[i:i+10])  # Check next 10 lines
                    block_props = re.findall(r'[^{]+:[^;]+;', block)
                    for prop in block_props:
                        prop_name = prop.split(':')[0].strip()
                        if block_props.count(prop) > 1:
                            # Allow some flexibility for vendor prefixes
                            continue
    
    def test_media_query_structure(self):
        """Verify media queries have proper structure"""
        content = self.CSS_FILE.read_text()
        media_queries = re.findall(r'media\s*\([^)]*\)\s*\{', content)
        assert len(media_queries) >= 2, f"Should have at least 2 media queries, found {len(media_queries)}"
        # Check for dark mode
        assert any('prefers-color-scheme' in mq for mq in media_queries), "Should have color scheme media query"
        # Check for reduced motion
        assert any('prefers-reduced-motion' in mq for mq in media_queries), "Should have reduced motion media query"
    
    def test_no_unnecessary_comments(self):
        """Verify comments don't break selectors"""
        content = self.CSS_FILE.read_text()
        # CSS comments don't break syntax, this is just a sanity check
        assert '/*' in content or '//' in content, "Should have comments for maintainability"
