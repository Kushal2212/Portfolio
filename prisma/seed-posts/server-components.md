The first time I used the App Router, I spent a week putting `"use client"` on everything. It worked, but it was slower than the pages router and twice as confusing. The problem was my mental model, not the framework.

## Two runtimes, one tree

I kept thinking of server components as SSR with an extra hydration pass. They are better understood as two runtimes sharing a component tree.

Server components run only on the server. They can read the database, use secrets and ship no JavaScript. Client components run on the server for the first HTML and again in the browser. They are the only place with state, effects and event handlers.

The `"use client"` directive is not a switch for the whole page. It marks a boundary. Everything imported below that boundary is a client component. Everything above it stays on the server.

```tsx
// app/blog/page.tsx
import { getPosts } from "@/lib/posts";
import { PostFilters } from "./post-filters"; // client

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <main>
      <PostFilters />
      <PostGrid posts={posts} />
    </main>
  );
}
```

## Data comes down, events go up

Server components cannot take functions as props because functions are not serializable. That sounds like a limitation until you design around it. Instead of passing an `onSearch` handler down, I put the query in the URL and let a small client component update it.

```tsx
const params = useSearchParams();
const router = useRouter();

function onSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  router.push("/blog?q=" + encodeURIComponent(String(data.get("q") ?? "")));
}
```

The server re-renders the list. The client owns the input. I use this for search, filters and pagination. It gives me shareable URLs and browser navigation without extra code.

## Three habits

**Fetch where the data is used.** A page can await its own query. I do not fetch at the top and pass props through six layers unless the layout really owns the data. React's `cache` helper deduplicates repeated requests in one render.

**Push client boundaries to the leaves.** The theme toggle needs state. The page does not. Small islands keep the bundle small and the server tree intact.

**Pass plain data.** Dates, objects, arrays and primitives cross the boundary. Class instances do not. If an ORM returns a special object, map it before giving it to a client component. That is also a good time to trim fields the client does not need.

## What surprised me

- Server components can be async. Data loading reads like normal code, and a whole category of hooks disappears.
- Suspense is the loading state. I design the fallback as part of the page instead of adding a spinner at the end.
- The client bundle is where the real win is. Moving a markdown renderer to the server cut 70kB from my blog page without changing a pixel.

The fog lifted when I stopped asking "where does this render?" and started asking "does this need to be interactive?" Most things do not.
