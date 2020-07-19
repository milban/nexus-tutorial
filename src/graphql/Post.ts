import { schema } from 'nexus';

schema.objectType({
  name: 'Post',
  definition(t) {
    t.int('id', {
      nullable: false,
    });
    t.string('title', {
      nullable: false,
    });
    t.string('body', {
      nullable: false,
    });
    t.boolean('published', {
      nullable: false,
    });
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
        return ctx.db.posts.filter((p) => p.published === false);
      },
    });
    t.field('posts', {
      nullable: false,
      type: 'Post',
      list: true,
      resolve(_root, _args, ctx) {
        return ctx.db.posts.filter((p) => p.published === true);
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
          id: ctx.db.posts.length + 1,
          title: _args.input.title,
          body: _args.input.body,
          published: false,
        };
        ctx.db.posts.push(draft);
        return draft;
      },
    });
    t.field('publish', {
      type: 'Post',
      args: {
        draftId: schema.intArg({ required: true }),
      },
      resolve(_root, _args, ctx) {
        const draftToPublish = ctx.db.posts.find((p) => p.id === _args.draftId);

        if (!draftToPublish) {
          throw new Error('Could not find draft with id ' + _args.draftId);
        }

        draftToPublish.published = true;

        return draftToPublish;
      },
    });
  },
});
