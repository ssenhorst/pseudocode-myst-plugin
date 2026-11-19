
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { visit } from 'unist-util-visit';

const require = createRequire(import.meta.url);
const pseudocode = require('pseudocode');

const PSEUDOCODE_CSS_FALLBACK = '';

function readBundledAsset(specifier, fallback = '') {
  try {
    const path = require.resolve(specifier);
    return fs.readFileSync(path, 'utf-8');
  } catch {
    return fallback;
  }
}

function renderPseudocodeToTex(node, tex_backend = 'algpseudocode') {

  const body = cleanBody(node.value ?? '');
  // Keep TeX export robust even when pseudocode.js examples use non-LaTeX macros.
  return `
\\usepackage{algorithm}
\\usepackage{${tex_backend}}
\\begin{algorithm}[H]
${node.caption ? `\\caption{${escapeHtml(node.caption)}}` : ''}\n${node.identifier ? `\\label{${escapeHtml(node.identifier)}}\n` : ''}\\begin{algorithmic}
${body}
\\end{algorithmic}
\\end{algorithm}
`;
}

function stripExternalImports(cssContent) {
  // Keep the build self-contained by removing external @import rules.
  return cssContent.replace(/@import\s+url\(https?:[^)]+\);?/gi, '');
}

const PSEUDOCODE_CSS = stripExternalImports(
  readBundledAsset('pseudocode/build/pseudocode.min.css', PSEUDOCODE_CSS_FALLBACK),
);
const PSEUDOCODE_STYLE_TAG = PSEUDOCODE_CSS
  ? `<style data-pseudocode-myst-plugin="css">${PSEUDOCODE_CSS}</style>`
  : '';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanBody(body) {
  const value = (body ?? '').trim();
  return value.length > 0 ? `${value}\n` : '';
}

function normalizeForPseudocodeJs(node) {
  const source = node.value ?? '';
  // pseudocode.js expects \begin{algorithm} without optional float args like [H].
  const normalized = source
    .replace(/\\begin\{algorithm\}\s*\[[^\]]*\]/g, '\\begin{algorithm}')
    // Labels are LaTeX-only metadata and are not part of pseudocode.js grammar.
    .replace(/\\label\{[^}]*\}/g, '');
  const body = cleanBody(normalized);
  return `\\begin{algorithm}
  ${node.caption ? `\\caption{${escapeHtml(node.caption)}}\n` : ''}
  \\begin{algorithmic}
  ${body}
  \\end{algorithmic}
  \\end{algorithm}`;
}

function mapRenderOptions(options = {}) {
  const mapped = {};
  const optionMap = {
    'indent-size': 'indentSize',
    'comment-delimiter': 'commentDelimiter',
    'line-number': 'lineNumber',
    'line-number-punc': 'lineNumberPunc',
    'no-end': 'noEnd',
    'caption-count': 'captionCount',
    'title-prefix': 'titlePrefix',
    'scope-lines': 'scopeLines',
  };

  Object.entries(optionMap).forEach(([source, target]) => {
    if (options[source] !== undefined) {
      mapped[target] = options[source];
    }
  });

  return mapped;
}

function renderPseudocodeToHtml(node, options) {
  const normalizedSource = normalizeForPseudocodeJs(node);
  try {
    return {
      html: pseudocode.renderToString(normalizedSource, options),
      source: normalizedSource,
    };
  } catch (error) {
    const message = error?.message ? String(error.message) : String(error);
    return {
      html: `<pre class="pseudocode-render-error"><strong>Pseudocode rendering error:</strong> ${escapeHtml(message)}\n\n${escapeHtml(
        normalizedSource,
      )}</pre>`, source: normalizedSource
    };
  }
}

export function createHtmlId(identifier) {
  if (!identifier) return undefined;
  return identifier
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Remove any fancy characters
    .replace(/^([0-9-])/, 'id-$1') // Ensure that the id starts with a letter
    .replace(/-[-]+/g, '-') // Replace repeated `-`s
    .replace(/(?:^[-]+)|(?:[-]+$)/g, ''); // Remove repeated `-`s at the start or the end
}

