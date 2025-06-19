import jwt from "jsonwebtoken";
import { Request } from "express";

export const generateToken = (userId: string): string => {
	if (!process.env.JWT_SECRET) {
		throw new Error("JWT_SECRET is not defined in environment variables");
	}
	const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
		expiresIn: "1d",
	});
	return token;
};

export const getUserId = (req: Request): string | null => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) return null;
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			userId: string;
		};
		return decoded.userId;
	} catch (error) {
		console.error("Invalid token", error);
		return null;
	}
};
