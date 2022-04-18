import { tokens, EVM_REVERT } from "./helpers";

const Token = artifacts.require("./Token");

require("chai").use(require("chai-as-promised")).should();

contract("Token", ([deployer, reciever, exchange]) => {
  const name = "Dillium";
  const symbol = "DIL";
  const decimals = "18";
  const totalSupply = tokens(1000000).toString();
  let token;

  beforeEach(async () => {
    token = await Token.new();
  });

  describe("deployment", () => {
    it("tracks the name", async () => {
      // Read token name and check if it is "Dillium"
      const result = await token.name();
      result.should.equal(name);
    });
    it("tracks the symbol", async () => {
      // Read token symbol and check if it is "DIL"
      const result = await token.symbol();
      result.should.equal(symbol);
    });
    it("tracks the decimals", async () => {
      // Read token decimals and check if it is 18
      const result = await token.decimals();
      result.toString().should.equal(decimals);
    });
    it("tracks the total supply", async () => {
      // Read total supply and check if it is 1000000*(10**18)
      const result = await token.totalSupply();
      result.toString().should.equal(totalSupply.toString());
    });

    it("assigns the total supply to the creator", async () => {
      // Check if total supply has been sent to the deployer
      const result = await token.balanceOf(deployer);
      result.toString().should.equal(totalSupply.toString());
    });
  });

  describe("sending tokens", () => {
    let amount;
    let result;

    describe("success", async () => {
      beforeEach(async () => {
        amount = tokens(100);
        result = await token.transfer(reciever, amount, {
          from: deployer,
        });
      });
      it("transfers token balances", async () => {
        let balanceOf;

        balanceOf = await token.balanceOf(deployer);
        balanceOf.toString().should.equal(tokens(999900).toString());
        balanceOf = await token.balanceOf(reciever);
        balanceOf.toString().should.equal(tokens(100).toString());
      });

      it("emits a Transfer event", async () => {
        const log = result.logs[0];
        log.event.should.equal("Transfer");
        const event = log.args;
        event.from.toString().should.equal(deployer, "from is correct");
        event.to.toString().should.equal(reciever, "to is correct");
        event.value
          .toString()
          .should.equal(amount.toString(), "value is correct");
      });
    });

    describe("failure", async () => {
      it("rejects insufficient balances", async () => {
        let invalidAmount;
        invalidAmount = tokens(1000000000); // Greater than total supply so must be invalid
        await token
          .transfer(reciever, invalidAmount, { from: deployer })
          .should.be.rejectedWith(EVM_REVERT);

        // Attempt transfer when you have no tokens
        invalidAmount = tokens(10);
        await token
          .transfer(deployer, invalidAmount, { from: reciever })
          .should.be.rejectedWith(EVM_REVERT);
      });

      it("rejects invalid recipients", async () => {
        await token.transfer(0x0, amount, { from: deployer }).should.be
          .rejected;
      });
    });
  });

  describe("approving tokens", () => {
    let amount;
    let result;

    beforeEach(async () => {
      amount = tokens(100);
      result = await token.approve(exchange, amount, { from: deployer });
    });

    describe("success", () => {
      it("allocates an allowance for delecated token spending", async () => {
        const allowance = await token.allowance(deployer, exchange);
        allowance.toString().should.equal(amount.toString());
      });

      it("emits an Approval event", async () => {
        const log = result.logs[0];
        log.event.should.equal("Approval");
        const event = log.args;
        event.owner.toString().should.equal(deployer, "owner is correct");
        event.spender.toString().should.equal(exchange, "spender is correct");
        event.value
          .toString()
          .should.equal(amount.toString(), "value is correct");
      });
    });
    describe("failure", () => {
      it("rejects invalid senders", async () => {
        await token.approve(0x0, amount, { from: deployer }).should.be.rejected;
      });
    });
  });

  describe("delegated token transfers", () => {
    let amount;
    let result;

    beforeEach(async () => {
      amount = tokens(100);
      await token.approve(exchange, amount, { from: deployer });
    });

    describe("success", async () => {
      beforeEach(async () => {
        amount = tokens(100);
        result = await token.transferFrom(deployer, reciever, amount, {
          from: exchange,
        });
      });
      it("transfers token balances", async () => {
        let balanceOf;

        balanceOf = await token.balanceOf(deployer);
        balanceOf.toString().should.equal(tokens(999900).toString());
        balanceOf = await token.balanceOf(reciever);
        balanceOf.toString().should.equal(tokens(100).toString());
      });

      it("resets the allowance", async () => {
        const allowance = await token.allowance(deployer, exchange);
        allowance.toString().should.equal("0");
      });

      it("emits a Transfer event", async () => {
        const log = result.logs[0];
        log.event.should.equal("Transfer");
        const event = log.args;
        event.from.toString().should.equal(deployer, "from is correct");
        event.to.toString().should.equal(reciever, "to is correct");
        event.value
          .toString()
          .should.equal(amount.toString(), "value is correct");
      });
    });

    describe("failure", async () => {
      it("rejects insufficient balances", async () => {
        const invalidAmount = tokens(1000000000); // Greater than total supply so must be invalid
        await token
          .transferFrom(deployer, reciever, invalidAmount, { from: exchange })
          .should.be.rejectedWith(EVM_REVERT);
      });
      it("rejects invalid recipients", async () => {
        await token.transfer(deployer, 0x0, amount, { from: exchange }).should
          .be.rejected;
      });
    });
  });
});
