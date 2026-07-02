# MyST JS Plugin

A MyST JS Plugin to use [Pseudocode.js](https://github.com/SaswatPadhi/pseudocode.js) as a MyST Markdown directive.

## Usage

Add the URL of the plugin release to your `myst.yml`:

```yaml
project:
  plugins:
    - https://github.com/ssenhorst/pseudocode-myst-plugin/releases/latest/download/plugin.mjs
```

Then use the directive as

```markdown
:::{pseudocode} Quicksort
    \Procedure{Quicksort}{$A, p, r$}
        \If{$p < r$} 
            \State $q = $ \Call{Partition}{$A, p, r$}
            \State \Call{Quicksort}{$A, p, q - 1$}
            \State \Call{Quicksort}{$A, q + 1, r$}
        \EndIf
    \EndProcedure
    \Procedure{Partition}{$A, p, r$}
        \State $x = A[r]$
        \State $i = p - 1$
        \For{$j = p \dots r - 1$}
            \If{$A[j] < x$}
                \State $i = i + 1$
                \State exchange
                $A[i]$ with $A[j]$
            \EndIf
            \State exchange $A[i]$ with $A[r]$
        \EndFor
    \EndProcedure
:::
```

## Manual build

The `esbuild` tool takes `plugin.mjs` and its dependencies as inputs, and generates a `dist/plugin.mjs` bundle. This bundle can be directly loaded by MyST without requiring a build or install step.

The `build` script defined in `package.json` shows an example of using `esbuild` to generate an `mjs` module. It can be invoked by running

```shell
npm run build
```

## Using the bundled plugin

The output MyST plugin can be loaded into a MyST project in several ways. The user may wish to download the plugin to their local filesystem, and write the following `myst.yml`:

```yaml
project:
  plugins:
    - /path/to/plugin.mjs
```
