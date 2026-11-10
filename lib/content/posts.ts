import { withDb } from "@/lib/db/mongo";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  sections?: Array<{
    heading: string;
    paragraphs: string[];
  }>;
  isPublished?: boolean;
};

export const SEED_POSTS: Post[] = [
  {
    slug: "event-driven-microservices-kafka-spring",
    title: "Designing Event-Driven Microservices with Spring Boot, Kafka, and Redis",
    excerpt: "Practical insights on building an asynchronous, distributed social platform architecture with Spring Cloud, Keycloak, and event streaming.",
    publishedAt: "2026-03-15",
    readTime: "7 min read",
    tags: ["Spring Boot", "Kafka", "Microservices", "Redis", "Docker"],
    isPublished: true,
    content: `## Architecture Overview

When building distributed platforms, asynchronous communication and clear domain boundaries prevent cascading failures. In my personal project—a **Social Networking Microservices Platform**—I explored decoupling user interactions via an event-driven model.

### Key Components

1. **API Gateway & Service Discovery**: Spring Cloud Gateway acts as the single point of ingress, routing requests while maintaining JWT authorization filters backed by Keycloak.
2. **Event Bus (Apache Kafka)**: User activities (posts, likes, follows) trigger domain events pushed to partitioned Kafka topics, processed asynchronously by notification and feed workers.
3. **Distributed Caching (Redis)**: High-traffic endpoints cache timeline structures and session tokens, reducing repeated database queries by over 60%.
4. **Containerized Orchestration**: Docker Compose defines the entire mesh locally, matching the production topology.

\`\`\`yaml
# Docker compose snippet for Kafka event broker
services:
  kafka:
    image: confluentinc/cp-kafka:latest
    ports:
      - "9092:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT'
      KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://localhost:9092'
\`\`\`

### Lessons Learned

- **Idempotency is essential**: Always design consumers with deduplication IDs in Redis to handle network retries safely.
- **Circuit Breakers**: Resilience4j protects downstream service calls from blocking gateway worker threads during load spikes.`,
  },
  {
    slug: "building-enterprise-pos-web-mobile",
    title: "Lessons from Engineering Enterprise POS & Hospitality Platforms",
    excerpt: "Bridging web dashboards and mobile point-of-sale applications with Next.js, React Native, and offline-first data sync.",
    publishedAt: "2026-02-08",
    readTime: "5 min read",
    tags: ["React Native", "Next.js", "Offline Sync", "TypeScript"],
    isPublished: true,
    content: `## The Challenge of Hospitality Operations

In fast-paced restaurant and hospitality environments, downtime during a peak dinner rush directly translates to lost revenue. At KAS Technology, my focus spans responsive web dashboards and cross-platform mobile apps that remain resilient under unstable network conditions.

### Core Architecture Pillars

- **Dual-Mode Data Sync**: Local SQLite storage on React Native devices buffers orders and receipts during connection drops, queuing synchronization payloads until the backend REST API responds.
- **Unified TypeScript Contracts**: Shared DTOs between the NestJS backend and Next.js / Expo frontends eliminate schema drift and type mismatches.
- **Real-time Kitchen Display**: WebSockets broadcast kitchen order tickets (KOT) directly to station monitors without polling overhead.

\`\`\`typescript
// Shared sync queue interface
interface SyncTask<T> {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH';
  payload: T;
  retryCount: number;
  timestamp: number;
}
\`\`\`

### Performance Optimization

1. **Virtualization**: Large restaurant menus (1,000+ items with modifiers) require FlashList / FlatList optimizations to maintain 60 FPS scrolling on lower-end Android tablets.
2. **Memory Leaks**: Cleaning up WebSocket heartbeat intervals and subscription listeners during screen unmounts prevents app degradation over continuous 12-hour shifts.`,
  },
  {
    slug: "clean-architecture-nest-and-dotnet",
    title: "Applying Clean Architecture in NestJS and ASP.NET Core",
    excerpt: "Organizing domain entities, use cases, and repository interfaces so your business logic survives framework changes.",
    publishedAt: "2026-01-20",
    readTime: "6 min read",
    tags: ["Clean Architecture", "NestJS", "ASP.NET Core", "Domain-Driven"],
    isPublished: true,
    content: `## Why Clean Architecture?

Whether writing TypeScript with NestJS or C# with ASP.NET Core Web API, coupling business rules directly to database models or HTTP controllers creates technical debt as requirements grow.

### The Concentric Layers

1. **Domain Entities**: Pure data structures and enterprise rules with zero dependencies on external packages.
2. **Use Cases / Application Services**: Orchestrates business actions (e.g., \`CreateOrderUseCase\`, \`TransferFundsUseCase\`).
3. **Interface Adapters**: Controllers, presenters, and repositories implementing abstract domain ports.
4. **Frameworks & Drivers**: TypeORM, Entity Framework Core, MongoDB drivers, and HTTP routers.

\`\`\`
src/
  ├── domain/          # Entities & repository interfaces (ports)
  ├── application/     # Use cases & DTOs
  ├── infrastructure/  # DB implementations, external APIs
  └── presentation/    # REST controllers, gRPC handlers
\`\`\`

By keeping the inner layers independent, migrating from relational SQL to MongoDB or swapping cloud providers leaves core business rules untouched.`,
  },
];

function normalizePost(raw: Partial<Post>): Post {
  let content = typeof raw.content === "string" ? raw.content : "";
  if (!content && Array.isArray(raw.sections)) {
    content = raw.sections
      .map((sec) => `## ${sec.heading || ""}\n\n${(sec.paragraphs || []).join("\n\n")}`)
      .join("\n\n");
  }

  return {
    slug: raw.slug || "",
    title: raw.title || "",
    excerpt: raw.excerpt || content.slice(0, 160).replace(/\n/g, " ") + "...",
    content: content || "Content currently being edited.",
    publishedAt: raw.publishedAt || "2026-01-01",
    readTime: raw.readTime || "5 min read",
    tags: Array.isArray(raw.tags) ? raw.tags : ["Engineering"],
    isPublished: raw.isPublished !== false,
  };
}

const fallbackPosts = SEED_POSTS.map(normalizePost).filter(p => p.isPublished !== false);

export async function getPosts({ includeDrafts = false }: { includeDrafts?: boolean } = {}): Promise<Post[]> {
  try {
    const posts = await withDb(async (db) => {
      const collection = db.collection<Post>("posts");
      const docs = await collection.find(includeDrafts ? {} : { isPublished: { $ne: false } }).sort({ publishedAt: -1 }).toArray();
      // A genuinely empty database retains the public bundled examples without seeding on GET.
      // An all-draft collection stays empty for public readers.
      if (!includeDrafts && docs.length === 0 && await collection.countDocuments({}, { limit: 1 }) === 0) return fallbackPosts;
      return docs.map(normalizePost);
    });
    if (posts !== null) return posts;
    if (includeDrafts) throw new Error("Admin storage unavailable.");
    return fallbackPosts;
  } catch (err) {
    if (includeDrafts) throw err;
    console.warn("[Posts] Public content storage unavailable; using bundled articles.");
    return fallbackPosts;
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function savePost(post: Post): Promise<{ success: boolean; error?: string }> {
  try {
    const normalized = normalizePost(post);
    const saved = await withDb(async (db) => {
      const collection = db.collection<Post>("posts");
      await collection.updateOne(
        { slug: normalized.slug },
        { $set: normalized },
        { upsert: true }
      );
      return true;
    });
    return saved ? { success: true } : { success: false, error: "Article storage unavailable." };
  } catch (err) {
    return { success: false, error: (err as Error)?.message };
  }
}
