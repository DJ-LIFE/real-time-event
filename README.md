# Real-Time Event Check-In App

A real-time event engagement platform where users can browse upcoming events and check in to them. The moment someone joins an event, all other users viewing the same event see the update instantly.

## Technologies Used

### Backend

-   TypeScript
-   Node.js
-   GraphQL
-   Prisma with PostgreSQL
-   Socket.io for real-time updates

### Frontend

-   React Native (Expo)
-   Zustand for state management

## Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   PostgreSQL
-   npm or yarn

### Backend Setup

1. Clone this repository

```bash
git clone https://github.com/yourusername/team-detrator.git
cd team-detrator/backend
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables
   Create a `.env` file in the `backend` directory with the following contents:

```
DATABASE_URL="postgresql://username:password@localhost:5432/team_detrator?schema=public"
JWT_SECRET="your-secret-key"
PORT=8082
```

4. Run database migrations

```bash
npx prisma migrate dev
```

5. Start the backend server

```bash
npm run dev
# or
yarn dev
```

The backend server will be running at `http://localhost:8082` with GraphQL endpoint at `http://localhost:8082/graphql` and GraphiQL UI at `http://localhost:8082/graphiql`.

### Frontend Setup

1. Navigate to the frontend directory

```bash
cd ../frontend
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the Expo development server

```bash
npm start
# or
yarn start
```

## API Documentation

### Authentication

The app uses JWT authentication. Login with:

```json
{
	"query": "mutation { login(email: \"admin@gmail.com\", password: \"admin@12345\") { token user { id name email } } }"
}
```

Include the token in subsequent requests:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

### GraphQL Endpoints

1. **Get All Events**

```json
{
	"query": "query { events { id name location startTime attendees { id name email } } }"
}
```

2. **Get Current User**

```json
{
	"query": "query { me { id name email events { id name } } }"
}
```

3. **Join an Event**

```json
{
	"query": "mutation { joinEvent(eventId: \"EVENT_ID_HERE\") { id name location startTime attendees { id name email } } }"
}
```

### Socket.io Events

1. **Join Event Room**

```javascript
socket.emit("joinEventRoom", eventId);
```

2. **Listen for User Joined Event**

```javascript
socket.on("userJoinedEvent", (data) => {
	console.log(`User ${data.user.name} joined event ${data.eventId}`);
});
```

3. **Listen for Event Updates**

```javascript
socket.on(`event:${eventId}:userJoined`, (data) => {
	console.log(`User ${data.user.name} joined event ${data.eventId}`);
	console.log(`Total attendees: ${data.attendeeCount}`);
});
```

## Example Credentials

-   Email: admin@gmail.com
-   Password: admin@12345

## Project Structure

```
team-detrator/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   ├── src/
│   │   ├── index.ts        # Server entry point
│   │   ├── resolvers.ts    # GraphQL resolvers
│   │   ├── schema.ts       # GraphQL schema
│   │   └── utils/
│   │       └── auth.ts     # Authentication utilities
│   └── package.json
└── frontend/
    ├── App.tsx            # Main application component
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── screens/       # Application screens
    │   ├── hooks/         # Custom hooks
    │   ├── store/         # Zustand store
    │   └── api/           # API communication
    └── package.json
```

## License

This project is licensed under the MIT License.
