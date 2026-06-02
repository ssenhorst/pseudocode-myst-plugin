---
exports:
  - format: tex+pdf
    output: ../_build/exports/pdf_test.pdf
---
# Pseudocode Plugin

Allows rendering pseudocode using [pseudocode.js](https://saswat.padhi.me/pseudocode.js/). For Tex-based exports, simply the raw contents are exported, surrounded by the `\algorithm` and `\algorithmic` environments, and with an attempt to add the dependencies with a `\usepackage`. This will probably throw a Latex error, since packages may only be imported in the preamble. I fixed handling of this [in my fork](https://github.com/ssenhorst/mystmd/commit/050527906db7dc2fc83742a93cec9cf22f4569cc) of the myst-to-tex renderer, but this is not yet implemented upstream. If using an incompatible mystmd version, the correct packages imports should be manually added to the tex preamble by adding `\usepackage{algorithmic}` and `\usepackage{algorithm}`.

## Examples

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
Refer to {ref}`alg:2`.
:::{pseudocode} test Text-style
:label: alg:2
\Require some preconditions
\Ensure some postconditions
\Require some inputs
\Ensure some outputs
\Procedure{Test-Declarations}{}
    \State font families: {\sffamily sffamily, \ttfamily ttfamily, \normalfont normalfont, \rmfamily rmfamily.}
    \State font weights: {normal weight, \bfseries bold, \mdseries
    medium, \lfseries lighter. }
    \State font shapes: {\itshape itshape \scshape Small-Caps \slshape slshape \upshape upshape.}
    \State font sizes: \tiny tiny \scriptsize scriptsize \footnotesize
    footnotesize \small small \normalsize normal \large large \Large Large
    \Large Large \huge huge \Huge Huge \normalsize
\EndProcedure
\Procedure{Test-Commands}{}
    \State \textnormal{textnormal,} \textrm{textrm,} \textsf{textsf,} \texttt{texttt.}
    \State \textbf{textbf,} \textmd{textmd,} \textlf{textlf.}
    \State \textup{textup,} \textit{textit,} \textsc{textsc,} \textsl{textsl.}
    \State \uppercase{uppercase,} \lowercase{LOWERCASE.}
\EndProcedure
\Procedure{Test-Colors}{}
    \State colors: $\color{red}{red}$, $\color{green}{green}$, $\color{blue}{blue}$
    \State colors: $\color{yellow}{yellow}$, $\color{cyan}{cyan}$, $\color{magenta}{magenta}$
\EndProcedure
:::
:::{pseudocode} Test specials
:label: alg:3
\Procedure{Test-Specials}{}
    \State \textbf{Specials:} \{ \} \$ \& \# \% \_
    \State \textbf{Bools:} \And \Or \Not \True \False
    \State \textbf{Carriage return:} first line \\ second line
    \State \textbf{Text-symbols:} \textbackslash
    \State \textbf{Quote-symbols:} `single quotes', ``double quotes''
    \State \textbf{Math:} $(\mathcal{C}_m)$, $i \gets i + 1$, $E=mc^2$, \( x^n + y^n = z^n \), $\$$, \(\$\)
\EndProcedure
::: 

:::{algorithm} Test control blocks
\Procedure{Test-If}{}
    \If{<cond>}
        \State <block>;
    \ElsIf{<cond>;}
        \State <block>;
    \Else
        \State <block>;
    \EndIf
\EndProcedure
\Procedure{Test-For}{$n$}
    \State $i \gets 0$
    \For{$i < n$}
        \Print $i$
        \State $i \gets i + 1$
    \EndFor
\EndProcedure
\Procedure{Test-For-To}{$n$}
    \State $i \gets 0$
    \For{$i \dots n$}
        \Print $i$
    \EndFor
\EndProcedure
\Procedure{Test-For-All}{$n$}
    \ForAll{$i \in \{0, 1, \cdots, n\}$}
        \Print $i$
    \EndFor
\EndProcedure
\Procedure{Test-While}{$n$}
    \State $i \gets 0$
    \While{$i < n$}
        \Print $i$
        \State $i \gets i + 1$
    \EndWhile
\EndProcedure
\Procedure{Test-Repeat}{$n$}
    \State $i \gets 0$
    \Repeat
        \Print $i$
        \State $i \gets i + 1$
    \Until{$i>n$}
\EndProcedure
\Procedure{Test-Break-Continue}{$n$}
    \For{$i = 0 \dots 2n$}
        \If{$i < n/2$}
            \Continue
        \ElsIf{$i > n$}
            \Break
        \EndIf
        \Print $i$
    \EndFor
\EndProcedure
:::
:::{algorithm} Test comments
\Procedure{Test-Comments}{} \Comment{comment for procedure}
    \State a statement \Comment{inline comment}
    \State \Comment{line comment}
    \If{some condition} \Comment{ comment for if}

        \Return \True \Comment{another inline comment}
    \Else \Comment{comment for else}

        \Return \False \Comment{yet another inline comment}
    \EndIf
\EndProcedure
:::

Note: the `scope-lines` and `no-end` options only work in HTML-based rendering.

:::{algorithm} Classical Euclidean Algorithm
:scope-lines: true
\Procedure{Euclid}{$a,b$}
    \While{$a \neq b$}
        \If{$a > b$}
            \State $a \gets a - b$
        \Else
            \State $b \gets b - a$
        \EndIf
    \EndWhile
\Return $a$
\EndProcedure
:::

:::{algorithm} DBSCAN
:scope-lines: true
:no-end: true

\Require A dataset $D$, the $\varepsilon$ distance threshold, and the minimum number of points $minPts$
\Ensure A set of clusters $K$
\Procedure{DBSCAN}{$D, \varepsilon, minPts$}
    \State $K \gets \emptyset$
    \ForAll{$p \in D$}
        \If{$p$ has not been visited}
            \State mark $p$ as visited
            \State $N_{\varepsilon}(p) \gets $ \textsc{RangeQuery}$(p, \varepsilon, D)$
            \If{$N_{\varepsilon}(p) < minPts$}
                \State mark $p$ as noise
            \Else
                \Comment{p is a core object}
                \State $C \gets $ \textsc{ExpandCluster}$(p, N_{\varepsilon}(p))$
                \State $K \gets K \cup \{C\}$
            \EndIf
        \EndIf
    \EndFor
    \Return $K$
\EndProcedure
:::