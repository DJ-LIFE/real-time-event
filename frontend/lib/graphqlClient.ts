import { request } from "graphql-request";
export const API_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082/graphql";

export const graphqlRequest = async <T>(
	query: string,
	variables?: Record<string, any>,
	token?: string
): Promise<T> => {
	const headers: HeadersInit = {
		"Content-Type": "application/json",
	};
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	}

	return request<T>(API_URL, query, variables, headers);
};
