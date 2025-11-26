
import { ExerciseSchema, ExerciseType, ExerciseConfig } from "../types";
import { html } from 'pinyin-pro';

export const createAndDownloadDoc = (schema: ExerciseSchema, config: ExerciseConfig, filename: string) => {
  // Helper to map type to Chinese label
  const getTypeLabel = (type: ExerciseType) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return '一、选择题 (Multiple Choice)';
      case 'FILL_IN_BLANK': return '二、填空题 (Fill in the Blanks)';
      case 'MATCHING': return '三、连线题 (Matching)';
      case 'TRANSLATION': return '四、翻译题 (Translation)';
      case 'OPEN_ENDED': return '五、问答题 (Open Ended)';
      default: return '练习题';
    }
  };

  // Helper to add pinyin if requested
  const formatText = (text: string) => {
    if (!config.includePinyin || !text) return text;
    try {
        // Use pinyin-pro html method directly
        // This generates <ruby>汉<rt>hàn</rt></ruby>
        return html(text, { toneType: 'symbol', nonZh: 'consecutive' });
    } catch (e) {
        console.error("Pinyin generation error:", e);
        return text;
    }
  };

  // Group exercises by type
  const grouped: Record<string, typeof schema.exercises> = {};
  schema.exercises.forEach(ex => {
    if (!grouped[ex.type]) grouped[ex.type] = [];
    grouped[ex.type].push(ex);
  });

  // Build HTML Content
  // Note: Added styling for ruby text for better compatibility
  let htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${schema.title}</title>
      <style>
        body { font-family: 'SimSun', 'Songti SC', serif; line-height: 2.0; } 
        h1 { text-align: center; font-size: 24pt; color: #333; margin-bottom: 20px; }
        h2 { font-size: 16pt; color: #5e4b35; margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        h3 { font-size: 14pt; color: #8b5a2b; margin-top: 15px; }
        .question { margin-bottom: 15px; font-size: 12pt; }
        .options { margin-left: 20px; list-style-type: none; }
        .answer-key { margin-top: 50px; border-top: 2px dashed #999; padding-top: 20px; page-break-before: always; }
        ruby { font-size: 12pt; }
        rt { font-size: 8pt; color: #666; font-family: Arial, sans-serif; }
      </style>
    </head>
    <body>
      <h1>${formatText(schema.title)}</h1>
      <p style="text-align: center;">${formatText("姓名")} (Name): _______________ &nbsp;&nbsp; ${formatText("日期")} (Date): _______________</p>
  `;

  // Render Questions
  Object.keys(grouped).forEach(typeKey => {
    const type = typeKey as ExerciseType;
    htmlContent += `<h2>${formatText(getTypeLabel(type))}</h2>`;
    
    grouped[type].forEach((item, index) => {
      htmlContent += `<div class="question">`;
      // Convert question text
      htmlContent += `<strong>${index + 1}. ${formatText(item.question)}</strong>`;
      
      if (item.options && item.options.length > 0) {
        htmlContent += `<ul class="options">`;
        item.options.forEach(opt => {
          // Convert option text
          htmlContent += `<li>${formatText(opt)}</li>`;
        });
        htmlContent += `</ul>`;
      } else if (type === 'FILL_IN_BLANK') {
        htmlContent += `<br/>_________________________`;
      } else if (type === 'TRANSLATION') {
          htmlContent += `<br/>__________________________________________________`;
      } else if (type === 'OPEN_ENDED') {
          htmlContent += `<br/><br/><br/>`;
      }
      
      htmlContent += `</div>`;
    });
  });

  // Render Answer Key
  if (config.includeAnswerKey) {
    htmlContent += `<div class="answer-key"><h2>${formatText("参考答案 (Answer Key)")}</h2>`;
    Object.keys(grouped).forEach(typeKey => {
        const type = typeKey as ExerciseType;
        htmlContent += `<h3>${formatText(getTypeLabel(type))}</h3><ul>`;
        grouped[type].forEach((item, index) => {
        htmlContent += `<li>${index + 1}. ${formatText(item.answer)}</li>`;
        });
        htmlContent += `</ul>`;
    });
    htmlContent += `</div>`;
  }
  
  htmlContent += `</body></html>`;

  // Create Blob and Download
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.doc`; // .doc is more forgiving with raw HTML content than .docx
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
