<script lang="ts">
import type { JSONContent } from '@tiptap/core';
import type { Slice } from '@tiptap/pm/model';
import type { EditorEvents } from '@tiptap/vue-3';

export { type Slice, type EditorEvents };
</script>

<script lang="ts" setup>
// Tiptap + docx + mammoth

import { computed, ref, watch } from 'vue';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Highlight from '@tiptap/extension-highlight';
import {
  Color,
  FontFamily,
  FontSize,
  TextStyle
} from '@tiptap/extension-text-style';
import mammoth from 'mammoth';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  Table as DocxTable,
  TableCell as DocxTableCell,
  TableRow as DocxTableRow,
  TextRun,
  WidthType,
  type FileChild,
  type IRunOptions,
  type ParagraphChild
} from 'docx';

defineOptions({
  inheritAttrs: false
});

// 這三個 type 是 POC 自己用的資料形狀：歷程、匯入訊息、工具列按鈕。
type RevisionEntry = {
  id: string;
  userName: string;
  actionName: string;
  html: string;
  createdAt: string;
  textLength: number;
};

type ImportMessage = {
  id: string;
  type: string;
  message: string;
};

type ToolbarButton = {
  key: string;
  label: string;
  title: string;
  action: () => void;
  isActive?: () => boolean;
};

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    statusPanel?: boolean;
  }>(),
  {
    modelValue: `
      <h1>我的線上 Word POC</h1>
      <p>這份元件用 Tiptap 編輯、mammoth 匯入 docx、docx 匯出 Word。請從上方工具列測試字型、表格、圖片、縮排與多層清單。</p>
      <h2>第 1 章 範例章節</h2>
      <ol>
        <li>第一層：一、二、三
          <ol>
            <li>第二層：(一)、(二)、(三)
              <ol>
                <li>第三層：1、2、3
                  <ol>
                    <li>第四層：(1)、(2)、(3)</li>
                  </ol>
                </li>
              </ol>
            </li>
          </ol>
        </li>
      </ol>
      <p>新增章節按鈕會插入下一個章節標題與多層清單範本。</p>
    `,
    statusPanel: false
  }
);

// 保留原本元件的事件介面，讓外層頁面之後仍可監聽 Tiptap 的生命週期與內容變更。
const emits = defineEmits<{
  'update:modelValue': [value: string];
  change: [
    params: EditorEvents['update'],
    editor: EditorEvents['update']['editor']
  ];
  'change:html': [value: string];
  'change:json': [value: JSONContent];
  tiptapBeforeCreate: [params: EditorEvents['beforeCreate']];
  tiptapOnCreate: [params: EditorEvents['create']];
  tiptapOnUpdate: [params: EditorEvents['update']];
  tiptapOnSelectionUpdate: [params: EditorEvents['selectionUpdate']];
  tiptapOnTransaction: [params: EditorEvents['transaction']];
  tiptapOnFocus: [params: EditorEvents['focus']];
  tiptapOnBlur: [params: EditorEvents['blur']];
  tiptapOnDestroy: [];
  tiptapOnPaste: [event: ClipboardEvent, slice: Slice];
  tiptapOnDrop: [event: DragEvent, slice: Slice, moved: boolean];
  tiptapOnDelete: [params: EditorEvents['delete']];
  tiptapOnContentError: [params: EditorEvents['contentError']];
}>();

// 編輯器 UI 狀態。這些 ref 只影響 POC 畫面，不會直接寫進 Word 檔。
const activeUserName = ref<string>('Parker');
const newUserName = ref<string>('');
const editorStatus = ref<string>('準備就緒');
const importMessages = ref<ImportMessage[]>([]);
const revisionEntries = ref<RevisionEntry[]>([]);
const docxInputElement = ref<HTMLInputElement | null>(null);
const imageInputElement = ref<HTMLInputElement | null>(null);
const selectedFontFamily = ref<string>('Arial');
const selectedFontSize = ref<string>('16px');
const selectedColor = ref<string>('#111827');
const selectedHighlight = ref<string>('#fef3c7');
const isReadOnlyMode = ref<boolean>(false);
const revisionSerial = ref<number>(0);

// 工具列選項先用固定陣列示範；正式產品可改成後端設定或設計系統常數。
const userNames = ref<string[]>(['Parker', 'Reviewer A', 'Reviewer B']);
const fontFamilies = [
  'Arial',
  'Times New Roman',
  'Noto Sans TC',
  'Microsoft JhengHei',
  'PMingLiU'
];
const fontSizes = ['12px', '14px', '16px', '18px', '24px', '32px'];
const colorOptions = ['#111827', '#1d4ed8', '#be123c', '#047857', '#7c2d12'];
const highlightOptions = [
  '#fef3c7',
  '#dbeafe',
  '#dcfce7',
  '#fee2e2',
  '#f3e8ff'
];

