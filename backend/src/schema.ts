import { buildSchema } from "graphql";

export const schemaQL = buildSchema(`
        type User {
            id: ID!
            name: String!
            email: String!
            events: [Event!]!
        }

        type Event {
            id: ID!
            name: String!
            location: String!
            startTime: String!
            attendees: [User!]!
        }

        type AuthPayload {
            token: String!
            user: User!
        }

        type Query {
            events: [Event!]!
            event(id: ID!): Event
            me: User
        }

        type Mutation {
            login(email: String!, password: String!): AuthPayload
            joinEvent(eventId: ID!): Event
        }

        schema {
            query: Query
            mutation: Mutation
        }
    `);
