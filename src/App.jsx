// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./pages/NavBar";
import Home from "./pages/home/Home";
import OurStory from "./pages/about/OurStory";
import SundayService from "./pages/about/SundayService";
import MissionVision from "./pages/about/MissionVision";
import Team from "./pages/about/Team";
import Ministries from "./pages/ministries/Ministries";
import Childrens from "./pages/ministries/Childrens";
import YouthGroup from "./pages/ministries/YouthGroup";
import Campus from "./pages/ministries/Campus";
import PostGrad from "./pages/ministries/PostGrad";
import AdultFamily from "./pages/ministries/AdultFamily";
import Sermons from "./pages/Sermons";
import Bulletin from "./pages/Bulletin/Bulletin";
import Donate from "./pages/Donate";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* top-level About */}
        <Route path="/about" element={<OurStory />} />

        {/* sub-routes under About */}
        <Route path="/about/our_story" element={<OurStory />} />
        <Route path="/about/sunday_service" element={<SundayService />} />
        <Route path="/about/mission" element={<MissionVision />} />
        <Route path="/about/team" element={<Team />} />

        <Route path="/ministries" element={<Ministries />}></Route>

        <Route path="/ministries/childrens" element={<Childrens />} />
        <Route path="/ministries/youth_group" element={<YouthGroup />} />
        <Route path="/ministries/campus" element={<Campus />} />
        <Route path="/ministries/post_grad" element={<PostGrad />} />
        <Route path="/ministries/adult_family" element={<AdultFamily />} />

        <Route path="/sermons" element={<Sermons />}></Route>
        <Route path="/bulletin" element={<Bulletin />}></Route>
        <Route path="/donate" element={<Donate />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
