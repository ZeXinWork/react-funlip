/* global chrome */
import React, { Component } from "react";
import { handleLocalStorage } from "../../../../api/index";
import localforage from "localforage";
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
  componentDidMount() {
    const pluginId = handleLocalStorage("get", "pluginID");

    let userInfo = {
      pluginId,
    };

    const sendMessageToContentBackgroundScript = async (mes) => {
      localforage.config({
        driver: localforage.INDEXEDDB,
        name: "I-heart-indexDB2",
      });

      const getLocalState = async () => {
        const res = localforage
          .getItem("folderList")
          .then(function (value) {
            return value;
          })
          .catch(function (err) {
            let error = false;
            return error;
          });
        return res;
      };
      const folderList = await getLocalState();

      const getData = async () => {
        const _this = this;
        mes.requestType = "getFolderList";
        chrome.runtime.sendMessage({ mes }, function (response) {
          let res = JSON.parse(response);
          //成功获取
          if (res.length >= 0) {
            _this.setState(
              {
                list: res,
              },
              () => {
                localforage
                  .setItem("folderList", res)
                  .then(function (value) {})
                  .catch(function (err) {});
              }
            );
          } else {
            alert("获取文件夹失败");
          }

          // if (res.id && res.name) {
          // } else {
          //   alert("新建失败");
          // }
        });
      };
      if (folderList == null) {
        getData();
      } else {
        const folderList = await getLocalState();
        this.setState({
          list: folderList,
        });
      }
    };
    sendMessageToContentBackgroundScript(userInfo);
  }
  render() {
    const goDetail = (passwordList, id, name) => {
      handleLocalStorage("set", "folderId", id);
      this.props.history.push({
        pathname: "/folderDetail",
        state: { passwordList, folderId: id, name },
      });
    };
    const canModal = () => {
      this.setState({
        visible: "none",
      });
    };
    const confirmModal = () => {
      let folderName = document.getElementsByClassName("modal-input")[0].value;
      const pluginId = handleLocalStorage("get", "pluginID");
      let userInfo = {
        pluginId,
        name: folderName,
      };
      const sendMessageToContentBackgroundScript = (mes) => {
        mes.requestType = "addNewFolder";
        const _this = this;
        chrome.runtime.sendMessage({ mes }, function (response) {
          let res = JSON.parse(response);
          console.log(res);
          if (res.id && res.name) {
            let newArray = [];
            newArray.push(res);
            console.log(newArray);
            const getLocalstates = async () => {
              const getLocalState = async () => {
                const res = localforage
                  .getItem("folderList")
                  .then(function (value) {
                    return value;
                  })
                  .catch(function (err) {
                    let error = false;
                    return error;
                  });
                return res;
              };
              const folderList = await getLocalState();
              console.log(newArray[0]);
              folderList.push(newArray[0]);
              localforage
                .setItem("folderList", folderList)
                .then(function (value) {})
                .catch(function (err) {});
            };
            getLocalstates();
            _this.setState(
              {
                list: [..._this.state.list, ...newArray],
              },
              () => {
                _this.setState({
                  visible: "none",
                });
              }
            );
          } else {
            alert("新建失败");
          }
        });
      };
      sendMessageToContentBackgroundScript(userInfo);
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
              <div
                className="folder-info"
                onClick={() => {
                  goDetail(item.passwords, item.id, item.name);
                }}
              >
                <div className="folder-icon ">
                  <img src={folder} className="mr-6" />
                </div>
                <div className="folder-user-info">
                  <p className="folder-text">{item.name}</p>
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
