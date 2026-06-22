import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

interface SaveOptions {
  defaultName: string;
  filterName: string;
  extensions: string[];
}

/**
 * Prompt for a destination with the native save dialog, then write the bytes
 * via a small Rust command. Returns the chosen path, or null if cancelled.
 */
export async function saveBytes(
  bytes: Uint8Array,
  opts: SaveOptions,
): Promise<string | null> {
  const path = await save({
    defaultPath: opts.defaultName,
    filters: [{ name: opts.filterName, extensions: opts.extensions }],
  });
  if (!path) return null;
  await invoke("write_file_bytes", { path, contents: Array.from(bytes) });
  return path;
}

export async function saveText(
  text: string,
  opts: SaveOptions,
): Promise<string | null> {
  return saveBytes(new TextEncoder().encode(text), opts);
}

/** Filesystem-safe base name from the person's name. */
export function safeBaseName(name: string): string {
  const base = (name || "resume").trim().replace(/\s+/g, "_").replace(/[^\w-]/g, "");
  return base || "resume";
}
