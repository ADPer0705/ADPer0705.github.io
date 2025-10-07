# ADPer0705.github.io
=======
# ADPer Protocol // Digital Interface v3.1 [HUD]

[![Status](https://img.shields.io/badge/status-online-success?style=for-the-badge)](https://adper0705.github.io/profile)
[![Version](https://img.shields.io/badge/version-3.1_HUD-blue?style=for-the-badge)](https://github.com/ADPer0705/profile)
[![License](https://img.shields.io/badge/license-MIT-lightgrey?style=for-the-badge)](LICENSE)

> "A dynamic, data-driven digital presence built to be a statement, not just a portfolio."

---

## `whoami` // About the Operator

This interface is a digital extension of **Anay Dhaval Pandya** (callsign: **ADPer**).

Inspired by the engineering ethos of Tony Stark, I approach technology not just as a tool, but as a medium for creation and problem-solving. I'm currently a senior in a 5-year integrated CSE program at the **National Forensic Sciences University (NFSU)**, specializing in Cybersecurity.

My core directives are driven by an insatiable curiosity for the digital frontier:

* **Cybersecurity & Systems:** With hands-on experience in TryHackMe, CTFs, and building offensive security tools, I thrive on understanding and manipulating system architecture. My fluency in the Linux ecosystem (Debian daily driver, with experience in Arch, Kali, etc.) is the foundation of my work.
* **AI/ML Exploration:** I'm actively exploring the potential of artificial intelligence, having built several Retrieval-Augmented Generation (RAG) applications and other learning models.
* **Efficient Engineering:** I operate with a philosophy of maximum impact with minimal overhead. Adept at rapid comprehension and efficient problem-solving, I build robust solutions without getting lost in the weeds.

This project is a living reflection of that philosophy—clean, efficient, and built from the ground up to be both visually striking and technically sound.

## `sysconfig` // About the Project

This isn't a static website. It's a vanilla JavaScript engine that parses a series of local JSON files and renders a futuristic Heads-Up Display (HUD) interface. The entire system is designed to be **data-decoupled**, meaning the content and the presentation layer are completely separate.

### Core Philosophy

The content of this site lives in the `/data` directory. To update a project, add a skill, or change my bio, I simply edit a `.json` file. The JavaScript engine handles the rest, re-rendering the interface on the next page load. This creates a single source of truth and makes maintenance effortless.

### Tech Stack 🧠

* **Frontend:** HTML5, CSS3 (Flexbox, Grid, Custom Properties), Vanilla JavaScript (ES6+)
* **Animations:** `IntersectionObserver` API for scroll-triggered events, text scrambling effects, CSS transitions
* **Visuals:** `particles.js` for interactive ambient background with hover/click effects
* **SEO:** Comprehensive meta tags, Open Graph, Twitter Cards, sitemap, robots.txt
* **Performance:** Resource preloading, font optimization, hardware acceleration, responsive design
* **Development:** Local server required for CORS (e.g., Python's `http.server`)

### Features ✨

* 🎨 **Futuristic HUD Interface** - Corner brackets, glowing accents, and cyberpunk aesthetic
* ⚡ **Interactive Particle Background** - Hover to grab, click to add particles
* 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
* 🔍 **SEO Optimized** - Rich meta tags for search engines and social media sharing
* 🎯 **Data-Driven Architecture** - Update content by editing JSON files only
* ✨ **Smooth Animations** - Text scrambling, fade-ins, 3D flip cards, scroll-triggered effects
* 🚀 **Performance Focused** - Preloading, lazy loading, hardware acceleration
* ♿ **Accessible** - Reduced motion support for users with preferences

### File Structure

```
.
├── data/               # Content stored as JSON
│   ├── personal.json   # Bio, name, theme
│   ├── skills.json     # Skills by category
│   ├── projects.json   # Project cards with links
│   ├── blogs.json      # Blog entries
│   ├── hobbies.json    # Personal interests
│   └── social.json     # Social media links
├── assets/
│   ├── favicon.svg     # Custom HUD-themed favicon
│   └── README.md       # Asset creation guide
├── index.html          # Main HTML structure
├── style.css           # Styling and animations
├── script.js           # Data loading and rendering engine
├── sitemap.xml         # SEO sitemap
├── robots.txt          # Search engine directives
└── README.md           # This file
```

## `init` // Running Locally

To run this interface on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ADPer0705/profile.git
    cd profile
    ```

2.  **Start a local HTTP server:**
    ```bash
    # Using Python 3
    python3 -m http.server 8000
    
    # Or using Node.js
    npx http-server -p 8000
    ```

3.  **Open the interface:**
    Navigate to `http://localhost:8000` in your browser.

## `config` // Customization

Modify the content of any file in the `/data` directory to update the interface. The changes will be reflected on the next page refresh. No code changes are necessary for content updates.

**Example - Adding a new project:**
```json
{
  "title": "New Project",
  "description": "Project description here",
  "link": "https://github.com/ADPer0705/project",
  "tags": ["Python", "AI"],
  "status": "In Progress"
}
```

## `optimize` // Production Deployment

For production deployment (GitHub Pages, Netlify, etc.):

1. Update the canonical URL in `index.html` to match your domain
2. Create an Open Graph image (`assets/og-image.png`, 1200x630px) - see `assets/README.md` for guidelines
3. Update `sitemap.xml` with your actual domain
4. Optional: Convert `favicon.svg` to `favicon.ico` for legacy browser support

---

**Built with ❤️ by ADPer** • Find me on [GitHub](https://github.com/ADPer0705) · [LinkedIn](https://linkedin.com/in/adper)