// Tiptap 的核心入口。extensions 決定編輯器支援哪些節點、mark、command 與 schema。
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    // StarterKit 內含段落、標題、粗斜體、清單、undo/redo 等基本能力。
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3]
      }
    }),
    // TextStyle 系列讓文字能帶 inline style，例如字型、字級、字色。
    TextStyle,
    Color,
    FontFamily,
    FontSize,
    // Highlight 需要 multicolor，工具列才能切換不同標記顏色。
    Highlight.configure({
      multicolor: true
    }),
    // TextAlign 只套在 heading/paragraph，避免表格或圖片節點拿到不適合的屬性。
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
    // 圖片先允許 base64，方便本機插圖與 mammoth 匯入圖片直接進編輯器。
    Image.configure({
      allowBase64: true,
      inline: false
    }),
    // Tiptap 表格要同時註冊 Table / Row / Header / Cell 才能正常編輯。
    Table.configure({
      resizable: true
    }),
    TableRow,
    TableHeader,
    TableCell
  ],

  // 以下事件主要是把 Tiptap 內部事件往外拋，並更新 POC 狀態與歷程。
  onBeforeCreate(params) {
    emits('tiptapBeforeCreate', params);
  },
  onCreate(params) {
    if (props.statusPanel === true) {
      editorStatus.value = '編輯器已建立';
    }
    recordRevision('建立文件');
    emits('tiptapOnCreate', params);
  },
  onUpdate(params) {
    const newHtml = params.editor.getHTML();
    const newJson = params.editor.getJSON();

    if (props.statusPanel === true) {
      editorStatus.value = '內容已更新';
    }
    recordRevision('編輯內容');
    emits('tiptapOnUpdate', params);
    emits('update:modelValue', newHtml);
    emits('change:html', newHtml);
    emits('change:json', newJson);
    emits('change', params, params.editor);
  },
  onSelectionUpdate(params) {
    emits('tiptapOnSelectionUpdate', params);
  },
  onTransaction(params) {
    emits('tiptapOnTransaction', params);
  },
  onFocus(params) {
    if (props.statusPanel === true) {
      editorStatus.value = '編輯中';
    }
    emits('tiptapOnFocus', params);
  },
  onBlur(params) {
    if (props.statusPanel === true) {
      editorStatus.value = '已離開編輯區';
    }
    emits('tiptapOnBlur', params);
  },
  onDestroy() {
    emits('tiptapOnDestroy');
  },
  onPaste(event: ClipboardEvent, slice: Slice) {
    emits('tiptapOnPaste', event, slice);
  },
  onDrop(event: DragEvent, slice: Slice, moved: boolean) {
    emits('tiptapOnDrop', event, slice, moved);
  },
  onDelete(params) {
    emits('tiptapOnDelete', params);
  },
  onContentError(params) {
    if (props.statusPanel === true) {
      editorStatus.value = '內容格式不符合 schema';
    }
    emits('tiptapOnContentError', params);
  }
});

const canUndo = computed<boolean>(() => editor.value?.can().undo() === true);
const canRedo = computed<boolean>(() => editor.value?.can().redo() === true);

// 文字 mark 與清單按鈕用同一份設定產生，避免模板塞滿重複的 button。
const toolbarButtons = computed<ToolbarButton[]>(() => [
  {
    key: 'bold',
    label: 'B',
    title: '粗體',
    action: () => editor.value?.chain().focus().toggleBold().run(),
    isActive: () => editor.value?.isActive('bold') === true
  },
  {
    key: 'italic',
    label: 'I',
    title: '斜體',
    action: () => editor.value?.chain().focus().toggleItalic().run(),
    isActive: () => editor.value?.isActive('italic') === true
  },
  {
    key: 'underline',
    label: 'U',
    title: '底線',
    action: () => editor.value?.chain().focus().toggleUnderline().run(),
    isActive: () => editor.value?.isActive('underline') === true
  },
  {
    key: 'strike',
    label: 'S',
    title: '刪除線',
    action: () => editor.value?.chain().focus().toggleStrike().run(),
    isActive: () => editor.value?.isActive('strike') === true
  },
  {
    key: 'h1',
    label: 'H1',
    title: '標題一',
    action: () =>
      editor.value?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => editor.value?.isActive('heading', { level: 1 }) === true
  },
  {
    key: 'h2',
    label: 'H2',
    title: '標題二',
    action: () =>
      editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => editor.value?.isActive('heading', { level: 2 }) === true
  },
  {
    key: 'ordered_list',
    label: 'OL',
    title: '多層次編號清單',
    action: () => editor.value?.chain().focus().toggleOrderedList().run(),
    isActive: () => editor.value?.isActive('orderedList') === true
  },
  {
    key: 'bullet_list',
    label: 'UL',
    title: '項目符號清單',
    action: () => editor.value?.chain().focus().toggleBulletList().run(),
    isActive: () => editor.value?.isActive('bulletList') === true
  }
]);

watch(
  () => props.modelValue,
  (newModelValue) => {
    // 外層 v-model 改變時同步回 Tiptap；相同 HTML 不重設，避免游標跳動。
    if (
      editor.value !== undefined &&
      newModelValue !== editor.value.getHTML()
    ) {
      editor.value.commands.setContent(newModelValue);
    }
  }
);

watch(isReadOnlyMode, (newIsReadOnlyMode) => {
  // setEditable 是 Tiptap 內建的整份文件可編輯開關；局部鎖定要另外寫 extension。
  editor.value?.setEditable(newIsReadOnlyMode !== true);
  if (props.statusPanel === true) {
    editorStatus.value = newIsReadOnlyMode
      ? '已切換為唯讀模式'
      : '已切換為可編輯模式';
  }
});

function getToolButtonClass(key: string): string {
  return `tiptap_doc_editor-tool_button_${key}`;
}

function getHistoryItemClass(id: string): string {
  return `tiptap_doc_editor-history_item_${id}`;
}

function getImportMessageClass(id: string): string {
  return `tiptap_doc_editor-import_message_${id}`;
}

function addUserName(): void {
  const trimmedUserName = newUserName.value.trim();

  if (
    trimmedUserName !== '' &&
    userNames.value.includes(trimmedUserName) !== true
  ) {
    userNames.value = [...userNames.value, trimmedUserName];
  }

  if (trimmedUserName !== '') {
    activeUserName.value = trimmedUserName;
  }

  newUserName.value = '';
}

function recordRevision(actionName: string): void {
  if (editor.value === undefined) {
    return;
  }

  revisionSerial.value += 1;
  const html = editor.value.getHTML();

  // 這裡先做前端記憶體版歷程。正式多人協作要改存後端，並記錄 diff 或 transaction。
  revisionEntries.value = [
    {
      id: `revision_${revisionSerial.value}`,
      userName: activeUserName.value,
      actionName,
      html,
      createdAt: new Date().toLocaleString('zh-TW'),
      textLength: editor.value.getText().length
    },
    ...revisionEntries.value
  ].slice(0, 30);
}

function openDocxPicker(): void {
  docxInputElement.value?.click();
}

function openImagePicker(): void {
  imageInputElement.value?.click();
}

