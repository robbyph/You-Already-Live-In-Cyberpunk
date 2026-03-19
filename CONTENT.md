# Adding Content to the Feed

The feed is powered by a single JSON file: `src/data/feed.json`

## How to Add a New Post

Open `src/data/feed.json` and add a new entry to the array. Each post needs an `id`, `type`, `title`, `tags`, `date`, and `size`.

### Post Types

#### Link (news article)
```json
{
  "id": "unique-id",
  "type": "link",
  "title": "Article Headline",
  "source": "Source Name",
  "url": "https://example.com/article",
  "description": "Brief description of why this is cyberpunk.",
  "tags": ["AI", "surveillance"],
  "date": "2025-03-19",
  "size": "medium"
}
```

#### Image
```json
{
  "id": "unique-id",
  "type": "image",
  "title": "Image Title",
  "imageUrl": "https://example.com/image.jpg",
  "description": "Caption text.",
  "tags": ["aesthetic", "cities"],
  "date": "2025-03-19",
  "size": "large"
}
```

#### Text (commentary)
```json
{
  "id": "unique-id",
  "type": "text",
  "title": "Post Title",
  "content": "Your commentary text here.",
  "tags": ["commentary"],
  "date": "2025-03-19",
  "size": "small"
}
```

#### Embed (YouTube, etc.)
```json
{
  "id": "unique-id",
  "type": "embed",
  "title": "Video Title",
  "embedUrl": "https://www.youtube.com/embed/VIDEO_ID",
  "embedType": "youtube",
  "description": "Description of the embed.",
  "tags": ["robotics"],
  "date": "2025-03-19",
  "size": "large"
}
```

### Size Options
- `"small"` — compact card
- `"medium"` — standard card
- `"large"` — prominent card

### Tips
- Posts are randomly shuffled on each page load for a chaotic feed effect
- Use descriptive, punchy text — this is cyberpunk commentary
- Tags appear as neon-styled pills on each card
- Images should be high quality URLs (Unsplash works great)
- For YouTube embeds, use the `/embed/` URL format
