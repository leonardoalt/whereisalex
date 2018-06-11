import Web3 from 'web3';

const connectToLocal = async () => {
  const pr = new Web3.providers.HttpProvider('http://10.10.42.18:8545');
  const web3js = new Web3(pr);
  const provider = 'Local';
  await web3js.eth.getBlockNumber();
  return {web3js, provider};
}

const connectToLocalWS = async () => {
  const prWS = new Web3.providers.WebsocketProvider('ws://10.10.42.18:8546');
  const web3jsWS = new Web3(prWS);
  const providerWS = 'Local';
  let _block = await web3jsWS.eth.getBlockNumber();
  return {web3jsWS, providerWS};
}

const connectToBrowser = async () => {
  const pr = new Web3.providers.HttpProvider('http://localhost:8545');
  let provider;
  if (typeof web3 === 'undefined') {
    throw new Error('Failed to connect to browser provider');
  }
  if (window.web3.currentProvider.isMetaMask)
    provider = 'Metamask';
  else
    provider = 'Native';

  const web3js = new Web3(window.web3.currentProvider);
  return {web3js, provider};
}

const connectToInfura = async () => {
  const pr = new Web3.providers.HttpProvider('https://kovan.infura.io/TRQQFeD1uLPdBRZslv77');
  const provider = 'Infura';
  const web3js = new Web3(pr);
  return {web3js, provider};
}

const connectToInfuraWS = async () => {
  try {
	  const prWS = new Web3.providers.WebsocketProvider('wss://kovan.infura.io/TRQQFeD1uLPdBRZslv77');
	  const providerWS = 'Infura';
	  const web3jsWS = new Web3(prWS);
  } catch(err) {
	  throw(err);
  }
  return {web3jsWS, providerWS};
}

const tryAllProviders = async () => {
  let results;
  // Try in order Local, browser, infura
  try {
    results = await connectToLocal();
  }
  catch(err) {
    console.log('[web3] Local node not found');
    try {
      results = await connectToBrowser();
    }
    catch(err) {
      console.log('[web3] Browser node not found');
      try {
        results = await connectToInfura();
	  } catch(err) {
		  console.log('[web3] Infura node not found');
	  }
    }
  }
  return results;
};

const tryAllProvidersWS = async () => {
  let resultsWS;
  // Try in order Local, infura
  try {
    resultsWS = await connectToLocalWS();
  }
  catch(err) {
    console.log('[web3] WS Local node not found');
	try {
      resultsWS = await connectToInfuraWS();
	} catch(err) {
	  console.log('[web3] WS Infura node not found');
	}
  }
  return resultsWS;
};

const getWeb3 = async (params = null) => {
  let results = null;
  if (params === null) {
    results = await tryAllProviders();
  }
  else if (params.provider === 'local') {
    try {
      console.log('[web3] Trying to connect to local');
      results = await connectToLocal();
    }
    catch(err) {
      console.error('[web3] Failed to connect to local');
      results = await tryAllProviders();
    }
  }
  else if (params.provider === 'metamask' || params.provider === 'native') {
    try {
      console.log('[web3] Trying to connect to native');
      results = await connectToBrowser();
    }
    catch(err) {
      console.error('[web3] Failed to connect to native');
      results = await tryAllProviders();
    }
  }
  else if (params.provider === 'infura') {
    try {
      console.log('[web3] Trying to connect to infura');
      results = await connectToInfura();
    }
    catch(err) {
      console.error('[web3] Failed to connect to infura');
      results = await tryAllProviders();
    }
  }

  const networkId = await results.web3js.eth.net.getId();
  let networkName = null;
  if (networkId === 1)
    networkName = 'Main Ethereum';
  else if (networkId === 3)
    networkName = 'Ropsten';
  else if (networkId === 4)
    networkName = 'Rinkeby';
  else if (networkId === 42)
    networkName = 'Kovan';
  else
    networkName = 'Private';

  window.web3js = results.web3js;
  return {...results, networkId, networkName};
};

const getWeb3WS = async (params = null) => {
  let resultsWS = null;
  if (params === null)
    resultsWS = await tryAllProvidersWS();
  
  else if (params.provider === 'local') {
    try {
      console.log('[web3] WS Trying to connect to local');
      resultsWS = await connectToLocalWS();
    }
    catch(err) {
      console.error('[web3] WS Failed to connect to local');
      resultsWS = await tryAllProvidersWS();
    }
  }
  else if (params.provider === 'infura') {
    try {
      console.log('[web3] WS Trying to connect to infura');
      resultsWS = await connectToInfuraWS();
    }
    catch(err) {
      console.error('[web3] WS Failed to connect to infura');
      resultsWS = await tryAllProvidersWS();
    }
  }

  if (resultsWS === undefined)
	return;

  const networkIdWS = await resultsWS.web3jsWS.eth.net.getId();
  let networkNameWS = null;
  if (networkIdWS === 1)
    networkNameWS = 'Main Ethereum';
  else if (networkIdWS === 3)
    networkNameWS = 'Ropsten';
  else if (networkIdWS === 4)
    networkNameWS = 'Rinkeby';
  else if (networkIdWS === 42)
    networkNameWS = 'Kovan';
  else
    networkNameWS = 'Private';

  window.web3jsWS = resultsWS.web3jsWS;
  return {...resultsWS, networkIdWS, networkNameWS};
};

export {getWeb3, getWeb3WS};
