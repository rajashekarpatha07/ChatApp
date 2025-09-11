import express from "express";
import type { Request, Response } from "express";
import cors from 'cors'
import cookieParser from "cookie-parser"
import userroutes from "./routes/user.route"
import { Server } from "socket.io";
import { initializeSocketIO } from "./sockets/socket";
import http from "http"
import { ApiError } from "./utilities/ApiError";
import { ApiResponse } from "./utilities/ApiResponce";

const app = express();
const server = http.createServer(app)
app.use(cors({
    origin:"*",
    methods:["GET","POST","PATCH"]
}))
const port = 8000;
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/api/auth", userroutes)
app.get("/", (req:Request, res:Response)=>{
    res.send("Hello")
})

app.get('/chat', (req, res) => {
    // For a real app, you'd use a proper frontend setup
    // For now, we send a simple HTML file to test
    res.sendFile(__dirname + '/chat.html');
});

app.get('/login',(req, res)=>{
    res.sendFile(__dirname+'/login.html')
})


// --- Socket.io Integration ---
const io = new Server(server, {
    cors: {
        origin: "*", // Be more specific in production!
        methods: ["GET", "POST"],
    }
});

initializeSocketIO(io)

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof ApiError) {
        return res.status(err.statuscode).json(new ApiResponse(err.statuscode, null, err.message));
    }
    console.error(err);
    res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT}/chat to test the chat client.`);
});
