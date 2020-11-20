/* global chrome */
import React, { Component } from "react";
import arrowLeft from "./icon_arrowright_black@2x.png";
import deleteIcon from "./delete.png";
import { handleLocalStorage } from "../../../api";
import localforage from "localforage";

import "./passSaveWebsite.css";
export default class passSaveWebsite extends Component {
  state = {
    list: [],
  };
  componentDidMount() {
    //获取所有不保存的网站
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
                //设置本地数据库
                localforage.config({
                  driver: localforage.INDEXEDDB,
                  name: "I-heart-indexDB2",
                });
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
  render() {
    return (
      <div className="passSaveWebsite-wrapper">
        <div>
          <img
            src={arrowLeft}
            alt="passSaveWebsite-logo"
            className="passSaveWebsite-logo"
          />
        </div>

        {this.state.list.length > 0
          ? this.state.list.map((item, index) => {
              return (
                <div className="passSaveWebsite-item-wrapper">
                  <div className="passSaveWebsite-item">
                    <span className="passSaveWebsite-item-url">{item.url}</span>
                    <img
                      src={deleteIcon}
                      alt="passSaveWebsite-icon"
                      className="passSaveWebsite-item-delete"
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
