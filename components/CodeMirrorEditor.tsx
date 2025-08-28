import React, { useRef, useEffect } from 'react';
import { crosshairCursor, EditorView, highlightActiveLine, highlightActiveLineGutter, lineNumbers, rectangularSelection, drawSelection, dropCursor, highlightSpecialChars } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { bracketMatching, defaultHighlightStyle, foldGutter, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (editorRef.current && !editorViewRef.current) {
      const state = EditorState.create({
        doc: value || '',
        extensions: [
          // A line number gutter
          lineNumbers(),
          // A gutter with code folding markers
          foldGutter(),
          // Replace non-printable characters with placeholders
          highlightSpecialChars(),
         
          // Replace native cursor/selection with our own
          drawSelection(),
          // Show a drop cursor when dragging over the editor
          dropCursor(),
          // Allow multiple cursors/selections
          EditorState.allowMultipleSelections.of(true),
          // Re-indent lines when typing specific input
          indentOnInput(),
          // Highlight syntax with a default style
          syntaxHighlighting(defaultHighlightStyle),
          // Highlight matching brackets near cursor
          bracketMatching(),
          // Automatically close brackets
          closeBrackets(),
          // Load the autocompletion system
          autocompletion(),
          // Allow alt-drag to select rectangular regions
          rectangularSelection(),
          // Change the cursor to a crosshair when holding alt
          crosshairCursor(),
          // Style the current line specially
          highlightActiveLine(),
          // Style the gutter for current line specially
          highlightActiveLineGutter(),
          // Highlight text that matches the selected text
          javascript(),
          EditorView.theme({
            ".cm-content, .cm-gutter": {minHeight: "200px",color: "black"}
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const content = update.state.doc.toString();
              onChange(content);
            }
          }),
        ]
      });

      const view = new EditorView({
        state,
        parent: editorRef.current
      });

      editorViewRef.current = view;
    }

    return () => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
        editorViewRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (editorViewRef.current && value !== editorViewRef.current.state.doc.toString()) {
      const transaction = editorViewRef.current.state.update({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: value
        }
      });
      editorViewRef.current.dispatch(transaction);
    }
  }, [value]);

  return (
    <div className="w-full">
      <div ref={editorRef} className="w-full border-2 border-gray-300 rounded-md code-editor" />
      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
        <span>💡 Tip: Usa <code className="bg-gray-100 px-1 rounded">data</code> para acceder a los datos JSON</span>
      </div>
    </div>
  );
};

export default CodeMirrorEditor;
