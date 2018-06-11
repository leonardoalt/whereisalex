const getCheckIns = async (contract, currentCheckIn) => {
  let checkIns = [];
  try {
	let i = 0;
	while (true) {
	  try {
	    let checkIn = 
	      await contract.methods.checkIns(i).call({});
		checkIns.push(checkIn);
		++i;
	  } catch (err) {
	    return checkIns;
	  }
	}
  } catch (err) {
      console.error('[getCheckIns]', err);
  }
};

const getAllBets = async (contract) => {
	let nBets = await getNBets(contract);
	let bets = [];
	let i = 0;
	while(i <= nBets) {
		let bet = await contract.methods.bets(i).call({});
		bets.push(bet);
		++i;
	}
	return bets;
};

const getBet = async (contract, id, addr) => {
	let betId = await contract.methods.userBets(id, addr).call({});
	let bet = await contract.methods.bets(betId).call({});
	return bet;
};

const getAirportSum = async (contract, id, airport) => {
	let aSum = await contract.methods.airportBets(id, airport).call({});
	return aSum;
}

const getNBets = async (contract) => {
	let nBets = await contract.methods.nBets().call({});
	return nBets;
};

const getCurrentCheckIn = async (contract) => {
	let cin = await contract.methods.currentCheckIn().call({});
	return cin;
};

const getCheckIn = async (contract, id) => {
	let cin = await contract.methods.checkIns(id).call({});
	return cin;
}

const getBlockTimestamp = async (web3js, blockNumber) => {
    const block = await web3js.eth.getBlock(blockNumber);
    // If can't get block, return the first one
    if (block === null)
      return 0;
    return block.timestamp;
};

export {getAirportSum, getCurrentCheckIn, getBet, getCheckIns, getAllBets, getNBets, getCheckIn, getBlockTimestamp};
