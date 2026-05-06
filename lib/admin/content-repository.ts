import { getDb } from "@/lib/admin/mongo";
import {
  COLLECTION_NAMES,
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_SITE_CONFIG,
  mergeSiteConfig,
  type AboutContent,
  type MongoDocument,
  type Post,
  type Project,
  type SiteConfig,
} from "@/lib/admin/content-models";

type ContentRepository = {
  getSiteConfig(): Promise<SiteConfig>;
  saveSiteConfig(value: SiteConfig): Promise<void>;
  getAboutContent(): Promise<AboutContent>;
  saveAboutContent(value: AboutContent): Promise<void>;
  getProjects(): Promise<Project[]>;
  saveProjects(value: Project[]): Promise<void>;
  getPosts(): Promise<Post[]>;
  savePosts(value: Post[]): Promise<void>;
};

function stripMongoId<T extends { _id: string }>(document: T) {
  const { _id, ...rest } = document;
  void _id;
  return rest;
}

class MongoContentRepository implements ContentRepository {
  async getSiteConfig() {
    const db = await getDb();
    const collection = db.collection<MongoDocument<SiteConfig>>(COLLECTION_NAMES.site);
    const existing = await collection.findOne({ _id: "site" });

    if (!existing) {
      await collection.updateOne({ _id: "site" }, { $set: DEFAULT_SITE_CONFIG }, { upsert: true });
      return DEFAULT_SITE_CONFIG;
    }

    const stored = stripMongoId(existing);
    const hydrated = mergeSiteConfig(DEFAULT_SITE_CONFIG, stored);

    if (JSON.stringify(hydrated) !== JSON.stringify(stored)) {
      await collection.updateOne({ _id: "site" }, { $set: hydrated }, { upsert: true });
    }

    return hydrated;
  }

  async saveSiteConfig(value: SiteConfig) {
    const db = await getDb();
    const collection = db.collection<MongoDocument<SiteConfig>>(COLLECTION_NAMES.site);
    await collection.updateOne({ _id: "site" }, { $set: value }, { upsert: true });
  }

  async getAboutContent() {
    const db = await getDb();
    const collection = db.collection<MongoDocument<AboutContent>>(COLLECTION_NAMES.about);
    const existing = await collection.findOne({ _id: "about" });

    if (!existing) {
      await collection.updateOne({ _id: "about" }, { $set: DEFAULT_ABOUT_CONTENT }, { upsert: true });
      return DEFAULT_ABOUT_CONTENT;
    }

    const stored = stripMongoId(existing);
    const hydrated: AboutContent = {
      timeline: Array.isArray(stored.timeline) ? stored.timeline : DEFAULT_ABOUT_CONTENT.timeline,
      skills: Array.isArray(stored.skills) ? stored.skills : DEFAULT_ABOUT_CONTENT.skills,
      recentWriting: Array.isArray(stored.recentWriting) ? stored.recentWriting : DEFAULT_ABOUT_CONTENT.recentWriting,
    };

    if (JSON.stringify(hydrated) !== JSON.stringify(stored)) {
      await collection.updateOne({ _id: "about" }, { $set: hydrated }, { upsert: true });
    }

    return hydrated;
  }

  async saveAboutContent(value: AboutContent) {
    const db = await getDb();
    const collection = db.collection<MongoDocument<AboutContent>>(COLLECTION_NAMES.about);
    await collection.updateOne({ _id: "about" }, { $set: value }, { upsert: true });
  }

  async getProjects() {
    const db = await getDb();
    const collection = db.collection<MongoDocument<Project>>(COLLECTION_NAMES.projects);
    const docs = await collection.find({}).sort({ title: 1 }).toArray();
    return docs.map(stripMongoId);
  }

  async saveProjects(value: Project[]) {
    const db = await getDb();
    const collection = db.collection<MongoDocument<Project>>(COLLECTION_NAMES.projects);
    await collection.deleteMany({});

    if (value.length > 0) {
      await collection.insertMany(value.map((project) => ({ _id: project.slug, ...project })));
    }
  }

  async getPosts() {
    const db = await getDb();
    const collection = db.collection<MongoDocument<Post>>(COLLECTION_NAMES.posts);
    const docs = await collection.find({}).sort({ publishedAt: -1 }).toArray();
    return docs.map(stripMongoId);
  }

  async savePosts(value: Post[]) {
    const db = await getDb();
    const collection = db.collection<MongoDocument<Post>>(COLLECTION_NAMES.posts);
    await collection.deleteMany({});

    if (value.length > 0) {
      await collection.insertMany(value.map((post) => ({ _id: post.slug, ...post })));
    }
  }
}

const repository = new MongoContentRepository();

export function getContentRepository() {
  return repository;
}
