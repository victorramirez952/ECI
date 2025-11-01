import React, { useCallback, useState } from "react";
import Header from "./Header";
import "./mainPage.styles.scss";
import Body from "./Body";
import Footer from "./Footer";
import Cuestionario from "./Cuestionario";
import AIHelper from "./AIHelper";
import ModelVisualizer from './ModelVisualizer';

const MainPage = () => {
  const [aiData, setAiData] = useState<any>(undefined);
  const handleData = useCallback((data: any) => {
    setAiData(data);
  }, []);

  return (
    <div className="main-div">
      <Header />
      <Body />
      <AIHelper handleData={handleData}/>
      <Cuestionario data={aiData}/>
      {/* <ModelVisualizer /> */}
      <Footer />
    </div>
  );
};

export default MainPage;
