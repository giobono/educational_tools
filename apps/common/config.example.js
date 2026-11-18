// apps/common/config.example.js — committed template, for reference only.
// Never loaded directly: the real, working config.js lives outside this git
// tree, in the sibling config/apps/common/ directory (config/README.md), and
// reaches the browser via apps/common/config.php, not a <script src> pointed
// at a static file. One copy per surface: beta and edu differ in every value
// below except allowanceDisplay.
//
// Metering phase 3 (OD brief v1.1 of 19 Nov 2026). Nothing here is secret:
// the sign-in client ID is public (PKCE), and the supplier is named only in
// apps/common/signin.js, never in this file.
//
//   domain            the sign-in supplier's issuer for our business, as the
//                     phase 2 Part A return records it
//   clientId          the front-end application's public client ID
//   audience          the API the token is for: 'https://api-dev.ebono.net'
//                     on beta, 'https://api.ebono.net' live. Without it the
//                     token carries no `aud` and the API refuses it
//   termsUrl          the published Terms of Service v1.0 at ebono.au
//   privacyUrl        the published Privacy Policy v1.0 at ebono.au
//   supportUrl        where every "contact us" goes (CD, 19 Nov 2026)
//   allowanceDisplay  'percent' (CD's option A, 18 Nov 2026) or 'ebonis'.
//                     Stays 'percent' unless SD declines the change to the
//                     dispatch's §2.3; then this one value changes

window.ARTIE_AUTH_CONFIG = {
  domain:           'https://SIGNIN-ISSUER',
  clientId:         'PUBLIC-CLIENT-ID',
  audience:         'https://api-dev.ebono.net',
  termsUrl:         'https://ebono.au/terms/',
  privacyUrl:       'https://ebono.au/privacy/',
  supportUrl:       'https://ebono.au/support/',
  allowanceDisplay: 'percent'
};
