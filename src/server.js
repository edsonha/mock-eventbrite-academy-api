require("dotenv").config();
const app = require("./app");
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Listening to the smooth sound on PORT ${PORT}`);
});
