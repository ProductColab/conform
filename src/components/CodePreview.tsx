import React, { useState } from "react";
import type { Condition, Rule } from "../lib/codeGenerator";
import { generateFullCode, generateFullCodeLegacy } from "../lib/codeGenerator";

interface CodePreviewProps {
  rule?: Rule;
  condition?: Condition; // Legacy support
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  rule,
  condition,
}) => {
  const [copied, setCopied] = useState(false);

  // Generate code from the current rule or legacy condition
  const generatedCode = (() => {
    if (
      rule &&
      rule.condition.field &&
      rule.condition.operator &&
      rule.condition.value
    ) {
      return generateFullCode(rule);
    } else if (
      condition &&
      condition.field &&
      condition.operator &&
      condition.value
    ) {
      // Legacy support
      return generateFullCodeLegacy(condition);
    } else {
      return `import { field } from '@conform/rule-builder';

// Select a field, operator, and value to see generated code`;
    }
  })();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="code-preview">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-600">TypeScript</span>
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-sm">
        <code>{generatedCode}</code>
      </pre>
    </div>
  );
};
