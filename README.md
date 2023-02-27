# VotingTest.js

VotingTest. js is the javascript uint test file  of Voting.sol Smart Contract.
***
To built it, we used truffle and after init the truffle configuration (truffle init) ,we installed differents dependencies in the current folder created:

- @openzeppelin/test-helpers (library)
- @openzeppelin/contracts
- @truffle/hdwallet-provider
- dotenv

You can easy use them like this whith the command "npm install --prefix @..."

We imported the test-helpers in the file.js to use BN, expectEvent and expectRevert methods and also chai to use expect method too.

We also used the eth-gas-provider to quantify the total gas spended by configurate it in the truffle-config.js file.

The Voting.sol Smart Contract imported the Ownable.sol contract by openzeppelin library to make deployer administartor of the Smart Contract (we also need to import it by the URL).

Finally we add a migration script and configure the process by the truffle-config.js file.

***
## The Smart Contract

The Voting.sol smart Contract is a Vote contract wich allow administrator to register somme voters by their ETH addresses before the beginning of the vote process.

Voters will be able to add as much proposals they want to finally choose one in the voting session. The administartor will release the differents states of the vote and will finally release the vote count to show everyone the winning proposal.
***
## Summary of unit testing

The vote process includes 6 differents status:

- 1 Voter registering
- 2 Proposal registration stared
- 3 Proposal registration ended
- 4 Voting started
- 5 Voting ended
- 6 Tally vote

The units test have the mission to ensure the security all along the vote process to make sure of the good proceedings of this vote with the best conditions for voters.

So we decided to divide the test process on this 6 statutes to cover the maximum of possible circumstances. In addition, in concerned status, we simulated the addProposals, the setVotes and the finalVoteCount.

***
## General status progress

In each status, the unit tests had to securise the administrator(owner) actions by make sure that nobody else (voter or not) could interact whith the administartor functions witch have role to initiate the vote process and follow it until the final vote count.
So in each status, differents check were performed:

#### 1-Status chechs

We checked the actual status by an event emission and make sure that only voters and owner could interact whith the good functions of the contract in the current of voting.The status have the role of orchestrate the different phases of the vote process and many units tests checked their proper functionning.

#### 2-Interaction checks:

Unit tests had to verify than a non voter couldn't interact whith the contract no matter the vote status.

Also we had to verify that voter couldn't do more than authorized by administrator by the Samrt Contract functions at their disposal on the current status.

Finally we ensure that owner couldn't do other than follow the status until the end like planned by the status.

#### 3-Technicals checks:

For voters, we ensure that they couldn't register twice, vote twice or add a wrong proposal. we checked all the voter status to be sure that the contract was ready to use safelly. The owner can also participate to vote so we checked his status too.

#### 4- AddProposals checks:

For this phase, we decided to simulate differents cases of addition of proposal to ensure that the smart Contract worked well on that phase.

#### 5- Voting phase checks:

Like the precedent phase, we decided to simulate differents cases of vote for different proposals to ensure that the smart Contract worked well on that phase.

#### 6- Voting count checks:

Finally, we decided to simulate 3 differents votes to ensure that vote count worked well like the Smart Contract.
***
## Conclusion

We tried here to imagine and test every possible case during these differents status of vote process.

Some unit tests could appears repetitive but we preferred privilege security before all.




