pragma solidity ^0.4.24;

contract WhereIsAlex
{
	struct Bet {
		uint checkIn;
		address sender;
		bytes3 airport;
		uint value;
		uint timestamp;
	}

	struct CheckIn {
		uint id;
		bytes3 airport;
		uint timestamp;
		uint sumBets;
	}

	address public owner;
	address public alex;
	uint public currentCheckIn;
	uint public nBets;
	CheckIn[] public checkIns;
	Bet[] public bets;
	mapping (uint => mapping (address => uint)) public userBets;
	mapping (uint => mapping (bytes3 => uint)) public airportBets;

	event NewBet(uint indexed checkIn, address indexed sender, bytes3 indexed airport, uint value, uint timestamp);
	event NewCheckIn(uint indexed id, bytes3 indexed airport, uint timestamp, uint sumBets);
	event Withdraw(address indexed user, uint value);

	modifier onlyAlex {
		require(msg.sender == alex);
		_;
	}

	constructor (address _alex) public {
		owner = msg.sender;
		alex = _alex;
		pushEmptyCheckIn();
		// Hack to make it easier to check if an address has bet
		bets.push(Bet({
			airport: 0x0,
			sender: 0x0,
			value: 0,
			checkIn: 0,
			timestamp: 0
		}));
	}

	function addBet(bytes3 _airport) public payable {
		CheckIn storage checkIn = checkIns[currentCheckIn];
		uint betId = userBets[currentCheckIn][msg.sender];
		require(betId == 0);
		require(msg.value > 0);
		// New bet from that user on that checkIn
		bets.push(Bet({
			value: msg.value,
			airport: _airport,
			sender: msg.sender,
			timestamp: block.timestamp,
			checkIn: currentCheckIn
		}));
		userBets[currentCheckIn][msg.sender] = ++nBets;

		uint _airportBet = airportBets[currentCheckIn][_airport];
		require(_airportBet + msg.value >= _airportBet);
		airportBets[currentCheckIn][_airport] = _airportBet + msg.value;

		require(checkIn.sumBets + msg.value >= msg.value);
		checkIn.sumBets += msg.value;

		emit NewBet(currentCheckIn, msg.sender, _airport, msg.value, block.timestamp);
	}

	function checkIn(bytes3 _airport) onlyAlex public {
		CheckIn storage check = checkIns[currentCheckIn];
		check.airport = _airport;
		check.timestamp = block.timestamp;
		check.id = currentCheckIn;

		emit NewCheckIn(currentCheckIn, _airport, block.timestamp, check.sumBets);

		++currentCheckIn;
		pushEmptyCheckIn();
	}

	function withdraw(uint checkInId) public {
		CheckIn storage check = checkIns[checkInId];
		uint betId = userBets[checkInId][msg.sender];
		require(bets.length > betId);
		Bet storage bet = bets[betId];
		require(bet.sender == msg.sender);
		require(check.airport == bet.airport);
		
		uint amount = (bet.value * check.sumBets) / airportBets[checkInId][check.airport];
		require(amount >= bet.value);
		msg.sender.transfer(amount);
		delete bets[betId];

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
