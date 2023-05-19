import axios from "axios";

axios
  .get("https://jsonplaceholder.typicode.com/users")
  .then((res) => console.log(res.data.slice(0, 10)));
