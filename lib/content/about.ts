import { aboutContent } from "./data";
import type { AboutContent } from "./types";

export type { AboutContent } from "./types";

export function getAboutContent(): AboutContent {
  return aboutContent;
}
