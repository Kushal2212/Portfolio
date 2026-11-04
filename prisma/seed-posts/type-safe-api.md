The most expensive bug I have shipped was a mismatch. The client expected `user.name`, the API had started returning `user.fullName`, and TypeScript said everything was fine because the response had been cast to `any` three years earlier. I have been suspicious of hand-written API types ever since.

## The schema is the contract

With tRPC, the input schema is not an afterthought. Zod checks the data at runtime and infers the TypeScript type at compile time.

```ts
import { z } from "zod";
import { initTRPC } from "@trpc/server";

const t = initTRPC.context<Context>().create();

export const postInput = z.object({
  title: z.string().min(3).max(160),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  content: z.string().min(20),
  tags: z.array(z.string().max(40)).max(8).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
});

export const postRouter = t.router({
  create: t.procedure.input(postInput).mutation(async ({ input, ctx }) => {
    if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });
    return ctx.db.post.create({
      data: { ...input, readingTime: estimateReadingTime(input.content) },
    });
  }),
});
```

The resolver uses the input type. The resolver's return type becomes the output. No interface file, no generated client, no drift.

## The client knows the shape

```tsx
const createPost = trpc.post.create.useMutation({
  onSuccess: () => utils.post.list.invalidate(),
});

createPost.mutate({ title, slug, content, status: "PUBLISHED" });
```

If I rename a field, the editor underlines every call site that still uses the old name. If I make a field required, the compiler stops me from shipping a call without it. That is the whole pitch, and it holds up.

## Errors are part of the contract

A typed success path is only half the job. I define a small error shape and map domain errors into it:

```ts
throw new TRPCError({
  code: "CONFLICT",
  message: "SLUG_TAKEN",
  cause: { field: "slug" },
});
```

The client can switch on `error.data?.code` and show a message next to the right field. A string enum in `message` is not beautiful, but it is stable. Prose gets reworded.

## Validation is not authorization

Zod tells you the shape is right. It does not tell you the person is allowed. Every protected procedure needs an explicit check, and every query should be scoped by the current user or role. I put that in middleware:

```ts
const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, session: ctx.session } });
});
```

Middleware proves who. The resolver proves what. You need both.

## When not to use it

tRPC is a poor fit when the API has unknown consumers: a public mobile app, a partner integration, a webhook. In those cases I reach for a documented REST or GraphQL surface. Type safety inside one TypeScript codebase is a different problem from compatibility outside it.

For an admin panel like this one, server actions give a similar guarantee with less setup. The important part is the same: keep the contract in one place.