export function normalizeLabel(
  label,
) {
  if (!label) return undefined;
  const identifier = label
    .replace(/[\t\n\r ]+/g, ' ')
    .replace(/['‘’"“”]+/g, '') // These can make matching difficult, especially in glossaries and terms
    .trim()
    .toLowerCase();
  const html_id = createHtmlId(identifier);
  return { identifier, label: label, html_id };
}

export function classDirectiveOption(nodeType = 'node') {
  return {
    class: {
      type: String,
      doc: `Annotate the ${nodeType} with a set of space-delimited class names.`,
    },
  };
}

export function labelDirectiveOption(nodeType = 'node') {
  return {
    label: {
      type: String,
      alias: ['name'],
      doc: `Label the ${nodeType} to be cross-referenced or explicitly linked to.`,
    },
  };
}

export function enumerationDirectiveOptions(nodeType = 'node') {
  return {
    enumerated: {
      type: Boolean,
      alias: ['numbered'],
      doc: `Turn on/off the numbering for the specific ${nodeType}`,
    },
    enumerator: {
      type: String,
      alias: ['number'],
      doc: `Explicitly set the ${nodeType} number`,
    },
  };
}

export function commonDirectiveOptions(nodeType = 'node') {
  return {
    ...classDirectiveOption(nodeType),
    ...labelDirectiveOption(nodeType),
    ...enumerationDirectiveOptions(nodeType),
  };
}

export function addClassOptions(data, node) {
  if (typeof data.options?.class === 'string') {
    node.class = data.options.class;
  }
  return node;
}

export function addLabelOptions(data, node) {
  const { label, identifier } = normalizeLabel(data.options?.label) || {};
  if (label) node.label = label;
  if (identifier) node.identifier = identifier;
  return node;
}

export function addEnumerationOptions(data, node) {
  if (typeof data.options?.enumerated === 'boolean') {
    node.enumerated = data.options.enumerated;
  }
  if (data.options?.enumerator) {
    node.enumerator = data.options.enumerator;
  }
  return node;
}

export function addCommonDirectiveOptions(data, node) {
  addClassOptions(data, node);
  addLabelOptions(data, node);
  addEnumerationOptions(data, node);
  return node;
}


const pseudocodeDirective = {
  name: 'pseudocode',
  doc: 'Render LaTeX-style pseudocode blocks in HTML using pseudocode.js.',
  alias: ['algorithm', 'algorithmic'],
  arg: {
    type: String,
    doc: 'The caption for the pseudocode block.',
  },
  options: {
    ...commonDirectiveOptions('pseudocode'),
    'indent-size': {
      type: String,
      doc: "Indent size inside control blocks, e.g. '1.2em'.",
    },
    'comment-delimiter': {
      type: String,
      doc: 'Comment delimiter used by pseudocode.js, defaults to //.',
    },
    'line-number': {
      type: Boolean,
      doc: 'Enable line numbers in HTML rendering.',
    },
    'line-number-punc': {
      type: String,
      doc: 'Punctuation after line numbers.',
    },
    'no-end': {
      type: Boolean,
      doc: 'Hide explicit block terminators in HTML rendering.',
    },
    'caption-count': {
      type: Number,
      doc: 'Override pseudocode.js caption counter.',
    },
    'title-prefix': {
      type: String,
      doc: 'Override the HTML title prefix for algorithm captions.',
    },
    'scope-lines': {
      type: Boolean,
      doc: 'Add scope lines to the rendered pseudocode block in HTML rendering.',
    },
    'tex-backend': {
      type: String,
      doc: 'The LaTeX backend to use for rendering pseudocode. Defaults to `algpseudocode`, but can be set to `algorithm2e` or any other LaTeX package that provides an algorithmic environment. Note that the provided pseudocode source must be compatible with the chosen backend, and some features of pseudocode.js may not be supported in certain backends. A single output tex file can only have directives using a single backend type.',
    },
  },
  body: {
    type: String,
    doc: 'LaTeX-like pseudocode source.',
  },
  run(data) {
    const pseudocode = addCommonDirectiveOptions(data, {
      type: 'code',
      kind: 'pseudocode',
      caption: data.arg?.trim(),
      value: data.body,
      enumerated: true,
      pseudocodeOptions: mapRenderOptions(data.options),
      options: data.options,
    });
    return [pseudocode];
  }
};

const pseudocodeTransform = {
  name: 'pseudocode-render',
  doc: 'Transform pseudocode nodes into pre-rendered HTML blocks.',
  stage: 'document',
  plugin: (_options, { outputFormat }) => {
    const renderAsRawTex = outputFormat === 'tex';
    return (tree, file) => {
      if (!file.data.pseudocodeCounter) {
        file.data.pseudocodeCounter = 0;
      }
      let counter = file.data.pseudocodeCounter;
      let didInjectStyles = false;

      visit(tree, (node, ..._) => { return node.kind === 'pseudocode' }, (node, index, parent) => {
        if (!parent || index == null) return;
        if (renderAsRawTex) {
          const replacementNode = {
            type: 'raw',
            lang: 'tex',
            tex: renderPseudocodeToTex(node, node.options?.['tex-backend'] || 'algpseudocode'),
          };
          parent.children.splice(index, 1, replacementNode);
          return index + 1;
        }

        const options = node.pseudocodeOptions ?? {};
        options.captionCount = options.captionCount ?? counter++;

        // Keep this as a math node so the React renderer uses trusted inner HTML.
        const rendered = renderPseudocodeToHtml(node, options);
        const prefixedHtml = !didInjectStyles && PSEUDOCODE_STYLE_TAG
          ? `${PSEUDOCODE_STYLE_TAG}${rendered.html}`
          : rendered.html;
        didInjectStyles = didInjectStyles || Boolean(PSEUDOCODE_STYLE_TAG);

        const replacementNode = {
          type: 'inlineMath',
          kind: node.options?.['title-prefix'] || 'Algorithm',
          enumerated: node.enumerated,
          enumerator: options.captionCount + 1,
          label: node.label ? String(node.label) : undefined,
          identifier: node.identifier ? String(node.identifier) : undefined,
          html_id: node.identifier ? createHtmlId(node.identifier) : undefined,
          value: rendered.source,
          html: prefixedHtml,
          class: 'pseudocode-myst',
        };

        parent.children.splice(index, 1, replacementNode);
        return index + 1;
      });
    };
  },
};

const plugin = {
  name: 'Pseudocode Directive Plugin',
  directives: [pseudocodeDirective],
  transforms: [pseudocodeTransform],
};

export default plugin;
