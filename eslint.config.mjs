import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

// The repo declared `"lint": "eslint ."` from the start but never had eslint
// or a config installed, so the script always exited "command not found" --
// a lint step that could not fail was being read as a lint step that passed.
// This is the minimum that makes it real: Next's own flat configs
// (core-web-vitals covers the a11y/perf rules Next cares about, plus the
// TypeScript preset), scoped to source and skipping build output and the
// bundled data JSON.
//
// Imported natively rather than through @eslint/eslintrc's FlatCompat:
// eslint-config-next 16 ships real flat configs, and routing them through
// FlatCompat throws "Converting circular structure to JSON" on its react
// plugin self-reference.
const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "data/**",
      // Unmodified shadcn/v0 scaffold output that this project does not author
      // or hand-maintain. Verified dead at the time of writing: all 57 files
      // under components/ui/ and both hooks/ files are imported by nothing --
      // every component the app actually renders lives in components/dealscope/
      // or components/*.tsx. Linting generator output the project never touches
      // produces noise, not signal. (Deleting it outright is a separate call --
      // flagged for cleanup rather than done here.)
      "components/ui/**",
      "hooks/**",
    ],
  },
  {
    // Downgraded to warnings, NOT switched off -- they still print on every
    // run, they just don't fail the build.
    //
    // Both fire only on code that predates this config existing:
    // `set-state-in-effect` is a new React-19-era rule, and every hit is an
    // established client-only-value pattern in the animation components
    // (scramble-text, split-flap-text) and shadcn's generated
    // hooks/components/ui. Silencing them properly means restructuring how
    // those animations initialise, which is a behavioural change that needs
    // real browser verification -- deliberately out of scope for the session
    // that introduced linting. Turning lint on and fixing every historical
    // violation in the same pass would have made the diff unreviewable.
    //
    // Anything newly written should still come out clean at error level; if
    // one of these starts firing on new code, fix it rather than widening
    // this block.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]

export default config
