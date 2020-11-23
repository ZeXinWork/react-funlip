/* global chrome */
import React, { Component } from "react";
import arrowLeft from "./icon_arrowright_black@2x.png";
import deleteIcon from "./delete.png";
import { handleLocalStorage } from "../../../api";
import Lock from "./delete.png";
import localforage from "localforage";

import "./passSaveWebsite.css";
export default class passSaveWebsite extends Component {
  state = {
    list: [],
    deleteShow: "none",
  };

  componentDidMount() {
    //获取所有不保存的网站
    const getListDaTA = async () => {
      localforage.config({
        driver: localforage.INDEXEDDB,
        name: "I-heart-indexDB2",
      });
      const getLocalListData = async () => {
        const res = localforage
          .getItem("skipList")
          .then(function (value) {
            return value;
          })
          .catch(function (err) {
            let error = false;
            return error;
          });
        return res;
      };
      const skipList = await getLocalListData();
      if (skipList && skipList.length > 0) {
        this.setState({
          list: skipList,
        });
      } else {
        const pluginId = handleLocalStorage("get", "pluginID");
        const _this = this;
        const sendMessageToContentBackgroundScript = (mes) => {
          mes.requestType = "getSkipList";
          mes.pluginId = pluginId;
          let loading = document.getElementById("funlip-loading");
          loading.style.display = "block";
          chrome.runtime.sendMessage({ mes }, function (response) {
            let res = JSON.parse(response);
            _this.setState(
              {
                list: res,
              },
              () => {
                localforage
                  .setItem("skipList", res)
                  .then(function (value) {
                    let loading = document.getElementById("funlip-loading");
                    loading.style.display = "none";
                  })
                  .catch(function (err) {});
              }
            );
          });
        };
        sendMessageToContentBackgroundScript({});
      }
    };
    getListDaTA();
  }

  //将用户网址移出跳过List
  removeWebsite = () => {
    const _this = this;
    const { deleteId } = this.state;
    let targetArray = [deleteId];
    function sendMessageToContentScript(mes) {
      mes.idList = targetArray;
      mes.requestType = "removeWebsiteIem";
      chrome.runtime.sendMessage({ mes }, function (response) {
        let res = JSON.parse(response);

        if (res.code == 200) {
          const getListDaTA = async () => {
            const getLocalListData = async () => {
              const res = localforage
                .getItem("skipList")
                .then(function (value) {
                  return value;
                })
                .catch(function (err) {
                  let error = false;
                  return error;
                });
              return res;
            };
            const skipList = await getLocalListData();
            for (let i = 0; i < skipList.length; i++) {
              if (skipList[i].id == deleteId) {
                skipList.splice(i, 1);
              }
            }

            _this.setState(
              {
                list: skipList,
              },
              () => {
                _this.setState({
                  deleteShow: "none",
                });
              }
            );

            localforage
              .setItem("skipList", skipList)
              .then(function (value) {})
              .catch(function (err) {});
          };

          getListDaTA();
        }
      });
    }
    sendMessageToContentScript({});
  };
  //关闭modal
  cancelCloseModal3 = () => {
    this.setState({
      deleteShow: "none",
    });
  };
  render() {
    return (
      <div className="passSaveWebsite-wrapper">
        <div
          className="password-modal3"
          style={{ display: this.state.deleteShow }}
        >
          <div className="password-title-icon">
            <img src={Lock} className="lock-icon" />
          </div>
          <div className="password-title">
            <span className="password-title-info">是否不跳过此网站？</span>
          </div>
          <div className="password-body">
            <div className="password-btn-group">
              <div className="main ml-20">
                <div className="btn-1 " onClick={this.cancelCloseModal3}>
                  <span className="password-text">取消</span>
                </div>
              </div>
              <div
                className="btn-layout mr-20 set-bg "
                onClick={() => {
                  this.removeWebsite();
                }}
              >
                <span className="password-text">确认</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <img
            src={arrowLeft}
            alt="passSaveWebsite-logo"
            className="passSaveWebsite-logo"
            onClick={() => {
              this.props.history.goBack();
            }}
          />
        </div>
        {this.state.list.length > 0
          ? this.state.list.map((item, index) => {
              return (
                <div className="passSaveWebsite-item-wrapper">
                  <div className="passSaveWebsite-item">
                    <span className="passSaveWebsite-item-url">
                      {item.website}
                    </span>
                    <img
                      src={deleteIcon}
                      alt="passSaveWebsite-icon"
                      className="passSaveWebsite-item-delete"
                      onClick={() => {
                        this.setState({
                          deleteShow: "block",
                          deleteId: item.id,
                        });
                      }}
                    />
                  </div>
                </div>
              );
            })
          : ""}
      </div>
    );
  }
}
