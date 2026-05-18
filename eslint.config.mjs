import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "prefer-const": "warn",
      "no-var": "error",
      "eqeqeq": ["warn", "always", { "null": "ignore" }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "react-refresh/only-export-components": "off",
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
    "e2e/**",
    ".agents/**",
    "artifacts/**",
  ]),
]);

export default eslintConfig;
