# AnimeBite Streaming Platform - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern anime streaming platforms (Crunchyroll, 9anime) combined with the provided UI reference image. Dark theme with vibrant anime artwork as the visual centerpiece.

## Core Design Elements

### Typography
- **Primary Font**: Inter or Poppins (Google Fonts)
- **Headings**: Bold 600-700 weight, sizes: 2xl-4xl for hero, xl-2xl for sections, lg for cards
- **Body Text**: Regular 400 weight, base size for descriptions, sm for metadata
- **Episode Numbers/Counts**: Semibold 500-600, used prominently on cards

### Layout System
**Spacing Units**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Container padding: px-4 md:px-8 lg:px-12
- Section spacing: py-12 md:py-16 lg:py-20
- Card gaps: gap-4 md:gap-6
- Internal card padding: p-4 md:p-6

### Color Strategy (From Reference)
- **Backgrounds**: Deep dark (#0a0a0f to #1a1a2e range), slightly lighter cards (#1e1e2e)
- **Accents**: Purple/magenta (#9333ea to #db2777), used for CTAs and highlights
- **Text**: White/off-white primary, gray-400 secondary
- **Overlays**: Dark gradients on images (from transparent to black 80%)

## Component Library

### Navigation Bar
- Sticky top navigation with backdrop blur
- Logo left, genre categories center, search + user menu right
- Transparent with subtle border-bottom, becomes solid on scroll
- Search expands on focus with autocomplete suggestions

### Hero/Banner Carousel
- Full-width auto-rotating carousel (5-6 featured anime)
- Large anime artwork backgrounds with dark gradient overlay
- Left-aligned content: title, genres tags, synopsis (2-3 lines), rating, CTA buttons
- "Watch Now" + "More Info" buttons with blur background
- Carousel indicators bottom-center, navigation arrows on sides
- Height: 60vh on desktop, 50vh on tablet, auto on mobile

### Anime Cards (Primary Component)
- **Aspect ratio**: 2:3 portrait for poster-style cards
- Image with gradient overlay bottom (anime title, episode count)
- Hover: Lift effect (scale-105), brightness increase, show additional info
- Episode badge top-right corner with accent background
- Quality/language tags (SUB/DUB) as small badges
- Rounded corners (rounded-lg)

### Horizontal Carousels/Sliders
- Used for: Continue Watching, Trending, Latest Episodes, Top Airing
- Smooth scroll-snap behavior, hide scrollbar, show on hover
- Navigation arrows appear on hover (absolute positioned)
- 4-6 items visible on desktop, 3 on tablet, 1-2 on mobile
- Gap between items: gap-4 md:gap-6

### Video Player
- Custom controls overlay with gradient background
- Episode server selector (tabs for different servers)
- Quality selector + Language toggle (SUB/DUB/RAW)
- Large play button center when paused
- Progress bar with preview thumbnails on hover
- Episode list sidebar (collapsible on mobile)
- Fullscreen, theater mode, settings options

### Detail Page Layout
- Hero section: Backdrop image with blur + gradient overlay
- Poster image left (sticky on scroll)
- Info panel: Title, rating, genres, status, synopsis
- Tabbed content: Episodes list, Reviews, Recommendations
- Episode cards in grid: 3-4 columns desktop, 2 tablet, 1 mobile

### Search & Filters
- Advanced filter panel with collapsible sections
- Genre multi-select chips (removable tags)
- Type, Season, Status, Rating dropdowns
- Date range pickers for start/end dates
- Real-time search suggestions dropdown
- Results grid: same card pattern as home sections

### Sidebar Components (Desktop)
- Trending Now: Numbered list (1-10) with small thumbnails
- Schedule: Day selector tabs, timed episode listings
- Top 10: Tabbed (Today/Week/Month), numbered rankings with compact cards

## Images
**Usage**: Heavy image usage throughout - anime artwork is the primary visual element

**Hero Banner**: 
- 5-6 high-quality anime backdrop/landscape images for carousel
- Dimensions: 1920x800px minimum
- Dark gradient overlay mandatory for text readability

**Anime Cards**:
- Poster images (2:3 ratio) for all anime entries
- Dimensions: 300x450px minimum
- Consistent aspect ratio across all cards

**Detail Pages**:
- Large backdrop image (1920x1080px) for hero section
- Poster image (400x600px) for sidebar

**Thumbnails**:
- Episode thumbnails for video player
- Small poster thumbnails for sidebar lists (150x225px)

## Animations
- Carousel auto-play with crossfade transitions (4-5 second intervals)
- Card hover: smooth scale and brightness transitions (200ms ease)
- Skeleton loading states for cards during API fetches
- Smooth scroll-snap for horizontal carousels
- Page transitions: subtle fade-in (avoid heavy animations)

## Responsive Breakpoints
- **Mobile**: Single column, stacked layout, bottom navigation
- **Tablet (md)**: 2-3 column grids, hybrid navigation
- **Desktop (lg+)**: Multi-column grids, sidebar layouts, full navigation

## Accessibility
- Proper focus states on all interactive elements
- Keyboard navigation for carousels and video player
- Alt text for all anime images
- ARIA labels for icon-only buttons
- Color contrast meeting WCAG AA standards (important with dark theme)