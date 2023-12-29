import defineProvider from "@babel/helper-define-polyfill-provider";
import { join } from "node:path";
import paths from "../paths.cjs";

const POLYFILL_DIR = join(paths.polymer_dir, "src/resources/polyfills");

// List of polyfill keys with supported browser targets for the functionality
const PolyfillSupport = {
  fetch: {
    android: 42,
    chrome: 42,
    edge: 14,
    firefox: 39,
    ios: 10.3,
    opera: 29,
    opera_mobile: 29,
    safari: 10.1,
    samsung: 4.0,
  },
  "intl-getcanonicallocales": {
    android: 54,
    chrome: 54,
    edge: 16,
    firefox: 48,
    ios: 10.3,
    opera: 41,
    opera_mobile: 41,
    safari: 10.1,
    samsung: 6.0,
  },
  "intl-locale": {
    android: 74,
    chrome: 74,
    edge: 79,
    firefox: 75,
    ios: 14.0,
    opera: 62,
    opera_mobile: 53,
    safari: 14.0,
    samsung: 11.0,
  },
  "intl-other": {
    // Not specified (i.e. always try polyfill) since compatibility depends on supported locales
  },
  proxy: {
    android: 49,
    chrome: 49,
    edge: 12,
    firefox: 18,
    ios: 10.0,
    opera: 36,
    opera_mobile: 36,
    safari: 10.0,
    samsung: 5.0,
  },
};

// Map of global variables and/or instance and static properties to the
// corresponding polyfill key and actual module to import
const polyfillMap = {
  global: {
    Proxy: { key: "proxy", module: "proxy-polyfill" },
    fetch: { key: "fetch", module: "unfetch/polyfill" },
  },
  instance: {},
  static: {
    Intl: {
      getCanonicalLocales: {
        key: "intl-getcanonicallocales",
        module: join(POLYFILL_DIR, "intl-polyfill.ts"),
      },
      Locale: {
        key: "intl-locale",
        module: join(POLYFILL_DIR, "intl-polyfill.ts"),
      },
      ...Object.fromEntries(
        [
          "DateTimeFormat",
          "DisplayNames",
          "ListFormat",
          "NumberFormat",
          "PluralRules",
          "RelativeTimeFormat",
        ].map((obj) => [
          obj,
          { key: "intl-other", module: join(POLYFILL_DIR, "intl-polyfill.ts") },
        ])
      ),
    },
  },
};

// Create plugin using the same factory as for CoreJS
export default defineProvider(
  ({ createMetaResolver, debug, shouldInjectPolyfill }) => {
    const resolvePolyfill = createMetaResolver(polyfillMap);
    return {
      name: "HA Custom",
      polyfills: PolyfillSupport,
      usageGlobal(meta, utils) {
        const polyfill = resolvePolyfill(meta);
        if (polyfill && shouldInjectPolyfill(polyfill.desc.key)) {
          debug(polyfill.desc.key);
          utils.injectGlobalImport(polyfill.desc.module);
          return true;
        }
        return false;
      },
    };
  }
);
