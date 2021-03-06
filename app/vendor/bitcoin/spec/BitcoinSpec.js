describe("Bitcoin", function() {

  beforeEach(function() {
    Bitcoin.paranoia = 0;
  });

  describe("Address", function() {

    describe(".validate", function() {

      it("returns true given 1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T", function() {
        expect(Bitcoin.Address.validate("1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T")).
          toBe(true);
      });

      it("returns false with an invalid checksum", function() {
        expect(Bitcoin.Address.validate("1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1a")).
          toBe(false);
      });

      it("returns true given 1Drt3c8pSdrkyjuBiwVcSSixZwQtMZ3Tew", function() {
        expect(Bitcoin.Address.validate("1Drt3c8pSdrkyjuBiwVcSSixZwQtMZ3Tew")).
          toBe(true);
      });

      it("returns true given 3FbU6yRKMdRufy25jKVaMCvEm6RCh99vBH", function() {
        expect(Bitcoin.Address.validate("3FbU6yRKMdRufy25jKVaMCvEm6RCh99vBH")).
          toBe(true);
      });

      it("returns false with an invalid checksum", function() {
        expect(Bitcoin.Address.validate("1Ert3c8pSdrkyjuBiwVcSSixZwQtMZ3Tew")).
          toBe(false);
      });

      it("returns false when it doesn't start with a 1", function() {
        expect(Bitcoin.Address.validate("mjHGK31NyLGkjkFYRYMngkrP2FjSQzmDaD")).
          toBe(false);
      });

      it("returns false when it is too short", function() {
        expect(Bitcoin.Address.validate("1NotAnAddress")).
          toBe(false);
      });

      it("returns false when containing an O", function() {
        expect(Bitcoin.Address.validate("1Ort3c8pSdrkyjuBiwVcSSixZwQtMZ3Tew")).
          toBe(false);
      });

      it("returns false when containing an I", function() {
        expect(Bitcoin.Address.validate("1Irt3c8pSdrkyjuBiwVcSSixZwQtMZ3Tew")).
          toBe(false);
      });

      it("returns false when containing an l", function() {
        expect(Bitcoin.Address.validate("1lrt3c8pSdrkyjuBiwVcSSixZwQtMZ3Tew")).
          toBe(false);
      });

      it("returns false when containing an 0", function() {
        expect(Bitcoin.Address.validate("10rt3c8pSdrkyjuBiwVcSSixZwQtMZ3Tew")).
          toBe(false);
      });

      it("returns false when not base58 encoded", function() {
        expect(Bitcoin.Address.validate("1*wSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T")).
          toBe(false);
      });

    });

    describe(".generate", function() {

      var keyPair;

      beforeEach(function(done) {
        Bitcoin.Address.generate(function(obj) {
          keyPair = obj;
          done();
        });
      });

      it("generates a valid Bitcoin address", function() {
        expect(Bitcoin.Address.validate(keyPair.bitcoinAddress)).toBe(true);
      });

      it("uses the secp256k1 curve", function() {
        expect(keyPair.curve === sjcl.ecc.curves.k256).toBe(true);
      });

      it("generates a private key exponent", function() {
        expect(keyPair.privateKeyExponent).toBeDefined;
      });

      it("generates a public key", function() {
        expect(sjcl.codec.hex.fromBits(keyPair.publicKeyX).length).toEqual(32 * 2);
        expect(sjcl.codec.hex.fromBits(keyPair.publicKeyY).length).toEqual(32 * 2);
      });

    });

  });

  describe(".parseCode", function() {

    it("parses a bitcoin address", function() {
      var actual = Bitcoin.parseCode('1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T');

      expect(actual).toEqual({
        address : '1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T'
      });
    });

    it("parses a multisig address", function() {
      var actual = Bitcoin.parseCode('3FbU6yRKMdRufy25jKVaMCvEm6RCh99vBH');

      expect(actual).toEqual({
        address : '3FbU6yRKMdRufy25jKVaMCvEm6RCh99vBH'
      });
    });

    it("parses a bitcoin address with the bitcoin: prefix", function() {
      var actual = Bitcoin.parseCode('bitcoin:1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T');

      expect(actual).toEqual({
        address : '1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T'
      });
    });

    it("parses a bitcoin multisig address with the bitcoin: prefix", function() {
      var actual = Bitcoin.parseCode('bitcoin:3FbU6yRKMdRufy25jKVaMCvEm6RCh99vBH');

      expect(actual).toEqual({
        address : '3FbU6yRKMdRufy25jKVaMCvEm6RCh99vBH'
      });
    });

    it("parses an address and amount", function() {
      var actual = Bitcoin.parseCode('bitcoin:1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T?amount=0.0001');

      expect(actual).toEqual({
        address : '1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T',
        amount : 0.0001
      });
    });

    it("parses an address and label", function() {
      var actual = Bitcoin.parseCode('bitcoin:1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T?label=Mike');

      expect(actual).toEqual({
        address : '1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T',
        label : 'Mike'
      });
    });

    it("parses an address, amount, and label", function() {
      var actual = Bitcoin.parseCode('bitcoin:1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T?amount=10.23&label=Mike');

      expect(actual).toEqual({
        address : '1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T',
        amount : 10.23,
        label : 'Mike'
      });
    });

    it("parses params while url decoding", function() {
      var actual = Bitcoin.parseCode('bitcoin:175tWpb8K1S7NmH4Zx6rewF9WQrcZv245W?amount=50&label=Luke-Jr&message=Donation%20for%20project%20xyz');

      expect(actual).toEqual({
        address : '175tWpb8K1S7NmH4Zx6rewF9WQrcZv245W',
        amount : 50,
        label : 'Luke-Jr',
        message : 'Donation for project xyz'
      });
    });

    it("parses a bitpay qrcode", function() {
      var actual = Bitcoin.parseCode('bitcoin:1ADei3yngtnFhqJRuKEp2YdNqritUi8icD?amount=0.0736&r=https%3A%2F%2Fbitpay.com%2Fi%2F8S37XGmf5MeXUbuvuHcQUk');

      expect(actual).toEqual({
        address : '1ADei3yngtnFhqJRuKEp2YdNqritUi8icD',
        amount : 0.0736,
        r : 'https://bitpay.com/i/8S37XGmf5MeXUbuvuHcQUk'
      });
    });

    it("parses blockchain.info payment request qrcode with leading bitcoin://", function() {
      var actual = Bitcoin.parseCode('bitcoin://1ADei3yngtnFhqJRuKEp2YdNqritUi8icD?amount=0.0736');

      expect(actual).toEqual({
        address : '1ADei3yngtnFhqJRuKEp2YdNqritUi8icD',
        amount : 0.0736
      });
    });

    it("does not parse a testnet address", function() {
      var actual = Bitcoin.parseCode('bitcoin%3AmrkkTkkuCWzLzNSn4BpRMCfMPRbfWTvYnJ%3Famount%3D0.0004');

      expect(actual).toBeNull;
    });

  });

  describe("PrivateKey", function() {

    describe(".validate", function() {

      describe('given hex', function() {

        it("returns true given 18e14a7b6a307f426a94f8114701e7c8e774e7f9a47e2c2035db29a206321725", function() {
          expect(Bitcoin.PrivateKey.validate("18e14a7b6a307f426a94f8114701e7c8e774e7f9a47e2c2035db29a206321725"))
            .toBe(true);
        });

        it("returns true given 18E14A7B6A307F426A94F8114701E7C8E774E7F9A47E2C2035DB29A206321725", function() {
          expect(Bitcoin.PrivateKey.validate("18E14A7B6A307F426A94F8114701E7C8E774E7F9A47E2C2035DB29A206321725"))
            .toBe(true);
        });

        it('returns false given non 64 character hex', function() {
          // too short
          expect(Bitcoin.PrivateKey.validate("18e14a7b6a307f426a94f8114701e7c8e774e7f9a47e2c2035db29a20632172"))
            .toBe(false);
          // too long
          expect(Bitcoin.PrivateKey.validate("18e14a7b6a307f426a94f8114701e7c8e774e7f9a47e2c2035db29a2063217251"))
            .toBe(false);
        });

        it('returns false for non hex', function() {
          expect(Bitcoin.PrivateKey.validate("NOe14a7b6a307f426a94f8114701e7c8e774e7f9a47e2c2035db29a206321725"))
            .toBe(false);
        });

      });

      describe('given uncompressed WIF', function() {

        it("returns true given 5J1F7GHadZG3sCCKHCwg8Jvys9xUbFsjLnGec4H125Ny1V9nR6V", function() {
          expect(Bitcoin.PrivateKey.validate("5J1F7GHadZG3sCCKHCwg8Jvys9xUbFsjLnGec4H125Ny1V9nR6V"))
            .toBe(true);
        });

        it("returns false given a failed checksum", function() {
          expect(Bitcoin.PrivateKey.validate("5J1F7GHadZG3sCCKHCwg8Jvys9xUbFsjLnGec4H125Ny1V9nR6a"))
            .toBe(false);
        });

      });

      describe('given BIP38 format', function() {

        it("returns true given 6PRVWUbkzzsbcVac2qwfssoUJAN1Xhrg6bNk8J7Nzm5H7kxEbn2Nh2ZoGg", function() {
          expect(Bitcoin.PrivateKey.validate('6PRVWUbkzzsbcVac2qwfssoUJAN1Xhrg6bNk8J7Nzm5H7kxEbn2Nh2ZoGg'))
            .toBe(true);
        });

        it("returns true given 6PfQu77ygVyJLZjfvMLyhLMQbYnu5uguoJJ4kMCLqWwPEdfpwANVS76gTX", function() {
          expect(Bitcoin.PrivateKey.validate('6PfQu77ygVyJLZjfvMLyhLMQbYnu5uguoJJ4kMCLqWwPEdfpwANVS76gTX'))
            .toBe(true);
        });

      });

    });

    describe(".toHex", function() {

      it('returns hex if given hex', function() {
        expect(Bitcoin.PrivateKey.toHex('18e14a7b6a307f426a94f8114701e7c8e774e7f9a47e2c2035db29a206321725'))
          .toEqual('18e14a7b6a307f426a94f8114701e7c8e774e7f9a47e2c2035db29a206321725');
      });

      it('returns hex if given uncompressed WIF', function() {
        expect(Bitcoin.PrivateKey.toHex('5J1F7GHadZG3sCCKHCwg8Jvys9xUbFsjLnGec4H125Ny1V9nR6V'))
          .toEqual('18e14a7b6a307f426a94f8114701e7c8e774e7f9a47e2c2035db29a206321725');
      });

      it('returns hex if given BIP38 format uncompressed, no ec multiply test vector 1', function() {
        expect(Bitcoin.PrivateKey.toHex('6PRVWUbkzzsbcVac2qwfssoUJAN1Xhrg6bNk8J7Nzm5H7kxEbn2Nh2ZoGg', 'TestingOneTwoThree'))
          .toEqual('cbf4b9f70470856bb4f40f80b87edb90865997ffee6df315ab166d713af433a5');
      });

      it('returns hex if given BIP38 format uncompressed, no ec multiply test vector 2', function() {
        expect(Bitcoin.PrivateKey.toHex('6PRNFFkZc2NZ6dJqFfhRoFNMR9Lnyj7dYGrzdgXXVMXcxoKTePPX1dWByq', 'Satoshi'))
          .toEqual('09c2686880095b1a4c249ee3ac4eea8a014f11e6f986d0b5025ac1f39afbd9ae');
      });

      it('returns hex if given BIP38 format uncompressed, ec multiply test vector 1', function() {
        expect(Bitcoin.PrivateKey.toHex('6PfQu77ygVyJLZjfvMLyhLMQbYnu5uguoJJ4kMCLqWwPEdfpwANVS76gTX', 'TestingOneTwoThree'))
          .toEqual('a43a940577f4e97f5c4d39eb14ff083a98187c64ea7c99ef7ce460833959a519');
      });

      it('returns hex if given BIP38 format uncompressed, ec multiply test vector 2', function() {
        expect(Bitcoin.PrivateKey.toHex('6PfLGnQs6VZnrNpmVKfjotbnQuaJK4KZoPFrAjx1JMJUa1Ft8gnf5WxfKd', 'Satoshi'))
          .toEqual('c2c8036df268f498099350718c4a3ef3984d2be84618c2650f5171dcc5eb660a');
      });

      it('returns hex if given BIP38 format with odd passpoint y coordinate', function() {
        expect(Bitcoin.PrivateKey.toHex('6PfSmTYzfgevaCAEZkaeKx76GXRCva7bNRMxiQ2VwSzQpN7Gjqmd3UCjKc', 'LamePassword'))
          .toEqual('fe4e300476fcaf485c111c7095612fc4aff25e8998c4786dabfed337649192a3');
      });

      it('returns hex if given BIP38 format with even passpoint y coordinate', function() {
        expect(Bitcoin.PrivateKey.toHex('6PfYRzAqHbq2KNbMHEeVFhEZyWJevxFZEEg1HxfEW85PL3gc3mfMwNP4Q4', 'asdfasdf'))
          .toEqual('c8f0998b7e499268df9e1d108addcf49bc4a85a53bbf4c890ca3c677bc7c5e32');
      });

    });

    describe(".address", function() {

      it('returns 16UwLL9Risc3QfPqBUvKofHmBQ7wMtjvM', function() {
        expect(Bitcoin.PrivateKey.address("18e14a7b6a307f426a94f8114701e7c8e774e7f9a47e2c2035db29a206321725"))
          .toEqual('16UwLL9Risc3QfPqBUvKofHmBQ7wMtjvM');
      });

      it('returns 1GAehh7TsJAHuUAeKZcXf5CnwuGuGgyX2S', function() {
        expect(Bitcoin.PrivateKey.address("0C28FCA386C7A227600B2FE50B7CAE11EC86D3BF1FBE471BE89827E19D72AA1D"))
          .toEqual('1GAehh7TsJAHuUAeKZcXf5CnwuGuGgyX2S');
      });

      it('returns 18azdtvrAE9uW7mJCEqeghzrQ2RcKfN9Fa', function() {
        expect(Bitcoin.PrivateKey.address("5c1e1a87c84fcbb11dc2e2d4bf6d8178c0fe8de9ac0f60123a2baea8318cfada"))
          .toEqual('18azdtvrAE9uW7mJCEqeghzrQ2RcKfN9Fa');
      });

      it('returns 1Dnb4zgZzT42RFuYJV6EMMWGmrYcbTmuTe', function() {
        expect(Bitcoin.PrivateKey.address("7ade4ec03e0b6b227fbf609e151ccb78de3230cefa7c59ad5bbc941b357191cf"))
          .toEqual('1Dnb4zgZzT42RFuYJV6EMMWGmrYcbTmuTe');
      });

    });

    describe(".wif", function() {

      it('returns 5J1F7GHadZG3sCCKHCwg8Jvys9xUbFsjLnGec4H125Ny1V9nR6V', function() {
        expect(Bitcoin.PrivateKey.wif("18e14a7b6a307f426a94f8114701e7c8e774e7f9a47e2c2035db29a206321725"))
          .toEqual('5J1F7GHadZG3sCCKHCwg8Jvys9xUbFsjLnGec4H125Ny1V9nR6V');
      });

      it('returns 5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ', function() {
        expect(Bitcoin.PrivateKey.wif("0C28FCA386C7A227600B2FE50B7CAE11EC86D3BF1FBE471BE89827E19D72AA1D"))
          .toEqual('5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ');
      });

      it('returns 5JWrbrcFKSMQNhTzyNqc2Eskcwuc2fEh9yNherLWq5bcGUHdmR7', function() {
        expect(Bitcoin.PrivateKey.wif("5c1e1a87c84fcbb11dc2e2d4bf6d8178c0fe8de9ac0f60123a2baea8318cfada"))
          .toEqual('5JWrbrcFKSMQNhTzyNqc2Eskcwuc2fEh9yNherLWq5bcGUHdmR7');
      });

      it('returns 5JkQ69gJHJLzWZugo7NaMvdYCZhoJFXqgmasQnYgrPHuCtaniRg', function() {
        expect(Bitcoin.PrivateKey.wif("7ade4ec03e0b6b227fbf609e151ccb78de3230cefa7c59ad5bbc941b357191cf"))
          .toEqual('5JkQ69gJHJLzWZugo7NaMvdYCZhoJFXqgmasQnYgrPHuCtaniRg');
      });

    });

    describe('.bip38', function() {

      it('returns 6PRVWUbkzzsbcVac2qwfssoUJAN1Xhrg6bNk8J7Nzm5H7kxEbn2Nh2ZoGg', function() {
        expect(Bitcoin.PrivateKey.bip38('TestingOneTwoThree', 'CBF4B9F70470856BB4F40F80B87EDB90865997FFEE6DF315AB166D713AF433A5'))
          .toEqual('6PRVWUbkzzsbcVac2qwfssoUJAN1Xhrg6bNk8J7Nzm5H7kxEbn2Nh2ZoGg');
      });

      it('returns 6PRNFFkZc2NZ6dJqFfhRoFNMR9Lnyj7dYGrzdgXXVMXcxoKTePPX1dWByq', function() {
        expect(Bitcoin.PrivateKey.bip38('Satoshi', '09C2686880095B1A4C249EE3AC4EEA8A014F11E6F986D0B5025AC1F39AFBD9AE'))
          .toEqual('6PRNFFkZc2NZ6dJqFfhRoFNMR9Lnyj7dYGrzdgXXVMXcxoKTePPX1dWByq');
      });

    });

  });

  describe("Transaction", function() {
    var transaction;

    beforeEach(function() {
      transaction = new Bitcoin.Transaction();
    });

    describe("helpers", function() {

      describe("_btcTo8ByteLittleEndianHex", function(btc) {

        it("returns 80fae9c700000000 given 33.54", function() {
          expect(transaction._btcTo8ByteLittleEndianHex(33.54))
            .toEqual("80fae9c700000000");
        });

        it("returns 605af40500000000 given 0.999", function() {
          expect(transaction._btcTo8ByteLittleEndianHex(0.999))
            .toEqual("605af40500000000");
        });

        it("returns 8096980000000000 given 0.1", function() {
          expect(transaction._btcTo8ByteLittleEndianHex(0.1))
            .toEqual("8096980000000000");
        });

        it("returns 0100000000000000 given 0.00000001", function() {
          expect(transaction._btcTo8ByteLittleEndianHex(0.00000001))
            .toEqual("0100000000000000");
        });

        it("returns 9000e459f0750700 given 20999999.9769", function() {
          expect(transaction._btcTo8ByteLittleEndianHex(20999999.9769))
            .toEqual("9000e459f0750700");
        });

        it("returns 00e1f50500000000 given 1", function() {
          expect(transaction._btcTo8ByteLittleEndianHex(1))
            .toEqual("00e1f50500000000");
        });

        it("returns 3075000000000000 given 0.0003", function() {
          expect(transaction._btcTo8ByteLittleEndianHex(0.0003))
            .toEqual("3075000000000000");
        });

      });

      describe("_bitcoinAddressToPubKeyHash", function() {

        it("returns 06f1b66ffe49df7fce684df16c62f59dc9adbd3f given 1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp", function() {
          expect(transaction._bitcoinAddressToPubKeyHash("1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp"))
            .toEqual("06f1b66ffe49df7fce684df16c62f59dc9adbd3f");
        });

        it("returns 010966776006953d5567439e5e39f86a0d273bee given 16UwLL9Risc3QfPqBUvKofHmBQ7wMtjvM", function() {
          expect(transaction._bitcoinAddressToPubKeyHash("16UwLL9Risc3QfPqBUvKofHmBQ7wMtjvM"))
            .toEqual("010966776006953d5567439e5e39f86a0d273bee");
        });

        it("returns 5b6462475454710f3c22f5fdf0b40704c92f25c3 given 19LEkFdfgpHCLkPWSvcYQuobtCUWWY8cxb", function() {
          expect(transaction._bitcoinAddressToPubKeyHash("19LEkFdfgpHCLkPWSvcYQuobtCUWWY8cxb"))
            .toEqual("5b6462475454710f3c22f5fdf0b40704c92f25c3");
        });

        it("returns 097072524438d003d23a2f23edb65aae1bb3e469 given 1runeksijzfVxyrpiyCY2LCBvYsSiFsCm", function() {
          expect(transaction._bitcoinAddressToPubKeyHash("1runeksijzfVxyrpiyCY2LCBvYsSiFsCm"))
            .toEqual("097072524438d003d23a2f23edb65aae1bb3e469");
        });

      });

      describe("_byteLength", function() {

        it("returns 00 given ''", function() {
          expect(transaction._byteLength('')).toEqual("00");
        });

        it("returns 01 given 06", function() {
          expect(transaction._byteLength('06')).toEqual("01");
        });

        it("returns 14 given 06f1b66ffe49df7fce684df16c62f59dc9adbd3f", function() {
          expect(transaction._byteLength('06f1b66ffe49df7fce684df16c62f59dc9adbd3f')).toEqual("14");
        });

        it("returns 19 given 76a91406f1b66ffe49df7fce684df16c62f59dc9adbd3f88ac", function() {
          expect(transaction._byteLength('76a91406f1b66ffe49df7fce684df16c62f59dc9adbd3f88ac')).toEqual("19");
        });

        it('returns fc given 252 bytes', function() {
          expect(transaction._byteLength('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafb'))
            .toEqual('fc');
        });

        it('returns fdfd00 given 253 bytes', function() {
          expect(transaction._byteLength('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfc'))
            .toEqual('fdfd00');
        });

        it('returns fdfe00 given 254 bytes', function() {
          expect(transaction._byteLength('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfd'))
            .toEqual('fdfe00');
        });

        it('returns fdff00 given 255 bytes', function() {
          expect(transaction._byteLength('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfe'))
            .toEqual('fdff00');
        });

        it('returns fd0001 given 256 bytes', function() {
          expect(transaction._byteLength('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff'))
            .toEqual('fd0001');
        });

      });

    });

    describe("#addPayToScriptHashOutput", function() {

      it("adds a pay to script hash output with value 33.54 BTC", function() {
        transaction.addPayToScriptHashOutput('3FbU6yRKMdRufy25jKVaMCvEm6RCh99vBH', 33.54);

        var expected = '';
        expected += '80fae9c700000000'; // value in satoshis. 8 byte little endian.
        expected += '17'; // length of following script
        expected += 'a9'; // OP_HASH160
        expected += '14'; // length of following pubKeyHash
        expected += '98851e780607057aec2a055d8a38e83b20c0d737'; // pubKeyHash (bitcoin address in hex with network and checksum bytes removed)
        expected += '87'; // OP_EQUAL

        expect(transaction.outputs[0]).toEqual(expected);
      });

    });

    describe("#addPayToPubKeyHashOutput", function() {

      it("adds a pay to pubkey hash output with value 33.54 BTC", function() {
        transaction.addPayToPubKeyHashOutput('1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp', 33.54);

        var expected = '';
        expected += '80fae9c700000000'; // value in satoshis. 8 byte little endian.
        expected += '19'; // length of following script
        expected += '76a9'; // OP_DUP OP_HASH160
        expected += '14'; // length of following pubKeyHash
        expected += '06f1b66ffe49df7fce684df16c62f59dc9adbd3f'; // pubKeyHash (bitcoin address in hex with network and checksum bytes removed)
        expected += '88ac'; // OP_EQUALVERIFY OP_CHECKSIG

        expect(transaction.outputs[0]).toEqual(expected);
      });

      it("adds a pay to pubkey hash output with value 0.999 BTC", function() {
        transaction.addPayToPubKeyHashOutput('1runeksijzfVxyrpiyCY2LCBvYsSiFsCm', 0.999);

        var expected = '';
        expected += '605af40500000000'; // value in satoshis. 8 byte little endian.
        expected += '19'; // length of following script
        expected += '76a9'; // OP_DUP OP_HASH160
        expected += '14'; // length of following pubKeyHash
        expected += '097072524438d003d23a2f23edb65aae1bb3e469'; // pubKeyHash (bitcoin address in hex with network and checksum bytes removed)
        expected += '88ac'; // OP_EQUALVERIFY OP_CHECKSIG

        expect(transaction.outputs[0]).toEqual(expected);
      });

      it("throws an error with an amount that is too small", function() {
        expect(function() {
          transaction.addPayToPubKeyHashOutput('1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp', 0.000000001);
        }).toThrow();
      });

      it("throws an error with an invalid address", function() {
        expect(function() {
          transaction.addPayToPubKeyHashOutput('1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDP', 1);
        }).toThrow();
      });

    });

    describe("#addInput", function() {

      it("adds an input from an unspent output at index 1 for 1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDP", function() {
        transaction.addInput({
          tx_hash: '5d05c03a579b7f362a8a2c9d3d91b6cec7afada3ed0a099df15cdca66f42fb28',
          tx_output_n: 1,
          script: '76a91406f1b66ffe49df7fce684df16c62f59dc9adbd3f88ac',
          value: 46720000
        });

        var expected = '';
        expected += '5d05c03a579b7f362a8a2c9d3d91b6cec7afada3ed0a099df15cdca66f42fb28'; // hash of output being spent
        expected += '01000000'; // 4 byte index of output being spent
        expected += '19'; // length of following script
        expected += '76a91406f1b66ffe49df7fce684df16c62f59dc9adbd3f88ac'; // script of output being spent
        expected += 'ffffffff'; // sequence

        expect(transaction.inputs[0].rawHex()).toEqual(expected);
      });

      it("adds an input from an unspent output at index 6 for 1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDP", function() {
        transaction.addInput({
          tx_hash: 'fa2db81729db1c682644053f8d0e9a7f6269df762de275967175c740c0ef7864',
          tx_output_n: 6,
          script: '76a91406f1b66ffe49df7fce684df16c62f59dc9adbd3f88ac',
          value: 1
        });

        var expected = '';
        expected += 'fa2db81729db1c682644053f8d0e9a7f6269df762de275967175c740c0ef7864'; // hash of previous transaction
        expected += '06000000'; // 4 byte index of previous transaction's output
        expected += '19'; // length of following script
        expected += '76a91406f1b66ffe49df7fce684df16c62f59dc9adbd3f88ac'; // script of previous transaction's output
        expected += 'ffffffff'; // sequence

        expect(transaction.inputs[0].rawHex()).toEqual(expected);
      });

    });

    describe("#rawHex", function() {
      var transaction, keyPair;

      beforeEach(function(done) {
        transaction = new Bitcoin.Transaction();

        transaction.addInput({
          tx_hash: '5d05c03a579b7f362a8a2c9d3d91b6cec7afada3ed0a099df15cdca66f42fb28',
          tx_output_n: 1,
          script: '76a91406f1b66ffe49df7fce684df16c62f59dc9adbd3f88ac',
          value: 46720000
        });
        transaction.addPayToPubKeyHashOutput('1runeksijzfVxyrpiyCY2LCBvYsSiFsCm', 0.4671);

        Bitcoin.Address.generate(function(obj) {
          keyPair = obj;
          done();
        });
      });

      it("returns the unsigned transaction", function() {
        var expected = ''

        expected += '01000000'; // version
        expected += '01';       // number of inputs

        // input 0
        expected += '5d05c03a579b7f362a8a2c9d3d91b6cec7afada3ed0a099df15cdca66f42fb28'; // hash of output being spent
        expected += '01000000'; // 4 byte index of output being spent
        expected += '19'; // length of following script
        expected += '76a91406f1b66ffe49df7fce684df16c62f59dc9adbd3f88ac'; // script of output being spent
        expected += 'ffffffff'; // sequence

        expected += '01'; // number of outputs

        // output 0
        expected += 'f0bcc80200000000'; // value in satoshis. 8 byte little endian.
        expected += '19'; // length of following script
        expected += '76a9'; // OP_DUP OP_HASH160
        expected += '14'; // length of following pubKeyHash
        expected += '097072524438d003d23a2f23edb65aae1bb3e469'; // pubKeyHash (bitcoin address in hex with network and checksum bytes removed)
        expected += '88ac'; // OP_EQUALVERIFY OP_CHECKSIG

        expected += '00000000'; // lock time

        expect(transaction.rawHex()).toEqual(expected);
      });

      it("returns the signed transaction", function() {
        var actual = transaction.sign(sjcl.codec.hex.fromBits(keyPair.privateKeyExponent), sjcl.codec.hex.fromBits(keyPair.publicKeyX), sjcl.codec.hex.fromBits(keyPair.publicKeyY));

        expect(actual.substr(0,8)).toEqual('01000000');
        expect(actual.substr(8,2)).toEqual('01');
        expect(actual.substr(10,64)).toEqual('5d05c03a579b7f362a8a2c9d3d91b6cec7afada3ed0a099df15cdca66f42fb28');
        expect(actual.substr(74,8)).toEqual('01000000');

        var inputScriptLength = parseInt(actual.substr(82,2), 16);
        expect(inputScriptLength).toBeLessThan(253);
        var scriptSig = actual.substr(84, inputScriptLength * 2);
        var signatureLength = parseInt(scriptSig.substr(0, 2), 16);

        expect(scriptSig.substr(2, 2)).toEqual('30'); // DER encoded signature header byte
        // scriptSig.substr(4, 2) length of following DER signature
        expect(scriptSig.substr(6, 2)).toEqual('02'); // header byte
        var rLength = parseInt(scriptSig.substr(8, 2), 16);
        expect(rLength).toBeLessThan(34);
        // r coordinate: scriptSig.substr(10, rLength * 2)
        expect(scriptSig.substr(rLength * 2 + 10, 2)).toEqual('02'); // header byte
        var sLength = parseInt(scriptSig.substr(rLength * 2 + 12, 2), 16);
        expect(sLength).toBeLessThan(34);
        // s coordinate: scriptSig.substr(rLength * 2 + 28, sLength * 2)
        expect(scriptSig.substr(signatureLength * 2, 2)).toEqual('01'); // hash type byte: SIGHASH_ALL

        var publicKeyLength = parseInt(scriptSig.substr(signatureLength * 2 + 2, 2), 16);
        expect(publicKeyLength).toEqual(65);
        expect(scriptSig.substr(signatureLength * 2 + 4, 2)).toEqual('04');

        var nextIndex = 84 + (inputScriptLength * 2);
        expect(actual.substr(nextIndex, 8)).toEqual('ffffffff');
        expect(actual.substr(nextIndex + 8, 2)).toEqual('01');
        expect(actual.substr(nextIndex + 10, 16)).toEqual('f0bcc80200000000');
        expect(actual.substr(nextIndex + 26, 2)).toEqual('19');
        expect(actual.substr(nextIndex + 28, 50)).toEqual('76a914097072524438d003d23a2f23edb65aae1bb3e46988ac');
        expect(actual.substr(nextIndex + 78, 8)).toEqual('00000000');
      });

    });

  });

});
