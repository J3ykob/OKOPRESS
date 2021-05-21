const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
const fs = require('fs').promises

interface Task {
	id: number
	title: string
	parent?: number
}
interface ResolverArgs {
	title?: string
	parentId?: number
	id?: number
}
interface DB {
	db: any
}

const typeDefs = gql`
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
`

const resolvers = {
	Task: {
		parent: async (parent:Task, args, ctx:DB) => {
			const db = await ctx.db
			return db.tasks.find((task:Task) => {
				return task.id == parent.parent
			})
		},
	},

	Query: {
		tasks: async (parent, args, ctx:DB) => {
			try {
				const db = ctx.db
				return db.tasks
			} catch (err) {
				throw new Error(err)
			}
		},
		task: async (parent, args:ResolverArgs, ctx:DB) => {
			try {
				const db = ctx.db
				const task = db.tasks.find((task:Task) => {
					return task.id == args.id
				})
				return task
			} catch (err) {
				throw new Error(err)
			}
		},
	},
	Mutation: {
		createTask: async (parent, args:ResolverArgs, ctx:DB) => {
			try {
				const db = ctx.db

				const newTask = {
					id: db.tasks[db.tasks.length - 1].id + 1, //można zrobić ładniej, ale umówmy się - to baza danych w JSONie :D
					title: args.title,
					parent: args.parentId,
				}
				db.tasks.push(newTask)
				await fs.writeFile('database.json', JSON.stringify(db, null, 2))
				return newTask.id
			} catch (err) {
				throw new Error(err)
			}
		},
	},
}

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: async ():Promise<any> => {
		return {
			db: JSON.parse(await fs.readFile('database.json').then((db:DB) => db.toString())),
		}
	},
})

const app = express()
server.applyMiddleware({ app })

app.listen({ port: 4000 }, () => console.log('Now browse to http://localhost:4000' + server.graphqlPath))
