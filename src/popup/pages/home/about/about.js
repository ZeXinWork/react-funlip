import React, { Component } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import "./about.css";
export default class MyAbout extends Component {
  render() {
    const goBack = () => {
      this.props.history.goBack();
    };
    return (
      <div className="home-about-wrapper">
        <div className="home-about-title">
          <LeftOutlined onClick={goBack} />
        </div>
        <div className="home-about-aboutUs bd-ccc pd-10 layout ">
          关于我们
          <span>
            <RightOutlined />
          </span>
        </div>
        <div className="home-about-policy bd-ccc pd-10 layout">
          服务条款和隐私政策
          <span>
            <RightOutlined />
          </span>
        </div>
        <div className="home-about-update bd-ccc pd-10 layout">
          版本更新
          <span>
            <RightOutlined />
          </span>
        </div>
      </div>
    );
  }
}