async function importDocxFile(event: Event): Promise<void> {
  // 檔案 input 的 event target 在 Vue/DOM 型別中較寬，這裡確認來源就是 HTMLInputElement。
  const inputElement = event.target as unknown as HTMLInputElement;
  const selectedFile = inputElement.files?.[0];

  if (selectedFile === undefined) {
    return;
  }

  editorStatus.value = '正在匯入 Word';
  const arrayBuffer = await selectedFile.arrayBuffer();
  // mammoth 負責把 docx 解成 HTML；它偏重內容語意，不能保證完整保留 Word 版面。
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      // 將 Word 內嵌圖片轉成 data URL，讓 Tiptap Image extension 可以立即顯示。
      convertImage: mammoth.images.imgElement(async (image) => {
        const base64String = await image.readAsBase64String();

        return {
          src: `data:${image.contentType};base64,${base64String}`
        };
      }),
      styleMap: [
        // 常見 Word 樣式對應到 HTML heading，方便 Tiptap 以標題節點編輯。
        "p[style-name='Title'] => h1:fresh",
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh"
      ]
    }
  );

  importMessages.value = result.messages.map((message, index) => ({
    id: `message_${Date.now()}_${index}`,
    type: message.type,
    message:
      message.type === 'error'
        ? `${message.message}: ${String(message.error)}`
        : message.message
  }));

  // mammoth 輸出的 HTML 直接交給 Tiptap setContent，等於完成「開啟 Word」。
  editor.value?.commands.setContent(result.value);
  editorStatus.value = `已匯入 ${selectedFile.name}`;
  revisionEntries.value = [];
  recordRevision(`匯入 ${selectedFile.name}`);
  inputElement.value = '';
}

async function insertImageFile(event: Event): Promise<void> {
  // 本機圖片先轉成 data URL，POC 不需要上傳伺服器也能插入與匯出。
  const inputElement = event.target as unknown as HTMLInputElement;
  const selectedFile = inputElement.files?.[0];

  if (selectedFile === undefined) {
    return;
  }

  const dataUrl = await readFileAsDataUrl(selectedFile);
  editor.value
    ?.chain()
    .focus()
    .setImage({ src: dataUrl, alt: selectedFile.name })
    .run();
  editorStatus.value = `已插入圖片 ${selectedFile.name}`;
  recordRevision(`插入圖片 ${selectedFile.name}`);
  inputElement.value = '';
}

function readFileAsDataUrl(file: File): Promise<string> {
  // FileReader 是瀏覽器 API，將圖片讀成 base64 data URL。
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('圖片讀取結果不是 data URL'));
    });

    reader.addEventListener('error', () => {
      reject(new Error('圖片讀取失敗'));
    });

    reader.readAsDataURL(file);
  });
}

function applyFontFamily(): void {
  // Tiptap command 常見寫法：chain() 串命令、focus() 回到編輯器、run() 執行。
  editor.value?.chain().focus().setFontFamily(selectedFontFamily.value).run();
}

function applyFontSize(): void {
  editor.value?.chain().focus().setFontSize(selectedFontSize.value).run();
}

function applyTextColor(): void {
  editor.value?.chain().focus().setColor(selectedColor.value).run();
}

function applyHighlightColor(): void {
  editor.value
    ?.chain()
    .focus()
    .toggleHighlight({ color: selectedHighlight.value })
    .run();
}

function setTextAlign(
  alignment: 'left' | 'center' | 'right' | 'justify'
): void {
  editor.value?.chain().focus().setTextAlign(alignment).run();
}

function indentList(): void {
  // sinkListItem / liftListItem 是 ProseMirror 清單縮排；只在游標位於 listItem 時可用。
  if (editor.value?.can().sinkListItem('listItem') === true) {
    editor.value.chain().focus().sinkListItem('listItem').run();
    return;
  }

  editor.value?.chain().focus().setParagraph().run();
}

function outdentList(): void {
  if (editor.value?.can().liftListItem('listItem') === true) {
    editor.value.chain().focus().liftListItem('listItem').run();
    return;
  }

  editor.value?.chain().focus().setParagraph().run();
}

function insertTable(): void {
  // insertTable 來自 Table extension；withHeaderRow 會產生 th 表頭列。
  editor.value
    ?.chain()
    .focus()
    .insertTable({ rows: 3, cols: 4, withHeaderRow: true })
    .run();
  editorStatus.value = '已插入 3x4 表格';
  recordRevision('插入表格');
}

function addTableColumn(): void {
  editor.value?.chain().focus().addColumnAfter().run();
}

function addTableRow(): void {
  editor.value?.chain().focus().addRowAfter().run();
}

function deleteTable(): void {
  editor.value?.chain().focus().deleteTable().run();
}

function addChapterTemplate(): void {
  if (editor.value === undefined) {
    return;
  }

  const nextChapterNumber = getNextChapterNumber();
  const documentEndPosition = editor.value.state.doc.content.size;
  const chapterTemplate = `
    <h2>第 ${nextChapterNumber} 章 新增章節</h2>
    <p>請輸入本章摘要。</p>
    <ol>
      <li>本章重點</li>
      <li>待補事項</li>
    </ol>
  `;

  // 固定追加到文件尾端，避免游標在清單內時把新章節插進既有清單而造成縮排暴走。
  editor.value
    .chain()
    .focus()
    .insertContentAt(documentEndPosition, chapterTemplate)
    .run();

  editorStatus.value = `已新增第 ${nextChapterNumber} 章`;
  recordRevision(`新增第 ${nextChapterNumber} 章`);
}

function getNextChapterNumber(): number {
  // POC 先用 HTML 文字掃描「第 N 章」。正式產品可改存章節 node attribute 更穩。
  const html = editor.value?.getHTML() ?? '';
  const matches = html.match(/第\s*\d+\s*章/g);

  if (matches === null) {
    return 1;
  }

  return matches.length + 1;
}

