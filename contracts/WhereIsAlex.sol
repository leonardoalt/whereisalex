pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;
pragma experimental "v0.5.0";

contract WhereIsAlex
{
	struct Bet {
		bytes3 airport;
		uint value;
		uint checkIn;
		uint timestamp;
	}

	struct CheckIn {
		bytes3 airport;
		uint timestamp;
		uint id;
		uint sumBets;
	}

	address public owner;
	address public alex;
	uint public currentCheckIn;
	CheckIn[] public checkIns;
	mapping (address => mapping (uint => Bet)) public bets;
	mapping (uint => mapping (bytes3 => uint)) public airportBets;

	event NewBet(address indexed user, bytes3 indexed airport, uint indexed checkInId, uint value);
	event NewCheckIn(bytes3 indexed airport, uint indexed checkInId, uint timestamp);
	event Withdraw(address indexed user, uint value);

	modifier onlyAlex {
		require(msg.sender == alex);
		_;
	}

	constructor (address _alex) public {
		owner = msg.sender;
		alex = _alex;
		pushEmptyCheckIn();
	}

	function addBet(bytes3 _airport) public payable {
		CheckIn storage checkIn = checkIns[currentCheckIn];
		Bet storage bet = bets[msg.sender][currentCheckIn];

		uint _value = bet.value;
		bet.airport = _airport;
		require(_value + msg.value >= _value);
		bet.value = _value + msg.value;
		bet.timestamp = block.timestamp;
		bet.checkIn = currentCheckIn;

		uint _airportBet = airportBets[currentCheckIn][_airport];
		require(_airportBet + msg.value >= _airportBet);
		airportBets[currentCheckIn][_airport] = _airportBet + msg.value;

		require(checkIn.sumBets + msg.value >= msg.value);
		checkIn.sumBets += msg.value;

		emit NewBet(msg.sender, _airport, currentCheckIn, bet.value);
	}

	function checkIn(bytes3 _airport) onlyAlex public {
		CheckIn storage check = checkIns[currentCheckIn];
		check.airport = _airport;
		check.timestamp = block.timestamp;
		check.id = currentCheckIn;

		emit NewCheckIn(_airport, currentCheckIn, block.timestamp);

		++currentCheckIn;
		pushEmptyCheckIn();
	}

	function withdraw(uint checkInId) public {
		CheckIn storage check = checkIns[checkInId];
		Bet storage bet = bets[msg.sender][checkInId];
		require(check.airport == bet.airport);
		
		uint amount = (bet.value * check.sumBets) / airportBets[checkInId][check.airport];
		require(amount >= bet.value);
		msg.sender.transfer(amount);
		delete bets[msg.sender][checkInId];

		emit Withdraw(msg.sender, amount);
	}

	function pushEmptyCheckIn() internal {
		checkIns.push(CheckIn({
			airport: 0,
			id: currentCheckIn,
			timestamp: 0,
			sumBets: 0
		}));
	}
}
