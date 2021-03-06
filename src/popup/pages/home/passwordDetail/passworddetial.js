/* global chrome */
import React, { Component } from 'react'
import { Button, Card, Form, Input, Slider, Checkbox } from 'antd'
import localforage from 'localforage'

import Arrow from './icon_arrowright_black@2x.png'
import copyIcon from './icon_edit_visible.png'
import { handleLocalStorage } from '../../../../api'
import radom from './icon_generate_password.png'
import close from './close.png'
import Delete from './delete.png'
import Lock from './Lock.png'
import './passwordDetail.css'

class PasswordDetail extends Component {
  state = {
    password: '',
    check: true,
    value: 10,
    account: '',
    note: '',
    title: '',
    website: '',
    ToolTip: 10,
    mustShowUp: true,
    onlyOne: true,
    passwordExplain: 'hidden',
    titleExplain: 'hidden',
    accountExplain: 'hidden',
    tipExplain: 'hidden',
    websiteExplain: 'hidden',
    accountExplainText: '请输入账号！',
    passwordExplainText: '请输入密码！',
    titleExplainText: '请输入标题！',
  }

  //生成随机密码
  createPassword = (value) => {
    // 生成随机大写
    function getRandomUpper() {
      return String.fromCharCode(Math.floor(Math.random() * 26) + 65)
    }

    // 生成随机数字
    function getRandomNumber() {
      return +String.fromCharCode(Math.floor(Math.random() * 10) + 48)
    }

    //生成随机小写
    function getRandomLower() {
      return String.fromCharCode(Math.floor(Math.random() * 26) + 97)
    }

    // 生成随机符号
    function getRandomSymbol() {
      const symbols = '!@#$%^&*(){}[]=<>/,.'
      return symbols[Math.floor(Math.random() * symbols.length)]
    }
    //创建随机函数对象
    const randomFunc = {
      upper: getRandomUpper,
      number: getRandomNumber,
      symbol: getRandomSymbol,
      lower: getRandomLower,
    }
    //获取对应节点
    const uppercaseEl = document.getElementById('uppercase')
    const numbersEl = document.getElementById('numbers')
    const symbolsEl = document.getElementById('symbols')
    //设置对应配置信息
    const length = value
    // const hasLower = lowercaseEl.checked;
    let hasUpper = uppercaseEl.checked
    const hasNumber = numbersEl.checked
    const hasSymbol = symbolsEl.checked
    let hasLower = true
    const res = generatePassword(
      hasLower,
      hasUpper,
      hasNumber,
      hasSymbol,
      length
    )
    //获取密码
    function generatePassword(lower, upper, number, symbol, length) {
      // 1.初始化密码
      let generatedPassword = ''
      // 2.过滤出没有选中的密码类型
      const typesCount = lower + upper + number + symbol
      const typeArr = [{ lower }, { upper }, { number }, { symbol }].filter(
        (item) => Object.values(item)[0]
      )
      //
      if (typesCount === 0) {
        return ''
      }
      // 3.通过循环获得每个密码并返回给存储密码的变量
      for (let i = 0; i < length; i += typesCount) {
        typeArr.forEach((type) => {
          const funcName = Object.keys(type)[0]
          generatedPassword += randomFunc[funcName]()
        })
      }
      //
      // 4.将处理后的随机密码结果进行保存再返回这个值
      const finalPassword = generatedPassword.slice(0, length)

      return finalPassword
    }
    return res
  }

  componentDidMount() {
    // 密码选择器一开始就初始化密码
    let res = this.createPassword(this.state.value)
    this.setState(() => ({
      password: res,
    }))

    //获取用户密码详细信息并保存再state中
    let {
      account,
      note,
      pwd,
      title,
      website,
      id,
    } = this.props.location.state.itemDetail
    this.setState({
      account,
      note,
      pwd,
      title,
      website,
      id,
    })
  }

