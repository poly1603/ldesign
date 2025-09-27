/**
 * React Adapter for Enhanced Rich Text Editor
 * 
 * Provides React components and hooks for the editor.
 */

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { EnhancedEditor, EditorOptions, Plugin, Delta as IDelta } from '@/types';
import { EnhancedEditor as Editor } from '@/core/editor';
import { Delta } from '@/core/delta';

/**
 * React-specific editor options
 */
export interface ReactEditorOptions extends EditorOptions {
  onChange?: (delta: IDelta, oldDelta: IDelta, source: string) => void;
  onSelectionChange?: (range: any, oldRange: any, source: string) => void;
  onTextChange?: (delta: IDelta, oldDelta: IDelta, source: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * Editor component props
 */
export interface EditorProps extends ReactEditorOptions {
  value?: IDelta;
  defaultValue?: IDelta;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Editor component ref
 */
export interface EditorRef {
  getEditor: () => EnhancedEditor | null;
  focus: () => void;
  blur: () => void;
  getContents: () => IDelta;
  setContents: (delta: IDelta, source?: string) => void;
  getText: () => string;
  getLength: () => number;
  insertText: (index: number, text: string, source?: string) => void;
  deleteText: (index: number, length: number, source?: string) => void;
  formatText: (index: number, length: number, format: string, value: any, source?: string) => void;
  getSelection: () => any;
  setSelection: (range: any, source?: string) => void;
}

/**
 * Enhanced Rich Text Editor React Component
 */
export const EnhancedRichEditor = forwardRef<EditorRef, EditorProps>(
  (props, ref) => {
    const {
      value,
      defaultValue,
      placeholder,
      readOnly,
      className,
      style,
      onChange,
      onSelectionChange,
      onTextChange,
      onFocus,
      onBlur,
      children,
      ...editorOptions
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EnhancedEditor | null>(null);
    const isControlled = value !== undefined;

    // Initialize editor
    useEffect(() => {
      if (!containerRef.current) return;

      const editor = new Editor(containerRef.current, {
        placeholder,
        readOnly,
        ...editorOptions
      });

      editorRef.current = editor;

      // Set initial content
      const initialContent = value || defaultValue;
      if (initialContent) {
        editor.setContents(initialContent);
      }

      // Setup event listeners
      if (onChange) {
        editor.on('text-change', onChange);
      }

      if (onSelectionChange) {
        editor.on('selection-change', onSelectionChange);
      }

      if (onTextChange) {
        editor.on('text-change', onTextChange);
      }

      if (onFocus) {
        editor.on('focus', onFocus);
      }

      if (onBlur) {
        editor.on('blur', onBlur);
      }

      return () => {
        editor.destroy();
        editorRef.current = null;
      };
    }, []);

    // Update content when value prop changes (controlled mode)
    useEffect(() => {
      if (isControlled && editorRef.current && value) {
        const currentContents = editorRef.current.getContents();
        if (!currentContents.isEqual(value)) {
          editorRef.current.setContents(value, 'silent');
        }
      }
    }, [value, isControlled]);

    // Update readOnly state
    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.enable(!readOnly);
      }
    }, [readOnly]);

    // Expose editor methods through ref
    useImperativeHandle(ref, () => ({
      getEditor: () => editorRef.current,
      focus: () => editorRef.current?.focus(),
      blur: () => editorRef.current?.blur(),
      getContents: () => editorRef.current?.getContents() || new Delta(),
      setContents: (delta: IDelta, source = 'api') => {
        editorRef.current?.setContents(delta, source);
      },
      getText: () => editorRef.current?.getText() || '',
      getLength: () => editorRef.current?.getLength() || 0,
      insertText: (index: number, text: string, source = 'api') => {
        editorRef.current?.insertText(index, text, source);
      },
      deleteText: (index: number, length: number, source = 'api') => {
        editorRef.current?.deleteText(index, length, source);
      },
      formatText: (index: number, length: number, format: string, value: any, source = 'api') => {
        editorRef.current?.formatText(index, length, format, value, source);
      },
      getSelection: () => editorRef.current?.getSelection(),
      setSelection: (range: any, source = 'api') => {
        editorRef.current?.setSelection(range, source);
      }
    }), []);

    return (
      <div
        ref={containerRef}
        className={className}
        style={style}
      >
        {children}
      </div>
    );
  }
);

EnhancedRichEditor.displayName = 'EnhancedRichEditor';

/**
 * Hook for using the editor instance
 */
export function useEditor(options?: EditorOptions) {
  const editorRef = useRef<EnhancedEditor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const createEditor = useCallback((container: HTMLDivElement) => {
    if (editorRef.current) {
      editorRef.current.destroy();
    }

    editorRef.current = new Editor(container, options);
    containerRef.current = container;
    
    return editorRef.current;
  }, [options]);

  const destroyEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.destroy();
      editorRef.current = null;
      containerRef.current = null;
    }
  }, []);

  return {
    editor: editorRef.current,
    container: containerRef.current,
    createEditor,
    destroyEditor
  };
}

/**
 * Hook for editor content state
 */
export function useEditorContent(editor: EnhancedEditor | null, initialContent?: IDelta) {
  const [content, setContent] = React.useState<IDelta>(initialContent || new Delta());

  useEffect(() => {
    if (!editor) return;

    const handleTextChange = (delta: IDelta) => {
      setContent(editor.getContents());
    };

    editor.on('text-change', handleTextChange);

    return () => {
      editor.off('text-change', handleTextChange);
    };
  }, [editor]);

  const updateContent = useCallback((newContent: IDelta, source = 'api') => {
    if (editor) {
      editor.setContents(newContent, source);
    }
  }, [editor]);

  return [content, updateContent] as const;
}

/**
 * Hook for editor selection state
 */
export function useEditorSelection(editor: EnhancedEditor | null) {
  const [selection, setSelection] = React.useState<any>(null);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionChange = (range: any) => {
      setSelection(range);
    };

    editor.on('selection-change', handleSelectionChange);

    return () => {
      editor.off('selection-change', handleSelectionChange);
    };
  }, [editor]);

  const updateSelection = useCallback((range: any, source = 'api') => {
    if (editor) {
      editor.setSelection(range, source);
    }
  }, [editor]);

  return [selection, updateSelection] as const;
}

/**
 * Hook for managing editor plugins
 */
export function useEditorPlugins(editor: EnhancedEditor | null, plugins: Plugin[]) {
  useEffect(() => {
    if (!editor) return;

    // Install plugins
    plugins.forEach(plugin => {
      editor.addPlugin(plugin);
    });

    return () => {
      // Uninstall plugins
      plugins.forEach(plugin => {
        editor.removePlugin(plugin.name);
      });
    };
  }, [editor, plugins]);
}

/**
 * Default export
 */
export default EnhancedRichEditor;
