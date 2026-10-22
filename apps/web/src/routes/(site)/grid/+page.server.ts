import { renderCode } from '#lib/server/body/code'
import type { PageServerLoad } from './$types'

// The suggested markup for each lab, highlighted like a Post's Code blocks
const markup = {
  twoColumns: `<div class="wrapper">
  <header class="header">My header</header>
  <aside class="sidebar">Sidebar</aside>
  <article class="content">
    <h1>2 column, header and footer</h1>
    <p>This example uses line-based positioning, to position the header and footer, stretching them across the grid.</p>
  </article>
  <footer class="footer">My footer</footer>
</div>
`,
  negativeSpace: `<div class="wrapper">
  <header class="header">My header</header>

  <article class="content">
    <h1>Using negative space</h1>
    <p>This example uses line-based positioning, to position the header and footer, stretching them across the grid.</p>

    <p>By making the content span a number of rows, we can then space the blocks out next to that content. Each in their own row.</p>
  </article>

  <div class="block-a">Block A</div>
  <div class="block-b">Block B</div>
  <div class="block-c">Block C</div>
  <footer class="footer">My footer</footer>
</div>
`,
  asManyAsWillFit: `<div class="wrapper">
  <header class="header">My header</header>

  <div class="panel">Panel A</div>
  <div class="panel">Panel B</div>
  <div class="panel">Panel C</div>
  <div class="panel">Panel D</div>
  <div class="panel">Panel E</div>
  <div class="panel">Panel F</div>
  <div class="panel">Panel G</div>
  <div class="panel">Panel H</div>
  <div class="panel">Panel I</div>
  <div class="panel">Panel J</div>

  <footer class="footer">My footer</footer>
</div>
`,
  someTall: `<div class="wrapper">
  <header class="header">My header</header>

  <div class="panel">Panel A</div>
  <div class="panel">Panel B</div>
  <div class="panel tall-panel">Panel C</div>
  <div class="panel">Panel D</div>
  <div class="panel">Panel E</div>
  <div class="panel">Panel F</div>
  <div class="panel tall-panel">Panel G</div>
  <div class="panel tall-panel">Panel H</div>
  <div class="panel">Panel I</div>
  <div class="panel">Panel J</div>

  <footer class="footer">My footer</footer>
</div>
`,
  mediaObjects: `<div class="media">

  <div class="img">
    <img src="http://placehold.it/250x250" alt="Placeholder">
  </div>
  <h2 class="title">This is my title</h2>
  <div class="content">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis vehicula vitae ligula sit amet maximus. Nunc auctor neque ipsum, ac porttitor elit lobortis ac. Vivamus ultrices sodales tellus et aliquam. Pellentesque porta sit amet nulla vitae luctus.
      Praesent quis risus id dolor venenatis condimentum.</p>
  </div>
  <div class="footer">
    An optional footer goes here.
  </div>

</div>

<div class="media media-flip">

  <div class="img">
    <img src="http://placehold.it/250x250" alt="Placeholder">
  </div>
  <h2 class="title">This is my title</h2>
  <div class="content">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis vehicula vitae ligula sit amet maximus. Nunc auctor neque ipsum, ac porttitor elit lobortis ac. Vivamus ultrices sodales tellus et aliquam. Pellentesque porta sit amet nulla vitae luctus.
      Praesent quis risus id dolor venenatis condimentum.</p>
  </div>
  <div class="footer">
    An optional footer goes here.
  </div>

</div>
`,
}

export const load: PageServerLoad = async () => ({
  title: 'Stuff for the CSS Grid Layout lab',
  markup: Object.fromEntries(
    await Promise.all(
      Object.entries(markup).map(async ([name, code]) => [
        name,
        await renderCode({ blockType: 'code', language: 'html', code }),
      ]),
    ),
  ) as Record<keyof typeof markup, string>,
})
