# Adding Content to the Feed

The feed is powered by a single JSON file: `src/data/feed.json`

## How to Add a New Post

Open `src/data/feed.json` and add a new entry to the array:

```json
{
  "id": "unique-id",
  "imageUrl": "https://example.com/image.jpg",
  "description": "Brief text shown on hover.",
  "link": "https://example.com/article",
  "tags": ["tag1", "tag2"],
  "date": "2025-03-19"
}
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier string |
| `imageUrl` | Yes | URL to the image (Unsplash works great) |
| `description` | Yes | Text shown when hovering over the image |
| `link` | No | Optional URL — if set, clicking the card opens this link |
| `tags` | Yes | Array of hashtag strings |
| `date` | Yes | Date string (YYYY-MM-DD) |

### Tips
- Posts render in stable slug order so each card keeps its canonical position
- Each card gets a deterministic accent color
- Images can be any aspect ratio — the masonry layout handles it
- Keep descriptions punchy — they overlay the dimmed image on hover
- Use high quality image URLs for best results
