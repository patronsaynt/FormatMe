import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import type { Resume } from "../types";
import { saveText, safeBaseName } from "./save";

/** Save the full editable document as a .json project file. */
export async function exportProject(resume: Resume): Promise<string | null> {
  return saveText(JSON.stringify(resume, null, 2), {
    defaultName: `${safeBaseName(resume.name)}.formatme.json`,
    filterName: "FormatMe Project",
    extensions: ["json"],
  });
}

/** Open a .json project file and parse it back into a Resume. */
export async function importProject(): Promise<Resume | null> {
  const path = await open({
    multiple: false,
    filters: [{ name: "FormatMe Project", extensions: ["json"] }],
  });
  if (!path || typeof path !== "string") return null;
  const text = await invoke<string>("read_file_text", { path });
  return JSON.parse(text) as Resume;
}
