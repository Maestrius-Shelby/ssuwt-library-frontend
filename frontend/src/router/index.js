import About from "../pages/About";
import Add from "../pages/Add";
import AdvancedSearch from "../pages/AdvancedSearch";
import AddParticDB from "../pages/AddParticDB";
import DownloadFile from "./DownloadFile";
import PersonalPage from "../pages/PersonalPage";
import ParsingPage from "../pages/ParsingPage";
import VerifyPage from "../pages/VerifyPage";
import ParsingResultsPage from "../pages/ParsingResultsPage";

export const headOfDepartmentRoutes = [
  { path: "/addparticdb", element: <AddParticDB />, exact: true },
  { path: "/about", element: <About />, exact: true },
  { path: "/advancedsearch", element: <AdvancedSearch />, exact: true },
  { path: "/add", element: <Add />, exact: true },
  { path: "/personalpage", element: <PersonalPage />, exact: true },
  { path: "/parsingpage", element: <ParsingPage />, exact: true },
  { path: "/verifypage", element: <VerifyPage />, exact: true },
  { path: "/parsingresultspage", element: <ParsingResultsPage />, exact: true },
  { path: "/download/:file", element: <DownloadFile />, exact: true },
];

export const teacherRoutes = [
  { path: "/addparticdb", element: <AddParticDB />, exact: true },
  { path: "/about", element: <About />, exact: true },
  { path: "/advancedsearch", element: <AdvancedSearch />, exact: true },
  { path: "/add", element: <Add />, exact: true },
  { path: "/personalpage", element: <PersonalPage />, exact: true },
  { path: "/download/:file", element: <DownloadFile />, exact: true },
];

export const publicRoutes = [
  { path: "/about", element: <About />, exact: true },
  { path: "/advancedsearch", element: <AdvancedSearch />, exact: true },
  { path: "/download/:file", element: <DownloadFile />, exact: true },
];
