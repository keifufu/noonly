# Publishing
For firefox, simply run `npm run build`, then `npm run build:firefox`
For chrome: run `npm run build`, zip /build/chrome, and upload that zip to the webstore

`npm run build:chrome` does create a .crx file but it seems useless, since the webstore does not accept them that way anymore