import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown, safeUrl, videoEmbedUrl } from '../lib/content/markdown.ts';

test('media blocks retain image alt/caption, video and download labels',()=>{
  const {blocks}=parseMarkdown('![Architecture](https://media.example.com/a.png "System overview")\n\n[video](https://media.example.com/demo.mp4)\n\n[download: Source code](https://media.example.com/code.zip)');
  assert.deepEqual(blocks.map(b=>b.type),['image','video','download']);
  assert.equal(blocks[0].caption,'System overview');assert.equal(blocks[0].alt,'Architecture');assert.equal(blocks[2].label,'Source code');
});
test('unsafe URLs and arbitrary iframe hosts stay inert',()=>{
  for(const url of ['javascript:alert(1)','data:text/html,hi','//evil.example/x','https://user:pass@example.com','https://example.com/\nfoo','vbscript:x'])assert.equal(safeUrl(url),null);
  assert.equal(videoEmbedUrl('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ'),null);
  assert.equal(videoEmbedUrl('https://example.com/embed/1'),null);
  assert.equal(videoEmbedUrl('https://youtu.be/dQw4w9WgXcQ'),'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  assert.equal(videoEmbedUrl('https://vimeo.com/123456'),'https://player.vimeo.com/video/123456');
  assert.ok(parseMarkdown('![bad](javascript:alert(1))').blocks.every(b=>b.type!=='image'));
});
test('existing headings, lists and fenced code retain structure and unique outline IDs',()=>{
  const parsed=parseMarkdown('## Cài đặt\n- one\n- two\n```ts\n![not media](https://example.com/a.png)\n```\n## Cài đặt');
  assert.deepEqual(parsed.blocks.map(b=>b.type),['heading','list','code','heading']);assert.equal(parsed.blocks[2].text,'![not media](https://example.com/a.png)');
  assert.equal(parsed.outline.length,2);assert.notEqual(parsed.outline[0].id,parsed.outline[1].id);
});
