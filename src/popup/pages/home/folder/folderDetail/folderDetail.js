/*global chrome*/

import React, { Component } from "react";
import Success from "./icon_success@2x.png";
import { handleLocalStorage } from "../../../../../api";
import localforage from "localforage";

import Lock from "./Lock.png";
import Folder from "./Folder.png";
import Up from "./Up.png";
import Key from "./Key.png";
import arrowLeft from "./icon_arrowright_black@2x.png";
import Edit from "./icon_edit@2x.png";
import "./folderDail.css";
export default class componentName extends Component {
  state = {
    list: [],
    show: "",
    editShow: "none",
    folderName: "",
    deleteShow: "none",
  };
  componentDidMount() {
    let passwordList;
    let dataList;
    let folderId;
    let afterDelete;
    let name;
    const folderName = handleLocalStorage("get", "folderName");
    if (folderName) {
      this.setState(
        {
          folderName,
        },
        () => {
          handleLocalStorage("remove", "folderName");
        }
      );
    }

    if (this.props.location.state) {
      passwordList = this.props.location.state.passwordList;
      dataList = this.props.location.state.dataList;
      folderId = this.props.location.state.folderId;
      afterDelete = this.props.location.state.afterDelete;
      name = this.props.location.state.name;
      if (name) {
        handleLocalStorage("set", "folderName", name);
        this.setState(
          {
            folderName: name,
          },
          () => {
            handleLocalStorage("remove", "folderName");
          }
        );
      }
    }
    //点击空白处关闭弹窗
    // document
    //   .getElementsByClassName("psw-wrappers")[0]
    //   .addEventListener("click", () => {
    //     this.setState({
    //       editShow: "none",
    //     });
    //   });

    //设置文件夹id
    if (folderId) {
      handleLocalStorage("set", "folderId", folderId);
    }
    //有新增的dataList，更新视图
    if (dataList) {
      let loading = document.getElementById("funlip-loading");
      loading.style.display = "none";
      let newArray = [dataList];
      const getLocalState = async () => {
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
        let targetArray = [];
        const folderList = await getLocalState();
        const folderId = handleLocalStorage("get", "folderId");
        folderList.map((item) => {
          if (item.id == folderId) {
            let { passwords } = item;

            if (passwords) {
              targetArray = [...passwords, ...newArray];
            } else {
              targetArray = newArray;
            }
            this.setState({
              list: targetArray,
            });
          }
        });

        for (let i = 0; i < folderList.length; i++) {
          if (folderList[i].id == folderId) {
            folderList[i].passwords = targetArray;
          }
        }
        localforage
          .setItem("folderList", folderList)
          .then(function (value) {})
          .catch(function (err) {});
      };
      getLocalState();
    } else if (passwordList) {
      //如果没有更新的，显示父级传过来的passwordList()

      this.setState({
        list: passwordList,
      });
    } else if (afterDelete) {
      let loading = document.getElementById("funlip-loading");
      loading.style.display = "none";
      const getLocalState = async () => {
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
        let targetArray = [];
        const folderList = await getLocalState();
        const folderId = handleLocalStorage("get", "folderId");
        folderList.map((item) => {
          if (item.id == folderId) {
            let { passwords } = item;
            if (passwords) {
              targetArray = passwords;
            } else {
              targetArray = [];
            }
            this.setState({
              list: targetArray,
            });
          }
        });
      };
      getLocalState();
    } else {
      this.setState({
        list: [],
      });
    }
  }
  render() {
    let folderId;
    if (this.props.location.state) {
      folderId = this.props.location.state.folderId;
    }

    //去密码详情页

    const toDetail = (itemDetail) => {
      this.props.history.push({
        pathname: "/PswDetail",
        state: { itemDetail, isDeleteFolder: true },
      });
    };

    //添加hover效果
    const showHover = (index) => {
      this.setState({
        show: index,
      });
    };

    //将hover效果移出
    const cancelHover = () => {
      this.setState({
        show: "",
      });
    };

    //发信息自动填充
    function sendMessageToContentScript(mes) {
      mes.type = "mesToBackground";
      chrome.runtime.sendMessage({ mes }, function (response) {});
    }

    //发信息打开网址
    function sendMessageToContentScript2(url) {
      let mes = {
        url: url,
        type: "goUrl",
      };
      chrome.runtime.sendMessage({ mes }, function (response) {});
    }

    //复制密码
    const Copy = (psw) => {
      const input = document.createElement("input");
      let modal = document.getElementsByClassName(
        "psw-success-info-wrapper"
      )[0];
      const password = psw;
      if (!password) {
        return;
      }
      input.value = password;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      modal.style.display = "block";
      setTimeout(() => {
        modal.style.display = "none";
      }, 2000);
    };

    //显示操作面板
    const showEditHover = () => {
      if (this.state.editShow == "none") {
        this.setState({
          editShow: "block",
        });
      } else {
        this.setState({
          editShow: "none",
        });
      }
    };

    //打开删除页面
    const showModal2 = () => {
      this.setState(
        {
          editShow: "none",
        },
        () => {
          let Modal = document.getElementsByClassName("password-modal2")[0];
          Modal.style.display = "block";
        }
      );
    };

    //删除文件夹
    const deleteFolder = (config) => {
      const _this = this;
      const pluginID = handleLocalStorage("get", "pluginID");
      let userInfo = {
        folderId,
        pluginId: pluginID,
      };
      function sendMessageToContentScript(mes) {
        mes.requestType = "deleteFolder";

        chrome.runtime.sendMessage({ mes }, function (response) {
          let res = JSON.parse(response);
          if (res.code == 200) {
            const getLocalSate = async () => {
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

              const getuserInfoLocalState = async () => {
                const res = localforage
                  .getItem("userInfo")
                  .then(function (value) {
                    return value;
                  })
                  .catch(function (err) {
                    let error = false;
                    return error;
                  });
                return res;
              };

              const userInfoList = await getuserInfoLocalState();
              if (config) {
                console.log(userInfoList);
                console.log(_this.state.list);
                for (let i = 0; i < userInfoList.length; i++) {
                  for (let j = 0; j < _this.state.list.length; j++) {
                    if (userInfoList[i].id == _this.state.list[j].id) {
                      userInfoList.splice(i, 1);
                    }
                  }
                }
                localforage
                  .setItem("userInfo", userInfoList)
                  .then(function (value) {})
                  .catch(function (err) {});
              }
              for (let i = 0; i < folderList.length; i++) {
                if (folderList[i].id == folderId) {
                  folderList.splice(i, 1);
                }
              }
              localforage
                .setItem("folderList", folderList)
                .then(function (value) {
                  closeModal2("homeFolder");
                })
                .catch(function (err) {});
            };
            getLocalSate();
          }
        });
      }
      sendMessageToContentScript(userInfo);
    };

    const closeModal2 = (mes) => {
      let Modal = document.getElementsByClassName("password-modal2")[0];
      if (Modal) {
        Modal.style.display = "none";
      }
      if (mes == "homeFolder") {
        this.props.history.push("/home/folder");
      }
    };

    const renameFolder = (name) => {
      let userInfo = {
        folderId,
        name,
      };
      function sendMessageToContentScript(mes) {
        mes.requestType = "renameFolder";
        const _this = this;
        chrome.runtime.sendMessage({ mes }, function (response) {
          let res = JSON.parse(response);
          if (res.code == 200) {
            const getLocalSate = async () => {
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
              for (let i = 0; i < folderList.length; i++) {
                if (folderList[i].id == folderId) {
                  folderList.splice(i, 1);
                }
              }
              localforage
                .setItem("folderList", folderList)
                .then(function (value) {
                  closeModal2("homeFolder");
                })
                .catch(function (err) {});
            };
            getLocalSate();
          }
        });
      }
      sendMessageToContentScript(userInfo);
    };

    const showDeleteAllPswModal = () => {
      this.setState({
        deleteShow: "block",
      });
    };
    const cancelCloseModal3 = () => {
      closeModal2();
      deleteFolder();
      this.setState({
        deleteShow: "none",
      });
    };
    return (
      <div className="psw-wrappers">
        <div className="password-modal2">
          <div className="password-title-icon">
            <img src={Lock} className="lock-icon" />
          </div>
          <div className="password-title">
            <span className="password-title-info">确定删除此文件夹?</span>
          </div>
          <div className="password-body">
            <div className="password-btn-group">
              <div className="main ml-20">
                <div className="btn-1 " onClick={closeModal2}>
                  <span className="password-text">取消</span>
                </div>
              </div>
              <div
                className="btn-layout mr-20 set-bg "
                onClick={showDeleteAllPswModal}
              >
                <span className="password-text">确认</span>
              </div>
            </div>
          </div>
        </div>
        <div
          className="password-modal3"
          style={{ display: this.state.deleteShow }}
        >
          <div className="password-title-icon">
            <img src={Lock} className="lock-icon" />
          </div>
          <div className="password-title">
            <span className="password-title-info">
              是否删除文件夹内所有密码?
            </span>
          </div>
          <div className="password-body">
            <div className="password-btn-group">
              <div className="main ml-20">
                <div className="btn-1 " onClick={cancelCloseModal3}>
                  <span className="password-text">取消</span>
                </div>
              </div>
              <div
                className="btn-layout mr-20 set-bg "
                onClick={() => {
                  deleteFolder("deleteAllPsw");
                }}
              >
                <span className="password-text">确认</span>
              </div>
            </div>
          </div>
        </div>
        <div className="psw-success-info-wrapper">
          <div className="psw-success-info">
            <img
              src={Success}
              className="success-icon"
              alt="psw-success-info"
            />
            <div className="psw-success-text">密码已复制</div>
          </div>
        </div>
        <div
          className="editDetail"
          style={{ display: this.state.editShow }}
          onClick={(e) => {
            if (e && e.stopPropagation) {
              e.stopPropagation();
            } else {
              window.event.cancelBubble = true;
            }
          }}
        >
          <div className="edit-text-wrapper">
            <div className="managePsw text-wrapper top-text">管理密码</div>
            <div className="deletePsw text-wrapper" onClick={showModal2}>
              删除
            </div>
            <div className="reName text-wrapper">重命名</div>
          </div>
        </div>
        <div className="folder-icon-header">
          <img
            src={arrowLeft}
            className="arrowLeft"
            onClick={() => {
              this.props.history.push("/home/folder");
            }}
          />
          <img
            src={Edit}
            className="edit"
            onClick={(e) => {
              if (e && e.stopPropagation) {
                e.stopPropagation();
              } else {
                window.event.cancelBubble = true;
              }
              showEditHover();
            }}
          />
        </div>
        <div className="folder-tag-wrapper">
          <p className="folder-tag">{`文件夹 > ${this.state.folderName}`}</p>
        </div>
        <div className="home-body">
          {this.state.list.map((item, index) => {
            return (
              <div
                className="psw-info"
                key={item.title}
                onClick={() => {
                  toDetail(item);
                }}
                onMouseOver={() => {
                  showHover(index);
                }}
                onMouseLeave={() => {
                  cancelHover(index);
                }}
                key={index}
              >
                <div className="psw-user-info">
                  <div>{item.title}</div>
                  <div>{item.account}</div>
                </div>
                <div className="psw-icon">
                  {this.state.show === index ? (
                    <div>
                      <img
                        src={Key}
                        className="lock-icon"
                        onClick={(e) => {
                          if (e && e.stopPropagation) {
                            e.stopPropagation();
                          } else {
                            window.event.cancelBubble = true;
                          }
                          sendMessageToContentScript(item);
                        }}
                      />
                      <img
                        src={Up}
                        className="lock-icon"
                        onClick={(e) => {
                          const url = item.website;
                          if (e && e.stopPropagation) {
                            e.stopPropagation();
                          } else {
                            window.event.cancelBubble = true;
                          }
                          sendMessageToContentScript2(url);
                        }}
                      />
                      <img
                        src={Folder}
                        className="lock-icon"
                        onClick={(e) => {
                          const password = item.pwd;
                          if (e && e.stopPropagation) {
                            e.stopPropagation();
                          } else {
                            window.event.cancelBubble = true;
                          }
                          Copy(password);
                        }}
                      />
                    </div>
                  ) : (
                    <img src={Lock} className="lock-icon" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="autoMid">
          <div className="button-layout">
            <div
              className="main ml-20"
              onClick={() => {
                this.props.history.push({
                  pathname: "/newPsw",
                  state: { isFolderDetail: true, folderId },
                });
              }}
            >
              <div className="btn-1 ">
                <span className=" reset-psw">新建密码</span>
              </div>
            </div>
            <div
              className="btn-layout mr-20 set-bg  copy-psw"
              onClick={() => {
                this.props.history.push({
                  pathname: "/folderAdd",
                  state: { folderName: this.state.folderName },
                });
              }}
            >
              <span className="copy-text-info">添加密码</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
