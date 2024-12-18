import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors" ;

import dotenv from "dotenv" ;
dotenv.config()


const app = express();
const server = createServer(app);


const io = new Server(server, {
  cors: {
    origin: "*",  
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("send-location", (data) => {
    console.log(`Location received from ${socket.id}:`, data);
    io.emit("receive-location", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    io.emit("user-disconnected", socket.id);
  });


  socket.on("connect_error", (err) => {
    console.log("Connection error:", err);
  });   
});


app.use(cors({
    origin : "*",
    methods: ["GET", "POST"]
}))



// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the correct directory
app.use(express.static(path.join(__dirname, "../client/dist")));

// Catch-all route for the React/Vite frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});




const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
