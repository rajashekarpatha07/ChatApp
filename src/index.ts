import express from "express";
import type { Express, Request, Response } from "express";
import cors from 'cors'
import cookieParser from "cookie-parser"
import userroutes from "./routes/user.route"

const app = express();
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

app.listen(port, ()=>{
    console.log("Server is running on Port", port)
})