const Voting = artifacts.require("./Voting");
const {BN, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');
const {expect} = require('chai');

contract('Voting', accounts => {

    const owner = accounts[0];
    const AllowedVoter1 = accounts[1];
    const AllowedVoter2 = accounts[2];
    const UnAuthorizedUser1 = accounts[3];
    const UnAuthorizedUser2 = accounts[4];
    const AllowedVoter4 = accounts[5];
    const AllowedVoter5 = accounts[6];
    const AllowedVoter6 = accounts[7];
    const AllowedVoter7 = accounts[8];
    const AllowedVoter8 = accounts[9];
    let MyVotingInstance;

    describe("State 0 // RegisteringVoters", function() {

        beforeEach( async function() {

            MyVotingInstance = await Voting.new({from: owner});
            await MyVotingInstance.addVoter(owner, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter1, {from:owner});

        });

            describe("Expect Checks", function() {

                it("Workflowstatus index test", async function() {
                    const _status = await MyVotingInstance.workflowStatus.call();
                    expect(_status).to.be.bignumber.equal(new BN(0));
                });

                it("addVoter function test if user is the owner", async function() {
                    await MyVotingInstance.addVoter(AllowedVoter2, {from:owner});
                    const data = await MyVotingInstance.getVoter(AllowedVoter2, {from:owner});
                    expect(data.isRegistered).to.be.equal(true);
                });

                it("Should return true if user is registered / from:owner", async function() {
                    const data = await MyVotingInstance.getVoter(AllowedVoter1, {from:owner});
                    expect(data.isRegistered).to.be.equal(true);
                });

                it("Should return true if user is registered / from:voter", async function() {
                    const data = await MyVotingInstance.getVoter(AllowedVoter1, {from:AllowedVoter1});
                    expect(data.isRegistered).to.be.equal(true);
                });

                it("Should return false if user is not yet registered / from:owner", async function() {
                    const data = await MyVotingInstance.getVoter(AllowedVoter2, {from:owner});
                    expect(data.isRegistered).to.be.equal(false);
                }); 

                it("Should return false if user is not yet registered / from:voter", async function() {
                    const data = await MyVotingInstance.getVoter(AllowedVoter2, {from:AllowedVoter1});
                    expect(data.isRegistered).to.be.equal(false);
                });
            });

            describe("ExpectEvents", function() {


                it("WorkflowStatusChanges test", async function() {
                    const status = await MyVotingInstance.startProposalsRegistering({from:owner});
                    expectEvent(status,"WorkflowStatusChange",((status.RegisteringVoters,status.ProposalsRegistrationStarted)));
                });

                it("ProposalRegistered event for owner", async function() {
                    await MyVotingInstance.startProposalsRegistering({from:owner});
                    const storedData = await MyVotingInstance.addProposal("Proposal0", {from:owner});
                    expectEvent(storedData,"ProposalRegistered",(new BN(1)-1));
                });

                it("ProposalRegistered event for voters", async function() {
                    await MyVotingInstance.startProposalsRegistering({from:owner});
                    const storedData = await MyVotingInstance.addProposal("Proposal1", {from:AllowedVoter1});
                    expectEvent(storedData,"ProposalRegistered",(new BN(1)-1));
                });

                it("Event VoterRegistered test 1", async function() {
                    const findEvent = await MyVotingInstance.addVoter(AllowedVoter2,{from:owner});
                    expectEvent(findEvent,"VoterRegistered",{voterAddress:AllowedVoter2});
                });

                it("Event VoterRegistered test 2", async function() {
                    const findEvent = await MyVotingInstance.addVoter(AllowedVoter7,{from:owner});
                    expectEvent(findEvent,"VoterRegistered",{voterAddress:AllowedVoter7});
                });
            });

            describe("Owner and Voters revert functions because of wrong State", function() {

                it("addProposal function should revert if WorkflowStatus is different than ProposalRegistrationStarted", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:owner}),"Proposals are not allowed yet");
                });

                it("setVote function should revert if WorkflowStatus is different than VotingSessionStarted", async function() {
                    await expectRevert(MyVotingInstance.setVote(1,{from:owner}),"Voting session havent started yet");
                });

                it("addProposal function should revert if WorkflowStatus is different than ProposalRegistrationStarted", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:AllowedVoter1}),"Proposals are not allowed yet");
                });

                it("setVote function should revert if WorkflowStatus is different than VotingSessionStarted", async function() {
                    await expectRevert(MyVotingInstance.setVote(1,{from:AllowedVoter1}),"Voting session havent started yet");
                });
            });

            describe("OnlyOwner revert functions because of wrong State and voters's revert tests", function() {

                it("endProposalsRegistering function should revert because of wrong Workflowstatus", async function() {
                    await expectRevert(MyVotingInstance.endProposalsRegistering({from:owner}),"Registering proposals havent started yet");
                });

                it("endProposalsRegistering function should revert because of wrong Workflowstatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endProposalsRegistering({from:AllowedVoter1}));
                });

                it("startVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.startVotingSession({from:owner}),"Registering proposals phase is not finished");
                });

                it("startVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startVotingSession({from:AllowedVoter1}));
                });

                it("endVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.endVotingSession({from:owner}),"Voting session havent started yet");
                });

                it("endVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endVotingSession({from:AllowedVoter1}));
                });

                it("tallyVote function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.tallyVotes({from:owner}),"Current status is not voting session ended");
                });

                it("tallyVote function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.tallyVotes({from:AllowedVoter1}));
                });
            });

            describe("addVoter and getVoter revert functions for Voters", function() {

                it("addVoter function should revert if user is a Voter but not the owner", async function() {
                    await expectRevert.unspecified(MyVotingInstance.addVoter(AllowedVoter2, {from:AllowedVoter1}));
                });

                it("getVoter function should revert if user is authorized but not registered", async function() {
                    await expectRevert.unspecified(MyVotingInstance.getVoter(AllowedVoter1, {from:AllowedVoter2}));
                });

                it("addvoter function should revert if Voter is already registered", async function() {
                    await MyVotingInstance.addVoter(AllowedVoter2, {from:owner});
                    await expectRevert(MyVotingInstance.addVoter(AllowedVoter2, {from:owner}),"Already registered");
                });
            });

            describe("Revert of all Smart Contract's functions for Non Authorized users in State 0 (2 differents unauthorized users)", function() {
            
                it("getVoter function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.getVoter(AllowedVoter1, {from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("getOneProposal function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.getOneProposal(0, {from:UnAuthorizedUser2}),"You're not a voter");
                });

                it("addVoter function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.addVoter(UnAuthorizedUser2, {from:UnAuthorizedUser1}));
                });

                it("addProposal function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("setVote function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.setVote(1,{from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("endProposalsRegistering function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startProposalsRegistering({from:UnAuthorizedUser2}));
                });

                it("endProposalsRegistering function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endProposalsRegistering({from:UnAuthorizedUser1}));
                });

                it("startVotingSession function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startVotingSession({from:UnAuthorizedUser2}));
                });

                it("endVotingSession function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endVotingSession({from:UnAuthorizedUser1}));
                });

                it("tallyVote function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.tallyVotes({from:UnAuthorizedUser2}));
                }); 
            }); 
    });

    describe("State 1 // ProposalsRegistrationStarted ", function(){

        beforeEach( async function(){

            MyVotingInstance = await Voting.new({from: owner});
            await MyVotingInstance.addVoter(owner, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter1, {from:owner});
            await MyVotingInstance.startProposalsRegistering({from:owner});

        });

            describe("Expect Checks", function() {

                it("Workflowstatus index test", async function() {
                    const _status = await MyVotingInstance.workflowStatus.call();
                    expect(_status).to.be.bignumber.equal(new BN(1));
                });

                it("addProposal and getOneProposal function test if user is the owner", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:owner});
                    const data = await MyVotingInstance.getOneProposal(0,{from:owner});
                    expect(data.voteCount).to.be.bignumber.equal(new BN(0));
                });

                it("getOneProposal function test if user is the owner", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:owner});
                    const data = await MyVotingInstance.getOneProposal(0);
                    expect(data.description).to.be.equal("GENESIS");  
                });

                it("addProposal and getOneProposal function test if user is registered", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:AllowedVoter1});
                    const data = await MyVotingInstance.getOneProposal(0,{from:AllowedVoter1});
                    expect(data.voteCount).to.be.bignumber.equal(new BN(0));
                });

                it("getOneProposal function test if user is registered", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:AllowedVoter1});
                    const data = await MyVotingInstance.getOneProposal(0);
                    expect(data.description).to.be.equal("GENESIS");  
                });

                it("addProposal(AllowedVoter) and getOneProposal(owner) function test if user is registered", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:AllowedVoter1});
                    const data = await MyVotingInstance.getOneProposal(0,{from:owner});
                    expect(data.voteCount).to.be.bignumber.equal(new BN(0));
                });

                it("addProposal(owner) and getOneProposal(AllowedVoter) function test", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:owner});
                    const data = await MyVotingInstance.getOneProposal(0,{from:AllowedVoter1});
                    expect(data.voteCount).to.be.bignumber.equal(new BN(0));
                });
            });
            
            describe("ExpectEvents", function() {

                it("WorkflowStatusChanges test", async function() {
                    const _status = await MyVotingInstance.endProposalsRegistering({from:owner});
                    expectEvent(_status,"WorkflowStatusChange",((_status.ProposalsRegistrationStarted,_status.ProposalsRegistrationEnded)));
                })

                it("ProposalRegistered events and proposalId increment test for Owner and Voters", async function() {
                    const findEvent = await MyVotingInstance.addProposal("Proposal1", {from:owner});
                    expectEvent(findEvent,"ProposalRegistered",{proposalId:new BN(1)});
                    const findEvent2 = await MyVotingInstance.addProposal("Proposal2", {from:AllowedVoter1});
                    expectEvent(findEvent2,"ProposalRegistered",{proposalId:new BN(2)});
                    const findEvent3 = await MyVotingInstance.addProposal("Proposal3", {from:AllowedVoter1});
                    expectEvent(findEvent3,"ProposalRegistered",{proposalId:new BN(3)});
                    const findEvent4 = await MyVotingInstance.addProposal("Proposal4", {from:owner});
                    expectEvent(findEvent4,"ProposalRegistered",{proposalId:new BN(4)});
                });
            });

            describe("AddProposal function revert if proposition is empty (for Owner and Voters)", function() {
     
                it("addProposal function should revert if proposition is empty (from:Owner)", async function() {
                    await expectRevert(MyVotingInstance.addProposal("", {from:owner}),"Vous ne pouvez pas ne rien proposer");
                });

                it("addProposal function should revert if proposition is empty (from:Voter)", async function() {
                    await expectRevert(MyVotingInstance.addProposal("", {from:AllowedVoter1}),"Vous ne pouvez pas ne rien proposer");
                });
            });

            describe("Owner and Voters revert functions because of wrong State", function() {
        
                it("addVoter function should revert if Workflowstatus is different than RegisteringVoters", async function() {
                    await expectRevert(MyVotingInstance.addVoter(AllowedVoter1,{from:owner}),"Voters registration is not open yet");
                });

                it("addVoter function should revert if Workflowstatus is different than RegisteringVoters", async function() {
                    await expectRevert.unspecified(MyVotingInstance.addVoter(AllowedVoter2,{from:AllowedVoter1}));
                });

                it("setVote function should revert if WorkflowStatus is different than VotingSessionStarted", async function() {
                    await expectRevert(MyVotingInstance.setVote(1,{from:owner}),"Voting session havent started yet");
                });

                it("setVote function should revert if WorkflowStatus is different than VotingSessionStarted", async function() {
                    await expectRevert(MyVotingInstance.setVote(2,{from:AllowedVoter1}),"Voting session havent started yet");
                });

                it("tallyVote function should revert if workflowStatus is different than  VotingSessionEnded", async function() {
                    await expectRevert(MyVotingInstance.tallyVotes({from:owner}),"Current status is not voting session ended");
                });

                it("tallyVote function should revert if workflowStatus is different than  VotingSessionEnded", async function() {
                    await expectRevert.unspecified(MyVotingInstance.tallyVotes({from:AllowedVoter1}));
                });
            });

            describe("OnlyOwner revert functions because of wrong State and voters's revert tests", function() {

                it("startProposalsRegistering function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.startProposalsRegistering({from:owner}),"Registering proposals cant be started now");
                });

                it("startProposalsRegistering function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startProposalsRegistering({from:AllowedVoter1}));
                });

                it("startVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.startVotingSession({from:owner}),"Registering proposals phase is not finished");
                });

                it("startVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startVotingSession({from:AllowedVoter1}));
                });

                it("endVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.endVotingSession({from:owner}),"Voting session havent started yet");
                });

                it("endVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endVotingSession({from:AllowedVoter1}));
                });
        
            });

            describe("Revert of all Smart Contract's functions for Non Authorized users in State 1 (2 differents unauthorized users)", function() {
            
                it("getVoter function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.getVoter(AllowedVoter1, {from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("getOneProposal function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.getOneProposal(0, {from:UnAuthorizedUser2}),"You're not a voter");
                });

                it("addVoter function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.addVoter(UnAuthorizedUser2, {from:UnAuthorizedUser1}));
                });

                it("addProposal function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("setVote function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.setVote(1,{from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("endProposalsRegistering function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startProposalsRegistering({from:UnAuthorizedUser2}));
                });

                it("endProposalsRegistering function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endProposalsRegistering({from:UnAuthorizedUser1}));
                });

                it("startVotingSession function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startVotingSession({from:UnAuthorizedUser2}));
                });

                it("endVotingSession function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endVotingSession({from:UnAuthorizedUser1}));
                });

                it("tallyVote function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.tallyVotes({from:UnAuthorizedUser2}));
                }); 
            });
    });

    describe("State 1-2 // addProposal function and proposalsArray[] tests", function() {

        beforeEach( async function(){

            MyVotingInstance = await Voting.new({from: owner});
            await MyVotingInstance.addVoter(owner, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter1, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter2, {from:owner});
            await MyVotingInstance.startProposalsRegistering({from:owner});

        });   
        
            describe("GENESIS Proposal tests", function() {

                it("getOneProposal.description GENESIS test from Owner", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:owner});
                    await MyVotingInstance.addProposal("Proposal2", {from:owner});
                    await MyVotingInstance.addProposal("Proposal3", {from:owner});
                    await MyVotingInstance.addProposal("GoodProposal", {from:owner});
                    await MyVotingInstance.addProposal("Proposal5", {from:owner});
                    await MyVotingInstance.addProposal("Proposal6", {from:owner});
                    await MyVotingInstance.addProposal("Proposal7", {from:owner});
                    const data = await MyVotingInstance.getOneProposal(0);
                    expect(data.description).to.be.equal("GENESIS"); 
                });

                it("getOneProposal.description GENESIS test from Voter", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:owner});
                    await MyVotingInstance.addProposal("Proposal2", {from:owner});
                    await MyVotingInstance.addProposal("Proposal3", {from:owner});
                    await MyVotingInstance.addProposal("GoodProposal", {from:owner});
                    await MyVotingInstance.addProposal("Proposal5", {from:owner});
                    await MyVotingInstance.addProposal("Proposal6", {from:owner});
                    await MyVotingInstance.addProposal("Proposal7", {from:owner});
                    const data = await MyVotingInstance.getOneProposal(0);
                    expect(data.description).to.be.equal("GENESIS"); 
                });
            });

            describe("Random Proposal description tests according to user(x4)", function() {

                it("Random getOneProposal.description test 1 owner/owner", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("Proposal2", {from:AllowedVoter1});
                    await MyVotingInstance.addProposal("Proposal3", {from:owner});
                    await MyVotingInstance.addProposal("GoodProposal", {from:owner});
                    await MyVotingInstance.addProposal("Proposal5", {from:owner});
                    await MyVotingInstance.addProposal("Proposal6", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("Proposal7", {from:owner});
                    const data = await MyVotingInstance.getOneProposal(4);
                    expect(data.description).to.be.equal("GoodProposal");
                    const data2 = await MyVotingInstance.getVoter(owner, {from:owner});
                    expect(data2.isRegistered).to.be.equal(true);
                    const data3 = await MyVotingInstance.getVoter(owner, {from:owner});
                    expect(data3.hasVoted).to.be.equal(false);   
                });

                it("Random getOneProposal.description test 2 EnableVoter2/owner", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("Proposal2", {from:AllowedVoter1});
                    await MyVotingInstance.addProposal("Proposal3", {from:owner});
                    await MyVotingInstance.addProposal("GoodProposal", {from:owner});
                    await MyVotingInstance.addProposal("Proposal5", {from:owner});
                    await MyVotingInstance.addProposal("Proposal6", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("OtherProposal", {from:owner});
                    const data = await MyVotingInstance.getOneProposal(7);
                    expect(data.description).to.be.equal("OtherProposal");
                    const data2 = await MyVotingInstance.getVoter(AllowedVoter2, {from:owner});
                    expect(data2.isRegistered).to.be.equal(true);
                    const data3 = await MyVotingInstance.getVoter(AllowedVoter2, {from:owner});
                    expect(data3.hasVoted).to.be.equal(false); 
                });
                
                it("Random getOneProposal.description test 3 EnableVoter2/EnableVoter2", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("Proposal2", {from:AllowedVoter1});
                    await MyVotingInstance.addProposal("Proposal3", {from:owner});
                    await MyVotingInstance.addProposal("GoodProposal", {from:owner});
                    await MyVotingInstance.addProposal("Proposal5", {from:owner});
                    await MyVotingInstance.addProposal("Proposal6", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("OtherProposal", {from:owner});
                    const data = await MyVotingInstance.getOneProposal(3);
                    expect(data.description).to.be.equal("Proposal3");
                    const data2 = await MyVotingInstance.getVoter(AllowedVoter2, {from:AllowedVoter2});
                    expect(data2.isRegistered).to.be.equal(true);
                    const data3 = await MyVotingInstance.getVoter(AllowedVoter2, {from:AllowedVoter2});
                    expect(data3.hasVoted).to.be.equal(false);   
                });
        
                it("Random getOneProposal.description test 4 Enablevoter1/EnableVoter2", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("Proposal2", {from:AllowedVoter1});
                    await MyVotingInstance.addProposal("Proposal3", {from:owner});
                    await MyVotingInstance.addProposal("GoodProposal", {from:owner});
                    await MyVotingInstance.addProposal("Proposal5", {from:owner});
                    await MyVotingInstance.addProposal("Proposal6", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("OtherProposal", {from:owner});
                    const data = await MyVotingInstance.getOneProposal(1);
                    expect(data.description).to.be.equal("Proposal1");
                    const data2 = await MyVotingInstance.getVoter(AllowedVoter1, {from:AllowedVoter2});
                    expect(data2.isRegistered).to.be.equal(true);
                    const data3 = await MyVotingInstance.getVoter(AllowedVoter1, {from:AllowedVoter2});
                    expect(data3.hasVoted).to.be.equal(false);   
                });
            });

            describe("Random Proposal voteCount tests according to user(x3)", function() {
            
                it("Random getOneProposal.voteCount test 1 owner", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:AllowedVoter1});
                    await MyVotingInstance.addProposal("Proposal2", {from:owner});
                    await MyVotingInstance.addProposal("Proposal3", {from:owner});
                    await MyVotingInstance.addProposal("GoodProposal", {from:owner});
                    await MyVotingInstance.addProposal("Proposal5", {from:owner});
                    await MyVotingInstance.addProposal("Proposal6", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("Proposal7", {from:owner});
                    const data = await MyVotingInstance.getOneProposal(7);
                    expect(data.voteCount).to.be.bignumber.equal(new BN(0));
                });
        
                it("Random getOneProposal.voteCount test 2 EnableVoter2", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:AllowedVoter1});
                    await MyVotingInstance.addProposal("Proposal2", {from:owner});
                    await MyVotingInstance.addProposal("Proposal3", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("GoodProposal", {from:owner});
                    await MyVotingInstance.addProposal("Proposal5", {from:owner});
                    await MyVotingInstance.addProposal("Proposal6", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("Proposal7", {from:owner});
                    const data = await MyVotingInstance.getOneProposal(3);
                    expect(data.voteCount).to.be.bignumber.equal(new BN(0)); 
                });
        
                it("Random getOneProposal.voteCount test 3 Enablevoter1", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:AllowedVoter1});
                    await MyVotingInstance.addProposal("Proposal2", {from:owner});
                    await MyVotingInstance.addProposal("Proposal3", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("GoodProposal", {from:owner});
                    await MyVotingInstance.addProposal("Proposal5", {from:owner});
                    await MyVotingInstance.addProposal("Proposal6", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("Proposal7", {from:owner});
                    const data = await MyVotingInstance.getOneProposal(1);
                    expect(data.voteCount).to.be.bignumber.equal(new BN(0)); 
                    expect(data[1]).to.be.bignumber.equal(new BN(0)); 
                });
            });

            describe("proposalsArray[] increment tests according to users(x3)", function() {

                it("proposalsArray increment test 1 from owner", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:owner});
                    await MyVotingInstance.addProposal("Proposal2",{from:owner});
                    await MyVotingInstance.addProposal("Proposal3", {from:owner});
                    let array0 = await MyVotingInstance.getOneProposal(0);
                    expect(array0.description).to.be.equal("GENESIS");
                    let array1 = await MyVotingInstance.getOneProposal(1);
                    expect(array1.description).to.be.equal("Proposal1");
                    let array2 = await MyVotingInstance.getOneProposal(2);
                    expect(array2.description).to.be.equal("Proposal2");
                    let array3 = await MyVotingInstance.getOneProposal(3);
                    expect(array3.description).to.be.equal("Proposal3");
                });
        
                it("proposalsArray increment test 2 from owner end voters", async function() {
                    await MyVotingInstance.addProposal("Proposal1", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("Proposal2", {from:AllowedVoter1});
                    await MyVotingInstance.addProposal("OtherProposal", {from:owner});
                    await MyVotingInstance.addProposal("Proposal4", {from:owner});
                    await MyVotingInstance.addProposal("Proposal5", {from:owner});
                    await MyVotingInstance.addProposal("Proposal6", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("GoodProposal", {from:owner});
                    let array = await MyVotingInstance.getOneProposal(7);
                    expect(array.description).to.be.equal("GoodProposal");
                    let array2 = await MyVotingInstance.getOneProposal(3);
                    expect(array2.description).to.be.equal("OtherProposal");  
                });

                it("proposalsArray increment test 2 from voters only", async function() {
                    await MyVotingInstance.addProposal("Prop1", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("Proposal2", {from:AllowedVoter1});
                    await MyVotingInstance.addProposal("OtherProposal", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("Proposal4", {from:AllowedVoter1});
                    await MyVotingInstance.addProposal("Prop5", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("Proposal6", {from:AllowedVoter2});
                    await MyVotingInstance.addProposal("GoodProposal", {from:AllowedVoter1});
                    let array = await MyVotingInstance.getOneProposal(1);
                    expect(array.description).to.be.equal("Prop1");
                    let array2 = await MyVotingInstance.getOneProposal(5);
                    expect(array2.description).to.be.equal("Prop5");  
                });
            });
    });
    
    describe("State 2 // ProposalRegistrationEnded", function(){

        beforeEach( async function(){

            MyVotingInstance = await Voting.new({from: owner});
            await MyVotingInstance.addVoter(owner, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter1, {from:owner});
            await MyVotingInstance.startProposalsRegistering({from:owner});
            await MyVotingInstance.endProposalsRegistering({from:owner});

        });

            describe("Expect Checks", function() {

                it("Workflowstatus index test", async function() {
                    const _status = await MyVotingInstance.workflowStatus.call();
                    expect(_status).to.be.bignumber.equal(new BN(2));
                });
            });

            describe("ExpectEvents", function() {

                it("WorkflowStatusChanges test", async function() {
                    const _status = await MyVotingInstance.startVotingSession({from:owner});
                    expectEvent(_status,"WorkflowStatusChange",((_status.ProposalsRegistrationEnded,_status.VotingsessionStarted)));
            });
            
            describe("Owner and Voters revert functions because of wrong State", function() {

                it("addVoter function should revert if Workflowstatus is different than RegisteringVoters", async function() {
                    await expectRevert(MyVotingInstance.addVoter(AllowedVoter1,{from:owner}),"Voters registration is not open yet");
                });

                it("addVoter function should revert if Workflowstatus is different than RegisteringVoters", async function() {
                    expectRevert.unspecified(MyVotingInstance.addVoter(AllowedVoter2,{from:AllowedVoter1}));
                });

                it("addProposal function should revert if WorkflowStatus is different than ProposalRegistrationStarted", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:owner}),"Proposals are not allowed yet");
                });

                it("addProposal function should revert if WorkflowStatus is different than ProposalRegistrationStarted", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:AllowedVoter1}),"Proposals are not allowed yet");
                });

                it("setVote function should revert if WorkflowStatus is different than VotingSessionStarted", async function() {
                    await expectRevert(MyVotingInstance.setVote(1,{from:owner}),"Voting session havent started yet");
                });

                it("setVote function should revert if WorkflowStatus is different than VotingSessionStarted", async function() {
                    await expectRevert(MyVotingInstance.setVote(1,{from:AllowedVoter1}),"Voting session havent started yet");
                });

                it("tallyVote function should revert if workflowStatus is different than  VotingSessionEnded", async function() {
                    await expectRevert(MyVotingInstance.tallyVotes({from:owner}),"Current status is not voting session ended");
                });

                it("tallyVote function should revert if workflowStatus is different than  VotingSessionEnded", async function() {
                    await expectRevert.unspecified(MyVotingInstance.tallyVotes({from:AllowedVoter1}));
                });
            });

            describe("OnlyOwner revert functions because of wrong State and voters's revert tests ", function() {

                it("startProposalsRegistering function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.startProposalsRegistering({from:owner}),"Registering proposals cant be started now");
                });

                it("startProposalsRegistering function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startProposalsRegistering({from:AllowedVoter1}));
                });

                it("endProposalsRegistering function should revert because of wrong Workflowstatus", async function() {
                    await expectRevert(MyVotingInstance.endProposalsRegistering({from:owner}),"Registering proposals havent started yet");
                });

                it("endProposalsRegistering function should revert because of wrong Workflowstatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endProposalsRegistering({from:AllowedVoter1}));
                });

                it("endVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.endVotingSession({from:owner}),"Voting session havent started yet");
                });

                it("endVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endVotingSession({from:AllowedVoter1}));
                });
            });

            describe("Revert of all Smart Contract's functions for Non Authorized users in State 2 (2 differents unauthorized users)", function() {
            
                it("getVoter function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.getVoter(AllowedVoter1, {from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("getOneProposal function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.getOneProposal(0, {from:UnAuthorizedUser2}),"You're not a voter");
                });

                it("addVoter function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.addVoter(UnAuthorizedUser2, {from:UnAuthorizedUser1}));
                });

                it("addProposal function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("setVote function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.setVote(1,{from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("endProposalsRegistering function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startProposalsRegistering({from:UnAuthorizedUser2}));
                });

                it("endProposalsRegistering function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endProposalsRegistering({from:UnAuthorizedUser1}));
                });

                it("startVotingSession function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startVotingSession({from:UnAuthorizedUser2}));
                });

                it("endVotingSession function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endVotingSession({from:UnAuthorizedUser1}));
                });

                it("tallyVote function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.tallyVotes({from:UnAuthorizedUser2}));
                });
            }); 
    });

    describe("State 3 // VotingSessionStarted", function(){

        beforeEach( async function(){

            MyVotingInstance = await Voting.new({from: owner});
            await MyVotingInstance.addVoter(owner, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter1, {from:owner});
            await MyVotingInstance.startProposalsRegistering({from:owner});
            await MyVotingInstance.endProposalsRegistering({from:owner});
            await MyVotingInstance.startVotingSession({from:owner});
            
        });

            describe("Expect Checks", function() {

                it("Workflowstatus index test", async function() {
                    const _status = await MyVotingInstance.workflowStatus.call();
                    expect(_status).to.be.bignumber.equal(new BN(3));
                 });
            });

            describe("ExpectEvents", function() {
        
                it("WorkflowStatusChanges test", async function() {
                    const _status = await MyVotingInstance.endVotingSession({from:owner});
                    expectEvent(_status,"WorkflowStatusChange",((_status.VotingsessionStarted,_status.VotingSessionEnded)));
                });
            });

            describe("Owner and Voters revert functions because of wrong State", function() {

                it("addVoter function should revert if Workflowstatus is different than RegisteringVoters", async function() {
                    await expectRevert(MyVotingInstance.addVoter(AllowedVoter1,{from:owner}),"Voters registration is not open yet");
                });

                it("addVoter function should revert if Workflowstatus is different than RegisteringVoters", async function() {
                    await expectRevert.unspecified(MyVotingInstance.addVoter(AllowedVoter2,{from:AllowedVoter1}));
                });

                it("addProposal function should revert if WorkflowStatus is different than ProposalRegistrationStarted", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:owner}),"Proposals are not allowed yet");
                });

                it("addProposal function should revert if WorkflowStatus is different than ProposalRegistrationStarted", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:AllowedVoter1}),"Proposals are not allowed yet");
                });

                it("addProposal function should revert if WorkflowStatus is different than ProposalRegistrationStarted", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:owner}),"Proposals are not allowed yet");
                });

                it("addProposal function should revert if WorkflowStatus is different than ProposalRegistrationStarted", async function() {
                    await expectRevert.unspecified(MyVotingInstance.addProposal("Proposal1",{from:AllowedVoter1}));
                });
            });

            describe("OnlyOwner revert functions because of wrong State and voters's revert tests ", function() {

                it("startProposalsRegistering function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.startProposalsRegistering({from:owner}),"Registering proposals cant be started now");
                });

                it("startProposalsRegistering function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startProposalsRegistering({from:AllowedVoter1}));
                });

                it("endProposalsRegistering function should revert because of wrong Workflowstatus", async function() {
                    await expectRevert(MyVotingInstance.endProposalsRegistering({from:owner}),"Registering proposals havent started yet");
                });

                it("endProposalsRegistering function should revert because of wrong Workflowstatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endProposalsRegistering({from:AllowedVoter1}));
                });

                it("startVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.startVotingSession({from:owner}),"Registering proposals phase is not finished");
                });

                it("startVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startVotingSession({from:AllowedVoter1}));
                });
            });

            describe("Revert of all Smart Contract's functions for Non Authorized users in State 3 (2 differents unauthorized users)", function() {
            
                it("getVoter function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.getVoter(AllowedVoter1, {from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("getOneProposal function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.getOneProposal(0, {from:UnAuthorizedUser2}),"You're not a voter");
                });

                it("addVoter function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.addVoter(UnAuthorizedUser2, {from:UnAuthorizedUser1}));
                });

                it("addProposal function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("setVote function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.setVote(1,{from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("endProposalsRegistering function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startProposalsRegistering({from:UnAuthorizedUser2}));
                });

                it("endProposalsRegistering function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endProposalsRegistering({from:UnAuthorizedUser1}));
                });

                it("startVotingSession function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startVotingSession({from:UnAuthorizedUser2}));
                });

                it("endVotingSession function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endVotingSession({from:UnAuthorizedUser1}));
                });

                it("tallyVote function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.tallyVotes({from:UnAuthorizedUser2}));
                }); 
            });
    });

    describe("State 3-2 // Voting tests", function() {

         beforeEach( async function(){

            MyVotingInstance = await Voting.new({from: owner});
            await MyVotingInstance.addVoter(owner, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter1, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter2, {from:owner});
            await MyVotingInstance.startProposalsRegistering({from:owner});
            await MyVotingInstance.addProposal("Proposal1", {from:AllowedVoter2});
            await MyVotingInstance.addProposal("Proposal2", {from:owner});
            await MyVotingInstance.addProposal("TheProposal", {from:AllowedVoter2});
            await MyVotingInstance.addProposal("GoodProposal", {from:owner});
            await MyVotingInstance.addProposal("Proposal5", {from:owner});
            await MyVotingInstance.addProposal("Proposal6", {from:AllowedVoter2});
            await MyVotingInstance.addProposal("Proposal7", {from:AllowedVoter1});
            await MyVotingInstance.endProposalsRegistering({from:owner});
            await MyVotingInstance.startVotingSession({from:owner});

        });

            describe("Voting test 1 from owner (1 vote) + Event 'Voted'", function() {

                it("Voting test 1 // 1 vote for 1 proposal from owner", async function() {
                    await MyVotingInstance.setVote(4,{from:owner});
                    const data = await MyVotingInstance.getVoter(owner,{from:owner});
                    expect(data.isRegistered).to.be.equal(true);
                    expect(data.hasVoted).to.be.equal(true);
                    expect(data.votedProposalId).to.be.bignumber.equal(new BN(4));
                    const data2 = await MyVotingInstance.getOneProposal(4);
                    expect(data2.description).to.be.equal("GoodProposal");
                    expect(data2.voteCount).to.be.bignumber.equal(new BN(1));  
                });

                it("Event Voted 1", async function() {
                    const data3 = await MyVotingInstance.setVote(4,{from:owner});
                    expectEvent(data3,"Voted",({voter:owner},{proposalId:new BN(4)}));
                });
            });
            
            describe("Voting test 2 from voter (1 vote) + Event 'Voted'", function() {

                it("Voting test 2 // 1 vote for 1 proposal from EnableVoter 2", async function() {
                    await MyVotingInstance.setVote(7,{from:AllowedVoter1});
                    const data = await MyVotingInstance.getVoter(AllowedVoter1,{from:owner});
                    expect(data.isRegistered).to.be.equal(true);
                    expect(data.hasVoted).to.be.equal(true);
                    expect(data.votedProposalId).to.be.bignumber.equal(new BN(7));
                    const data2 = await MyVotingInstance.getOneProposal(7);
                    expect(data2.description).to.be.equal("Proposal7");
                    expect(data2.voteCount).to.be.bignumber.equal(new BN(1));    
                });

                it("Event Voted 2", async function() {
                    const data = await MyVotingInstance.setVote(7,{from:AllowedVoter1});
                    expectEvent(data,"Voted",({voter:AllowedVoter1},{proposalId:new BN(7)}));
                });
            });

            describe("Voting test 2 from voter (2 votes) + Event 'Voted'", function() {

                it("Voting test 3 voteCount // 2 votes for 1 proposal", async function() {
                    await MyVotingInstance.setVote(3,{from:AllowedVoter2});
                    await MyVotingInstance.setVote(3,{from:AllowedVoter1});
                    const data = await MyVotingInstance.getVoter(AllowedVoter2,{from:owner});
                    expect(data.isRegistered).to.be.equal(true);
                    expect(data.hasVoted).to.be.equal(true);
                    expect(data.votedProposalId).to.be.bignumber.equal(new BN(3));
                    const _data = await MyVotingInstance.getVoter(AllowedVoter1,{from:owner});
                    expect(_data.isRegistered).to.be.equal(true);
                    expect(_data.hasVoted).to.be.equal(true);
                    expect(_data.votedProposalId).to.be.bignumber.equal(new BN(3));
                    const data2 = await MyVotingInstance.getOneProposal(3);
                    expect(data2.description).to.be.equal("TheProposal");
                    expect(data2.voteCount).to.be.bignumber.equal(new BN(2));  
                });
            

                it("Event Voted 3", async function() {
                    const data = await MyVotingInstance.setVote(3,{from:AllowedVoter2});
                    expectEvent(data,"Voted",({voter:AllowedVoter2},{proposalId:new BN(3)}));
                });
            });

            describe("Revert tests for double vote and wrong proposal", function() {

                it("Should revert if voter has already voted", async function() {
                    await MyVotingInstance.setVote(2,{from:AllowedVoter2});
                    await expectRevert(MyVotingInstance.setVote(3,{from:AllowedVoter2}),"You have already voted");
                });

                it("Should revert if proposal doesn't exist", async function() {
                    await expectRevert(MyVotingInstance.setVote(11,{from:AllowedVoter2}),"Proposal not found");
                });
            });
    });

    describe("State 4 // VotingSessionEnded", function(){

        beforeEach( async function(){

            MyVotingInstance = await Voting.new({from: owner});
            await MyVotingInstance.addVoter(owner, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter1, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter2, {from:owner});
            await MyVotingInstance.startProposalsRegistering({from:owner});
            await MyVotingInstance.endProposalsRegistering({from:owner});
            await MyVotingInstance.startVotingSession({from:owner});
            await MyVotingInstance.endVotingSession({from:owner});
            
        });

            describe("Expect Checks", function() {

                it("Workflowstatus index test", async function() {
                    const _status = await MyVotingInstance.workflowStatus.call();
                    expect(_status).to.be.bignumber.equal(new BN(4));
                });
            });

            describe("ExpectEvents", function() {

                it("WorkflowStatusChanges test", async function() {
                    const _status = await MyVotingInstance.tallyVotes({from:owner});
                    expectEvent(_status,"WorkflowStatusChange",((_status.VotingSessionEnded,_status.VotesTallied)));
                });
            });

            describe("Owner and Voters revert functions because of wrong State", function() {

                it("addVoter function should revert if Workflowstatus is different than RegisteringVoters", async function() {
                    await expectRevert(MyVotingInstance.addVoter(AllowedVoter1,{from:owner}),"Voters registration is not open yet");
                });

                it("addVoter function should revert if Workflowstatus is different than RegisteringVoters", async function() {
                    await expectRevert.unspecified(MyVotingInstance.addVoter(AllowedVoter2,{from:AllowedVoter1}));
                });

                it("addProposal function should revert if WorkflowStatus is different than ProposalRegistrationStarted", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:owner}),"Proposals are not allowed yet");
                });

                it("addProposal function should revert if WorkflowStatus is different than ProposalRegistrationStarted", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:AllowedVoter1}),"Proposals are not allowed yet");
                });

                it("setVote function should revert if WorkflowStatus is different than VotingSessionStarted", async function() {
                    await expectRevert(MyVotingInstance.setVote(1,{from:owner}),"Voting session havent started yet");
                });

                it("setVote function should revert if WorkflowStatus is different than VotingSessionStarted", async function() {
                    await expectRevert(MyVotingInstance.setVote(1,{from:AllowedVoter1}),"Voting session havent started yet");
                });
            });

            describe("OnlyOwner revert functions because of wrong State and voters's revert tests ", function() {

                it("startProposalsRegistering function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.startProposalsRegistering({from:owner}),"Registering proposals cant be started now");
                });

                it("startProposalsRegistering function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startProposalsRegistering({from:AllowedVoter1}));
                });

                it("endProposalsRegistering function should revert because of wrong Workflowstatus", async function() {
                    await expectRevert(MyVotingInstance.endProposalsRegistering({from:owner}),"Registering proposals havent started yet");
                });

                it("endProposalsRegistering function should revert because of wrong Workflowstatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endProposalsRegistering({from:AllowedVoter1}));
                });

                it("startVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.startVotingSession({from:owner}),"Registering proposals phase is not finished");
                });

                it("startVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startVotingSession({from:AllowedVoter1}));
                });

                it("endVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.endVotingSession({from:owner}),"Voting session havent started yet");
                });

                it("startVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endVotingSession({from:AllowedVoter1}));
                });
            });
            
            describe("Revert of all Smart Contract's functions for Non Authorized users in State 4 (2 differents unauthorized users)", function() {
            
                it("getVoter function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.getVoter(AllowedVoter1, {from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("getOneProposal function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.getOneProposal(0, {from:UnAuthorizedUser2}),"You're not a voter");
                });

                it("addVoter function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.addVoter(UnAuthorizedUser2, {from:UnAuthorizedUser1}));
                });

                it("addProposal function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("setVote function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.setVote(1,{from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("endProposalsRegistering function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startProposalsRegistering({from:UnAuthorizedUser2}));
                });

                it("endProposalsRegistering function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endProposalsRegistering({from:UnAuthorizedUser1}));
                });

                it("startVotingSession function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startVotingSession({from:UnAuthorizedUser2}));
                });

                it("endVotingSession function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endVotingSession({from:UnAuthorizedUser1}));
                });

                it("tallyVote function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.tallyVotes({from:UnAuthorizedUser2}));
                }); 
            });
    });

    describe("State 5 // Votes Tallied", function(){

        beforeEach( async function(){

            MyVotingInstance = await Voting.new({from: owner});
            await MyVotingInstance.addVoter(owner, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter1, {from:owner});
            await MyVotingInstance.startProposalsRegistering({from:owner});
            await MyVotingInstance.endProposalsRegistering({from:owner});
            await MyVotingInstance.startVotingSession({from:owner});
            await MyVotingInstance.endVotingSession({from:owner});
            await MyVotingInstance.tallyVotes({from:owner});

        });

            describe("Expect Checks", function() {
        
                it("Workflowstatus index test", async function() {
                    const _status = await MyVotingInstance.workflowStatus.call();
                    expect(_status).to.be.bignumber.equal(new BN(5));
                });
            });
        
            describe("Owner and Voters revert functions because of wrong State", function() {

                it("addVoter function should revert if Workflowstatus is different than RegisteringVoters", async function() {
                    await expectRevert(MyVotingInstance.addVoter(AllowedVoter1,{from:owner}),"Voters registration is not open yet");
                });

                it("addVoter function should revert if Workflowstatus is different than RegisteringVoters", async function() {
                    await expectRevert.unspecified(MyVotingInstance.addVoter(AllowedVoter2,{from:AllowedVoter1}));
                });

                it("addProposal function should revert if WorkflowStatus is different than ProposalRegistrationStarted", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:owner}),"Proposals are not allowed yet");
                });

                it("addProposal function should revert if WorkflowStatus is different than ProposalRegistrationStarted", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:AllowedVoter1}),"Proposals are not allowed yet");
                });

                it("setVote function should revert if WorkflowStatus is different than VotingSessionStarted", async function() {
                    await expectRevert(MyVotingInstance.setVote(1,{from:owner}),"Voting session havent started yet");
                });

                it("setVote function should revert if WorkflowStatus is different than VotingSessionStarted", async function() {
                    await expectRevert(MyVotingInstance.setVote(1,{from:AllowedVoter1}),"Voting session havent started yet");
                });

                it("tallyVote function should revert if workflowStatus is different than  VotingSessionEnded", async function() {
                    await expectRevert(MyVotingInstance.tallyVotes({from:owner}),"Current status is not voting session ended");
                });

                it("tallyVote function should revert if workflowStatus is different than  VotingSessionEnded", async function() {
                    await expectRevert.unspecified(MyVotingInstance.tallyVotes({from:AllowedVoter1}));
                });
            });

            describe("OnlyOwner revert functions because of wrong State and voters's revert tests ", function() {

                it("startProposalsRegistering function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.startProposalsRegistering({from:owner}),"Registering proposals cant be started now");
                });

                it("startProposalsRegistering function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startProposalsRegistering({from:AllowedVoter1}));
                });

                it("endProposalsRegistering function should revert because of wrong Workflowstatus", async function() {
                    await expectRevert(MyVotingInstance.endProposalsRegistering({from:owner}),"Registering proposals havent started yet");
                });

                it("endProposalsRegistering function should revert because of wrong Workflowstatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endProposalsRegistering({from:AllowedVoter1}));
                });

                it("startVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.startVotingSession({from:owner}),"Registering proposals phase is not finished");
                });

                it("startVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startVotingSession({from:AllowedVoter1}));
                });

                it("endVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert(MyVotingInstance.endVotingSession({from:owner}),"Voting session havent started yet");
                });

                it("startVotingSession function should revert because of wrong WorkflowStatus", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endVotingSession({from:AllowedVoter1}));
                });
            });

            describe("Revert of all Smart Contract's functions for Non Authorized users in State 5 (2 differents unauthorized users)", function() {
            
                it("getVoter function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.getVoter(AllowedVoter1, {from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("getOneProposal function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.getOneProposal(0, {from:UnAuthorizedUser2}),"You're not a voter");
                });

                it("addVoter function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.addVoter(UnAuthorizedUser2, {from:UnAuthorizedUser1}));
                });

                it("addProposal function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.addProposal("Proposal1",{from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("setVote function should revert if user is not authorized", async function() {
                    await expectRevert(MyVotingInstance.setVote(1,{from:UnAuthorizedUser1}),"You're not a voter");
                });

                it("endProposalsRegistering function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startProposalsRegistering({from:UnAuthorizedUser2}));
                });

                it("endProposalsRegistering function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endProposalsRegistering({from:UnAuthorizedUser1}));
                });

                it("startVotingSession function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.startVotingSession({from:UnAuthorizedUser2}));
                });

                it("endVotingSession function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.endVotingSession({from:UnAuthorizedUser1}));
                });

                it("tallyVote function should revert if user is not authorized", async function() {
                    await expectRevert.unspecified(MyVotingInstance.tallyVotes({from:UnAuthorizedUser2}));
                });
            }); 
    });

    describe("State 5-2 // Winning test", function() {

        beforeEach( async function(){
    
            MyVotingInstance = await Voting.new({from: owner});
            await MyVotingInstance.addVoter(owner, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter1, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter2, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter4, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter5, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter6, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter7, {from:owner});
            await MyVotingInstance.addVoter(AllowedVoter8, {from:owner});
            await MyVotingInstance.startProposalsRegistering({from:owner});
            await MyVotingInstance.addProposal("WinningProposal2", {from:AllowedVoter7});
            await MyVotingInstance.addProposal("Proposal2", {from:owner});
            await MyVotingInstance.addProposal("WinningProposal1", {from:AllowedVoter4});
            await MyVotingInstance.addProposal("WinningProposal3", {from:AllowedVoter2});
            await MyVotingInstance.endProposalsRegistering({from:owner});
            await MyVotingInstance.startVotingSession({from:owner});
            
        });

            describe("Winning test 1 with 3 votes", function() {

                it("Winning test 1 // VoteCount // WiningProposal = WinningProposal1 (2 votes)", async function() {

                    await MyVotingInstance.setVote(1,{from:owner});
                    await MyVotingInstance.setVote(3,{from:AllowedVoter2});
                    await MyVotingInstance.setVote(3,{from:AllowedVoter1});
                    await MyVotingInstance.endVotingSession({from:owner});
                    await MyVotingInstance.tallyVotes({from:owner});

                    const winningProposal = await MyVotingInstance.getOneProposal(3);
                    expect(winningProposal.description).to.be.equal("WinningProposal1");
                    expect(winningProposal.voteCount).to.be.bignumber.equal(new BN(2)); 

                    const data = await MyVotingInstance.getOneProposal(1);
                    expect(data.description).to.be.equal("WinningProposal2");
                    expect(data.voteCount).to.be.bignumber.equal(new BN(1));

                    const data2 = await MyVotingInstance.getOneProposal(2);
                    expect(data2.description).to.be.equal("Proposal2");
                    expect(data2.voteCount).to.be.bignumber.equal(new BN(0)); 

                    const data3 = await MyVotingInstance.getOneProposal(4);
                    expect(data3.description).to.be.equal("WinningProposal3");
                    expect(data3.voteCount).to.be.bignumber.equal(new BN(0)); 

                }); 
            }); 

            describe("Winning test 2 with 6 votes", function() {

                it("Winning test 2 // VoteCount // WiningProposal = WinningProposal2 (3 votes)", async function() {

                    await MyVotingInstance.setVote(1,{from:owner});
                    await MyVotingInstance.setVote(3,{from:AllowedVoter2});
                    await MyVotingInstance.setVote(1,{from:AllowedVoter1});
                    await MyVotingInstance.setVote(1,{from:AllowedVoter4});
                    await MyVotingInstance.setVote(2,{from:AllowedVoter5});
                    await MyVotingInstance.setVote(3,{from:AllowedVoter6});
                    await MyVotingInstance.endVotingSession({from:owner});
                    await MyVotingInstance.tallyVotes({from:owner});

                    const winningProposal = await MyVotingInstance.getOneProposal(1);
                    expect(winningProposal.description).to.be.equal("WinningProposal2");
                    expect(winningProposal.voteCount).to.be.bignumber.equal(new BN(3)); 

                    const data = await MyVotingInstance.getOneProposal(2);
                    expect(data.description).to.be.equal("Proposal2");
                    expect(data.voteCount).to.be.bignumber.equal(new BN(1));

                    const data2 = await MyVotingInstance.getOneProposal(3);
                    expect(data2.description).to.be.equal("WinningProposal1");
                    expect(data2.voteCount).to.be.bignumber.equal(new BN(2)); 

                    const data3 = await MyVotingInstance.getOneProposal(4);
                    expect(data3.description).to.be.equal("WinningProposal3");
                    expect(data3.voteCount).to.be.bignumber.equal(new BN(0)); 
                });
            }); 
            
            describe("Winning test 3 with 8 votes", function() {

                it("Winning test 3 // VoteCount // WiningProposal = WinningProposal3 (4 votes)", async function() {
            
                    await MyVotingInstance.setVote(4,{from:owner});
                    await MyVotingInstance.setVote(4,{from:AllowedVoter2});
                    await MyVotingInstance.setVote(4,{from:AllowedVoter1});
                    await MyVotingInstance.setVote(2,{from:AllowedVoter4});
                    await MyVotingInstance.setVote(2,{from:AllowedVoter5});
                    await MyVotingInstance.setVote(4,{from:AllowedVoter6});
                    await MyVotingInstance.setVote(2,{from:AllowedVoter7});
                    await MyVotingInstance.setVote(3,{from:AllowedVoter8});
                    await MyVotingInstance.endVotingSession({from:owner});
                    await MyVotingInstance.tallyVotes({from:owner});

                    const winningProposal = await MyVotingInstance.getOneProposal(4);
                    expect(winningProposal.description).to.be.equal("WinningProposal3");
                    expect(winningProposal.voteCount).to.be.bignumber.equal(new BN(4)); 

                    const data = await MyVotingInstance.getOneProposal(2);
                    expect(data.description).to.be.equal("Proposal2");
                    expect(data.voteCount).to.be.bignumber.equal(new BN(3));

                    const data2 = await MyVotingInstance.getOneProposal(3);
                    expect(data2.description).to.be.equal("WinningProposal1");
                    expect(data2.voteCount).to.be.bignumber.equal(new BN(1)); 

                    const data3 = await MyVotingInstance.getOneProposal(1);
                    expect(data3.description).to.be.equal("WinningProposal2");
                    expect(data3.voteCount).to.be.bignumber.equal(new BN(0)); 
                }); 
            }); 
        });
    });
});
