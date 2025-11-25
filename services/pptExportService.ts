import PptxGenJS from "pptxgenjs";
import { PPTSchema, PPTConfig } from "../types";

export const createAndDownloadPPT = async (schema: PPTSchema, config: PPTConfig) => {
  const pptx = new PptxGenJS();

  // Define Layout & Metadata
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = config.title;
  pptx.author = 'HanYun Inspiration';

  // Define Colors based on Style
  let bgColor = "FFFFFF";
  let titleColor = "000000";
  let bodyColor = "333333";
  let accentColor = "b93a32"; // Cinnabar default

  switch (config.style) {
    case 'INK_WASH':
      bgColor = "f0e7d8"; // Antique Paper
      titleColor = "2c2c2c"; // Ink Black
      bodyColor = "5c5042";
      accentColor = "6c8c74"; // Jade
      break;
    case 'FESTIVE_RED':
      bgColor = "b93a32"; // Cinnabar
      titleColor = "f0e7d8"; // Paper
      bodyColor = "ffffff";
      accentColor = "ffd700"; // Gold
      break;
    case 'MINIMALIST_ZEN':
      bgColor = "ffffff";
      titleColor = "2c2c2c";
      bodyColor = "666666";
      accentColor = "000000";
      break;
    case 'CUSTOM_UPLOAD':
      // Colors default to black/white for custom, as we don't know the image
      titleColor = "000000";
      bodyColor = "000000";
      accentColor = "b93a32";
      break;
  }

  // Generate Slides
  schema.slides.forEach((slideContent) => {
    let slide = pptx.addSlide();
    
    // Background
    if (config.style === 'CUSTOM_UPLOAD' && config.customBackground) {
       // Use the custom image as background
       slide.background = { data: config.customBackground };
    } else {
       slide.background = { color: bgColor };
    }

    // Title
    slide.addText(slideContent.title, {
      x: 0.5, y: 0.5, w: '90%', h: 1,
      fontSize: 32,
      fontFace: 'Arial',
      color: titleColor,
      bold: true,
      align: config.style === 'MINIMALIST_ZEN' ? 'left' : 'center',
      border: config.style === 'INK_WASH' ? { pt: 0, pb: '1pt', color: accentColor } : undefined
    });

    // Content (Bullet Points)
    if (slideContent.bulletPoints && slideContent.bulletPoints.length > 0) {
      slide.addText(slideContent.bulletPoints.map(bp => ({ text: bp, options: { breakLine: true } })), {
        x: 0.5, y: 1.8, w: '90%', h: 4,
        fontSize: 18,
        color: bodyColor,
        bullet: { code: '2022' }, // Bullet point style
        lineSpacing: 32
      });
    }

    // Speaker Notes
    if (slideContent.speakerNotes) {
      slide.addNotes(slideContent.speakerNotes);
    }
  });

  // Save/Download
  try {
    await pptx.writeFile({ fileName: `${config.title}.pptx` });
  } catch (error) {
    console.error("Error creating PPT file:", error);
    throw new Error("Failed to create PPT file.");
  }
};