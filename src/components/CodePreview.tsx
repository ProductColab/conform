import React, { useState } from "react";
import type { Rule } from "../schemas/rule.schema";
import { generateFluentCode } from "../lib/codeGenerator";

interface CodePreviewProps {
  rule?: Rule;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ rule }) => {
  const [copied, setCopied] = useState(false);

  // Generate code from the current rule or legacy condition
  const generatedCode = (() => {
    if (rule) {
      return generateFluentCode(rule);
    }

    return `import { field } from '@zodiac/rule-builder';

// Select a field, operator, and value to see generated code`;
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
