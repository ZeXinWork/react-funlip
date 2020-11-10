import React from "react";
import ReactDOM from "react-dom";
import Popup from "./popup";
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import { Provider } from "react-redux";
import store from "./popup/store/index";
const antdConfig = {
  locale: zhCN,
};

ReactDOM.render(
  <Provider store={store}>
    <ConfigProvider {...antdConfig}>
      <Popup />
    </ConfigProvider>
  </Provider>,
  document.getElementById("root")
);
