const assert = require('assert');
const Web3Utils = require('web3-utils');

const WhereIsAlex = artifacts.require('WhereIsAlex');

const utils = require('../misc/utils');
const getEvents = utils.getEvents;

let whereIsAlex;

let alex_acc;
let p1_acc;
let p2_acc;
let p3_acc;
let p4_acc;

contract('WhereIsAlex', function(accounts) {
	let creator = accounts[0];
	alex_acc = accounts[1];
	p1_acc = accounts[2];
	p2_acc = accounts[3];
	p3_acc = accounts[4];
	p4_acc = accounts[5];

	it('Should create WhereIsAlex contract', async () => {
		whereIsAlex = await WhereIsAlex.new(
			alex_acc, {from: creator}
		);
	});

	it('P1 should bet on an airport DUB for checkIn 0', async () => {
		await whereIsAlex.addBet(
			"DUB", {from: p1_acc, value: web3.toWei(1, 'ether')}
		);
	});

	it('P2 should bet on an airport TXL for checkIn 0', async () => {
		await whereIsAlex.addBet(
			"TXL", {from: p2_acc, value: web3.toWei(1, 'ether')}
		);
	});

	it('P3 should bet on an airport BCN for checkIn 0', async () => {
		await whereIsAlex.addBet(
			"BCN", {from: p3_acc, value: web3.toWei(5, 'ether')}
		);
	});

	it('P4 should bet on an airport DUB for checkIn 0', async () => {
		await whereIsAlex.addBet(
			"DUB", {from: p4_acc, value: web3.toWei(2, 'ether')}
		);
	});

	it('Alex should check in DUB for checkIn 0', async () => {
		await whereIsAlex.checkIn(
			"DUB", {from: alex_acc}
		);
	});

	it('P2 should bet on an airport TXL for checkIn 1', async () => {
		await whereIsAlex.addBet(
			"TXL", {from: p2_acc, value: web3.toWei(2, 'ether')}
		);
	});

	it('P4 should bet on an airport JFK for checkIn 1', async () => {
		await whereIsAlex.addBet(
			"JFK", {from: p4_acc, value: web3.toWei(2, 'ether')}
		);
	});

	it('Alex should check in TXL for checkIn 1', async () => {
		await whereIsAlex.checkIn(
			"TXL", {from: alex_acc}
		);
	});

	it('P1 should withdraw for checkIn 0', async () => {
		let oldBalance = await web3.eth.getBalance(p1_acc);
		let tx = await whereIsAlex.withdraw(
			0, {from: p1_acc}
		);
		let e = getEvents(tx, 'Withdraw');
		//console.log('P1 withdrew ' + e[0].value.toString());
		let newBalance = await web3.eth.getBalance(p1_acc);
		//console.log('OldBalance = ' + oldBalance);
		//console.log('NewBalance = ' + newBalance);
	});

	it('P2 should not withdraw for checkIn 0', async () => {
		try {
			let tx = await whereIsAlex.withdraw(
				0, {from: p2_acc}
			);
			assert.fail('Should have thrown before.');
		} catch(e) {
		}
	});

	it('P4 should withdraw for checkIn 0', async () => {
		let oldBalance = await web3.eth.getBalance(p4_acc);
		let tx = await whereIsAlex.withdraw(
			0, {from: p4_acc}
		);
		let e = getEvents(tx, 'Withdraw');
		//console.log('P4 withdrew ' + e[0].value.toString());
		let newBalance = await web3.eth.getBalance(p4_acc);
		//console.log('OldBalance = ' + oldBalance);
		//console.log('NewBalance = ' + newBalance);
	});

	it('P1 should not withdraw for checkIn 0', async () => {
		try {
			let tx = await whereIsAlex.withdraw(
				0, {from: p1_acc}
			);
			assert.fail('Should have thrown before.');
		} catch(e) {
		}
	});

	it('P1 should not withdraw for checkIn 1', async () => {
		try {
			let tx = await whereIsAlex.withdraw(
				1, {from: p1_acc}
			);
			assert.fail('Should have thrown before.');
		} catch(e) {
		}
	});

	it('P4 should not withdraw for checkIn 1', async () => {
		try {
			let tx = await whereIsAlex.withdraw(
				1, {from: p4_acc}
			);
			assert.fail('Should have thrown before.');
		} catch(e) {
		}
	});

	it('P2 should withdraw for checkIn 1', async () => {
		let oldBalance = await web3.eth.getBalance(p2_acc);
		let tx = await whereIsAlex.withdraw(
			1, {from: p2_acc}
		);
		let e = getEvents(tx, 'Withdraw');
		//console.log('P2 withdrew ' + e[0].value.toString());
		let newBalance = await web3.eth.getBalance(p2_acc);
		//console.log('OldBalance = ' + oldBalance);
		//console.log('NewBalance = ' + newBalance);
	});
});
