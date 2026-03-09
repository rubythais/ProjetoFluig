const prefixer = require("postcss-prefix-selector");

module.exports = {
  plugins: [
    prefixer({
      prefix: ".widget-thais-scope",
      transform(prefix, selector) {
        if (selector.startsWith("html") || selector.startsWith("body") || selector.startsWith(":root")) {
          return `${prefix} ${selector.replace(/^(:root|html|body)/, ".changelog-app")}`;
        }
        return selector.startsWith(prefix) ? selector : `${prefix} ${selector}`;
      },
    }),
  ],
};