async function exportDocxFile(): Promise<void> {
  if (editor.value === undefined) {
    return;
  }

  editorStatus.value = '正在產生 Word';

  // docx 套件不能直接吃 Tiptap HTML，所以先用 DOMParser 解析，再轉成 docx nodes。
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(
    editor.value.getHTML(),
    'text/html'
  );
  const children = htmlNodesToDocxChildren(
    Array.from(parsedDocument.body.children),
    0
  );

  const documentFile = new Document({
    creator: 'parker-vue-lab',
    title: 'Tiptap Word POC',
    description: 'Tiptap + mammoth + docx proof of concept',
    numbering: {
      config: [
        {
          reference: 'zh-multilevel-list',
          // Word 多層清單設定：每一層定義格式、顯示文字與縮排。
          levels: [
            {
              level: 0,
              format: LevelFormat.CHINESE_COUNTING,
              text: '%1、',
              alignment: AlignmentType.START,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } }
            },
            {
              level: 1,
              format: LevelFormat.CHINESE_COUNTING,
              text: '(%2)',
              alignment: AlignmentType.START,
              style: { paragraph: { indent: { left: 1440, hanging: 360 } } }
            },
            {
              level: 2,
              format: LevelFormat.DECIMAL,
              text: '%3、',
              alignment: AlignmentType.START,
              style: { paragraph: { indent: { left: 2160, hanging: 360 } } }
            },
            {
              level: 3,
              format: LevelFormat.DECIMAL_ENCLOSED_PARENTHESES,
              text: '%4',
              alignment: AlignmentType.START,
              style: { paragraph: { indent: { left: 2880, hanging: 360 } } }
            }
          ]
        }
      ]
    },
    sections: [
      {
        properties: {},
        children: children.length > 0 ? children : [new Paragraph('空白文件')]
      }
    ]
  });

  // Packer.toBlob 產出瀏覽器可下載的 .docx，再用暫時 a 標籤觸發下載。
  const blob = await Packer.toBlob(documentFile);
  const url = URL.createObjectURL(blob);
  const anchorElement = document.createElement('a');

  anchorElement.href = url;
  anchorElement.download = `tiptap-word-poc-${Date.now()}.docx`;
  anchorElement.click();
  URL.revokeObjectURL(url);
  editorStatus.value = 'Word 已另存';
  recordRevision('另存 Word');
}

// 以下是一組「HTML -> docx」轉換器。POC 只處理常見節點，複雜 Word 版面仍需擴充。
function htmlNodesToDocxChildren(
  elements: Element[],
  listLevel: number
): FileChild[] {
  return elements.flatMap((element) =>
    htmlElementToDocxChildren(element, listLevel)
  );
}

function htmlElementToDocxChildren(
  element: Element,
  listLevel: number
): FileChild[] {
  const tagName = element.tagName.toLowerCase();

  // block-level HTML 轉成 docx 的 FileChild，例如 Paragraph 或 Table。
  if (tagName === 'h1') {
    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: htmlInlineChildrenToRuns(element)
      })
    ];
  }

  if (tagName === 'h2') {
    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: htmlInlineChildrenToRuns(element)
      })
    ];
  }

  if (tagName === 'h3') {
    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: htmlInlineChildrenToRuns(element)
      })
    ];
  }

  if (tagName === 'p') {
    return [new Paragraph({ children: htmlInlineChildrenToRuns(element) })];
  }

  if (tagName === 'ol') {
    return htmlOrderedListToDocxChildren(element, listLevel);
  }

  if (tagName === 'ul') {
    return htmlUnorderedListToDocxChildren(element, listLevel);
  }

  if (tagName === 'table') {
    return [htmlTableToDocxTable(element)];
  }

  if (tagName === 'blockquote') {
    return [
      new Paragraph({
        children: htmlInlineChildrenToRuns(element),
        indent: { left: 720 }
      })
    ];
  }

  if (tagName === 'img') {
    const imageRun = htmlImageElementToRun(element);

    return imageRun === null ? [] : [new Paragraph({ children: [imageRun] })];
  }

  return [new Paragraph({ children: htmlInlineChildrenToRuns(element) })];
}

function htmlOrderedListToDocxChildren(
  element: Element,
  listLevel: number
): FileChild[] {
  // ordered list 會套用上方 Document.numbering 裡的 zh-multilevel-list 設定。
  return Array.from(element.children).flatMap((childElement) => {
    if (childElement.tagName.toLowerCase() !== 'li') {
      return htmlElementToDocxChildren(childElement, listLevel);
    }

    const paragraphRuns = htmlListItemToRuns(childElement);
    const nestedLists = Array.from(childElement.children).filter(
      (nestedElement) => {
        const nestedTagName = nestedElement.tagName.toLowerCase();

        return nestedTagName === 'ol' || nestedTagName === 'ul';
      }
    );

    return [
      new Paragraph({
        children: paragraphRuns,
        numbering: {
          reference: 'zh-multilevel-list',
          level: Math.min(listLevel, 3)
        }
      }),
      ...nestedLists.flatMap((nestedElement) =>
        htmlElementToDocxChildren(nestedElement, listLevel + 1)
      )
    ];
  });
}

function htmlUnorderedListToDocxChildren(
  element: Element,
  listLevel: number
): FileChild[] {
  // bullet list 使用 docx 內建 bullet；本 POC 主要驗證中文 ordered list。
  return Array.from(element.children).flatMap((childElement) => {
    if (childElement.tagName.toLowerCase() !== 'li') {
      return htmlElementToDocxChildren(childElement, listLevel);
    }

    return [
      new Paragraph({
        children: htmlListItemToRuns(childElement),
        bullet: {
          level: Math.min(listLevel, 3)
        }
      })
    ];
  });
}

function htmlListItemToRuns(element: Element): ParagraphChild[] {
  // list item 的文字與巢狀清單要分開處理，否則子清單文字會被合併到同一段。
  const inlineNodes = Array.from(element.childNodes).filter((childNode) => {
    if (childNode.nodeType === Node.ELEMENT_NODE) {
      const nestedElement = childNode as unknown as Element;
      const nestedTagName = nestedElement.tagName.toLowerCase();

      return nestedTagName !== 'ol' && nestedTagName !== 'ul';
    }

    return true;
  });

  return htmlInlineNodesToRuns(inlineNodes);
}

