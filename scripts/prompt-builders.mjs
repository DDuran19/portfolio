/**
 * Pick a visual style based on the article's tags and title tone.
 * Returns a style descriptor string used in both prompt builders.
 */
function pickStyle(tags, title) {
  const signals = [...(Array.isArray(tags) ? tags : []), title].join(' ').toLowerCase();

  if (/security|vulnerabilit|threat|attack|breach|hack/.test(signals)) {
    return 'dark cinematic digital art, dramatic lighting, deep navy and red tones, sharp geometric shapes';
  }
  if (/performance|speed|optim|fast|load/.test(signals)) {
    return 'sleek abstract visualization, motion blur streaks, electric blue and cyan on dark background, futuristic';
  }
  if (/database|sql|storage|query|data/.test(signals)) {
    return 'isometric 3D illustration, grid of glowing data nodes and connectors, teal and purple palette';
  }
  if (/ux|user experience|design|ui|accessibility/.test(signals)) {
    return 'clean cartoon vector illustration, soft pastel colors, friendly rounded shapes, warm background';
  }
  if (/team|communication|collaboration|agile/.test(signals)) {
    return 'flat cartoon vector art, diverse abstract shapes representing collaboration, warm and inviting color palette';
  }
  if (/testing|qa|quality|bug/.test(signals)) {
    return 'playful cartoon vector illustration, magnifying glass and gear motifs, bright saturated colors on light background';
  }
  if (/deploy|devops|ci|cd|pipeline|cloud/.test(signals)) {
    return 'isometric flat illustration, server racks and cloud shapes, cool blue and grey tones';
  }
  if (/scalab|architect|infrastructure|microservice/.test(signals)) {
    return 'abstract technical diagram art style, interconnected nodes and layers, monochrome with accent highlights';
  }
  if (/integration|api|third.party|webhook/.test(signals)) {
    return 'flat vector illustration, puzzle pieces and connector cables motif, clean minimal style, muted palette';
  }
  if (/analytic|monitor|metric|dashboard|log/.test(signals)) {
    return 'flat infographic art style, abstract charts and graphs as shapes, cool teal and amber palette';
  }

  // Default — generic tech
  return 'abstract digital art, clean flat design, dark background with subtle grid, modern tech aesthetic, muted blues and purples';
}

/**
 * Thumbnail prompt — wide hero image, abstract, brand-level.
 * Goal: visually distinct, professional, relevant to the whole article.
 */
function buildCoverPrompt(title, tags, description) {
  const tagList = Array.isArray(tags) ? tags.join(', ') : tags;
  const style = pickStyle(tags, title);
  return (
    `${style}. ` +
    `Hero banner image for a technical blog about: ${tagList}. ` +
    `High quality, cinematic 2:1 composition. ` +
    `ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO WORDS, NO LABELS, NO CAPTIONS anywhere in the image. ` +
    `No UI elements, no screens showing text, no people, no watermarks, no signatures.`
  );
}

/**
 * Section prompt — more illustrative, tied to the specific heading + snippet.
 * Goal: help the reader understand the concept visually.
 */
function buildSectionPrompt(sectionHeading, snippet, articleTitle, tags) {
  const style = pickStyle(tags, sectionHeading + ' ' + articleTitle);
  return (
    `${style}. ` +
    `Illustration representing the concept: "${sectionHeading}". ` +
    `Visual idea: ${snippet} ` +
    `ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO WORDS, NO LABELS, NO CAPTIONS anywhere in the image. ` +
    `No UI elements, no screens showing text, no people, no watermarks, no signatures.`
  );
}