  render() {
    const pluginID = handleLocalStorage('get', 'pluginID')
    const token = handleLocalStorage('get', 'token')
    let { id } = this.props.location.state.itemDetail
    const { searchInputValue, oldSearchList } = this.props.location.state
    let { isDeleteFolder } = this.props.location.state

    const _this = this
    //设置密码
    const setValue = (value) => {
      //value即为当前slider的值,setState是异步的，不这样获取不到最新值
      this.setState(
        {
          value,
        },
        () => {
          let res = this.createPassword(this.state.value)
          this.setState(() => ({
            password: res,
          }))
        }
      )
    }

    //返回上一级子页面

    const goBack = () => {
      let isDeleteFolder
      let preList
      if (this.props.location.state) {
        isDeleteFolder = this.props.location.state.isDeleteFolder
        preList = this.props.location.state.preList
      }
      if (isDeleteFolder) {
        if (preList && preList.length > 0) {
          this.props.history.push({
            pathname: '/folderDetail',
            state: { preList: preList },
          })
        } else {
          this.props.history.push({
            pathname: '/folderDetail',
          })
        }
      } else if (searchInputValue) {
        this.props.history.push({
          pathname: '/home/psd',
          state: { searchInputValue, oldSearchList },
        })
      } else {
        this.props.history.push('/home/psd')
      }
    }

    //显示\关闭用户设置的密码
    const showPassword = () => {
      let input = document.getElementById('password-input')
      input.type == 'password'
        ? (input.type = 'text')
        : (input.type = 'password')
    }

    //关闭密码生成器
    const closeModal = () => {
      let Modal = document.getElementsByClassName('password-modal')[0]
      Modal.style.display = 'none'
    }

    //打开密码生成器
    const showModal = () => {
      let Modal = document.getElementsByClassName('password-modal')[0]
      Modal.style.display = 'block'
    }

    //把随机生成的密码传递给密码Input框 并关闭页面
    const closeSetModal = () => {
      let Modal = document.getElementsByClassName('password-modal')[0]
      let input = document.getElementById('password-input')
      var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      ).set

      nativeInputValueSetter.call(input, this.state.password)

      var ev2 = new Event('input', { bubbles: true })
      input.dispatchEvent(ev2)
      // input.value = this.state.password;
      Modal.style.display = 'none'
    }
    // 发请求删除用户密码信息
    const deleteItem = async (config, targetObj) => {
      const _this = this
      const pluginID = handleLocalStorage('get', 'pluginID')
      const value = {
        pluginId: pluginID / 1,
        passwordIds: [id],
      }

      const folderId = handleLocalStorage('get', 'folderId')

      if (isDeleteFolder) {
        const userInfo = {
          folderId,
          passwordIds: [id],
        }
        function sendMessageToContentScript(mes) {
          mes.requestType = 'outFolder'

          chrome.runtime.sendMessage({ mes }, function (response) {
            let res = JSON.parse(response)
          })
        }
        sendMessageToContentScript(userInfo)
      }

      const sendMessageToContentBackgroundScript = (mes) => {
        mes.requestType = 'deleteItem'
        chrome.runtime.sendMessage({ mes }, function (response) {})
      }
      sendMessageToContentBackgroundScript(value)

      chrome.extension.onMessage.addListener(function (
        request,
        sender,
        sendResponse
      ) {
        if (request == 'deleteSuccess') {
          if (isDeleteFolder) {
            _this.props.history.push({
              pathname: '/folderDetail',
              state: { afterDelete: true },
            })
          } else {
            _this.setState(
              {
                onlyOne: true,
              },
              () => {
                _this.props.history.push('/home/psd')
              }
            )
          }
        }
      })
    }

    //关闭删除页
    const closeModal2 = () => {
      let Modal = document.getElementsByClassName('password-modal2')[0]
      if (Modal) {
        Modal.style.display = 'none'
      }
    }

    //打开删除页
    const showModal2 = () => {
      let Modal = document.getElementsByClassName('password-modal2')[0]
      Modal.style.display = 'block'
    }

    //发请修改在密码详情页中修改的数据(流程： 发编辑请求 ->返回新的数据-->并删除原始数据-->把新数据数据传给bg->bg修改本地数据->传给密码库页面更新数据)
    const editInfo = async () => {
      if (this.state.onlyOne) {
        this.setState({
          onlyOne: false,
        })
        let { title, pwd, note, website, account, id } = this.state
        if (!title) {
          this.setState({
            titleExplain: 'visible',
            onlyOne: true,
          })
        }

        if (!pwd) {
          this.setState({
            passwordExplain: 'visible',
            onlyOne: true,
          })
        }
        if (!account) {
          this.setState({
            accountExplain: 'visible',
            onlyOne: true,
          })
        }
        if (title) {
          this.setState({
            titleExplain: 'hidden',
          })
        }
        if (pwd) {
          this.setState({
            passwordExplain: 'hidden',
          })
        }
        if (account) {
          this.setState({
            accountExplain: 'hidden',
          })
        }
        if (!website) {
          website = ''
        }
        if (
          title &&
          title.length > 0 &&
          pwd &&
          pwd.length > 0 &&
          account &&
          account.length > 0
        ) {
          let passwordItem = {
            title: title,
            pwd: pwd,
            note: note,
            website: website,
            account: account,
            pluginId: pluginID,
            id,
          }
          const sendMessageToContentBackgroundScript = (mes) => {
            mes.requestType = 'editNewPsw'
            chrome.runtime.sendMessage({ mes }, (res) => {
              let response = JSON.parse(res)
              if (response.code === 200) {
                if (isDeleteFolder) {
                  _this.props.history.push({
                    pathname: '/folderDetail',
                    state: { afterDelete: true },
                  })
                } else {
                  _this.props.history.push('/home/psd')
                }
              }
            })
          }
          sendMessageToContentBackgroundScript(passwordItem)
        }
      }
    }

