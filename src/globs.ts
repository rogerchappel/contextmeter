import fg from "fast-glob";
import type { NormalizedCategory, NormalizedConfig } from "./types.js";

export interface MatchedFile {
  path: string;
  category: NormalizedCategory;
}

export async function matchFiles(config: NormalizedConfig): Promise<MatchedFile[]> {
  const seen = new Set<string>();
  const matched: MatchedFile[] = [];

  for (const category of config.categories) {
    const paths = await fg(category.globs, {
      cwd: config.root,
      dot: true,
      onlyFiles: true,
      unique: true,
      ignore: config.exclude
    });

    for (const filePath of paths.sort()) {
      if (seen.has(filePath)) {
        continue;
      }
      seen.add(filePath);
      matched.push({ path: filePath, category });
    }
  }

  return matched.sort((left, right) => left.path.localeCompare(right.path));
}
