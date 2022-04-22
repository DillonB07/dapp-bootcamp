import React, { Component } from "react";
import "./App.css";
import {
  loadAccount,
  loadExchange,
  loadToken,
  loadWeb3,
} from "../store/interactions";
import { connect } from "react-redux";
import Navbar from "./Navbar";
import Content from "./Content";
import { contractsLoadedSelector } from "../store/selectors";

class App extends Component {
  componentDidMount() {
    this.loadBlockChainData(this.props.dispatch);
  }

  async loadBlockChainData(dispatch) {
    await window.ethereum.enable();
    const web3 = loadWeb3(dispatch);
    const networkId = await web3.eth.net.getId();
    await loadAccount(web3, dispatch);
    const token = await loadToken(web3, networkId, dispatch);
    const exchange = await loadExchange(web3, networkId, dispatch);
    if (!token && !exchange) {
      window.alert(
        "Token and Exchange contracts not found on this network. Please select another network with MetaMask."
      );
    } else if (!token) {
      window.alert(
        "Token contract not found on this network. Please select another network with MetaMask."
      );
    } else if (!exchange) {
      window.alert(
        "Exchange contract not found on this network. Please select another network with MetaMask."
      );
    }
  }

  render() {
    return (
      <div>
        <Navbar />
        {this.props.contractsLoaded ? (
          <Content />
        ) : (
          <div className="content">
            <div className="vertical-split">
              <div className="card bg-dark text-white">
                <div className="card-header">Loading</div>
                <div className="card-body">
                  <p className="card-text">
                    Sorry, we are trying to find the token and exchange
                    contracts on the current network. If this screen has been
                    here for a while, please make sure that you are connected to
                    the correct network inside of MetaMask.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    contractsLoaded: contractsLoadedSelector(state),
  };
}

export default connect(mapStateToProps)(App);
