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
      "no-unused-vars": "off", // Handled by TS
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "prisma/generated-client/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
