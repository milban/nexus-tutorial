import { schema } from 'nexus';

schema.objectType({
  name: 'Post',
  definition(t) {
    t.int('id');
    t.string('title');
    t.string('body');
    t.boolean('published');
  },
});

schema.extendType({
  type: 'Query',
  definition(t) {
    t.field('drafts', {
      nullable: false,
      type: 'Post',
      list: true,
      resolve(_root, _args, ctx) {
        return ctx.db.post.findMany({ where: { published: false } });
      },
    });
    t.field('posts', {
      nullable: false,
      type: 'Post',
      list: true,
      resolve(_root, _args, ctx) {
        return ctx.db.post.findMany({ where: { published: true } });
      },
    });
  },
});

schema.inputObjectType({
  name: 'CreateDraftInput',
  definition(t) {
    t.string('title', { required: true });
    t.string('body', { required: true });
  },
});

schema.extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createDraft', {
      type: 'Post',
      args: {
        input: schema.arg({ type: 'CreateDraftInput', required: true }),
      },
      nullable: false,
      resolve(_root, _args, ctx) {
        const draft = {
          title: _args.input.title,
          body: _args.input.body,
          published: false,
        };
        return ctx.db.post.create({ data: draft });
      },
    });
    t.field('publish', {
      type: 'Post',
      args: {
        draftId: schema.intArg({ required: true }),
      },
      resolve(_root, _args, ctx) {
        return ctx.db.post.update({
          where: { id: _args.draftId },
          data: {
            published: true,
          },
        });
      },
    });
  },
});
