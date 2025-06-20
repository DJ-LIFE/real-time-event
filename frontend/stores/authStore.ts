import { graphqlRequest } from "@/lib/graphqlClient";
import { AuthState, User } from "@/types/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const loginAPi = async (
	email: string,
	password: string
): Promise<{ token: string; user: User }> => {
	const response = await graphqlRequest<{
		login: { token: string; user: User };
	}>(`
        mutation {
            login(email: "${email}", password: "${password}") {
                token
                user {
                    id
                    name
                    email
                }
            }
        }
    `);
	return response.login;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			token: null,
			user: null,
			isAuthenticated: false,

			login: async (email: string, password: string) => {
				try {
					const { token, user } = await loginAPi(email, password);
					set({
						token,
						user,
						isAuthenticated: true,
					});
				} catch (error) {
					console.error("Login failed:", error);
				}
			},

			logout: () => {
				set({
					token: null,
					user: null,
					isAuthenticated: false,
				});
			},
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => localStorage),
		}
	)
);
