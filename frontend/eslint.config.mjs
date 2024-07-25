import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  { 
    languageOptions: { 
      globals: globals.browser 
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      // Possible Errors
      "no-console": "warn", // Warn about console.log usage
      "no-debugger": "warn", // Warn about debugger usage
      "no-alert": "warn", // Warn about alert usage
      "no-constant-condition": "warn", // Warn about constant conditions in loops

      // Best Practices
      "curly": "error", // Enforce consistent brace style for all control statements
      "eqeqeq": ["error", "always"], // Require the use of === and !==
      "no-eval": "error", // Disallow the use of eval()
      "no-implied-eval": "error", // Disallow the use of eval()-like methods
      "no-return-assign": ["error", "always"], // Disallow assignment operators in return statements
      "no-unused-expressions": "error", // Disallow unused expressions

      // Variables
      "no-unused-vars": ["error", { "vars": "all", "args": "after-used", "ignoreRestSiblings": false }], // Disallow unused variables

      // ECMAScript 6
      "no-var": "error", // Require let or const instead of var
      "prefer-const": ["error", {
        "destructuring": "all",
        "ignoreReadBeforeAssign": true
      }], // Suggest using const
      "prefer-arrow-callback": ["error", { "allowNamedFunctions": false, "allowUnboundThis": true }], // Suggest using arrow functions as callbacks
    }
  }
];
