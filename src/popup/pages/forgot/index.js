import React, { Component } from "react";
import arrowLeft from "./icon_arrowright_black@2x.png";
import { Button, Card, Form, Input } from "antd";
import "./forgot.css";
export default class Forgot extends Component {
  render() {
    const goBack = () => {
      this.props.history.push("./login");
    };
    const layout = {
      labelCol: { span: 24 },
      wrapperCol: { span: 16 },
    };
    return (
      <div>
        <Card className="forgot-card-wrapper" bordered={false}>
          <div>
            <img
              className="forgot-form-title"
              onClick={goBack}
              src={arrowLeft}
            />
          </div>
          <div className="forgot-card-content">
            <div className="forgot-card-forgotText">忘记密码</div>
            <div className="forgot-card-inputForgotText">请输入手机号</div>
            <Form {...layout}>
              <Form.Item label="" name="username">
                <Input className="forgot-card-input" bordered={false} />
              </Form.Item>
              <Form.Item label="" name="username">
                <Button
                  type="primary"
                  className="forgot-form-btn"
                  onClick={() => {
                    this.props.history.push({
                      pathname: "/setMP",
                      state: { id: "reset" },
                    });
                  }}
                >
                  获取验证码
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Card>
      </div>
    );
  }
}
