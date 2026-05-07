

import HomeBanner from "../components/Home/HomeBanner.jsx";
import HomeText from "../components/Home/HomeText.jsx";
import HomeInfomation from "../components/Home/HomeInfomation.jsx";
// import HomeReasonVideo from "../components/Home/HomeReasonVideo.jsx";
import HomeContact from "../components/Home/HomeContact.jsx";
function HomeLayout(){
    return (
        <>
        <HomeBanner />
        <HomeText />
        <HomeInfomation />
        {/* <HomeReasonVideo /> */}
        <HomeContact />
        </>
    );

}
export default HomeLayout;