function htmlTableToDocxTable(element: Element): DocxTable {
  // HTML table 逐列逐格轉成 docx TableRow / TableCell。
  const rowElements = Array.from(element.querySelectorAll('tr'));

  return new DocxTable({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE
    },
    rows: rowElements.map((rowElement) => {
      const cellElements = Array.from(rowElement.children);

      return new DocxTableRow({
        children: cellElements.map((cellElement) => {
          const paragraphChildren = htmlInlineChildrenToRuns(cellElement);

          return new DocxTableCell({
            children: [
              new Paragraph({
                children:
                  paragraphChildren.length > 0
                    ? paragraphChildren
                    : [new TextRun('')]
              })
            ]
          });
        })
      });
    })
  });
}

function htmlInlineChildrenToRuns(element: Element): ParagraphChild[] {
  return htmlInlineNodesToRuns(Array.from(element.childNodes));
}

function htmlInlineNodesToRuns(nodes: ChildNode[]): ParagraphChild[] {
  // inline 節點最後都會變成 TextRun 或 ImageRun，這是 docx paragraph 的子節點。
  const runs = nodes.flatMap((childNode) => htmlNodeToRuns(childNode, {}));

  return runs.length > 0 ? runs : [new TextRun('')];
}

function htmlNodeToRuns(
  node: ChildNode,
  inheritedOptions: IRunOptions
): ParagraphChild[] {
  // 遞迴繼承粗體、斜體、字型等樣式，避免 <strong><em>文字</em></strong> 遺失格式。
  if (node.nodeType === Node.TEXT_NODE) {
    const textContent = node.textContent ?? '';

    return textContent !== ''
      ? [new TextRun({ ...inheritedOptions, text: textContent })]
      : [];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  const element = node as unknown as HTMLElement;
  const tagName = element.tagName.toLowerCase();

  if (tagName === 'br') {
    return [new TextRun({ text: '', break: 1 })];
  }

  if (tagName === 'img') {
    const imageRun = htmlImageElementToRun(element);

    return imageRun === null ? [] : [imageRun];
  }

  const nextOptions: IRunOptions = {
    ...inheritedOptions,
    bold:
      inheritedOptions.bold === true || tagName === 'strong' || tagName === 'b',
    italics:
      inheritedOptions.italics === true || tagName === 'em' || tagName === 'i',
    underline: tagName === 'u' ? {} : inheritedOptions.underline,
    strike:
      inheritedOptions.strike === true ||
      tagName === 's' ||
      tagName === 'strike',
    color: normalizeCssColor(element.style.color) ?? inheritedOptions.color,
    font:
      element.style.fontFamily !== ''
        ? element.style.fontFamily
        : inheritedOptions.font,
    size:
      cssFontSizeToHalfPoints(element.style.fontSize) ?? inheritedOptions.size
  };

  return Array.from(element.childNodes).flatMap((childNode) =>
    htmlNodeToRuns(childNode, nextOptions)
  );
}

function htmlImageElementToRun(element: Element): ImageRun | null {
  // docx 只能寫入實際圖片資料；外部 URL 圖片在此 POC 先不轉換。
  const src = element.getAttribute('src');

  if (src === null || src.startsWith('data:image/') !== true) {
    return null;
  }

  const imageData = dataUrlToImageData(src);

  if (imageData === null) {
    return null;
  }

  return new ImageRun({
    type: imageData.type,
    data: imageData.data,
    transformation: {
      width: 420,
      height: 260
    }
  });
}

function dataUrlToImageData(
  dataUrl: string
): { type: 'jpg' | 'png' | 'gif' | 'bmp'; data: Uint8Array } | null {
  // 將 data URL 拆成圖片格式與二進位資料，供 docx ImageRun 使用。
  const match = /^data:image\/(png|jpeg|jpg|gif|bmp);base64,(.+)$/.exec(
    dataUrl
  );

  if (match === null) {
    return null;
  }

  const imageType = match[1] === 'jpeg' ? 'jpg' : match[1];
  const base64Data = match[2];

  if (
    (imageType === 'jpg' ||
      imageType === 'png' ||
      imageType === 'gif' ||
      imageType === 'bmp') &&
    base64Data !== undefined
  ) {
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);

    for (let index = 0; index < binaryString.length; index += 1) {
      bytes[index] = binaryString.charCodeAt(index);
    }

    return {
      type: imageType,
      data: bytes
    };
  }

  return null;
}

function normalizeCssColor(color: string): string | undefined {
  // docx 色碼不需要 #，且此 POC 只處理已經是 hex 的 CSS color。
  if (color === '') {
    return undefined;
  }

  if (color.startsWith('#')) {
    return color.replace('#', '');
  }

  return undefined;
}

function cssFontSizeToHalfPoints(fontSize: string): number | undefined {
  // docx 的 size 單位是 half-points；16px 約等於 12pt，也就是 24 half-points。
  if (fontSize.endsWith('px') !== true) {
    return undefined;
  }

  const parsedSize = Number.parseFloat(fontSize.replace('px', ''));

  if (Number.isFinite(parsedSize) !== true) {
    return undefined;
  }

  return Math.round(parsedSize * 1.5);
}

defineExpose({
  editor
});
</script>

