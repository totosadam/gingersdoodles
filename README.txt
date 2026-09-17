Ginger's Doodles — website source
=================================

This folder IS the website. Everything in it sits at the top level of the
GitHub repository, and Netlify serves it as-is.

  index.html ... 404.html      the pages, plain HTML (no build step)
  content.json                 the content your client edits
  cms.js                       reads content.json into the pages
  gallery.js, apply.js         photo lightbox, application form
  admin/                       the /admin login and editor
  images/                      all photos
  images/uploads/              photos your client uploads land here
  netlify.toml, _redirects     headers, caching, old-URL redirects
  robots.txt, sitemap.xml      SEO

WHAT THE CLIENT CAN EDIT AT /admin
  - Litters & waitlist: the three cards (home page + Litters page)
  - Puppy Tails: every entry, grouped by litter
  - Photo gallery: photos, order, captions
  She can add, delete, and reorder items in all three.

Everything else (Why Us, How It Works, The Breeds, FAQ, About, Our Dogs,
Stud, the application form) is fixed in the HTML and changes here.

HOW A CHANGE GOES LIVE
  /admin -> edit -> Publish -> commits to GitHub -> Netlify rebuilds -> live
  in about a minute. Full history and one-click revert live in the repo.

IF SOMETHING LOOKS WRONG
  Pages always show their built-in content first, then swap in content.json.
  So if content.json ever breaks, the site still renders the last built
  version rather than going blank.
