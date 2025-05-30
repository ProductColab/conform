import { useCallback, useEffect, useRef, useState } from "react";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  type EditorState,
  type LexicalEditor,
  FORMAT_TEXT_COMMAND,
} from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertToMarkdownString } from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  CodeHighlightNode,
  CodeNode,
  registerCodeHighlighting,
} from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { MarkNode } from "@lexical/mark";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TRANSFORMERS } from "@lexical/markdown";

interface RichTextFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  mode?: "wysiwyg" | "markdown" | "hybrid";
  toolbar?: string[];
  plugins?: string[];
  maxLength?: number;
  allowImages?: boolean;
  allowTables?: boolean;
  allowCodeBlocks?: boolean;
  syntaxHighlighting?: boolean;
  spellCheck?: boolean;
  autoSave?: boolean;
  disabled?: boolean;
  className?: string;
}

// Syntax highlighting plugin
function SyntaxHighlightPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return registerCodeHighlighting(editor);
  }, [editor]);

  return null;
}

// Simple toolbar component
function SimpleToolbar({
  toolbar,
  allowImages,
  allowTables,
  allowCodeBlocks,
}: {
  toolbar: string[];
  allowImages: boolean;
  allowTables: boolean;
  allowCodeBlocks: boolean;
}) {
  const [editor] = useLexicalComposerContext();

  const formatText = (format: string) => {
    switch (format) {
      case "bold":
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        break;
      case "italic":
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        break;
      case "underline":
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        break;
      case "strikethrough":
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        break;
      case "code":
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
        break;
      default:
        console.warn(`Unknown format: ${format}`);
    }
  };

  return (
    <div className="toolbar">
      {toolbar.map((tool) => (
        <button
          key={tool}
          type="button"
          onClick={() => formatText(tool)}
          className="toolbar-button"
        >
          {tool}
        </button>
      ))}
      {allowTables && (
        <button type="button" className="toolbar-button">
          Table
        </button>
      )}
      {allowCodeBlocks && (
        <button type="button" className="toolbar-button">
          Code
        </button>
      )}
      {allowImages && (
        <button type="button" className="toolbar-button">
          Image
        </button>
      )}
    </div>
  );
}

// Auto-save plugin
function AutoSavePlugin({
  onSave,
  delay = 2000,
}: {
  onSave: (content: string) => void;
  delay?: number;
}) {
  const [editor] = useLexicalComposerContext();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        editorState.read(() => {
          const htmlString = $generateHtmlFromNodes(editor, null);
          onSave(htmlString);
        });
      }, delay);
    });
  }, [editor, onSave, delay]);

  return null;
}

// Character count plugin
function CharacterLimitPlugin({ maxLength }: { maxLength: number }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const text = root.getTextContent();

        if (text.length > maxLength) {
          // Optionally prevent further input or show warning
          console.warn(`Character limit exceeded: ${text.length}/${maxLength}`);
        }
      });
    });
  }, [editor, maxLength]);

  return null;
}

// Initial content plugin
function InitialStatePlugin({ value }: { value?: string }) {
  const [editor] = useLexicalComposerContext();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!value || isInitialized) return;

    // Try to parse as JSON first (for serialized editor state)
    try {
      const parsedState = JSON.parse(value);
      if (parsedState && typeof parsedState === "object" && parsedState.root) {
        // It's a valid Lexical editor state
        const editorState = editor.parseEditorState(value);
        editor.setEditorState(editorState);
        setIsInitialized(true);
        return;
      }
    } catch {
      // Not JSON, treat as plain text
    }

    // Set as plain text
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      const textNode = $createTextNode(value);
      paragraph.append(textNode);
      root.append(paragraph);
    });
    setIsInitialized(true);
  }, [editor, value, isInitialized]);

  return null;
}

