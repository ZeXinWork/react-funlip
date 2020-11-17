/*global chrome*/

import React, { Component } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import arrowLeft from "./icon_arrowright_black@2x.png";
import arrowRight from "./icon_arrowright@2x.png";
import aboutMe from "./icon_me_password@2x.png";
import severList from "./icon_me_equipment@2x.png";
import upData from "./icon_folder_备份 14@2x.png";
import "./about.css";
export default class MyAbout extends Component {
  render() {
    const goBack = () => {
      function sendMessageToContentScript(mes) {
        mes.type = "showImage4";
        chrome.runtime.sendMessage({ mes }, function (response) {});
      }
      sendMessageToContentScript({});
      this.props.history.push("/home/account");
    };
    return (
      <div className="home-about-wrapper">
        <div className="home-about-title">
          <img
            src={arrowLeft}
            onClick={goBack}
            className="home-about-titleIcon"
          />
        </div>
        <div className="home-about-aboutUs ">
          <img src={aboutMe} className="home-about-icon" />
          <p className="home-about-text">关于我们</p>
          <span>
            <img src={arrowRight} className="home-about-arrowRight" />
          </span>
        </div>
        <div className="home-about-aboutUs">
          <img src={aboutMe} className="home-about-icon" />
          <span className="home-about-texts">服务条款和隐私政策</span>
          <span>
            <img src={arrowRight} className="home-about-arrowRight" />
          </span>
        </div>
        <div className="home-about-aboutUs" style={{ marginTop: 10 }}>
          <img src={upData} className="home-about-icon" />
          <p className="home-about-textss">版本更新</p>
          <span className="home-about-version-text">V1.1</span>
          <div className="home-about-version ">
            <img src={arrowRight} className="home-about-arrowRights" />
          </div>
        </div>
      </div>
    );
  }
}
