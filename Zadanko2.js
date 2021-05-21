const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const fs = require('fs').promises;
const typeDefs = gql `
	type Task {
		id: Int!
		title: String!
		parent: Task
	}

	type Query {
		task(id: Int): Task
		tasks: [Task]!
	}

	type Mutation {
		createTask(title: String, parentId: Int): Int!
	}
`;
const resolvers = {
    Task: {
        parent: async (parent, args, ctx) => {
            const db = await ctx.db;
            return db.tasks.find((task) => {
                return task.id == parent.parent;
            });
        },
    },
    Query: {
        tasks: async (parent, args, ctx) => {
            try {
                const db = ctx.db;
                return db.tasks;
            }
            catch (err) {
                throw new Error(err);
            }
        },
        task: async (parent, args, ctx) => {
            try {
                const db = ctx.db;
                const task = db.tasks.find((task) => {
                    return task.id == args.id;
                });
                return task;
            }
            catch (err) {
                throw new Error(err);
            }
        },
    },
    Mutation: {
        createTask: async (parent, args, ctx) => {
            try {
                const db = ctx.db;
                const newTask = {
                    id: db.tasks[db.tasks.length - 1].id + 1,
                    title: args.title,
                    parent: args.parentId,
                };
                db.tasks.push(newTask);
                await fs.writeFile('database.json', JSON.stringify(db, null, 2));
                return newTask.id;
            }
            catch (err) {
                throw new Error(err);
            }
        },
    },
};
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
        return {
            db: JSON.parse(await fs.readFile('database.json').then((db) => db.toString())),
        };
    },
});
const app = express();
server.applyMiddleware({ app });
app.listen({ port: 4000 }, () => console.log('Now browse to http://localhost:4000' + server.graphqlPath));
//# sourceMappingURL=Zadanko2.js.map