<template>
  <div class="tiptap_doc_editor">
    <!-- 上方工具列：集中放 Word 匯入/匯出、使用者、文字格式、表格與章節操作。 -->
    <section class="tiptap_doc_editor-toolbar">
      <!-- 真正的 file input 隱藏，按鈕只負責觸發檔案選擇視窗。 -->
      <div class="tiptap_doc_editor-toolbar_group_file">
        <input
          ref="docxInputElement"
          class="tiptap_doc_editor-docx_input"
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          @change="importDocxFile"
        />
        <input
          ref="imageInputElement"
          class="tiptap_doc_editor-image_input"
          type="file"
          accept="image/png,image/jpeg,image/gif,image/bmp"
          @change="insertImageFile"
        />
        <button
          class="tiptap_doc_editor-file_button_open"
          type="button"
          @click="openDocxPicker"
        >
          開啟 Word
        </button>
        <button
          class="tiptap_doc_editor-file_button_save"
          type="button"
          @click="exportDocxFile"
        >
          另存 Word
        </button>
        <button
          class="tiptap_doc_editor-file_button_image"
          type="button"
          @click="openImagePicker"
        >
          圖片
        </button>
      </div>

      <!-- POC 用使用者切換來模擬「不同人編輯歷程」。 -->
      <div class="tiptap_doc_editor-toolbar_group_user">
        <select
          v-model="activeUserName"
          class="tiptap_doc_editor-user_select"
          aria-label="目前使用者"
        >
          <option
            v-for="userName in userNames"
            :key="userName"
            :value="userName"
          >
            {{ userName }}
          </option>
        </select>
        <input
          v-model="newUserName"
          class="tiptap_doc_editor-user_input"
          type="text"
          placeholder="新增使用者"
          @keyup.enter="addUserName"
        />
        <button
          class="tiptap_doc_editor-user_button_add"
          type="button"
          @click="addUserName"
        >
          加入
        </button>
      </div>

      <!-- 文字樣式控制：這些 select 會呼叫 Tiptap TextStyle 相關 commands。 -->
      <div class="tiptap_doc_editor-toolbar_group_text">
        <select
          v-model="selectedFontFamily"
          class="tiptap_doc_editor-font_select"
          aria-label="字型"
          @change="applyFontFamily"
        >
          <option
            v-for="fontFamily in fontFamilies"
            :key="fontFamily"
            :value="fontFamily"
          >
            {{ fontFamily }}
          </option>
        </select>
        <select
          v-model="selectedFontSize"
          class="tiptap_doc_editor-size_select"
          aria-label="字體大小"
          @change="applyFontSize"
        >
          <option
            v-for="fontSize in fontSizes"
            :key="fontSize"
            :value="fontSize"
          >
            {{ fontSize }}
          </option>
        </select>
        <select
          v-model="selectedColor"
          class="tiptap_doc_editor-color_select"
          aria-label="字色"
          @change="applyTextColor"
        >
          <option
            v-for="colorOption in colorOptions"
            :key="colorOption"
            :value="colorOption"
          >
            {{ colorOption }}
          </option>
        </select>
        <select
          v-model="selectedHighlight"
          class="tiptap_doc_editor-highlight_select"
          aria-label="螢光標記"
          @change="applyHighlightColor"
        >
          <option
            v-for="highlightOption in highlightOptions"
            :key="highlightOption"
            :value="highlightOption"
          >
            {{ highlightOption }}
          </option>
        </select>
      </div>

      <!-- mark/heading/list 按鈕由 toolbarButtons 設定產生，active 狀態會反映目前游標格式。 -->
      <div class="tiptap_doc_editor-toolbar_group_marks">
        <button
          v-for="button in toolbarButtons"
          :key="button.key"
          :class="getToolButtonClass(button.key)"
          :title="button.title"
          :css-is-active="button.isActive?.() === true"
          type="button"
          @click="button.action"
        >
          {{ button.label }}
        </button>
      </div>

      <!-- 對齊與縮排：對齊套用 paragraph/heading，縮排主要針對 listItem。 -->
      <div class="tiptap_doc_editor-toolbar_group_layout">
        <button
          class="tiptap_doc_editor-align_button_left"
          type="button"
          title="靠左"
          @click="setTextAlign('left')"
        >
          左
        </button>
        <button
          class="tiptap_doc_editor-align_button_center"
          type="button"
          title="置中"
          @click="setTextAlign('center')"
        >
          中
        </button>
        <button
          class="tiptap_doc_editor-align_button_right"
          type="button"
          title="靠右"
          @click="setTextAlign('right')"
        >
          右
        </button>
        <button
          class="tiptap_doc_editor-align_button_justify"
          type="button"
          title="左右對齊"
          @click="setTextAlign('justify')"
        >
          齊
        </button>
        <button
          class="tiptap_doc_editor-indent_button_out"
          type="button"
          title="減少縮排"
          @click="outdentList"
        >
          減縮
        </button>
        <button
          class="tiptap_doc_editor-indent_button_in"
          type="button"
          title="增加縮排"
          @click="indentList"
        >
          增縮
        </button>
      </div>

      <!-- 表格操作：需要游標位於表格內時，加欄/加列/刪表格才會有效。 -->
      <div class="tiptap_doc_editor-toolbar_group_table">
        <button
          class="tiptap_doc_editor-table_button_insert"
          type="button"
          @click="insertTable"
        >
          插入表格
        </button>
        <button
          class="tiptap_doc_editor-table_button_column"
          type="button"
          @click="addTableColumn"
        >
          加欄
        </button>
        <button
          class="tiptap_doc_editor-table_button_row"
          type="button"
          @click="addTableRow"
        >
          加列
        </button>
        <button
          class="tiptap_doc_editor-table_button_delete"
          type="button"
          @click="deleteTable"
        >
          刪表格
        </button>
      </div>

      <!-- 文件層級操作：章節範本、undo/redo、整份文件唯讀切換。 -->
      <div class="tiptap_doc_editor-toolbar_group_document">
        <button
          class="tiptap_doc_editor-doc_button_chapter"
          type="button"
          @click="addChapterTemplate"
        >
          新增章節
        </button>
        <button
          class="tiptap_doc_editor-doc_button_undo"
          type="button"
          :disabled="canUndo !== true"
          @click="editor?.chain().focus().undo().run()"
        >
          復原
        </button>
        <button
          class="tiptap_doc_editor-doc_button_redo"
          type="button"
          :disabled="canRedo !== true"
          @click="editor?.chain().focus().redo().run()"
        >
          重做
        </button>
        <label class="tiptap_doc_editor-readonly_label">
          <input
            v-model="isReadOnlyMode"
            class="tiptap_doc_editor-readonly_checkbox"
            type="checkbox"
          />
          唯讀
        </label>
      </div>
    </section>

    <main class="tiptap_doc_editor-workspace">
      <!-- EditorContent 是 Tiptap 的 Vue 入口，實際 ProseMirror 可編輯區會掛在這裡。 -->
      <section class="tiptap_doc_editor-paper">
        <EditorContent class="tiptap_doc_editor-canvas" :editor="editor" />
      </section>

      <!-- 右側面板只做 POC 說明與觀察，不會影響文件內容。 -->
      <aside class="tiptap_doc_editor-side_panel">
        <section v-show="statusPanel" class="tiptap_doc_editor-status_panel">
          <h2 class="tiptap_doc_editor-status_title">編輯器狀態</h2>
          <p class="tiptap_doc_editor-status_text">{{ editorStatus }}</p>
          <ul class="tiptap_doc_editor-support_list">
            <li class="tiptap_doc_editor-support_item_import">
              Word 匯入：mammoth 轉 HTML，格式會以瀏覽器可編輯 HTML 為主。
            </li>
            <li class="tiptap_doc_editor-support_item_table">
              表格：Tiptap Table extension 可新增列欄與編輯內容。
            </li>
            <li class="tiptap_doc_editor-support_item_list">
              中文多層清單：畫面用 CSS counter，匯出用 docx numbering。
            </li>
            <li class="tiptap_doc_editor-support_item_region">
              可編輯區域：目前示範整份文件唯讀；局部保護需客製 Tiptap
              NodeView/extension。
            </li>
            <li class="tiptap_doc_editor-support_item_excel">
              內嵌 Excel/公式：Tiptap 不原生支援 OLE Excel；公式可另接 math
              extension 或以圖片/HTML 呈現。
            </li>
          </ul>
        </section>

        <section class="tiptap_doc_editor-history_panel">
          <h2 class="tiptap_doc_editor-history_title">
            使用者編輯歷程（*無法存入 docx檔）
          </h2>
          <ol class="tiptap_doc_editor-history_list">
            <li
              v-for="entry in revisionEntries"
              :key="entry.id"
              :class="getHistoryItemClass(entry.id)"
            >
              <strong class="tiptap_doc_editor-history_item_user">{{
                entry.userName
              }}</strong>
              <span class="tiptap_doc_editor-history_item_action">{{
                entry.actionName
              }}</span>
              <time class="tiptap_doc_editor-history_item_time">{{
                entry.createdAt
              }}</time>
              <span class="tiptap_doc_editor-history_item_length"
                >{{ entry.textLength }} 字</span
              >
            </li>
          </ol>
        </section>

        <section
          v-if="importMessages.length > 0"
          class="tiptap_doc_editor-import_panel"
        >
          <h2 class="tiptap_doc_editor-import_title">mammoth 訊息</h2>
          <ul class="tiptap_doc_editor-import_list">
            <li
              v-for="message in importMessages"
              :key="message.id"
              :class="getImportMessageClass(message.id)"
            >
              {{ message.type }}：{{ message.message }}
            </li>
          </ul>
        </section>
      </aside>
    </main>
  </div>
