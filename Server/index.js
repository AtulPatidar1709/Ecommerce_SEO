import express from "express";
import userRouter from "./Routes/userRoutes.js";
import productRouter from "./Routes/productRoutes.js";
import eventRoutes from "./Routes/events.js";
import RecommendationRouter from "./Routes/recommendations.js";
import PairRoutes from "./Routes/pairs.js";
import cartRoutes from "./Routes/cartRoutes.js";
import categoryRoutes from "./Routes/categoryRoutes.js";
import addressRoutes from "./Routes/address.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("User get")
});

//User Routes
app.use("/api/user" , userRouter);

//Product Routes
app.use("/api/product" , productRouter);

//Event Interest Section
app.use('/api/events', eventRoutes);

app.use('/api/pairs', PairRoutes);

app.use('/api/cart', cartRoutes);

app.use("/api/categories", categoryRoutes);

//Recommendation Section
// app.use('/api/spin', spinRoute);

app.use("/api/addresses", addressRoutes); 

app.use('/api/recommendations', RecommendationRouter);

app.listen(8080, (req,res) => {
    console.log("Hello World")
});
