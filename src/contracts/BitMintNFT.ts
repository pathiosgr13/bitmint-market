import {
    Address,
    Blockchain,
    BytesWriter,
    Calldata,
    encodeSelector,
    MemorySlotData,
    OP_NET,
    Revert,
    SafeMath,
    Selector,
    StoredU256,
    StoredString,
} from '@btc-vision/btc-runtime/runtime';
import { u256 } from 'as-bignum/assembly';

@final
export class BitMintNFT extends OP_NET {
    private readonly nameSlot: u16 = 1;
    private readonly symbolSlot: u16 = 2;
    private readonly totalSupplySlot: u16 = 3;
    private readonly maxSupplySlot: u16 = 4;

    private _name: StoredString;
    private _symbol: StoredString;
    private _totalSupply: StoredU256;
    private _maxSupply: StoredU256;

    public constructor() {
        super();
        this._name = new StoredString(this.nameSlot, 'BitMint NFT');
        this._symbol = new StoredString(this.symbolSlot, 'BMNT');
        this._totalSupply = new StoredU256(this.totalSupplySlot, u256.Zero);
        this._maxSupply = new StoredU256(this.maxSupplySlot, u256.fromU32(1000));
    }

    public override callMethod(method: Selector, calldata: Calldata): BytesWriter {
        switch (method) {
            case encodeSelector('mint'):
                return this.mint(calldata);
            case encodeSelector('name'):
                return this.name();
            case encodeSelector('symbol'):
                return this.symbol();
            case encodeSelector('totalSupply'):
                return this.totalSupply();
            case encodeSelector('maxSupply'):
                return this.maxSupply();
            default:
                throw new Revert('Unknown method');
        }
    }

    private mint(_calldata: Calldata): BytesWriter {
        const total = this._totalSupply.value;
        const max = this._maxSupply.value;

        if (u256.ge(total, max)) {
            throw new Revert('Max supply reached');
        }

        const newSupply = SafeMath.add(total, u256.fromU32(1));
        this._totalSupply.value = newSupply;

        const response = new BytesWriter(32);
        response.writeU256(newSupply);
        return response;
    }

    private name(): BytesWriter {
        const response = new BytesWriter(32);
        response.writeStringWithLength(this._name.value);
        return response;
    }

    private symbol(): BytesWriter {
        const response = new BytesWriter(32);
        response.writeStringWithLength(this._symbol.value);
        return response;
    }

    private totalSupply(): BytesWriter {
        const response = new BytesWriter(32);
        response.writeU256(this._totalSupply.value);
        return response;
    }

    private maxSupply(): BytesWriter {
        const response = new BytesWriter(32);
        response.writeU256(this._maxSupply.value);
        return response;
    }
}