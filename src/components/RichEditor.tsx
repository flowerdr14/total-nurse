
import React, { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  height?: string | number;
}

const RichEditor: React.FC<RichEditorProps> = ({ value, onChange, className, placeholder, height }) => {
  const editorId = React.useId().replace(/:/g, '');

  useEffect(() => {
    const editorElement = document.querySelector(`#editor-${editorId} .ql-editor`);
    if (editorElement) {
      editorElement.setAttribute('spellcheck', 'false');
    }
  }, [editorId]);

  return (
    <div id={`editor-${editorId}`} className={`rich-editor-container ${className}`}>
      <ReactQuill 
        theme="snow" 
        value={value || ''} 
        onChange={onChange} 
        placeholder={placeholder}
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
          ],
        }}
      />
      <style>{`
        .rich-editor-container .ql-container {
          min-height: ${height || '100px'};
          font-family: inherit;
          font-size: 14px;
        }
        .rich-editor-container .ql-editor {
          min-height: ${height || '100px'};
        }
        .rich-editor-container .ql-toolbar {
          border-color: #d1d5db;
          background: #f9fafb;
          padding: 4px;
        }
        .rich-editor-container .ql-container {
          border-color: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default RichEditor;
