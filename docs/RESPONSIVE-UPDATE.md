# Responsive Update

This update changes scale and breakpoint behavior only. The visual direction, colors, content, cards, sidebar style, and page structure remain unchanged.

## Desktop

- Sidebar width: 280px, increasing slightly on very large displays.
- Outer page gaps: 16px.
- Main content begins after the actual sidebar width instead of reserving 380px.
- Hero image and headline scale using viewport-aware limits.
- The main content width is capped to preserve comfortable line length.

## Laptops and tablets

- The fixed sidebar changes to a menu below 1280px.
- This prevents the content area from becoming too narrow on 1024px–1279px displays.
- Sections use reduced horizontal and vertical padding.

## Mobile

- Single-column hero and content sections.
- Buttons wrap naturally.
- Project cards change to a single column.
- Navigation opens as a slide-out panel.
- Custom cursor is disabled.

## Replacing media

No image paths or filenames were changed. Existing placeholders can still be replaced using the instructions in `docs/MEDIA-GUIDE.md`.
