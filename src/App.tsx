import { RouterProvider } from "react-router";
import { router } from "./core/router/router";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
