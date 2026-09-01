import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import './TipTapEditor.css';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

export default function TipTapEditor({ content, onChange, editable = true }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="tipap-editor">
      {editable && (
        <div className="tipap-toolbar">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`tipap-button ${editor.isActive('bold') ? 'is-active' : ''}`}
            type="button"
            title="Negrita"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`tipap-button ${editor.isActive('italic') ? 'is-active' : ''}`}
            type="button"
            title="Cursiva"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`tipap-button ${editor.isActive('bulletList') ? 'is-active' : ''}`}
            type="button"
            title="Lista con viñetas"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`tipap-button ${editor.isActive('orderedList') ? 'is-active' : ''}`}
            type="button"
            title="Lista numerada"
          >
            <ListOrdered size={16} />
          </button>
          <div className="tipap-divider" />
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`tipap-button ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
            type="button"
            title="Alinear izquierda"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`tipap-button ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
            type="button"
            title="Centrar"
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`tipap-button ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
            type="button"
            title="Alinear derecha"
          >
            <AlignRight size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`tipap-button ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`}
            type="button"
            title="Justificar"
          >
            <AlignJustify size={16} />
          </button>
        </div>
      )}
      <div className="ProseMirror-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
