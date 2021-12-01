// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFTCollection.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract NFTMarketplace is Ownable {
    uint256 public offerCount;
    uint256 public serviceFee; // BPS = 10000. serviceFee = 1000 that means = 10 % 
    mapping(uint256 => _Offer) public offers;
    mapping(address => uint256) public userFunds;

    NFTCollection nftCollection;

    struct _Offer {
        uint256 offerId;
        uint256 id;
        address user;
        uint256 price;
        bool fulfilled;
        bool cancelled;
    }

    event Offer(
        uint256 offerId,
        uint256 id,
        address user,
        uint256 price,
        bool fulfilled,
        bool cancelled
    );

    event OfferFilled(uint256 offerId, uint256 id, address newOwner);
    event OfferCancelled(uint256 offerId, uint256 id, address owner);
    event ClaimFunds(address user, uint256 amount);

    constructor(address _nftCollection, uint _serviceFee) {
        nftCollection = NFTCollection(_nftCollection);
        serviceFee = _serviceFee;
    }

    function makeOffer(uint256 _id, uint256 _price) public {
        nftCollection.transferFrom(msg.sender, address(this), _id);
        offerCount++;
        offers[offerCount] = _Offer(
            offerCount,
            _id,
            msg.sender,
            _price,
            false,
            false
        );
        emit Offer(offerCount, _id, msg.sender, _price, false, false);
    }

    function fillOffer(uint256 _offerId) public payable {
        _Offer storage _offer = offers[_offerId];
        require(_offer.offerId == _offerId, "The offer must exist");
        require(
            _offer.user != msg.sender,
            "The owner of the offer cannot fill it"
        );
        require(!_offer.fulfilled, "An offer cannot be fulfilled twice");
        require(!_offer.cancelled, "A cancelled offer cannot be fulfilled");
        require(
            msg.value == _offer.price,
            "The BSC amount should match with the NFT Price"
        );
        //owner cut

        nftCollection.transferFrom(address(this), msg.sender, _offer.id);
        _offer.fulfilled = true;
        uint fee = msg.value * serviceFee / 10000;
        uint amount_left = msg.value - fee;
        userFunds[_offer.user] += amount_left;
        emit OfferFilled(_offerId, _offer.id, msg.sender);
    }

    function cancelOffer(uint256 _offerId) public {
        _Offer storage _offer = offers[_offerId];
        require(_offer.offerId == _offerId, "The offer must exist");
        require(
            _offer.user == msg.sender,
            "The offer can only be canceled by the owner"
        );
        require(
            _offer.fulfilled == false,
            "A fulfilled offer cannot be cancelled"
        );
        require(
            _offer.cancelled == false,
            "An offer cannot be cancelled twice"
        );
        nftCollection.transferFrom(address(this), msg.sender, _offer.id);
        _offer.cancelled = true;
        emit OfferCancelled(_offerId, _offer.id, msg.sender);
    }

    function claimFunds() public {
        require(
            userFunds[msg.sender] > 0,
            "This user has no funds to be claimed"
        );
        payable(msg.sender).transfer(userFunds[msg.sender]);
        emit ClaimFunds(msg.sender, userFunds[msg.sender]);
        userFunds[msg.sender] = 0;
    }

    // Fallback: reverts if Ether is sent to this smart-contract by mistake
    fallback() external {
        revert();
    }

    function claim(address _recipitient) public onlyOwner {
      payable(_recipitient).transfer(address(this).balance);
    }
}
