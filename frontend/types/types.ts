// frontend/src/types/index.ts
export interface User {
	id: string;
	name: string;
	email: string;
	events?: Event[];
}

export interface Event {
	id: string;
	name: string;
	location: string;
	startTime: string;
	attendees?: User[];
}

export interface AuthState {
	token: string | null;
	user: User | null;
	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
}

export interface EventsState {
	events: Event[];
	currentEvent: Event | null;
	loading: boolean;
	error: string | null;
	joinedEvents: string[];
	fetchEvents: () => Promise<void>;
	fetchEvent: (id: string) => Promise<void>;
	joinEvent: (eventId: string) => Promise<Event | null>;
	isJoined: (eventId: string) => boolean;
	updateAttendees: (eventId: string, newUser: User) => void;
}