    return (
      <div className="newPsw-wrapper">
        <Card className="newPsw-card-wrapper" bordered={false}>
          <div>
            <img src={Arrow} className="newPsw-form-title" onClick={goBack} />
            <img
              src={copyIcon}
              className="position-to-input-left cursor"
              onClick={showPassword}
            />
            <img
              src={radom}
              className="position-to-input-right cursor"
              onClick={showModal}
            />
            <img
              src={Delete}
              className="password-delete-icon"
              onClick={showModal2}
            />
          </div>
          <div className="newPsw-card-contents">
            <span className="newPsw-card-inputnewPswText">标题</span>
            <input
              className="newPsw-card-input"
              bordered={false}
              value={this.state.title}
              maxlength={24}
              onChange={(e) => {
                const value = e.target.value
                this.setState({
                  title: value,
                })
                if (e.target.value.length === 24) {
                  let passwordExplain = document.getElementsByClassName(
                    'title-explain'
                  )[0]
                  passwordExplain.className = 'title-explain-long'
                  this.setState({
                    titleExplain: 'visible',
                    titleExplainText: '标题长度不能大于24位',
                  })
                } else if (e.target.value.length > 0) {
                  this.setState({
                    titleExplain: 'hidden',
                    titleExplainText: '请输入标题！',
                  })
                } else {
                  let passwordExplain = document.getElementsByClassName(
                    'title-explain-long'
                  )[0]
                  passwordExplain.className = 'title-explain'
                  this.setState({
                    titleExplain: 'hidden',
                    titleExplainText: '请输入标题！',
                  })
                }
              }}
            />
            <div
              className="title-explain"
              style={{ visibility: this.state.titleExplain }}
            >
              {this.state.titleExplainText}
            </div>
            <span className="newPsw-card-inputnewPswText">账号</span>
            <input
              className="newPsw-card-input"
              bordered={false}
              value={this.state.account}
              maxlength={64}
              onChange={(e) => {
                const value = e.target.value
                this.setState({
                  account: value,
                })
                if (e.target.value.length === 64) {
                  let passwordExplain = document.getElementsByClassName(
                    'account-explain'
                  )[0]
                  passwordExplain.className = 'account-explain-long'
                  this.setState({
                    accountExplain: 'visible',
                    accountExplainText: '账号长度不能大于64位',
                  })
                } else if (e.target.value.length > 0) {
                  this.setState({
                    accountExplain: 'hidden',
                    accountExplainText: '请输入账号！',
                  })
                } else {
                  let passwordExplain = document.getElementsByClassName(
                    'account-explain-long'
                  )[0]
                  passwordExplain.className = 'account-explain'
                  this.setState({
                    accountExplain: 'hidden',
                    accountExplainText: '请输入账号！',
                  })
                }
              }}
            />
            <div
              className="account-explain"
              style={{ visibility: this.state.accountExplain }}
            >
              {this.state.accountExplainText}
            </div>
            <span className="newPsw-card-inputnewPswText">密码</span>
            <input
              className="newPsw-card-input "
              id="password-input"
              maxlength={24}
              type="password"
              value={this.state.pwd}
              onChange={(e) => {
                const value = e.target.value
                this.setState({
                  pwd: value,
                })
                if (e.target.value.length > 0) {
                  this.setState({
                    passwordExplain: 'hidden',
                    passwordExplainText: '请输入密码！',
                  })
                } else {
                  let passwordExplain = document.getElementsByClassName(
                    'password-explain-long'
                  )[0]
                  passwordExplain.className = 'password-explain'
                  this.setState({
                    passwordExplain: 'hidden',
                    passwordExplainText: '请输入密码！',
                  })
                }
                if (e.target.value.length === 24) {
                  let passwordExplain = document.getElementsByClassName(
                    'password-explain'
                  )[0]
                  passwordExplain.className = 'password-explain-long'
                  this.setState({
                    passwordExplain: 'visible',
                    passwordExplainText: '密码长度不能大于24位',
                  })
                }
              }}
            />
            <div
              className="password-explain"
              style={{ visibility: this.state.passwordExplain }}
            >
              {this.state.passwordExplainText}
            </div>
            <span className="newPsw-card-inputnewPswText">网址</span>
            <input
              className="newPsw-card-input"
              bordered={false}
              maxlength={255}
              value={this.state.website}
              onChange={(e) => {
                const value = e.target.value
                if (value.length == 255) {
                  this.setState({
                    websiteExplain: 'visible',
                  })
                } else {
                  this.setState({
                    websiteExplain: 'hidden',
                  })
                }
                this.setState({
                  website: value,
                })
              }}
            />
            <div
              className="password-explains"
              style={{ visibility: this.state.websiteExplain }}
            >
              网址不能超过255位
            </div>
            <span className="newPsw-card-inputnewPswText">备注</span>
            <textarea
              className="newPsw-card-inputTextArea"
              value={this.state.note}
              maxlength={100}
              onChange={(e) => {
                const value = e.target.value
                this.setState({
                  note: value,
                })

                if (e.target.value.length === 100) {
                  this.setState({
                    tipExplain: 'visible',
                  })
                } else {
                  this.setState({
                    tipExplain: 'hidden',
                  })
                }
              }}
            />
            <div
              className="tip-explain"
              style={{ visibility: this.state.tipExplain }}
            >
              备注的文字长度不能超过100位！
            </div>
            <Button
              htmlType="submit"
              className="newPsw-form-btn "
              onClick={editInfo}
              shape="round"
            >
              保存
            </Button>
          </div>
        </Card>
        <div className="password-modal">
          <div className="password-title-icon">
            <img src={close} onClick={closeModal} />
          </div>
          <div className="password-title">
            <span className="password-title-info">密码生成器</span>
          </div>
          <div className="password-body">
            <div className="password-body-num">
              <p className="password-body-num-text">{this.state.password}</p>
            </div>
            <div className="password-slider-wrapper">
              <span>{this.state.ToolTip}</span>
              <Slider
                max={24}
                min={0}
                className="password-slider"
                defaultValue={10}
                onChange={(ToolTip) => {
                  this.setState(
                    {
                      ToolTip,
                    },
                    () => {
                      setValue(ToolTip)
                    }
                  )
                }}
              />
              <span>24</span>
            </div>
            <div className="password-body-select">
              <div>
                <span className="password-select-info">大写</span>
                <Checkbox
                  className="c-ml set-b"
                  id="uppercase"
                  checked={this.state.mustShowUp}
                  defaultChecked={this.state.check}
                  onChange={() => {
                    if (this.state.mustShowUp) {
                      this.setState({
                        mustShowUp: false,
                      })
                    } else {
                      this.setState({
                        mustShowUp: true,
                      })
                    }
                    setValue(this.state.value)
                  }}
                />
              </div>
              <div>
                <span className="password-select-info ml">数字</span>
                <Checkbox
                  className="mr c-ml set-b"
                  defaultChecked={this.state.check}
                  id="numbers"
                  onChange={() => {
                    setValue(this.state.value)
                  }}
                />
              </div>
              <div>
                <span className="password-select-info">符号</span>
                <Checkbox
                  className="c-ml set-b"
                  id="symbols"
                  defaultChecked={this.state.check}
                  onChange={() => {
                    setValue(this.state.value)
                  }}
                />
              </div>
            </div>
            <div className="password-btn-group">
              <button className="btn-1 " onClick={closeModal}>
                取消
              </button>

              <div className="btn-layout mr-20 set-bg " onClick={closeSetModal}>
                <span className="password-text">确认</span>
              </div>
            </div>
          </div>
        </div>
        <div className="password-modal2">
          <div className="password-title-icon">
            <img src={Lock} className="lock-icon" />
          </div>
          <div className="password-title">
            <span className="password-title-info">是否删除此密码?</span>
          </div>
          <div className="password-body">
            <div className="password-btn-group">
              <button className="btn-1 " onClick={closeModal2}>
                取消
              </button>
              <div className="btn-layout mr-20 set-bg " onClick={deleteItem}>
                <span className="password-text">确认</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default PasswordDetail
