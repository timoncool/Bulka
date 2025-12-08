---
title: JavaScript API
layout: ../../layouts/MainLayout.astro
---

# Pattern Functions

Let's learn all about functions to create and modify patterns.
At the core of Strudel, everything is made of functions.

For example, everything you can do with the Mini-Notation can also be done with a function.
This Pattern in Mini Notation:

<!-- Interactive example available in web version -->

is equivalent to this Pattern without Mini Notation:

<!-- Interactive example available in web version -->

Similarly, there is an equivalent function for every aspect of the mini notation.

Which representation to use is a matter of context. As a rule of thumb, functions
are better suited in a larger context, while mini notation is more practical for individual rhythms.

## Limits of Mini Notation

While the Mini Notation is a powerful way to write rhythms concisely, it also has its limits. Take this example:

<!-- Interactive example available in web version -->

Here, we are using mini notation for the individual rhythms, while using the function `stack` to mix them.
While stack is also available as `,` in mini notation, we cannot use it here, because we have different types of sounds.

## Combining Patterns

You can freely mix JS patterns, mini patterns and values! For example, this pattern:

<!-- Interactive example available in web version -->

...is equivalent to:

<!-- Interactive example available in web version -->

... as well as:

<!-- MINIREPL_START -->")`} />

While mini notation is almost always shorter, it only has a handful of modifiers: \* / ! @.
When using JS patterns, there is a lot more you can do.

Next, let's look at how you can [create patterns](/learn/factories)

