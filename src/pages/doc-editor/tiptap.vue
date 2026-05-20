<script lang="ts" setup>
import DefaultLayout from "@src/layouts/default.vue";
import TiptapDocEditor from "@src/components/TiptapDocEditor.vue";

type RequirementLimit = {
  id: string;
  statusText: string;
  title: string;
  reason: string;
  wordImpact: string;
};

const requirementLimits: RequirementLimit[] = [
  {
    id: "open_word",
    statusText: "可做但會失真",
    title: "1. 線上開啟 Word",
    reason:
      "mammoth 可以把 .docx 轉成 HTML 給 Tiptap 編輯，但它不是 Word 排版引擎，頁首頁尾、註解、追蹤修訂、複雜樣式、文字方塊等可能遺失。",
    wordImpact:
      "可另存成新的 .docx，但不是原檔完整 round-trip，匯入時丟失的 Word 專屬資訊無法再存回。",
  },
  {
    id: "editable_region",
    statusText: "目前做不到",
    title: "4. 是否支援可編輯區域",
    reason:
      "Tiptap 可做到整份文件唯讀/可編輯；局部可編輯區域需要客製 NodeView、extension 或權限模型，不是 Tiptap + mammoth + docx 的內建能力。",
    wordImpact:
      "即使前端做出局部鎖定，也無法用穩定轉成 Word 的內容控制項或保護區設定。",
  },
  {
    id: "edit_history",
    statusText: "可做但無法自然存回",
    title: "5. 每個使用者都要有編輯歷程",
    reason:
      "目前 POC 的歷程是前端記憶體清單，只能顯示誰做了什麼動作。正式多人歷程需要後端儲存 transaction、diff 或版本紀錄。",
    wordImpact:
      "docx 可以另行寫入註解或自訂 metadata，但不能等同 Word 原生追蹤修訂；無法把歷程存入 .docx。",
  },
  {
    id: "auto_chapter_numbering",
    statusText: "部分可做",
    title: "6. 新增章節時，多層次清單序號自動 +1",
    reason:
      "目前可用畫面上的章節掃描與 CSS counter 示範自動新增章節；但正式章節/清單續編需要更嚴謹的 document model，不能只靠 HTML 文字掃描。",
    wordImpact:
      "可用 docx numbering 產生多層清單，但若要求與既有 Word 文件的清單定義完全續接，mammoth 匯入後不一定保留原始 numbering id。",
  },
  {
    id: "full_toolbar",
    statusText: "不等於 Word 功能列",
    title: "8. 功能列全部顯示",
    reason:
      "Tiptap 只提供可被 extension 支援的編輯命令。要做接近 Word 的完整 ribbon，需要大量 extension、客製 UI 與格式轉換規則。",
    wordImpact:
      "即使前端顯示很多格式按鈕，也只有已寫入 HTML -> docx 轉換器的格式能可靠存進 .docx。",
  },
  {
    id: "excel_formula",
    statusText: "目前做不到",
    title: "Excel 內嵌與公式",
    reason:
      "Word 內嵌 Excel 屬於 OLE 物件，瀏覽器端 Tiptap/docx 不適合建立或編輯這類二進位嵌入物件。公式可另接 math extension，但那是數學公式，不是 Excel 試算表公式。",
    wordImpact:
      "可考慮把表格或公式以圖片、HTML 表格、文字結果或 OMML 數學公式輸出；無法把可編輯 Excel 或 Excel 公式存入 .docx。",
  },
];
</script>

<template>
  <DefaultLayout>
    <div class="tiptap_doc_page">
      <section class="tiptap_doc_page-limit_panel">
        <div class="tiptap_doc_page-limit_panel-header">
          <h1 class="tiptap_doc_page-limit_panel-header-title">
            Tiptap + docx + mammoth POC 限制標註
          </h1>
          <p class="tiptap_doc_page-limit_panel-header-summary">
            下列項目是「做不到」或「即使畫面做得到，也無法可靠存回
            Word」的功能。
          </p>
        </div>

        <ul class="tiptap_doc_page-limit_panel-list">
          <li
            v-for="requirementLimit in requirementLimits"
            :key="requirementLimit.id"
            class="tiptap_doc_page-limit_panel-list-card"
          >
            <strong class="tiptap_doc_page-limit_panel-list-card-status">
              {{ requirementLimit.statusText }}
            </strong>
            <h2 class="tiptap_doc_page-limit_panel-list-card-item_title">
              {{ requirementLimit.title }}
            </h2>
            <p class="tiptap_doc_page-limit_panel-list-card-item_reason">
              {{ requirementLimit.reason }}
            </p>
            <p class="tiptap_doc_page-limit_panel-list-card-item_word">
              Word 存檔影響：{{ requirementLimit.wordImpact }}
            </p>
          </li>
        </ul>
      </section>

      <section class="tiptap_doc_page-editor_panel">
        <TiptapDocEditor :status-panel="false" />
      </section>
    </div>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.tiptap_doc_page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 90vh;
  padding: 16px;
  //   background: #eef2f7;

  @media (max-width: 760px) {
    padding: 10px;
  }

  &-limit_panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 18px;
    border: 1px solid #d8e0eb;
    border-radius: 8px;
    background: #ffffff;

    &-header {
      display: flex;
      flex-direction: column;
      gap: 6px;

      &-title {
        margin: 0;
        font-size: 20px;
        line-height: 1.35;
        color: #172033;
      }
      &-summary {
        margin: 0;
        font-size: 14px;
        line-height: 1.6;
        color: #526072;
      }
    }

    &-list {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin: 0;
      padding: 0;
      list-style: none;

      @media (max-width: 1180px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      @media (max-width: 760px) {
        grid-template-columns: 1fr;
      }

      &-card {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-height: 180px;
        padding: 8px;
        border: 1px solid #f0c7c7;
        border-radius: 8px;
        background: #fff7f7;

        &-status {
          display: inline-flex;
          align-self: flex-start;
          padding: 4px 8px;
          border: 1px solid #f3a8a8;
          border-radius: 999px;
          font-size: 12px;
          line-height: 1.2;
          color: #9f1239;
          background: #ffe4e6;
        }

        &-item_title {
          margin: 0;
          font-size: 15px;
          line-height: 1.45;
          color: #172033;
        }

        &-item_reason {
          margin: 0;
          font-size: 13px;
          line-height: 1.65;
          color: #475569;
        }
        &-item_word {
          @extend .tiptap_doc_page-limit_panel-list-card-item_reason;
          color: #7c2d12;
        }
      }
    }
  }

  &-editor_panel {
    min-height: 90vh;
  }
}
</style>
