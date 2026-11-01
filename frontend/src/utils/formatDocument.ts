/**
 * Formats and cleans raw backend resume filenames.
 * - Prevents raw backend hash strings (e.g., "6a9d83cbc0425fedfff5bf91-...pdf") from rendering.
 * - If originalName is available, uses that.
 * - If the name is longer than 28 characters, truncates it cleanly (e.g., "Nafis_Resume_...pdf").
 * - If only the hashed filename exists, displays a clean default such as "Nafis_Uddin_Chowdhury_Resume.pdf".
 */
export function formatResumeFilename(
  rawFilePathOrName?: string | null,
  originalName?: string | null,
  defaultName = "Nafis_Uddin_Chowdhury_Resume.pdf"
): string {
  let nameToUse = "";

  if (originalName && originalName.trim()) {
    nameToUse = originalName.trim();
  }

  if (!nameToUse && rawFilePathOrName) {
    const extracted = rawFilePathOrName.split(/[/\\]/).pop() || "";
    // Check if filename contains a MongoDB ObjectId, hex hash prefix, or random UUID pattern
    const isHashed = /^[0-9a-fA-F]{24}-|resume_[0-9a-fA-F]+_|[0-9]{10,}-[0-9a-fA-F-]{20,}/.test(extracted);

    if (isHashed || !extracted.toLowerCase().endsWith(".pdf") || extracted.length > 35) {
      nameToUse = defaultName;
    } else {
      nameToUse = extracted;
    }
  }

  if (!nameToUse) {
    nameToUse = defaultName;
  }

  // If the name is longer than 28 characters, truncate cleanly (e.g., "Nafis_Resume_...pdf")
  if (nameToUse.length > 28) {
    const ext = nameToUse.toLowerCase().endsWith(".pdf") ? ".pdf" : "";
    const base = nameToUse.slice(0, nameToUse.length - ext.length);
    const charsToKeep = 28 - ext.length - 3; // 3 for "..."
    if (charsToKeep > 3) {
      return `${base.slice(0, charsToKeep)}...${ext}`;
    }
  }

  return nameToUse;
}
