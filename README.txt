Ginger's Doodles — website source
=================================

This folder IS the website. Everything in it sits at the top level of the
GitHub repository, and Netlify serves it as-is (no build step).

  *.html                       the pages, plain static HTML (every word is real text)
  edit.html                    the visual editor, at gingersdoodles.net/edit
  netlify/functions/publish.js saves editor changes to GitHub (needs 3 Netlify variables)
  netlify.toml, _redirects     headers, caching, redirects, functions folder
  gallery.js, apply.js         photo lightbox, application form
  images/                      all photos (new uploads land in images/uploads/)
  robots.txt, sitemap.xml      SEO

NETLIFY VARIABLES (Project configuration -> Environment variables)
  ADMIN_PASSWORD   the password the client types at /edit
  GITHUB_TOKEN     fine-grained token, this repo only, Contents: Read and write
  GITHUB_REPO      totosadam/gingersdoodles
After adding or changing a variable: Deploys -> Trigger deploy -> Clear cache and deploy site.

HOW A CHANGE GOES LIVE
  /edit -> change anything -> Save & publish -> commits to GitHub -> Netlify
  redeploys -> live in about a minute. Every publish is a backup (Backups button).
