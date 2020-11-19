/*global chrome*/

import React, { Component } from "react";
import Success from "./icon_success@2x.png";
import { handleLocalStorage } from "../../../../../api";
import localforage from "localforage";
import { Checkbox, Input } from "antd";
import Lock from "./Lock.png";
import Folder from "./Folder.png";
import Up from "./Up.png";
import Key from "./Key.png";
import arrowLeft from "./icon_arrowright_black@2x.png";
import Edit from "./icon_edit@2x.png";
import deleteIcon from "./icon_home_delete_pre@2x.png";
import remove from "./icon_home_mobile_pre@2x.png";
import "./folderDail.css";
export default class componentName extends Component {
  state = {
    list: [],
    show: "",
    editShow: "none",
    folderName: "",
    deleteShow: "none",
    showCheckBox: false,
    btnShow: "block",
    editPswShow: "none",
    removeShow: "none",
    deletePswShow: "none",
    renameShow: "none",
  };
  componentDidMount() {
    let passwordList;
    let dataList;
    let folderId;
    let afterDelete;

    const folderName = handleLocalStorage("get", "folderName");
    if (folderName) {
      this.setState(
        {
          folderName,
        },
        () => {}
      );
    }

    if (this.props.location.state) {
      passwordList = this.props.location.state.passwordList;
      dataList = this.props.location.state.dataList;
      folderId = this.props.location.state.folderId;
      afterDelete = this.props.location.state.afterDelete;
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
        for (let i = 0; i < folderList.length; i++) {
          folderList[i].fileNum = folderList[i].passwords.length;
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
        state: { itemDetail, isDeleteFolder: true, folderId },
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
      const folderId = handleLocalStorage("get", "folderId");
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
              let targetIdArray = [];
              const userInfoList = await getuserInfoLocalState();
              if (config) {
                for (let i = 0; i < userInfoList.length; i++) {
                  for (let j = 0; j < _this.state.list.length; j++) {
                    if (userInfoList[i].id == _this.state.list[j].id) {
                      targetIdArray.push(userInfoList[i].id);
                      userInfoList.splice(i, 1);
                    }
                  }
                }
                const pluginID = handleLocalStorage("get", "pluginID");
                let userInfo = {
                  pluginId: pluginID,
                  passwordIds: targetIdArray,
                };
                function sendMessageToContentScript2(mes) {
                  mes.requestType = "deleteItem";
                  chrome.runtime.sendMessage({ mes }, function (response) {});
                }
                sendMessageToContentScript2(userInfo);
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

    //关闭Modal2
    const closeModal2 = (mes) => {
      let Modal = document.getElementsByClassName("password-modal2")[0];
      if (Modal) {
        Modal.style.display = "none";
      }
      if (mes == "homeFolder") {
        const _this = this;
        function sendMessageToContentScript(mes) {
          mes.type = "showImage2";
          _this.props.history.push("/home/folder");
          chrome.runtime.sendMessage({ mes }, function (response) {});
        }
        sendMessageToContentScript({});
      }
    };

    //文件夹重命名
    const renameFolder = () => {
      const _this = this;
      let renameInput = document.getElementsByClassName(
        "password-body-Input"
      )[0].value;

      let userInfo = {
        folderId,
        name: renameInput,
      };
      function sendMessageToContentScript(mes) {
        mes.requestType = "renameFolder";
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
                  folderList[i].name = res.data.name;
                }
              }

              localforage
                .setItem("folderList", folderList)
                .then(function (value) {
                  _this.setState({
                    renameShow: "none",
                    folderName: res.data.name,
                    editShow: "none",
                  });
                })
                .catch(function (err) {});
            };
            getLocalSate();
          }
        });
      }
      sendMessageToContentScript(userInfo);
    };

    //删除文件夹并删除下面所有密码
    const showDeleteAllPswModal = () => {
      if (this.state.list.length > 0) {
        this.setState({
          deleteShow: "block",
        });
      } else {
        deleteFolder();
      }
    };

    //删除文件夹但是不删除文件夹下的密码
    const cancelCloseModal3 = () => {
      closeModal2();
      deleteFolder();
      function sendMessageToContentScript(mes) {
        mes.type = "showImage2";
        chrome.runtime.sendMessage({ mes }, function (response) {});
      }
      sendMessageToContentScript({});
      this.setState({
        deleteShow: "none",
      });
    };

    //打开编辑模块
    const editPsw = () => {
      this.setState({
        showCheckBox: true,
        editShow: "none",
        btnShow: "none",
        editPswShow: "block",
      });
    };

    //打开移出密码modal
    const removePsw = () => {
      this.setState({
        removeShow: "block",
      });
    };

    //删除密码modal
    const deletePsw = () => {
      this.setState({
        deletePswShow: "block",
      });
    };

    //取消密码移出
    const cancelMove = () => {
      this.setState({
        removeShow: "none",
      });
    };

    //将密码移出文件夹
    const removePswFolder = () => {
      const _this = this;
      const folderId = handleLocalStorage("get", "folderId");
      let MyCheckBox = document.getElementsByClassName("folderCheckbox");
      let myChecked = [];
      let targetArray = [];
      let targetIdArray = [];
      for (let i = 0; i < MyCheckBox.length; i++) {
        if (MyCheckBox[i].checked) {
          myChecked.push(i);
        }
      }
      let list = this.state.list;
      for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < myChecked.length; j++) {
          if (i == myChecked[j]) {
            targetArray.push(list[i]);
          }
        }
      }

      for (let i = 0; i < targetArray.length; i++) {
        targetIdArray.push(targetArray[i].id);
      }
      let userInfo = {
        passwordIds: targetIdArray,
        folderId,
      };
      const sendMessageToContentBackgroundScript2 = (mes) => {
        mes.requestType = "outFolder";

        chrome.runtime.sendMessage({ mes }, function (res) {
          let response = JSON.parse(res);
          if (response.code == 200) {
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
              let outPsw = response.data;

              const folderList = await getLocalState();
              for (let i = 0; i < folderList.length; i++) {
                for (let j = 0; j < folderList[i].passwords.length; j++) {
                  for (let p = 0; p < outPsw.length; p++) {
                    if (folderList[i].passwords[j].id == outPsw[p].id) {
                      folderList[i].passwords.splice(j, 1);
                    }
                  }
                }
              }
              for (let i = 0; i < folderList.length; i++) {
                folderList[i].fileNum = folderList[i].passwords.length;
              }
              let list = _this.state.list;
              for (let i = 0; i < list.length; i++) {
                for (let p = 0; p < outPsw.length; p++) {
                  if (list[i].id == outPsw[p].id) {
                    list.splice(i, 1);
                  }
                }
              }
              _this.setState({
                removeShow: "none",
                editPswShow: "none",
              });
              localforage
                .setItem("folderList", folderList)
                .then(function (value) {})
                .catch(function (err) {});
            };
            getLocalState();
          } else {
            _this.setState({
              removeShow: "none",
              editPswShow: "none",
            });
          }
        });
      };
      sendMessageToContentBackgroundScript2(userInfo);
    };

    //将密码从文件夹删除
    const deletePswFolder = () => {
      const _this = this;

      let MyCheckBox = document.getElementsByClassName("folderCheckbox");
      let myChecked = [];
      let targetArray = [];
      let targetIdArray = [];
      for (let i = 0; i < MyCheckBox.length; i++) {
        if (MyCheckBox[i].checked) {
          myChecked.push(i);
        }
      }
      let list = this.state.list;
      for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < myChecked.length; j++) {
          if (i == myChecked[j]) {
            targetArray.push(list[i]);
          }
        }
      }

      for (let i = 0; i < targetArray.length; i++) {
        targetIdArray.push(targetArray[i].id);
      }

      const pluginID = handleLocalStorage("get", "pluginID");
      const value = {
        pluginId: pluginID / 1,
        passwordIds: targetIdArray,
      };
      const folderId = handleLocalStorage("get", "folderId");
      const userInfo = {
        folderId,
        passwordIds: targetIdArray,
      };
      function sendMessageToContentScript2(mes) {
        mes.requestType = "outFolder";
        chrome.runtime.sendMessage({ mes }, function (response) {
          let res = JSON.parse(response);
        });
      }
      sendMessageToContentScript2(userInfo);
      const sendMessageToContentBackgroundScript = (mes) => {
        mes.requestType = "deleteItem";
        chrome.runtime.sendMessage({ mes }, function (response) {
          let res = JSON.parse(response);
          let outPsw = res.data;
          if (res.code == 200) {
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

              const folderList = await getLocalState();
              for (let i = 0; i < folderList.length; i++) {
                for (let j = 0; j < folderList[i].passwords.length; j++) {
                  for (let p = 0; p < outPsw.length; p++) {
                    if (folderList[i].passwords[j].id == outPsw[p].id) {
                      folderList[i].passwords.splice(j, 1);
                    }
                  }
                }
              }
              let list = _this.state.list;
              for (let i = 0; i < list.length; i++) {
                for (let p = 0; p < outPsw.length; p++) {
                  if (list[i].id == outPsw[p].id) {
                    list.splice(i, 1);
                  }
                }
              }
              _this.setState({
                deletePswShow: "none",
                editPswShow: "none",
              });
              localforage
                .setItem("folderList", folderList)
                .then(function (value) {})
                .catch(function (err) {});
            };
            getLocalState();
          }
        });
      };
      sendMessageToContentBackgroundScript(value);
    };

    //取消删除密码
    const cancelPswFolder = () => {
      this.setState({
        deletePswShow: "none",
      });
    };

    //关闭重命名模块
    const closeModal8 = () => {
      this.setState({
        renameShow: "none",
      });
    };
    return (
      <div className="psw-wrappers">
        <div
          className="password-modal8"
          style={{ display: this.state.renameShow }}
        >
          <div className="password-title-icon">
            <img src={Lock} className="lock-icon" />
          </div>
          <div className="password-title">
            <span className="password-title-info">重命名</span>
          </div>
          <div className="password-body">
            <Input
              placeholder={this.state.folderName}
              className="password-body-Input"
              bordered={false}
            />
            <div className="password-btn-group">
              <div className="main ml-20">
                <div className="btn-1 " onClick={closeModal8}>
                  <span className="password-text">取消</span>
                </div>
              </div>
              <div className="btn-layout mr-20 set-bg ">
                <span className="password-text" onClick={renameFolder}>
                  确认
                </span>
              </div>
            </div>
          </div>
        </div>
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
        <div
          className="password-modal4"
          style={{ display: this.state.removeShow }}
        >
          <div className="password-title-icon">
            <img src={Lock} className="lock-icon" />
          </div>
          <div className="password-title">
            <span className="password-title-info">是否将密码移出文件夹?</span>
          </div>
          <div className="password-body">
            <div className="password-btn-group">
              <div className="main ml-20">
                <div className="btn-1 " onClick={cancelMove}>
                  <span className="password-text">取消</span>
                </div>
              </div>
              <div
                className="btn-layout mr-20 set-bg "
                onClick={removePswFolder}
              >
                <span className="password-text">确认</span>
              </div>
            </div>
          </div>
        </div>
        <div
          className="password-modal5"
          style={{ display: this.state.deletePswShow }}
        >
          <div className="password-title-icon">
            <img src={Lock} className="lock-icon" />
          </div>
          <div className="password-title">
            <span className="password-title-info">是否删除此密码?</span>
          </div>
          <div className="password-body">
            <div className="password-btn-group">
              <div className="main ml-20">
                <div className="btn-1 " onClick={cancelPswFolder}>
                  <span className="password-text">取消</span>
                </div>
              </div>
              <div
                className="btn-layout mr-20 set-bg "
                onClick={deletePswFolder}
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
            <div className="managePsw text-wrapper top-text" onClick={editPsw}>
              管理密码
            </div>
            <div className="deletePsw text-wrapper" onClick={showModal2}>
              删除
            </div>
            <div
              className="reName text-wrapper"
              onClick={() => {
                this.setState({
                  renameShow: "block",
                  editShow: "none",
                });
              }}
            >
              重命名
            </div>
          </div>
        </div>
        <div className="folder-icon-header">
          <img
            src={arrowLeft}
            className="arrowLeft"
            onClick={() => {
              function sendMessageToContentScript(mes) {
                mes.type = "showImage2";
                chrome.runtime.sendMessage({ mes }, function (response) {});
              }
              sendMessageToContentScript({});
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
                {this.state.showCheckBox ? (
                  <div>
                    <div className="psw-icon">
                      <Checkbox
                        className="folderCheckbox"
                        onClick={(e) => {
                          if (e && e.stopPropagation) {
                            e.stopPropagation();
                          } else {
                            window.event.cancelBubble = true;
                          }
                        }}
                        onChange={() => {
                          let MyCheckBox = document.getElementsByClassName(
                            "folderCheckbox"
                          )[index];
                          MyCheckBox.checked
                            ? (MyCheckBox.checked = false)
                            : (MyCheckBox.checked = true);
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
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
                )}
              </div>
            );
          })}
        </div>
        <div className="autoMid" style={{ display: this.state.btnShow }}>
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
        {this.state.editPswShow == "block" ? (
          <div className="editPsw-wrapper">
            <div className="remove-wrapper">
              <img
                src={remove}
                className="remove-wrapper-icon"
                onClick={() => {
                  this.setState({
                    removeShow: "block",
                  });
                }}
              />
              <p className="remove-wrapper-text" onClick={removePsw}>
                移出
              </p>
            </div>
            <div className="delete-wrapper">
              <img
                src={deleteIcon}
                className="delete-wrapper-icon "
                onClick={deletePsw}
              />
              <p className="delete-wrapper-text" onClick={deletePsw}>
                删除
              </p>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}
