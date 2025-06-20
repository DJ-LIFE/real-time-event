import { graphqlRequest } from "@/lib/graphqlClient";
import { EventsState, Event, User } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { gql } from "graphql-request";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const GET_EVENTS_QUERY = gql`
	query GetEvents {
		events {
			id
			name
			location
			startTime
			attendees {
				id
				name
			}
		}
	}
`;

const GET_EVENT_QUERY = gql`
	query GetEvent($id: ID!) {
		event(id: $id) {
			id
			name
			location
			startTime
			attendees {
				id
				name
			}
		}
	}
`;

const JOIN_EVENT_MUTATION = gql`
	mutation JoinEvent($eventId: ID!) {
		joinEvent(eventId: $eventId) {
			id
			name
			location
			startTime
			attendees {
				id
				name
			}
		}
	}
`;

export const useEventStore = create<EventsState>()(
	persist(
		(set, get) => ({
			events: [] as Event[],
			currentEvent: null,
			loading: false,
			error: null as string | null,
			joinedEvents: [] as string[],

			fetchEvents: async () => {
				set({ loading: true, error: null });
				try {
					const token = localStorage.getItem("token");
					const response = await graphqlRequest<{ events: Event[] }>(
						GET_EVENTS_QUERY,
						{},
						token || ""
					);
					setTimeout(() => {
						set({
							events: response.events,
							loading: false,
							error: null,
						});
					}, 1000);
				} catch (error) {
					set({
						loading: false,
						error:
							error instanceof Error
								? error.message
								: "An unknown error occurred",
					});
				}
			},

			fetchEvent: async (id: string) => {
				set({ loading: true, error: null });
				try {
					const token = localStorage.getItem("token");
					const response = await graphqlRequest<{ event: Event }>(
						GET_EVENT_QUERY,
						{ id },
						token || ""
					);
					set({
						currentEvent: response.event,
						loading: false,
						error: null,
					});
				} catch (error) {
					set({
						loading: false,
						error:
							error instanceof Error
								? error.message
								: "An unknown error occurred",
					});
				}
			},
			joinEvent: async (eventId: string) => {
				set({ loading: true, error: null });
				try {
					const token = localStorage.getItem("token");
					const response = await graphqlRequest<{ joinEvent: Event }>(
						JOIN_EVENT_MUTATION,
						{ eventId },
						token || ""
					);

					const updatedEvent = response.joinEvent;

					const event = get().events.map((event) =>
						event.id === updatedEvent.id ? updatedEvent : event
					);

					const currentEvent = get().currentEvent;
					if (currentEvent && currentEvent.id === eventId) {
						set({ currentEvent: updatedEvent });
					}

					set({
						events: event,
						joinedEvents: [...get().joinedEvents, eventId],
						loading: false,
						error: null,
					});

					return updatedEvent;
				} catch (error) {
					set({
						loading: false,
						error:
							error instanceof Error
								? error.message
								: "An unknown error occurred",
					});
					throw error; // Re-throw the error for further handling if needed
				}
			},

			isJoined: (eventId: string) => {
				return get().joinedEvents.includes(eventId);
			},

			updateAttendees: (eventId: string, newUser: User) => {
				const events = get().events.map((event) => {
					if (event.id === eventId) {
						const isUserAlreadyAttending = event.attendees?.some(
							(attendee) => attendee.id === newUser.id
						);

						if (!isUserAlreadyAttending) {
							return {
								...event,
								attendees: [
									...(event.attendees || []),
									newUser,
								],
							};
						}
					}
					return event;
				});

				const currentEvent = get().currentEvent;
				if (currentEvent && currentEvent.id === eventId) {
					const isUserAlreadyAttending = currentEvent.attendees?.some(
						(attendee) => attendee.id === newUser.id
					);
					if (!isUserAlreadyAttending) {
						set({
							currentEvent: {
								...currentEvent,
								attendees: [
									...(currentEvent.attendees || []),
									newUser,
								],
							},
						});
					}
				}
				set({ events });
			},
		}),
		{
			name: "events-storage",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({ joinedEvents: state.joinedEvents }),
		}
	)
);
