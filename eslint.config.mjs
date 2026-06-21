import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

// eslint-config-next ships native flat configs since v15+, so it's imported
// directly via its subpath export instead of through FlatCompat.
export default defineConfig(
  {
    ignores: [".next", "node_modules", "dist", "build", "*.d.ts"],
  },

  js.configs.recommended,
  tseslint.configs.recommended,
  nextCoreWebVitals,

  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      // --- Stvarni bugovi / dobra praksa ---
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-empty": "warn",
      "no-nested-ternary": "warn",
      "require-await": "warn",

      // --- Import hygiene ---
      "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
      "import/no-duplicates": "warn",
      "import/newline-after-import": "warn",
      "import/order": [
        "warn",
        {
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
        },
      ],

      // --- TypeScript specifično ---
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  // Prettier MORA biti zadnji - iskljucuje stilska pravila koja bi se
  // kosila s Prettier formatiranjem
  prettier,
);
