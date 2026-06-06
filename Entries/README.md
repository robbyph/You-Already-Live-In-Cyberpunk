# Cyberpunk Entries

Each numbered folder is one extracted example.

Inside each folder:

- `entry.json` contains the title, description, source link, Notion link, review flag, and local media references.
- `media-01.*`, `media-02.*`, etc. are local media files when the source export exposed an image or video.

Top-level files:

- `_manifest.csv` is the quick spreadsheet-style index.
- `_manifest.json` is the same index in structured JSON.

This folder was rebuilt from the full HTML Notion export. Most database-row images are now copied locally into their entry folders as `media-01.*`, `media-02.*`, etc.

Current rebuilt manifest:

- 141 manifest entries
- 82 entries with local media
- 91 local media files
- 73 of 88 database rows have local media from the HTML export

Bookmark thumbnails are intentionally excluded. Bookmark-only entries keep their title, description, and link data, but have no local media files.

Rows marked `needsReview: true` usually had no local attachment in the HTML export.
