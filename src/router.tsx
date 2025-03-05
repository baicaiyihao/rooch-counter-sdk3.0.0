import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import CheckInPage from "./pages/CheckInPage";
import LeaderboardPage from "./pages/LeaderboardPage";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/check-in",
    element: <CheckInPage />,
  },
  {
    path: "/leaderboard",
    element: <LeaderboardPage />,
  }
]);

export default router;