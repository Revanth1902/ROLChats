const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const friendRoutes = require("./routes/friend");
const messageRoutes = require("./routes/messageroute");
const chatRoutes = require("./routes/chat");
const notificationRoutes = require("./routes/notification");
const userRoutes = require("./routes/user");
const { mongoURI, sessionSecret } = require("./config");

const app = express();
app.use(express.json());
app.use(cors());

// Session middleware setup
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoURI }),
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/user", userRoutes);
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const server = http.createServer(app);
const io = socketIo(server);

// Attach io to req for all routes
app.use((req, res, next) => {
  req.io = io;
  next();
});
io.on("connection", (socket) => {
  console.log("a user connected");

  // Update user online status
  socket.on("userOnline", (userId) => {
    User.findOneAndUpdate({ userId }, { online: true }, { new: true }).then(
      (user) => {
        io.emit("userStatusUpdate", { userId, online: true });
      }
    );
  });

  socket.on('disconnect', () => {
    User.findOneAndUpdate({ userId }, { online: false, lastSeen: Date.now() }, { new: true })
      .then(user => {
        io.emit('userStatusUpdate', { userId, online: false });
      });
  });
  

  socket.on("sendMessage", (data) => {
    const message = new Message(data);
    message.save().then(() => {
      io.to(data.to).emit("receiveMessage", message);
    });
  });

  socket.on("readMessages", (data) => {
    Message.updateMany(
      { _id: { $in: data.messageIds }, to: data.userId },
      { read: true }
    ).then(() => {
      io.to(data.userId).emit("messagesRead", data.messageIds);
    });
  });

  socket.on("sendNotification", (data) => {
    const notification = new Notification(data);
    notification.save().then(() => {
      io.to(data.userId).emit("receiveNotification", notification);
    });
  });

  socket.on("typing", (data) => {
    io.to(data.toUserId).emit("typing", { userId: data.userId });
  });

  socket.on("lastSeen", (data) => {
    User.findById(data.userId).then((user) => {
      user.lastSeen = Date.now();
      user.save();
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
