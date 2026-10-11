# Knowledge Hub

Knowledge Hub is a private, friends-only knowledge board for sharing notes, links, questions, discoveries, files, and threaded discussions.

## Features

- Account registration and login with secure, database-backed sessions
- Create, edit, and delete your own notes
- Threaded replies with ownership-protected deletion
- Rich text editing with:
  - Headings
  - Bold, italic, underline, and strikethrough
  - Bulleted and numbered lists
  - Quotes and code blocks
  - Links and horizontal rules
  - Clear formatting
  - Tables with add/delete row and column controls
- Tags and tag-based feed filtering
- Search notes by title, content, or author
- Bookmarks and useful reactions
- Public user profiles with editable bio and emoji
- Reply and `@mention` notifications
- Local draft autosave while composing a note
- PNG, JPG, GIF, and PDF attachments
- Image resizing before storage
- Markdown export for individual notes
- In-app weekly digest
- Persistent light and dark themes
- Responsive, keyboard-friendly interface

## Requirements

- Node.js 20 or newer
- PostgreSQL
- npm

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   copy .env.example .env
   ```

3. Set `DATABASE_URL` in `.env` to your PostgreSQL connection string.

4. Apply the existing migrations:

   ```bash
   npm run db:deploy
   ```

   For local development when creating new migrations, use:

   ```bash
   npm run db:migrate
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run the TypeScript check |
| `npm run build` | Generate Prisma Client and create a production build |
| `npm start` | Start the production server |
| `npm run db:migrate` | Create and apply a development migration |
| `npm run db:deploy` | Apply committed migrations |

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Searchable, paginated note board |
| `/posts/new` | Create a note |
| `/posts/[id]` | Read a note and join its discussion |
| `/posts/[id]/edit` | Edit your own note |
| `/bookmarks` | View saved notes |
| `/notifications` | View and clear notifications |
| `/users/[id]` | View and edit your profile |
| `/digest` | View the in-app weekly digest |
| `/api/posts/[id]/export` | Download a note as Markdown |

## Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | Required for persistence |
| `MAX_UPLOAD_MB` | Maximum upload size per file | `10` |
| `PRISMA_HIDE_UPDATE_MESSAGE` | Hide Prisma CLI update messages | Optional |
| `PRISMA_GENERATE_NO_WARNINGS` | Reduce Prisma generation output | Optional |

If `DATABASE_URL` is unavailable, the home board can render in read-only preview mode with sample content. Persistence, authentication, and user actions require a working PostgreSQL connection.

## Data and security notes

- Passwords are hashed with Argon2.
- Sessions use random tokens stored as SHA-256 hashes in the database.
- Note and reply content is sanitized before storage.
- Attachments are checked by extension and file signature before storage.
- Images are resized with Sharp according to the selected resolution.
- Attachment downloads require authentication.
- Users can edit and delete only their own notes and replies.
- Deleting a note cascades to its replies, attachments, tags, bookmarks, reactions, and related records through PostgreSQL relationships.
- The application is intended for a trusted small group. Add deployment-level rate limiting, backups, monitoring, and object storage before operating it at larger scale.
