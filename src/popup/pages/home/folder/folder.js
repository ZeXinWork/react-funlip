/* global chrome */
import React, { Component } from "react";
import { Modal } from "antd";
import iconAdd from "./icon_add_folder@2x.png";
import folder from "./icon_folder@2x(2).png";
import reFranch from "./reFreach.png";
import "./folder.css";
import newFolder from "./icon_new_folder@2x.png";

export default class Folder extends Component {
  state = {
    visible: "none",
    list: [],
  };

  showModal = () => {
    this.setState({
      visible: "block",
    });
  };

  render() {
    const canModal = () => {
      this.setState({
        visible: "none",
      });
    };
    const confirmModal = () => {
      this.setState({
        visible: "none",
      });
    };
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

          {this.state.list.map((item) => {
            return (
              <div className="folder-info">
                <div className="folder-icon ">
                  <img src={folder} className="mr-6" />
                </div>
                <div className="folder-user-info">
                  <div className="folder-text">{item.name}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="folderModal-wrapper"
          style={{ display: this.state.visible }}
        >
          <div>
            <img src={newFolder} className="modal-icon" />
          </div>
          <div className="modal-text">新建文件夹</div>
          <input className="modal-input" placeholder="输入文件夹名称" />

          <div className="password-btn-group">
            <div className="main ml-20">
              <div className="btn-1 " onClick={canModal}>
                <span className="password-text">取消</span>
              </div>
            </div>
            <div className="btn-layout mr-20 set-bg " onClick={confirmModal}>
              <span className="password-text">确认</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
