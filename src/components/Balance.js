import React, { Component } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { connect } from "react-redux";
import {
  etherDepositAmountChanged,
  etherWithdrawAmountChanged,
  tokenDepositAmountChanged,
  tokenWithdrawAmountChanged,
} from "../store/actions";
import {
  depositEther,
  depositToken,
  loadBalances,
  withdrawEther,
  withdrawToken,
} from "../store/interactions";
import {
  accountSelector,
  balancesLoadingSelector,
  etherBalanceSelector,
  etherDepositAmountSelector,
  etherWithdrawAmountSelector,
  exchangeEtherBalanceSelector,
  exchangeSelector,
  exchangeTokenBalanceSelector,
  tokenBalanceSelector,
  tokenDepositAmountSelector,
  tokenSelector,
  tokenWithdrawAmountSelector,
  web3Selector,
} from "../store/selectors";
import Spinner from "./Spinner";

const showBalances = (props, type) => {
  const {
    etherBalance,
    tokenBalance,
    exchangeEtherBalance,
    exchangeTokenBalance,
  } = props;

  if (type === "eth") {
    return (
      <table className="table table-dark table-sm small">
        <thead>
          <tr>
            <th>Token</th>
            <th>Wallet</th>
            <th>Exchange</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ETH</td>
            <td>{etherBalance}</td>
            <td>{exchangeEtherBalance}</td>
          </tr>
        </tbody>
      </table>
    );
  } else if (type === "dil") {
    return (
      <table className="table table-dark table-sm small">
        {/* <thead>
          <tr>
            <th>Token</th>
            <th>Wallet</th>
            <th>Exchange</th>
          </tr>
        </thead> */}
        <tbody>
          <tr>
            <td>DIL</td>
            <td>{tokenBalance}</td>
            <td>{exchangeTokenBalance}</td>
          </tr>
        </tbody>
      </table>
    );
  }
};

const showForm = (props) => {
  const {
    dispatch,
    etherDepositAmount,
    etherWithdrawAmount,
    web3,
    exchange,
    account,
    token,
    tokenWithdrawAmount,
    tokenDepositAmount,
  } = props;

  return (
    <Tabs defaultActiveKey="deposit" className="bg-dark text-white">
      <Tab eventKey="deposit" title="Deposit" className="bg-dark">
        {showBalances(props, "eth")}
        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault();
            depositEther(dispatch, exchange, web3, etherDepositAmount, account);
          }}
        >
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="ETH Amount"
              onChange={(e) =>
                dispatch(etherDepositAmountChanged(e.target.value))
              }
              required
            />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">
              Deposit
            </button>
          </div>
        </form>
        {showBalances(props, "dil")}
        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault();
            depositToken(
              dispatch,
              exchange,
              web3,
              token,
              tokenDepositAmount,
              account
            );
          }}
        >
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="DIL Amount"
              onChange={(e) =>
                dispatch(tokenDepositAmountChanged(e.target.value))
              }
              required
            />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">
              Deposit
            </button>
          </div>
        </form>
      </Tab>
      <Tab eventKey="withdraw" title="Withdraw" className="bg-dark">
        {showBalances(props, "eth")}
        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault();
            withdrawEther(
              dispatch,
              exchange,
              web3,
              etherWithdrawAmount,
              account
            );
          }}
        >
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="ETH Amount"
              onChange={(e) =>
                dispatch(etherWithdrawAmountChanged(e.target.value))
              }
              required
            />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">
              Withdraw
            </button>
          </div>
        </form>
        {showBalances(props, "dil")}
        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault();
            withdrawToken(
              dispatch,
              exchange,
              web3,
              token,
              tokenWithdrawAmount,
              account
            );
          }}
        >
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="DIL Amount"
              onChange={(e) =>
                dispatch(tokenWithdrawAmountChanged(e.target.value))
              }
              required
            />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">
              Withdraw
            </button>
          </div>
        </form>
      </Tab>
    </Tabs>
  );
};

export class Balance extends Component {
  componentDidMount() {
    this.loadBlockChainData();
  }

  async loadBlockChainData() {
    const { dispatch, web3, exchange, token, account } = this.props;
    await loadBalances(dispatch, web3, exchange, token, account);
  }

  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">Balance</div>
        <div className="card-body">
          {this.props.showForm ? showForm(this.props) : <Spinner />}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const balancesLoading = balancesLoadingSelector(state);

  return {
    account: accountSelector(state),
    exchange: exchangeSelector(state),
    token: tokenSelector(state),
    web3: web3Selector(state),
    etherBalance: etherBalanceSelector(state),
    tokenBalance: tokenBalanceSelector(state),
    exchangeEtherBalance: exchangeEtherBalanceSelector(state),
    exchangeTokenBalance: exchangeTokenBalanceSelector(state),
    balancesLoading,
    showForm: !balancesLoading,
    etherDepositAmount: etherDepositAmountSelector(state),
    etherWithdrawAmount: etherWithdrawAmountSelector(state),
    tokenDepositAmount: tokenDepositAmountSelector(state),
    tokenWithdrawAmount: tokenWithdrawAmountSelector(state),
  };
}

export default connect(mapStateToProps)(Balance);
