import express from "express";
import type { Express, Request, Response } from "express";
import cors from 'cors'

const app = express();
app.use(cors({
    origin:"*",
    methods:["GET","POST","PATCH"]
}))
const port = 8000;

app.get("/", (req:Request, res:Response)=>{
    res.send("Hello")
})

app.listen(port, ()=>{
    console.log("Server is running on Port", port)
})