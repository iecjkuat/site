/**
 * CMS Editors Module
 * Handles rich text editors (Quill) initialization and management
 */

export class CMSEditors {
    constructor() {
        this.editors = new Map();
        this.defaultConfig = {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                ]
            }
        };
    }

    async initEditor(containerId, placeholder = 'Enter content...', config = {}) {
        if (this.editors.has(containerId)) {
            return this.editors.get(containerId);
        }

        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Editor container ${containerId} not found`);
        }

        // Wait for Quill to be available
        if (typeof Quill === 'undefined') {
            await this.loadQuill();
        }

        const editorConfig = {
            ...this.defaultConfig,
            placeholder,
            ...config
        };

        const editor = new Quill(`#${containerId}`, editorConfig);
        this.editors.set(containerId, editor);
        
        // Add event listeners
        this.setupEditorEvents(editor, containerId);
        
        return editor;
    }

    async loadQuill() {
        return new Promise((resolve, reject) => {
            if (typeof Quill !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.quilljs.com/1.3.6/quill.min.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Quill editor'));
            document.head.appendChild(script);

            // Also load CSS if not present
            if (!document.querySelector('link[href*="quill"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
                document.head.appendChild(link);
            }
        });
    }

    setupEditorEvents(editor, containerId) {
        // Auto-save functionality
        let saveTimeout;
        editor.on('text-change', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.autoSave(containerId);
            }, 2000);
        });

        // Word count
        editor.on('text-change', () => {
            this.updateWordCount(containerId);
        });
    }

    autoSave(containerId) {
        const content = this.getContent(containerId);
        if (content && content.trim() !== '<p><br></p>') {
            localStorage.setItem(`cms_draft_${containerId}`, content);
            console.log(`Auto-saved draft for ${containerId}`);
        }
    }

    loadDraft(containerId) {
        const draft = localStorage.getItem(`cms_draft_${containerId}`);
        if (draft) {
            const editor = this.editors.get(containerId);
            if (editor) {
                editor.root.innerHTML = draft;
                return true;
            }
        }
        return false;
    }

    clearDraft(containerId) {
        localStorage.removeItem(`cms_draft_${containerId}`);
    }

    updateWordCount(containerId) {
        const editor = this.editors.get(containerId);
        if (!editor) return;

        const text = editor.getText();
        const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        
        // Update word count display if element exists
        const countEl = document.getElementById(`${containerId}-word-count`);
        if (countEl) {
            countEl.textContent = `${wordCount} words`;
        }
    }

    getEditor(containerId) {
        return this.editors.get(containerId);
    }

    getContent(containerId) {
        const editor = this.editors.get(containerId);
        if (!editor) {
            throw new Error(`Editor ${containerId} not initialized`);
        }
        
        const content = editor.root.innerHTML;
        if (!content || content.trim() === '<p><br></p>') {
            return '';
        }
        
        return content;
    }

    getText(containerId) {
        const editor = this.editors.get(containerId);
        if (!editor) {
            throw new Error(`Editor ${containerId} not initialized`);
        }
        
        return editor.getText().trim();
    }

    setContent(containerId, content) {
        const editor = this.editors.get(containerId);
        if (editor) {
            editor.root.innerHTML = content;
        }
    }

    clearContent(containerId) {
        const editor = this.editors.get(containerId);
        if (editor) {
            editor.setContents([]);
            this.clearDraft(containerId);
        }
    }

    focus(containerId) {
        const editor = this.editors.get(containerId);
        if (editor) {
            editor.focus();
        }
    }

    disable(containerId) {
        const editor = this.editors.get(containerId);
        if (editor) {
            editor.disable();
        }
    }

    enable(containerId) {
        const editor = this.editors.get(containerId);
        if (editor) {
            editor.enable();
        }
    }

    destroy(containerId) {
        const editor = this.editors.get(containerId);
        if (editor) {
            this.clearDraft(containerId);
            this.editors.delete(containerId);
        }
    }

    destroyAll() {
        this.editors.forEach((editor, containerId) => {
            this.destroy(containerId);
        });
    }

    // Utility methods for content validation
    validateContent(containerId, minLength = 10) {
        const text = this.getText(containerId);
        const errors = [];

        if (text.length < minLength) {
            errors.push(`Content must be at least ${minLength} characters long`);
        }

        return errors;
    }

    getContentStats(containerId) {
        const editor = this.editors.get(containerId);
        if (!editor) return null;

        const text = editor.getText();
        const html = editor.root.innerHTML;
        
        return {
            characters: text.length,
            words: text.trim().split(/\s+/).filter(word => word.length > 0).length,
            paragraphs: html.split('<p>').length - 1,
            readingTime: Math.ceil(text.split(/\s+/).length / 200) // Assuming 200 WPM
        };
    }
}