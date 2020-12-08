/* global chrome */
import React, { Component } from 'react'
import { Badge } from 'antd'
import { handleLocalStorage } from '../../../../api/index'
import localforage from 'localforage'
import iconAdd from './icon_add_folder@2x.png'
import folder from './folderItem.png'
import reFranch from './reFreach.png'
import robot from './img_02@2x.png'
import add from './icon_btn_add@2x.png'
import './folder.css'

import newFolder from './icon_new_folder@2x.png'

export default class Folder extends Component {
  state = {
    visible: 'none',
    list: [],
    showRobot: false,
    showCreate: 'none',
    onlyOne: true,
    showExplain: 'hidden',
    showExplainInfo: '文件夹名不能为空！',
  }
  showModal = () => {
    let MaskArea = document.getElementById('funlip-mask')
    MaskArea.style.display = 'block'
    this.setState({
      visible: 'block',
    })
  }
  componentWillMount() {
    const pluginId = handleLocalStorage('get', 'pluginID')
    let userInfo = {
      pluginId,
    }
    const sendMessageToContentBackgroundScript = async (mes) => {
      localforage.config({
        driver: localforage.INDEXEDDB,
        name: 'I-heart-indexDB2',
      })

      const getLocalState = async () => {
        const res = localforage
          .getItem('folderList')
          .then(function (value) {
            return value
          })
          .catch(function (err) {
            let error = false
            return error
          })
        return res
      }
      const folderList = await getLocalState()
      const getData = async () => {
        const _this = this
        mes.requestType = 'getFolderList'
        let loading = document.getElementById('funlip-loading')
        loading.style.display = 'block'
        chrome.runtime.sendMessage({ mes }, async function (response) {
          let res = JSON.parse(response)
          //成功获取
          const setRobt = async () => {
            if (res.length == 0) {
              _this.setState(
                {
                  showRobot: true,
                },
                () => {
                  let loading = document.getElementById('funlip-loading')
                  loading.style.display = 'none'
                }
              )
            }
          }

          await setRobt()
          const noRobt = async () => {
            if (res.length >= 0) {
              let arrSortMinToMax = (a, b) => {
                let cReg = /^[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/
                if (!cReg.test(a.name) || !cReg.test(b.name)) {
                  return a.name.localeCompare(b.name)
                } else {
                  return a.name.localeCompare(b.name, 'zh')
                }
              }

              let sortArr = res.sort(arrSortMinToMax)
              _this.setState(
                {
                  list: sortArr,
                },
                () => {
                  localforage
                    .setItem('folderList', res)
                    .then(function (value) {
                      _this.setState(
                        {
                          showCreate: 'block',
                        },
                        () => {
                          let loading = document.getElementById(
                            'funlip-loading'
                          )
                          loading.style.display = 'none'
                        }
                      )
                    })
                    .catch(function (err) {})
                }
              )
            } else {
              alert('获取文件夹失败')
            }
          }
          await noRobt()
        })
      }
      if (folderList == null) {
        getData()
      } else if (folderList.length == 0) {
        getData()
      } else {
        const folderList = await getLocalState()
        let arrSortMinToMax = (a, b) => {
          let cReg = /^[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/
          if (!cReg.test(a.name) || !cReg.test(b.name)) {
            return a.name.localeCompare(b.name)
          } else {
            return a.name.localeCompare(b.name, 'zh')
          }
        }
        let sortArr = folderList.sort(arrSortMinToMax)
        this.setState({
          list: sortArr,
          showCreate: 'block',
        })
      }
    }
    sendMessageToContentBackgroundScript(userInfo)
  }

  render() {
    const goDetail = (passwordList, id, name) => {
      handleLocalStorage('set', 'folderId', id)
      handleLocalStorage('set', 'folderName', name)

      this.props.history.push({
        pathname: '/folderDetail',
        state: { passwordList, folderId: id },
      })
    }
    const canModal = () => {
      document.getElementsByClassName('modal-input')[0].value = ''
      let MaskArea = document.getElementById('funlip-mask')
      MaskArea.style.display = 'none'
      this.setState({
        visible: 'none',
        showExplain: 'hidden',
      })
    }
    const confirmModal = () => {
      if (this.state.onlyOne) {
        this.setState({
          onlyOne: false,
        })
        let folderName = document.getElementsByClassName('modal-input')[0].value
        if (folderName.length == 0) {
          this.setState({
            showExplain: 'visible',
            showExplainInfo: '文件夹名不能为空！',
            onlyOne: true,
          })
        } else {
          const pluginId = handleLocalStorage('get', 'pluginID')
          let userInfo = {
            pluginId,
            name: folderName,
          }
          const sendMessageToContentBackgroundScript = (mes) => {
            mes.requestType = 'addNewFolder'
            const _this = this

            chrome.runtime.sendMessage({ mes }, function (response) {
              let res = JSON.parse(response)
              if (res.id && res.name) {
                let newArray = []
                newArray.push(res)
                newArray[0].fileNum = 0
                newArray[0].passwords = []
                const getLocalstates = async () => {
                  const getLocalState = async () => {
                    const res = localforage
                      .getItem('folderList')
                      .then(function (value) {
                        return value
                      })
                      .catch(function (err) {
                        let error = false
                        return error
                      })
                    return res
                  }
                  const folderList = await getLocalState()
                  folderList.push(newArray[0])

                  localforage
                    .setItem('folderList', folderList)
                    .then(function (value) {})
                    .catch(function (err) {})
                }
                getLocalstates()
                let addNewList = [..._this.state.list, ...newArray]
                let arrSortMinToMax = (a, b) => {
                  let cReg = /^[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/
                  if (!cReg.test(a.name) || !cReg.test(b.name)) {
                    return a.name.localeCompare(b.name)
                  } else {
                    return a.name.localeCompare(b.name, 'zh')
                  }
                }
                let sortArr = addNewList.sort(arrSortMinToMax)
                _this.setState(
                  {
                    showCreate: 'block',
                  },
                  () => {
                    _this.setState(
                      {
                        // list: [..._this.state.list, ...sortArr],
                        list: sortArr,
                      },
                      () => {
                        let MaskArea = document.getElementById('funlip-mask')
                        MaskArea.style.display = 'none'
                        _this.setState({
                          visible: 'none',
                          showRobot: false,
                          onlyOne: true,
                          showExplain: 'hidden',
                        })
                        document.getElementsByClassName(
                          'modal-input'
                        )[0].value = ''
                      }
                    )
                  }
                )
              } else {
                _this.setState({
                  onlyOne: true,
                  showExplain: 'hidden',
                })
                document.getElementsByClassName('modal-input')[0].value = ''
                alert(res.msg)
              }
            })
          }
          sendMessageToContentBackgroundScript(userInfo)
        }
      }
    }

    return (
      <div>
        {this.state.showRobot ? (
          <div className="folder-wrapper">
            <div className="folder-header-wrappers">
              <span className="folder-header-text-info">文件夹</span>
              <img src={reFranch} className="reFranch" />
            </div>
            <div className="home-body">
              <img src={robot} className="robot-icon" />
              <p className="robot-text">还没有文件夹哦</p>
              <div className="robot-add-wrapper" onClick={this.showModal}>
                <img src={add} className="robot-add-icon" />
                <span className="robot-add-text">现在创建</span>
              </div>
            </div>
            <div
              className="folderModal-wrapper"
              style={{ display: this.state.visible }}
            >
              <div>
                <img src={newFolder} className="modal-icon" />
              </div>
              <div className="modal-text">新建文件夹</div>
              <input
                className="modal-input"
                placeholder="输入文件夹名称"
                maxLength={24}
                onChange={(e) => {
                  const value = e.target.value
                  if (value.length > 0) {
                    this.setState({
                      showExplain: 'hidden',
                    })
                  }
                  if (value.length == 24) {
                    this.setState({
                      showExplain: 'visible',
                      showExplainInfo: '文件夹长度最多为24位！',
                    })
                  }
                }}
              />
              <div
                style={{ visibility: this.state.showExplain }}
                className="modal-explain"
              >
                <p>{this.state.showExplainInfo}</p>
              </div>
              <div className="password-btn-group">
                {/* <div className="main ml-20">
                  <div className="btn-1 " onClick={canModal}>
                    <span className="password-text">取消</span>
                  </div>
                </div> */}
                <button className="btn-1" onClick={canModal}>
                  取消
                </button>
                <div
                  className="btn-layout mr-20 set-bg "
                  onClick={confirmModal}
                >
                  <span className="password-text">确 定</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="folder-wrapper">
            <div className="folder-header-wrapper">
              <span className="folder-header-text-info">文件夹</span>
              <img src={reFranch} className="reFranch" />
            </div>
            {/* <div className="folder-catoon-icon"></div> */}
            <div className="folder-collect">
              <div
                className="folder-create"
                style={{ display: this.state.showCreate }}
              >
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
                      goDetail(item.passwords, item.id, item.name)
                    }}
                  >
                    <Badge.Ribbon
                      className="folder-banner-icon"
                      text={item.fileNum}
                      color="#E6E5FF"
                    />
                    <div className="folder-icon ">
                      <img src={folder} className="mr-6" />
                    </div>
                    <div className="folder-user-info">
                      <p className="folder-text">{item.name}</p>
                    </div>
                  </div>
                )
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
              <input
                className="modal-input"
                placeholder="输入文件夹名称"
                maxLength={24}
                onChange={(e) => {
                  const value = e.target.value
                  if (value.length > 0) {
                    this.setState({
                      showExplain: 'hidden',
                    })
                  }
                  if (value.length == 24) {
                    this.setState({
                      showExplain: 'visible',
                      showExplainInfo: '文件夹长度最多为24位！',
                    })
                  }
                }}
              />
              <div
                style={{ visibility: this.state.showExplain }}
                className="modal-explain"
              >
                <p>{this.state.showExplainInfo}</p>
              </div>
              <div className="password-btn-group">
                {/* <div className="main ml-20">
                  <div className="btn-1 " onClick={canModal}>
                    <span className="password-text">取消</span>
                  </div>
                </div> */}
                <button className="btn-1" onClick={canModal}>
                  取消
                </button>
                <div
                  className="btn-layout mr-20 set-bg "
                  onClick={confirmModal}
                >
                  <span className="password-text">确 定</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}
