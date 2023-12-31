require("dotenv").config();

const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

const paypal = require("@paypal/checkout-server-sdk");
const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

const storeItems = new Map([
  [0, { price: 100, name: "Basic Plan" }],
  [1, { price: 500, name: "Fundamental Plan" }],
  [2, { price: 100, name: "Single Session" }],
  [3, { price: 25, name: "Motivate Me" }],
]);

app.get("/", (req, res) => {
  res.render("checkout2", {
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
  });
});

app.post("/create-order", async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest();
  const total = req.body.items.reduce((sum, item) => {
    return sum + storeItems.get(item.id).price * item.quantity;
  }, 0);
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: total,
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: total,
            },
          },
        },
        items: req.body.items.map((item) => {
          const storeItem = storeItems.get(item.id);
          return {
            name: storeItem.name,
            unit_amount: {
              currency_code: "USD",
              value: storeItem.price,
            },
            quantity: item.quantity,
          };
        }),
      },
    ],
  });

  try {
    const order = await paypalClient.execute(request);
    console.log(order);
    res.json({
      id: order.result.id,
    });
  } catch (e) {
    res.status(500), json({ error: e.message });
  }
});

app.listen(3000, () => console.log("Server Started"));
