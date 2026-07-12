module.exports = {
  root: true,
  ignorePatterns: ["dist/**", ".next/**", "node_modules/**"],
  extends: ["@assetflow/eslint-config"],
  overrides: [
    {
      files: ["apps/web/**/*.{ts,tsx}"],
      extends: ["./packages/eslint-config/next.js"],
    },
  ],
};
