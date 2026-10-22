<script lang="ts">
  import Page from '#lib/components/Page.svelte'
  import { site } from '#lib/site'
</script>

<Page
  id="about-the-author-of-this-journal"
  title="About the author of this journal"
>
  <p>
    <img
      src="/images/just-me-320w.jpg"
      srcset="/images/just-me-480w.jpg 480w, /images/just-me-640w.jpg 640w"
      sizes="(min-width: 1100px) 25vw, 50vw"
      alt=""
      height="320"
      width="320"
      class="left"
    /> Hello! I’m Fredrik and that right there is me. I’m working as a front end developer
    in frosty Sweden (though our summers are really awesome when it’s not raining).
  </p>

  <p>
    If you’re reading this, it very likely means you’ve found your way to my
    personal journal. This is a place for me to collect my thoughts, mostly
    about front end web development. In the good spirit of sharing knowledge, I
    thought it’d be nice to post all my stuff online for the rest of the world
    to enjoy. Chances are you might find something useful some day.
  </p>

  <p>
    Please note that any views and opinions expressed by me on this site are
    personal and not necessarily shared by my employer.
  </p>

  <h3 id="technical-stuff">Technical stuff</h3>

  <p>
    This site is just plain static HTML, generated with the help of
    <a href="https://svelte.dev/docs/kit">SvelteKit</a> from posts I write in
    <a href="https://payloadcms.com">Payload</a>. Vector icons used on this site
    are provided by <a href="https://icomoon.io">icomoon.io</a>.
    Technology-wise, this site uses good old plain HTML5 and CSS3, and no
    JavaScript at all.
  </p>

  <h4 id="platform">Platform</h4>

  <p>
    I’ve moved from Github Pages to running my own virtual host at Digital Ocean
    and then onto hosting on AWS using S3 and CloudFront, mostly just to learn
    how AWS works. I’m currently settled in at Cloudflare, where both this site
    and the CMS I write in run on
    <a href="https://workers.cloudflare.com">Cloudflare Workers</a>. Whenever I
    publish a post, Github Actions tests, rebuilds and deploys the site.
  </p>

  <h3 id="getting-in-touch">Getting in touch</h3>

  <p>
    Need to get in touch with me? I’m reachable at <a
      href="mailto:contact@frippz.se">contact@frippz.se</a
    >.
  </p>

  <h4 id="please-dont-bother-contacting-me-if">
    Please don’t bother contacting me if
  </h4>

  <ul>
    <li>
      You’re a recruiter. I will not reply. I’m just fine where I work today and
      if that changes then I’ll find something else on my own.
    </li>
    <li>
      You want to offer your services to me, like building a web page. This is
      what I do for a living, so please stop wasting both your time and mine.
    </li>
    <li>
      You want to write a guest post or “collaborate”, whatever that means.
    </li>
  </ul>

  <h3 id="frippz">frippz?</h3>

  <p>
    That’s just a nickname my cousin gave me when I was a kid. The ”z” is just
    because it looks cool. Back in 2005, I quickly needed a domain name for my
    portfolio when I attended
    <a href="https://www.hyperisland.com">Hyper Island</a> in Karlskrona, and
    said name came to mind. This journal lived on frippz.se until 2026, when it
    moved here to {site.title}.
  </p>
</Page>
