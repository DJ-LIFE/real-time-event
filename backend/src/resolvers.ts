import { PrismaClient } from "../generated/prisma/client";
const prisma = new PrismaClient();
import { Request } from "express";
import { io } from "./index";
import { generateToken, getUserId } from "./utils/auth";

export const resolvers = {
	Query: {
		async events() {
			return await prisma.event.findMany({
				include: {
					attendees: true,
				},
			});
		},
		async event(_: any, { id }: { id: string }) {
			return await prisma.event.findUnique({
				where: { id },
				include: {
					attendees: true,
				},
			});
		},
		me: (_: any, __: any, context: { req: Request }) => {
			const userId = getUserId(context.req);
			if (!userId) {
				throw new Error("Not authenticated");
			}
			return prisma.user.findUnique({
				where: { id: userId },
			});
		},
	},
	Mutation: {
		async login(
			_: any,
			{ email, password }: { email: string; password: string }
		) {
			const user = await prisma.user.findUnique({
				where: { email },
			});

			if (!user || user.password !== password) {
				throw new Error("Invalid email or password");
			}

			const token = generateToken(user.id);
			if (!token) {
				console.error("Failed to generate token");
			}
			return {
				token,
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
				},
			};
		},
		async joinEvent(
			_: any,
			{ eventId }: { eventId: string },
			{ req }: { req: Request }
		) {
			const userId = getUserId(req);
			if (!userId) {
				throw new Error("Not authenticated");
			}

			// Get user details for the socket event
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					name: true,
					email: true,
				},
			});

			if (!user) {
				throw new Error("User not found");
			}

			const updatedEvent = await prisma.event.update({
				where: { id: eventId },
				data: {
					attendees: {
						connect: { id: userId },
					},
				},
				include: {
					attendees: true,
				},
			});

			// Emit general event update
			io.emit("eventUpdated", updatedEvent);

			// Emit event-specific updates for clients in that event's room
			io.to(`event:${eventId}`).emit("userJoinedEvent", {
				eventId,
				user,
				attendeeCount: updatedEvent.attendees.length,
			});

			// Also broadcast to all clients for real-time dashboard updates
			io.emit(`event:${eventId}:userJoined`, {
				eventId,
				user,
				attendeeCount: updatedEvent.attendees.length,
			});

			console.log(`User ${userId} joined event ${eventId}`);

			return updatedEvent;
		},
	},
	User: {
		events: (parent: any) => {
			return prisma.user
				.findUnique({
					where: { id: parent.id },
				})
				.events();
		},
	},

	Event: {
		attendees: (parent: any) => {
			return prisma.event
				.findUnique({
					where: { id: parent.id },
				})
				.attendees();
		},
	},
};
