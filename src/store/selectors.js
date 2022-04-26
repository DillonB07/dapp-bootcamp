import { get } from "lodash";
import { createSelector } from "reselect";
import { ether, ETHER_ADDRESS, GREEN, RED, tokens, YELLOW } from "../helpers";
import moment from "moment";

const account = (state) => get(state, "web3.account");
export const accountSelector = createSelector(account, (a) => a);

const tokenLoaded = (state) => get(state, "token.loaded", false);
export const tokenLoadedSelector = createSelector(tokenLoaded, (tl) => tl);
const exchangeLoaded = (state) => get(state, "exchange.loaded", false);
export const exchangeLoadedSelector = createSelector(
  exchangeLoaded,
  (el) => el
);

const exchange = (state) => get(state, "exchange.contract");
export const exchangeSelector = createSelector(exchange, (e) => e);

export const contractsLoadedSelector = createSelector(
  tokenLoaded,
  exchangeLoaded,
  (tl, el) => tl && el
);

const filledOrdersLoaded = (state) =>
  get(state, "exchange.filledOrders.loaded", false);
export const filledOrdersLoadedSelector = createSelector(
  filledOrdersLoaded,
  (loaded) => loaded
);

const filledOrders = (state) => get(state, "exchange.filledOrders.data", []);
export const filledOrdersSelector = createSelector(
  filledOrders,

  (orders) => {
    // Sort orders by ascending date for price comparison
    orders = orders.sort((a, b) => a.timestamp - b.timestamp);
    orders = decorateFilledOrders(orders);

    // Sort orders by descending date
    orders = orders.sort((a, b) => b.timestamp - a.timestamp);
    return orders;
  }
);

const decorateFilledOrders = (orders) => {
  let previousOrder = orders[0];
  return (orders = orders.map((order) => {
    order = decorateOrder(order);
    order = decorateFilledOrder(order, previousOrder);
    previousOrder = order; // Update previous order one decorated
    return order;
  }));
};

const decorateOrder = (order) => {
  let etherAmount;
  let tokenAmount;
  if (order.tokenGive === ETHER_ADDRESS) {
    etherAmount = order.amountGive;
    tokenAmount = order.amountGet;
  } else {
    etherAmount = order.amountGet;
    tokenAmount = order.amountGive;
  }

  // Calculate token price to 5 decimal places
  const PRECISION = 100000;
  let tokenPrice = etherAmount / tokenAmount;
  tokenPrice = Math.round(tokenPrice * PRECISION) / PRECISION;

  return {
    ...order,
    etherAmount: ether(etherAmount),
    tokenAmount: tokens(tokenAmount),
    tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format("h:mm:ss a M/D"),
  };
};

const decorateFilledOrder = (order, previousOrder) => {
  return {
    ...order,
    tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder),
  };
};

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
  // Show green if only one order exists
  if (previousOrder.id === orderId) {
    return GREEN;
  }
  // Green if order price higher than previous order
  // Red if order price lower than previous order
  if (previousOrder.tokenPrice <= tokenPrice) {
    return GREEN;
  } else if (previousOrder.tokenPrice === tokenPrice) {
    return YELLOW;
  } else {
    return RED;
  }
};
