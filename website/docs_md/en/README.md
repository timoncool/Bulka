# Bulka English Documentation

This directory contains the complete English documentation for Bulka (Russian fork of Strudel), converted from MDX to Markdown format.

## Overview

Bulka is a Russian localization and fork of [Strudel](https://strudel.cc/), a web-based live coding environment that implements the Tidal Cycles algorithmic pattern language. This documentation provides comprehensive learning materials, technical guides, and reference documentation for using Bulka/Strudel.

## Documentation Structure

```
docs_md/en/
├── learn/              (31 files) - Learning tutorials and guides
├── workshop/           (6 files)  - Step-by-step workshop
├── technical-manual/   (11 files) - Technical documentation for developers
├── recipes/            (4 files)  - Common patterns and recipes
├── understand/         (3 files)  - Conceptual explanations
├── intro/              (2 files)  - Introduction, showcase, and gallery
├── functions/          (2 files)  - Function API documentation
├── reference/          (11 files) - Complete API reference
└── samples/            (5 files)  - Sample pack documentation
```

**Total: 75 Markdown files**

## Content Sections

### 1. Learn (31 files)
Comprehensive learning path covering:
- Getting started with Strudel
- Notes, sounds, and synthesis
- Mini Notation and coding patterns
- Samples and effects
- Time manipulation and signals
- Random and conditional modifiers
- Tonal and xenharmonic functions
- MIDI/OSC integration
- Visual feedback and colors
- Advanced topics

### 2. Workshop (6 files)
Structured workshop for beginners:
1. Getting started
2. First sounds
3. First notes
4. First effects
5. Pattern effects
6. Recap and next steps

### 3. Technical Manual (11 files)
Developer-focused documentation:
- Project setup and integration
- Package architecture
- Pattern internals
- REPL development
- Testing and documentation
- Sound engine details

### 4. Recipes (4 files)
Practical examples and patterns:
- Common musical patterns
- Arpeggios
- Rhythmic techniques
- Microrhythms

### 5. Understand (3 files)
Deep conceptual understanding:
- Cycles and time in Strudel
- Pitch systems
- Voicings and harmony

### 6. Intro (2 files)
- Showcase of community work
- Gallery of example tracks

### 7. Functions (2 files)
- JavaScript API introduction
- Value modifiers

### 8. Reference (11 files)
Complete API reference:
- Controls
- Pattern methods
- Effects
- Time functions
- Random functions
- Wavetable synths
- Mini Notation syntax
- Signals
- Other utilities

### 9. Samples (5 files)
Sample pack documentation:
- Dirt Samples
- Drum machines
- Wavetables
- Breaks

## Conversion Details

### Source
Original English documentation extracted from git commit `a98045a856af66d5cc9442afe6832069ab271686` (before Russian translation).

### Conversion Process
1. **MDX to Markdown**: All MDX files converted to standard Markdown
2. **JSX Components**: Interactive components (MiniRepl, JsDoc) replaced with:
   - Code blocks for simple examples
   - Placeholders with "<!-- Interactive example available in web version -->"
3. **Imports Removed**: All JavaScript/React imports stripped
4. **Frontmatter Preserved**: Title and layout metadata kept
5. **Code Examples**: All code examples preserved in fenced code blocks

### File Naming
Files are numbered for ordered reading (e.g., `01-getting-started.md`, `02-notes.md`)

## Usage

These Markdown files can be:
- Read directly in any Markdown viewer
- Processed by static site generators
- Imported into documentation systems
- Used for offline learning

## Interactive Content

Some features are only available in the web version:
- Live code editors (MiniRepl)
- Interactive sound playback
- Real-time pattern visualization

To experience the full interactive version, visit [Bulka web interface](/) or the original [Strudel REPL](https://strudel.cc/).

## Language

This is the **English** version of the documentation. For the Russian version, see `/docs_md/ru/`.

## Contributing

To update this documentation:
1. Edit the source MDX files in `/website/src/pages/`
2. Run the conversion script to regenerate Markdown files
3. Submit a pull request

## License

This documentation follows the same license as Bulka/Strudel: [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)

## Credits

- **Original Strudel**: [Alex McLean](https://slab.org) and [Felix Roos](https://froos.cc/)
- **Tidal Cycles**: Alex McLean and the Tidal community
- **Bulka Fork**: Russian localization and enhancements
- **Documentation Conversion**: 2025-12-08

---

For questions, issues, or contributions, visit the [Bulka GitHub repository](https://github.com/timoncool/Bulka).
