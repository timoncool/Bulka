/**
 * Build-time script to generate documentation index from all MDX files
 * Run this before the main build to create src/data/docs-index.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAGES_DIR = path.join(__dirname, '../src/pages');
const OUTPUT_FILE = path.join(__dirname, '../src/data/docs-index.json');

// Directories to exclude from indexing
const EXCLUDE_DIRS = ['api', 'swatch', 'udels'];

/**
 * Strip MDX-specific syntax to get clean searchable text
 */
function stripMdxSyntax(content) {
  return content
    // Remove import statements
    .replace(/^import\s+.*$/gm, '')
    // Remove JSX components like <MiniRepl ... />
    .replace(/<[A-Z][a-zA-Z]*\s+[\s\S]*?\/>/g, '')
    // Remove JSX components with children <Component>...</Component>
    .replace(/<[A-Z][a-zA-Z]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]*>/g, '')
    // Remove frontmatter
    .replace(/^---[\s\S]*?---\n/m, '')
    // Clean up multiple empty lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract keywords from content
 */
function extractKeywords(content, title) {
  const words = new Set();

  // Add words from title
  title.toLowerCase().split(/\s+/).forEach(w => {
    if (w.length > 2) words.add(w);
  });

  // Extract function names (camelCase or with parentheses)
  const funcMatches = content.match(/\b[a-z][a-zA-Z]+\(/g) || [];
  funcMatches.forEach(m => words.add(m.replace('(', '').toLowerCase()));

  // Extract common terms
  const terms = content.toLowerCase().match(/\b[a-z]{3,15}\b/g) || [];
  terms.forEach(t => {
    if (t.length > 3) words.add(t);
  });

  return Array.from(words).slice(0, 20);
}

/**
 * Recursively get all MDX files
 */
function getMdxFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name)) {
        getMdxFiles(fullPath, files);
      }
    } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract title from frontmatter or first heading
 */
function extractTitle(content, filename) {
  // Try frontmatter title
  const frontmatterMatch = content.match(/^---[\s\S]*?title:\s*['"]?([^'"\n]+)['"]?[\s\S]*?---/m);
  if (frontmatterMatch) {
    return frontmatterMatch[1].trim();
  }

  // Try first heading
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  // Fall back to filename
  return filename.replace(/\.(mdx?|md)$/, '').replace(/-/g, ' ');
}

/**
 * Build the documentation index
 */
function buildIndex() {
  console.log('📚 Building documentation index...');

  const mdxFiles = getMdxFiles(PAGES_DIR);
  console.log(`Found ${mdxFiles.length} MDX/MD files`);

  const index = [];

  for (const filePath of mdxFiles) {
    try {
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      const content = stripMdxSyntax(rawContent);
      const relativePath = path.relative(PAGES_DIR, filePath);
      const filename = path.basename(filePath);
      const title = extractTitle(rawContent, filename);
      const keywords = extractKeywords(content, title);

      // Determine category from path
      const pathParts = relativePath.split(path.sep);
      const category = pathParts.length > 1 ? pathParts[0] : 'general';

      index.push({
        id: relativePath.replace(/\.(mdx?|md)$/, '').replace(/[\/\\]/g, '-'),
        title,
        content: content.slice(0, 8000), // Limit content size
        category,
        keywords,
        path: relativePath,
      });

    } catch (err) {
      console.error(`Error processing ${filePath}:`, err.message);
    }
  }

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write index
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
  console.log(`✅ Created ${OUTPUT_FILE} with ${index.length} documents`);
}

buildIndex();
