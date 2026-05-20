import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "prefer-const": "warn",
      "no-var": "error",
      "eqeqeq": ["warn", "always", { "null": "ignore" }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "warn",
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/variable-before-declared": "off",
      "react-hooks/purity": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "prisma/generated-client/**",
    "next-env.d.ts",
    "scratch/**",
    "scripts/**",
    "src/lib/check-users.js",
    "e2e/**",
    ".agents/**",
    "artifacts/**",
  ]),
]);

export default eslintConfig;
