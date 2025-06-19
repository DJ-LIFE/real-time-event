import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { schemaQL } from "./schema";
import { PrismaClient } from "../generated/prisma/client";
import { resolvers } from "./resolvers";
import { createHandler } from "graphql-http/lib/use/express";
import { makeExecutableSchema } from "@graphql-tools/schema";

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Prisma client
const prisma = new PrismaClient();

// Set port
const PORT = process.env.PORT || 8082;

// Create HTTP server
const httpServer = createServer(app);

// Set up Socket.io server
export const io = new Server(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

// Handle socket connections
io.on("connection", (socket) => {
	console.log(`New client connected: ${socket.id}`);

	// Allow clients to join event-specific rooms
	socket.on("joinEventRoom", (eventId) => {
		socket.join(`event:${eventId}`);
		console.log(`Client ${socket.id} joined room for event ${eventId}`);
	});

	// Allow clients to leave event-specific rooms
	socket.on("leaveEventRoom", (eventId) => {
		socket.leave(`event:${eventId}`);
		console.log(`Client ${socket.id} left room for event ${eventId}`);
	});

	socket.on("disconnect", () => {
		console.log(`Client disconnected: ${socket.id}`);
	});
});

// Database seeding function
const seedFunction = async () => {
	try {
		// Check if users exist
		const userCount = await prisma.user.count();

		// Create admin user if no users exist
		let adminUser;
		if (userCount === 0) {
			adminUser = await prisma.user.create({
				data: {
					name: "admin",
					email: "admin@gmail.com",
					password: "admin@12345",
				},
			});
			console.log("Created admin user:", adminUser.id);
		}

		// Check if events exist
		const eventCount = await prisma.event.count();

		// Create sample events if no events exist
		if (eventCount === 0) {
			await prisma.event.createMany({
				data: [
					{
						name: "India Tech Summit",
						location: "Bangalore, India",
						startTime: new Date("2025-09-12T09:00:00.000Z"),
					},
					{
						name: "Diwali Celebration",
						location: "Mumbai, India",
						startTime: new Date("2025-10-20T18:30:00.000Z"),
					},
					{
						name: "Startup Pitch Event",
						location: "Delhi, India",
						startTime: new Date("2025-08-05T14:00:00.000Z"),
					},
					{
						name: "AI & Machine Learning Conference",
						location: "Hyderabad, India",
						startTime: new Date("2025-07-15T10:00:00.000Z"),
					},
					{
						name: "Digital Marketing Workshop",
						location: "Chennai, India",
						startTime: new Date("2025-06-22T13:00:00.000Z"),
					},
					{
						name: "Blockchain Developer Meetup",
						location: "Pune, India",
						startTime: new Date("2025-11-08T16:00:00.000Z"),
					},
					{
						name: "Web3 Innovation Summit",
						location: "Gurgaon, India",
						startTime: new Date("2025-05-18T11:30:00.000Z"),
					},
					{
						name: "Cyber Security Conference",
						location: "Kolkata, India",
						startTime: new Date("2025-12-03T09:30:00.000Z"),
					},
				],
			});

			console.log("Database seeded with initial events.");
		}

		console.log("Database seeding complete.");
	} catch (error) {
		console.error("Error seeding database:", error);
	}
};

// Create GraphQL schema
const schema = makeExecutableSchema({
	typeDefs: schemaQL,
	resolvers,
});

// Create and use the GraphQL handler
app.use(
	"/graphql",
	createHandler({
		schema,
		context: (req) => {
			return { req, prisma };
		},
	})
);

// Add GraphiQL UI
app.get("/graphiql", (req, res) => {
	res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>GraphiQL</title>
    <link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />
  </head>
  <body style="margin: 0;">
    <div id="graphiql" style="height: 100vh;"></div>
    <script
      crossorigin
      src="https://unpkg.com/react/umd/react.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/graphiql/graphiql.min.js"
    ></script>
    <script>
      const fetcher = GraphiQL.createFetcher({ url: '/graphql' });
      ReactDOM.render(
        React.createElement(GraphiQL, { fetcher }),
        document.getElementById('graphiql'),
      );
    </script>
  </body>
  </html>
  `);
});

// Start the server
async function startServer() {
	try {
		// Seed the database
		await seedFunction();

		// Start the HTTP server
		httpServer.listen(PORT, () => {
			console.log(
				`Server is running on http://localhost:${PORT}/graphql`
			);
			console.log(`GraphiQL UI: http://localhost:${PORT}/graphiql`);
			console.log(`Socket.io server is running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Error starting server:", error);
		process.exit(1);
	}
}

// Run the server
startServer();
