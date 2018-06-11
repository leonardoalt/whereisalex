import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import { getWeb3, getWeb3WS} from './utils/getWeb3';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import MenuItem from 'material-ui/Menu/MenuItem';

import CheckIns from './CheckIns';
import WhereIsAlexJson from '../../build/contracts/WhereIsAlex.json';

import constants from './utils/constants.json';

const styles = theme => ({
  flex: {
    flex: 'auto',
  },
  wrapper: {
    marginLeft: 200,
    marginRight: 200
  },
});

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      storageValue: 0,
      web3js: null,
      provider: 'unknown',
	  web3jsWS: null,
	  providerWS: 'unknown',
      errorMsg: null,
      whereIsAlexContract: null
    }
  }

  async componentDidMount() {
    try {
      const web3Results = await getWeb3();
      const web3ResultsWS = await getWeb3WS();
      const ABI = WhereIsAlexJson.abi;
      const contract = new web3Results.web3js.eth.Contract(ABI, constants.contracts[web3Results.networkId].WhereIsAlex);
      const contractWS = new web3ResultsWS.web3jsWS.eth.Contract(ABI, constants.contracts[web3ResultsWS.networkIdWS].WhereIsAlex);

      this.setState({
        whereIsAlexContract: contract,
		whereIsAlexContractWS: contractWS,
        errorMsg: null,
        ...web3Results,
		...web3ResultsWS
      });
    }
    catch (error) {
      console.log('ERROR', error)
    }
  }

  ErrorBar = () => {
    if (this.state.errorMsg == null) return null;
    return (
      <AppBar position='static' color='inherit'>
        <Typography variant='headline' color='error'>
          Error: {this.state.errorMsg}
        </Typography>
      </AppBar>
    )
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.wrapper}>
        <AppBar position='static' color='default'>
          <Toolbar>
            <Typography variant='subheading' color='inherit' className={classes.flex}>
			  Account provider: {this.state.provider}
            </Typography>
            <Typography variant='subheading' color='inherit' className={classes.flex}>
              Network: {this.state.networkName}
            </Typography>
            <Typography variant='subheading' color='inherit'>
			  Websocket provider: {this.state.providerWS}
            </Typography>
          </Toolbar>
        </AppBar>
        <this.ErrorBar />
        <CheckIns
          web3js={this.state.web3js}
          web3jsWS={this.state.web3jsWS}
          whereIsAlexContract={this.state.whereIsAlexContract}
          whereIsAlexContractWS={this.state.whereIsAlexContractWS}
		  provider={this.state.provider}
		  providerWS={this.state.providerWS}
          networkId={this.state.networkId} />
      </div>
    );
  }
}

export default withStyles(styles)(App)
