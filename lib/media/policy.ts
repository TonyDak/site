export type MediaKind = "image" | "video" | "file";
export type MediaAsset = { key: string; url: string; name: string; kind: MediaKind; contentType: string; size: number };
const MiB = 1024 * 1024;
export const MEDIA_TYPES: Record<string, { mime: string; kind: MediaKind; maxBytes: number }> = {
  png: { mime: "image/png", kind: "image", maxBytes: 10 * MiB },
  jpg: { mime: "image/jpeg", kind: "image", maxBytes: 10 * MiB },
  jpeg: { mime: "image/jpeg", kind: "image", maxBytes: 10 * MiB },
  webp: { mime: "image/webp", kind: "image", maxBytes: 10 * MiB },
  gif: { mime: "image/gif", kind: "image", maxBytes: 10 * MiB },
  avif: { mime: "image/avif", kind: "image", maxBytes: 10 * MiB },
  mp4: { mime: "video/mp4", kind: "video", maxBytes: 25 * MiB },
  webm: { mime: "video/webm", kind: "video", maxBytes: 25 * MiB },
  pdf: { mime: "application/pdf", kind: "file", maxBytes: 20 * MiB },
  zip: { mime: "application/zip", kind: "file", maxBytes: 20 * MiB },
};
export const MEDIA_ACCEPT = Object.keys(MEDIA_TYPES).map(ext => `.${ext}`).join(",");
export function filePolicy(name: string) {
  if (!name || name.length > 180 || /[\x00-\x1f\x7f/\\]/.test(name)) return null;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (!Object.hasOwn(MEDIA_TYPES, ext)) return null;
  const policy = MEDIA_TYPES[ext];
  return policy ? { ...policy, ext } : null;
}
export function matchesSignature(bytes: Uint8Array, mime: string): boolean {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const contains = (sequence: number[]) => {
    for (let offset = 0; offset <= bytes.length-sequence.length; offset++) {
      if (sequence.every((value,index)=>bytes[offset+index]===value)) return true;
    }
    return false;
  };
  if (bytes.length < 8) return false;
  switch (mime) {
    case "image/png": {
      if (![137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)) return false;
      let imageData = false;
      for (let offset = 8; offset + 12 <= bytes.length;) {
        const length = view.getUint32(offset);
        const type = ascii(offset+4,offset+8);
        if (length > bytes.length-offset-12) return false;
        if (offset === 8 && (type !== "IHDR" || length !== 13 || !view.getUint32(offset+8) || !view.getUint32(offset+12))) return false;
        if (type === "IDAT" && length > 0) imageData = true;
        offset += length + 12;
        if (type === "IEND") return length === 0 && imageData && offset === bytes.length;
      }
      return false;
    }
    case "image/jpeg": return bytes.length >= 32 && bytes[0]===255 && bytes[1]===216 && bytes[2]===255 && bytes.at(-2)===255 && bytes.at(-1)===217 && contains([255,218]);
    case "image/gif": return bytes.length >= 14 && ["GIF87a","GIF89a"].includes(ascii(0,6)) && view.getUint16(6,true)>0 && view.getUint16(8,true)>0 && bytes.at(-1)===59;
    case "image/webp": return bytes.length >= 20 && ascii(0,4)==="RIFF" && ascii(8,12)==="WEBP" && view.getUint32(4,true)+8===bytes.length && ["VP8 ","VP8L","VP8X"].includes(ascii(12,16)) && view.getUint32(16,true)<=bytes.length-20;
    case "image/avif":
    case "video/mp4": {
      if (bytes.length < 24 || ascii(4,8)!=="ftyp") return false;
      const brand = ascii(8,12);
      if (!(mime === "image/avif" ? ["avif","avis"] : ["isom","iso2","mp41","mp42","avc1","M4V ","qt  "]).includes(brand)) return false;
      const boxes = new Set<string>();
      let offset = 0;
      while (offset + 8 <= bytes.length) {
        const size = view.getUint32(offset);
        if (size < 8 || size > bytes.length-offset) return false;
        boxes.add(ascii(offset+4,offset+8)); offset += size;
      }
      return offset === bytes.length && boxes.has("mdat") && boxes.has(mime === "image/avif" ? "meta" : "moov");
    }
    case "video/webm": return bytes.length > 32 && [26,69,223,163].every((v,i)=>bytes[i]===v) && ascii(0,Math.min(bytes.length,4096)).includes("webm") && contains([24,83,128,103]);
    case "application/pdf": return bytes.length > 16 && ascii(0,5)==="%PDF-" && ascii(Math.max(0,bytes.length-1024),bytes.length).includes("%%EOF");
    case "application/zip": {
      if (bytes.length < 22 || bytes[0]!==80 || bytes[1]!==75) return false;
      for(let offset=bytes.length-22;offset>=Math.max(0,bytes.length-65557);offset--) {
        if (view.getUint32(offset)===0x504b0506 && offset+22+view.getUint16(offset+20,true)===bytes.length) {
          const directorySize=view.getUint32(offset+12,true), directoryOffset=view.getUint32(offset+16,true);
          return directoryOffset+directorySize<=offset && ((bytes[2]===3 && bytes[3]===4) || (offset===0 && directorySize===0));
        }
      }
      return false;
    }
    default: return false;
  }
}
