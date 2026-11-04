I am not a database specialist, but I have spent enough evenings with slow queries to keep a short list of patterns. None of them are clever. They are the things I wish I had learned before my first production incident.

## Indexes that pay rent

An index costs something. Writes get slower and storage grows. The index needs a query that uses it. I start with foreign keys and columns I filter by constantly, then add the rest after measuring.

Partial indexes are underused. On a blog, the public listing only wants published posts:

```sql
CREATE INDEX posts_published_at_idx
  ON "Post" (status, "publishedAt" DESC)
  WHERE status = 'PUBLISHED';
```

The index is smaller, faster to update and matches the query the site actually runs.

## Cursor pagination

`OFFSET 2000` makes the database read and throw away 2,000 rows. It also breaks when new rows arrive in the middle of a scroll. Cursors are stable and cheap:

```sql
SELECT id, title, "publishedAt"
FROM "Post"
WHERE status = 'PUBLISHED'
  AND "publishedAt" < $1
ORDER BY "publishedAt" DESC
LIMIT 20;
```

The cursor is the last row's timestamp. For ties, add `(publishedAt, id)` to the ordering key and compare both. A little more code, a lot less drift.

## Put rules in the schema

Application code has bugs. A unique index usually does not. I keep important rules in the database:

```sql
ALTER TABLE "Message"
  ADD CONSTRAINT message_email_len CHECK (char_length(email) < 320);

CREATE UNIQUE INDEX one_site_settings ON "SiteSettings" ((true));
```

The singleton-table trick, a unique index on a constant expression, makes "there can only be one settings row" true at the database level. When I catch myself writing "this should always be..." in a comment, I ask whether the database can enforce it.

## Keep transactions short

Wrap multi-step writes so a failure cannot leave a half-state:

```ts
await prisma.$transaction([
  prisma.post.update({ where: { id }, data: { status: "PUBLISHED" } }),
  prisma.tag.updateMany({
    where: { posts: { some: { id } } },
    data: { updatedAt: new Date() },
  }),
]);
```

Do not call an external API inside a transaction. The network has no respect for your lock time.

## Two small habits

1. Run `EXPLAIN ANALYZE` before and after an index change. The query plan is the truth. My intuition is a hypothesis.
2. Log slow queries from day one. A 300ms query is easy to fix on a quiet Tuesday and frightening during a launch.

## When to break the rules

Denormalize when reads are hot and writes are cold. Add a cache when the database is the bottleneck, not because caching sounds mature. Use a materialized view when a dashboard runs the same expensive join on every load.

The goal is not a perfect schema. It is a schema that is boring at 2am, when something is on fire and you need to understand a query written eighteen months ago.
