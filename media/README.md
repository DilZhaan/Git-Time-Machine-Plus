# Git Time Machine - Brand Assets

This folder contains all branding assets for the Git Time Machine VS Code extension.

## 📁 Files

### Icons

| File | Size | Format | Usage |
|------|------|--------|-------|
| `icon.png` | 128x128 | PNG | **Main extension icon** (dark theme) - Used in VS Code marketplace |
| `icon-light.png` | 128x128 | PNG | Extension icon (light theme variant) |
| `icon.svg` | Vector | SVG | Source file for main icon |
| `icon-light.svg` | Vector | SVG | Source file for light theme icon |

### Square Icons

| File | Size | Format | Usage |
|------|------|--------|-------|
| `square-icon.png` | 512x512 | PNG | Square marketplace icon, social media |
| `square-icon.svg` | Vector | SVG | Source file for square icon |

### Banners

| File | Size | Format | Usage |
|------|------|--------|-------|
| `banner.png` | 1280x640 | PNG | **Promotional banner** (dark theme) - Marketplace header |
| `banner-light.png` | 1280x640 | PNG | Promotional banner (light theme) |
| `banner.svg` | Vector | SVG | Source file for dark banner |
| `banner-light.svg` | Vector | SVG | Source file for light banner |

## 🎨 Design System

### Colors

**Dark Theme (Default)**
- Primary Blue: `#007ACC`
- Success Green: `#4EC9B0`
- Warning Orange: `#F9A825`
- Background Dark: `#1E1E1E`
- Text Light: `#CCCCCC`

**Light Theme**
- Primary Blue: `#007ACC`
- Success Green: `#16A085`
- Warning Orange: `#F39C12`
- Background Light: `#FFFFFF`
- Text Dark: `#333333`

### Design Concept

The logo combines two key visual elements:

1. **Clock/Time** - Represented by a circular clock face with hands
   - Symbolizes "Time Machine" and timestamp editing
   - Clean, minimal clock design with 4 main ticks
   - Hour and minute hands at strategic angles

2. **Git Branch** - Represented by connected nodes
   - Symbolizes version control and commit history
   - Shows branching/forking pattern
   - Connected circles with lines

3. **Time Travel Effect** - Subtle arrow decorations
   - Curved arrows suggesting movement through time
   - Low opacity for subtlety

### Typography

**Banner Font**
- Font Family: Arial, sans-serif (fallback to system sans-serif)
- Title: 96px, Bold
- Subtitle: 36px, Regular
- Features: 28px, Regular

## 🔄 Regenerating Assets

If you need to regenerate PNG files from SVG sources:

```bash
cd media

# Icon (128x128)
convert icon.svg -resize 128x128 icon.png
convert icon-light.svg -resize 128x128 icon-light.png

# Square icon (512x512)
convert square-icon.svg -resize 512x512 square-icon.png

# Banners (1280x640)
convert banner.svg -resize 1280x640 banner.png
convert banner-light.svg -resize 1280x640 banner-light.png
```

**Requirements**: ImageMagick (`convert` command)

Install on different systems:
```bash
# Ubuntu/Debian
sudo apt install imagemagick

# Fedora
sudo dnf install ImageMagick

# macOS
brew install imagemagick
```

## 📝 Usage Guidelines

### VS Code Marketplace

1. **Extension Icon**: Use `icon.png` (128x128)
   - Must be square
   - PNG format
   - Referenced in `package.json`

2. **Banner**: Use `banner.png` (1280x640)
   - Aspect ratio: 2:1
   - Displayed at top of marketplace page
   - Should work well when cropped

### Social Media

- **Twitter/X**: Use `square-icon.png` (512x512)
- **LinkedIn**: Use `banner.png` or `square-icon.png`
- **GitHub**: Use `square-icon.png` or `banner.png`
- **Discord**: Use `square-icon.png`

### Documentation

- **README.md**: Can embed `banner.png` or `square-icon.png`
- **Wiki**: Use any asset as needed
- **Blog Posts**: Use `banner.png` for headers

## ✨ Features Highlighted

The banner showcases:
- ✓ Detect unpushed commits automatically
- ✓ Edit messages and timestamps with ease
- ✓ Beautiful webview UI with animations

## 🎯 Brand Identity

**Tagline**: "Edit commit messages and timestamps safely"

**Key Messages**:
- Safety-first (only unpushed commits)
- User-friendly (beautiful UI)
- Powerful (bulk edit support)
- Professional (VS Code integration)

## 📄 License

These brand assets are part of the Git Time Machine project and follow the same license (MIT).

---

**Created**: November 2025  
**Version**: 1.0.0  
**Author**: DilZhan YaPa

