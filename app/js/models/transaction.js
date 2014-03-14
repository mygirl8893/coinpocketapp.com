(function(BlockChainInfo, Models) {

  function Transaction(address, attrs) {
    var self = this;

    self.id = attrs.tx_index;
    self.time = attrs.time * 1000;
    self.blockHeight = attrs.block_height;
    self.amountDelta = 0;

    // add credits
    for (var j=0; j<attrs.out.length; j++) {
      var output = attrs.out[j];
      if (output.addr === address) {
        self.amountDelta += parseInt(output.value);
      }
    }

    // subtract debits
    for (var k=0; k<attrs.inputs.length; k++) {
      var input = attrs.inputs[k].prev_out;
      if (input.addr === address) {
        self.amountDelta -= parseInt(input.value);
      }
    }

  }

  Transaction.prototype.confirmations = function(currentBlockHeight) {
    var confirmations = currentBlockHeight - this.blockHeight + 1;

    if (confirmations > 0) { // positive
      return confirmations;
    } else { // negative or NaN
      return 0;
    }
  };

  Transaction.prototype.amountDeltaBTC = function() {
    return this.amountDelta / 100000000.0;
  };

  var transactions = [];
  transactions.socket = new BlockChainInfo.WebSocket();

  transactions.fetchRecent = function(address, hollaback) {
    var self = this;
    BlockChainInfo.rawaddr(address, function(data) {
      var txsData = data.txs || [],
          recentTransactions = [];

      for (var i=0; i<txsData.length; i++) {
        var txData = txsData[i];
        var transaction = new Transaction(address, txData);
        recentTransactions.push(transaction);
      }

      if (self.length === 0 && recentTransactions.length > 0) {
        self.trigger('transactions.updated', recentTransactions);
      }

      if (typeof hollaback === 'function') {
        hollaback(recentTransactions);
      }
    });
  };

  transactions.onNewTransaction = function(address, hollaback) {
    var self = this;
    self.socket.onNewTransactionForAddress(address, function(data) {
      var transaction = new Transaction(address, data.x);
      hollaback([transaction]);
    });
  };

  transactions.any = function() {
    return this.length > 0;
  };

  MicroEvent.mixin(transactions);
  Models.transactions = transactions;
  Models.Transaction = Transaction;

})(BlockChainInfo, CoinPocketApp.Models);