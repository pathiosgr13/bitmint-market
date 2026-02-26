import { u256 } from '@btc-vision/as-bignum/assembly';
import { BytesWriter } from '@btc-vision/btc-runtime/runtime/buffer/BytesWriter';
import { Blockchain } from '@btc-vision/btc-runtime/runtime/env';
import { Calldata } from '@btc-vision/btc-runtime/runtime/types';
import { Address } from '@btc-vision/btc-runtime/runtime/types/Address';
import { Revert } from '@btc-vision/btc-runtime/runtime/types/Revert';
import { OP721 } from '@btc-vision/btc-runtime/runtime/contracts/OP721';
import { OP721InitParameters } from '@btc-vision/btc-runtime/runtime/contracts/interfaces/OP721InitParameters';
import { U256_BYTE_LENGTH } from '@btc-vision/btc-runtime/runtime/utils';

const MINT_PRICE: u256 = u256.fromU32(1000); // 1000 satoshis per mint

export class BitMintNFT extends OP721 {
    public constructor() {
        super();

        // Initialize collection on first deploy
        if (this._initialized.value.isZero()) {
            const params = new OP721InitParameters(
                'BitMint Market',                          // name
                'BMM',                                     // symbol
                u256.fromU32(1000),                        // maxSupply
                'https://bitmint-market.vercel.app/nft/',  // baseURI
                '',                                        // collectionBanner
                '',                                        // collectionIcon
                'Generative NFTs on Bitcoin via OP_NET',   // collectionDescription
                'https://bitmint-market.vercel.app',       // collectionWebsite
            );
            this.instantiate(params, true);
        }
    }

    // Public mint function — anyone can call this
    @method()
    @returns({ name: 'tokenId', type: ABIDataTypes.UINT256 })
    public mint(_: Calldata): BytesWriter {
        const totalSupply = this._totalSupply.value;
        const maxSupply = this._maxSupply.value;

        if (totalSupply >= maxSupply) {
            throw new Revert('All NFTs have been minted');
        }

        const tokenId = this._nextTokenId.value;
        const caller = Blockchain.tx.sender;

        // Mint the NFT to the caller
        this._mint(caller, tokenId);

        // Advance next token id
        this._nextTokenId.value = u256.fromU64(tokenId.toU64() + 1);

        const w = new BytesWriter(U256_BYTE_LENGTH);
        w.writeU256(tokenId);
        return w;
    }

    // Return how many NFTs remain
    @method()
    @returns({ name: 'remaining', type: ABIDataTypes.UINT256 })
    public remaining(_: Calldata): BytesWriter {
        const remaining = this._maxSupply.value - this._totalSupply.value;
        const w = new BytesWriter(U256_BYTE_LENGTH);
        w.writeU256(remaining);
        return w;
    }
}