</template>

<style lang="scss" scoped>
// 元件根節點：整個 POC 採「上方工具列 + 左側紙張 + 右側資訊面板」配置。
.tiptap_doc_editor {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 90vh;
  color: #172033;
  background: #eef2f7;
}

// 工具列區塊：每一組功能用右邊框切開，方便對照上方 template 的 group。
.tiptap_doc_editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #cfd8e3;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
}

.tiptap_doc_editor-toolbar_group_file,
.tiptap_doc_editor-toolbar_group_user,
.tiptap_doc_editor-toolbar_group_text,
.tiptap_doc_editor-toolbar_group_marks,
.tiptap_doc_editor-toolbar_group_layout,
.tiptap_doc_editor-toolbar_group_table,
.tiptap_doc_editor-toolbar_group_document {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 0 8px 0 0;
  border-right: 1px solid #d8e0eb;
}

.tiptap_doc_editor-docx_input,
.tiptap_doc_editor-image_input {
  display: none;
}

// 按鈕共用樣式。class 雖多，但每個元素仍維持專案規範的一元素一 class。
.tiptap_doc_editor-file_button_open,
.tiptap_doc_editor-file_button_save,
.tiptap_doc_editor-file_button_image,
.tiptap_doc_editor-user_button_add,
.tiptap_doc_editor-align_button_left,
.tiptap_doc_editor-align_button_center,
.tiptap_doc_editor-align_button_right,
.tiptap_doc_editor-align_button_justify,
.tiptap_doc_editor-indent_button_out,
.tiptap_doc_editor-indent_button_in,
.tiptap_doc_editor-table_button_insert,
.tiptap_doc_editor-table_button_column,
.tiptap_doc_editor-table_button_row,
.tiptap_doc_editor-table_button_delete,
.tiptap_doc_editor-doc_button_chapter,
.tiptap_doc_editor-doc_button_undo,
.tiptap_doc_editor-doc_button_redo,
[class^='tiptap_doc_editor-tool_button_'] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #b9c6d6;
  border-radius: 6px;
  font:
    600 13px/1.2 Arial,
    sans-serif;
  color: #172033;
  background: #ffffff;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
  cursor: pointer;
}

.tiptap_doc_editor-doc_button_undo:disabled,
.tiptap_doc_editor-doc_button_redo:disabled {
  color: #95a3b8;
  background: #f2f5f9;
  cursor: not-allowed;
}

[class^='tiptap_doc_editor-tool_button_'][css-is-active='true'] {
  border-color: #2563eb;
  color: #ffffff;
  background: #2563eb;
}

.tiptap_doc_editor-user_select,
.tiptap_doc_editor-user_input,
.tiptap_doc_editor-font_select,
.tiptap_doc_editor-size_select,
.tiptap_doc_editor-color_select,
.tiptap_doc_editor-highlight_select {
  display: inline-flex;
  width: auto;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #b9c6d6;
  border-radius: 6px;
  font:
    500 13px/1.2 Arial,
    sans-serif;
  color: #172033;
  background: #ffffff;
}

