import styles from "../styles/BettingComponent.module.css";
import React, { useEffect, useState } from "react";
import { ethers, utils } from 'ethers';
import { useAccount } from "wagmi";
import Link from 'next/link';
import Footer from "./Footer";
import GetContract from "./Contract";

const BettingComponent = () => {
	const { address, isConnected } = useAccount();

	const [dataFetched, updateFetched] = useState(false);
	const [eventInfo, setEventInfo] = useState<any[]>([]);
	const [openBetWindow, setOpenBetWindow] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isWinner, setIsWinner] = useState(false);
	const [isError, setError] = useState(false);
	const [winAmount, setWinAmount] = useState("");
	const [betType, setBetType] = useState("");
	const [num, setNum] = useState(1);

	const [firstLoadDone, setfirstLoad] = useState(false);

	const [isUserConnected, setIsUserConnected] = useState(false);

	useEffect(()=>{
		getData();
	}, [dataFetched]);

	useEffect(() => {
		try {
		  setIsUserConnected(isConnected);
		} catch(e) {
		  console.log("Not connected");
		}
	  }, [isConnected]);

	const retrievePastEvent = async() => {
		const contract = GetContract();
		const filterFrom = contract.filters.GameResult(null, null);
		const event = await contract.queryFilter(filterFrom);
		setEventInfo([]);
		event.forEach((i) => {
			setEventInfo((eventInfo) => [...eventInfo, i]);
		});
	}

	const listenToEvent = () => {
		const contract = GetContract();
		contract.on("GameResult", ()=>{
			retrievePastEvent();
		});
	}

	const getData = async() => {
		setfirstLoad(true);
		if(!isConnected) return;

		try {
			await retrievePastEvent();
			listenToEvent();

			updateFetched(true);
			
		} catch (e) {
			console.log("Not connected");
		}
	}

	const play = async(isHead:boolean) => {
		if(!isConnected) return;

		try {
			const contract = GetContract();
			const value = utils.parseEther((num * 0.01).toString());
			console.log("contract",contract,value)
			setOpenBetWindow(true);
			setLoading(true);
			setBetType(isHead ? "Head" : "Tail");
			console.log("tranction -before")
			const transaction = await contract.play(isHead,{ value: value.toString(),gasLimit:1000000});
			console.log('transaction',transaction)
			const tx = await transaction.wait();
			console.log("tx",tx)
			const requestID = tx.events[1].args.requestId.toString();
			console.log("requestID",requestID)

			await contract.once("GameResult", async()=>{
				console.log("Enter in game Result")
				const filterFrom = contract.filters.GameResult(address, requestID);
				const event = await contract.queryFilter(filterFrom) as any;

				setIsWinner(event[0].args.isWinner);
				setWinAmount(utils.formatEther(ethers.BigNumber.from(event[0].args.amountWon)));
	
				setLoading(false);
			});


		} catch (e) {
			setBetType("");
			setLoading(false);
			setIsWinner(false);
			setWinAmount("");
			setError(true);
		}
	}

	
	// const play = async (isHead: boolean) => {
	// 	if (!isConnected) return;
	  
	// 	try {
	// 	  const contract = GetContract();
	// 	  const value = utils.parseEther((num * 0.01).toString());
	// 	  console.log("Contract instance:", contract, "Value:", value);
	  
	// 	  setOpenBetWindow(true);
	// 	  setLoading(true);
	// 	  setBetType(isHead ? "Head" : "Tail");
	  
	// 	  console.log("Transaction - before");
	// 	  let head  = !!isHead ? 1 : 0
	// 	  const transaction = await contract.play(head, {
	// 		value: value.toString(),
	// 		gasLimit: 1000000,
	// 	  });
	  
	// 	  console.log("Transaction submitted:", transaction);
	  
	// 	  const tx = await transaction.wait(); // Wait for the transaction confirmation
	// 	  console.log("Transaction receipt:", tx);
	  
	// 	  if (tx.status === 0) {
	// 		throw new Error("Transaction failed on-chain");
	// 	  }
	  
	// 	  const requestID = tx.events?.[1]?.args?.requestId?.toString();
	// 	  if (!requestID) {
	// 		throw new Error("Request ID not found in transaction receipt");
	// 	  }
	  
	// 	  console.log("Request ID:", requestID);
	  
	// 	  const filter = contract.filters.GameResult(address, requestID);
	  
	// 	  contract.once(filter, async (from, reqId, isWinner, amountWon) => {
	// 		console.log("GameResult event triggered");
	// 		setIsWinner(isWinner);
	// 		setWinAmount(utils.formatEther(amountWon));
	// 		setLoading(false);
	// 	  });
	// 	} catch (error: any) {
	// 	  console.error("Error occurred:", error);
	  
	// 	  // Show detailed error information
	// 	  if (error.code === "CALL_EXCEPTION") {
	// 		console.error("Transaction failed: CALL_EXCEPTION");
	// 	  }
	  
	// 	  setBetType("");
	// 	  setLoading(false);
	// 	  setIsWinner(false);
	// 	  setWinAmount("");
	// 	  setError(true);
	// 	}
	//   };
	  
	  
	const closePopUpWindow = () => {
		setOpenBetWindow(false);
		setIsWinner(false);
		setWinAmount("");
		setBetType("");
		setError(false);
	}

	const Tx = ({value}:any) => {
		return <tr className={`${value.args.player == address ? "text-green-400" : "text-orange-400"}`}>
			<td><Link href={`https://sepolia.etherscan.io/tx/${value.transactionHash}`} target="_blank"><p>#{value.args.gameId.toString()}</p></Link></td>
			<td><Link href={`https://sepolia.etherscan.io/address/${value.args.player}`} target="_blank">
				<p className="block md:hidden">
					{value.args.player.slice(0,5)}...{value.args.player.slice(-5)}
				</p>

				<p className="hidden md:block">
					{value.args.player}
				</p>
				</Link>
			</td>
			<td><p>{value.args.isHead? "Head": "Tail"}</p></td>
			<td>{value.args.isWinner ? 
			<p className="text-green-400">+ {utils.formatEther(ethers.BigNumber.from(value.args.amountWon))} ETH {value.args.bonus && "🔥"}</p>
			:<p className="text-red-400">- {utils.formatEther(ethers.BigNumber.from(value.args.betAmount))} ETH</p>}</td>
			
		</tr>
	}

	const incNum = () => {
		if (num < 5) {
		  setNum(Number(num) + 1);
		}
	  };
	const decNum = () => {
		if (num > 1) {
			setNum(num - 1);
		}
	};

	return (
		firstLoadDone ? isUserConnected?
		<div className={styles.container}>
			<header className={styles.header_container} >
				<h1>- Head Or Tail -</h1>

				<div className="flex flex-row gap-4 justify-between items-center">
					<button
						className="flex items-center justify-center h-8 w-8 rounded-full outline outline-1"
						onClick={decNum}
					>
						-
					</button>

					<div className="bg-slate-700 rounded-2xl w-48 h-10 font-minecraft items-center justify-center flex">
					{`x${num} ( ${num * 0.01} ETH )`}
					</div>

					<button
						className="flex items-center justify-center h-8 w-8 rounded-full outline outline-1"
						onClick={incNum}
					>
						+
					</button>
					<div>
					</div>
				</div>

				{
					openBetWindow? <div className="p-8">
						{!isError && <p>You bet on {betType}</p>}

						{loading ? 
							<button disabled={loading} className="button bg-gray-700 px-8" id="list-button">
								<p>Loading TX...</p>
							</button>
							: 
							<>

							{isError? <p className="text-red-500">Transaction Error, Please Try Again</p> 
							: isWinner ? 
							<p className="text-green-500">You Won {winAmount} ETH</p>
							:<p className="text-yellow-500">Too Bad</p>
							}

							<button onClick={closePopUpWindow} className="button" id="list-button">
								<p>Try Again</p>
							</button>
							</>
						}
						</div>
					:<div className="flex justify-center items-center gap-5">
							<button onClick={()=>play(true)} className="play bg-blue-600" id="list-button" >
								<p>Head</p>
							</button>

							<button onClick={()=>play(false)} className="play bg-blue-600" id="list-button">
								<p>Tail</p>
							</button>
					</div>
				}
			</header>
			
			<table className="table-auto border-separate border-spacing-x-4 border-spacing-y-1">
                <thead>
					<tr>
						<th>Round</th>
						<th>Player</th>
						<th>Result</th>
						<th>Amount</th>
					</tr>
                </thead>
                <tbody>
                {
					eventInfo?.slice(-10).reverse().map((value) => (
                        <React.Fragment key={`${value.blockNumber}`}>
                        <Tx value={value} />
                        </React.Fragment>
                    ))
                }
                </tbody>
            </table>

			<Footer/>
		</div> : 
		<div className={styles.container}>
			<header className={styles.header_container} >
				<h1>- Head Or Tail -</h1>
				<h1>Connect Wallet First ↗</h1>
		</header>
		</div> : <></>
	);
}

export default BettingComponent;
