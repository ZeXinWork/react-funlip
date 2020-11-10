/* global chrome */
import React, { Component } from "react";
import { Modal } from "antd";
import iconAdd from "./icon_add_folder@2x.png";
import folder from "./icon_folder@2x(2).png";
import reFranch from "./reFreach.png";
import "./folder.css";
import { PlusCircleOutlined } from "@ant-design/icons";
export default class Folder extends Component {
  state = { visible: false };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  handleCancel = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };
  render() {
    return (
      <div className="folder-wrapper">
        <img src={reFranch} className="reFranch" />
        <div className="folder-collect">
          <div className="folder-create">
            <img
              src={iconAdd}
              className="folder-create-item"
              onClick={this.showModal}
            />
          </div>
          <div className="folder-info">
            <div className="folder-icon ">
              <img src={folder} className="mr-6" />
            </div>
            <div className="folder-user-info">
              <div className="folder-text">网站</div>
            </div>
          </div>
          <div className="folder-info">
            <div className="folder-icon ">
              <img src={folder} className="mr-6" />
            </div>
            <div className="folder-user-info">
              <div className="folder-text">游戏</div>
            </div>
          </div>
          <div className="folder-info">
            <div className="folder-icon ">
              <img src={folder} className="mr-6" />
            </div>
            <div className="folder-user-info">
              <div className="folder-text">社交</div>
            </div>
          </div>
          <div className="folder-info">
            <div className="folder-icon ">
              <img src={folder} className="mr-6" />
            </div>
            <div className="folder-user-info">
              <div className="folder-text">金融</div>
            </div>
          </div>
          <div className="folder-info">
            <div className="folder-icon ">
              <img src={folder} className="mr-6" />
            </div>
            <div className="folder-user-info">
              <div className="folder-text">其他</div>
            </div>
          </div>
        </div>
        <Modal
          title="新建文件夹"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <p>请输入文件夹名称</p>
        </Modal>
      </div>
    );
  }
}