export function RichTextField({
  value = "",
  onChange,
  placeholder = "Start writing...",
  mode = "wysiwyg",
  toolbar = ["bold", "italic", "underline", "strikethrough", "link"],
  plugins = [],
  maxLength,
  allowImages = false,
  allowTables = false,
  allowCodeBlocks = false,
  syntaxHighlighting = false,
  spellCheck = true,
  autoSave = false,
  disabled = false,
  className = "",
}: RichTextFieldProps) {
  // Configure nodes based on enabled features
  const nodes = [
    HeadingNode,
    QuoteNode,
    ListItemNode,
    ListNode,
    MarkNode,
    AutoLinkNode,
    LinkNode,
    ...(allowCodeBlocks ? [CodeNode] : []),
    ...(allowCodeBlocks && syntaxHighlighting ? [CodeHighlightNode] : []),
    ...(allowTables ? [TableNode, TableCellNode, TableRowNode] : []),
  ];

  // Initial editor configuration
  const initialConfig = {
    namespace: "RichTextField",
    nodes,
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
    theme: {
      root: "rich-text-editor",
      paragraph: "rich-text-paragraph",
      heading: {
        h1: "rich-text-h1",
        h2: "rich-text-h2",
        h3: "rich-text-h3",
        h4: "rich-text-h4",
        h5: "rich-text-h5",
        h6: "rich-text-h6",
      },
      list: {
        nested: {
          listitem: "rich-text-nested-listitem",
        },
        ol: "rich-text-list-ol",
        ul: "rich-text-list-ul",
        listitem: "rich-text-listitem",
      },
      link: "rich-text-link",
      text: {
        bold: "rich-text-bold",
        italic: "rich-text-italic",
        underline: "rich-text-underline",
        strikethrough: "rich-text-strikethrough",
        code: "rich-text-code",
      },
      code: "rich-text-code-block",
      quote: "rich-text-quote",
      table: "rich-text-table",
      tableCell: "rich-text-table-cell",
      tableCellHeader: "rich-text-table-cell-header",
      codeHighlight: {
        atrule: "rich-text-code-atrule",
        attr: "rich-text-code-attr",
        boolean: "rich-text-code-boolean",
        builtin: "rich-text-code-builtin",
        cdata: "rich-text-code-cdata",
        char: "rich-text-code-char",
        class: "rich-text-code-class",
        "class-name": "rich-text-code-class-name",
        comment: "rich-text-code-comment",
        constant: "rich-text-code-constant",
        deleted: "rich-text-code-deleted",
        doctype: "rich-text-code-doctype",
        entity: "rich-text-code-entity",
        function: "rich-text-code-function",
        important: "rich-text-code-important",
        inserted: "rich-text-code-inserted",
        keyword: "rich-text-code-keyword",
        namespace: "rich-text-code-namespace",
        number: "rich-text-code-number",
        operator: "rich-text-code-operator",
        prolog: "rich-text-code-prolog",
        property: "rich-text-code-property",
        punctuation: "rich-text-code-punctuation",
        regex: "rich-text-code-regex",
        selector: "rich-text-code-selector",
        string: "rich-text-code-string",
        symbol: "rich-text-code-symbol",
        tag: "rich-text-code-tag",
        url: "rich-text-code-url",
        variable: "rich-text-code-variable",
      },
    },
    editable: !disabled,
  };

  // Handle content changes
  const handleChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      if (!onChange) return;

      editorState.read(() => {
        let content: string;

        if (mode === "markdown") {
          content = $convertToMarkdownString(TRANSFORMERS);
        } else {
          content = $generateHtmlFromNodes(editor, null);
        }

        onChange(content);
      });
    },
    [onChange, mode]
  );

  return (
    <div className={`rich-text-field ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="rich-text-container">
          {toolbar.length > 0 && (
            <SimpleToolbar
              toolbar={toolbar}
              allowImages={allowImages}
              allowTables={allowTables}
              allowCodeBlocks={allowCodeBlocks}
            />
          )}

          <div className="rich-text-editor-container">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="rich-text-content-editable"
                  placeholder={
                    <div className="rich-text-placeholder">{placeholder}</div>
                  }
                  aria-placeholder={placeholder}
                  spellCheck={spellCheck}
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />

            <OnChangePlugin onChange={handleChange} />
            <HistoryPlugin />

            {/* Add the InitialStatePlugin to handle value prop */}
            <InitialStatePlugin value={value} />

            {plugins.includes("lists") && <ListPlugin />}
            {plugins.includes("links") && <LinkPlugin />}
            {plugins.includes("markdown") && (
              <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            )}
            {plugins.includes("tabs") && <TabIndentationPlugin />}
            {plugins.includes("checklist") && <CheckListPlugin />}
            {allowTables && <TablePlugin />}

            {maxLength && <CharacterLimitPlugin maxLength={maxLength} />}
            {autoSave && onChange && <AutoSavePlugin onSave={onChange} />}
            {allowCodeBlocks && syntaxHighlighting && <SyntaxHighlightPlugin />}
          </div>
        </div>
      </LexicalComposer>

      <style>{`
        .rich-text-field {
          border: 1px solid #e1e5e9;
          border-radius: 6px;
          overflow: hidden;
          background: white;
        }

        .rich-text-container {
          min-height: 200px;
        }

        .toolbar {
          display: flex;
          gap: 4px;
          padding: 8px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .toolbar-button {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          text-transform: capitalize;
        }

        .toolbar-button:hover {
          background: #f3f4f6;
        }

        .rich-text-content-editable {
          padding: 12px;
          min-height: 150px;
          outline: none;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
          font-size: 14px;
          line-height: 1.5;
        }

        .rich-text-placeholder {
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 14px;
        }

        /* Text formatting styles */
        .rich-text-bold {
          font-weight: bold;
        }

        .rich-text-italic {
          font-style: italic;
        }

        .rich-text-underline {
          text-decoration: underline;
        }

        .rich-text-strikethrough {
          text-decoration: line-through;
        }

        .rich-text-code {
          background: #f3f4f6;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono",
            Consolas, monospace;
          font-size: 0.9em;
        }

        /* Heading styles */
        .rich-text-h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }

        .rich-text-h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }

        .rich-text-h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }

        /* List styles */
        .rich-text-list-ol {
          padding-left: 1.5em;
        }

        .rich-text-list-ul {
          padding-left: 1.5em;
        }

        .rich-text-listitem {
          margin: 0.25em 0;
        }

        /* Link styles */
        .rich-text-link {
          color: #3b82f6;
          text-decoration: underline;
          cursor: pointer;
        }

        .rich-text-link:hover {
          color: #1d4ed8;
        }

        /* Code block styles */
        .rich-text-code-block {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px;
          margin: 8px 0;
          font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono",
            Consolas, monospace;
          font-size: 0.9em;
          overflow-x: auto;
        }

        /* Quote styles */
        .rich-text-quote {
          border-left: 4px solid #e5e7eb;
          padding-left: 16px;
          margin: 16px 0;
          font-style: italic;
          color: #6b7280;
        }

        /* Table styles */
        .rich-text-table {
          border-collapse: collapse;
          width: 100%;
          margin: 16px 0;
        }

        .rich-text-table-cell,
        .rich-text-table-cell-header {
          border: 1px solid #d1d5db;
          padding: 8px 12px;
          text-align: left;
        }

        .rich-text-table-cell-header {
          background: #f9fafb;
          font-weight: 600;
        }

        /* Disabled state */
        .rich-text-field:has(
            .rich-text-content-editable[contenteditable="false"]
          ) {
          background: #f9fafb;
          opacity: 0.7;
        }

        /* Syntax highlighting styles */
        .rich-text-code-comment {
          color: #6a737d;
          font-style: italic;
        }

        .rich-text-code-keyword {
          color: #d73a49;
          font-weight: 600;
        }

        .rich-text-code-string {
          color: #032f62;
        }

        .rich-text-code-number {
          color: #005cc5;
        }

        .rich-text-code-function {
          color: #6f42c1;
        }

        .rich-text-code-class-name {
          color: #6f42c1;
          font-weight: 600;
        }

        .rich-text-code-operator {
          color: #d73a49;
        }

        .rich-text-code-punctuation {
          color: #586069;
        }

        .rich-text-code-property {
          color: #005cc5;
        }

        .rich-text-code-tag {
          color: #22863a;
        }

        .rich-text-code-attr {
          color: #6f42c1;
        }

        .rich-text-code-boolean {
          color: #005cc5;
        }

        .rich-text-code-constant {
          color: #005cc5;
        }

        .rich-text-code-builtin {
          color: #005cc5;
        }

        .rich-text-code-variable {
          color: #e36209;
        }

        .rich-text-code-regex {
          color: #032f62;
        }

        .rich-text-code-selector {
          color: #6f42c1;
        }

        .rich-text-code-important {
          color: #d73a49;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
