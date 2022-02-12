import React, { Component } from "react";
import Staking from "./contracts/TranquilStaking.json";
import Web3 from "web3";
import axios from 'axios';
import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      const HMY_RPC_URL = "https://api.s0.t.hmny.io";
      const web3 = new Web3(HMY_RPC_URL);
      const res = await axios.get(`https://explorer-v2-api.hmny.io/v0/erc20/token/0xcf1709ad76a79d5a60210f23e81ce2460542a836/holders?limit=100&offset=0`);
      this.setState({accounts: res.data});
      for (var i = 0; i < this.state.accounts.length; i++) {
        const balance = await web3.utils.fromWei(this.state.accounts[i].balance, 'ether');
        await this.getTranquilStakes(web3, this.state.accounts[i].ownerAddress, balance);
      }
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  async getTranquilStakes(web3, account, balance) {
    const lockedStaking = await new web3.eth.Contract(Staking.abi, "0x55aE07Bb8Bae1501F9aEBF35801B5699eAE63bb7");
    let response = await lockedStaking.methods.supplyAmount(account).call();
    const lockedStakingAmount = await web3.utils.fromWei(response, 'ether');
    // console.log(lockedStakingAmount);

    const flexiStaking = await new web3.eth.Contract(Staking.abi, "0xa7fe71bc92d3a48ac59403b9be86f73e49bfcd46");
    response = await flexiStaking.methods.supplyAmount(account).call();
    const flexiAmount = await web3.utils.fromWei(response, 'ether');
    // console.log(flexiAmount);

    const xtranq = await new web3.eth.Contract([
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "campaignID",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "contract IERC20",
            "name": "stakingToken",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "contract IERC20",
            "name": "rewardToken",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "startBlock",
            "type": "uint256"
          }
        ],
        "name": "AddCampaignInfo",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "campaignID",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "phase",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "endBlock",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "rewardPerBlock",
            "type": "uint256"
          }
        ],
        "name": "AddRewardInfo",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "campaign",
            "type": "uint256"
          }
        ],
        "name": "Deposit",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "campaign",
            "type": "uint256"
          }
        ],
        "name": "EmergencyWithdraw",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "rewardHolder",
            "type": "address"
          }
        ],
        "name": "SetRewardHolder",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "rewardInfoLimit",
            "type": "uint256"
          }
        ],
        "name": "SetRewardInfoLimit",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "campaign",
            "type": "uint256"
          }
        ],
        "name": "Withdraw",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "contract IERC20",
            "name": "_stakingToken",
            "type": "address"
          },
          {
            "internalType": "contract IERC20",
            "name": "_rewardToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_startBlock",
            "type": "uint256"
          }
        ],
        "name": "addCampaignInfo",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_campaignID",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_endBlock",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_rewardPerBlock",
            "type": "uint256"
          }
        ],
        "name": "addRewardInfo",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "campaignInfo",
        "outputs": [
          {
            "internalType": "contract IERC20",
            "name": "stakingToken",
            "type": "address"
          },
          {
            "internalType": "contract IERC20",
            "name": "rewardToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "startBlock",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastRewardBlock",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "accRewardPerShare",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalStaked",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalRewards",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "claimPaused",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "campaignInfoLen",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "campaignRewardInfo",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "endBlock",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "rewardPerBlock",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_campaignID",
            "type": "uint256"
          }
        ],
        "name": "claimPaused",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_campaignID",
            "type": "uint256"
          }
        ],
        "name": "currentEndBlock",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_campaignID",
            "type": "uint256"
          }
        ],
        "name": "currentRewardPerBlock",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_campaignID",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }
        ],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_campaignID",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_beneficiary",
            "type": "address"
          }
        ],
        "name": "emergencyRewardWithdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_campaignID",
            "type": "uint256"
          }
        ],
        "name": "emergencyWithdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_from",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_to",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_endBlock",
            "type": "uint256"
          }
        ],
        "name": "getMultiplier",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256[]",
            "name": "_campaignIDs",
            "type": "uint256[]"
          }
        ],
        "name": "harvest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_rewardHolder",
            "type": "address"
          }
        ],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "massUpdateCampaigns",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_campaignID",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_user",
            "type": "address"
          }
        ],
        "name": "pendingReward",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "rewardHolder",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_campaignID",
            "type": "uint256"
          }
        ],
        "name": "rewardInfoLen",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "rewardInfoLimit",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_campaignID",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "_claimPaused",
            "type": "bool"
          }
        ],
        "name": "setClaimPaused",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_rewardHolder",
            "type": "address"
          }
        ],
        "name": "setRewardHolder",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_updatedRewardInfoLimit",
            "type": "uint256"
          }
        ],
        "name": "setRewardInfoLimit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_campaignID",
            "type": "uint256"
          }
        ],
        "name": "updateCampaign",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "userInfo",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "rewardDebt",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_campaignID",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ], "0x59a4d6b2a944e8acabbd5d2571e731388918669f");
    response = await xtranq.methods.userInfo(0, account).call();
    const xtranqAmount = await web3.utils.fromWei(response.amount.toString(), 'ether');
    // console.log(xtranqAmount);
    
    const sumAmount = (parseFloat(balance) + parseFloat(lockedStakingAmount) + parseFloat(flexiAmount) + parseFloat(xtranqAmount)).toString();
    // console.log(sumAmount);
    this.setState({web3, account, balance: balance, flex: flexiAmount, locked: lockedStakingAmount, xtranq: xtranqAmount, total: sumAmount});
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Tranquil hodlers.</h1>
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>Balance</th>
              <th>Locked</th>
              <th>Flexible</th>
              <th>xTranq</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{this.state.account}</td>
              <td>{this.state.balance}</td>
              <td>{this.state.locked}</td>
              <td>{this.state.flex}</td>
              <td>{this.state.xtranq}</td>
              <td>{this.state.total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
