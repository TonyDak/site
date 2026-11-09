import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  Braces,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Container,
  Copy,
  Database,
  Download,
  Eye,
  FileCode2,
  FileDown,
  FileText,
  Folder,
  FolderOpen,
  Gauge,
  GitBranch,
  GitCommitHorizontal,
  Hash,
  Hotel,
  KeyRound,
  Languages,
  LayoutDashboard,
  Layers,
  ListTree,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Moon,
  Network,
  NotebookPen,
  PenLine,
  Phone,
  Plus,
  Radio,
  RotateCcw,
  Save,
  ScrollText,
  Send,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  Sun,
  Terminal,
  Trash2,
  UtensilsCrossed,
  Waypoints,
  Workflow,
  X,
  type LucideProps,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

/** Brand marks (not shipped by lucide). */
export function GithubIcon(props: SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 16, ...rest } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 16, ...rest } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.44-2.14 2.94v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

export const icons = {
  readme: FileText,
  experience: GitCommitHorizontal,
  skills: Braces,
  projects: Network,
  enterprise: Building2,
  contact: Send,
  blog: NotebookPen,
  post: FileText,
  admin: PenLine,
  resume: FileDown,
  heading: Hash,
  folder: Folder,
  folderOpen: FolderOpen,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  arrowUpRight: ArrowUpRight,
  download: Download,
  mail: Mail,
  phone: Phone,
  mapPin: MapPin,
  menu: Menu,
  close: X,
  sun: Sun,
  moon: Moon,
  languages: Languages,
  branch: GitBranch,
  terminal: Terminal,
  replay: RotateCcw,
  database: Database,
  eye: Eye,
  save: Save,
  trash: Trash2,
  logout: LogOut,
  lock: Lock,
  plus: Plus,
  clock: Clock,
  book: BookOpen,
  sparkles: Sparkles,
  check: Check,
  copy: Copy,
  layers: Layers,
  server: Server,
  smartphone: Smartphone,
  boxes: Boxes,
  workflow: Workflow,
  key: KeyRound,
  fileCode: FileCode2,
  scroll: ScrollText,
  listTree: ListTree,
  hotel: Hotel,
  utensils: UtensilsCrossed,
  dashboard: LayoutDashboard,
  gauge: Gauge,
  shield: Shield,
  radio: Radio,
  container: Container,
  waypoints: Waypoints,
} satisfies Record<string, ComponentType<LucideProps>>;

export type IconKey = keyof typeof icons;

export function Icon({ name, size = 15, strokeWidth = 1.75, ...rest }: { name: IconKey } & LucideProps) {
  const Cmp = icons[name];
  return <Cmp size={size} strokeWidth={strokeWidth} aria-hidden="true" {...rest} />;
}