.tiptap_doc_editor-user_input {
  width: 112px;
}

.tiptap_doc_editor-readonly_label {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 32px;
  font:
    600 13px/1.2 Arial,
    sans-serif;
  color: #172033;
}

.tiptap_doc_editor-readonly_checkbox {
  width: 14px;
  height: 14px;
}

.tiptap_doc_editor-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  min-height: 0;
  padding: 18px;
}

// 紙張區：外層負責捲動與灰色背景，內層 canvas 模擬 Word 文件紙面。
.tiptap_doc_editor-paper {
  // display: flex;
  min-height: 0;
  padding: 24px;
  background: #dfe7f1;
  overflow: auto;
}

.tiptap_doc_editor-canvas {
  display: block;
  width: min(100%, 920px);
  min-height: 1080px;
  margin: 0 auto;
  padding: 64px 72px;
  color: #111827;
  background: #ffffff;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.14);
}

.tiptap_doc_editor-canvas :deep(.ProseMirror) {
  min-height: 960px;
  outline: none;
}

// Tiptap 編輯器內部 DOM 不在 scoped class 控制內，所以用 :deep() 調整內容樣式。
.tiptap_doc_editor-canvas :deep(h1) {
  margin: 0 0 18px;
  font-size: 30px;
  line-height: 1.3;
}

.tiptap_doc_editor-canvas :deep(h2) {
  margin: 28px 0 12px;
  font-size: 22px;
  line-height: 1.35;
}

.tiptap_doc_editor-canvas :deep(p) {
  margin: 0 0 12px;
  font-size: 16px;
  line-height: 1.8;
}

.tiptap_doc_editor-canvas :deep(img) {
  display: block;
  max-width: 100%;
  margin: 14px 0;
}

.tiptap_doc_editor-canvas :deep(table) {
  width: 100%;
  margin: 16px 0;
  border-collapse: collapse;
  table-layout: fixed;
}

.tiptap_doc_editor-canvas :deep(th),
.tiptap_doc_editor-canvas :deep(td) {
  min-width: 90px;
  padding: 8px;
  border: 1px solid #9aa8bb;
  font-size: 15px;
  vertical-align: top;
}

.tiptap_doc_editor-canvas :deep(th) {
  font-weight: 700;
  background: #e8eef7;
}

.tiptap_doc_editor-canvas :deep(ol) {
  margin: 0 0 12px;
  padding: 0 0 0 32px;
  counter-reset: tiptap-doc-editor-list;
  list-style: none;
}

// 畫面上的中文多層清單用 CSS counter 呈現；匯出 Word 時另用 docx numbering。
.tiptap_doc_editor-canvas :deep(ol > li) {
  position: relative;
  margin: 6px 0;
  padding-left: 14px;
  font-size: 16px;
  line-height: 1.75;
  counter-increment: tiptap-doc-editor-list;
}

.tiptap_doc_editor-canvas :deep(ol > li::before) {
  position: absolute;
  left: -28px;
  width: 32px;
  color: #1f2937;
  text-align: right;
  content: counter(tiptap-doc-editor-list, cjk-ideographic) '、';
}

.tiptap_doc_editor-canvas :deep(ol ol > li::before) {
  content: '(' counter(tiptap-doc-editor-list, cjk-ideographic) ')';
}

.tiptap_doc_editor-canvas :deep(ol ol ol > li::before) {
  content: counter(tiptap-doc-editor-list, decimal) '、';
}

.tiptap_doc_editor-canvas :deep(ol ol ol ol > li::before) {
  content: '(' counter(tiptap-doc-editor-list, decimal) ')';
}

.tiptap_doc_editor-canvas :deep(ul) {
  margin: 0 0 12px;
  padding: 0 0 0 28px;
}

.tiptap_doc_editor-side_panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
}

// 右側面板：顯示目前能力、匯入訊息與編輯歷程，協助判斷 POC 是否可行。
.tiptap_doc_editor-status_panel,
.tiptap_doc_editor-history_panel,
.tiptap_doc_editor-import_panel {
  padding: 16px;
  border: 1px solid #d8e0eb;
  border-radius: 8px;
  background: #ffffff;
}

.tiptap_doc_editor-history_panel {
  max-height: 100%;
  overflow-y: auto;
}

.tiptap_doc_editor-status_title,
.tiptap_doc_editor-history_title,
.tiptap_doc_editor-import_title {
  margin: 0 0 10px;
  font-size: 16px;
  line-height: 1.3;
}

.tiptap_doc_editor-status_text {
  margin: 0 0 12px;
  font-size: 14px;
  color: #2563eb;
}

.tiptap_doc_editor-support_list,
.tiptap_doc_editor-history_list,
.tiptap_doc_editor-import_list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tiptap_doc_editor-support_item_import,
.tiptap_doc_editor-support_item_table,
.tiptap_doc_editor-support_item_list,
.tiptap_doc_editor-support_item_region,
.tiptap_doc_editor-support_item_excel,
[class^='tiptap_doc_editor-import_message_'] {
  font-size: 13px;
  line-height: 1.55;
  color: #475569;
}

[class^='tiptap_doc_editor-history_item_'] {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 8px;
  padding: 8px 0;
}

.tiptap_doc_editor-history_item_user,
.tiptap_doc_editor-history_item_action,
.tiptap_doc_editor-history_item_time,
.tiptap_doc_editor-history_item_length {
  font-size: 12px;
  line-height: 1.4;
  border-bottom: 1px solid #e2e8f0;
}

.tiptap_doc_editor-history_item_user {
  color: #0f172a;
}

.tiptap_doc_editor-history_item_action {
  color: #334155;
  text-align: right;
}

.tiptap_doc_editor-history_item_time,
.tiptap_doc_editor-history_item_length {
  color: #64748b;
}

@media (max-width: 1100px) {
  .tiptap_doc_editor-workspace {
    grid-template-columns: 1fr;
  }

  .tiptap_doc_editor-canvas {
    padding: 36px 28px;
  }
}
</style>
