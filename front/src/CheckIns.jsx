/* eslint-disable flowtype/require-valid-file-annotation */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import constants from './utils/constants.json';
import { getAlexAddress, getCheckIn, getAirportSum, getCurrentCheckIn, getBet, getCheckIns, getAllBets, getNBets, getBlockTimestamp } from './utils/contractUtils';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  table: {
	width: '100%',
  },
  text: {
	textAlign: 'center',
	marginTop: "10%",
	marginBottom: "5%"
  },
  centerT5: {
	textAlign: 'center',
	marginTop: "10%"
  },
  centerB5: {
	textAlign: 'center',
	marginBottom: "5%"
  },
  center: {
	textAlign: 'center',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 100,
  },
  button: {
    margin: theme.spacing.unit,
  },
});

class CheckIns extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3js: null,
      web3jsWS: null,
   	  checkIns: [],
	  bets: [],
	  account: '',
	  alex: '',
	  currentCheckIn: 0,
	  showPastCheckIns: false,
	  airport: "",
	  bet: 0
    };

	this.NewCheckIn = this.NewCheckIn.bind(this);

  }

  togglePastCheckIns = () => {
	this.setState({ showPastCheckIns: true });
  }

  toggleCurrentBets = () => {
	this.setState({ showPastCheckIns: false });
  }

  async initialize(web3js, contract, contractWS, networkId) {
    if (contract == null)
      return;
	let _acc = await web3js.eth.getAccounts();
	console.log(_acc);
	let _checkIns = await getCheckIns(contract);
	_checkIns = _checkIns.slice(0, -1).reverse();
	console.log(_checkIns);
	let _bets = await getAllBets(contract);
	_bets = _bets.reverse();
	console.log(_bets);
	let _checkIn = await getCurrentCheckIn(contract);
	console.log(_checkIn);
	let _alex = await getAlexAddress(contract);
	console.log(_alex);
    this.setState({ checkIns: _checkIns, bets: _bets, account: _acc[0], currentCheckIn: _checkIn, alex: _alex });

	let _block2 = await this.props.web3jsWS.eth.getBlockNumber();
	let self = this;
	this.props.whereIsAlexContractWS.events.allEvents({
		fromBlock: _block2, toBlock: 'latest'
	}, function(error, event) {
		let data = event.returnValues;
		if (event.event === 'NewCheckIn') {
			self.NewCheckIn(event.returnValues);
		}
		else if (event.event === 'NewBet')
			self.NewBet(event.returnValues);
	});
	
	web3js.currentProvider.publicConfigStore.on('update',
		function(data) {
			self.updateInfo(data);
		}
	);
  }

  updateInfo(data) {
	  this.setState({ account: data.selectedAddress });
  }

  async NewCheckIn(data) {
	  let _checkIns = this.state.checkIns;
	  _checkIns.unshift(data);
	  console.log(data);
	  let _currentCheckIn = await getCurrentCheckIn(this.props.whereIsAlexContract);
	  this.setState({ checkIns: _checkIns, currentCheckIn: _currentCheckIn });
  }

  async NewBet(data) {
	  let _bets = this.state.bets;
	  _bets.unshift(data);
	  this.setState({ bets: _bets });
  }

  componentWillReceiveProps(newProps) {
    this.initialize(newProps.web3js, newProps.whereIsAlexContract, newProps.whereIsAlexContractWS, newProps.networkId);
  }

  handleAirportChange = (event) => {
	this.setState({ airport: event.target.value });
  }

  handleEtherChange = (event) => {
	this.setState({ bet: event.target.value });
  }

  sendBet = () => {
	  let _airport = this.state.airport;
	  let _bet = this.state.bet;
	  if (_bet === 0) return;
	  if (_airport.length !== 3) return;
	  let _value = web3js.utils.toWei(_bet, 'ether');
	  let _bytes3 = web3js.utils.asciiToHex(_airport);
	  let tx = this.props.whereIsAlexContract.methods.addBet(_bytes3)
		  .send({from: this.state.account, value: _value});
  }

  checkIn = () => {
	  if (this.state.account != this.state.alex) return;
	  let _airport = this.state.airport;
	  if (_airport.length != 3) return;
	  let _bytes3 = web3js.utils.asciiToHex(_airport);
	  let tx = this.props.whereIsAlexContract.methods.checkIn(_bytes3)
	      .send({from: this.state.account});
  }

  hexToAscii = (hexBytes) => {
	  return web3js.utils.hexToAscii(hexBytes);
  }

  weiToEth = (wei) => {
	  return web3js.utils.fromWei(wei, 'ether');
  }

  calculateWithdraw = async (id, airport, total) => {
	  let bet = await getBet(this.props.whereIsAlexContract, id, this.state.account);
	  if (bet.value === 0) return 0;
	  if (bet.airport != airport) return 0;
	  let aSum = await getAirportSum(this.props.whereIsAlexContract, id, airport);
	  let amount = (bet.value * total) / aSum;
	  return amount;
  }

  withdraw = async (id, airport, total) => {
	  let amount = await this.calculateWithdraw(id, airport, total);
	  let tx = await this.props.whereIsAlexContract.methods.withdraw(id).send({from: this.state.account});
  }

  render() {
    const { classes, whereIsAlexContract } = this.props;
    const { checkIns, bets, account, alex, showPastCheckIns } = this.state;

	if (account !== '' && account == alex)
	  return (
		<Grid container className={classes.root}>
		<Grid item xs={12}>
		<Typography className={classes.text} variant='display3'>
			Welcome, Alex!
		</Typography>
		</Grid>
		<Grid item xs={12} className={classes.text}>
		  <TextField className={classes.textField}
		    id="airport"
		    label="Airport code"
		    placeholder="Airport"
			onChange={this.handleAirportChange}
		    />
			<Button onClick={() => this.checkIn()} variant="raised" color="primary" className={classes.button}>
        		Check-in
      		</Button>
		</Grid>
		</Grid>
	  );

    return (
      <Grid container className={classes.root}>
		<Grid item xs={12}>
		<Typography className={classes.text} variant='display3'>
			Where is Alex today?
		</Typography>
		<Typography className={classes.centerB5} variant='display2'>
			Choose an airport and bet now!
		</Typography>
		</Grid>
		<Grid item xs={12} className={classes.text}>
		  <TextField className={classes.textField}
		    id="airport"
		    label="Airport code"
		    placeholder="Airport"
			onChange={this.handleAirportChange}
		    />
		   <TextField className={classes.textField}
		    id="ether"
		    label="Ether"
		    placeholder="Ether"
			onChange={this.handleEtherChange}
			type="number"
		    />
			<Button onClick={() => this.sendBet()} variant="raised" color="primary" className={classes.button}>
        		Bet
      		</Button>
		</Grid>
		<Grid item xs={12}>

		{ this.state.showPastCheckIns === false ? (
		<div className={classes.centerT5}>
		<Typography className={classes.center} variant='display1'>
			Current bets
		</Typography>
		<Button onClick={() => this.togglePastCheckIns()} variant="flat" color="primary" className={classes.button}>
        	Past Check-ins
      	</Button>
		</div>
		) : (
		<div className={classes.centerT5}>
		<Typography className={classes.center} variant='display1'>
			Past Check-ins
		</Typography>
		<Button onClick={() => this.toggleCurrentBets()} variant="flat" color="primary" className={classes.button}>
        	Current bets
      	</Button>
		</div>
		)
		}

		{ this.state.showPastCheckIns === false ? (
		<Table className={classes.table}>
		  <TableHead>
		    <TableRow>
		      <TableCell>From</TableCell>
		      <TableCell>Airport</TableCell>
		      <TableCell>Value</TableCell>
		      <TableCell>Timestamp</TableCell>
		    </TableRow>
		  </TableHead>
		  <TableBody>
		    {bets.filter(bet => bet.checkIn === this.state.currentCheckIn && bet.value > 0).map(bet => {
			  return (
			    <TableRow key={bet.sender}>
				  <TableCell>{bet.sender}</TableCell>
				  <TableCell>{this.hexToAscii(bet.airport)}</TableCell>
				  <TableCell>{this.weiToEth(bet.value)} Ether</TableCell>
				  <TableCell>{bet.timestamp}</TableCell>
				</TableRow>
			  );
			})}
		  </TableBody>
		</Table>
		) : (
		<Table className={classes.table}>
		  <TableHead>
		    <TableRow>
		      <TableCell>ID</TableCell>
		      <TableCell>Airport</TableCell>
		      <TableCell>Total bets</TableCell>
		      <TableCell>Timestamp</TableCell>
		      <TableCell></TableCell>
		    </TableRow>
		  </TableHead>
		  <TableBody>
		    {checkIns.map(checkIn => {
			  return (
			    <TableRow key={checkIn.id}>
				  <TableCell>{checkIn.id}</TableCell>
				  <TableCell>{this.hexToAscii(checkIn.airport)}</TableCell>
				  <TableCell>{this.weiToEth(checkIn.sumBets)} Ether</TableCell>
				  <TableCell>{checkIn.timestamp}</TableCell>
				  <TableCell>
				  	<Button onClick={() => this.withdraw(checkIn.id, checkIn.airport, checkIn.sumBets)} variant="flat" color="primary" className={classes.button}>
           			Withdraw
      		        </Button>
				  </TableCell>
				</TableRow>
			  );
			})}
		  </TableBody>
		</Table>
		)
		}
		</Grid>
      </Grid>
    );
  }
}

CheckIns.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CheckIns);
