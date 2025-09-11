import { Server, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../db/ConnectionPool";
import cookie from "cookie";

interface AuthenticatedSocket extends Socket {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export const initializeSocketIO = (io: Server) => {
  // --- Socket.io Middleware for Authentication ---
  // This runs for every new connecting socket
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      // Parse cookies from the handshake request
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.accessToken;

      if (!token) {
        return next(new Error("Authentication error: No token provided."));
      }

      const secret = process.env.ACCESS_TOKEN_SECRET;
      if (!secret) {
        return next(
          new Error("Server configuration error: JWT secret is not set.")
        );
      }

      // Verify the JWT
      const decoded = jwt.verify(token, secret) as JwtPayload;

      // Fetch user details from the database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true, email: true },
      });

      if (!user) {
        return next(new Error("Authentication error: User not found."));
      }

      // Attach user to the socket object for later use
      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      return next(new Error("Authentication error: Invalid token."));
    }
  });

  // --- Main Connection Handler ---
  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(
      `✅ User connected: ${socket.user?.username} (ID: ${socket.id})`
    );

    // Join a room (e.g., a general chat room)
    socket.join("general-chat");

    // Announce that a new user has joined to everyone else
    socket
      .to("general-chat")
      .emit("user:joined", `${socket.user?.username} has joined the chat`);

    // --- Event Listener for incoming messages ---
    socket.on("message:send", (message: string) => {
      if (!socket.user) return; // Should not happen due to middleware

      console.log(`[${socket.user.username}]: ${message}`);

      // Broadcast the message to everyone else in the room
      io.to("general-chat").emit("message:receive", {
        message,
        user: {
          id: socket.user.id,
          username: socket.user.username,
        },
      });
    });

    // --- Disconnect Handler ---
    socket.on("disconnect", () => {
      console.log(
        `❌ User disconnected: ${socket.user?.username} (ID: ${socket.id})`
      );
      // Announce that a user has left
      io.to("general-chat").emit(
        "user:left",
        `${socket.user?.username} has left the chat`
      );
    });
  });
};
