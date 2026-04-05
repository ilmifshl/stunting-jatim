'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  List, ListOrdered, Heading1, Heading2, 
  Quote, Undo, Redo, Link as LinkIcon, Unlink
} from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('URL link:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 mb-2 bg-gray-50 border border-gray-100 rounded-2xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-xl transition-all ${editor.isActive('bold') ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-white hover:text-orange-600'}`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-xl transition-all ${editor.isActive('italic') ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-white hover:text-orange-600'}`}
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded-xl transition-all ${editor.isActive('underline') ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-white hover:text-orange-600'}`}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded-xl transition-all ${editor.isActive('heading', { level: 1 }) ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-white hover:text-orange-600'}`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded-xl transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-white hover:text-orange-600'}`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-xl transition-all ${editor.isActive('bulletList') ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-white hover:text-orange-600'}`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-xl transition-all ${editor.isActive('orderedList') ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-white hover:text-orange-600'}`}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded-xl transition-all ${editor.isActive('blockquote') ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-white hover:text-orange-600'}`}
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
      <button
        type="button"
        onClick={addLink}
        className={`p-2 rounded-xl transition-all ${editor.isActive('link') ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-white hover:text-orange-600'}`}
        title="Link"
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive('link')}
        className={`p-2 rounded-xl transition-all ${!editor.isActive('link') ? 'text-gray-300' : 'text-gray-500 hover:bg-white hover:text-red-500'}`}
        title="Remove Link"
      >
        <Unlink className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-6 bg-gray-200 mx-1 self-center ml-auto" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="p-2 rounded-xl text-gray-500 hover:bg-white transition-all shadow-sm"
        title="Undo"
      >
        <Undo className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="p-2 rounded-xl text-gray-500 hover:bg-white transition-all shadow-sm"
        title="Redo"
      >
        <Redo className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-orange-600 underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Tulis isi artikel dengan format yang rapi...',
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm md:prose-base focus:outline-none max-w-none min-h-[300px] max-h-[500px] overflow-y-auto px-5 py-4 bg-gray-50 border border-gray-200 rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-gray-700 leading-relaxed',
      },
    },
  });

  return (
    <div className="tiptap-editor-container">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror {
            outline: none !important;
        }
      `}</style>
    </div>
  );
}
