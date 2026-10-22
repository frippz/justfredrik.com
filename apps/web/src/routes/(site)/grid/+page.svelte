<script lang="ts">
  import Page from '#lib/components/Page.svelte'

  let { data } = $props()
</script>

{#snippet figure(name: string, width: number, height: number, caption = '')}
  <figure class="image">
    <img src="/images/grid/{name}.png" {height} {width} alt="" loading="lazy" />
    {#if caption}
      <figcaption>{caption}</figcaption>
    {/if}
  </figure>
{/snippet}

<Page
  id="stuff-for-the-css-grid-layout-lab"
  title="Stuff for the CSS Grid Layout lab"
>
  <p>
    A collection of links for the CSS Grid Layout session as well as
    instructions for the lab.
  </p>

  <h3 id="really-nice-resources">Really nice resources</h3>

  <ul>
    <li>
      <a href="https://developer.mozilla.org/en-US/"
        >Mozilla Developer Network</a
      > - the best source of knowledge for everything web
    </li>
    <li>
      <a href="https://codepen.io">CodePen.io</a> – excellent sandbox for labs
    </li>
    <li>
      <a href="https://css-tricks.com/snippets/css/complete-guide-grid/"
        >CSS Tricks: A Complete Guide to Grid</a
      > – a complete guide detailing all the properties covering CSS Grid Layout
    </li>
    <li>
      <a href="https://rachelandrew.co.uk/css/cheatsheets/box-alignment"
        >Box Alignment Cheatsheet</a
      > – this cheatsheet compares alignment in CSS Grid Layout and Flexbox
    </li>
  </ul>

  <h3 id="about-the-labs">About the labs</h3>

  <p>
    Each lab shows a suggested markup. They’re there for your convenience, and
    you are totally free to do your own thing. Go nuts! 🤪
  </p>

  <p>
    <em
      >Don’t forget to do a fallback solution for each lab as well! (hint: float
      and flexbox are nice fallbacks</em
    >
    😉<em>)</em>
  </p>

  <h3 id="lab-1---header-two-columns-and-a-footer">
    Lab 1 - Header, two columns and a footer
  </h3>

  {@render figure(
    'IjsrMdp',
    953,
    394,
    'Figure 1 - header, two columns and a footer',
  )}

  <h4 id="suggested-markup">Suggested markup</h4>

  <!-- eslint-disable-next-line svelte/no-at-html-tags -- highlighted at build time -->
  {@html data.markup.twoColumns}

  <h3 id="lab-2---responsive-header-two-columns-and-a-footer">
    Lab 2 - Responsive header, two columns and a footer
  </h3>

  <p>
    This is example shows a two column pattern, with header and footer. Use
    media queries to move between a single and two column version.
  </p>

  {@render figure(
    'IjsrMdp',
    953,
    394,
    'Figure 2.1 - Responsive header, two columns and a footer',
  )}

  {@render figure(
    'La3ofkI',
    346,
    679,
    'Figure 2.2 - Narrow viewport, single column',
  )}

  <h4 id="suggested-markup-1">Suggested markup</h4>

  <p>See <a href="#lab-1---header-two-columns-and-a-footer">lab 1</a></p>

  <h3 id="lab-3---using-negative-space">Lab 3 - Using negative space</h3>

  <p>
    This example uses line-based positioning, to position the header and footer,
    stretching them across the grid.
  </p>

  <p>
    By making the content span a number of rows, we can then space the blocks
    out next to that content. Each in their own row.
  </p>

  {@render figure(
    '9Wp9lbU',
    955,
    1124,
    'Header, 2 columns, footer using negative space',
  )}

  <h4 id="suggested-markup-2">Suggested markup</h4>

  <!-- eslint-disable-next-line svelte/no-at-html-tags -- highlighted at build time -->
  {@html data.markup.negativeSpace}

  <h3 id="lab-4---as-many-as-will-fit">Lab 4 - As many as will fit</h3>

  <p>
    This is example shows a two column pattern, with header and footer. The
    centre panel contains a number of boxes. We want to have as many in each row
    as will fit, with the boxes lining up as rows and columns.
  </p>

  {@render figure(
    'dEJG7eb',
    954,
    808,
    'Header, footer, centre panel containing as many items as will fit',
  )}

  <h4 id="suggested-markup-3">Suggested markup</h4>

  <!-- eslint-disable-next-line svelte/no-at-html-tags -- highlighted at build time -->
  {@html data.markup.asManyAsWillFit}

  <h3 id="lab-5---as-many-as-will-fit-some-tall">
    Lab 5 - as many as will fit, some tall
  </h3>

  <p>
    This is example shows a two column pattern, with header and footer. The
    centre panel contains a number of boxes. We want to have as many in each row
    as will fit, with the boxes lining up as rows and columns.
  </p>

  <p>Some of our items span two rows.</p>

  {@render figure('82l9j5x', 956, 967)}

  <h4 id="suggested-markup-4">Suggested markup</h4>

  <!-- eslint-disable-next-line svelte/no-at-html-tags -- highlighted at build time -->
  {@html data.markup.someTall}

  <h3 id="lab-6---media-objects">Lab 6 - media objects</h3>

  <p>
    A whole set of example media objects. These objects can be flipped, they can
    be nested, then can have a fixed column for the image or a flexible one.
  </p>

  {@render figure('mzNVylo', 691, 1132)}

  <h4 id="suggested-markup-5">Suggested markup</h4>

  <!-- eslint-disable-next-line svelte/no-at-html-tags -- highlighted at build time -->
  {@html data.markup.mediaObjects}

  <h3 id="done-with-the-labs">Done with the labs?</h3>

  <p>
    Are you finished already? Or maybe it’s so late that the office alarm will
    soon kick in automatically. Check out the completed solutions for all of the
    above labs. Props and ❤️ to
    <a href="https://rachelandrew.co.uk">Rachel Andrew</a> for creating all these
    awesome patterns!
  </p>

  <!-- frippz.se revealed the link with a script. The site ships no JavaScript. -->
  <details>
    <summary>✨ Yes, yes! I’m done! Show me! ✨</summary>
    <p>
      <a href="https://gridbyexample.com/patterns/"
        >https://gridbyexample.com/patterns/</a
      >
    </p>
  </details>
</Page>
